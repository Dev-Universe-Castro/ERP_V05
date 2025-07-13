
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';

const NfeModal = ({ isOpen, onClose, onSave, loading }) => {
  const { data } = useData();
  const [dadosNfe, setDadosNfe] = useState({
    serie: '001',
    naturezaOperacao: 'Venda',
    destinatario: {
      nome: '',
      documento: '',
      email: '',
      telefone: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cep: '',
        cidade: '',
        uf: '',
        codigoMunicipio: ''
      }
    },
    itens: [],
    observacoes: ''
  });

  const [novoItem, setNovoItem] = useState({
    produtoId: '',
    produto: '',
    ncm: '',
    cfop: '5102',
    quantidade: 1,
    valorUnitario: 0,
    desconto: 0,
    aliquotaIcms: 18,
    aliquotaIpi: 0,
    aliquotaPis: 1.65,
    aliquotaCofins: 7.6
  });

  const [clienteSelecionado, setClienteSelecionado] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setDadosNfe({
        serie: '001',
        naturezaOperacao: 'Venda',
        destinatario: {
          nome: '',
          documento: '',
          email: '',
          telefone: '',
          endereco: {
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cep: '',
            cidade: '',
            uf: '',
            codigoMunicipio: ''
          }
        },
        itens: [],
        observacoes: ''
      });
      setNovoItem({
        produtoId: '',
        produto: '',
        ncm: '',
        cfop: '5102',
        quantidade: 1,
        valorUnitario: 0,
        desconto: 0,
        aliquotaIcms: 18,
        aliquotaIpi: 0,
        aliquotaPis: 1.65,
        aliquotaCofins: 7.6
      });
      setClienteSelecionado('');
    }
  }, [isOpen]);

  const handleClienteChange = (clienteId) => {
    setClienteSelecionado(clienteId);
    const cliente = data.clientes.find(c => c.id === parseInt(clienteId));
    if (cliente) {
      setDadosNfe(prev => ({
        ...prev,
        destinatario: {
          nome: cliente.nome,
          documento: cliente.cnpj || cliente.cpf || '',
          email: cliente.email,
          telefone: cliente.telefone,
          endereco: {
            logradouro: cliente.endereco?.logradouro || '',
            numero: cliente.endereco?.numero || '',
            complemento: cliente.endereco?.complemento || '',
            bairro: cliente.endereco?.bairro || '',
            cep: cliente.endereco?.cep || '',
            cidade: cliente.cidade || '',
            uf: cliente.endereco?.uf || 'SP',
            codigoMunicipio: cliente.endereco?.codigoMunicipio || '3550308'
          }
        }
      }));
    }
  };

  const handleProdutoChange = (produtoId) => {
    const produto = data.produtos.find(p => p.id === parseInt(produtoId));
    if (produto) {
      setNovoItem(prev => ({
        ...prev,
        produtoId: produto.id,
        produto: produto.nome,
        ncm: produto.ncm || '00000000',
        valorUnitario: produto.preco || 0
      }));
    }
  };

  const adicionarItem = () => {
    if (!novoItem.produtoId || novoItem.quantidade <= 0 || novoItem.valorUnitario <= 0) {
      alert('Preencha todos os campos do item');
      return;
    }

    const valorTotal = novoItem.quantidade * novoItem.valorUnitario - (novoItem.desconto || 0);
    
    setDadosNfe(prev => ({
      ...prev,
      itens: [...prev.itens, {
        ...novoItem,
        valorTotal,
        id: Date.now()
      }]
    }));

    setNovoItem({
      produtoId: '',
      produto: '',
      ncm: '',
      cfop: '5102',
      quantidade: 1,
      valorUnitario: 0,
      desconto: 0,
      aliquotaIcms: 18,
      aliquotaIpi: 0,
      aliquotaPis: 1.65,
      aliquotaCofins: 7.6
    });
  };

  const removerItem = (itemId) => {
    setDadosNfe(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== itemId)
    }));
  };

  const calcularTotais = () => {
    const subtotal = dadosNfe.itens.reduce((acc, item) => acc + item.valorTotal, 0);
    const impostos = dadosNfe.itens.reduce((acc, item) => {
      const valorItem = item.valorTotal;
      const icms = valorItem * (item.aliquotaIcms || 0) / 100;
      const ipi = valorItem * (item.aliquotaIpi || 0) / 100;
      const pis = valorItem * (item.aliquotaPis || 0) / 100;
      const cofins = valorItem * (item.aliquotaCofins || 0) / 100;
      return acc + icms + ipi + pis + cofins;
    }, 0);

    return { subtotal, impostos, total: subtotal + impostos };
  };

  const handleSubmit = () => {
    if (!dadosNfe.destinatario.nome || dadosNfe.itens.length === 0) {
      alert('Preencha os dados do destinatário e adicione pelo menos um item');
      return;
    }

    onSave(dadosNfe);
  };

  const totais = calcularTotais();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-5/6 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Emitir Nova NFe</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dados Gerais */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Série</Label>
                    <Input
                      value={dadosNfe.serie}
                      onChange={(e) => setDadosNfe(prev => ({ ...prev, serie: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Natureza da Operação</Label>
                    <select
                      value={dadosNfe.naturezaOperacao}
                      onChange={(e) => setDadosNfe(prev => ({ ...prev, naturezaOperacao: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="Venda">Venda</option>
                      <option value="Remessa">Remessa</option>
                      <option value="Devolução">Devolução</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Destinatário */}
            <Card>
              <CardHeader>
                <CardTitle>Destinatário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Cliente</Label>
                  <select
                    value={clienteSelecionado}
                    onChange={(e) => handleClienteChange(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Selecione um cliente</option>
                    {data.clientes?.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome/Razão Social</Label>
                    <Input
                      value={dadosNfe.destinatario.nome}
                      onChange={(e) => setDadosNfe(prev => ({
                        ...prev,
                        destinatario: { ...prev.destinatario, nome: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>CNPJ/CPF</Label>
                    <Input
                      value={dadosNfe.destinatario.documento}
                      onChange={(e) => setDadosNfe(prev => ({
                        ...prev,
                        destinatario: { ...prev.destinatario, documento: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={dadosNfe.destinatario.email}
                      onChange={(e) => setDadosNfe(prev => ({
                        ...prev,
                        destinatario: { ...prev.destinatario, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={dadosNfe.destinatario.telefone}
                      onChange={(e) => setDadosNfe(prev => ({
                        ...prev,
                        destinatario: { ...prev.destinatario, telefone: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Itens */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Itens da NFe</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Adicionar Item */}
              <div className="grid grid-cols-6 gap-4 mb-4 p-4 bg-gray-50 rounded">
                <div>
                  <Label>Produto</Label>
                  <select
                    value={novoItem.produtoId}
                    onChange={(e) => handleProdutoChange(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="">Selecione</option>
                    {data.produtos?.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={novoItem.quantidade}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label>Valor Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={novoItem.valorUnitario}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, valorUnitario: parseFloat(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label>CFOP</Label>
                  <select
                    value={novoItem.cfop}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, cfop: e.target.value }))}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="5102">5102 - Venda</option>
                    <option value="5101">5101 - Venda Produção</option>
                    <option value="6102">6102 - Venda Interestadual</option>
                  </select>
                </div>
                <div>
                  <Label>ICMS %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={novoItem.aliquotaIcms}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, aliquotaIcms: parseFloat(e.target.value) || 0 }))}
                    className="text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={adicionarItem} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Lista de Itens */}
              <div className="space-y-2">
                {dadosNfe.itens.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white border rounded">
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      <div>
                        <p className="font-medium">{item.produto}</p>
                        <p className="text-sm text-gray-600">NCM: {item.ncm}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{item.quantidade}</p>
                        <p className="text-sm text-gray-600">Qtd</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">R$ {item.valorUnitario.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Unit.</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{item.cfop}</p>
                        <p className="text-sm text-gray-600">CFOP</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {item.valorTotal.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Total</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => removerItem(item.id)}
                      className="ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Totais */}
              {dadosNfe.itens.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-lg font-bold">R$ {totais.subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Impostos</p>
                      <p className="text-lg font-bold text-red-600">R$ {totais.impostos.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold text-green-600">R$ {totais.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={dadosNfe.observacoes}
                onChange={(e) => setDadosNfe(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Informações adicionais da NFe..."
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Emitindo...' : 'Emitir NFe'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NfeModal;
