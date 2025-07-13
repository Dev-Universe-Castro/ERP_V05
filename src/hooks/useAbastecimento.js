
import { useCRUD } from './useCRUD';
import { useAuditLog } from './useAuditLog';
import { toast } from '@/components/ui/use-toast';

export const useAbastecimento = () => {
  const { logAction } = useAuditLog();

  // CRUD para equipamentos
  const equipamentos = useCRUD('equipamentos', {
    onCreate: (data) => {
      logAction('CREATE', 'EQUIPAMENTO', data.id, `Equipamento ${data.nome} cadastrado`);
      toast({
        title: "Equipamento cadastrado",
        description: `${data.nome} foi cadastrado com sucesso.`
      });
    },
    onUpdate: (data) => {
      logAction('UPDATE', 'EQUIPAMENTO', data.id, `Equipamento ${data.nome} atualizado`);
      toast({
        title: "Equipamento atualizado",
        description: `${data.nome} foi atualizado com sucesso.`
      });
    },
    onDelete: (id, data) => {
      logAction('DELETE', 'EQUIPAMENTO', id, `Equipamento ${data.nome} excluído`);
      toast({
        title: "Equipamento excluído",
        description: `${data.nome} foi excluído com sucesso.`
      });
    }
  });

  // CRUD para abastecimentos
  const abastecimentos = useCRUD('abastecimentos', {
    onCreate: (data) => {
      logAction('CREATE', 'ABASTECIMENTO', data.id, `Abastecimento registrado para equipamento ${data.equipamentoId}`);
      toast({
        title: "Abastecimento registrado",
        description: "Novo abastecimento registrado com sucesso."
      });
    },
    onUpdate: (data) => {
      logAction('UPDATE', 'ABASTECIMENTO', data.id, `Abastecimento atualizado`);
      toast({
        title: "Abastecimento atualizado",
        description: "Abastecimento atualizado com sucesso."
      });
    },
    onDelete: (id) => {
      logAction('DELETE', 'ABASTECIMENTO', id, `Abastecimento excluído`);
      toast({
        title: "Abastecimento excluído",
        description: "Abastecimento excluído com sucesso."
      });
    }
  });

  // CRUD para manutenções
  const manutencoes = useCRUD('manutencoes', {
    onCreate: (data) => {
      logAction('CREATE', 'MANUTENCAO', data.id, `Manutenção agendada para equipamento ${data.equipamentoId}`);
      toast({
        title: "Manutenção agendada",
        description: "Manutenção agendada com sucesso."
      });
    },
    onUpdate: (data) => {
      logAction('UPDATE', 'MANUTENCAO', data.id, `Manutenção atualizada`);
      toast({
        title: "Manutenção atualizada",
        description: "Manutenção atualizada com sucesso."
      });
    },
    onDelete: (id) => {
      logAction('DELETE', 'MANUTENCAO', id, `Manutenção excluída`);
      toast({
        title: "Manutenção excluída",
        description: "Manutenção excluída com sucesso."
      });
    }
  });

  // Funções específicas do abastecimento
  const validarAbastecimento = (dados) => {
    const equipamento = equipamentos.getById(dados.equipamentoId);
    
    if (!equipamento) {
      throw new Error('Equipamento não encontrado');
    }

    if (dados.medidorAtual < equipamento.medidorAtual) {
      throw new Error('O medidor atual não pode ser menor que o anterior');
    }

    if (dados.litros <= 0) {
      throw new Error('A quantidade de litros deve ser maior que zero');
    }

    if (dados.valor <= 0) {
      throw new Error('O valor deve ser maior que zero');
    }

    return true;
  };

  const calcularConsumo = (medidorAnterior, medidorAtual, litros) => {
    const distancia = medidorAtual - medidorAnterior;
    return distancia > 0 ? distancia / litros : 0;
  };

  const criarAbastecimento = (dados) => {
    try {
      validarAbastecimento(dados);
      
      const equipamento = equipamentos.getById(dados.equipamentoId);
      const medidorAnterior = equipamento.medidorAtual;
      const consumo = calcularConsumo(medidorAnterior, dados.medidorAtual, dados.litros);
      
      const novoAbastecimento = {
        ...dados,
        id: Date.now(),
        medidorAnterior,
        consumo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Criar abastecimento
      abastecimentos.create(novoAbastecimento);
      
      // Atualizar medidor do equipamento
      equipamentos.update(dados.equipamentoId, {
        medidorAtual: dados.medidorAtual,
        updatedAt: new Date().toISOString()
      });
      
      return novoAbastecimento;
    } catch (error) {
      toast({
        title: "Erro ao registrar abastecimento",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const atualizarAbastecimento = (id, dados) => {
    try {
      const abastecimentoAtual = abastecimentos.getById(id);
      if (!abastecimentoAtual) {
        throw new Error('Abastecimento não encontrado');
      }

      validarAbastecimento(dados);
      
      const consumo = calcularConsumo(abastecimentoAtual.medidorAnterior, dados.medidorAtual, dados.litros);
      
      const abastecimentoAtualizado = {
        ...dados,
        consumo,
        updatedAt: new Date().toISOString()
      };
      
      abastecimentos.update(id, abastecimentoAtualizado);
      
      // Atualizar medidor do equipamento se necessário
      if (dados.medidorAtual !== abastecimentoAtual.medidorAtual) {
        equipamentos.update(dados.equipamentoId, {
          medidorAtual: dados.medidorAtual,
          updatedAt: new Date().toISOString()
        });
      }
      
      return abastecimentoAtualizado;
    } catch (error) {
      toast({
        title: "Erro ao atualizar abastecimento",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const verificarManutencaoPendente = (equipamentoId) => {
    const equipamento = equipamentos.getById(equipamentoId);
    if (!equipamento) return false;

    if (equipamento.medidor === 'km') {
      const proximaManutencao = Math.ceil(equipamento.medidorAtual / 10000) * 10000;
      return (proximaManutencao - equipamento.medidorAtual) <= 1000;
    } else if (equipamento.medidor === 'horas') {
      const proximaManutencao = Math.ceil(equipamento.medidorAtual / 250) * 250;
      return (proximaManutencao - equipamento.medidorAtual) <= 50;
    }
    
    return false;
  };

  const getAlertasManutencao = () => {
    return equipamentos.getAll().filter(eq => verificarManutencaoPendente(eq.id));
  };

  const getConsumoEquipamento = (equipamentoId) => {
    const abastEquipamento = abastecimentos.getAll().filter(ab => ab.equipamentoId === equipamentoId);
    
    if (abastEquipamento.length === 0) return null;
    
    const totalLitros = abastEquipamento.reduce((acc, ab) => acc + ab.litros, 0);
    const totalValor = abastEquipamento.reduce((acc, ab) => acc + ab.valor, 0);
    const consumoMedio = abastEquipamento.reduce((acc, ab) => acc + ab.consumo, 0) / abastEquipamento.length;
    
    return {
      totalAbastecimentos: abastEquipamento.length,
      totalLitros,
      totalValor,
      consumoMedio,
      custoMedioLitro: totalLitros > 0 ? totalValor / totalLitros : 0
    };
  };

  const getRelatorioConsumo = (periodo = 'mes') => {
    const hoje = new Date();
    let dataInicio;
    
    switch (periodo) {
      case 'semana':
        dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'trimestre':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
        break;
      case 'ano':
        dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), 1);
        break;
      default: // mês
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }
    
    const abastecimentosPeriodo = abastecimentos.getAll().filter(ab => 
      new Date(ab.data) >= dataInicio
    );
    
    return {
      periodo,
      dataInicio,
      dataFim: hoje,
      totalAbastecimentos: abastecimentosPeriodo.length,
      totalLitros: abastecimentosPeriodo.reduce((acc, ab) => acc + ab.litros, 0),
      totalValor: abastecimentosPeriodo.reduce((acc, ab) => acc + ab.valor, 0),
      consumoMedio: abastecimentosPeriodo.length > 0 
        ? abastecimentosPeriodo.reduce((acc, ab) => acc + ab.consumo, 0) / abastecimentosPeriodo.length 
        : 0,
      abastecimentos: abastecimentosPeriodo
    };
  };

  return {
    // CRUD básico
    equipamentos,
    abastecimentos,
    manutencoes,
    
    // Funções específicas
    criarAbastecimento,
    atualizarAbastecimento,
    validarAbastecimento,
    calcularConsumo,
    verificarManutencaoPendente,
    getAlertasManutencao,
    getConsumoEquipamento,
    getRelatorioConsumo
  };
};
