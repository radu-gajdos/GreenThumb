import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Globe, Wheat, Calendar, Target, Shield, Brain, Clock } from 'lucide-react';
import SearchSelect from '@/components/ui/searchSelect';
import { YieldPredictorApi } from '../api/yieldPredictor.api';
import { 
  SelectionState, 
  YieldEvolutionData, 
  YieldDataPoint, 
  ConfidenceLevel,
  PredictionMethod 
} from '../interfaces/analitics';
import YieldChart from './YieldChart';

// Countries and crops lists - kept as is per your instruction
const COUNTRIES = ['Afghanistan', 'Africa', 'Albania', 'Algeria', 'Americas', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Asia', 'Australia', 'Australia and New Zealand', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belgium-Luxembourg', 'Belize', 'Benin', 'Bhutan', 'Bolivia (Plurinational State of)', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Caribbean', 'Central African Republic', 'Central America', 'Central Asia', 'Chad', 'Chile', 'China', 'China, Hong Kong SAR', 'China, Macao SAR', 'China, Taiwan Province of', 'China, mainland', 'Colombia', 'Comoros', 'Congo', 'Cook Islands', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Czechoslovakia', "Côte d'Ivoire", "Democratic People's Republic of Korea", 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Eastern Africa', 'Eastern Asia', 'Eastern Europe', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Ethiopia PDR', 'Europe', 'European Union (27)', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guadeloupe', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran (Islamic Republic of)', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Land Locked Developing Countries', "Lao People's Democratic Republic", 'Latvia', 'Least Developed Countries', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Lithuania', 'Low Income Food Deficit Countries', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Melanesia', 'Mexico', 'Micronesia', 'Micronesia (Federated States of)', 'Middle Africa', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Net Food Importing Developing Countries', 'Netherlands (Kingdom of the)', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'North Macedonia', 'Northern Africa', 'Northern America', 'Northern Europe', 'Norway', 'Oceania', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Polynesia', 'Portugal', 'Puerto Rico', 'Qatar', 'Republic of Korea', 'Republic of Moldova', 'Romania', 'Russian Federation', 'Rwanda', 'Réunion', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Serbia and Montenegro', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Small Island Developing States', 'Solomon Islands', 'Somalia', 'South Africa', 'South America', 'South Sudan', 'South-eastern Asia', 'Southern Africa', 'Southern Asia', 'Southern Europe', 'Spain', 'Sri Lanka', 'Sudan', 'Sudan (former)', 'Suriname', 'Sweden', 'Switzerland', 'Syrian Arab Republic', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkmenistan', 'Tuvalu', 'Türkiye', 'USSR', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom of Great Britain and Northern Ireland', 'United Republic of Tanzania', 'United States of America', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela (Bolivarian Republic of)', 'Viet Nam', 'Western Africa', 'Western Asia', 'Western Europe', 'World', 'Yemen', 'Yugoslav SFR', 'Zambia', 'Zimbabwe'];

const CROPS = ['Abaca, manila hemp, raw', 'Agave fibres, raw, n.e.c.', 'Almonds, in shell', 'Anise, badian, coriander, cumin, caraway, fennel and juniper berries, raw', 'Apples', 'Apricots', 'Areca nuts', 'Artichokes', 'Asparagus', 'Avocados', 'Bambara beans, dry', 'Bananas', 'Barley', 'Beans, dry', 'Blueberries', 'Broad beans and horse beans, dry', 'Broad beans and horse beans, green', 'Buckwheat', 'Cabbages', 'Canary seed', 'Cantaloupes and other melons', 'Carrots and turnips', 'Cashew nuts, in shell', 'Cashewapple', 'Cassava leaves', 'Cassava, fresh', 'Castor oil seeds', 'Cauliflowers and broccoli', 'Cereals n.e.c.', 'Cereals, primary', 'Cherries', 'Chestnuts, in shell', 'Chick peas, dry', 'Chicory roots', 'Chillies and peppers, dry (Capsicum spp., Pimenta spp.), raw', 'Chillies and peppers, green (Capsicum spp. and Pimenta spp.)', 'Cinnamon and cinnamon-tree flowers, raw', 'Citrus Fruit, Total', 'Cloves (whole stems), raw', 'Cocoa beans', 'Coconuts, in shell', 'Coffee, green', 'Cow peas, dry', 'Cranberries', 'Cucumbers and gherkins', 'Currants', 'Dates', 'Edible roots and tubers with high starch or inulin content, n.e.c., fresh', 'Eggplants (aubergines)', 'Fibre Crops, Fibre Equivalent', 'Figs', 'Flax, raw or retted', 'Fonio', 'Fruit Primary', 'Ginger, raw', 'Gooseberries', 'Grapes', 'Green corn (maize)', 'Green garlic', 'Groundnuts, excluding shelled', 'Hazelnuts, in shell', 'Hempseed', 'Hop cones', 'Jojoba seeds', 'Jute, raw or retted', 'Kapok fruit', 'Karite nuts (sheanuts)', 'Kenaf, and other textile bast fibres, raw or retted', 'Kiwi fruit', 'Kola nuts', 'Leeks and other alliaceous vegetables', 'Lemons and limes', 'Lentils, dry', 'Lettuce and chicory', 'Linseed', 'Locust beans (carobs)', 'Lupins', 'Maize (corn)', 'Mangoes, guavas and mangosteens', 'Maté leaves', 'Melonseed', 'Millet', 'Mixed grain', 'Mustard seed', 'Natural rubber in primary forms', 'Nutmeg, mace, cardamoms, raw', 'Oats', 'Oil palm fruit', 'Oilcrops, Cake Equivalent', 'Oilcrops, Oil Equivalent', 'Okra', 'Olives', 'Onions and shallots, dry (excluding dehydrated)', 'Onions and shallots, green', 'Oranges', 'Other beans, green', 'Other berries and fruits of the genus vaccinium n.e.c.', 'Other citrus fruit, n.e.c.', 'Other fibre crops, raw, n.e.c.', 'Other fruits, n.e.c.', 'Other nuts (excluding wild edible nuts and groundnuts), in shell, n.e.c.', 'Other oil seeds, n.e.c.', 'Other pome fruits', 'Other pulses n.e.c.', 'Other stimulant, spice and aromatic crops, n.e.c.', 'Other stone fruits', 'Other sugar crops n.e.c.', 'Other tropical fruits, n.e.c.', 'Other vegetables, fresh n.e.c.', 'Papayas', 'Peaches and nectarines', 'Pears', 'Peas, dry', 'Peas, green', 'Pepper (Piper spp.), raw', 'Peppermint, spearmint', 'Persimmons', 'Pigeon peas, dry', 'Pineapples', 'Pistachios, in shell', 'Plantains and cooking bananas', 'Plums and sloes', 'Pomelos and grapefruits', 'Poppy seed', 'Potatoes', 'Pulses, Total', 'Pumpkins, squash and gourds', 'Pyrethrum, dried flowers', 'Quinces', 'Quinoa', 'Ramie, raw or retted', 'Rape or colza seed', 'Raspberries', 'Rice', 'Roots and Tubers, Total', 'Rye', 'Safflower seed', 'Seed cotton, unginned', 'Sesame seed', 'Sisal, raw', 'Sorghum', 'Sour cherries', 'Soya beans', 'Spinach', 'Strawberries', 'String beans', 'Sugar Crops Primary', 'Sugar beet', 'Sugar cane', 'Sunflower seed', 'Sweet potatoes', 'Tallowtree seeds', 'Tangerines, mandarins, clementines', 'Taro', 'Tea leaves', 'Tomatoes', 'Treenuts, Total', 'Triticale', 'True hemp, raw or retted', 'Tung nuts', 'Unmanufactured tobacco', 'Vanilla, raw', 'Vegetables Primary', 'Vetches', 'Walnuts, in shell', 'Watermelons', 'Wheat', 'Yams', 'Yautia'];

/**
 * YieldEvolutionViewer
 * 
 * Enhanced component for visualizing crop yield evolution over time (2000-2024)
 * with AI confidence levels and prediction methods.
 */
const YieldEvolutionViewer: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const [selection, setSelection] = useState<SelectionState>({
    country: '',
    crop: '',
    isValid: false
  });
  const [evolutionData, setEvolutionData] = useState<YieldEvolutionData | null>(null);
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

  // Update selection state
  const updateSelection = useCallback((field: 'country' | 'crop', value: string) => {
    setSelection(prev => {
      const updated = { ...prev, [field]: value };
      updated.isValid = updated.country !== '' && updated.crop !== '';
      return updated;
    });
  }, []);

  // Generate enhanced evolution data for 2000-2024 with AI confidence data
  const generateEvolutionData = useCallback(async () => {
    if (!selection.isValid) return;

    setLoading(true);
    setProgress(0);
    
    try {
      const years = Array.from({ length: 25 }, (_, i) => 2000 + i); // 2000-2024
      const dataPoints: YieldDataPoint[] = [];
      
      // Confidence level counters
      let highConfidenceCount = 0;
      let mediumConfidenceCount = 0;
      let lowConfidenceCount = 0;
      let veryLowConfidenceCount = 0;
      
      // Make API calls for each year
      for (let i = 0; i < years.length; i++) {
        const year = years[i];
        
        try {
          const prediction = await yieldApi.predictGlobal(
            selection.country, 
            year, 
            selection.crop
          );
          
          if (prediction) {
            // Count confidence levels
            switch (prediction.confidence_level) {
              case ConfidenceLevel.HIGH: 
                highConfidenceCount++; 
                break;
              case ConfidenceLevel.MEDIUM: 
                mediumConfidenceCount++; 
                break;
              case ConfidenceLevel.LOW: 
                lowConfidenceCount++; 
                break;
              case ConfidenceLevel.VERY_LOW: 
                veryLowConfidenceCount++; 
                break;
            }
            
            dataPoints.push({
              year,
              yield: prediction.yield_kg_per_ha,
              country: selection.country,
              crop: selection.crop,
              confidenceLevel: prediction.confidence_level,
              predictionMethod: prediction.prediction_method,
              isHighConfidence: prediction.confidence_level === ConfidenceLevel.HIGH
            });
          } else {
            dataPoints.push({
              year,
              yield: null,
              country: selection.country,
              crop: selection.crop
            });
          }
        } catch (error) {
          console.error(`Failed to get data for year ${year}:`, error);
          dataPoints.push({
            year,
            yield: null,
            country: selection.country,
            crop: selection.crop
          });
        }
        
        // Update progress
        setProgress(Math.round(((i + 1) / years.length) * 100));
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Calculate statistics
      const validDataPoints = dataPoints.filter(point => point.yield !== null);
      const yieldValues = validDataPoints.map(point => point.yield!);
      
      const statistics = {
        averageYield: yieldValues.length > 0 ? yieldValues.reduce((a, b) => a + b, 0) / yieldValues.length : 0,
        minYield: yieldValues.length > 0 ? Math.min(...yieldValues) : 0,
        maxYield: yieldValues.length > 0 ? Math.max(...yieldValues) : 0,
        totalYearsWithData: validDataPoints.length,
        // New confidence statistics
        highConfidencePoints: highConfidenceCount,
        mediumConfidencePoints: mediumConfidenceCount,
        lowConfidencePoints: lowConfidenceCount,
        veryLowConfidencePoints: veryLowConfidenceCount
      };

      const evolutionData: YieldEvolutionData = {
        country: selection.country,
        crop: selection.crop,
        data: dataPoints,
        ...statistics
      };

      setEvolutionData(evolutionData);
    } catch (error) {
      console.error('Error generating evolution data:', error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [selection, yieldApi]);

  // Clear data when selection changes
  React.useEffect(() => {
    setEvolutionData(null);
  }, [selection.country, selection.crop]);

  // Format numbers for display
  const formatYield = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('yieldEvolution.header.title')}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('yieldEvolution.header.description')}
        </p>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t('yieldEvolution.selection.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Globe className="w-4 h-4" />
                {t('yieldEvolution.selection.country')}
              </label>
              <SearchSelect
                options={countryOptions}
                placeholder={t('yieldEvolution.selection.countryPlaceholder')}
                value={selection.country}
                onValueChange={(value) => updateSelection('country', value as string)}
                modal={false}
              />
            </div>

            {/* Crop Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Wheat className="w-4 h-4" />
                {t('yieldEvolution.selection.crop')}
              </label>
              <SearchSelect
                options={cropOptions}
                placeholder={t('yieldEvolution.selection.cropPlaceholder')}
                value={selection.crop}
                onValueChange={(value) => updateSelection('crop', value as string)}
                modal={false}
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={generateEvolutionData}
              disabled={!selection.isValid || loading}
              className="px-8 py-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('yieldEvolution.buttons.generating', { progress })}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>{t('yieldEvolution.buttons.generate')}</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {evolutionData && (
        <div className="space-y-6">
          {/* Main Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">{t('yieldEvolution.stats.average')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatYield(evolutionData.averageYield)}
                </div>
                <div className="text-xs text-gray-500">{t('yieldEvolution.units.kgPerHa')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 text-red-600">📉</span>
                  <span className="text-sm font-medium text-gray-600">{t('yieldEvolution.stats.minimum')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatYield(evolutionData.minYield)}
                </div>
                <div className="text-xs text-gray-500">{t('yieldEvolution.units.kgPerHa')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 text-green-600">📈</span>
                  <span className="text-sm font-medium text-gray-600">{t('yieldEvolution.stats.maximum')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatYield(evolutionData.maxYield)}
                </div>
                <div className="text-xs text-gray-500">{t('yieldEvolution.units.kgPerHa')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">{t('yieldEvolution.stats.yearsWithData')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {evolutionData.totalYearsWithData}
                </div>
                <div className="text-xs text-gray-500">{t('yieldEvolution.stats.outOf25Years')}</div>
              </CardContent>
            </Card>
          </div>

          {/* AI Confidence Statistics Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {t('yieldEvolution.confidence.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-800">{t('yieldEvolution.confidence.high')}</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {evolutionData.highConfidencePoints}
                    </div>
                    <div className="text-xs text-green-700">{t('yieldEvolution.confidence.predictions')}</div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium text-yellow-800">{t('yieldEvolution.confidence.medium')}</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-900">
                      {evolutionData.mediumConfidencePoints}
                    </div>
                    <div className="text-xs text-yellow-700">{t('yieldEvolution.confidence.predictions')}</div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium text-orange-800">{t('yieldEvolution.confidence.low')}</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {evolutionData.lowConfidencePoints}
                    </div>
                    <div className="text-xs text-orange-700">{t('yieldEvolution.confidence.predictions')}</div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-red-800">{t('yieldEvolution.confidence.veryLow')}</span>
                    </div>
                    <div className="text-2xl font-bold text-red-900">
                      {evolutionData.veryLowConfidencePoints}
                    </div>
                    <div className="text-xs text-red-700">{t('yieldEvolution.confidence.predictions')}</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>{t('yieldEvolution.chart.title')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {evolutionData.country}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Wheat className="w-3 h-3" />
                    {evolutionData.crop}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <YieldChart 
                data={evolutionData} 
                showTrend={true}
                showAverage={true}
                height={450}
              />
            </CardContent>
          </Card>

          {/* AI Model Information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Brain className="w-5 h-5" />
                {t('yieldEvolution.aiModel.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('yieldEvolution.aiModel.model')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>{t('yieldEvolution.aiModel.source')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>{t('yieldEvolution.aiModel.baseline')}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-blue-700">
                {t('yieldEvolution.aiModel.description')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default YieldEvolutionViewer;