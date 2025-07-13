
import { useCallback } from 'react';
import { useCRUD } from './useCRUD';
import { useData } from '../contexts/DataContext';
import { useAuditLog } from './useAuditLog';

export const useCadastros = () => {
  const { data } = useData();
  const { logAction } = useAuditLog();

  // CRUD para diferentes tipos de cadastro
  const clientesCRUD = useCRUD('clientes');
  const fornecedoresCRUD = useCRUD('fornecedores');
  const transportadorasCRUD = useCRUD('transportadoras');
  const produtosCRUD = useCRUD('produtos');

  // Função para validar CNPJ
  const validateCNPJ = useCallback((cnpj) => {
    if (!cnpj) return false;
    
    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (cleanCNPJ.length !== 14) return false;
    
    // Validação básica de CNPJ (algoritmo simplificado)
    if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
    
    return true;
  }, []);

  // Função para validar CPF
  const validateCPF = useCallback((cpf) => {
    if (!cpf) return false;
    
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    
    // Validação básica de CPF
    if (/^(\d)\1+$/.test(cleanCPF)) return false;
    
    return true;
  }, []);

  // Função para gerar código único
  const generateUniqueCode = useCallback((type, prefix) => {
    const existingItems = data[type] || [];
    const existingCodes = existingItems
      .map(item => item.codigo)
      .filter(codigo => codigo && codigo.startsWith(prefix))
      .map(codigo => parseInt(codigo.replace(prefix, '')) || 0);
    
    const nextNumber = existingCodes.length > 0 
      ? Math.max(...existingCodes) + 1 
      : 1;
    
    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
  }, [data]);

  // Função para calcular custo de BOM
  const calculateBOMCost = useCallback((bom) => {
    if (!bom || !Array.isArray(bom)) return 0;
    
    return bom.reduce((total, component) => {
      const materiaPrima = (data.produtos || []).find(
        (mp) => mp.id === Number.parseInt(component.materiaPrimaId)
      );
      
      if (materiaPrima && component.quantidade) {
        return total + (materiaPrima.custo || 0) * component.quantidade;
      }
      
      return total;
    }, 0);
  }, [data.produtos]);

  // Função para criar cliente
  const createCliente = useCallback(async (clienteData) => {
    try {
      // Validações específicas
      if (clienteData.tipo === 'Pessoa Física' && clienteData.cnpj) {
        if (!validateCPF(clienteData.cnpj)) {
          throw new Error('CPF inválido');
        }
      } else if (clienteData.tipo === 'Pessoa Jurídica' && clienteData.cnpj) {
        if (!validateCNPJ(clienteData.cnpj)) {
          throw new Error('CNPJ inválido');
        }
      }

      // Gerar código se não existir
      if (!clienteData.codigo) {
        clienteData.codigo = generateUniqueCode('clientes', 'CLI');
      }

      const cliente = await clientesCRUD.create({
        ...clienteData,
        ativo: clienteData.ativo !== false,
        dataCriacao: new Date().toISOString()
      });

      if (cliente) {
        logAction('create', 'clientes', cliente.id);
      }

      return cliente;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }, [clientesCRUD, validateCPF, validateCNPJ, generateUniqueCode, logAction]);

  // Função para criar fornecedor
  const createFornecedor = useCallback(async (fornecedorData) => {
    try {
      // Validação de CNPJ
      if (fornecedorData.cnpj && !validateCNPJ(fornecedorData.cnpj)) {
        throw new Error('CNPJ inválido');
      }

      // Gerar código se não existir
      if (!fornecedorData.codigo) {
        fornecedorData.codigo = generateUniqueCode('fornecedores', 'FOR');
      }

      const fornecedor = await fornecedoresCRUD.create({
        ...fornecedorData,
        ativo: fornecedorData.ativo !== false,
        dataCriacao: new Date().toISOString()
      });

      if (fornecedor) {
        logAction('create', 'fornecedores', fornecedor.id);
      }

      return fornecedor;
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw error;
    }
  }, [fornecedoresCRUD, validateCNPJ, generateUniqueCode, logAction]);

  // Função para criar produto
  const createProduto = useCallback(async (produtoData) => {
    try {
      // Gerar código se não existir
      if (!produtoData.codigo) {
        const prefixMap = {
          'Matéria Prima': 'MP',
          'Produto Acabado': 'PA',
          'Insumo': 'INS',
          'Material Marketing': 'MKT',
          'Ativo': 'ATV',
          'Item Consumo': 'CON',
          'Combustível': 'CMB',
          'Outros': 'OUT'
        };
        const prefix = prefixMap[produtoData.tipo] || 'PROD';
        produtoData.codigo = generateUniqueCode('produtos', prefix);
      }

      // Calcular custo para produtos acabados
      if (produtoData.tipo === 'Produto Acabado' && produtoData.bom) {
        produtoData.custo = calculateBOMCost(produtoData.bom);
        produtoData.bomId = `BOM${produtoData.codigo?.replace(/\D/g, '') || '001'}`;
      }

      const produto = await produtosCRUD.create({
        ...produtoData,
        ativo: produtoData.ativo !== false,
        dataCriacao: new Date().toISOString()
      });

      if (produto) {
        logAction('create', 'produtos', produto.id);
      }

      return produto;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }, [produtosCRUD, generateUniqueCode, calculateBOMCost, logAction]);

  // Função para buscar produtos por tipo
  const getProdutosByTipo = useCallback((tipo) => {
    return (data.produtos || []).filter(produto => produto.tipo === tipo);
  }, [data.produtos]);

  // Função para verificar estoque baixo
  const getProdutosEstoqueBaixo = useCallback(() => {
    return (data.produtos || []).filter(produto => 
      produto.estoqueAtual && produto.estoqueMin && 
      produto.estoqueAtual < produto.estoqueMin
    );
  }, [data.produtos]);

  // Estatísticas de cadastros
  const getEstatisticas = useCallback((tipo) => {
    const items = data[tipo] || [];
    const ativos = items.filter(item => item.ativo !== false);
    const inativos = items.filter(item => item.ativo === false);
    
    const stats = {
      total: items.length,
      ativos: ativos.length,
      inativos: inativos.length,
      porcentagemAtivos: items.length > 0 ? (ativos.length / items.length * 100).toFixed(1) : 0
    };

    // Estatísticas específicas por tipo
    if (tipo === 'produtos') {
      stats.materiasPrimas = items.filter(item => item.tipo === 'Matéria Prima').length;
      stats.produtosAcabados = items.filter(item => item.tipo === 'Produto Acabado').length;
      stats.estoqueBaixo = this.getProdutosEstoqueBaixo().length;
      stats.valorEstoque = items.reduce((total, item) => 
        total + ((item.preco || 0) * (item.estoqueAtual || 0)), 0
      );
    } else if (tipo === 'clientes') {
      stats.faturamentoTotal = ativos.reduce((total, item) => 
        total + (item.faturamento || 0), 0
      );
      stats.pessoasFisicas = items.filter(item => item.tipo === 'Pessoa Física').length;
      stats.pessoasJuridicas = items.filter(item => item.tipo === 'Pessoa Jurídica').length;
    }

    return stats;
  }, [data]);

  return {
    // CRUD operations
    clientes: clientesCRUD,
    fornecedores: fornecedoresCRUD,
    transportadoras: transportadorasCRUD,
    produtos: produtosCRUD,

    // Specific functions
    createCliente,
    createFornecedor,
    createProduto,
    
    // Utility functions
    validateCNPJ,
    validateCPF,
    generateUniqueCode,
    calculateBOMCost,
    getProdutosByTipo,
    getProdutosEstoqueBaixo,
    getEstatisticas
  };
};
