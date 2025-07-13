
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCheck, Calendar, DollarSign, FileText, BarChart3 } from 'lucide-react';

const RHSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'funcionarios', label: 'Funcionários', icon: UserCheck },
    { id: 'ponto', label: 'Controle de Ponto', icon: Calendar },
    { id: 'folha', label: 'Folha de Pagamento', icon: DollarSign },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 }
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

export default RHSidebar;
