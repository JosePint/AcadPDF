import React from 'react';
import { GraduationCap, FileText } from 'lucide-react';

export default function BrandLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7"
  };

  return (
    <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
      {/* Outer Glow/Ring */}
      <div className="absolute inset-0 bg-blue-600/20 rounded-xl blur-md"></div>
      
      {/* Main Container */}
      <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg border border-white/20 flex items-center justify-center overflow-hidden">
        {/* PDF Document Symbol */}
        <FileText className={`${iconSizes[size]} text-white/90 translate-y-1`} />
        
        {/* Graduation Cap Overlay */}
        <div className="absolute top-1 right-1 bg-slate-900 rounded-full p-0.5 border border-white/10 shadow-sm">
           <GraduationCap className="w-2 h-2 md:w-3 md:h-3 text-blue-400" />
        </div>
        
        {/* Abstract Lines */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    </div>
  );
}
