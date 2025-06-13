import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Activity, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  Plus,
  MessageSquare,
  BarChart3,
  Map,
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import PlotsOverview from './PlotsOverview';
import QuickActions from './QuickActions';

const DashboardIndex: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dashboardData = useDashboardData();

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
          Eroare la încărcarea dashboard-ului
        </h3>
        <p className="text-gray-500 max-w-md mb-4">
          {dashboardData.error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Încearcă din nou
        </button>
      </div>
    );
  }

  const { stats, plotsSummary, actionsSummary } = dashboardData;

  return (
    <div className="space-y-6">

      {/* Quick Actions */}
      {/* <QuickActions onNavigate={navigate} /> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Terenuri"
          value={stats.totalPlots}
          description={`${stats.totalArea.toFixed(2)} hectare în total`}
          icon={MapPin}
          color="green"
          onClick={() => navigate('/plots')}
        />
        
        <StatsCard
          title="Acțiuni Active"
          value={stats.activeActions}
          description="În desfășurare acum"
          icon={Activity}
          color="blue"
          onClick={() => navigate('/plots')}
        />
        
        <StatsCard
          title="Acțiuni Completate"
          value={stats.completedActions}
          description="Finalizate cu succes"
          icon={CheckCircle}
          color="green"
        />
        
        <StatsCard
          title="Acțiuni Planificate"
          value={stats.upcomingActions}
          description={actionsSummary.overdueCount > 0 ? `${actionsSummary.overdueCount} întârziate` : "Pentru viitor"}
          icon={Clock}
          color={actionsSummary.overdueCount > 0 ? "red" : "amber"}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Această Săptămână"
          value={actionsSummary.upcomingThisWeek}
          description="Acțiuni programate"
          icon={Calendar}
          color="purple"
        />
        
        <StatsCard
          title="Suprafață Medie"
          value={stats.totalPlots > 0 ? (stats.totalArea / stats.totalPlots).toFixed(2) : 0}
          description="hectare per teren"
          icon={TrendingUp}
          color="indigo"
        />
        
        {stats.topPerformingPlot && (
          <StatsCard
            title="Top Performer"
            value={stats.topPerformingPlot}
            description="Cel mai activ teren"
            icon={Users}
            color="amber"
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity 
            activities={dashboardData.recentActivity}
            onNavigate={navigate}
          />
        </div>

        {/* Plots Overview - Takes 1 column */}
        <div className="lg:col-span-1">
          <PlotsOverview 
            plots={plotsSummary}
            onNavigate={navigate}
          />
        </div>
      </div>

      {/* Actions Summary */}
      {Object.keys(actionsSummary.byType).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
            Rezumat Acțiuni
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(actionsSummary.byType).map(([type, count]) => (
              <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{count}</p>
                <p className="text-sm text-gray-600 capitalize">{type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardIndex;