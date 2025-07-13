"use client"

import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import RHSidebar from './rh/RHSidebar';
import RHStats from './rh/RHStats';
import FuncionariosTab from './rh/FuncionariosTab';
import PontoTab from './rh/PontoTab';
import FolhaTab from './rh/FolhaTab';
import DocumentosTab from './rh/DocumentosTab';
import RelatoriosTab from './rh/RelatoriosTab';

const RHModule = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { searchItems } = useData();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <RHStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Funcionários por Departamento</h3>
                <p className="text-gray-600">Gráfico de distribuição por área...</p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Aniversariantes do Mês</h3>
                <p className="text-gray-600">Lista de aniversariantes...</p>
              </div>
            </div>
          </div>
        );
      case 'funcionarios':
        return <FuncionariosTab />;
      case 'ponto':
        return <PontoTab />;
      case 'folha':
        return <FolhaTab />;
      case 'documentos':
        return <DocumentosTab />;
      case 'relatorios':
        return <RelatoriosTab />;
      default:
        return (
          <div className="space-y-6">
            <RHStats />
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recursos Humanos</h2>
        <RHSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default RHModule;