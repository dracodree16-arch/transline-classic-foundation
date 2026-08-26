import { supabase } from "@/integrations/supabase/client";

export type MpesaResult = {
  success: boolean;
  message: string;
  checkoutRequestId?: string;
};

/**
 * Trigger an M-Pesa STK Push for a booking by invoking the `mpesa-stk-push`
 * Daraja edge function. The amount is resolved server-side from the booking
 * record — only the booking id and the customer phone are sent from the client.
 */
export async function initiateMpesaPayment(bookingId: string, phone: string): Promise<MpesaResult> {
  const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
    body: { bookingId, phone },
  });

  if (error) {
    // Supabase wraps non-2xx responses; try to surface the function's message.
    let message = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) message = body.error;
      }
    } catch {
      // ignore parse failures, fall back to error.message
    }
    throw new Error(message);
  }

  return data as MpesaResult;
}
