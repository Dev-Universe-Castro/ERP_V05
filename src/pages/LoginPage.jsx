
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"

// Usuários de teste
const testUsers = [
  {
    email: "admin@erp.com",
    password: "123456",
    name: "Administrador",
    role: "admin",
    permissions: [
      "cadastros",
      "estoque",
      "abastecimento",
      "producao",
      "logistica",
      "rh",
      "compras",
      "financeiro",
      "comercial",
      "workflow",
    ],
  },
  {
    email: "user@erp.com",
    password: "123456",
    name: "João Silva",
    role: "user",
    permissions: ["cadastros", "estoque", "comercial", "workflow"],
  },
  {
    email: "comercial@erp.com",
    password: "123456",
    name: "Maria Santos",
    role: "user",
    permissions: ["comercial", "cadastros", "workflow"],
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular delay de autenticação
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Verificar credenciais
    const user = testUsers.find((u) => u.email === formData.email && u.password === formData.password)

    if (user) {
      login(user)
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${user.name}!`,
      })
      navigate("/dashboard")
    } else {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const quickLogin = (userEmail) => {
    const user = testUsers.find((u) => u.email === userEmail)
    if (user) {
      setFormData({ email: user.email, password: user.password })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Helmet>
        <title>Login - ERP FertiCore</title>
        <meta
          name="description"
          content="Faça login no sistema ERP FertiCore para acessar todos os módulos de gestão empresarial."
        />
      </Helmet>

      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="text-center lg:text-left">
            <img
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/4cd8d26e-17de-4418-8aea-8511bad9fc35/792c2a1fa0ddae5de74a2f3eee93364d.png"
              alt="FertiCore Logo"
              className="h-16 mx-auto lg:mx-0 mb-4"
            />
            <p className="text-xl text-gray-600 mb-8">
              Acesse o sistema mais completo de gestão empresarial
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
              <p className="text-gray-700">Faça login com suas credenciais</p>
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
              <p className="text-gray-700">Acesse todos os módulos permitidos</p>
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
              <p className="text-gray-700">Gerencie seu negócio de forma integrada</p>
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
                <LogIn className="h-6 w-6 text-green-600" />
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-gray-500">
                Faça login para acessar o sistema ERP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 input-glow"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 input-glow"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>

              {/* Quick Login Buttons */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3 text-center">Login rápido para teste:</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start bg-transparent"
                    onClick={() => quickLogin("admin@erp.com")}
                  >
                    👑 Administrador (acesso total)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start bg-transparent"
                    onClick={() => quickLogin("user@erp.com")}
                  >
                    👤 Usuário (acesso limitado)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start bg-transparent"
                    onClick={() => quickLogin("comercial@erp.com")}
                  >
                    🛒 Comercial (módulo comercial)
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                    Cadastre-se
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
