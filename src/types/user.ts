export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  onboarded: boolean;
}

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  razorpayCustomerId: string | null;
  razorpaySubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface UserWithSubscription extends User {
  subscription: Subscription;
}
