// Daraja STK Push callback handler.
// Set MPESA_CALLBACK_URL (used by mpesa-stk-push) to this function's public URL.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const stk = payload?.Body?.stkCallback;

    // Always ack Daraja, even on unexpected shapes, so it stops retrying.
    if (!stk?.CheckoutRequestID) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const checkoutId = stk.CheckoutRequestID;
    const success = stk.ResultCode === 0;

    // Extract the receipt number from the callback metadata (present on success).
    let receipt: string | null = null;
    const items = stk.CallbackMetadata?.Item ?? [];
    for (const item of items) {
      if (item.Name === "MpesaReceiptNumber") receipt = String(item.Value);
    }

    const { data: payment } = await supabase
      .from("payments")
      .update({
        status: success ? "success" : "failed",
        mpesa_receipt_number: receipt,
        raw_callback: payload,
      })
      .eq("mpesa_checkout_request_id", checkoutId)
      .select("reference_id, reference_type")
      .maybeSingle();

    // On success, mark the linked booking as paid.
    if (success && payment?.reference_type === "booking" && payment.reference_id) {
      await supabase
        .from("bookings")
        .update({ payment_status: "paid", mpesa_receipt: receipt })
        .eq("id", payment.reference_id);
    }

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (_err) {
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
});
