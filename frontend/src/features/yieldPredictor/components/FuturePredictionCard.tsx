import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Calendar,
    TrendingUp,
    Brain,
    Globe,
    Wheat,
    Sparkles,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';
import SearchSelect from '@/components/ui/searchSelect';
import { YieldPredictorApi } from '../api/yieldPredictor.api';
import { AiPredictionResponse, ConfidenceLevel, ConfidenceLevelLabels, PredictionMethodLabels } from '../interfaces/analitics';

// Same country/crop lists as before - kept as is per your instruction
const COUNTRIES = ['Afghanistan', 'Africa', 'Albania', 'Algeria', 'Americas', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Asia', 'Australia', 'Australia and New Zealand', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belgium-Luxembourg', 'Belize', 'Benin', 'Bhutan', 'Bolivia (Plurinational State of)', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Caribbean', 'Central African Republic', 'Central America', 'Central Asia', 'Chad', 'Chile', 'China', 'China, Hong Kong SAR', 'China, Macao SAR', 'China, Taiwan Province of', 'China, mainland', 'Colombia', 'Comoros', 'Congo', 'Cook Islands', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Czechoslovakia', "Côte d'Ivoire", "Democratic People's Republic of Korea", 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Eastern Africa', 'Eastern Asia', 'Eastern Europe', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Ethiopia PDR', 'Europe', 'European Union (27)', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guadeloupe', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran (Islamic Republic of)', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Land Locked Developing Countries', "Lao People's Democratic Republic", 'Latvia', 'Least Developed Countries', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Lithuania', 'Low Income Food Deficit Countries', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Melanesia', 'Mexico', 'Micronesia', 'Micronesia (Federated States of)', 'Middle Africa', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Net Food Importing Developing Countries', 'Netherlands (Kingdom of the)', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'North Macedonia', 'Northern Africa', 'Northern America', 'Northern Europe', 'Norway', 'Oceania', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Polynesia', 'Portugal', 'Puerto Rico', 'Qatar', 'Republic of Korea', 'Republic of Moldova', 'Romania', 'Russian Federation', 'Rwanda', 'Réunion', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Serbia and Montenegro', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Small Island Developing States', 'Solomon Islands', 'Somalia', 'South Africa', 'South America', 'South Sudan', 'South-eastern Asia', 'Southern Africa', 'Southern Asia', 'Southern Europe', 'Spain', 'Sri Lanka', 'Sudan', 'Sudan (former)', 'Suriname', 'Sweden', 'Switzerland', 'Syrian Arab Republic', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkmenistan', 'Tuvalu', 'Türkiye', 'USSR', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom of Great Britain and Northern Ireland', 'United Republic of Tanzania', 'United States of America', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela (Bolivarian Republic of)', 'Viet Nam', 'Western Africa', 'Western Asia', 'Western Europe', 'World', 'Yemen', 'Yugoslav SFR', 'Zambia', 'Zimbabwe'];

const CROPS = ['Abaca, manila hemp, raw', 'Agave fibres, raw, n.e.c.', 'Almonds, in shell', 'Anise, badian, coriander, cumin, caraway, fennel and juniper berries, raw', 'Apples', 'Apricots', 'Areca nuts', 'Artichokes', 'Asparagus', 'Avocados', 'Bambara beans, dry', 'Bananas', 'Barley', 'Beans, dry', 'Blueberries', 'Broad beans and horse beans, dry', 'Broad beans and horse beans, green', 'Buckwheat', 'Cabbages', 'Canary seed', 'Cantaloupes and other melons', 'Carrots and turnips', 'Cashew nuts, in shell', 'Cashewapple', 'Cassava leaves', 'Cassava, fresh', 'Castor oil seeds', 'Cauliflowers and broccoli', 'Cereals n.e.c.', 'Cereals, primary', 'Cherries', 'Chestnuts, in shell', 'Chick peas, dry', 'Chicory roots', 'Chillies and peppers, dry (Capsicum spp., Pimenta spp.), raw', 'Chillies and peppers, green (Capsicum spp. and Pimenta spp.)', 'Cinnamon and cinnamon-tree flowers, raw', 'Citrus Fruit, Total', 'Cloves (whole stems), raw', 'Cocoa beans', 'Coconuts, in shell', 'Coffee, green', 'Cow peas, dry', 'Cranberries', 'Cucumbers and gherkins', 'Currants', 'Dates', 'Edible roots and tubers with high starch or inulin content, n.e.c., fresh', 'Eggplants (aubergines)', 'Fibre Crops, Fibre Equivalent', 'Figs', 'Flax, raw or retted', 'Fonio', 'Fruit Primary', 'Ginger, raw', 'Gooseberries', 'Grapes', 'Green corn (maize)', 'Green garlic', 'Groundnuts, excluding shelled', 'Hazelnuts, in shell', 'Hempseed', 'Hop cones', 'Jojoba seeds', 'Jute, raw or retted', 'Kapok fruit', 'Karite nuts (sheanuts)', 'Kenaf, and other textile bast fibres, raw or retted', 'Kiwi fruit', 'Kola nuts', 'Leeks and other alliaceous vegetables', 'Lemons and limes', 'Lentils, dry', 'Lettuce and chicory', 'Linseed', 'Locust beans (carobs)', 'Lupins', 'Maize (corn)', 'Mangoes, guavas and mangosteens', 'Maté leaves', 'Melonseed', 'Millet', 'Mixed grain', 'Mustard seed', 'Natural rubber in primary forms', 'Nutmeg, mace, cardamoms, raw', 'Oats', 'Oil palm fruit', 'Oilcrops, Cake Equivalent', 'Oilcrops, Oil Equivalent', 'Okra', 'Olives', 'Onions and shallots, dry (excluding dehydrated)', 'Onions and shallots, green', 'Oranges', 'Other beans, green', 'Other berries and fruits of the genus vaccinium n.e.c.', 'Other citrus fruit, n.e.c.', 'Other fibre crops, raw, n.e.c.', 'Other fruits, n.e.c.', 'Other nuts (excluding wild edible nuts and groundnuts), in shell, n.e.c.', 'Other oil seeds, n.e.c.', 'Other pome fruits', 'Other pulses n.e.c.', 'Other stimulant, spice and aromatic crops, n.e.c.', 'Other stone fruits', 'Other sugar crops n.e.c.', 'Other tropical fruits, n.e.c.', 'Other vegetables, fresh n.e.c.', 'Papayas', 'Peaches and nectarines', 'Pears', 'Peas, dry', 'Peas, green', 'Pepper (Piper spp.), raw', 'Peppermint, spearmint', 'Persimmons', 'Pigeon peas, dry', 'Pineapples', 'Pistachios, in shell', 'Plantains and cooking bananas', 'Plums and sloes', 'Pomelos and grapefruits', 'Poppy seed', 'Potatoes', 'Pulses, Total', 'Pumpkins, squash and gourds', 'Pyrethrum, dried flowers', 'Quinces', 'Quinoa', 'Ramie, raw or retted', 'Rape or colza seed', 'Raspberries', 'Rice', 'Roots and Tubers, Total', 'Rye', 'Safflower seed', 'Seed cotton, unginned', 'Sesame seed', 'Sisal, raw', 'Sorghum', 'Sour cherries', 'Soya beans', 'Spinach', 'Strawberries', 'String beans', 'Sugar Crops Primary', 'Sugar beet', 'Sugar cane', 'Sunflower seed', 'Sweet potatoes', 'Tallowtree seeds', 'Tangerines, mandarins, clementines', 'Taro', 'Tea leaves', 'Tomatoes', 'Treenuts, Total', 'Triticale', 'True hemp, raw or retted', 'Tung nuts', 'Unmanufactured tobacco', 'Vanilla, raw', 'Vegetables Primary', 'Vetches', 'Walnuts, in shell', 'Watermelons', 'Wheat', 'Yams', 'Yautia'];

interface FuturePredictionCardProps {
    className?: string;
}

/**
 * FuturePredictionCard
 * 
 * Component for single future yield predictions.
 * Allows users to quickly predict yield for a specific country, crop, and future year.
 */
const FuturePredictionCard: React.FC<FuturePredictionCardProps> = ({ className = "" }) => {
    const { t, i18n } = useTranslation();
    
    const [country, setCountry] = useState('');
    const [crop, setCrop] = useState('');
    const [year, setYear] = useState(new Date().getFullYear() + 1); // Default to next year
    const [prediction, setPrediction] = useState<AiPredictionResponse | null>(null);
    const [loading, setLoading] = useState(false);

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

    // Check if form is valid
    const isFormValid = country && crop && year >= 2025 && year <= 2050;

    // Get prediction
    const handlePredict = async () => {
        if (!isFormValid) return;

        setLoading(true);
        try {
            const result = await yieldApi.predictGlobal(country, year, crop);
            setPrediction(result);
        } catch (error) {
            console.error('Prediction error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Clear prediction when inputs change
    React.useEffect(() => {
        setPrediction(null);
    }, [country, crop, year]);

    // Format numbers
    const formatYield = (value: number) => {
        return value.toLocaleString(i18n.language === 'en' ? 'en-US' : 'ro-RO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Get confidence icon and color
    const getConfidenceDisplay = (level: ConfidenceLevel) => {
        const colors = {
            [ConfidenceLevel.HIGH]: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
            [ConfidenceLevel.MEDIUM]: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
            [ConfidenceLevel.LOW]: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
            [ConfidenceLevel.VERY_LOW]: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' }
        };
        return colors[level] || colors[ConfidenceLevel.LOW];
    };

    return (
        <Card className={`${className}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t('futurePrediction.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Country Selection */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <Globe className="w-4 h-4" />
                            {t('futurePrediction.labels.country')}
                        </Label>
                        <SearchSelect
                            options={countryOptions}
                            placeholder={t('futurePrediction.placeholders.country')}
                            value={country}
                            onValueChange={(value) => setCountry(value as string || '')}
                            modal={false}
                        />
                    </div>

                    {/* Crop Selection */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <Wheat className="w-4 h-4" />
                            {t('futurePrediction.labels.crop')}
                        </Label>
                        <SearchSelect
                            options={cropOptions}
                            placeholder={t('futurePrediction.placeholders.crop')}
                            value={crop}
                            onValueChange={(value) => setCrop(value as string || '')}
                            modal={false}
                        />
                    </div>

                    {/* Year Input */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="w-4 h-4" />
                            {t('futurePrediction.labels.year')}
                        </Label>
                        <Input
                            type="number"
                            min="2025"
                            max="2050"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear() + 1)}
                            placeholder="2025"
                        />
                    </div>
                </div>

                {/* Predict Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={handlePredict}
                        disabled={!isFormValid || loading}
                        className="px-8 py-2"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{t('futurePrediction.buttons.calculating')}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                <span>{t('futurePrediction.buttons.predict')}</span>
                            </div>
                        )}
                    </Button>
                </div>

                {/* Prediction Result */}
                {prediction && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        {/* Main Result */}
                        <div className="text-center space-y-2">
                            <div className="text-3xl font-bold text-primary">
                                {formatYield(prediction.yield_kg_per_ha)} kg/ha
                            </div>
                            <div className="text-sm text-gray-600">
                                {t('futurePrediction.result.description', {
                                    crop: prediction.crop,
                                    country: prediction.country,
                                    year: prediction.year
                                })}
                            </div>
                        </div>

                        {/* Confidence and Method Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Confidence Level */}
                            <Card className={getConfidenceDisplay(prediction.confidence_level).bg}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        {React.createElement(getConfidenceDisplay(prediction.confidence_level).icon, {
                                            className: `w-5 h-5 ${getConfidenceDisplay(prediction.confidence_level).color}`
                                        })}
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {t('futurePrediction.confidence.title')} {ConfidenceLevelLabels[prediction.confidence_level]}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {t('futurePrediction.confidence.subtitle')}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Prediction Method */}
                            <Card className="bg-blue-50">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Brain className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {PredictionMethodLabels[prediction.prediction_method] || t('futurePrediction.method.default')}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {t('futurePrediction.method.subtitle')}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Additional Insights */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-700">
                                <strong>{t('futurePrediction.interpretation.title')}:</strong>
                                {prediction.confidence_level === ConfidenceLevel.HIGH && (
                                    <span> {t('futurePrediction.interpretation.high')}</span>
                                )}
                                {prediction.confidence_level === ConfidenceLevel.MEDIUM && (
                                    <span> {t('futurePrediction.interpretation.medium')}</span>
                                )}
                                {prediction.confidence_level === ConfidenceLevel.LOW && (
                                    <span> {t('futurePrediction.interpretation.low')}</span>
                                )}
                                {prediction.confidence_level === ConfidenceLevel.VERY_LOW && (
                                    <span> {t('futurePrediction.interpretation.veryLow')}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Help Text */}
                {!prediction && (
                    <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                        <p>{t('futurePrediction.help.suggestion')}</p>
                        <p className="mt-1">{t('futurePrediction.help.period')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FuturePredictionCard;