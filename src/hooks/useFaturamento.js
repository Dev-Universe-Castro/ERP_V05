
import { useCallback, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useCRUD } from './useCRUD';
import { useAuditLog } from './useAuditLog';
import { useToast } from '@/components/ui/use-toast';

export const useFaturamento = () => {
  const { data, generateNumber } = useData();
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  // CRUD operations
  const nfesCRUD = useCRUD('nfes');
  const configuracoesNfeCRUD = useCRUD('configuracoesNfe');
  const certificadosCRUD = useCRUD('certificados');

  // === CONFIGURAÇÕES NFE ===
  const configuracaoNfe = useMemo(() => {
    const configs = configuracoesNfeCRUD.getAll();
    return configs[0] || null;
  }, [configuracoesNfeCRUD]);

  const salvarConfiguracaoNfe = useCallback(async (dados) => {
    try {
      const configs = configuracoesNfeCRUD.getAll();
      let config;

      if (configs.length > 0) {
        config = await configuracoesNfeCRUD.update(configs[0].id, dados);
      } else {
        config = await configuracoesNfeCRUD.create(dados);
      }

      if (config) {
        logAction('update', 'configuracoesNfe', config.id, {
          ambiente: dados.ambiente
        });

        toast({
          title: "Configuração salva",
          description: "Configurações da NFe atualizadas com sucesso."
        });
      }

      return config;
    } catch (error) {
      console.error('Erro ao salvar configuração NFe:', error);
      return null;
    }
  }, [configuracoesNfeCRUD, logAction, toast]);

  // === EMISSÃO DE NFE ===
  const emitirNfe = useCallback(async (dadosNfe) => {
    try {
      const numeroNfe = generateNumber('NFE', 'nfes');
      const chaveAcesso = gerarChaveAcesso(dadosNfe, numeroNfe);

      const nfe = {
        ...dadosNfe,
        numeroNfe,
        chaveAcesso,
        serie: dadosNfe.serie || '001',
        modelo: '55', // Modelo 55 para NFe
        tipoEmissao: '1', // Normal
        tipoAmbiente: configuracaoNfe?.ambiente || '2', // 2 = Homologação
        dataEmissao: new Date().toISOString(),
        horaEmissao: new Date().toISOString(),
        status: 'digitacao',
        statusSefaz: 'pendente',
        tentativasEnvio: 0,
        valorTotal: calcularValorTotal(dadosNfe.itens),
        valorTotalTributos: calcularTotalTributos(dadosNfe.itens)
      };

      const nfeCreated = await nfesCRUD.create(nfe);

      if (nfeCreated) {
        logAction('create', 'nfes', nfeCreated.id, {
          numero: numeroNfe,
          cliente: dadosNfe.destinatario.nome
        });
      }

      return nfeCreated;
    } catch (error) {
      console.error('Erro ao emitir NFe:', error);
      return null;
    }
  }, [nfesCRUD, generateNumber, configuracaoNfe, logAction]);

  const transmitirNfe = useCallback(async (nfeId) => {
    try {
      const nfe = nfesCRUD.getById(nfeId);
      if (!nfe) return null;

      if (!configuracaoNfe) {
        toast({
          title: "Erro",
          description: "Configure primeiro as informações da empresa.",
          variant: "destructive"
        });
        return null;
      }

      // Atualizar status para transmitindo
      await nfesCRUD.update(nfeId, {
        status: 'transmitindo',
        statusSefaz: 'enviando',
        tentativasEnvio: (nfe.tentativasEnvio || 0) + 1,
        ultimaTentativa: new Date().toISOString()
      });

      // Simular transmissão para SEFAZ
      const resultadoTransmissao = await simularTransmissaoSefaz(nfe);

      if (resultadoTransmissao.sucesso) {
        await nfesCRUD.update(nfeId, {
          status: 'autorizada',
          statusSefaz: 'autorizada',
          protocoloAutorizacao: resultadoTransmissao.protocolo,
          dataAutorizacao: new Date().toISOString(),
          xmlNfe: resultadoTransmissao.xml
        });

        toast({
          title: "NFe Autorizada",
          description: `NFe ${nfe.numeroNfe} autorizada pela SEFAZ.`
        });
      } else {
        await nfesCRUD.update(nfeId, {
          status: 'rejeitada',
          statusSefaz: 'rejeitada',
          motivoRejeicao: resultadoTransmissao.motivo
        });

        toast({
          title: "NFe Rejeitada",
          description: resultadoTransmissao.motivo,
          variant: "destructive"
        });
      }

      logAction('update', 'nfes', nfeId, {
        status: resultadoTransmissao.sucesso ? 'autorizada' : 'rejeitada'
      });

      return resultadoTransmissao;
    } catch (error) {
      console.error('Erro ao transmitir NFe:', error);
      return null;
    }
  }, [nfesCRUD, configuracaoNfe, logAction, toast]);

  const cancelarNfe = useCallback(async (nfeId, justificativa) => {
    try {
      const nfe = nfesCRUD.getById(nfeId);
      if (!nfe || nfe.status !== 'autorizada') return null;

      if (justificativa.length < 15) {
        toast({
          title: "Erro",
          description: "Justificativa deve ter pelo menos 15 caracteres.",
          variant: "destructive"
        });
        return null;
      }

      // Simular cancelamento na SEFAZ
      const resultadoCancelamento = await simularCancelamentoSefaz(nfe, justificativa);

      if (resultadoCancelamento.sucesso) {
        await nfesCRUD.update(nfeId, {
          status: 'cancelada',
          statusSefaz: 'cancelada',
          dataCancelamento: new Date().toISOString(),
          justificativaCancelamento: justificativa,
          protocoloCancelamento: resultadoCancelamento.protocolo
        });

        toast({
          title: "NFe Cancelada",
          description: `NFe ${nfe.numeroNfe} cancelada com sucesso.`
        });
      }

      logAction('update', 'nfes', nfeId, {
        status: 'cancelada',
        justificativa
      });

      return resultadoCancelamento;
    } catch (error) {
      console.error('Erro ao cancelar NFe:', error);
      return null;
    }
  }, [nfesCRUD, logAction, toast]);

  // === FUNÇÕES AUXILIARES ===
  const gerarChaveAcesso = (dadosNfe, numeroNfe) => {
    const cUF = '35'; // São Paulo
    const aamm = new Date().toISOString().substr(2, 2) + String(new Date().getMonth() + 1).padStart(2, '0');
    const cnpj = configuracaoNfe?.cnpj?.replace(/\D/g, '') || '00000000000000';
    const mod = '55';
    const serie = String(dadosNfe.serie || 1).padStart(3, '0');
    const nNF = String(numeroNfe.split('-')[2] || '1').padStart(9, '0');
    const tpEmis = '1';
    const cNF = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');

    const chaveBase = cUF + aamm + cnpj + mod + serie + nNF + tpEmis + cNF;
    const dv = calcularDigitoVerificador(chaveBase);
    
    return chaveBase + dv;
  };

  const calcularDigitoVerificador = (chave) => {
    const peso = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    let j = 0;

    for (let i = chave.length - 1; i >= 0; i--) {
      soma += parseInt(chave[i]) * peso[j];
      j = (j + 1) % peso.length;
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const calcularValorTotal = (itens) => {
    return itens.reduce((total, item) => {
      return total + (item.quantidade * item.valorUnitario);
    }, 0);
  };

  const calcularTotalTributos = (itens) => {
    return itens.reduce((total, item) => {
      const valorItem = item.quantidade * item.valorUnitario;
      const icms = valorItem * (item.aliquotaIcms || 0) / 100;
      const ipi = valorItem * (item.aliquotaIpi || 0) / 100;
      const pis = valorItem * (item.aliquotaPis || 0) / 100;
      const cofins = valorItem * (item.aliquotaCofins || 0) / 100;
      
      return total + icms + ipi + pis + cofins;
    }, 0);
  };

  const simularTransmissaoSefaz = async (nfe) => {
    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular 90% de sucesso
    const sucesso = Math.random() > 0.1;

    if (sucesso) {
      return {
        sucesso: true,
        protocolo: `135240000${Date.now()}`,
        xml: `<xml>NFe autorizada</xml>`,
        motivo: 'Autorizado o uso da NF-e'
      };
    } else {
      const motivos = [
        'CNPJ do destinatário inválido',
        'Produto não encontrado na tabela do contribuinte',
        'Valor do ICMS divergente',
        'Chave de acesso já existe'
      ];
      return {
        sucesso: false,
        motivo: motivos[Math.floor(Math.random() * motivos.length)]
      };
    }
  };

  const simularCancelamentoSefaz = async (nfe, justificativa) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      sucesso: true,
      protocolo: `235240000${Date.now()}`,
      motivo: 'Cancelamento autorizado'
    };
  };

  // === ESTATÍSTICAS ===
  const getEstatisticas = useCallback(() => {
    const nfes = nfesCRUD.getAll();
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const nfesMes = nfes.filter(nfe => new Date(nfe.dataEmissao) >= inicioMes);
    const nfesAutorizadas = nfes.filter(nfe => nfe.status === 'autorizada');
    const nfesRejeitadas = nfes.filter(nfe => nfe.status === 'rejeitada');
    const nfesCanceladas = nfes.filter(nfe => nfe.status === 'cancelada');

    const faturamentoMes = nfesMes
      .filter(nfe => nfe.status === 'autorizada')
      .reduce((total, nfe) => total + (nfe.valorTotal || 0), 0);

    const faturamentoTotal = nfesAutorizadas
      .reduce((total, nfe) => total + (nfe.valorTotal || 0), 0);

    return {
      totalNfes: nfes.length,
      nfesMes: nfesMes.length,
      nfesAutorizadas: nfesAutorizadas.length,
      nfesRejeitadas: nfesRejeitadas.length,
      nfesCanceladas: nfesCanceladas.length,
      faturamentoMes,
      faturamentoTotal,
      percentualSucesso: nfes.length > 0 ? (nfesAutorizadas.length / nfes.length) * 100 : 0
    };
  }, [nfesCRUD]);

  return {
    // CRUD
    nfes: nfesCRUD,
    configuracoes: configuracoesNfeCRUD,

    // Funções principais
    emitirNfe,
    transmitirNfe,
    cancelarNfe,
    salvarConfiguracaoNfe,

    // Dados
    configuracaoNfe,
    getEstatisticas,

    // Funções auxiliares
    gerarChaveAcesso,
    calcularValorTotal,
    calcularTotalTributos
  };
};
