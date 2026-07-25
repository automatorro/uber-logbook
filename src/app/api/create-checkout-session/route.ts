import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail } = await req.json();

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Missing userId or userEmail' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: settingsRow } = await supabase
      .from('settings')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId: string | undefined = settingsRow?.stripe_customer_id ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: userEmail });
      customerId = customer.id;
      await supabase
        .from('settings')
        .upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: 'user_id' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${appUrl}/?subscription=success`,
      cancel_url: `${appUrl}/?subscription=canceled`,
      client_reference_id: userId,
      allow_promotion_codes: true,
      tax_id_collection: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
