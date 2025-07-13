
import React from 'react';
import { Button } from '@/components/ui/button';
import { Fuel, Truck, Gauge, BarChart3, AlertTriangle } from 'lucide-react';

const AbastecimentoSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'equipamentos', label: 'Equipamentos', icon: Truck },
    { id: 'abastecimentos', label: 'Abastecimentos', icon: Fuel },
    { id: 'consumo', label: 'Análise de Consumo', icon: Gauge },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle }
  ];

  return (
    <nav className="space-y-2">
      {sections.map((section) => {
        const IconComponent = section.icon;
        return (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection(section.id)}
          >
            <IconComponent className="h-4 w-4 mr-2" />
            {section.label}
          </Button>
        );
      })}
    </nav>
  );
};

export default AbastecimentoSidebar;
