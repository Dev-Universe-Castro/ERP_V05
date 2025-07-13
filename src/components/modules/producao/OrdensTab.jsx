
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, Factory, Calendar, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import OrdemProducaoModal from './OrdemProducaoModal';

const OrdensTab = () => {
  const { ordensProducao } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState(null);

  const filteredOrdens = ordensProducao?.filter(ordem =>
    ordem.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.produto.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planejada': return 'bg-blue-100 text-blue-800';
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800';
      case 'Concluída': return 'bg-green-100 text-green-800';
      case 'Pausada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar ordens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
        <Button onClick={() => { setSelectedOrdem(null); setShowModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ordem
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredOrdens.map((ordem) => (
          <Card key={ordem.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ordem.numero}</CardTitle>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-600">
                      <Factory className="h-4 w-4 inline mr-1" />
                      {ordem.produto}
                    </span>
                    <span className="text-sm text-gray-600">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {ordem.dataInicio}
                    </span>
                    <span className="text-sm text-gray-600">
                      <User className="h-4 w-4 inline mr-1" />
                      {ordem.responsavel}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(ordem.status)}>
                    {ordem.status}
                  </Badge>
                  <Badge className={getPrioridadeColor(ordem.prioridade)}>
                    {ordem.prioridade}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Quantidade:</span> {ordem.quantidade}
                  </div>
                  <div>
                    <span className="font-medium">Produzido:</span> {ordem.produzido || 0}
                  </div>
                  <div>
                    <span className="font-medium">Progresso:</span> {Math.round((ordem.produzido || 0) / ordem.quantidade * 100)}%
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedOrdem(ordem); setShowModal(true); }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedOrdem(ordem); setShowModal(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <OrdemProducaoModal
          ordem={selectedOrdem}
          onClose={() => { setShowModal(false); setSelectedOrdem(null); }}
        />
      )}
    </div>
  );
};

export default OrdensTab;
