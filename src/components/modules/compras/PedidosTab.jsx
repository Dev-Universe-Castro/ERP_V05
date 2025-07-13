
import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import PedidoModal from './PedidoModal';

const PedidosTab = ({ showModal, setShowModal, modalType, setModalType, selectedItem, setSelectedItem }) => {
  const { data, addItem, updateItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const pedidos = data.pedidos || [];
  const fornecedores = data.fornecedores || [];

  const filteredPedidos = useMemo(() => {
    let filtered = pedidos.filter(item => {
      const searchFields = [item.numero, item.observacoes];
      return searchFields.some(field => 
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    return filtered;
  }, [pedidos, searchTerm, filterStatus]);

  const handleNovoPedido = () => {
    setModalType('pedido');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditPedido = (pedido) => {
    setModalType('pedido');
    setSelectedItem(pedido);
    setShowModal(true);
  };

  const handleDeletePedido = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      deleteItem('pedidos', id);
      toast({
        title: "Pedido excluído",
        description: "Pedido excluído com sucesso.",
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'enviado': 'secondary',
      'confirmado': 'default',
      'entregue': 'default',
      'cancelado': 'destructive'
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Pesquisar pedidos..."
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
          <option value="enviado">Enviado</option>
          <option value="confirmado">Confirmado</option>
          <option value="entregue">Entregue</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <Button onClick={handleNovoPedido}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
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
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Fornecedor</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Data Emissão</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Data Previsão</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Valor Total</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="border-b px-4 py-3 text-center font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPedidos.map((pedido) => {
                  const fornecedor = fornecedores.find(f => f.id === pedido.fornecedorId);
                  return (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-3">{pedido.numero}</td>
                      <td className="border-b px-4 py-3">{fornecedor?.nome || '-'}</td>
                      <td className="border-b px-4 py-3">
                        {new Date(pedido.dataEmissao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="border-b px-4 py-3">
                        {new Date(pedido.dataPrevisao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="border-b px-4 py-3">
                        R$ {(pedido.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border-b px-4 py-3">
                        <Badge variant={getStatusBadge(pedido.status)}>
                          {pedido.status}
                        </Badge>
                      </td>
                      <td className="border-b px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditPedido(pedido)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeletePedido(pedido.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && modalType === 'pedido' && (
        <PedidoModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
          pedido={selectedItem}
        />
      )}
    </div>
  );
};

export default PedidosTab;
