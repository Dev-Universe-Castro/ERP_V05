"use client"

import { Badge } from "@/components/ui/badge"

export const getStatusBadge = (status) => {
  const statusConfig = {
    pendente: { color: "bg-yellow-100 text-yellow-800", label: "Pendente" },
    aprovada: { color: "bg-green-100 text-green-800", label: "Aprovada" },
    rejeitada: { color: "bg-red-100 text-red-800", label: "Rejeitada" },
    "em-cotacao": { color: "bg-blue-100 text-blue-800", label: "Em Cotação" },
    "pedido-gerado": { color: "bg-purple-100 text-purple-800", label: "Pedido Gerado" },
    enviado: { color: "bg-indigo-100 text-indigo-800", label: "Enviado" },
    recebido: { color: "bg-green-100 text-green-800", label: "Recebido" },
  }

  const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: status }

  return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
}

export const getPrioridadeBadge = (prioridade) => {
  const prioridadeConfig = {
    baixa: { color: "bg-gray-100 text-gray-800", label: "Baixa" },
    media: { color: "bg-yellow-100 text-yellow-800", label: "Média" },
    alta: { color: "bg-red-100 text-red-800", label: "Alta" },
  }

  const config = prioridadeConfig[prioridade] || { color: "bg-gray-100 text-gray-800", label: prioridade }

  return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
}

export const exportToExcel = (section, data) => {
  try {
    // Simular exportação (em um sistema real, você usaria uma biblioteca como xlsx)
    console.log(`Exportando ${section}:`, data)

    // Criar dados formatados para exportação
    const exportData = data.map((item) => {
      const baseData = {
        id: item.id,
        numero: item.numero,
        dataEmissao: item.dataEmissao ? new Date(item.dataEmissao).toLocaleDateString("pt-BR") : "",
        status: item.status,
      }

      switch (section) {
        case "requisicoes":
          return {
            ...baseData,
            solicitante: item.solicitante,
            departamento: item.departamento,
            dataNecessidade: new Date(item.dataNecessidade).toLocaleDateString("pt-BR"),
            prioridade: item.prioridade,
            totalItens: item.itens?.length || 0,
          }
        case "cotacoes":
          return {
            ...baseData,
            requisicao: item.requisicao,
            fornecedor: item.fornecedor,
            valorTotal: item.valorTotal,
            dataVencimento: new Date(item.dataVencimento).toLocaleDateString("pt-BR"),
          }
        case "pedidos":
          return {
            ...baseData,
            cotacao: item.cotacao,
            fornecedor: item.fornecedor,
            valorTotal: item.valorTotal,
            dataPrevisao: new Date(item.dataPrevisao).toLocaleDateString("pt-BR"),
          }
        default:
          return baseData
      }
    })

    // Simular download (em um sistema real, você geraria e baixaria o arquivo)
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${section}_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log(`Arquivo ${section}.json baixado com sucesso!`)
  } catch (error) {
    console.error("Erro ao exportar:", error)
  }
}
