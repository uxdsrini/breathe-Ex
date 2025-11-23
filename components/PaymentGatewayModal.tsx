
import React, { useState, useEffect } from 'react';
import { PLANS, recordPayment, upgradeSubscription } from '../services/subscriptionService';
import { useAuth } from '../contexts/AuthContext';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string; // 'pro_monthly' | 'pro_yearly'
  onSuccess: () => void;
}

const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({ isOpen, onClose, planId, onSuccess }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  
  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
        setStep('method');
    }
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const plan = planId === 'pro_monthly' ? PLANS.MONTHLY : PLANS.YEARLY;

  const handlePay = async () => {
    setStep('processing');
    
    // Simulate network delay
    setTimeout(async () => {
        // 1. Record transaction
        await recordPayment(currentUser.uid, plan.price, method, planId);
        
        // 2. Upgrade User
        await upgradeSubscription(currentUser.uid, planId);
        
        setStep('success');
        
        // Close after showing success for a moment
        setTimeout(() => {
            onSuccess();
            onClose();
        }, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-stone-50 border-b border-stone-100 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="font-bold text-stone-800">Secure Payment</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">SSL Encrypted</span>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="p-6">
            {step === 'method' && (
                <div className="space-y-6">
                    <div className="text-center mb-6">
                        <p className="text-stone-500 text-sm">Amount to Pay</p>
                        <h2 className="text-3xl font-bold text-stone-900">{plan.symbol}{plan.price}</h2>
                        <p className="text-xs text-stone-400 mt-1">for {plan.name}</p>
                    </div>

                    <div className="space-y-3">
                        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'upi' ? 'border-teal-600 bg-teal-50' : 'border-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="paymethod" className="hidden" checked={method === 'upi'} onChange={() => setMethod('upi')} />
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">⚡️</div>
                            <div className="flex-1">
                                <div className="font-bold text-stone-800">UPI</div>
                                <div className="text-xs text-stone-500">Google Pay, PhonePe, Paytm</div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'upi' ? 'border-teal-600' : 'border-stone-300'}`}>
                                {method === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>}
                            </div>
                        </label>

                        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'card' ? 'border-teal-600 bg-teal-50' : 'border-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="paymethod" className="hidden" checked={method === 'card'} onChange={() => setMethod('card')} />
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">💳</div>
                            <div className="flex-1">
                                <div className="font-bold text-stone-800">Card</div>
                                <div className="text-xs text-stone-500">Credit or Debit Card</div>
                            </div>
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'card' ? 'border-teal-600' : 'border-stone-300'}`}>
                                {method === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>}
                            </div>
                        </label>
                    </div>

                    <button 
                        onClick={handlePay}
                        className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-transform active:scale-[0.98] shadow-lg"
                    >
                        Pay {plan.symbol}{plan.price}
                    </button>
                </div>
            )}

            {step === 'processing' && (
                <div className="text-center py-10">
                    <div className="w-16 h-16 border-4 border-stone-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2">Processing Payment...</h3>
                    <p className="text-stone-500 text-sm">Please do not close this window.</p>
                </div>
            )}

            {step === 'success' && (
                <div className="text-center py-10">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 mb-2">Payment Successful!</h3>
                    <p className="text-stone-500 text-sm">Welcome to ZenFlow Pro.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayModal;
