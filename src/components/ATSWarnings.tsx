import React from "react";
import { ATSWarning } from "../utils/atsValidator";

interface ATSWarningsProps {
  warnings: ATSWarning[];
}

export default function ATSWarnings({ warnings }: ATSWarningsProps) {
  if (warnings.length === 0) {
    return (
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-emerald-400 font-bold text-sm">سيرتك متوافقة مع أنظمة ATS بالكامل!</span>
      </div>
    );
  }

  const errors = warnings.filter(w => w.type === 'error');
  const warningsList = warnings.filter(w => w.type === 'warning');
  const suggestions = warnings.filter(w => w.type === 'suggestion');

  return (
    <div className="space-y-2">
      <div className="text-white font-bold text-sm flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        فحص ATS ({warnings.length} ملاحظة)
      </div>

      {errors.map((w, i) => (
        <div key={`e-${i}`} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-red-400 text-xs">{w.message}</span>
        </div>
      ))}

      {warningsList.map((w, i) => (
        <div key={`w-${i}`} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-2">
          <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-yellow-400 text-xs">{w.message}</span>
        </div>
      ))}

      {suggestions.map((w, i) => (
        <div key={`s-${i}`} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-blue-400 text-xs">{w.message}</span>
        </div>
      ))}
    </div>
  );
}
