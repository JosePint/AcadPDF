/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { AcademicWork } from '../types';
import { ChevronLeft, Download, Share2, Loader2, FileText, Printer, CheckCircle, GraduationCap, LogOut } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import ReactMarkdown from 'react-markdown';

function ensureString(val: any): string {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join('\n\n');
  return JSON.stringify(val || '', null, 2);
}

export default function Preview() {
  const { signOut } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState<AcademicWork | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWork = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'academicWorks', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWork(docSnap.data() as AcademicWork);
        }
      } catch (error) {
        console.error('Error fetching work:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWork();
  }, [id]);

  const generatePdf = async () => {
    if (!work) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 0. Logo handling
    if (work.logoUrl) {
      try {
        // Simple attempt to add image
        doc.addImage(work.logoUrl, 'PNG', pageWidth / 2 - 15, 30, 30, 30);
      } catch (e) {
        console.warn('Could not add logo to PDF due to CORS or image format', e);
      }
    }

    // 1. Cover Page
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text(work.institution.toUpperCase(), pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(work.studentName.toUpperCase(), pageWidth / 2, 60, { align: 'center' });

    doc.setFontSize(18);
    const titleLines = doc.splitTextToSize(work.title.toUpperCase(), pageWidth - 40);
    doc.text(titleLines, pageWidth / 2, 100, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text(`Curso: ${work.course}`, pageWidth / 2, 180, { align: 'center' });
    doc.text(`Professor: ${work.professor}`, pageWidth / 2, 190, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Nível de Ensino: ${work.academicLevel}`, pageWidth / 2, 230, { align: 'center' });
    doc.text(`Normas: ${work.norms}`, pageWidth / 2, 240, { align: 'center' });

    doc.text(new Date().getFullYear().toString(), pageWidth / 2, 270, { align: 'center' });

    // 2. Table of Contents
    doc.addPage();
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('ÍNDICE', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.text('1. Introdução ........................................................................................................... 3', 25, 45);
    doc.text('2. Desenvolvimento ................................................................................................ 4', 25, 55);
    doc.text('3. Conclusão ............................................................................................................ 6', 25, 65);
    doc.text('4. Referências Bibliográficas .................................................................................. 7', 25, 75);

    // 3. Main Sections
    const addSection = (title: string, content: string, startPage: number) => {
      doc.addPage();
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text(title.toUpperCase(), 25, 25);
      
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      const textLines = doc.splitTextToSize(content, pageWidth - 50);
      
      let cursorY = 40;
      textLines.forEach((line: string) => {
         if (cursorY > pageHeight - 30) {
            doc.addPage();
            cursorY = 25;
         }
         doc.text(line, 25, cursorY);
         cursorY += 7;
      });
    };

    addSection('1. INTRODUÇÃO', ensureString(work.content.introduction), 3);
    addSection('2. DESENVOLVIMENTO', ensureString(work.content.development), 4);
    addSection('3. CONCLUSÃO', ensureString(work.content.conclusion), 6);
    addSection('4. REFERÊNCIAS BIBLIOGRÁFICAS', ensureString(work.content.references), 7);

    // Page numbers
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
       doc.setPage(i);
       if (i > 1) { // No number on cover
         doc.setFontSize(10);
         doc.text(`${i}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
       }
    }

    doc.save(`${work.title.replace(/\s+/g, '_')}_AcadPDF.pdf`);
  };

  const generateDocx = async () => {
    if (!work) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Cover Page
            ...(work.logoUrl ? [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "LOGÓTIPO DA INSTITUIÇÃO", size: 16, color: "888888" }),
                ],
                spacing: { after: 500 },
              })
            ] : []),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: work.institution.toUpperCase(), bold: true, size: 28 }),
              ],
              spacing: { after: 1000 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: work.studentName.toUpperCase(), bold: true, size: 32 }),
              ],
              spacing: { after: 2000 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: work.title.toUpperCase(), bold: true, size: 36 }),
              ],
              spacing: { after: 4000 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `Curso: ${work.course}`, size: 24 }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `Professor: ${work.professor}`, size: 24 }),
              ],
              spacing: { after: 2000 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `Nível de Ensino: ${work.academicLevel}`, size: 24 }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `Normas: ${work.norms}`, size: 24 }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: new Date().getFullYear().toString(), size: 24 }),
              ],
              spacing: { before: 2000 },
            }),

            // Break to Next Page
            new Paragraph({ text: "", pageBreakBefore: true }),

            // Table of Contents (Simplified)
            new Paragraph({
              alignment: AlignmentType.CENTER,
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: "ÍNDICE", bold: true })],
              spacing: { after: 400 },
            }),
            new Paragraph({ children: [new TextRun({ text: "1. Introdução" })] }),
            new Paragraph({ children: [new TextRun({ text: "2. Desenvolvimento" })] }),
            new Paragraph({ children: [new TextRun({ text: "3. Conclusão" })] }),
            new Paragraph({ children: [new TextRun({ text: "4. Referências Bibliográficas" })] }),

            // Sections
            new Paragraph({ text: "", pageBreakBefore: true }),
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: "1. INTRODUÇÃO", bold: true })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun(ensureString(work.content.introduction))],
            }),

            new Paragraph({ text: "", pageBreakBefore: true }),
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: "2. DESENVOLVIMENTO", bold: true })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun(ensureString(work.content.development))],
            }),

            new Paragraph({ text: "", pageBreakBefore: true }),
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: "3. CONCLUSÃO", bold: true })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun(ensureString(work.content.conclusion))],
            }),

            new Paragraph({ text: "", pageBreakBefore: true }),
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: "4. REFERÊNCIAS BIBLIOGRÁFICAS", bold: true })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun(ensureString(work.content.references))],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${work.title.replace(/\s+/g, '_')}_AcadPDF.docx`);
  };

  const shareWhatsApp = () => {
    if (!work) return;
    const text = `Confira meu trabalho académico gerado pelo AcadPDF AI: *${work.title}*. Ficou fenomenal!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

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
      <header className="glass border-b border-white/10 h-16 flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/edit/${id}`)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 group flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Voltar ao Editor</span>
          </button>
          <h1 className="font-display font-bold text-white hidden sm:inline">Visualização Final</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 mr-4 opacity-100 transition-opacity px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <BrandLogo size="sm" className="scale-75" />
            <span className="text-[7px] text-slate-300 font-bold uppercase tracking-widest whitespace-nowrap">AcadPDF AI Studio</span>
          </div>
          <button onClick={shareWhatsApp} className="btn btn-secondary h-10 px-4 border-white/5">
            <Share2 className="w-4 h-4 text-green-400" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
          <button onClick={generatePdf} className="btn btn-primary h-10 px-6">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar PDF Final</span>
          </button>
          <button onClick={generateDocx} className="btn btn-secondary h-10 px-4 border-white/5 bg-slate-800 hover:bg-slate-700">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Exportar DOCX</span>
          </button>
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
          <button onClick={() => signOut()} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Sair da Conta">
             <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-12 flex flex-col items-center gap-12 bg-slate-900/40">
        {/* Page Labels & Progress */}
        <div className="w-full max-w-[210mm] flex items-center justify-between glass px-6 py-3 rounded-2xl border border-white/5 shadow-2xl">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                 <FileText className="w-4 h-4" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Documento Gerado</p>
                 <p className="text-white text-xs font-bold">{work.norms} Standard Edition</p>
              </div>
           </div>
           <div className="flex items-center gap-2 text-green-400">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                 <p className="text-xs font-bold">Verificado</p>
              </div>
              <CheckCircle className="w-5 h-5" />
           </div>
        </div>

        {/* Document Pages */}
        <div className="space-y-12">
          {/* Cover */}
          <DocumentPage className="items-center text-center py-20 relative">
             <div className="absolute top-10 right-10 opacity-20 select-none text-slate-200">
                <GraduationCap className="w-20 h-20" />
             </div>
             
             {work.logoUrl ? (
               <div className="w-32 h-32 mb-8 flex items-center justify-center overflow-hidden">
                  <img src={work.logoUrl} alt="Institution Logo" className="max-w-full max-h-full object-contain" />
               </div>
             ) : (
               <div className="w-16 h-16 rounded-xl bg-slate-50 mb-12 flex items-center justify-center text-slate-300 border-2 border-slate-100 font-bold text-xl">
                  {work.institution.charAt(0).toUpperCase()}
               </div>
             )}
             
             <p className="text-base font-bold mb-16 tracking-[0.2em]">{work.institution.toUpperCase()}</p>
             <p className="text-xl font-bold mb-32 tracking-wider">{work.studentName.toUpperCase()}</p>
             <div className="py-16 border-y-2 border-slate-900 w-full mb-32 relative">
                <h1 className="text-3xl font-black leading-tight uppercase tracking-tight text-slate-900">{work.title}</h1>
             </div>
             <div className="space-y-2 text-sm text-slate-900">
                <p><span className="text-slate-400 font-normal">Curso:</span> <span className="font-bold">{work.course}</span></p>
                <p><span className="text-slate-400 font-normal">Docente:</span> <span className="font-bold">{work.professor}</span></p>
             </div>
             <p className="mt-auto font-black tracking-[0.5em] text-sm pt-20 text-slate-900">LUBANGO, {new Date().getFullYear()}</p>
          </DocumentPage>

          <DocumentPage>
             <h2 className="text-center text-xl font-bold mb-16 underline underline-offset-8 text-slate-900">ÍNDICE</h2>
             <div className="space-y-6 text-base px-10 text-slate-900">
                {[
                  { l: "1. Introdução", p: "03" },
                  { l: "2. Desenvolvimento", p: "04" },
                  { l: "3. Conclusão", p: "06" },
                  { l: "4. Referências Bibliográficas", p: "07" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-end gap-2">
                     <span className="font-bold">{item.l}</span>
                     <div className="flex-1 border-b border-dotted border-slate-300 mb-1"></div>
                     <span className="font-bold">{item.p}</span>
                  </div>
                ))}
             </div>
          </DocumentPage>

          <DocumentPage>
             <h2 className="text-base font-bold mb-8 border-l-4 border-slate-900 pl-4 uppercase text-slate-900">1. INTRODUÇÃO</h2>
             <div className="markdown-body text-slate-800 leading-relaxed text-sm text-justify prose prose-slate">
                <ReactMarkdown>{ensureString(work.content.introduction)}</ReactMarkdown>
             </div>
          </DocumentPage>

          <DocumentPage>
             <h2 className="text-base font-bold mb-8 border-l-4 border-slate-900 pl-4 uppercase text-slate-900">2. DESENVOLVIMENTO</h2>
             <div className="markdown-body text-slate-800 leading-relaxed text-sm text-justify prose prose-slate">
                <ReactMarkdown>{ensureString(work.content.development)}</ReactMarkdown>
             </div>
          </DocumentPage>

          <DocumentPage>
             <h2 className="text-base font-bold mb-8 border-l-4 border-slate-900 pl-4 uppercase text-slate-900">3. CONCLUSÃO</h2>
             <div className="markdown-body text-slate-800 leading-relaxed text-sm text-justify prose prose-slate">
                <ReactMarkdown>{ensureString(work.content.conclusion)}</ReactMarkdown>
             </div>
          </DocumentPage>

          <DocumentPage>
             <h2 className="text-base font-bold mb-8 border-l-4 border-slate-900 pl-4 uppercase text-slate-900">4. REFERÊNCIAS BIBLIOGRÁFICAS</h2>
             <div className="markdown-body text-slate-800 leading-relaxed text-xs prose prose-slate">
                <ReactMarkdown>{ensureString(work.content.references)}</ReactMarkdown>
             </div>
          </DocumentPage>
        </div>
      </div>
    </div>
  );
}

function DocumentPage({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white w-[210mm] min-h-[297mm] shadow-[0_0_50px_rgba(0,0,0,0.05)] p-[25mm] font-serif flex flex-col ${className}`}>
      {children}
    </div>
  );
}
