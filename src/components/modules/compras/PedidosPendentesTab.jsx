"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const PedidosPendentesTab = ({ data, getStatusBadge, onCriarPedido }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhuma cotação pendente de pedido</p>
        <p className="text-sm text-gray-500 mt-2">Todas as cotações aprovadas já possuem pedido de compra</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-800 mb-2">Cotações Aguardando Pedido</h4>
        <p className="text-sm text-purple-600">
          Estas cotações foram aprovadas e estão aguardando a criação do pedido de compra.
        </p>
      </div>

      <div className="data-table rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Número</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Requisição</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fornecedor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data Aprovação</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Total</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm text-gray-800 font-mono">{item.numero}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.requisicao}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{item.fornecedor}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.aprovacao.dataAprovacao
                      ? new Date(item.aprovacao.dataAprovacao).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">
                    R$ {item.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`status-badge ${getStatusBadge(item.aprovacao.status)}`}>
                      {item.aprovacao.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      onClick={() => onCriarPedido(item)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Criar Pedido
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PedidosPendentesTab
