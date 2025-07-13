
import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, BarChart3 } from 'lucide-react';

const FinanceiroSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'receitas', label: 'Receitas', icon: TrendingUp },
    { id: 'despesas', label: 'Despesas', icon: TrendingDown },
    { id: 'contas', label: 'Contas Bancárias', icon: CreditCard },
    { id: 'fluxo', label: 'Fluxo de Caixa', icon: DollarSign }
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

export default FinanceiroSidebar;
