
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './Dashboard';
import Leaderboard from './Leaderboard';
import RewardsView from './RewardsView';
import SubscriptionModal from './SubscriptionModal';
import { cancelSubscription } from '../services/subscriptionService';

interface ProfileViewProps {
  onClose: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onClose }) => {
  const { currentUser, logout, userStats, isPremium, subscription } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard' | 'rewards'>('dashboard');
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const executeCancel = async () => {
    if (!currentUser) return;
    setCanceling(true);
    await cancelSubscription(currentUser.uid);
    setCanceling(false);
    setConfirmingCancel(false);
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full h-[100dvh] md:h-auto md:max-h-[85dvh] md:max-w-md md:rounded-3xl shadow-2xl p-0 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        
        {/* Header */}
        <div className="p-6 pb-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg relative">
                 {currentUser.email?.[0].toUpperCase()}
                 {isPremium && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white"></div>}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-800 text-sm">{currentUser.email?.split('@')[0]}</span>
                    {isPremium && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold tracking-wide">PRO</span>}
                </div>
                <span className="text-xs text-stone-400">Member since {new Date().getFullYear()}</span>
              </div>
           </div>
           <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
           </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-stone-50 gap-2 px-6 overflow-x-auto scrollbar-hide shrink-0">
           <button 
             onClick={() => setActiveTab('dashboard')}
             className={`flex-1 min-w-[80px] py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
           >
             Dashboard
           </button>
           <button 
             onClick={() => setActiveTab('leaderboard')}
             className={`flex-1 min-w-[80px] py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${activeTab === 'leaderboard' ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
           >
             Rankings
           </button>
           <button 
             onClick={() => setActiveTab('rewards')}
             className={`flex-1 min-w-[80px] py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${activeTab === 'rewards' ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
           >
             Rewards
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-white">
           {activeTab === 'dashboard' && (
             <div className="space-y-6 pb-6">
               {userStats && <Dashboard stats={userStats} />}
               
               {/* Subscription Card */}
               <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Subscription</h4>
                     {isPremium ? (
                        subscription?.status === 'canceled' ? (
                            <span className="text-xs text-amber-600 font-medium">Canceled</span>
                        ) : (
                            <span className="text-xs text-teal-600 font-medium">Active</span>
                        )
                     ) : (
                       <span className="text-xs text-stone-400">Free Plan</span>
                     )}
                  </div>
                  
                  {isPremium ? (
                    <div className="text-xs text-stone-500">
                       {subscription?.status === 'canceled' ? (
                          <>
                            Your <strong>{subscription?.interval}ly</strong> plan expires on {subscription?.currentPeriodEnd?.toDate().toLocaleDateString()}.
                            <p className="mt-2 text-stone-400 italic">Auto-renewal is off.</p>
                          </>
                       ) : (
                          <>
                             Your <strong>{subscription?.interval}ly</strong> plan renews on {subscription?.currentPeriodEnd?.toDate().toLocaleDateString()}.
                             
                             {confirmingCancel ? (
                               <div className="mt-3 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
                                  <p className="text-xs text-red-800 font-medium mb-2">Stop auto-renewal?</p>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={executeCancel} 
                                      disabled={canceling}
                                      className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-md font-medium hover:bg-red-700 transition-colors"
                                    >
                                      {canceling ? 'Processing...' : 'Yes, Cancel'}
                                    </button>
                                    <button 
                                      onClick={() => setConfirmingCancel(false)} 
                                      disabled={canceling}
                                      className="bg-white text-stone-600 border border-stone-200 text-xs px-3 py-1.5 rounded-md font-medium hover:bg-stone-50"
                                    >
                                      Keep Plan
                                    </button>
                                  </div>
                               </div>
                             ) : (
                               <button 
                                  onClick={() => setConfirmingCancel(true)} 
                                  className="block mt-3 text-red-400 hover:text-red-600 underline text-xs transition-colors"
                               >
                                  Cancel Subscription
                               </button>
                             )}
                          </>
                       )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-stone-500 mb-3">Upgrade to unlock AI posture analysis and redeem coupons.</p>
                      <button 
                        onClick={() => setIsSubModalOpen(true)}
                        className="w-full py-2 bg-teal-700 text-white rounded-lg text-xs font-medium hover:bg-teal-800 transition-colors"
                      >
                        Upgrade to Pro
                      </button>
                    </div>
                  )}
               </div>
             </div>
           )}
           {activeTab === 'leaderboard' && <div className="pb-6"><Leaderboard /></div>}
           {activeTab === 'rewards' && <div className="pb-6"><RewardsView onUpgrade={() => setIsSubModalOpen(true)} /></div>}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 shrink-0 mb-safe">
           <button 
             onClick={handleLogout}
             className="w-full py-3 rounded-xl border border-stone-200 text-stone-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors text-sm font-medium"
           >
             Sign Out
           </button>
        </div>
        
      </div>
      
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
    </div>
  );
};

export default ProfileView;
