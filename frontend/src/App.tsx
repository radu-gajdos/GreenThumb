// index.tsx (sau main entry point)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager, IntegratedChartsModule } from 'ag-grid-enterprise';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { Buffer } from 'buffer';

// CSS
import './index.css';
import './custom.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import exp from 'constants';
import { LanguageProvider } from './contexts/LanguageContext';
import './i18n';

// AG Grid - Register Modules
ModuleRegistry.registerModules([
  AllEnterpriseModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule)
]);

LicenseManager.setLicenseKey(process.env.REACT_APP_AG_GRID_LICENSE_KEY!);

// Polyfill Buffer for react-pdf or other browser-side usage
window.Buffer = window.Buffer || Buffer;

// Main App Component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter >
  );
};

// Render
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // You can wrap with <React.StrictMode> if desired
  <App />
);

export default App;