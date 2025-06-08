import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('evolution');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto py-8 px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Centrul de Analize Agricole AI
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Platformă completă pentru analiză și predicții agricole bazate pe inteligență artificială.
              Explorează evoluția istorică, previzionează randamentele viitoare și compară scenarii multiple.
            </p>
          </div>
          
          {/* Key Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="text-center border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Analiza Istorică</h3>
                <p className="text-sm text-blue-800">
                  Evoluția randamentelor 2000-2024 pentru orice țară și cultură
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-green-200 bg-green-50">
              <CardContent className="p-6">
                <Sparkles className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">Predicții Viitoare</h3>
                <p className="text-sm text-green-800">
                  Previziuni rapide pentru anii 2025-2050 cu nivele de încredere
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <Brain className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-900 mb-2">Scenarii Multiple</h3>
                <p className="text-sm text-purple-800">
                  Compară și analizează multiple opțiuni pentru planificare strategică
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
                <div className="font-medium">Evoluție Istorică</div>
                <div className="text-xs text-muted-foreground">2000-2024</div>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="future" 
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white"
            >
              <Sparkles className="w-4 h-4" />
              <div className="text-center">
                <div className="font-medium">Predicții Viitoare</div>
                <div className="text-xs text-muted-foreground">2025-2050</div>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="scenarios" 
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white"
            >
              <BarChart3 className="w-4 h-4" />
              <div className="text-center">
                <div className="font-medium">Analiză Scenarii</div>
                <div className="text-xs text-muted-foreground">Comparare multiplă</div>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Historical Evolution Tab */}
          <TabsContent value="evolution" className="mt-6">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Analiză Istoric Detaliată
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Explorează evoluția randamentelor agricole în ultimii 25 de ani. Această analiză 
                  îți oferă o perspectivă completă asupra tendințelor istorice, variațiilor climatice 
                  și progresului tehnologic în agricultură.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>25 ani de date FAOSTAT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>245+ țări disponibile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>180+ culturi agricole</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Analiză trend avansată</span>
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
                    Despre Predicțiile Viitoare
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Nivele de Încredere</h4>
                      <ul className="space-y-1 text-sm">
                        <li><strong>Înaltă:</strong> Predicții foarte fiabile bazate pe date consistente</li>
                        <li><strong>Medie:</strong> Predicții cu fiabilitate moderată (1-5 ani în viitor)</li>
                        <li><strong>Scăzută:</strong> Predicții cu incertitudine crescută (5-15 ani)</li>
                        <li><strong>F. Scăzută:</strong> Predicții explorative (15+ ani în viitor)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Metode de Predicție</h4>
                      <ul className="space-y-1 text-sm">
                        <li><strong>Interpolare:</strong> Bazată pe date istorice existente</li>
                        <li><strong>Extrapolarea:</strong> Continuarea tendințelor actuale</li>
                        <li><strong>Proiecție:</strong> Modelare avansată pentru termen lung</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                    <p className="text-xs">
                      <strong>Notă:</strong> Predicțiile sunt generate de un model AI antrenat pe date globale FAOSTAT 
                      și reflectă tendințele actuale. Factori precum schimbările climatice, politicile agricole 
                      și inovațiile tehnologice pot influența rezultatele reale.
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
                    Analiză Strategică de Scenarii
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-purple-800">
                  <p className="mb-4">
                    Compară multiple scenarii pentru a lua decizii informate în planificarea agricolă. 
                    Această funcționalitate îți permite să analizezi diferite opțiuni și să identifici 
                    cele mai promițătoare oportunități.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <Globe className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <strong>Comparare Țări</strong>
                      <p>Compară potențialul agricol între diferite regiuni</p>
                    </div>
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <strong>Comparare Culturi</strong>
                      <p>Evaluează care culturi sunt mai profitabile</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <strong>Analiza Temporală</strong>
                      <p>Planifică pe termen scurt vs. lung</p>
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

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="container mx-auto py-6 px-6 text-center text-sm text-gray-600">
          <p>
            Powered by AI • Date FAOSTAT • Model RandomForest Enhanced v2.0 • 
            Predicții generate pe baza a 245 țări și 180+ culturi agricole
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsPage;