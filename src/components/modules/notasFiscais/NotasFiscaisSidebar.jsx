
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Settings, 
  CheckCircle, 
  Bot,
  Activity,
  Archive
} from 'lucide-react';

const NotasFiscaisSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'nfes', label: 'NFes Recebidas', icon: FileText },
    { id: 'manifestacao', label: 'Manifestação', icon: CheckCircle },
    { id: 'configuracao', label: 'Config. Bot', icon: Settings },
    { id: 'logs', label: 'Logs SEFAZ', icon: Activity },
    { id: 'arquivo', label: 'Arquivo', icon: Archive }
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

export default NotasFiscaisSidebar;
