import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CalculoFolha from './pages/CalculoFolha';
import Administracao from './pages/Administracao';

function App() {
  const [logoError, setLogoError] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg border-b-4 border-redepetro-red">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
                  <div className="flex-shrink-0 flex items-center">
                    {!logoError ? (
                      <img 
                        src="/logo-redepetro.png?v=1" 
                        alt="REDEPETRO Logo" 
                        className="h-16 w-auto max-w-[250px] object-contain"
                        onError={(e) => {
                          console.error('Erro ao carregar logo. Verifique se o arquivo está em /public/logo-redepetro.png');
                          setLogoError(true);
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-redepetro-red rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">R</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="ml-10 flex items-center space-x-1">
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-redepetro-red hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Cálculo
                  </Link>
                  <Link
                    to="/administracao"
                    className="text-gray-700 hover:text-redepetro-red hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Administração
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<CalculoFolha />} />
            <Route path="/administracao" element={<Administracao />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
