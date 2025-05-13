import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

const App : React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />    
    </BrowserRouter>
  );
};

export default App;