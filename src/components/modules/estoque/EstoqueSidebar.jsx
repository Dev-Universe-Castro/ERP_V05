
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, BarChart3, ArrowUpDown, AlertTriangle, TrendingUp } from 'lucide-react';

const EstoqueSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'posicao', label: 'Posição de Estoque', icon: Package },
    { id: 'movimentacoes', label: 'Movimentações', icon: ArrowUpDown },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'previsoes', label: 'Previsões', icon: TrendingUp }
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

export default EstoqueSidebar;
