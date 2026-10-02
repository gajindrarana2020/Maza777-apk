import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BetModal } from './components/BetModal';
import { BankModal } from './components/BankModal';
import { BetSuccessModal } from './components/BetSuccessModal';
import { ToastBanner } from './components/ToastBanner';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { InboxScreen } from './screens/InboxScreen';
import { WithdrawScreen } from './screens/WithdrawScreen';
import { WithdrawRecordScreen } from './screens/WithdrawRecordScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ProfileEditScreen } from './screens/ProfileEditScreen';
import { InviteScreen } from './screens/InviteScreen';
import { BetRecordScreen } from './screens/BetRecordScreen';
import { AdminScreen } from './screens/AdminScreen';

const MainApp: React.FC = () => {
  const { user, activeScreen, betSuccessData, setBetSuccessData, navigateTo } = useApp();

  if (!user && activeScreen !== 'admin') {
    return (
      <>
        <ToastBanner />
        <AuthScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0f13] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-zinc-950 pb-20">
      {/* Global Toast */}
      <ToastBanner />

      {/* Sticky Top Header */}
      <Header />

      {/* Screen Router */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {activeScreen === 'home' && <HomeScreen />}
        {activeScreen === 'inbox' && <InboxScreen />}
        {activeScreen === 'withdraw' && <WithdrawScreen />}
        {activeScreen === 'withdrawRecord' && <WithdrawRecordScreen />}
        {activeScreen === 'profile' && <ProfileScreen />}
        {activeScreen === 'profileEdit' && <ProfileEditScreen />}
        {activeScreen === 'invite' && <InviteScreen />}
        {activeScreen === 'betRecord' && <BetRecordScreen />}
        {activeScreen === 'admin' && <AdminScreen />}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Global Modals & Popups */}
      <BetModal />
      <BankModal />

      {/* Bet Success Celebration Modal (Always mounted at app root level) */}
      {betSuccessData && (
        <BetSuccessModal
          data={betSuccessData}
          onClose={() => setBetSuccessData(null)}
          onViewRecords={() => {
            setBetSuccessData(null);
            navigateTo('betRecord');
          }}
          onViewInbox={() => {
            setBetSuccessData(null);
            navigateTo('inbox');
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
