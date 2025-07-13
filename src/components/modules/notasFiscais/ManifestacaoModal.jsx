
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

const ManifestacaoModal = ({ isOpen, onClose, onSave, nfe, loading }) => {
  const [tipoManifestacao, setTipoManifestacao] = useState('confirmacao');
  const [justificativa, setJustificativa] = useState('');

  const handleSubmit = () => {
    if ((tipoManifestacao === 'desconhecimento' || tipoManifestacao === 'nao_realizada') && 
        justificativa.length < 15) {
      alert('Justificativa deve ter pelo menos 15 caracteres para este tipo de manifestação');
      return;
    }

    onSave(nfe.id, tipoManifestacao, justificativa);
  };

  if (!isOpen || !nfe) return null;

  const tiposManifestacao = [
    { value: 'confirmacao', label: 'Confirmação da Operação', desc: 'Confirma que a operação foi realizada' },
    { value: 'ciencia', label: 'Ciência da Operação', desc: 'Apenas toma ciência da operação' },
    { value: 'desconhecimento', label: 'Desconhecimento da Operação', desc: 'Não conhece a operação' },
    { value: 'nao_realizada', label: 'Operação não Realizada', desc: 'A operação não foi realizada' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Manifestação do Destinatário</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Dados da NFe */}
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
                <p className="text-sm text-gray-600">Emitente</p>
                <p className="font-medium">{nfe.emitente?.razaoSocial}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data Emissão</p>
                <p className="font-medium">
                  {new Date(nfe.dataEmissao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Tipo de Manifestação */}
          <div>
            <Label>Tipo de Manifestação *</Label>
            <div className="mt-2 space-y-2">
              {tiposManifestacao.map((tipo) => (
                <div key={tipo.value} className="flex items-start space-x-2">
                  <input
                    type="radio"
                    id={tipo.value}
                    name="manifestacao"
                    value={tipo.value}
                    checked={tipoManifestacao === tipo.value}
                    onChange={(e) => setTipoManifestacao(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor={tipo.value} className="text-sm font-medium cursor-pointer">
                      {tipo.label}
                    </label>
                    <p className="text-xs text-gray-500">{tipo.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Justificativa */}
          <div>
            <Label>
              Justificativa 
              {(tipoManifestacao === 'desconhecimento' || tipoManifestacao === 'nao_realizada') && ' *'}
            </Label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1 h-24 resize-none"
              placeholder={
                (tipoManifestacao === 'desconhecimento' || tipoManifestacao === 'nao_realizada')
                  ? 'Justificativa obrigatória (mínimo 15 caracteres)'
                  : 'Justificativa opcional'
              }
              maxLength={255}
            />
            <p className="text-xs text-gray-500 mt-1">
              {justificativa.length}/255 caracteres
              {(tipoManifestacao === 'desconhecimento' || tipoManifestacao === 'nao_realizada') && 
               justificativa.length < 15 && ' (mínimo 15 caracteres)'}
            </p>
          </div>

          {/* Aviso Legal */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> A manifestação é um evento oficial registrado na SEFAZ 
              e não pode ser alterada após o envio.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Manifestação'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManifestacaoModal;
