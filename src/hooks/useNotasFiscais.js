
import { useCallback, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useCRUD } from './useCRUD';
import { useAuditLog } from './useAuditLog';
import { useToast } from '@/components/ui/use-toast';

export const useNotasFiscais = () => {
  const { data, generateNumber } = useData();
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  // CRUD operations
  const nfesRecebidas = useCRUD('nfesRecebidas');
  const configuracoesBot = useCRUD('configuracoesBot');
  const logsSefaz = useCRUD('logsSefaz');

  // === CONFIGURAÇÕES DO BOT ===
  const configuracaoBot = useMemo(() => {
    const configs = configuracoesBot.getAll();
    return configs[0] || null;
  }, [configuracoesBot]);

  const salvarConfiguracaoBot = useCallback(async (dados) => {
    try {
      const configs = configuracoesBot.getAll();
      let config;

      if (configs.length > 0) {
        config = await configuracoesBot.update(configs[0].id, dados);
      } else {
        config = await configuracoesBot.create(dados);
      }

      if (config) {
        logAction('update', 'configuracoesBot', config.id, {
          cnpj: dados.cnpj,
          automatico: dados.automatico
        });

        toast({
          title: "Configuração salva",
          description: "Configurações do bot NFe atualizadas com sucesso."
        });
      }

      return config;
    } catch (error) {
      console.error('Erro ao salvar configuração do bot:', error);
      return null;
    }
  }, [configuracoesBot, logAction, toast]);

  // === BUSCA AUTOMÁTICA NA SEFAZ ===
  const buscarNfesSefaz = useCallback(async (dataInicio, dataFim) => {
    try {
      if (!configuracaoBot) {
        toast({
          title: "Erro",
          description: "Configure primeiro os dados para acesso à SEFAZ.",
          variant: "destructive"
        });
        return null;
      }

      // Log do início da busca
      const logBusca = await logsSefaz.create({
        tipo: 'busca_automatica',
        status: 'iniciado',
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        parametros: {
          cnpj: configuracaoBot.cnpj,
          ambiente: configuracaoBot.ambiente
        },
        dataExecucao: new Date().toISOString()
      });

      toast({
        title: "Buscando NFes",
        description: "Consultando SEFAZ... Isso pode levar alguns minutos."
      });

      // Simular consulta à SEFAZ
      const resultadoConsulta = await simularConsultaSefaz(configuracaoBot, dataInicio, dataFim);

      if (resultadoConsulta.sucesso) {
        let nfesImportadas = 0;
        let nfesAtualizadas = 0;

        for (const nfeSefaz of resultadoConsulta.nfes) {
          const nfeExistente = nfesRecebidas.getAll().find(nfe => 
            nfe.chaveAcesso === nfeSefaz.chaveAcesso
          );

          if (nfeExistente) {
            // Atualizar NFe existente
            await nfesRecebidas.update(nfeExistente.id, {
              ...nfeSefaz,
              dataUltimaAtualizacao: new Date().toISOString()
            });
            nfesAtualizadas++;
          } else {
            // Importar nova NFe
            await nfesRecebidas.create({
              ...nfeSefaz,
              dataImportacao: new Date().toISOString(),
              status: 'importada',
              origem: 'sefaz_automatico'
            });
            nfesImportadas++;
          }
        }

        // Atualizar log de sucesso
        await logsSefaz.update(logBusca.id, {
          status: 'concluido',
          resultados: {
            totalEncontradas: resultadoConsulta.nfes.length,
            nfesImportadas,
            nfesAtualizadas
          },
          dataFinalizacao: new Date().toISOString()
        });

        toast({
          title: "Busca concluída",
          description: `${nfesImportadas} NFes importadas, ${nfesAtualizadas} atualizadas.`
        });

        logAction('create', 'nfesRecebidas', 'bulk', {
          importadas: nfesImportadas,
          atualizadas: nfesAtualizadas
        });

      } else {
        // Atualizar log de erro
        await logsSefaz.update(logBusca.id, {
          status: 'erro',
          erro: resultadoConsulta.erro,
          dataFinalizacao: new Date().toISOString()
        });

        toast({
          title: "Erro na consulta",
          description: resultadoConsulta.erro,
          variant: "destructive"
        });
      }

      return resultadoConsulta;
    } catch (error) {
      console.error('Erro ao buscar NFes na SEFAZ:', error);
      return null;
    }
  }, [nfesRecebidas, configuracaoBot, logsSefaz, logAction, toast]);

  // === DOWNLOAD DE XML ===
  const downloadXmlNfe = useCallback(async (nfeId) => {
    try {
      const nfe = nfesRecebidas.getById(nfeId);
      if (!nfe) return null;

      // Simular download do XML
      const resultadoDownload = await simularDownloadXml(nfe.chaveAcesso);

      if (resultadoDownload.sucesso) {
        await nfesRecebidas.update(nfeId, {
          xmlNfe: resultadoDownload.xml,
          dataDownloadXml: new Date().toISOString(),
          statusXml: 'disponivel'
        });

        toast({
          title: "XML baixado",
          description: `XML da NFe ${nfe.numeroNfe} baixado com sucesso.`
        });
      }

      return resultadoDownload;
    } catch (error) {
      console.error('Erro ao baixar XML:', error);
      return null;
    }
  }, [nfesRecebidas, toast]);

  // === MANIFESTAÇÃO DO DESTINATÁRIO ===
  const manifestarNfe = useCallback(async (nfeId, tipoManifestacao, justificativa = '') => {
    try {
      const nfe = nfesRecebidas.getById(nfeId);
      if (!nfe) return null;

      const tiposValidos = ['confirmacao', 'ciencia', 'desconhecimento', 'nao_realizada'];
      if (!tiposValidos.includes(tipoManifestacao)) {
        throw new Error('Tipo de manifestação inválido');
      }

      // Simular manifestação na SEFAZ
      const resultadoManifestacao = await simularManifestacao(nfe, tipoManifestacao, justificativa);

      if (resultadoManifestacao.sucesso) {
        await nfesRecebidas.update(nfeId, {
          manifestacao: {
            tipo: tipoManifestacao,
            justificativa,
            dataManifestacao: new Date().toISOString(),
            protocolo: resultadoManifestacao.protocolo
          },
          statusManifestacao: 'manifestada'
        });

        const descricoes = {
          'confirmacao': 'Confirmação da Operação',
          'ciencia': 'Ciência da Operação',
          'desconhecimento': 'Desconhecimento da Operação',
          'nao_realizada': 'Operação não Realizada'
        };

        toast({
          title: "Manifestação enviada",
          description: `${descricoes[tipoManifestacao]} registrada com sucesso.`
        });

        logAction('update', 'nfesRecebidas', nfeId, {
          manifestacao: tipoManifestacao
        });
      }

      return resultadoManifestacao;
    } catch (error) {
      console.error('Erro ao manifestar NFe:', error);
      return null;
    }
  }, [nfesRecebidas, logAction, toast]);

  // === FUNCÕES AUXILIARES ===
  const simularConsultaSefaz = async (config, dataInicio, dataFim) => {
    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simular 95% de sucesso
    const sucesso = Math.random() > 0.05;

    if (sucesso) {
      // Gerar NFes simuladas
      const nfesMock = [];
      const qtdNfes = Math.floor(Math.random() * 20) + 5; // Entre 5 e 25 NFes

      for (let i = 0; i < qtdNfes; i++) {
        const dataEmissao = new Date(dataInicio.getTime() + Math.random() * (dataFim.getTime() - dataInicio.getTime()));
        nfesMock.push({
          chaveAcesso: gerarChaveAcessoSimulada(),
          numeroNfe: String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0'),
          serie: String(Math.floor(Math.random() * 999) + 1).padStart(3, '0'),
          dataEmissao: dataEmissao.toISOString(),
          emitente: {
            cnpj: gerarCnpjSimulado(),
            razaoSocial: `Fornecedor ${String.fromCharCode(65 + Math.floor(Math.random() * 26))} Ltda`,
            nomeFantasia: `Empresa ${Math.floor(Math.random() * 100)}`,
            endereco: 'Rua Exemplo, 123 - São Paulo/SP'
          },
          valorTotal: Math.random() * 10000 + 100,
          valorIcms: 0,
          valorIpi: 0,
          situacao: Math.random() > 0.1 ? 'autorizada' : 'cancelada',
          statusManifestacao: 'pendente',
          itens: gerarItensSimulados()
        });
      }

      return {
        sucesso: true,
        nfes: nfesMock,
        totalEncontradas: nfesMock.length
      };
    } else {
      const erros = [
        'Certificado digital expirado',
        'CNPJ não encontrado na base da SEFAZ',
        'Erro de comunicação com a SEFAZ',
        'Período de consulta muito extenso'
      ];
      return {
        sucesso: false,
        erro: erros[Math.floor(Math.random() * erros.length)]
      };
    }
  };

  const simularDownloadXml = async (chaveAcesso) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      sucesso: true,
      xml: `<xml>NFe com chave ${chaveAcesso}</xml>`
    };
  };

  const simularManifestacao = async (nfe, tipo, justificativa) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      sucesso: true,
      protocolo: `MDe${Date.now()}`
    };
  };

  const gerarChaveAcessoSimulada = () => {
    const cUF = '35'; // São Paulo
    const aamm = new Date().toISOString().substr(2, 2) + String(new Date().getMonth() + 1).padStart(2, '0');
    const cnpj = String(Math.floor(Math.random() * 99999999999999)).padStart(14, '0');
    const mod = '55';
    const serie = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    const nNF = String(Math.floor(Math.random() * 999999999)).padStart(9, '0');
    const tpEmis = '1';
    const cNF = String(Math.floor(Math.random() * 99999999)).padStart(8, '0');
    const dv = String(Math.floor(Math.random() * 10));

    return cUF + aamm + cnpj + mod + serie + nNF + tpEmis + cNF + dv;
  };

  const gerarCnpjSimulado = () => {
    return String(Math.floor(Math.random() * 99999999999999)).padStart(14, '0');
  };

  const gerarItensSimulados = () => {
    const qtdItens = Math.floor(Math.random() * 5) + 1;
    const itens = [];

    for (let i = 0; i < qtdItens; i++) {
      itens.push({
        codigo: `ITEM${String(i + 1).padStart(3, '0')}`,
        descricao: `Produto ${String.fromCharCode(65 + i)} - Descrição detalhada`,
        ncm: '12345678',
        cfop: '5102',
        unidade: 'UN',
        quantidade: Math.floor(Math.random() * 10) + 1,
        valorUnitario: Math.random() * 100 + 10,
        valorTotal: 0
      });
      itens[i].valorTotal = itens[i].quantidade * itens[i].valorUnitario;
    }

    return itens;
  };

  // === ESTATÍSTICAS ===
  const getEstatisticas = useCallback(() => {
    const nfes = nfesRecebidas.getAll();
    const logs = logsSefaz.getAll();
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const nfesMes = nfes.filter(nfe => new Date(nfe.dataEmissao) >= inicioMes);
    const nfesAutorizadas = nfes.filter(nfe => nfe.situacao === 'autorizada');
    const nfesPendentesManifestacao = nfes.filter(nfe => nfe.statusManifestacao === 'pendente');
    
    const valorTotalMes = nfesMes
      .filter(nfe => nfe.situacao === 'autorizada')
      .reduce((total, nfe) => total + (nfe.valorTotal || 0), 0);

    const valorTotalGeral = nfesAutorizadas
      .reduce((total, nfe) => total + (nfe.valorTotal || 0), 0);

    const ultimaBusca = logs
      .filter(log => log.tipo === 'busca_automatica')
      .sort((a, b) => new Date(b.dataExecucao) - new Date(a.dataExecucao))[0];

    return {
      totalNfes: nfes.length,
      nfesMes: nfesMes.length,
      nfesAutorizadas: nfesAutorizadas.length,
      nfesPendentesManifestacao: nfesPendentesManifestacao.length,
      valorTotalMes,
      valorTotalGeral,
      ultimaBusca: ultimaBusca?.dataExecucao,
      statusUltimaBusca: ultimaBusca?.status
    };
  }, [nfesRecebidas, logsSefaz]);

  return {
    // CRUD
    nfesRecebidas,
    configuracoesBot,
    logsSefaz,

    // Funções principais
    buscarNfesSefaz,
    downloadXmlNfe,
    manifestarNfe,
    salvarConfiguracaoBot,

    // Dados
    configuracaoBot,
    getEstatisticas,

    // Funções auxiliares
    gerarChaveAcessoSimulada
  };
};
