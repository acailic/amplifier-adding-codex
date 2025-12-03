import { handleStripeWebhook } from '../../../../api/webhooks/stripe';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return handleStripeWebhook(request);
}