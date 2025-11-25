'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { 
  CheckSquare, 
  CalendarDays, 
  FileText, 
  BarChart3, 
  DollarSign, 
  Zap, 
  Shield, 
  Lock, 
  Eye,
  X
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MavitLogo } from '@/components/ui/MavitLogo';
import { toast } from 'react-hot-toast';

export default function MavitLanding() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

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
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
    } catch (error) {
      // Error handled in AuthProvider
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      await register({ 
        name, 
        email, 
        password, 
        confirmPassword: password 
      });
    } catch (error) {
      // Error handled in AuthProvider
    } finally {
      setIsLoading(false);
    }
  };

  const AuthForm = ({ isModal = false }) => (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="grid grid-cols-2 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('login')}
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'login'
              ? 'bg-red-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Entrar
        </button>
        <button
          onClick={() => setActiveTab('signup')}
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'signup'
              ? 'bg-red-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Cadastrar
        </button>
      </div>

      {/* Login Form */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Entrar'}
          </button>
        </form>
      )}

      {/* Register Form */}
      {activeTab === 'signup' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Seu nome completo"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={8}
            />
            <p className="text-xs text-gray-400 mt-1">
              Mínimo 8 caracteres, inclua maiúscula, minúscula, número e símbolo
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Criar Conta'}
          </button>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Ao criar uma conta, você concorda com nossos{' '}
            <a href="#" className="text-red-400 hover:underline">
              Termos de Uso
            </a>
          </p>
        </form>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <MavitLogo size="md" showText={true} textSize="lg" />
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Privacidade por Design
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </button>
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
                <span className="text-red-500">Mavit</span>
                <br />
                <span className="text-white">Seu mega-app de produtividade!</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                O Mavit é o mega app que reúne tudo que você precisa: backlog inteligente, calendário, notas, listas
                organizadas e controle financeiro completo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-400">Privacidade Garantida</h3>
                    <p className="text-sm text-gray-400">Seus dados são seus. Criptografia end-to-end.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-400">Segurança Total</h3>
                    <p className="text-sm text-gray-400">Arquitetura zero-trust. Dados protegidos.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  Começar Agora
                </button>
                <div className="md:hidden flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  Zero Rastreamento
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center">
                Tudo que você precisa em <span className="text-red-500">um só lugar</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy and Security Section */}
            <div className="space-y-8 py-12 border-t border-gray-800">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">
                  <span className="text-red-500">Privacidade</span> e <span className="text-red-500">Segurança</span>{' '}
                  por Design
                </h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  Construído desde o início com os mais altos padrões de proteção de dados e privacidade do usuário.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-xl text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-400 mb-3">Criptografia End-to-End</h3>
                  <p className="text-gray-400">
                    Seus dados são criptografados antes mesmo de sair do seu dispositivo.
                  </p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-xl text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-400 mb-3">Zero Rastreamento</h3>
                  <p className="text-gray-400">
                    Não coletamos, vendemos ou compartilhamos seus dados pessoais.
                  </p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-xl text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-400 mb-3">Arquitetura Zero-Trust</h3>
                  <p className="text-gray-400">
                    Cada acesso é verificado, cada dado é protegido por padrão.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Login/Signup Sidebar */}
          <div className={`lg:sticky lg:top-8 ${showLoginModal ? "hidden lg:block" : ""}`}>
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-red-500">Entre no Mavit</h3>
                <p className="text-sm text-gray-400 mt-2">Acesse sua conta ou crie uma nova</p>
              </div>
              <AuthForm />
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <h3 className="text-xl font-bold text-red-500">Entre no Mavit</h3>
                <p className="text-sm text-gray-400 mt-1">Acesse sua conta ou crie uma nova</p>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white transition-colors ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AuthForm isModal={true} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-bold">
                <span className="text-red-500">Mavit</span>
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-red-400 transition-colors">
                Privacidade
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                Termos
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}