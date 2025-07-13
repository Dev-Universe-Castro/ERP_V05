"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Estados iniciais com dados de exemplo
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [transportadoras, setTransportadoras] = useState([]);
  const [produtos, setProdutos] = useState([
    { id: 1, nome: "Produto A", codigo: "PA001", categoria: "Categoria 1", preco: 100.00, custo: 80.00, custoMedio: 85.00, estoque: 50, estoqueAtual: 50, estoqueMin: 10, unidade: "kg", status: "ativo", createdAt: "2024-01-08", updatedAt: "2024-01-08" },
    { id: 2, nome: "Produto B", codigo: "PB002", categoria: "Categoria 2", preco: 150.00, custo: 120.00, custoMedio: 125.00, estoque: 30, estoqueAtual: 30, estoqueMin: 5, unidade: "un", status: "ativo", createdAt: "2024-01-09", updatedAt: "2024-01-09" },
    { id: 3, nome: "Produto C", codigo: "PC003", categoria: "Categoria 1", preco: 200.00, custo: 160.00, custoMedio: 165.00, estoque: 25, estoqueAtual: 25, estoqueMin: 8, unidade: "kg", status: "ativo", createdAt: "2024-01-10", updatedAt: "2024-01-10" },
  ]);

  const [ordensProducao, setOrdensProducao] = useState([
    {
      id: 1,
      numero: "OP123456",
      produto: "Produto A",
      produtoId: 1,
      quantidade: 100,
      produzido: 75,
      dataInicio: "2024-01-15",
      dataPrevisao: "2024-01-20",
      responsavel: "João Silva",
      status: "Em Andamento",
      prioridade: "Alta",
      observacoes: "Produção urgente para cliente VIP",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-18"
    },
    {
      id: 2,
      numero: "OP123457",
      produto: "Produto B",
      produtoId: 2,
      quantidade: 50,
      produzido: 50,
      dataInicio: "2024-01-10",
      dataPrevisao: "2024-01-15",
      responsavel: "Maria Santos",
      status: "Concluída",
      prioridade: "Média",
      observacoes: "Produção concluída dentro do prazo",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-15"
    }
  ]);

  const [funcionarios, setFuncionarios] = useState([
    {
      id: 1,
      nome: "João Silva",
      cpf: "123.456.789-00",
      rg: "12.345.678-9",
      cargo: "Analista de Sistemas",
      departamento: "TI",
      telefone: "(11) 99999-9999",
      email: "joao@empresa.com",
      endereco: "Rua A, 123 - São Paulo/SP",
      dataAdmissao: "2023-01-15",
      salario: 5000.00,
      status: "Ativo",
      observacoes: "Funcionário exemplar",
      createdAt: "2023-01-15",
      updatedAt: "2024-01-10"
    },
    {
      id: 2,
      nome: "Maria Santos",
      cpf: "987.654.321-00",
      rg: "98.765.432-1",
      cargo: "Supervisora de Produção",
      departamento: "Produção",
      telefone: "(11) 88888-8888",
      email: "maria@empresa.com",
      endereco: "Rua B, 456 - São Paulo/SP",
      dataAdmissao: "2022-03-10",
      salario: 6000.00,
      status: "Ativo",
      observacoes: "Liderança exemplar",
      createdAt: "2022-03-10",
      updatedAt: "2024-01-10"
    }
  ]);

  // Estados para outros módulos
  const [folhasPagamento, setFolhasPagamento] = useState([]);
  const [registrosPonto, setRegistrosPonto] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [requisicoes, setRequisicoes] = useState([]);
  const [cotacoes, setCotacoes] = useState([]);
  const [pedidosCompra, setPedidosCompra] = useState([]);
  const [pendentesAprovacao, setPendentesAprovacao] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [contas, setContas] = useState([]);
  const [titulosPagar, setTitulosPagar] = useState([]);
  const [titulosReceber, setTitulosReceber] = useState([]);
  const [contasFinanceiras, setContasFinanceiras] = useState([
    { id: 1, nome: "Conta Corrente Principal", banco: "Banco do Brasil", agencia: "1234-5", conta: "67890-1", saldo: 125000, tipo: "corrente", status: "ativa", createdAt: "2024-01-01", updatedAt: "2024-01-20" }
  ]);

  // Estados para logística
  const [romaneios, setRomaneios] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [rotas, setRotas] = useState([]);
  const [expedicoes, setExpedicoes] = useState([]);

  // Estados para estoque
  const [movimentacoesEstoque, setMovimentacoesEstoque] = useState([]);
  const [inventarios, setInventarios] = useState([]);

  // Estados para abastecimento
  const [equipamentos, setEquipamentos] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);

  // Estados para comercial
  const [pedidosVenda, setPedidosVenda] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [faturamentos, setFaturamentos] = useState([]);
  const [embarques, setEmbarques] = useState([]);
  const [nfes, setNfes] = useState([]);
  const [configuracoesNfe, setConfiguracoesNfe] = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [nfesRecebidas, setNfesRecebidas] = useState([]);
  const [configuracoesBot, setConfiguracoesBot] = useState([]);
  const [logsSefaz, setLogsSefaz] = useState([]);

  // Função para gerar IDs únicos
  const generateId = () => {
    return Date.now() + Math.random();
  };

  // Função para adicionar timestamps
  const addTimestamps = (item, isUpdate = false) => {
    const now = new Date().toISOString();
    return {
      ...item,
      ...(isUpdate ? { updatedAt: now } : { createdAt: now, updatedAt: now })
    };
  };

  // Função genérica para buscar itens com filtros
  const queryItems = (type, filters = {}) => {
    const getters = {
      clientes: () => clientes,
      fornecedores: () => fornecedores,
	  transportadoras: () => transportadoras,
      produtos: () => produtos,
      ordensProducao: () => ordensProducao,
      funcionarios: () => funcionarios,
      folhasPagamento: () => folhasPagamento,
      registrosPonto: () => registrosPonto,
      documentos: () => documentos,
      requisicoes: () => requisicoes,
      cotacoes: () => cotacoes,
      pedidosCompra: () => pedidosCompra,
      pendentesAprovacao: () => pendentesAprovacao,
      receitas: () => receitas,
      despesas: () => despesas,
      contas: () => contas,
      titulosPagar: () => titulosPagar,
      titulosReceber: () => titulosReceber,
      contasFinanceiras: () => contasFinanceiras,
      romaneios: () => romaneios,
      entregas: () => entregas,
      rotas: () => rotas,
      expedicoes: () => expedicoes,
      movimentacoesEstoque: () => movimentacoesEstoque,
      inventarios: () => inventarios,
      equipamentos: () => equipamentos,
      abastecimentos: () => abastecimentos,
      manutencoes: () => manutencoes,
      pedidosVenda: () => pedidosVenda,
      propostas: () => propostas,
      comissoes: () => comissoes,
      vendedores: () => vendedores,
      faturamentos: () => faturamentos,
      embarques: () => embarques,
      nfes: () => nfes,
      configuracoesNfe: () => configuracoesNfe,
      certificados: () => certificados,
      nfesRecebidas: () => nfesRecebidas,
      configuracoesBot: () => configuracoesBot,
      logsSefaz: () => logsSefaz
    };

    const getter = getters[type];
    if (!getter) return [];

    let items = getter();

    // Aplicar filtros
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        items = items.filter(item => {
          if (typeof filters[key] === 'string') {
            return item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
          }
          return item[key] === filters[key];
        });
      }
    });

    return items;
  };

  // Função para buscar itens por termo de pesquisa
  const searchItems = (type, searchTerm) => {
    const getters = {
      clientes: () => clientes,
      fornecedores: () => fornecedores,
      produtos: () => produtos,
      transportadoras: () => transportadoras,
      ordensProducao: () => ordensProducao,
      funcionarios: () => funcionarios,
      folhasPagamento: () => folhasPagamento,
      registrosPonto: () => registrosPonto,
      documentos: () => documentos,
      requisicoes: () => requisicoes,
      cotacoes: () => cotacoes,
      pedidosCompra: () => pedidosCompra,
      pendentesAprovacao: () => pendentesAprovacao,
      receitas: () => receitas,
      despesas: () => despesas,
      contas: () => contas,
      titulosPagar: () => titulosPagar,
      titulosReceber: () => titulosReceber,
      contasFinanceiras: () => contasFinanceiras,
      romaneios: () => romaneios,
      entregas: () => entregas,
      rotas: () => rotas,
      expedicoes: () => expedicoes,
      movimentacoesEstoque: () => movimentacoesEstoque,
      inventarios: () => inventarios,
      equipamentos: () => equipamentos,
      abastecimentos: () => abastecimentos,
      manutencoes: () => manutencoes,
      pedidosVenda: () => pedidosVenda,
      propostas: () => propostas,
      comissoes: () => comissoes,
      vendedores: () => vendedores,
      faturamentos: () => faturamentos,
      embarques: () => embarques,
      nfes: () => nfes,
      configuracoesNfe: () => configuracoesNfe,
      logsSefaz: () => logsSefaz
    };

    const getter = getters[type];
    if (!getter) return [];

    let items = getter();

    // Se não há termo de busca, retorna todos os itens
    if (!searchTerm || searchTerm.trim() === '') {
      return items;
    }

    const searchTermLower = searchTerm.toLowerCase();

    // Filtrar itens que contenham o termo de busca em qualquer campo
    return items.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(searchTermLower);
      });
    });
  };

  // Função genérica para buscar por ID
  const findById = (type, id) => {
    const items = queryItems(type);
    return items.find(item => item.id === id);
  };

  // Função genérica para inserir
  const insertItem = (type, item) => {
    const setters = {
      clientes: setClientes,
      fornecedores: setFornecedores,
	  transportadoras: setTransportadoras,
      produtos: setProdutos,
      ordensProducao: setOrdensProducao,
      funcionarios: setFuncionarios,
      folhasPagamento: setFolhasPagamento,
      registrosPonto: setRegistrosPonto,
      documentos: setDocumentos,
      requisicoes: setRequisicoes,
      cotacoes: setCotacoes,
      pedidosCompra: setPedidosCompra,
      pendentesAprovacao: setPendentesAprovacao,
      receitas: setReceitas,
      despesas: setDespesas,
      contas: setContas,
      titulosPagar: setTitulosPagar,
      titulosReceber: setTitulosReceber,
      contasFinanceiras: setContasFinanceiras,
      romaneios: setRomaneios,
      entregas: setEntregas,
      rotas: setRotas,
      expedicoes: setExpedicoes,
      movimentacoesEstoque: setMovimentacoesEstoque,
      inventarios: setInventarios,
      equipamentos: setEquipamentos,
      abastecimentos: setAbastecimentos,
      manutencoes: setManutencoes,
      pedidosVenda: setPedidosVenda,
      propostas: setPropostas,
      comissoes: setComissoes,
      vendedores: setVendedores,
      faturamentos: setFaturamentos,
      embarques: setEmbarques,
      nfes: setNfes,
      configuracoesNfe: setConfiguracoesNfe,
      certificados: setCertificados,
      nfesRecebidas: setNfesRecebidas,
      configuracoesBot: setConfiguracoesBot,
      logsSefaz: setLogsSefaz
    };

    const setter = setters[type];
    if (!setter) return null;

    const newItem = addTimestamps({ ...item, id: item.id || generateId() });
	setter(prev => {
		if (setter === setClientes) return [...prev, newItem];
		if (setter === setFornecedores) return [...prev, newItem];
		if (setter === setTransportadoras) return [...prev, newItem];
		if (setter === setProdutos) return [...prev, newItem];
		if (setter === setOrdensProducao) return [...prev, newItem];
		if (setter === setFuncionarios) return [...prev, newItem];
		return [...prev, newItem];
	});

    // Simular persistência (log para debug)
    console.log(`[INSERT] ${type}:`, newItem);

    return newItem;
  };

  // Função genérica para atualizar
  const updateItem = (type, id, updates) => {
    const setters = {
      clientes: setClientes,
      fornecedores: setFornecedores,
	  transportadoras: setTransportadoras,
      produtos: setProdutos,
      ordensProducao: setOrdensProducao,
      funcionarios: setFuncionarios,
      folhasPagamento: setFolhasPagamento,
      registrosPonto: setRegistrosPonto,
      documentos: setDocumentos,
      requisicoes: setRequisicoes,
      cotacoes: setCotacoes,
      pedidosCompra: setPedidosCompra,
      pendentesAprovacao: setPendentesAprovacao,
      receitas: setReceitas,
      despesas: setDespesas,
      contas: setContas,
      titulosPagar: setTitulosPagar,
      titulosReceber: setTitulosReceber,
      contasFinanceiras: setContasFinanceiras,
      romaneios: setRomaneios,
      entregas: setEntregas,
      rotas: setRotas,
      expedicoes: setExpedicoes,
      movimentacoesEstoque: setMovimentacoesEstoque,
      inventarios: setInventarios,
      equipamentos: setEquipamentos,
      abastecimentos: setAbastecimentos,
      manutencoes: setManutencoes,
      pedidosVenda: setPedidosVenda,
      propostas: setPropostas,
      comissoes: setComissoes,
      vendedores: setVendedores,
      faturamentos: setFaturamentos,
      embarques: setEmbarques,
      nfes: setNfes,
      configuracoesNfe: setConfiguracoesNfe,
      certificados: setCertificados,
      nfesRecebidas: setNfesRecebidas,
      configuracoesBot: setConfiguracoesBot,
      logsSefaz: setLogsSefaz
    };

    const setter = setters[type];
    if (!setter) return null;

    let updatedItem = null;
    setter(prev => prev.map(item => {
      if (item.id === id) {
        updatedItem = addTimestamps({ ...item, ...updates }, true);
        return updatedItem;
      }
      return item;
    }));

    // Simular persistência (log para debug)
    console.log(`[UPDATE] ${type}:`, updatedItem);

    return updatedItem;
  };

  // Função genérica para deletar
  const deleteItem = (type, id) => {
    const setters = {
      clientes: setClientes,
      fornecedores: setFornecedores,
	  transportadoras: setTransportadoras,
      produtos: setProdutos,
      ordensProducao: setOrdensProducao,
      funcionarios: setFuncionarios,
      folhasPagamento: setFolhasPagamento,
      registrosPonto: setRegistrosPonto,
      documentos: setDocumentos,
      requisicoes: setRequisicoes,
      cotacoes: setCotacoes,
      pedidosCompra: setPedidosCompra,
      pendentesAprovacao: setPendentesAprovacao,
      receitas: setReceitas,
      despesas: setDespesas,
      contas: setContas,
      titulosPagar: setTitulosPagar,
      titulosReceber: setTitulosReceber,
      contasFinanceiras: setContasFinanceiras,
      romaneios: setRomaneios,
      entregas: setEntregas,
      rotas: setRotas,
      expedicoes: setExpedicoes,
      movimentacoesEstoque: setMovimentacoesEstoque,
      inventarios: setInventarios,
      equipamentos: setEquipamentos,
      abastecimentos: setAbastecimentos,
      manutencoes: setManutencoes,
      pedidosVenda: setPedidosVenda,
      propostas: setPropostas,
      comissoes: setComissoes,
      vendedores: setVendedores,
      faturamentos: setFaturamentos,
      embarques: setEmbarques,
      nfes: setNfes,
      configuracoesNfe: setConfiguracoesNfe,
      certificados: setCertificados,
      nfesRecebidas: setNfesRecebidas,
      configuracoesBot: setConfiguracoesBot,
      logsSefaz: setLogsSefaz
    };

    const setter = setters[type];
    if (!setter) return false;

    let deleted = false;
    setter(prev => {
      const filtered = prev.filter(item => item.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });

    // Simular persistência (log para debug)
    console.log(`[DELETE] ${type}:`, id, deleted);

    return deleted;
  };

  // Funcões específicas de negócio
  const calculateBOMCost = (bom, produtos) => {
    if (!bom || !Array.isArray(bom)) return 0;
    return bom.reduce((total, component) => {
      const materiaPrima = produtos.find((p) => p.id === component.materiaPrimaId);
      if (materiaPrima) {
        return total + materiaPrima.custo * component.quantidade;
      }
      return total;
    }, 0);
  };

  const generateNumber = (prefix, category) => {
    const items = queryItems(category);
    const currentYear = new Date().getFullYear();
    const count = items.filter((item) => 
      item.numero && item.numero.includes(currentYear.toString())
    ).length + 1;
    return `${prefix}-${currentYear}-${count.toString().padStart(3, "0")}`;
  };

  // Função para criar títulos a pagar baseado em pedidos de compra
  const createTitulosPagar = (pedido, fornecedor) => {
    const condicoesPagamento = fornecedor.condicoesPagamento || { tipo: "30dias", parcelas: 1 };
    const valorTotal = pedido.valorTotal;
    const dataBase = new Date();
    const titulosParaCriar = [];

    if (condicoesPagamento.tipo === "avista") {
      titulosParaCriar.push({
        descricao: `${pedido.descricao} - ${pedido.numero}`,
        origem: "Pedido de Compra",
        pedidoId: pedido.id,
        fornecedorId: fornecedor.id,
        fornecedor: fornecedor.nome,
        valor: valorTotal,
        dataVencimento: new Date(dataBase.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        dataEmissao: new Date().toISOString(),
        status: "pendente",
        parcela: "1/1",
        observacoes: "Pagamento à vista",
      });
    } else if (condicoesPagamento.tipo === "30dias") {
      titulosParaCriar.push({
        descricao: `${pedido.descricao} - ${pedido.numero}`,
        origem: "Pedido de Compra",
        pedidoId: pedido.id,
        fornecedorId: fornecedor.id,
        fornecedor: fornecedor.nome,
        valor: valorTotal,
        dataVencimento: new Date(dataBase.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        dataEmissao: new Date().toISOString(),
        status: "pendente",
        parcela: "1/1",
        observacoes: "Pagamento 30 dias",
      });
    } else if (condicoesPagamento.tipo === "30/60/90") {
      const valorParcela = valorTotal / 3;
      for (let i = 1; i <= 3; i++) {
        titulosParaCriar.push({
          descricao: `${pedido.descricao} - ${pedido.numero}`,
          origem: "Pedido de Compra",
          pedidoId: pedido.id,
          fornecedorId: fornecedor.id,
          fornecedor: fornecedor.nome,
          valor: valorParcela,
          dataVencimento: new Date(dataBase.getTime() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
          dataEmissao: new Date().toISOString(),
          status: "pendente",
          parcela: `${i}/3`,
          observacoes: `${i}ª parcela - ${i * 30} dias`,
        });
      }
    }

    // Inserir todos os títulos
    titulosParaCriar.forEach(titulo => insertItem('titulosPagar', titulo));
    return titulosParaCriar;
  };

  const createTitulosReceber = (pedidoVenda) => {
    const valorTotal = pedidoVenda.valorTotal || 0;
    const dataBase = new Date();

    const tituloReceber = {
      descricao: `Venda ${pedidoVenda.produto} - ${pedidoVenda.cliente}`,
      origem: "Pedido de Venda",
      pedidoVendaId: pedidoVenda.id,
      cliente: pedidoVenda.cliente,
      valor: valorTotal,
      dataVencimento: new Date(dataBase.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      dataEmissao: new Date().toISOString(),
      status: "pendente",
      observacoes: `Receita referente ao pedido ${pedidoVenda.numeroPedido}`,
    };

    return insertItem('titulosReceber', tituloReceber);
  };

  const baixarTitulo = (tituloId, tipoBaixa = "pagamento", categoria = "titulosPagar") => {
    const titulo = findById(categoria, tituloId);
    if (!titulo) return false;

    const statusMap = {
      "titulosPagar": { "pagamento": "pago", "cancelado": "cancelado" },
      "titulosReceber": { "pagamento": "recebido", "cancelado": "cancelado" }
    };

    const dadosAtualizacao = {
      status: statusMap[categoria][tipoBaixa] || "pago",
      [categoria === "titulosPagar" ? "dataPagamento" : "dataRecebimento"]: new Date().toISOString(),
      observacoes: (titulo.observacoes || "") + ` | Baixado por ${tipoBaixa} em ${new Date().toLocaleDateString("pt-BR")}`,
    };

    return updateItem(categoria, tituloId, dadosAtualizacao);
  };

  // Função para processar consumo de produção no estoque
  const processarConsumoProducao = async (ordemProducao) => {
    try {
      const { useEstoque } = await import('../hooks/useEstoque');
      const estoque = useEstoque();
      await estoque.processarConsumoProducao(ordemProducao);
    } catch (error) {
      console.error('Erro ao processar consumo de produção:', error);
    }
  };

  // Dados consolidados para compatibilidade
  const data = {
    clientes,
    fornecedores,
    produtos,
    ordensProducao,
    funcionarios,
    folhasPagamento,
    registrosPonto,
    documentos,
    requisicoes,
    cotacoes,
    pedidosCompra,
    pendentesAprovacao,
    receitas,
    despesas,
    contas,
    titulosPagar,
    titulosReceber,
    contasFinanceiras,
    romaneios,
    entregas,
    rotas,
    expedicoes,
    movimentacoesEstoque,
    inventarios,
    equipamentos,
    abastecimentos,
    manutencoes,
    pedidosVenda,
    propostas,
    comissoes,
    vendedores,
    faturamentos,
    embarques,
    nfes,
    configuracoesNfe,
    certificados,
    nfesRecebidas,
    configuracoesBot,
    logsSefaz
  };

  const value = {
    // Dados
    data,

    // Operações CRUD genéricas
    queryItems,
    searchItems,
    findById,
    insertItem,
    updateItem,
    deleteItem,

    // Funções específicas de negócio
    calculateBOMCost,
    generateNumber,
    createTitulosPagar,
    createTitulosReceber,
    processarConsumoProducao,
    baixarTitulo,

    // Funções legadas para compatibilidade
    addItem: insertItem,
    removeItem: deleteItem,

    // Estados específicos para compatibilidade
    contasFinanceiras,
    addContaFinanceira: (conta) => insertItem('contasFinanceiras', conta),
    updateContaFinanceira: (conta) => updateItem('contasFinanceiras', conta.id, conta),
    ordensProducao,
    addOrdemProducao: (ordem) => insertItem('ordensProducao', ordem),
    updateOrdemProducao: (ordem) => updateItem('ordensProducao', ordem.id, ordem)
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};