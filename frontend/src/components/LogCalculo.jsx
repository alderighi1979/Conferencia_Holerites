import React, { useState } from 'react';

function LogCalculo({ log }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!log || log.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-sm font-medium text-redepetro-red hover:text-redepetro-dark focus:outline-none transition-colors"
      >
        <span className="flex items-center">
          <svg
            className={`mr-2 h-5 w-5 transform transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          Ver Detalhes do Cálculo
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-redepetro-red">
          <div className="space-y-2">
            {log.map((linha, index) => {
              // Detectar se é um título (sem indentação)
              const isTitulo = !linha.startsWith('  ') && !linha.startsWith('    ');
              const isSubtitulo = linha.startsWith('  ') && !linha.startsWith('    ');
              
              if (linha.trim() === '') {
                return <div key={index} className="h-2" />;
              }

              return (
                <p
                  key={index}
                  className={`text-sm ${
                    isTitulo
                      ? 'font-semibold text-gray-900'
                      : isSubtitulo
                      ? 'font-medium text-gray-800 ml-2'
                      : 'text-gray-700 ml-4'
                  }`}
                >
                  {linha}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LogCalculo;
