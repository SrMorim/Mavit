"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, CheckSquare, FileText, DollarSign, BarChart3, Zap, Shield, Lock, Eye } from "lucide-react"

export default function MavitLanding() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)

  const features = [
    {
      icon: CheckSquare,
      title: "Backlog Inteligente",
      description: "Gerencie suas tarefas diárias com priorização automática e organização intuitiva.",
    },
    {
      icon: CalendarDays,
      title: "Calendário Integrado",
      description: "Sincronize compromissos e prazos em uma visualização clara e funcional.",
    },
    {
      icon: FileText,
      title: "Bloco de Notas",
      description: "Capture ideias rapidamente com editor rico e busca avançada.",
    },
    {
      icon: BarChart3,
      title: "Listas Inteligentes",
      description: "Organize atividades por contexto, como no melhor estilo Apple.",
    },
    {
      icon: DollarSign,
      title: "Controle Financeiro",
      description: "Acompanhe gastos, receitas e previsões em tempo real.",
    },
    {
      icon: Zap,
      title: "Produtividade Total",
      description: "Tudo integrado em uma experiência fluida e poderosa.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-primary">Maver</span>
              <span className="text-foreground"> Tech</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Privacidade por Design
            </div>
            <Button variant="outline" size="sm">
              Saiba Mais
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Hero Section */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="text-primary">Mavit</span>
                <br />
                <span className="text-foreground">Seu mega-app de produtividade!</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                O Mavit é o mega app que reúne tudo que você precisa: backlog inteligente, calendário, notas, listas
                organizadas e controle financeiro completo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 p-6 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">Privacidade Garantida</h3>
                    <p className="text-sm text-muted-foreground">Seus dados são seus. Criptografia end-to-end.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">Segurança Total</h3>
                    <p className="text-sm text-muted-foreground">Arquitetura zero-trust. Dados protegidos.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => setShowLoginModal(true)}>
                  Começar Agora
                </Button>
                <div className="md:hidden flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  Zero Rastreamento
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center">
                Tudo que você precisa em <span className="text-primary">um só lugar</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
                    <CardHeader className="space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Privacy and Security Section */}
            <div className="space-y-8 py-12 border-t border-border/40">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">
                  <span className="text-primary">Privacidade</span> e <span className="text-primary">Segurança</span>{" "}
                  por Design
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Construído desde o início com os mais altos padrões de proteção de dados e privacidade do usuário.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20 text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-primary">Criptografia End-to-End</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Seus dados são criptografados antes mesmo de sair do seu dispositivo.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20 text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Eye className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-primary">Zero Rastreamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Não coletamos, vendemos ou compartilhamos seus dados pessoais.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20 text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-primary">Arquitetura Zero-Trust</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Cada acesso é verificado, cada dado é protegido por padrão.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Login/Signup Sidebar - Hidden on mobile when modal is active */}
          <div className={`lg:sticky lg:top-8 ${showLoginModal ? "hidden lg:block" : ""}`}>
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-primary text-xl">Entre no Mavit</CardTitle>
                <CardDescription className="text-center text-sm">Acesse sua conta ou crie uma nova</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Tabs defaultValue="login" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 h-10">
                    <TabsTrigger value="login" className="text-sm">
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm">
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium">
                        Senha
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 h-10 mt-6">Entrar</Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      <a href="#" className="text-primary hover:underline">
                        Esqueceu sua senha?
                      </a>
                    </p>
                  </TabsContent>
                  <TabsContent value="signup" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium">
                        Nome
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">
                        Senha
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 h-10 mt-6">Criar Conta</Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Ao criar uma conta, você concorda com nossos{" "}
                      <a href="#" className="text-primary hover:underline">
                        Termos de Uso
                      </a>
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="w-full max-w-md transform transition-all duration-300 ease-out animate-in slide-in-from-left-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card border-border shadow-2xl">
              <CardHeader className="relative pb-4">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                >
                  ✕
                </button>
                <CardTitle className="text-center text-primary text-xl pt-2">Entre no Mavit</CardTitle>
                <CardDescription className="text-center text-sm">Acesse sua conta ou crie uma nova</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Tabs defaultValue="login" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 h-10">
                    <TabsTrigger value="login" className="text-sm">
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm">
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="modal-login-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="modal-login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modal-login-password" className="text-sm font-medium">
                        Senha
                      </Label>
                      <Input
                        id="modal-login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 h-10 mt-6">Entrar</Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      <a href="#" className="text-primary hover:underline">
                        Esqueceu sua senha?
                      </a>
                    </p>
                  </TabsContent>
                  <TabsContent value="signup" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="modal-signup-name" className="text-sm font-medium">
                        Nome
                      </Label>
                      <Input
                        id="modal-signup-name"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modal-signup-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="modal-signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modal-signup-password" className="text-sm font-medium">
                        Senha
                      </Label>
                      <Input
                        id="modal-signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 h-10 mt-6">Criar Conta</Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Ao criar uma conta, você concorda com nossos{" "}
                      <a href="#" className="text-primary hover:underline">
                        Termos de Uso
                      </a>
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-bold">
                <span className="text-primary">Maver</span>
                <span className="text-foreground"> Tech</span>
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacidade
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Termos
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
