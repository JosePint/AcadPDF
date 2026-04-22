/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AcademicWork } from '../types';
import { Plus, LayoutGrid, List, FileText, Clock, ChevronRight, GraduationCap, LogOut, MoreVertical, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [works, setWorks] = useState<AcademicWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'academicWorks'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const worksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AcademicWork[];
      setWorks(worksData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleCreate = () => navigate('/create');

  return (
    <div className="min-h-screen flex mesh-bg text-slate-200">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 glass m-4 mr-2 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-display font-bold text-white">AcadPDF <span className="text-blue-400">AI</span></span>
          </div>
          
          <nav className="space-y-1">
            <SidebarLink icon={<FileText className="w-5 h-5" />} label="Meus Trabalhos" active />
            <SidebarLink icon={<Clock className="w-5 h-5" />} label="Recentes" />
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 group bg-white/5 rounded-xl border border-white/5">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-8 h-8 rounded-full" alt="" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-white">{user?.displayName}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest">{user?.email}</p>
            </div>
            <button onClick={() => signOut()} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col m-4 ml-2 overflow-hidden">
        {/* Header */}
        <header className="glass p-4 rounded-2xl mb-4 border border-white/10 flex justify-between items-center">
          <h1 className="text-xl font-display font-bold text-white px-2">Dashboard</h1>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center bg-slate-900/50 rounded-lg px-3 py-1.5 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                <Search className="w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Pesquisar..." className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48 text-slate-200 placeholder:text-slate-600" />
             </div>
             <button onClick={handleCreate} className="btn btn-primary h-10 px-4">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Novo Trabalho</span>
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-2 pb-10">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h2 className="text-2xl font-bold text-white">Seus Trabalhos</h2>
                <p className="text-slate-500 text-sm">Gerencie seus projetos académicos</p>
             </div>
             <div className="flex glass rounded-lg border border-white/5 p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <List className="w-4 h-4" />
                </button>
             </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          ) : works.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border border-dashed border-white/10">
               <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                  <FileText className="w-10 h-10 text-blue-400" />
               </div>
               <h3 className="text-xl font-bold mb-2 text-white">Nenhum trabalho encontrado</h3>
               <p className="text-slate-500 max-w-xs mx-auto mb-8">
                  Você ainda não gerou nenhum trabalho académico. Comece agora mesmo!
               </p>
               <button onClick={handleCreate} className="btn btn-primary px-8">
                  Criar Primeiro Trabalho
               </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-4'}>
              <AnimatePresence>
                {works.map((work) => (
                  <WorkCard key={work.id} work={work} mode={viewMode} onClick={() => navigate(`/edit/${work.id}`)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'active-link' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}>
      {icon}
      {label}
    </button>
  );
}

function WorkCard({ work, mode, onClick }: { work: AcademicWork, mode: 'grid' | 'list', onClick: () => void }) {
  const date = work.createdAt?.toDate ? work.createdAt.toDate().toLocaleDateString('pt-PT') : 'Recentemente';

  if (mode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group border border-white/5"
        onClick={onClick}
      >
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold truncate text-white">{work.title}</h4>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">{work.institution}</p>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="hidden sm:inline border border-white/10 px-2 py-0.5 rounded-md">{work.norms}</span>
          <span className="hidden sm:inline">{date}</span>
          <div className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20">
            {work.status}
          </div>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-600" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl flex flex-col hover:bg-white/5 transition-all cursor-pointer group border border-white/10"
      onClick={onClick}
    >
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
           <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
             <FileText className="w-5 h-5" />
           </div>
           <button className="p-1 hover:bg-white/10 rounded-md transition-colors">
              <MoreVertical className="w-4 h-4 text-slate-600" />
           </button>
        </div>
        <h4 className="font-bold text-lg mb-1 leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 text-white">{work.title}</h4>
        <p className="text-[10px] text-slate-500 font-mono mb-4 uppercase tracking-widest">{work.institution}</p>
        <div className="flex items-center gap-2 flex-wrap">
           <span className="px-2 py-1 rounded bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-white/5">{work.norms}</span>
           <span className="px-2 py-1 rounded bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-white/5">{work.academicLevel}</span>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/5">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {date}
        </span>
        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
      </div>
    </motion.div>
  );
}

