
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Settings, 
  PieChart, 
  TrendingUp,
  Shield,
  Receipt,
  Send
} from 'lucide-react';

const FaturamentoSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'nfes', label: 'Notas Fiscais', icon: FileText },
    { id: 'transmissao', label: 'Transmissão', icon: Send },
    { id: 'configuracao', label: 'Configuração', icon: Settings },
    { id: 'certificados', label: 'Certificados', icon: Shield },
    { id: 'relatorios', label: 'Relatórios', icon: PieChart }
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

export default FaturamentoSidebar;
