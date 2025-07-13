
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, X, Eye, User } from 'lucide-react';

const WorkflowSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'minhas-requisicoes', label: 'Minhas Requisições', icon: User },
    { id: 'pendentes', label: 'Pendentes de Aprovação', icon: Clock },
    { id: 'aprovadas', label: 'Aprovadas', icon: CheckCircle },
    { id: 'rejeitadas', label: 'Rejeitadas', icon: X },
    { id: 'historico', label: 'Histórico Completo', icon: Eye }
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

export default WorkflowSidebar;
