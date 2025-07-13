
import React from 'react';
import { FileText, ShoppingCart, CheckCircle, User, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ComprasSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'requisicoes', label: 'Requisições', icon: FileText },
    { id: 'cotacoes', label: 'Cotações', icon: ShoppingCart },
    { id: 'pedidos', label: 'Pedidos', icon: CheckCircle },
    { id: 'aprovacoes', label: 'Aprovações', icon: User }
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

export default ComprasSidebar;
