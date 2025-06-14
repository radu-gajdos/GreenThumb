import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Activity,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { CalendarEvent } from '@/features/calendar/types/calendar';
import PlotViewModal from '@/features/plots/pages/PlotPage/PlotViewModal';
import ActiveActionsModal from '../components/modals/ActiveActionsModal';
import OverdueActionsModal from '../components/modals/OverdueActionsModal';
import PlotsOverview from '../components/PlotsOverview';
import RecentActivity from '../components/RecentActivity';
import StatsCard from '../components/StatsCard';
import TodayActions from '../components/TodaysActions';

const DashboardIndex: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dashboardData = useDashboardData();
  const [showActiveActionsModal, setShowActiveActionsModal] = useState(false);
  const [showOverdueActionsModal, setShowOverdueActionsModal] = useState(false);
  const [showPlotViewModal, setShowPlotViewModal] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center">
        <div className="mb-4">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('dashboardIndex.errorTitle', 'Eroare la încărcarea dashboard-ului')}
        </h3>
        <p className="text-gray-500 max-w-md mb-4">
          {dashboardData.error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded"
        >
          {t('dashboardIndex.retryButton', 'Încearcă din nou')}
        </button>
      </div>
    );
  }

  const { stats, plotsSummary, actionsSummary, todayEvents } = dashboardData;

  if (showPlotViewModal) {
    return (
      <>
        <PlotViewModal
          isOpen={showPlotViewModal}
          onClose={() => {
            setShowPlotViewModal(false);
            setSelectedPlotId(null);
          }}
          plotId={selectedPlotId}
        />

        <ActiveActionsModal
          isOpen={showActiveActionsModal}
          onClose={() => setShowActiveActionsModal(false)}
        />

        <OverdueActionsModal
          isOpen={showOverdueActionsModal}
          onClose={() => setShowOverdueActionsModal(false)}
        />
      </>
    );
  } else return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow-0">
        <div className="lg:col-span-1 overflow-hidden">
          <TodayActions
            events={todayEvents || []}
            onEventClick={(event) => setSelectedEvent(event)}
          />
        </div>

        <div className="lg:col-span-2 space-y-6 overflow-hidden px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title={t('dashboardIndex.stats.activeActions', 'Acțiuni Active')}
              value={stats.activeActions}
              description={t('dashboardIndex.stats.activeActionsDescription', 'Acțiuni ne-finalizate')}
              icon={Activity}
              color="blue"
              onClick={() => setShowActiveActionsModal(true)}
              actionIndicator
            />

            <StatsCard
              title={t('dashboardIndex.stats.upcomingWeek', 'Următoarele 7 zile')}
              value={actionsSummary.upcomingThisWeek}
              description={t('dashboardIndex.stats.scheduledActions', 'Acțiuni programate')}
              icon={Calendar}
              color="purple"
            />

            <StatsCard
              title={t('dashboardIndex.stats.overdueActions', 'Acțiuni Întârziate')}
              value={actionsSummary.overdueCount}
              description={t('dashboardIndex.stats.overdueDescription', 'Depășite și nefinalizate')}
              icon={AlertTriangle}
              color="red"
              onClick={() => setShowOverdueActionsModal(true)}
              actionIndicator
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard
              title={t('dashboardIndex.stats.totalPlots', 'Total Terenuri')}
              value={stats.totalPlots}
              description={t('dashboardIndex.stats.totalArea', '{{area}} hectare în total', { area: stats.totalArea.toFixed(2) })}
              icon={MapPin}
              color="green"
              onClick={() => navigate('/app/plots')}
              actionIndicator
            />

            <StatsCard
              title={t('dashboardIndex.stats.avgSize', 'Suprafață Medie')}
              value={stats.totalPlots > 0 ? (stats.totalArea / stats.totalPlots).toFixed(2) : 0}
              description={t('dashboardIndex.stats.avgArea', 'hectare per teren')}
              icon={TrendingUp}
              color="indigo"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-hidden">
        <div className="lg:col-span-2 overflow-hidden">
          <RecentActivity
            activities={dashboardData.recentActivity}
            onNavigate={navigate}
            onViewAllActivities={() => setShowActiveActionsModal(true)}
            onActivityClick={(plotId) => {
              setSelectedPlotId(plotId);
              setShowPlotViewModal(true);
            }}
          />
        </div>

        <div className="lg:col-span-1 overflow-hidden">
          <PlotsOverview
            plots={plotsSummary}
            onNavigate={navigate}
            onPlotClick={(plotId) => {
              setSelectedPlotId(plotId);
              setShowPlotViewModal(true);
            }}
          />
        </div>
      </div>

      <ActiveActionsModal
        isOpen={showActiveActionsModal}
        onClose={() => setShowActiveActionsModal(false)}
      />

      <OverdueActionsModal
        isOpen={showOverdueActionsModal}
        onClose={() => setShowOverdueActionsModal(false)}
      />
    </div>
  );
};

export default DashboardIndex;