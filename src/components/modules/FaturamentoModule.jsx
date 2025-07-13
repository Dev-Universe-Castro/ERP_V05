
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  FileText, 
  Send, 
  X, 
  Eye, 
  Download,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

import { useFaturamento } from '../../hooks/useFaturamento';
import { useAuditLog } from '../../hooks/useAuditLog';
import { useWorkflow } from '../../hooks/useWorkflow';
import { useData } from '../../contexts/DataContext';
import FaturamentoSidebar from './faturamento/FaturamentoSidebar';
import FaturamentoStats from './faturamento/FaturamentoStats';
import NfeModal from './faturamento/NfeModal';
import ConfiguracaoModal from './faturamento/ConfiguracaoModal';
import CancelamentoModal from './faturamento/CancelamentoModal';
import CompliancePanel from '../common/CompliancePanel';

// Regras de compliance para faturamento
const complianceRules = [
  {
    id: 'nfe_transmission',
    name: 'Transmissão NFe',
    description: 'NFes devem ser transmitidas em até 24h',
    category: 'Fiscal'
  },
  {
    id: 'certificate_validity',
    name: 'Validade do Certificado',
    description: 'Certificado digital deve estar válido',
    category: 'Segurança'
  },
  {
    id: 'tax_calculation',
    name: 'Cálculo de Impostos',
    description: 'Impostos devem estar calculados corretamente',
    category: 'Fiscal'
  },
  {
    id: 'customer_data',
    name: 'Dados do Cliente',
    description: 'CNPJ/CPF válidos e endereço completo',
    category: 'Compliance'
  },
  {
    id: 'product_classification',
    name: 'Classificação Fiscal',
    description: 'Produtos com NCM e CFOP corretos',
    category: 'Fiscal'
  }
];

export default function FaturamentoModule({ activeSection, onSectionChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedNfe, setSelectedNfe] = useState(null);
  const [showNfeModal, setShowNfeModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const faturamento = useFaturamento();
  const { logAction } = useAuditLog();
  const { executeWorkflow, getActiveWorkflows } = useWorkflow();
  const { searchItems } = useData();

  // Buscar dados
  const nfes = faturamento.nfes.getAll();
  const configuracao = faturamento.configuracaoNfe;
  const estatisticas = faturamento.getEstatisticas();

  // Filtrar NFes
  const nfesFiltradas = useMemo(() => {
    let filtered = nfes;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(nfe =>
        nfe.numeroNfe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nfe.destinatario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nfe.chaveAcesso?.includes(searchTerm)
      );
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(nfe => nfe.status === filterStatus);
    }

    return filtered.sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao));
  }, [nfes, searchTerm, filterStatus]);

  const handleNovaNet = async (dados) => {
    setLoading(true);
    try {
      const nfe = await faturamento.emitirNfe(dados);
      if (nfe) {
        setShowNfeModal(false);
        logAction('create', 'nfes', nfe.id, { numero: nfe.numeroNfe });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransmitir = async (nfeId) => {
    setLoading(true);
    try {
      await faturamento.transmitirNfe(nfeId);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (nfeId, justificativa) => {
    setLoading(true);
    try {
      const resultado = await faturamento.cancelarNfe(nfeId, justificativa);
      if (resultado?.sucesso) {
        setShowCancelModal(false);
        setSelectedNfe(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'digitacao': { variant: 'secondary', label: 'Digitação' },
      'transmitindo': { variant: 'default', label: 'Transmitindo' },
      'autorizada': { variant: 'default', label: 'Autorizada', className: 'bg-green-100 text-green-800' },
      'rejeitada': { variant: 'destructive', label: 'Rejeitada' },
      'cancelada': { variant: 'outline', label: 'Cancelada' }
    };

    const config = statusMap[status] || { variant: 'secondary', label: status };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const sectionTitle = {
    'dashboard': 'Dashboard',
    'nfes': 'Notas Fiscais',
    'configuracao': 'Configuração',
    'relatorios': 'Relatórios'
  }[activeSection] || 'Faturamento';

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <FaturamentoStats {...estatisticas} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                    NFes Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nfes.filter(nfe => nfe.status === 'digitacao').slice(0, 5).map(nfe => (
                      <div key={nfe.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{nfe.numeroNfe}</p>
                          <p className="text-sm text-gray-600">{nfe.destinatario?.nome}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleTransmitir(nfe.id)}
                          disabled={loading}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Transmitir
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <CompliancePanel rules={complianceRules} />
            </div>
          </div>
        );

      case 'nfes':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por número, cliente ou chave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">Todos os status</option>
                  <option value="digitacao">Digitação</option>
                  <option value="transmitindo">Transmitindo</option>
                  <option value="autorizada">Autorizada</option>
                  <option value="rejeitada">Rejeitada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <Button onClick={() => setShowNfeModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova NFe
              </Button>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Número</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Cliente</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Valor</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Data Emissão</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {nfesFiltradas.map((nfe) => (
                      <tr key={nfe.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{nfe.numeroNfe}</td>
                        <td className="px-4 py-3 text-sm">{nfe.destinatario?.nome}</td>
                        <td className="px-4 py-3 text-sm">
                          R$ {(nfe.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(nfe.dataEmissao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getStatusBadge(nfe.status)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {nfe.status === 'digitacao' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleTransmitir(nfe.id)}
                                disabled={loading}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {nfe.status === 'autorizada' && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedNfe(nfe);
                                    setShowCancelModal(true);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'configuracao':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuração da NFe
                </CardTitle>
              </CardHeader>
              <CardContent>
                {configuracao ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Razão Social</label>
                        <p className="text-sm text-gray-600">{configuracao.razaoSocial}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">CNPJ</label>
                        <p className="text-sm text-gray-600">{configuracao.cnpj}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Ambiente</label>
                        <Badge variant={configuracao.ambiente === '1' ? 'default' : 'secondary'}>
                          {configuracao.ambiente === '1' ? 'Produção' : 'Homologação'}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Série NFe</label>
                        <p className="text-sm text-gray-600">{configuracao.serie}</p>
                      </div>
                    </div>
                    <Button onClick={() => setShowConfigModal(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Configuração
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Configuração Necessária</h3>
                    <p className="text-gray-600 mb-4">
                      Configure os dados da empresa para emitir NFes.
                    </p>
                    <Button onClick={() => setShowConfigModal(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar Agora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
            <p className="text-gray-600">Esta seção estará disponível em breve.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <FaturamentoSidebar 
          activeSection={activeSection} 
          setActiveSection={onSectionChange} 
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{sectionTitle}</h1>
        </div>

        {renderContent()}
      </div>

      {/* Modais */}
      <NfeModal
        isOpen={showNfeModal}
        onClose={() => setShowNfeModal(false)}
        onSave={handleNovaNet}
        loading={loading}
      />

      <ConfiguracaoModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={faturamento.salvarConfiguracaoNfe}
        configuracao={configuracao}
        loading={loading}
      />

      <CancelamentoModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedNfe(null);
        }}
        onSave={handleCancelar}
        nfe={selectedNfe}
        loading={loading}
      />
    </div>
  );
}
