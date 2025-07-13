
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Package, Truck, Building2 } from 'lucide-react';

const CadastrosSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'fornecedores', label: 'Fornecedores', icon: Building2 },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'transportadoras', label: 'Transportadoras', icon: Truck }
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

export default CadastrosSidebar;
