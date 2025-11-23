
import { db } from '../firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { UserSubscription, PlanInterval } from '../types';

export const PLANS = {
  MONTHLY: {
    id: 'pro_monthly',
    name: 'ZenFlow Pro Monthly',
    price: 299,
    currency: 'INR',
    symbol: '₹',
    interval: 'month' as PlanInterval,
  },
  YEARLY: {
    id: 'pro_yearly',
    name: 'ZenFlow Pro Yearly',
    price: 2499,
    currency: 'INR',
    symbol: '₹',
    interval: 'year' as PlanInterval,
    savings: '30%'
  }
};

export const recordPayment = async (userId: string, amount: number, method: 'upi' | 'card', planId: string) => {
  try {
    await addDoc(collection(db, 'payments'), {
      userId,
      amount,
      currency: 'INR',
      status: 'success',
      method,
      planId,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Failed to log payment", e);
  }
};

export const upgradeSubscription = async (userId: string, planId: string): Promise<boolean> => {
  if (!userId) return false;

  // Calculate expiry date (1 month or 1 year from now)
  const now = new Date();
  const expiryDate = new Date();
  
  if (planId === 'pro_monthly') {
    expiryDate.setMonth(now.getMonth() + 1);
  } else {
    expiryDate.setFullYear(now.getFullYear() + 1);
  }

  const newSubscription: UserSubscription = {
    status: 'active',
    planId: planId,
    interval: planId === 'pro_monthly' ? 'month' : 'year',
    currentPeriodEnd: Timestamp.fromDate(expiryDate)
  };

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      subscription: newSubscription
    });
    return true;
  } catch (error) {
    console.error("Subscription upgrade failed:", error);
    return false;
  }
};

export const cancelSubscription = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'subscription.status': 'canceled'
    });
    return true;
  } catch (error) {
    console.error("Cancellation failed:", error);
    return false;
  }
};

export const checkPremiumStatus = (sub?: UserSubscription): boolean => {
  if (!sub) return false;
  
  const now = new Date();
  
  // Check status
  if (sub.status !== 'active' && sub.status !== 'canceled') return false;
  
  // Check expiry
  if (sub.currentPeriodEnd) {
    const expiry = sub.currentPeriodEnd.toDate();
    if (expiry < now) return false; // Expired
  }
  
  return true;
};
