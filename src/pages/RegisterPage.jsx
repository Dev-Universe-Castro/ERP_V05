import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const departments = [
    { value: 'producao', label: 'Produção' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'compras', label: 'Compras' },
    { value: 'logistica', label: 'Logística' },
    { value: 'rh', label: 'Recursos Humanos' },
    { value: 'estoque', label: 'Estoque' },
    { value: 'cadastros', label: 'Cadastros' },
    { value: 'abastecimento', label: 'Abastecimento' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Erro no cadastro",
          description: "As senhas não coincidem.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Erro no cadastro",
          description: "A senha deve ter pelo menos 6 caracteres.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position
      };

      register(userData);

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada e está aguardando aprovação do administrador."
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        position: ''
      });

    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      department: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Helmet>
        <title>Registro - ERP FertiCore</title>
        <meta name="description" content="Registre-se no sistema ERP FertiCore para solicitar acesso aos módulos de gestão empresarial." />
      </Helmet>

      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="text-center lg:text-left">
             <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/4cd8d26e-17de-4418-8aea-8511bad9fc35/792c2a1fa0ddae5de74a2f3eee93364d.png" alt="FertiCore Logo" className="h-16 mx-auto lg:mx-0 mb-4" />
            <p className="text-xl text-gray-600 mb-8">
              Solicite acesso ao sistema mais completo de gestão empresarial
            </p>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <p className="text-gray-700">Preencha seus dados</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <p className="text-gray-700">Aguarde aprovação do administrador</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <p className="text-gray-700">Acesse todos os módulos permitidos</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
                <UserPlus className="h-6 w-6 text-green-600" />
                Criar Conta
              </CardTitle>
              <CardDescription className="text-gray-500">
                Preencha os dados para solicitar acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      className="input-glow"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className="input-glow"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input-glow"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input-glow"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Select onValueChange={handleSelectChange} required>
                      <SelectTrigger className="input-glow">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="Seu cargo"
                      className="input-glow"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>

                <div className="text-center">
                  <p className="text-gray-600">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
                      Faça login aqui
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
