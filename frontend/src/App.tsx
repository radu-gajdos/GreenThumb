import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Import the i18n configuration
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Auth/SignIn'

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
};

export default App;
