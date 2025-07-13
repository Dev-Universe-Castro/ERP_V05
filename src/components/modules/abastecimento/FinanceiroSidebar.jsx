
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  FileText,
  Calculator,
  CreditCard,
  Wallet
} from 'lucide-react';

const FinanceiroSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'custos', label: 'Custos por Equipamento', icon: Calculator },
    { id: 'orcamento', label: 'Orçamento vs Real', icon: TrendingUp },
    { id: 'fornecedores', label: 'Análise Fornecedores', icon: CreditCard },
    { id: 'projecoes', label: 'Projeções', icon: TrendingDown },
    { id: 'relatorios', label: 'Relatórios Financeiros', icon: FileText }
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
