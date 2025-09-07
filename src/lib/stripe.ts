import { Stripe } from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export const PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly',
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  team: process.env.STRIPE_PRICE_TEAM || 'price_team_monthly',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly',
} as const;

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['Basic job search', 'Limited insights', 'Community support']
  },
  pro: {
    name: 'Pro',
    price: 29,
    features: ['Unlimited job search', 'Full market insights', 'Priority support', 'Custom reports']
  },
  team: {
    name: 'Team',
    price: 99,
    features: ['Everything in Pro', 'Team collaboration', 'Advanced analytics', 'API access']
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    features: ['Everything in Team', 'Custom integrations', 'Dedicated support', 'White-label options']
  }
} as const;
