
import React from 'react';
import { Button } from '@/components/ui/button';
import { Factory, Calendar, Users, BarChart3, Settings, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const ProducaoSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ordens', label: 'Ordens de Produção', icon: Factory },
    { id: 'planejamento', label: 'Planejamento', icon: Calendar },
    { id: 'recursos', label: 'Recursos', icon: Users },
    { id: 'qualidade', label: 'Controle de Qualidade', icon: CheckCircle },
    { id: 'manutencao', label: 'Manutenção', icon: Settings },
    { id: 'monitoramento', label: 'Monitoramento', icon: Clock }
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

export default ProducaoSidebar;
