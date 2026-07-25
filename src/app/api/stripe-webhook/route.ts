import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function setSubscriptionActive(userId: string, sub: Stripe.Subscription) {
  const periodEnd = sub.items.data[0]?.current_period_end ?? null;
  await supabase.from('settings').upsert(
    {
      user_id: userId,
      subscription_status: 'active',
      subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      stripe_subscription_id: sub.id,
    },
    { onConflict: 'user_id' }
  );
}

async function setSubscriptionInactive(userId: string, subId: string) {
  await supabase.from('settings').upsert(
    { user_id: userId, subscription_status: 'inactive', stripe_subscription_id: subId },
    { onConflict: 'user_id' }
  );
}

async function findUserBySubscriptionId(subId: string): Promise<string | null> {
  const { data } = await supabase
    .from('settings')
    .select('user_id')
    .eq('stripe_subscription_id', subId)
    .limit(1)
    .single();
  return data?.user_id ?? null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (!userId || session.mode !== 'subscription' || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await setSubscriptionActive(userId, sub);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await findUserBySubscriptionId(sub.id);
        if (!userId) break;

        const isActive = ['active', 'trialing'].includes(sub.status);
        if (isActive) {
          await setSubscriptionActive(userId, sub);
        } else {
          await setSubscriptionInactive(userId, sub.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await findUserBySubscriptionId(sub.id);
        if (!userId) break;
        await setSubscriptionInactive(userId, sub.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.parent?.subscription_details?.subscription;
        if (!subId) break;
        const subscriptionId = typeof subId === 'string' ? subId : subId.id;
        const userId = await findUserBySubscriptionId(subscriptionId);
        if (!userId) break;
        await setSubscriptionInactive(userId, subscriptionId);
        break;
      }
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
