import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Safaricom Daraja (M-Pesa) STK Push integration.
 *
 * All logic runs server-side inside TanStack Start server functions so the
 * Daraja consumer key/secret/passkey are never shipped to the browser.
 *
 * Required project environment variables (Settings → Vars):
 *   MPESA_CONSUMER_KEY      Daraja app consumer key
 *   MPESA_CONSUMER_SECRET   Daraja app consumer secret
 *   MPESA_SHORTCODE         Business short code / paybill (sandbox: 174379)
 *   MPESA_PASSKEY           Lipa Na M-Pesa Online passkey
 *   MPESA_ENV               "sandbox" (default) or "production"
 *   MPESA_CALLBACK_URL      Optional public https URL; payment is confirmed by
 *                           polling the STK Query API when this is absent.
 */

function mpesaConfig() {
  const consumerKey = process.env["MPESA_CONSUMER_KEY"];
  const consumerSecret = process.env["MPESA_CONSUMER_SECRET"];
  const shortcode = process.env["MPESA_SHORTCODE"];
  const passkey = process.env["MPESA_PASSKEY"];
  const env = (process.env["MPESA_ENV"] ?? "sandbox").toLowerCase();
  const callbackUrl =
    process.env["MPESA_CALLBACK_URL"] ?? "https://example.com/mpesa/callback";

  const missing = [
    ...(!consumerKey ? ["MPESA_CONSUMER_KEY"] : []),
    ...(!consumerSecret ? ["MPESA_CONSUMER_SECRET"] : []),
    ...(!shortcode ? ["MPESA_SHORTCODE"] : []),
    ...(!passkey ? ["MPESA_PASSKEY"] : []),
  ];
  if (missing.length) {
    throw new Error(
      `M-Pesa is not configured. Add these project environment variables: ${missing.join(", ")}.`,
    );
  }

  const baseUrl =
    env === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  return {
    consumerKey: consumerKey!,
    consumerSecret: consumerSecret!,
    shortcode: shortcode!,
    passkey: passkey!,
    callbackUrl,
    baseUrl,
  };
}

/** Daraja timestamp in yyyyMMddHHmmss (East Africa Time). */
function darajaTimestamp(): string {
  const eat = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${eat.getUTCFullYear()}` +
    `${p(eat.getUTCMonth() + 1)}` +
    `${p(eat.getUTCDate())}` +
    `${p(eat.getUTCHours())}` +
    `${p(eat.getUTCMinutes())}` +
    `${p(eat.getUTCSeconds())}`
  );
}

/** Normalise a Kenyan phone number to the 2547XXXXXXXX / 2541XXXXXXXX MSISDN form. */
function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  return digits;
}

async function getAccessToken(cfg: ReturnType<typeof mpesaConfig>): Promise<string> {
  const auth = Buffer.from(`${cfg.consumerKey}:${cfg.consumerSecret}`).toString("base64");
  const res = await fetch(
    `${cfg.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`M-Pesa auth failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("M-Pesa auth returned no access token");
  return json.access_token;
}

export const initiateMpesaPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        booking_id: z.string().uuid(),
        phone: z.string().min(9).max(15),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // Load the booking with the caller's RLS-scoped client so a clerk can only
    // pay for bookings they are allowed to see. The amount is taken from the
    // database, never from the client, to prevent tampering.
    const { data: booking, error } = await context.supabase
      .from("bookings")
      .select("id, booking_ref, fare_amount, payment_status")
      .eq("id", data.booking_id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found or not accessible.");
    if (booking.payment_status === "paid") {
      throw new Error("This booking is already paid.");
    }

    const amount = Math.max(1, Math.round(Number(booking.fare_amount)));
    const phone = normalizePhone(data.phone);
    if (!/^254(7|1)\d{8}$/.test(phone)) {
      throw new Error("Enter a valid Safaricom phone number (e.g. 0712345678).");
    }

    const cfg = mpesaConfig();
    const token = await getAccessToken(cfg);
    const timestamp = darajaTimestamp();
    const password = Buffer.from(`${cfg.shortcode}${cfg.passkey}${timestamp}`).toString(
      "base64",
    );

    const stkRes = await fetch(`${cfg.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: cfg.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: cfg.shortcode,
        PhoneNumber: phone,
        CallBackURL: cfg.callbackUrl,
        AccountReference: (booking.booking_ref ?? booking.id).slice(0, 12),
        TransactionDesc: `Bus ticket ${booking.booking_ref ?? ""}`.trim().slice(0, 13),
      }),
    });

    const stk = (await stkRes.json()) as {
      CheckoutRequestID?: string;
      MerchantRequestID?: string;
      ResponseCode?: string;
      ResponseDescription?: string;
      errorMessage?: string;
    };

    if (!stkRes.ok || stk.ResponseCode !== "0" || !stk.CheckoutRequestID) {
      throw new Error(
        stk.errorMessage ??
          stk.ResponseDescription ??
          "M-Pesa STK push was rejected. Check the phone number and try again.",
      );
    }

    // Record the pending payment with the service-role client (server only).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("payments").insert({
      reference_type: "booking",
      reference_id: booking.id,
      phone,
      amount,
      status: "pending",
      mpesa_checkout_request_id: stk.CheckoutRequestID,
    });

    return {
      checkoutRequestId: stk.CheckoutRequestID,
      message: "STK push sent. Ask the passenger to enter their M-Pesa PIN.",
    };
  });

export const queryMpesaPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        booking_id: z.string().uuid(),
        checkoutRequestId: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // Confirm the caller can see this booking before revealing payment state.
    const { data: booking, error } = await context.supabase
      .from("bookings")
      .select("id")
      .eq("id", data.booking_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found or not accessible.");

    const cfg = mpesaConfig();
    const token = await getAccessToken(cfg);
    const timestamp = darajaTimestamp();
    const password = Buffer.from(`${cfg.shortcode}${cfg.passkey}${timestamp}`).toString(
      "base64",
    );

    const res = await fetch(`${cfg.baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: cfg.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: data.checkoutRequestId,
      }),
    });

    const q = (await res.json()) as {
      ResultCode?: string;
      ResultDesc?: string;
      errorCode?: string;
      errorMessage?: string;
    };

    // While the customer has not acted yet, Daraja returns a processing error
    // (500.001.1001). Treat that as "still pending" rather than a failure.
    if (q.errorCode || q.ResultCode === undefined) {
      return { status: "pending" as const, description: q.errorMessage ?? "Awaiting PIN entry…" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (q.ResultCode === "0") {
      await supabaseAdmin
        .from("payments")
        .update({ status: "success", raw_callback: q as never })
        .eq("mpesa_checkout_request_id", data.checkoutRequestId);
      await supabaseAdmin
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", data.booking_id);
      return { status: "success" as const, description: q.ResultDesc ?? "Payment received." };
    }

    // Any other final result code means the transaction failed or was cancelled.
    await supabaseAdmin
      .from("payments")
      .update({ status: "failed", raw_callback: q as never })
      .eq("mpesa_checkout_request_id", data.checkoutRequestId);
    return { status: "failed" as const, description: q.ResultDesc ?? "Payment failed." };
  });
