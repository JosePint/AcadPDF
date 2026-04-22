/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../lib/firebase';
import { GraduationCap, FileText, Sparkles, ShieldAlert, ChevronRight, Layout, BookOpen, Download } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen mesh-bg text-slate-200">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-display font-bold text-white">AcadPDF <span className="text-blue-400">AI</span></span>
          </div>
          <button onClick={handleLogin} className="btn btn-primary px-6">
            Entrar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6 border border-blue-500/20">
              <Sparkles className="w-4 h-4" />
              IA Académica Avançada
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
              Seus Trabalhos Académicos <br />
              <span className="text-blue-400">em Segundos com IA.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              AcadPDF AI gera estruturas completas, introduções detalhadas, 
              desenvolvimento formal e referências bibliográficas reais seguindo normas APA, ABNT ou MLA.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handleLogin} className="btn btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                Começar Agora Grátis
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="btn btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                Ver Exemplo
              </button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 rounded-2xl glass p-4 shadow-2xl overflow-hidden max-w-5xl mx-auto aspect-video"
          >
             <div className="w-full h-full bg-slate-900/40 rounded-xl flex items-center justify-center text-slate-500">
                <Layout className="w-16 h-16 opacity-20" />
                <span className="ml-4 font-medium opacity-50 uppercase tracking-widest text-xs">Preview do Dashboard</span>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Funcionalidades Profissionais</h2>
            <p className="text-slate-400">Tudo o que você precisa para obter as melhores notas.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen className="w-6 h-6 text-blue-400" />}
              title="Escrita Formal"
              description="IA treinada especificamente para linguagem académica formal e estruturada."
            />
            <FeatureCard 
              icon={<FileText className="w-6 h-6 text-blue-400" />}
              title="Índice Automático"
              description="Gera sumários organizados com numeração de páginas correta."
            />
            <FeatureCard 
              icon={<Download className="w-6 h-6 text-blue-400" />}
              title="Exportação PDF"
              description="Documentos prontos para impressão com capa, logo e formatação perfeita."
            />
          </div>
        </div>
      </section>

      {/* Anti-Plagiarism Notice */}
      <section className="py-12 border-t border-white/5 mb-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400/80 mb-4">
              <ShieldAlert className="w-6 h-6" />
              <span className="font-bold uppercase tracking-wider text-sm">Compromisso Ético</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed italic">
              "O AcadPDF AI é uma ferramenta de apoio à pesquisa e estruturação de ideias. Incentivamos o uso responsável da tecnologia. O plágio académico é uma infração grave; use o conteúdo gerado como base para sua própria investigação e aprendizagem."
            </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-100 italic text-slate-400 text-xs text-center">
        &copy; {new Date().getFullYear()} AcadPDF AI. Todos os direitos reservados.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="mb-4 bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}


