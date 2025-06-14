import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Brain, 
  Globe, 
  Wheat, 
  BarChart3,
  Plus,
  X,
  AlertCircle,
  Zap
} from 'lucide-react';
import SearchSelect from '@/components/ui/searchSelect';
import { YieldPredictorApi } from '../api/yieldPredictor.api';
import { ConfidenceLevel } from '../interfaces/analitics';

// Same lists as before - kept as is per your instruction
const COUNTRIES = ['Afghanistan', 'Africa', 'Albania', 'Algeria', 'Americas', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Asia', 'Australia', 'Australia and New Zealand', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belgium-Luxembourg', 'Belize', 'Benin', 'Bhutan', 'Bolivia (Plurinational State of)', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Caribbean', 'Central African Republic', 'Central America', 'Central Asia', 'Chad', 'Chile', 'China', 'China, Hong Kong SAR', 'China, Macao SAR', 'China, Taiwan Province of', 'China, mainland', 'Colombia', 'Comoros', 'Congo', 'Cook Islands', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Czechoslovakia', "Côte d'Ivoire", "Democratic People's Republic of Korea", 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Eastern Africa', 'Eastern Asia', 'Eastern Europe', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Ethiopia PDR', 'Europe', 'European Union (27)', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guadeloupe', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran (Islamic Republic of)', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Land Locked Developing Countries', "Lao People's Democratic Republic", 'Latvia', 'Least Developed Countries', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Lithuania', 'Low Income Food Deficit Countries', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Melanesia', 'Mexico', 'Micronesia', 'Micronesia (Federated States of)', 'Middle Africa', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Net Food Importing Developing Countries', 'Netherlands (Kingdom of the)', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'North Macedonia', 'Northern Africa', 'Northern America', 'Northern Europe', 'Norway', 'Oceania', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Polynesia', 'Portugal', 'Puerto Rico', 'Qatar', 'Republic of Korea', 'Republic of Moldova', 'Romania', 'Russian Federation', 'Rwanda', 'Réunion', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Serbia and Montenegro', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Small Island Developing States', 'Solomon Islands', 'Somalia', 'South Africa', 'South America', 'South Sudan', 'South-eastern Asia', 'Southern Africa', 'Southern Asia', 'Southern Europe', 'Spain', 'Sri Lanka', 'Sudan', 'Sudan (former)', 'Suriname', 'Sweden', 'Switzerland', 'Syrian Arab Republic', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkmenistan', 'Tuvalu', 'Türkiye', 'USSR', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom of Great Britain and Northern Ireland', 'United Republic of Tanzania', 'United States of America', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela (Bolivarian Republic of)', 'Viet Nam', 'Western Africa', 'Western Asia', 'Western Europe', 'World', 'Yemen', 'Yugoslav SFR', 'Zambia', 'Zimbabwe'];

const CROPS = ['Abaca, manila hemp, raw', 'Agave fibres, raw, n.e.c.', 'Almonds, in shell', 'Anise, badian, coriander, cumin, caraway, fennel and juniper berries, raw', 'Apples', 'Apricots', 'Areca nuts', 'Artichokes', 'Asparagus', 'Avocados', 'Bambara beans, dry', 'Bananas', 'Barley', 'Beans, dry', 'Blueberries', 'Broad beans and horse beans, dry', 'Broad beans and horse beans, green', 'Buckwheat', 'Cabbages', 'Canary seed', 'Cantaloupes and other melons', 'Carrots and turnips', 'Cashew nuts, in shell', 'Cashewapple', 'Cassava leaves', 'Cassava, fresh', 'Castor oil seeds', 'Cauliflowers and broccoli', 'Cereals n.e.c.', 'Cereals, primary', 'Cherries', 'Chestnuts, in shell', 'Chick peas, dry', 'Chicory roots', 'Chillies and peppers, dry (Capsicum spp., Pimenta spp.), raw', 'Chillies and peppers, green (Capsicum spp. and Pimenta spp.)', 'Cinnamon and cinnamon-tree flowers, raw', 'Citrus Fruit, Total', 'Cloves (whole stems), raw', 'Cocoa beans', 'Coconuts, in shell', 'Coffee, green', 'Cow peas, dry', 'Cranberries', 'Cucumbers and gherkins', 'Currants', 'Dates', 'Edible roots and tubers with high starch or inulin content, n.e.c., fresh', 'Eggplants (aubergines)', 'Fibre Crops, Fibre Equivalent', 'Figs', 'Flax, raw or retted', 'Fonio', 'Fruit Primary', 'Ginger, raw', 'Gooseberries', 'Grapes', 'Green corn (maize)', 'Green garlic', 'Groundnuts, excluding shelled', 'Hazelnuts, in shell', 'Hempseed', 'Hop cones', 'Jojoba seeds', 'Jute, raw or retted', 'Kapok fruit', 'Karite nuts (sheanuts)', 'Kenaf, and other textile bast fibres, raw or retted', 'Kiwi fruit', 'Kola nuts', 'Leeks and other alliaceous vegetables', 'Lemons and limes', 'Lentils, dry', 'Lettuce and chicory', 'Linseed', 'Locust beans (carobs)', 'Lupins', 'Maize (corn)', 'Mangoes, guavas and mangosteens', 'Maté leaves', 'Melonseed', 'Millet', 'Mixed grain', 'Mustard seed', 'Natural rubber in primary forms', 'Nutmeg, mace, cardamoms, raw', 'Oats', 'Oil palm fruit', 'Oilcrops, Cake Equivalent', 'Oilcrops, Oil Equivalent', 'Okra', 'Olives', 'Onions and shallots, dry (excluding dehydrated)', 'Onions and shallots, green', 'Oranges', 'Other beans, green', 'Other berries and fruits of the genus vaccinium n.e.c.', 'Other citrus fruit, n.e.c.', 'Other fibre crops, raw, n.e.c.', 'Other fruits, n.e.c.', 'Other nuts (excluding wild edible nuts and groundnuts), in shell, n.e.c.', 'Other oil seeds, n.e.c.', 'Other pome fruits', 'Other pulses n.e.c.', 'Other stimulant, spice and aromatic crops, n.e.c.', 'Other stone fruits', 'Other sugar crops n.e.c.', 'Other tropical fruits, n.e.c.', 'Other vegetables, fresh n.e.c.', 'Papayas', 'Peaches and nectarines', 'Pears', 'Peas, dry', 'Peas, green', 'Pepper (Piper spp.), raw', 'Peppermint, spearmint', 'Persimmons', 'Pigeon peas, dry', 'Pineapples', 'Pistachios, in shell', 'Plantains and cooking bananas', 'Plums and sloes', 'Pomelos and grapefruits', 'Poppy seed', 'Potatoes', 'Pulses, Total', 'Pumpkins, squash and gourds', 'Pyrethrum, dried flowers', 'Quinces', 'Quinoa', 'Ramie, raw or retted', 'Rape or colza seed', 'Raspberries', 'Rice', 'Roots and Tubers, Total', 'Rye', 'Safflower seed', 'Seed cotton, unginned', 'Sesame seed', 'Sisal, raw', 'Sorghum', 'Sour cherries', 'Soya beans', 'Spinach', 'Strawberries', 'String beans', 'Sugar Crops Primary', 'Sugar beet', 'Sugar cane', 'Sunflower seed', 'Sweet potatoes', 'Tallowtree seeds', 'Tangerines, mandarins, clementines', 'Taro', 'Tea leaves', 'Tomatoes', 'Treenuts, Total', 'Triticale', 'True hemp, raw or retted', 'Tung nuts', 'Unmanufactured tobacco', 'Vanilla, raw', 'Vegetables Primary', 'Vetches', 'Walnuts, in shell', 'Watermelons', 'Wheat', 'Yams', 'Yautia'];

interface Scenario {
  id: string;
  country: string;
  crop: string;
  startYear: number;
  endYear: number;
  name: string;
}

interface ScenarioResult {
  scenarioId: string;
  name: string;
  data: Array<{
    year: number;
    yield: number;
    confidenceLevel: ConfidenceLevel;
    country: string;
    crop: string;
  }>;
  avgYield: number;
  minYield: number;
  maxYield: number;
  highConfidenceCount: number;
}

/**
 * FutureScenarioAnalyzer
 * 
 * Component for comparing multiple future yield scenarios.
 * Allows users to compare different countries, crops, or time periods.
 */
const FutureScenarioAnalyzer: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const yieldApi = useMemo(() => new YieldPredictorApi(), []);

  // Convert arrays to SearchSelect format
  const countryOptions = useMemo(() => 
    COUNTRIES.map(country => ({ label: country, value: country })), 
    []
  );

  const cropOptions = useMemo(() => 
    CROPS.map(crop => ({ label: crop, value: crop })), 
    []
  );

  // Add new scenario
  const addScenario = () => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      country: '',
      crop: '',
      startYear: 2025,
      endYear: 2030,
      name: t('scenarioAnalyzer.defaultScenarioName', { number: scenarios.length + 1 })
    };
    setScenarios([...scenarios, newScenario]);
  };

  // Remove scenario
  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
    setResults(results.filter(r => r.scenarioId !== id));
  };

  // Update scenario
  const updateScenario = (id: string, updates: Partial<Scenario>) => {
    setScenarios(scenarios.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Run analysis for all scenarios
  const runAnalysis = useCallback(async () => {
    const validScenarios = scenarios.filter(s => 
      s.country && s.crop && s.startYear >= 2025 && s.endYear <= 2050 && s.startYear <= s.endYear
    );

    if (validScenarios.length === 0) return;

    setLoading(true);
    setProgress(0);
    
    try {
      const newResults: ScenarioResult[] = [];
      
      for (let i = 0; i < validScenarios.length; i++) {
        const scenario = validScenarios[i];
        const years = Array.from(
          { length: scenario.endYear - scenario.startYear + 1 }, 
          (_, idx) => scenario.startYear + idx
        );
        
        const scenarioData = [];
        let highConfidenceCount = 0;
        
        for (const year of years) {
          try {
            const prediction = await yieldApi.predictGlobal(scenario.country, year, scenario.crop);
            
            if (prediction) {
              if (prediction.confidence_level === ConfidenceLevel.HIGH) {
                highConfidenceCount++;
              }
              
              scenarioData.push({
                year,
                yield: prediction.yield_kg_per_ha,
                confidenceLevel: prediction.confidence_level,
                country: scenario.country,
                crop: scenario.crop
              });
            }
          } catch (error) {
            console.error(`Error for ${scenario.country} ${scenario.crop} ${year}:`, error);
          }
          
          // Update progress
          const totalSteps = validScenarios.reduce((sum, s) => 
            sum + (s.endYear - s.startYear + 1), 0
          );
          const currentStep = newResults.reduce((sum, r) => sum + r.data.length, 0) + scenarioData.length;
          setProgress(Math.round((currentStep / totalSteps) * 100));
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Calculate statistics
        const yields = scenarioData.map(d => d.yield);
        const result: ScenarioResult = {
          scenarioId: scenario.id,
          name: scenario.name,
          data: scenarioData,
          avgYield: yields.length > 0 ? yields.reduce((a, b) => a + b, 0) / yields.length : 0,
          minYield: yields.length > 0 ? Math.min(...yields) : 0,
          maxYield: yields.length > 0 ? Math.max(...yields) : 0,
          highConfidenceCount
        };
        
        newResults.push(result);
      }
      
      setResults(newResults);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [scenarios, yieldApi, t]);

  // Format numbers
  const formatYield = (value: number) => {
    return value.toLocaleString(i18n.language === 'en' ? 'en-US' : 'ro-RO', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  // Chart data
  const chartData = useMemo(() => {
    const allYears = new Set<number>();
    results.forEach(result => {
      result.data.forEach(point => allYears.add(point.year));
    });

    return Array.from(allYears).sort().map(year => {
      const dataPoint: any = { year };
      results.forEach(result => {
        const yearData = result.data.find(d => d.year === year);
        dataPoint[result.name] = yearData?.yield || null;
      });
      return dataPoint;
    });
  }, [results]);

  // Chart colors
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t('scenarioAnalyzer.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {t('scenarioAnalyzer.description')}
          </p>
          
          <Button onClick={addScenario} variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('scenarioAnalyzer.addScenario')}
          </Button>
        </CardContent>
      </Card>

      {/* Scenarios Configuration */}
      {scenarios.map((scenario, index) => (
        <Card key={scenario.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                <Input
                  value={scenario.name}
                  onChange={(e) => updateScenario(scenario.id, { name: e.target.value })}
                  className="text-lg font-semibold border-none p-0 h-auto"
                  placeholder={t('scenarioAnalyzer.defaultScenarioName', { number: index + 1 })}
                />
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeScenario(scenario.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Country */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4" />
                  {t('scenarioAnalyzer.labels.country')}
                </Label>
                <SearchSelect
                  options={countryOptions}
                  placeholder={t('scenarioAnalyzer.placeholders.country')}
                  value={scenario.country}
                  onValueChange={(value) => updateScenario(scenario.id, { country: value as string })}
                  modal={false}
                />
              </div>

              {/* Crop */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Wheat className="w-4 h-4" />
                  {t('scenarioAnalyzer.labels.crop')}
                </Label>
                <SearchSelect
                  options={cropOptions}
                  placeholder={t('scenarioAnalyzer.placeholders.crop')}
                  value={scenario.crop}
                  onValueChange={(value) => updateScenario(scenario.id, { crop: value as string })}
                  modal={false}
                />
              </div>

              {/* Start Year */}
              <div className="space-y-2">
                <Label className="text-sm">{t('scenarioAnalyzer.labels.startYear')}</Label>
                <Input
                  type="number"
                  min="2025"
                  max="2050"
                  value={scenario.startYear}
                  onChange={(e) => updateScenario(scenario.id, { 
                    startYear: parseInt(e.target.value) || 2025 
                  })}
                />
              </div>

              {/* End Year */}
              <div className="space-y-2">
                <Label className="text-sm">{t('scenarioAnalyzer.labels.endYear')}</Label>
                <Input
                  type="number"
                  min="2025"
                  max="2050"
                  value={scenario.endYear}
                  onChange={(e) => updateScenario(scenario.id, { 
                    endYear: parseInt(e.target.value) || 2030 
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Run Analysis Button */}
      {scenarios.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={runAnalysis}
            disabled={loading || scenarios.every(s => !s.country || !s.crop)}
            className="px-8 py-2"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('scenarioAnalyzer.analyzing', { progress })}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>{t('scenarioAnalyzer.runAnalysis')}</span>
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* Statistics Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>{t('scenarioAnalyzer.results.comparison')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('scenarioAnalyzer.table.scenario')}</th>
                      <th className="text-center p-2">{t('scenarioAnalyzer.table.average')}</th>
                      <th className="text-center p-2">{t('scenarioAnalyzer.table.minimum')}</th>
                      <th className="text-center p-2">{t('scenarioAnalyzer.table.maximum')}</th>
                      <th className="text-center p-2">{t('scenarioAnalyzer.table.highConfidence')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={result.scenarioId} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: colors[index % colors.length] }}
                            ></div>
                            <span className="font-medium">{result.name}</span>
                          </div>
                        </td>
                        <td className="text-center p-2 font-mono">
                          {formatYield(result.avgYield)}
                        </td>
                        <td className="text-center p-2 font-mono">
                          {formatYield(result.minYield)}
                        </td>
                        <td className="text-center p-2 font-mono">
                          {formatYield(result.maxYield)}
                        </td>
                        <td className="text-center p-2">
                          <Badge variant={result.highConfidenceCount > 0 ? "default" : "secondary"}>
                            {result.highConfidenceCount}/{result.data.length}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Evolution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t('scenarioAnalyzer.charts.evolution')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatYield(value)} />
                  <Tooltip 
                    formatter={(value: any) => [formatYield(value), '']}
                    labelFormatter={(label) => t('scenarioAnalyzer.charts.yearLabel', { year: label })}
                  />
                  <Legend />
                  {results.map((result, index) => (
                    <Line
                      key={result.scenarioId}
                      type="monotone"
                      dataKey={result.name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparative Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t('scenarioAnalyzer.charts.averageComparison')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatYield(value)} />
                  <Tooltip formatter={(value: any) => [formatYield(value), t('scenarioAnalyzer.charts.averageLabel')]} />
                  <Bar 
                    dataKey="avgYield" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help Section */}
      {scenarios.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              {t('scenarioAnalyzer.help.title')}
            </h3>
            <p className="text-blue-800 mb-4">
              {t('scenarioAnalyzer.help.description')}
            </p>
            <div className="text-sm text-blue-700 space-y-1">
              <p>{t('scenarioAnalyzer.help.examplesTitle')}</p>
              <p>{t('scenarioAnalyzer.help.example1')}</p>
              <p>{t('scenarioAnalyzer.help.example2')}</p>
              <p>{t('scenarioAnalyzer.help.example3')}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FutureScenarioAnalyzer;