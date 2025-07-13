
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

const ConfiguracaoBotModal = ({ isOpen, onClose, onSave, configuracao, loading }) => {
  const [dados, setDados] = useState({
    cnpj: '',
    ambiente: '2', // 1 = Produção, 2 = Homologação
    automatico: true,
    intervaloHoras: 24,
    certificado: {
      arquivo: '',
      senha: ''
    },
    webservice: {
      urlConsulta: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
      urlDistribuicao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfedistribuicaodfe.asmx'
    },
    notificacoes: {
      email: '',
      enviarResumo: true,
      enviarErros: true
    }
  });

  useEffect(() => {
    if (isOpen && configuracao) {
      setDados({
        ...dados,
        ...configuracao
      });
    } else if (isOpen && !configuracao) {
      setDados({
        cnpj: '',
        ambiente: '2',
        automatico: true,
        intervaloHoras: 24,
        certificado: {
          arquivo: '',
          senha: ''
        },
        webservice: {
          urlConsulta: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
          urlDistribuicao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfedistribuicaodfe.asmx'
        },
        notificacoes: {
          email: '',
          enviarResumo: true,
          enviarErros: true
        }
      });
    }
  }, [isOpen, configuracao]);

  const handleSubmit = () => {
    if (!dados.cnpj) {
      alert('CNPJ é obrigatório');
      return;
    }

    onSave(dados);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Configuração do Bot SEFAZ</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados Básicos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>CNPJ da Empresa *</Label>
                <Input
                  value={dados.cnpj}
                  onChange={(e) => setDados({...dados, cnpj: e.target.value})}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              
              <div>
                <Label>Ambiente</Label>
                <select
                  value={dados.ambiente}
                  onChange={(e) => setDados({...dados, ambiente: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="2">Homologação</option>
                  <option value="1">Produção</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configurações de Automação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Automação</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Busca Automática</Label>
                <select
                  value={dados.automatico}
                  onChange={(e) => setDados({...dados, automatico: e.target.value === 'true'})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="true">Ativa</option>
                  <option value="false">Inativa</option>
                </select>
              </div>
              
              <div>
                <Label>Intervalo (horas)</Label>
                <Input
                  type="number"
                  value={dados.intervaloHoras}
                  onChange={(e) => setDados({...dados, intervaloHoras: parseInt(e.target.value)})}
                  min="1"
                  max="168"
                />
              </div>
            </div>
          </div>

          {/* Certificado Digital */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Certificado Digital</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Arquivo do Certificado</Label>
                <Input
                  type="file"
                  accept=".pfx,.p12"
                  onChange={(e) => setDados({
                    ...dados, 
                    certificado: {...dados.certificado, arquivo: e.target.files[0]?.name || ''}
                  })}
                />
              </div>
              
              <div>
                <Label>Senha do Certificado</Label>
                <Input
                  type="password"
                  value={dados.certificado.senha}
                  onChange={(e) => setDados({
                    ...dados, 
                    certificado: {...dados.certificado, senha: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>

          {/* URLs dos Webservices */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Webservices</h3>
            
            <div>
              <Label>URL Consulta Status</Label>
              <Input
                value={dados.webservice.urlConsulta}
                onChange={(e) => setDados({
                  ...dados, 
                  webservice: {...dados.webservice, urlConsulta: e.target.value}
                })}
              />
            </div>
            
            <div>
              <Label>URL Distribuição DFe</Label>
              <Input
                value={dados.webservice.urlDistribuicao}
                onChange={(e) => setDados({
                  ...dados, 
                  webservice: {...dados.webservice, urlDistribuicao: e.target.value}
                })}
              />
            </div>
          </div>

          {/* Notificações */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notificações</h3>
            
            <div>
              <Label>Email para Notificações</Label>
              <Input
                type="email"
                value={dados.notificacoes.email}
                onChange={(e) => setDados({
                  ...dados, 
                  notificacoes: {...dados.notificacoes, email: e.target.value}
                })}
                placeholder="admin@empresa.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Enviar Resumo Diário</Label>
                <select
                  value={dados.notificacoes.enviarResumo}
                  onChange={(e) => setDados({
                    ...dados, 
                    notificacoes: {...dados.notificacoes, enviarResumo: e.target.value === 'true'}
                  })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
              
              <div>
                <Label>Enviar Notificação de Erros</Label>
                <select
                  value={dados.notificacoes.enviarErros}
                  onChange={(e) => setDados({
                    ...dados, 
                    notificacoes: {...dados.notificacoes, enviarErros: e.target.value === 'true'}
                  })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracaoBotModal;
