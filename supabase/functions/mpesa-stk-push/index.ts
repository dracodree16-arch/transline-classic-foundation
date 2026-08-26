// Daraja (Safaricom M-Pesa) STK Push edge function.
//
// Required secrets (set with `supabase secrets set ...`):
//   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE,
//   MPESA_PASSKEY, MPESA_CALLBACK_URL
//   MPESA_ENV = "sandbox" | "production" (defaults to "sandbox")
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Normalise a Kenyan phone number to the 2547XXXXXXXX / 2541XXXXXXXX format Daraja expects.
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (/^254(7|1)\d{8}$/.test(digits)) return digits;
  if (/^0(7|1)\d{8}$/.test(digits)) return "254" + digits.slice(1);
  if (/^(7|1)\d{8}$/.test(digits)) return "254" + digits;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { bookingId, phone } = await req.json();
    if (!bookingId || !phone) return json({ error: "bookingId and phone are required" }, 400);

    const normalised = normalisePhone(String(phone));
    if (!normalised) return json({ error: "Invalid phone number" }, 400);

    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const shortcode = Deno.env.get("MPESA_SHORTCODE");
    const passkey = Deno.env.get("MPESA_PASSKEY");
    const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL");
    const env = Deno.env.get("MPESA_ENV") ?? "sandbox";

    if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
      return json({ error: "M-Pesa credentials are not configured on the server." }, 500);
    }

    const base = env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Look up the booking to get the authoritative amount and reference.
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, booking_ref, fare_amount, payment_status")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) return json({ error: "Failed to load booking: " + bookingError.message }, 500);
    if (!booking) return json({ error: "Booking not found" }, 404);
    if (booking.payment_status === "paid") return json({ error: "Booking is already paid." }, 400);

    // Amount is always taken from the server-side booking record, never the client.
    const amount = Math.max(1, Math.round(Number(booking.fare_amount)));

    // 1. OAuth token.
    const authRes = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: "Basic " + btoa(`${consumerKey}:${consumerSecret}`) },
    });
    if (!authRes.ok) return json({ error: "Failed to authenticate with Daraja" }, 502);
    const { access_token } = await authRes.json();

    // 2. STK push.
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    const stkRes = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: normalised,
        PartyB: shortcode,
        PhoneNumber: normalised,
        CallBackURL: callbackUrl,
        AccountReference: booking.booking_ref ?? booking.id,
        TransactionDesc: `Ticket ${booking.booking_ref ?? ""}`.trim(),
      }),
    });

    const stk = await stkRes.json();

    if (stk.ResponseCode !== "0") {
      return json({ error: stk.errorMessage ?? stk.ResponseDescription ?? "STK push failed", detail: stk }, 502);
    }

    // 3. Record a pending payment we can reconcile in the callback.
    await supabase.from("payments").insert({
      reference_type: "booking",
      reference_id: booking.id,
      amount,
      phone: normalised,
      status: "pending",
      mpesa_checkout_request_id: stk.CheckoutRequestID,
    });

    return json({
      success: true,
      message: "STK push sent. Ask the customer to enter their M-Pesa PIN.",
      checkoutRequestId: stk.CheckoutRequestID,
    });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
