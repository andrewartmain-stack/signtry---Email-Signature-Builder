'use server';

import { stripe } from './stripe';

export const subscribeAction = async ({
  userId,
  priceId,
}: {
  userId: string;
  priceId: string;
}) => {
  const { url } = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        // price: process.env.STRIPE_PRICE_ID,
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      priceId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
  });

  return url;
};
