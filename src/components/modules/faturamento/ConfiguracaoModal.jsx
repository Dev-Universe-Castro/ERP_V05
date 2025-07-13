
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

const ConfiguracaoModal = ({ isOpen, onClose, onSave, configuracao, loading }) => {
  const [dados, setDados] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cep: '',
      cidade: '',
      uf: 'SP',
      codigoMunicipio: '3550308'
    },
    telefone: '',
    email: '',
    ambiente: '2', // 1 = Produção, 2 = Homologação
    serie: '001',
    numeroProximaNfe: '1',
    certificado: {
      arquivo: '',
      senha: '',
      validade: ''
    },
    webservice: {
      url: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
      urlConsulta: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx'
    }
  });

  useEffect(() => {
    if (isOpen && configuracao) {
      setDados({
        ...dados,
        ...configuracao
      });
    } else if (isOpen && !configuracao) {
      // Resetar para valores padrão
      setDados({
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
        inscricaoEstadual: '',
        inscricaoMunicipal: '',
        endereco: {
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cep: '',
          cidade: '',
          uf: 'SP',
          codigoMunicipio: '3550308'
        },
        telefone: '',
        email: '',
        ambiente: '2',
        serie: '001',
        numeroProximaNfe: '1',
        certificado: {
          arquivo: '',
          senha: '',
          validade: ''
        },
        webservice: {
          url: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
          urlConsulta: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx'
        }
      });
    }
  }, [isOpen, configuracao]);

  const handleSubmit = () => {
    if (!dados.razaoSocial || !dados.cnpj) {
      alert('Preencha pelo menos a Razão Social e CNPJ');
      return;
    }

    onSave(dados);
  };

  const handleAmbienteChange = (ambiente) => {
    const urls = {
      '1': {
        url: 'https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
        urlConsulta: 'https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx'
      },
      '2': {
        url: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
        urlConsulta: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx'
      }
    };

    setDados(prev => ({
      ...prev,
      ambiente,
      webservice: urls[ambiente]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-5/6 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Configuração da NFe</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-full">
          <div className="space-y-6">
            {/* Dados da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Razão Social *</Label>
                    <Input
                      value={dados.razaoSocial}
                      onChange={(e) => setDados(prev => ({ ...prev, razaoSocial: e.target.value }))}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <Label>Nome Fantasia</Label>
                    <Input
                      value={dados.nomeFantasia}
                      onChange={(e) => setDados(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                      placeholder="Nome fantasia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>CNPJ *</Label>
                    <Input
                      value={dados.cnpj}
                      onChange={(e) => setDados(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <Label>Inscrição Estadual</Label>
                    <Input
                      value={dados.inscricaoEstadual}
                      onChange={(e) => setDados(prev => ({ ...prev, inscricaoEstadual: e.target.value }))}
                      placeholder="123.456.789.123"
                    />
                  </div>
                  <div>
                    <Label>Inscrição Municipal</Label>
                    <Input
                      value={dados.inscricaoMunicipal}
                      onChange={(e) => setDados(prev => ({ ...prev, inscricaoMunicipal: e.target.value }))}
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={dados.telefone}
                      onChange={(e) => setDados(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(11) 1234-5678"
                    />
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={dados.email}
                      onChange={(e) => setDados(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="empresa@email.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label>Logradouro</Label>
                    <Input
                      value={dados.endereco.logradouro}
                      onChange={(e) => setDados(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, logradouro: e.target.value }
                      }))}
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input
                      value={dados.endereco.numero}
                      onChange={(e) => setDados(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, numero: e.target.value }
                      }))}
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <Label>Complemento</Label>
                    <Input
                      value={dados.endereco.complemento}
                      onChange={(e) => setDados(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, complemento: e.target.value }
                      }))}
                      placeholder="Sala, Andar..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Bairro</Label>
                    <Input
                      value={dados.endereco.bairro}
                      onChange={(e) => setDados(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, bairro: e.target.value }
                      }))}
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <Label>CEP</Label>
                    <Input
                      value={dados.endereco.cep}
                      onChange={(e) => setDados(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, cep: e.target.value }
                      }))}
                      placeholder="01234-567"
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={dados.endereco.cidade}
                      onChange={(e) => setDados(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, cidade: e.target.value }
                      }))}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label>UF</Label>
                    <select
                      value={dados.endereco.uf}
                      onChange={(e) => setDados(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, uf: e.target.value }
                      }))}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                      <option value="RS">RS</option>
                      <option value="SC">SC</option>
                      <option value="PR">PR</option>
                      {/* Adicionar outros estados conforme necessário */}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações NFe */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações NFe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Ambiente</Label>
                    <select
                      value={dados.ambiente}
                      onChange={(e) => handleAmbienteChange(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="2">Homologação</option>
                      <option value="1">Produção</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {dados.ambiente === '1' ? 'NFes válidas fiscalmente' : 'NFes apenas para teste'}
                    </p>
                  </div>
                  <div>
                    <Label>Série</Label>
                    <Input
                      value={dados.serie}
                      onChange={(e) => setDados(prev => ({ ...prev, serie: e.target.value }))}
                      placeholder="001"
                    />
                  </div>
                  <div>
                    <Label>Próximo Número NFe</Label>
                    <Input
                      value={dados.numeroProximaNfe}
                      onChange={(e) => setDados(prev => ({ ...prev, numeroProximaNfe: e.target.value }))}
                      placeholder="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificado Digital */}
            <Card>
              <CardHeader>
                <CardTitle>Certificado Digital</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Arquivo do Certificado (.pfx/.p12)</Label>
                    <Input
                      type="file"
                      accept=".pfx,.p12"
                      onChange={(e) => setDados(prev => ({
                        ...prev,
                        certificado: { ...prev.certificado, arquivo: e.target.files[0]?.name || '' }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Senha do Certificado</Label>
                    <Input
                      type="password"
                      value={dados.certificado.senha}
                      onChange={(e) => setDados(prev => ({
                        ...prev,
                        certificado: { ...prev.certificado, senha: e.target.value }
                      }))}
                      placeholder="Senha do certificado"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  O certificado digital é obrigatório para transmissão de NFes. Mantenha-o sempre atualizado.
                </p>
              </CardContent>
            </Card>

            {/* URLs dos Webservices */}
            <Card>
              <CardHeader>
                <CardTitle>Webservices SEFAZ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>URL Autorização</Label>
                  <Input
                    value={dados.webservice.url}
                    onChange={(e) => setDados(prev => ({
                      ...prev,
                      webservice: { ...prev.webservice, url: e.target.value }
                    }))}
                    placeholder="URL do webservice de autorização"
                  />
                </div>
                <div>
                  <Label>URL Consulta</Label>
                  <Input
                    value={dados.webservice.urlConsulta}
                    onChange={(e) => setDados(prev => ({
                      ...prev,
                      webservice: { ...prev.webservice, urlConsulta: e.target.value }
                    }))}
                    placeholder="URL do webservice de consulta"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  URLs são preenchidas automaticamente baseadas no ambiente selecionado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracaoModal;
