import { fromEnv } from "./env.ts";

const MOLLIE_PAYMENTS_ENDPOINT = `https://api.mollie.com/v2/payments`;

export type MollieStatus = 'open' | 'canceled' | 'pending' | 'authorized' | 'expired' | 'failed' | 'paid';

export interface MolliePaymentResponse {
  id: string;
  amount: { value: string; currency: string; };
  expiresAt: string;
  status?: MollieStatus;
  _links: {
    checkout: {
      href: string;
    };
  }
}

export const createMolliePayment = async (reservationId: string, amount: number) => {
  const token = await fromEnv('MOLLIE_TOKEN');
  const serverHost = await fromEnv('HOST', 'http://localhost:8080', true);
  const clientHost = await fromEnv('CLIENT', 'http://localhost:3000', true);
  const mollieDescription = await fromEnv('MOLLIE_DESCRIPTION', "payment", true);

  const response = await fetch(MOLLIE_PAYMENTS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      amount: { "currency": "EUR", "value": `${(amount / 100).toFixed(2)}` },
      description: mollieDescription,
      redirectUrl: `${clientHost}/baedankt/`,
      method: ['ideal'],
      webhookUrl: `${serverHost}/payments/${reservationId}/webhook`
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json() as MolliePaymentResponse;
};

export const fetchMolliePayment = async (paymentId: string) => {
  const token = await fromEnv('MOLLIE_TOKEN');
  const response = await fetch(`${MOLLIE_PAYMENTS_ENDPOINT}/${paymentId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json() as MolliePaymentResponse;
};
