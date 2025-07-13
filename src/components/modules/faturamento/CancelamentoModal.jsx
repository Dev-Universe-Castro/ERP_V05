
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, AlertTriangle } from 'lucide-react';

const CancelamentoModal = ({ isOpen, onClose, onSave, nfe, loading }) => {
  const [justificativa, setJustificativa] = useState('');

  const handleSubmit = () => {
    if (justificativa.length < 15) {
      alert('A justificativa deve ter pelo menos 15 caracteres');
      return;
    }

    onSave(nfe?.id, justificativa);
  };

  if (!isOpen || !nfe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Cancelar NFe</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Atenção: Cancelamento de NFe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-800">
                  Você está prestes a cancelar a NFe <strong>{nfe.numeroNfe}</strong> do cliente{' '}
                  <strong>{nfe.destinatario?.nome}</strong>.
                </p>
                <p className="text-sm text-red-800 mt-2">
                  Esta ação é irreversível e será enviada imediatamente para a SEFAZ.
                </p>
              </div>

              <div>
                <Label>Dados da NFe</Label>
                <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm text-gray-600">Número</p>
                    <p className="font-medium">{nfe.numeroNfe}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor</p>
                    <p className="font-medium">
                      R$ {(nfe.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data Emissão</p>
                    <p className="font-medium">
                      {new Date(nfe.dataEmissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chave de Acesso</p>
                    <p className="font-medium text-xs">{nfe.chaveAcesso}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Justificativa do Cancelamento *</Label>
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Digite o motivo do cancelamento (mínimo 15 caracteres)..."
                  rows={4}
                  className="w-full border rounded px-3 py-2 mt-2"
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {justificativa.length}/255 caracteres (mínimo 15)
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Importante:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• O cancelamento deve ser feito em até 24 horas da autorização</li>
                  <li>• A justificativa será enviada para a SEFAZ e constará no DANFE</li>
                  <li>• Após cancelada, a NFe não poderá mais ser utilizada</li>
                  <li>• Uma nova NFe deverá ser emitida se necessário</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit} 
            disabled={loading || justificativa.length < 15}
          >
            {loading ? 'Cancelando NFe...' : 'Confirmar Cancelamento'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelamentoModal;
