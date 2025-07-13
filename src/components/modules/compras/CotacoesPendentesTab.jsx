"use client"
import { motion } from "framer-motion"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const CotacoesPendentesTab = ({ data, getStatusBadge, getPrioridadeBadge, onCriarCotacao }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhuma requisição pendente de cotação encontrada</p>
        <p className="text-sm text-gray-500 mt-2">
          Todas as requisições aprovadas já possuem cotações ou não há requisições aprovadas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-medium mb-2">Requisições Aguardando Cotação</h3>
        <p className="text-blue-600 text-sm">
          As requisições abaixo foram aprovadas e estão aguardando a criação de cotações. Clique em "Criar Cotação" para
          iniciar o processo de cotação.
        </p>
      </div>

      <div className="data-table rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Número</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Solicitante</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Departamento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data Aprovação</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Necessidade</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Prioridade</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Itens</th>
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
                  <td className="px-4 py-3 text-sm text-gray-800">{item.solicitante}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.departamento}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.aprovacao.dataAprovacao
                      ? new Date(item.aprovacao.dataAprovacao).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(item.dataNecessidade).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`status-badge ${getPrioridadeBadge(item.prioridade)}`}>{item.prioridade}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-600">{item.itens.length} item(s)</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      onClick={() => onCriarCotacao(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Criar Cotação
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

export default CotacoesPendentesTab
