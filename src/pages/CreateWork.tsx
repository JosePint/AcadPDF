/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ai, MODELS } from '../lib/gemini';
import { AcademicWork } from '../types';
import { ChevronLeft, Sparkles, Wand2, Info, GraduationCap, Building2, User, UserCheck, BookOpen, Layers, FileType, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function CreateWork() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    studentName: user?.displayName || '',
    institution: '',
    course: '',
    professor: '',
    academicLevel: 'Universidade' as 'Ensino Médio' | 'Universidade',
    norms: 'APA' as 'APA' | 'ABNT' | 'MLA',
    pages: 5,
    logoUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateContent = async () => {
    if (!formData.title || !formData.institution) return;
    
    setLoading(true);
    try {
      const prompt = `Crie um trabalho académico estruturado sobre o tema: "${formData.title}".
      Nível: ${formData.academicLevel}. 
      Normas: ${formData.norms}.
      Instituição: ${formData.institution}.
      
      O trabalho deve incluir:
      1. Uma INTRODUÇÃO sólida (cerca de 300-500 palavras).
      2. DESENVOLVIMENTO dividido em pelo menos 3 subtítulos pertinentes ao tema (total cerca de 1500-2000 palavras).
      3. CONCLUSÃO que sintetize os principais achados.
      4. REFERÊNCIAS bibliográficas realistas e formatadas segundo a norma ${formData.norms} (pelo menos 5 fontes).
      
      Retorne em formato JSON estruturado com as chaves: introduction, development (contendo subtítulos e texto), conclusion, references.
      Use linguagem formal e académica de alta qualidade.`;

      const response = await ai.models.generateContent({
        model: MODELS.FLASH,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const aiData = JSON.parse(response.text || '{}');
      
      const newWork: Partial<AcademicWork> = {
        ...formData,
        content: {
          introduction: typeof aiData.introduction === 'string' ? aiData.introduction : JSON.stringify(aiData.introduction || '', null, 2),
          development: typeof aiData.development === 'string' ? aiData.development : JSON.stringify(aiData.development || '', null, 2),
          conclusion: typeof aiData.conclusion === 'string' ? aiData.conclusion : JSON.stringify(aiData.conclusion || '', null, 2),
          references: typeof aiData.references === 'string' ? aiData.references : Array.isArray(aiData.references) ? aiData.references.join('\n\n') : JSON.stringify(aiData.references || '', null, 2)
        },
        ownerId: user?.uid || '',
        status: 'generated',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'academicWorks'), newWork);
      navigate(`/edit/${docRef.id}`);
    } catch (error) {
      console.error('Error generating work:', error);
      alert('Ocorreu um erro ao gerar o trabalho. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg pb-20 text-slate-200">
      <header className="glass border-b border-white/10 h-16 flex items-center px-4 sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-lg mr-4 transition-colors text-slate-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-white">Criar Novo Trabalho</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-white/10 p-8"
        >
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/5">
             <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
                <Wand2 className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Configuração do Projeto</h2>
                <p className="text-slate-500 text-sm">Forneça os detalhes para a geração com IA</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid md:grid-cols-1 gap-6">
              <FormGroup icon={<BookOpen />} label="Tema do Trabalho" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: O Impacto da IA na Educação Superior em Angola" />
            </div>

            {/* Row 2 */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormGroup icon={<User />} label="Nome do Estudante" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Seu nome completo" />
              <FormGroup icon={<Building2 />} label="Instituição" name="institution" value={formData.institution} onChange={handleChange} placeholder="Ex: UNISAN" />
            </div>

            {/* Row 3 */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormGroup icon={<Layers />} label="Curso" name="course" value={formData.course} onChange={handleChange} placeholder="Ex: Engenharia Informática" />
              <FormGroup icon={<UserCheck />} label="Nome do Professor" name="professor" value={formData.professor} onChange={handleChange} placeholder="Nome do docente" />
            </div>

            {/* Row 4 */}
            <div className="grid md:grid-cols-3 gap-6">
              <SelectGroup 
                icon={<GraduationCap />} 
                label="Nível" 
                name="academicLevel" 
                value={formData.academicLevel} 
                onChange={handleChange} 
                options={[
                  { value: 'Ensino Médio', label: 'Ensino Médio' },
                  { value: 'Universidade', label: 'Universidade' }
                ]} 
              />
              <SelectGroup 
                icon={<FileType />} 
                label="Normas" 
                name="norms" 
                value={formData.norms} 
                onChange={handleChange} 
                options={[
                  { value: 'APA', label: 'APA 7ª Ed.' },
                  { value: 'ABNT', label: 'ABNT' },
                  { value: 'MLA', label: 'MLA' }
                ]} 
              />
              <FormGroup 
                icon={<FileType />} 
                type="number"
                label="Páginas (Estimativa)" 
                name="pages" 
                value={formData.pages.toString()} 
                onChange={handleChange} 
                placeholder="5" 
              />
            </div>

             {/* Logo Upload Mockup */}
             <div className="p-6 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 group hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:scale-110 transition-all border border-white/5 shadow-inner">
                   <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-400 group-hover:text-blue-400">Logo da Instituição (Opcional)</span>
                <span className="text-[10px] text-slate-600 uppercase tracking-widest"> PNG ou JPG • Max 5MB</span>
             </div>

             {/* Disclaimer */}
             <div className="flex gap-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 mt-4">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/70 leading-relaxed">
                   <strong>AVISO ÉTICO:</strong> Esta ferramenta gera conteúdos originais. O plágio é uma infracção grave. Use a IA para estruturar e inspirar, mas adicione sua própria análise.
                </p>
             </div>

             <button 
                onClick={generateContent}
                disabled={loading || !formData.title || !formData.institution}
                className={`btn btn-primary w-full py-4 text-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/30 font-display font-medium`}
             >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Tecendo Conhecimento...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Gerar Documento com IA
                  </>
                )}
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FormGroup({ icon, label, name, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 group-focus-within:text-blue-400 transition-colors">
        {icon && <span className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500">{icon}</span>}
        {label}
      </label>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
}

function SelectGroup({ icon, label, name, value, onChange, options }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 group-focus-within:text-blue-400 transition-colors">
        {icon && <span className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500">{icon}</span>}
        {label}
      </label>
      <select 
        name={name}
        value={value}
        onChange={onChange}
        className="input-field appearance-none cursor-pointer"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">{opt.label}</option>
        ))}
      </select>
    </div>
  );
}



