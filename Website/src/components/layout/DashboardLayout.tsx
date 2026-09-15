import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { HistoryModal } from '../dashboard/HistoryModal';
import { SettingsModal } from '../dashboard/SettingsModal';
import { AdSenseSlot } from '../ads/AdSenseSlot';
import { ADSENSE_CONFIG } from '../../config/adsense';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EAEFF6] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <TopHeader 
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Google AdSense Placement - Top Leaderboard Ad on EVERY screen */}
          <AdSenseSlot 
            slotId={ADSENSE_CONFIG.slots.topLeaderboard} 
            format="horizontal" 
            className="mb-6 -mt-1"
          />

          {children}
          
          {/* Google AdSense Placement - Bottom Leaderboard Ad */}
          <AdSenseSlot 
            slotId={ADSENSE_CONFIG.slots.footerLeaderboard} 
            format="horizontal" 
            className="mt-8 mb-2"
          />
        </main>
      </div>

      {/* Shared Modals */}
      <HistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
