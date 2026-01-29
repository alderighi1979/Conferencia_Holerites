import React from 'react';

function Logo({ className = "h-12" }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-redepetro-red rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">R</span>
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-redepetro-red leading-tight">
          REDEPETRO
        </h1>
        <span className="text-xs text-gray-600">Conferência de Folha</span>
      </div>
    </div>
  );
}

export default Logo;
