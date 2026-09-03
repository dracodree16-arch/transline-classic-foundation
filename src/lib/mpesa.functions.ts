import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminOrClerk, requireBranchAccess } from "@/lib/authz.middleware";

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (/^254(7|1)\d{8}$/.test(digits)) return digits;
  if (/^0(7|1)\d{8}$/.test(digits)) return "254" + digits.slice(1);
  if (/^(7|1)\d{8}$/.test(digits)) return "254" + digits;
  return null;
}

function darajaTimestamp(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date())
    .replace(/[^0-9]/g, "");
}

/**
 * Trigger a Daraja STK push for a booking. The amount and branch come from the
 * database; the browser only supplies the booking id and the payer phone.
 */
export const stkPushForBooking = createServerFn({ method: "POST" })
  .middleware([requireAdminOrClerk])
  .inputValidator((input: unknown) =>
    z.object({ bookingId: z.string().uuid(), phone: z.string().min(9) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const phone = normalisePhone(data.phone);
    if (!phone) throw new Error("Invalid Kenyan phone number");

    const consumerKey = process.env["MPESA_CONSUMER_KEY"];
    const consumerSecret = process.env["MPESA_CONSUMER_SECRET"];
    const shortcode = process.env["MPESA_SHORTCODE"];
    const passkey = process.env["MPESA_PASSKEY"];
    const env = process.env["MPESA_ENV"] ?? "sandbox";
    const callbackUrl =
      process.env["MPESA_CALLBACK_URL"] ??
      `${process.env["SUPABASE_URL"]}/functions/v1/mpesa-callback`;

    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      throw new Error("M-Pesa credentials are not configured on the server.");
    }

    const { data: booking, error } = await context.supabase
      .from("bookings")
      .select("id, booking_ref, fare_amount, payment_status, branch_id")
      .eq("id", data.bookingId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found");
    // Clerks may only collect payment for bookings in their own branch.
    requireBranchAccess(context.profile, booking.branch_id);
    if (booking.payment_status === "paid") throw new Error("Booking is already paid.");

    const base =
      env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
    const amount = Math.max(1, Math.round(Number(booking.fare_amount)));

    const authRes = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64"),
      },
    });
    const authBody = (await authRes.json().catch(() => ({}))) as {
      access_token?: string;
      error_description?: string;
    };
    if (!authRes.ok || !authBody.access_token) {
      console.error("[mpesa] Daraja OAuth failed", authRes.status);
      throw new Error(authBody.error_description ?? "Failed to authenticate with M-Pesa");
    }

    const timestamp = darajaTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const stkRes = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authBody.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: booking.booking_ref ?? booking.id,
        TransactionDesc: `Ticket ${booking.booking_ref ?? ""}`.trim(),
      }),
    });

    const stk = (await stkRes.json().catch(() => ({}))) as {
      ResponseCode?: string;
      CheckoutRequestID?: string;
      errorMessage?: string;
      ResponseDescription?: string;
    };

    if (!stkRes.ok || stk.ResponseCode !== "0" || !stk.CheckoutRequestID) {
      throw new Error(stk.errorMessage ?? stk.ResponseDescription ?? "STK push failed");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("payments").insert({
      reference_type: "booking",
      reference_id: booking.id,
      amount,
      phone,
      status: "pending",
      mpesa_checkout_request_id: stk.CheckoutRequestID,
    });

    return {
      success: true,
      message: "STK push sent. Ask the customer to enter their M-Pesa PIN.",
      checkoutRequestId: stk.CheckoutRequestID,
    };
  });
