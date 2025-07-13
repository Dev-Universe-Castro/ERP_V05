
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, FileText } from 'lucide-react';

const DetalhesNfeModal = ({ isOpen, onClose, nfe }) => {
  if (!isOpen || !nfe) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Detalhes da NFe</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cabeçalho da NFe */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded">
            <div>
              <p className="text-sm text-gray-600">Número</p>
              <p className="text-lg font-bold">{nfe.numeroNfe}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Série</p>
              <p className="text-lg font-bold">{nfe.serie}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Situação</p>
              {getSituacaoBadge(nfe.situacao)}
            </div>
            <div>
              <p className="text-sm text-gray-600">Manifestação</p>
              {getManifestacaoBadge(nfe.statusManifestacao)}
            </div>
          </div>

          {/* Dados do Emitente */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Dados do Emitente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Razão Social</p>
                <p className="font-medium">{nfe.emitente?.razaoSocial}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nome Fantasia</p>
                <p className="font-medium">{nfe.emitente?.nomeFantasia || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CNPJ</p>
                <p className="font-medium">{nfe.emitente?.cnpj}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inscrição Estadual</p>
                <p className="font-medium">{nfe.emitente?.inscricaoEstadual || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Endereço</p>
                <p className="font-medium">{nfe.emitente?.endereco}</p>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-lg font-bold text-green-600">
                  R$ {(nfe.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ICMS</p>
                <p className="font-medium">
                  R$ {(nfe.valorIcms || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">IPI</p>
                <p className="font-medium">
                  R$ {(nfe.valorIpi || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tributos</p>
                <p className="font-medium">
                  R$ {((nfe.valorIcms || 0) + (nfe.valorIpi || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Datas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Data Emissão</p>
                <p className="font-medium">
                  {new Date(nfe.dataEmissao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data Importação</p>
                <p className="font-medium">
                  {nfe.dataImportacao 
                    ? new Date(nfe.dataImportacao).toLocaleDateString('pt-BR')
                    : '-'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data Manifestação</p>
                <p className="font-medium">
                  {nfe.manifestacao?.dataManifestacao 
                    ? new Date(nfe.manifestacao.dataManifestacao).toLocaleDateString('pt-BR')
                    : '-'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Manifestação */}
          {nfe.manifestacao && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Manifestação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-medium">
                    {nfe.manifestacao.tipo === 'confirmacao' && 'Confirmação da Operação'}
                    {nfe.manifestacao.tipo === 'ciencia' && 'Ciência da Operação'}
                    {nfe.manifestacao.tipo === 'desconhecimento' && 'Desconhecimento da Operação'}
                    {nfe.manifestacao.tipo === 'nao_realizada' && 'Operação não Realizada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Protocolo</p>
                  <p className="font-medium">{nfe.manifestacao.protocolo || '-'}</p>
                </div>
                {nfe.manifestacao.justificativa && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Justificativa</p>
                    <p className="font-medium">{nfe.manifestacao.justificativa}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Itens */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Itens ({nfe.itens?.length || 0})</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Código</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Descrição</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Qtd</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Valor Unit.</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {nfe.itens?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{item.codigo}</td>
                      <td className="px-4 py-2 text-sm">{item.descricao}</td>
                      <td className="px-4 py-2 text-sm">{item.quantidade} {item.unidade}</td>
                      <td className="px-4 py-2 text-sm">
                        R$ {item.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-sm text-gray-500 text-center">
                        Nenhum item encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chave de Acesso */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Chave de Acesso</h3>
            <div className="p-3 bg-gray-50 rounded font-mono text-sm break-all">
              {nfe.chaveAcesso}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t">
          <div className="flex space-x-2">
            {nfe.xmlNfe && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download XML
              </Button>
            )}
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Imprimir DANFE
            </Button>
          </div>
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetalhesNfeModal;
