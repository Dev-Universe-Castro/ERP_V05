
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  RefreshCw, 
  FileText, 
  Download, 
  CheckCircle, 
  Eye, 
  Settings,
  AlertTriangle,
  Clock,
  Bot,
  Archive
} from 'lucide-react';

import { useNotasFiscais } from '../../hooks/useNotasFiscais';
import { useAuditLog } from '../../hooks/useAuditLog';
import { useWorkflow } from '../../hooks/useWorkflow';
import { useData } from '../../contexts/DataContext';
import NotasFiscaisSidebar from './notasFiscais/NotasFiscaisSidebar';
import NotasFiscaisStats from './notasFiscais/NotasFiscaisStats';
import ConfiguracaoBotModal from './notasFiscais/ConfiguracaoBotModal';
import ManifestacaoModal from './notasFiscais/ManifestacaoModal';
import DetalhesNfeModal from './notasFiscais/DetalhesNfeModal';
import CompliancePanel from '../common/CompliancePanel';

// Regras de compliance para notas fiscais
const complianceRules = [
  {
    id: 'manifestacao_prazo',
    name: 'Manifestação no Prazo',
    description: 'NFes devem ser manifestadas em até 120 horas',
    category: 'Fiscal'
  },
  {
    id: 'xml_arquivamento',
    name: 'Arquivamento XML',
    description: 'XMLs devem ser baixados e arquivados',
    category: 'Compliance'
  },
  {
    id: 'busca_automatica',
    name: 'Busca Automática',
    description: 'Bot deve executar busca pelo menos diariamente',
    category: 'Operacional'
  },
  {
    id: 'conferencia_dados',
    name: 'Conferência de Dados',
    description: 'Dados do emitente e valores devem ser conferidos',
    category: 'Controle'
  }
];

export default function NotasFiscaisModule({ activeSection, onSectionChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSituacao, setFilterSituacao] = useState('all');
  const [filterManifestacao, setFilterManifestacao] = useState('all');
  const [selectedNfe, setSelectedNfe] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showManifestacaoModal, setShowManifestacaoModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buscandoSefaz, setBuscandoSefaz] = useState(false);

  const notasFiscais = useNotasFiscais();
  const { logAction } = useAuditLog();
  const { executeWorkflow, getActiveWorkflows } = useWorkflow();
  const { searchItems } = useData();

  // Buscar dados
  const nfes = notasFiscais.nfesRecebidas.getAll();
  const configuracaoBot = notasFiscais.configuracaoBot;
  const estatisticas = notasFiscais.getEstatisticas();

  // Filtrar NFes
  const nfesFiltradas = useMemo(() => {
    let filtered = nfes;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(nfe =>
        nfe.numeroNfe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nfe.emitente?.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nfe.chaveAcesso?.includes(searchTerm)
      );
    }

    // Filtro por situação
    if (filterSituacao !== 'all') {
      filtered = filtered.filter(nfe => nfe.situacao === filterSituacao);
    }

    // Filtro por manifestação
    if (filterManifestacao !== 'all') {
      filtered = filtered.filter(nfe => nfe.statusManifestacao === filterManifestacao);
    }

    return filtered.sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao));
  }, [nfes, searchTerm, filterSituacao, filterManifestacao]);

  const handleBuscarSefaz = async () => {
    setBuscandoSefaz(true);
    try {
      const dataFim = new Date();
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 30); // Últimos 30 dias

      await notasFiscais.buscarNfesSefaz(dataInicio, dataFim);
    } finally {
      setBuscandoSefaz(false);
    }
  };

  const handleManifestacao = async (nfeId, tipoManifestacao, justificativa) => {
    setLoading(true);
    try {
      const resultado = await notasFiscais.manifestarNfe(nfeId, tipoManifestacao, justificativa);
      if (resultado?.sucesso) {
        setShowManifestacaoModal(false);
        setSelectedNfe(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXml = async (nfeId) => {
    setLoading(true);
    try {
      await notasFiscais.downloadXmlNfe(nfeId);
    } finally {
      setLoading(false);
    }
  };

  const getSituacaoBadge = (situacao) => {
    const situacaoMap = {
      'autorizada': { variant: 'default', label: 'Autorizada', className: 'bg-green-100 text-green-800' },
      'cancelada': { variant: 'outline', label: 'Cancelada' },
      'rejeitada': { variant: 'destructive', label: 'Rejeitada' }
    };

    const config = situacaoMap[situacao] || { variant: 'secondary', label: situacao };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getManifestacaoBadge = (status) => {
    const statusMap = {
      'pendente': { variant: 'secondary', label: 'Pendente' },
      'manifestada': { variant: 'default', label: 'Manifestada', className: 'bg-blue-100 text-blue-800' },
      'vencida': { variant: 'destructive', label: 'Vencida' }
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
    'nfes': 'Notas Fiscais Recebidas',
    'manifestacao': 'Manifestação',
    'configuracao': 'Configuração do Bot',
    'logs': 'Logs da SEFAZ'
  }[activeSection] || 'Notas Fiscais';

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <NotasFiscaisStats {...estatisticas} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                    NFes Pendentes de Manifestação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nfes.filter(nfe => nfe.statusManifestacao === 'pendente').slice(0, 5).map(nfe => (
                      <div key={nfe.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{nfe.numeroNfe}</p>
                          <p className="text-sm text-gray-600">{nfe.emitente?.razaoSocial}</p>
                          <p className="text-xs text-gray-500">
                            R$ {(nfe.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedNfe(nfe);
                            setShowManifestacaoModal(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Manifestar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <CompliancePanel rules={complianceRules} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-blue-500" />
                  Status do Bot SEFAZ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {configuracaoBot?.automatico ? 'Ativo' : 'Inativo'}
                    </p>
                    <p className="text-sm text-gray-600">Status do Bot</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {estatisticas.ultimaBusca 
                        ? new Date(estatisticas.ultimaBusca).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
                    </p>
                    <p className="text-sm text-gray-600">Última Busca</p>
                  </div>
                  <div className="text-center">
                    <Button 
                      onClick={handleBuscarSefaz}
                      disabled={buscandoSefaz}
                      className="w-full"
                    >
                      {buscandoSefaz ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Buscar Agora
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    placeholder="Buscar por número, emitente ou chave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <select
                  value={filterSituacao}
                  onChange={(e) => setFilterSituacao(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">Todas as situações</option>
                  <option value="autorizada">Autorizada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="rejeitada">Rejeitada</option>
                </select>
                <select
                  value={filterManifestacao}
                  onChange={(e) => setFilterManifestacao(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">Todas manifestações</option>
                  <option value="pendente">Pendente</option>
                  <option value="manifestada">Manifestada</option>
                  <option value="vencida">Vencida</option>
                </select>
              </div>
              <Button 
                onClick={handleBuscarSefaz}
                disabled={buscandoSefaz}
              >
                {buscandoSefaz ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Buscar SEFAZ
              </Button>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Número</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Emitente</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Valor</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Data Emissão</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Situação</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Manifestação</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {nfesFiltradas.map((nfe) => (
                      <tr key={nfe.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{nfe.numeroNfe}</td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium">{nfe.emitente?.razaoSocial}</p>
                            <p className="text-xs text-gray-500">{nfe.emitente?.cnpj}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          R$ {(nfe.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(nfe.dataEmissao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getSituacaoBadge(nfe.situacao)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getManifestacaoBadge(nfe.statusManifestacao)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedNfe(nfe);
                                setShowDetalhesModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {nfe.statusManifestacao === 'pendente' && (
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedNfe(nfe);
                                  setShowManifestacaoModal(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadXml(nfe.id)}
                              disabled={loading}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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
                  Configuração do Bot SEFAZ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {configuracaoBot ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">CNPJ da Empresa</label>
                        <p className="text-sm text-gray-600">{configuracaoBot.cnpj}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Ambiente</label>
                        <Badge variant={configuracaoBot.ambiente === '1' ? 'default' : 'secondary'}>
                          {configuracaoBot.ambiente === '1' ? 'Produção' : 'Homologação'}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Busca Automática</label>
                        <Badge variant={configuracaoBot.automatico ? 'default' : 'secondary'}>
                          {configuracaoBot.automatico ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Intervalo (horas)</label>
                        <p className="text-sm text-gray-600">{configuracaoBot.intervaloHoras || 24}</p>
                      </div>
                    </div>
                    <Button onClick={() => setShowConfigModal(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Configuração
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Configure o Bot</h3>
                    <p className="text-gray-600 mb-4">
                      Configure o bot para buscar automaticamente NFes na SEFAZ.
                    </p>
                    <Button onClick={() => setShowConfigModal(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar Bot
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
        <NotasFiscaisSidebar 
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
      <ConfiguracaoBotModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={notasFiscais.salvarConfiguracaoBot}
        configuracao={configuracaoBot}
        loading={loading}
      />

      <ManifestacaoModal
        isOpen={showManifestacaoModal}
        onClose={() => {
          setShowManifestacaoModal(false);
          setSelectedNfe(null);
        }}
        onSave={handleManifestacao}
        nfe={selectedNfe}
        loading={loading}
      />

      <DetalhesNfeModal
        isOpen={showDetalhesModal}
        onClose={() => {
          setShowDetalhesModal(false);
          setSelectedNfe(null);
        }}
        nfe={selectedNfe}
      />
    </div>
  );
}
