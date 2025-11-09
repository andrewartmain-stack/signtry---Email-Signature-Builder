import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { stripe } from '../../utils/stripe/stripe';
import { supabaseAdmin } from '../../utils/supabase/admin';

const STRIPE_SIGNING_SECRET = process.env.STRIPE_SIGNING_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature');

    if (!signature || !STRIPE_SIGNING_SECRET) {
      return NextResponse.json(
        { error: 'Missing Stripe signature or signing secret' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_SIGNING_SECRET
    );

    const eventType = event.type;
    const data = event.data;

    console.log('🔔 Stripe event received:', event.type);

    switch (eventType) {
      case 'checkout.session.completed': {
        console.log('✅ Payment successful, revalidating all paths...');

        revalidatePath('/', 'layout');

        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const priceId = session.metadata?.priceId;

        console.log('Updating Supabase for userId:', userId);

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            is_subscribed: true,
            price_id: priceId,
          })
          .eq('id', userId);

        if (error) {
          console.error(error.message);
          return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json(
          { message: 'Payment success' },
          { status: 200 }
        );
      }

      case 'customer.subscription.deleted': {
        const subscription = data.object as any;

        // userId можно хранить в metadata подписки
        const userId = subscription.metadata?.userId;

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            is_subscribed: false,
            price_id: null,
          })
          .eq('id', userId);

        if (error) {
          console.error(error.message);
          return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json(
          { message: 'Subscription was deleted' },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('❌ Stripe webhook error:', err);
    return NextResponse.json({ message: 'Webhook error' }, { status: 400 });
  }
}
