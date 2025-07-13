
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Eye, Plus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const DocumentosTab = () => {
  const { funcionarios, documentos } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const tiposDocumento = [
    'Contrato de Trabalho',
    'Carteira de Trabalho',
    'CPF',
    'RG',
    'Comprovante de Residência',
    'Título de Eleitor',
    'Certificado de Reservista',
    'Cartão PIS/PASEP',
    'Exame Admissional',
    'Diploma/Certificado'
  ];

  const getDocumentosPorFuncionario = () => {
    return funcionarios?.map(funcionario => {
      const docsFunc = documentos?.filter(doc => doc.funcionarioId === funcionario.id) || [];
      const tiposRecebidos = docsFunc.map(doc => doc.tipo);
      const tiposPendentes = tiposDocumento.filter(tipo => !tiposRecebidos.includes(tipo));
      
      return {
        ...funcionario,
        documentos: docsFunc,
        documentosPendentes: tiposPendentes.length,
        percentualCompleto: Math.round((tiposRecebidos.length / tiposDocumento.length) * 100)
      };
    }) || [];
  };

  const funcionariosComDocs = getDocumentosPorFuncionario().filter(func =>
    func.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documentos</h3>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Documento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentos?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Documentos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {funcionariosComDocs.reduce((sum, func) => sum + func.documentosPendentes, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Funcionários Completos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {funcionariosComDocs.filter(func => func.percentualCompleto === 100).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar funcionários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {funcionariosComDocs.map((funcionario) => (
          <Card key={funcionario.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">{funcionario.nome}</CardTitle>
                  <p className="text-sm text-gray-600">{funcionario.cargo} - {funcionario.departamento}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{funcionario.percentualCompleto}%</div>
                  <div className="text-sm text-gray-600">
                    {funcionario.documentosPendentes} pendentes
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${funcionario.percentualCompleto}%` }}
                ></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Documentos Recebidos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {funcionario.documentos.map((doc) => (
                      <Badge key={doc.id} className="bg-green-100 text-green-800">
                        <FileText className="h-3 w-3 mr-1" />
                        {doc.tipo}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {funcionario.documentosPendentes > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Documentos Pendentes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {tiposDocumento
                        .filter(tipo => !funcionario.documentos.some(doc => doc.tipo === tipo))
                        .map((tipo) => (
                          <Badge key={tipo} className="bg-yellow-100 text-yellow-800">
                            {tipo}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Documentos
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-3 w-3 mr-1" />
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentosTab;
