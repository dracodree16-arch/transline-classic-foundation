import { stkPushForBooking } from "@/lib/mpesa.functions";

export type MpesaResult = {
  success: boolean;
  message: string;
  checkoutRequestId?: string;
};

/**
 * Trigger an M-Pesa STK Push for a booking. The amount, branch and
 * authorization are resolved server-side — only the booking id and the
 * customer phone are sent from the client.
 */
export async function initiateMpesaPayment(bookingId: string, phone: string): Promise<MpesaResult> {
  return (await stkPushForBooking({ data: { bookingId, phone } })) as MpesaResult;
}
