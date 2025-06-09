import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager, IntegratedChartsModule } from 'ag-grid-enterprise';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { Buffer } from 'buffer';
import { StyledEngineProvider } from '@mui/material';

// CSS
import './index.css';
import './custom.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './i18n';

// AG Grid - Register Modules
ModuleRegistry.registerModules([
  AllEnterpriseModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule)
]);

LicenseManager.setLicenseKey(process.env.REACT_APP_AG_GRID_LICENSE_KEY!);

// Polyfill Buffer for react-pdf or other browser-side usage
window.Buffer = window.Buffer || Buffer;

const App = () => (
  <StyledEngineProvider injectFirst>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StyledEngineProvider>
);

export default App;