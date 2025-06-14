import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Brain, 
  Clock,
  Globe,
  Lightbulb
} from 'lucide-react';

// Import existing and new components
import YieldEvolutionViewer from '../components/YieldEvolutionViewer';
import FuturePredictionCard from '../components/FuturePredictionCard';
import FutureScenarioAnalyzer from '../components/FutureScenarioAnalyzer';

/**
 * EnhancedAnalyticsPage
 * 
 * Unified analytics page that combines:
 * - Historical yield evolution (2000-2024)
 * - Future predictions (single predictions)
 * - Scenario analysis (multiple comparisons)
 */
const EnhancedAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('evolution');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {t('analytics.header.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('analytics.header.description')}
            </p>
          </div>
          
          {/* Key Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="text-center border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">
                  {t('analytics.features.historical.title')}
                </h3>
                <p className="text-sm text-blue-800">
                  {t('analytics.features.historical.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-green-200 bg-green-50">
              <CardContent className="p-6">
                <Sparkles className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">
                  {t('analytics.features.future.title')}
                </h3>
                <p className="text-sm text-green-800">
                  {t('analytics.features.future.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <Brain className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-900 mb-2">
                  {t('analytics.features.scenarios.title')}
                </h3>
                <p className="text-sm text-purple-800">
                  {t('analytics.features.scenarios.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" defaultValue=''>
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger 
              value="evolution" 
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white"
            >
              <TrendingUp className="w-4 h-4" />
              <div className="text-center">
                <div className="font-medium">{t('analytics.tabs.evolution.title')}</div>
                <div className="text-xs text-muted-foreground">{t('analytics.tabs.evolution.subtitle')}</div>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="future" 
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white"
            >
              <Sparkles className="w-4 h-4" />
              <div className="text-center">
                <div className="font-medium">{t('analytics.tabs.future.title')}</div>
                <div className="text-xs text-muted-foreground">{t('analytics.tabs.future.subtitle')}</div>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="scenarios" 
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white"
            >
              <BarChart3 className="w-4 h-4" />
              <div className="text-center">
                <div className="font-medium">{t('analytics.tabs.scenarios.title')}</div>
                <div className="text-xs text-muted-foreground">{t('analytics.tabs.scenarios.subtitle')}</div>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Historical Evolution Tab */}
          <TabsContent value="evolution" className="mt-6">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {t('analytics.evolutionTab.header.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('analytics.evolutionTab.header.description')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>{t('analytics.evolutionTab.features.data')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>{t('analytics.evolutionTab.features.countries')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>{t('analytics.evolutionTab.features.crops')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>{t('analytics.evolutionTab.features.analysis')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <YieldEvolutionViewer />
          </TabsContent>

          {/* Future Predictions Tab */}
          <TabsContent value="future" className="mt-6">
            <div className="space-y-6">
              {/* Quick Prediction Card */}
              <FuturePredictionCard className="lg:max-w-4xl mx-auto" />
              
              {/* Information Card */}
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Lightbulb className="w-5 h-5" />
                    {t('analytics.futureTab.info.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">{t('analytics.futureTab.confidence.title')}</h4>
                      <ul className="space-y-1 text-sm">
                        <li><strong>{t('analytics.futureTab.confidence.high.label')}:</strong> {t('analytics.futureTab.confidence.high.description')}</li>
                        <li><strong>{t('analytics.futureTab.confidence.medium.label')}:</strong> {t('analytics.futureTab.confidence.medium.description')}</li>
                        <li><strong>{t('analytics.futureTab.confidence.low.label')}:</strong> {t('analytics.futureTab.confidence.low.description')}</li>
                        <li><strong>{t('analytics.futureTab.confidence.veryLow.label')}:</strong> {t('analytics.futureTab.confidence.veryLow.description')}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{t('analytics.futureTab.methods.title')}</h4>
                      <ul className="space-y-1 text-sm">
                        <li><strong>{t('analytics.futureTab.methods.interpolation.label')}:</strong> {t('analytics.futureTab.methods.interpolation.description')}</li>
                        <li><strong>{t('analytics.futureTab.methods.extrapolation.label')}:</strong> {t('analytics.futureTab.methods.extrapolation.description')}</li>
                        <li><strong>{t('analytics.futureTab.methods.projection.label')}:</strong> {t('analytics.futureTab.methods.projection.description')}</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                    <p className="text-xs">
                      <strong>{t('analytics.futureTab.disclaimer.title')}:</strong> {t('analytics.futureTab.disclaimer.content')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scenario Analysis Tab */}
          <TabsContent value="scenarios" className="mt-6">
            <div className="space-y-6">
              {/* Info Card */}
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Brain className="w-5 h-5" />
                    {t('analytics.scenariosTab.header.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-purple-800">
                  <p className="mb-4">
                    {t('analytics.scenariosTab.header.description')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <Globe className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <strong>{t('analytics.scenariosTab.features.countries.title')}</strong>
                      <p>{t('analytics.scenariosTab.features.countries.description')}</p>
                    </div>
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <strong>{t('analytics.scenariosTab.features.crops.title')}</strong>
                      <p>{t('analytics.scenariosTab.features.crops.description')}</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <strong>{t('analytics.scenariosTab.features.temporal.title')}</strong>
                      <p>{t('analytics.scenariosTab.features.temporal.description')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Scenario Analyzer */}
              <FutureScenarioAnalyzer />
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
};

export default EnhancedAnalyticsPage;