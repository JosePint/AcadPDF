/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AcademicWork } from '../types';
import { ChevronLeft, Save, Eye, FileOutput, CheckCircle, Loader2, Edit3, AlignLeft, ListOrdered, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

function ensureString(val: any): string {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join('\n\n');
  return JSON.stringify(val || '', null, 2);
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState<AcademicWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'intro' | 'dev' | 'conclusion' | 'refs'>('intro');
  const [content, setContent] = useState({
    introduction: '',
    development: '',
    conclusion: '',
    references: ''
  });

  useEffect(() => {
    const fetchWork = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'academicWorks', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as AcademicWork;
          setWork(data);
          setContent({
            introduction: ensureString(data.content.introduction),
            development: ensureString(data.content.development),
            conclusion: ensureString(data.content.conclusion),
            references: ensureString(data.content.references)
          });
        }
      } catch (error) {
        console.error('Error fetching work:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWork();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'academicWorks', id);
      await updateDoc(docRef, {
        content: content,
        updatedAt: serverTimestamp()
      });
      setSaving(false);
    } catch (error) {
      console.error('Save failed:', error);
      setSaving(false);
    }
  };

  const handleExport = () => navigate(`/preview/${id}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!work) return <div>Trabalho não encontrado.</div>;

  return (
    <div className="min-h-screen flex flex-col mesh-bg text-slate-200">
      {/* Editor Header */}
      <header className="glass border-b border-white/10 h-16 flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
             <h1 className="font-display font-bold truncate text-sm max-w-md text-white">{work.title}</h1>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{work.norms} • {work.academicLevel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="btn btn-secondary h-10 px-4 text-xs font-bold border-white/5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Save className="w-4 h-4 text-slate-500" />}
            <span className="hidden sm:inline">Salvar</span>
          </button>
          <button onClick={handleExport} className="btn btn-primary h-10 px-4 text-xs">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Visualizar e Exportar</span>
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-64 glass border-r border-white/10 hidden md:flex flex-col p-4 m-4 mr-2 rounded-2xl">
           <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-2">Estrutura</h2>
           <nav className="space-y-1">
              <TabButton active={activeTab === 'intro'} onClick={() => setActiveTab('intro')} icon={<AlignLeft className="w-4 h-4" />} label="Introdução" />
              <TabButton active={activeTab === 'dev'} onClick={() => setActiveTab('dev')} icon={<Edit3 className="w-4 h-4" />} label="Desenvolvimento" />
              <TabButton active={activeTab === 'conclusion'} onClick={() => setActiveTab('conclusion')} icon={<CheckCircle className="w-4 h-4" />} label="Conclusão" />
              <TabButton active={activeTab === 'refs'} onClick={() => setActiveTab('refs')} icon={<ListOrdered className="w-4 h-4" />} label="Referências" />
           </nav>
          
          <div className="mt-auto p-4 glass rounded-xl border-blue-500/20 bg-blue-500/5">
             <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Dica de IA</span>
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed">Refine o texto para torná-lo mais alinhado com a sua pesquisa pessoal.</p>
          </div>
        </div>

        {/* Content Tabs (Mobile) */}
        <div className="md:hidden flex glass border-b border-white/5 justify-around overflow-x-auto no-scrollbar">
            <MobileTab active={activeTab === 'intro'} onClick={() => setActiveTab('intro')} label="Intro" />
            <MobileTab active={activeTab === 'dev'} onClick={() => setActiveTab('dev')} label="Desv." />
            <MobileTab active={activeTab === 'conclusion'} onClick={() => setActiveTab('conclusion')} label="Conc." />
            <MobileTab active={activeTab === 'refs'} onClick={() => setActiveTab('refs')} label="Refs" />
        </div>

        {/* Main Editor Pane */}
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden p-4 lg:pl-2">
           {/* Textarea Area */}
           <div className="flex-1 h-full flex flex-col pr-0 lg:pr-4">
              <div className="glass rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-400" />
                    {getTabLabel(activeTab)}
                  </h2>
                  <span className="text-[10px] text-slate-500 font-mono italic">Autosave ok</span>
                </div>
                <textarea 
                  className="flex-1 w-full p-8 text-slate-300 leading-relaxed font-sans text-base bg-transparent focus:ring-0 outline-none resize-none placeholder:text-slate-700"
                  value={ensureString(content[activeTab === 'intro' ? 'introduction' : activeTab === 'dev' ? 'development' : activeTab === 'conclusion' ? 'conclusion' : 'references'])}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContent(prev => ({
                      ...prev,
                      [activeTab === 'intro' ? 'introduction' : activeTab === 'dev' ? 'development' : activeTab === 'conclusion' ? 'conclusion' : 'references']: val
                    }));
                  }}
                  spellCheck={false}
                  placeholder="Escreva o conteúdo aqui..."
                />
              </div>
           </div>

           {/* Preview Pane */}
           <div className="hidden lg:flex w-[450px] flex-col overflow-hidden">
              <div className="glass rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2 text-slate-400 bg-white/5">
                  <FileOutput className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest leading-none">Prévia Formatação</span>
                </div>
                <div className="flex-1 p-6 overflow-y-auto bg-slate-900/40">
                  <div className="bg-white prose prose-slate max-w-none shadow-2xl border border-white/10 min-h-[600px] font-serif p-10 text-slate-900 rounded-sm">
                    <div className="markdown-body">
                      <ReactMarkdown>{ensureString(content[activeTab === 'intro' ? 'introduction' : activeTab === 'dev' ? 'development' : activeTab === 'conclusion' ? 'conclusion' : 'references'])}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${active ? 'active-link' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
    >
      <span className={active ? 'text-blue-400' : 'text-slate-600'}>{icon}</span>
      {label}
    </button>
  );
}

function MobileTab({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${active ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-600'}`}
    >
      {label}
    </button>
  );
}


function getTabLabel(tab: string) {
  switch (tab) {
    case 'intro': return 'Introdução';
    case 'dev': return 'Desenvolvimento';
    case 'conclusion': return 'Conclusão';
    case 'refs': return 'Referências';
    default: return '';
  }
}
