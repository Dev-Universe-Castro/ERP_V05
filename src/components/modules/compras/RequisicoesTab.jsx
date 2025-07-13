
import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import RequisicaoModal from './RequisicaoModal';

const RequisicoesTab = ({ showModal, setShowModal, modalType, setModalType, selectedItem, setSelectedItem }) => {
  const { data, addItem, updateItem, deleteItem, generateNumber, createDespesaPrevisao } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const requisicoes = data.requisicoes || [];

  const filteredRequisicoes = useMemo(() => {
    let filtered = requisicoes.filter(item => {
      const searchFields = [item.numero, item.observacoes, item.solicitante];
      return searchFields.some(field => 
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    return filtered;
  }, [requisicoes, searchTerm, filterStatus]);

  const handleNovaRequisicao = () => {
    setModalType('requisicao');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditRequisicao = (requisicao) => {
    setModalType('requisicao');
    setSelectedItem(requisicao);
    setShowModal(true);
  };

  const handleDeleteRequisicao = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta requisição?')) {
      deleteItem('requisicoes', id);
      toast({
        title: "Requisição excluída",
        description: "Requisição excluída com sucesso.",
      });
    }
  };

  const handleAprovarRequisicao = (requisicao) => {
    updateItem('requisicoes', requisicao.id, {
      status: 'aprovada',
      aprovacao: {
        status: 'aprovada',
        aprovadoPor: 'Usuário Atual',
        dataAprovacao: new Date().toISOString(),
        observacoes: 'Aprovado via sistema'
      }
    });

    createDespesaPrevisao(requisicao);
    
    toast({
      title: "Requisição aprovada",
      description: "Requisição aprovada e previsão de despesa criada.",
    });
  };

  const handleRejeitarRequisicao = (requisicao) => {
    const observacoes = prompt('Motivo da rejeição:');
    if (observacoes) {
      updateItem('requisicoes', requisicao.id, {
        status: 'rejeitada',
        aprovacao: {
          status: 'rejeitada',
          aprovadoPor: 'Usuário Atual',
          dataAprovacao: new Date().toISOString(),
          observacoes
        }
      });

      toast({
        title: "Requisição rejeitada",
        description: "Requisição rejeitada com sucesso.",
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'pendente': 'secondary',
      'aprovada': 'default',
      'rejeitada': 'destructive',
      'em-cotacao': 'outline'
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Pesquisar requisições..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovada">Aprovada</option>
          <option value="em-cotacao">Em Cotação</option>
          <option value="rejeitada">Rejeitada</option>
        </select>

        <Button onClick={handleNovaRequisicao}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Requisição
        </Button>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Número</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Solicitante</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Departamento</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Data</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="border-b px-4 py-3 text-center font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisicoes.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="border-b px-4 py-3">{req.numero}</td>
                    <td className="border-b px-4 py-3">{req.solicitante}</td>
                    <td className="border-b px-4 py-3">{req.departamento}</td>
                    <td className="border-b px-4 py-3">
                      {new Date(req.dataRequisicao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="border-b px-4 py-3">
                      <Badge variant={getStatusBadge(req.status)}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="border-b px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditRequisicao(req)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {req.status === 'pendente' && (
                          <>
                            <Button size="sm" onClick={() => handleAprovarRequisicao(req)}>
                              Aprovar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejeitarRequisicao(req)}>
                              Rejeitar
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleDeleteRequisicao(req.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && modalType === 'requisicao' && (
        <RequisicaoModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
          requisicao={selectedItem}
        />
      )}
    </div>
  );
};

export default RequisicoesTab;
