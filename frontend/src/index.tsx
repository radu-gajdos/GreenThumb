// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import './custom.css';
// import App from './App';
// import { EventApiModule, ModuleRegistry, ValidationModule } from "ag-grid-community";
// import { AllEnterpriseModule, LicenseManager, IntegratedChartsModule } from "ag-grid-enterprise";
// import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
// import { Buffer } from 'buffer';

// // Adăugăm polyfill pentru Buffer în browser pentru react-pdf
// window.Buffer = window.Buffer || require('buffer').Buffer;
// window.Buffer = window.Buffer || Buffer;

// ModuleRegistry.registerModules([
//   AllEnterpriseModule,
//   IntegratedChartsModule.with(AgChartsEnterpriseModule)
// ]);

// LicenseManager.setLicenseKey(process.env.REACT_APP_AG_GRID_LICENSE_KEY!);

// const root = ReactDOM.createRoot(
//   document.getElementById('root') as HTMLElement
// );

// root.render(
//   // <React.StrictMode>
//     <App />
//   // </React.StrictMode>
// );
