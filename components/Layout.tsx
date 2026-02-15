
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans" dir="rtl">
      <header className="fixed top-0 w-full z-50 px-4 pt-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl px-6 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="gradient-button p-2 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-black text-white tracking-tight">سيرة AI</span>
            </div>
            <nav className="hidden md:flex space-x-reverse space-x-8">
              <a href="#" className="text-slate-400 hover:text-white font-medium transition-colors">الرئيسية</a>
              <a href="#" className="text-slate-400 hover:text-white font-medium transition-colors">النماذج</a>
              <a href="#" className="text-slate-400 hover:text-white font-medium transition-colors">الأسعار</a>
            </nav>
            <div>
              <button className="gradient-button text-white px-6 py-2 rounded-xl font-bold shadow-lg text-sm">
                ابدأ الآن
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-20 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-800/50 py-12 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-4">
             <div className="flex items-center space-x-reverse space-x-2 opacity-50">
              <div className="gradient-button p-1 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-black text-white">سيرة AI</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 سيرة AI - الذكاء الاصطناعي في خدمة طموحك المهني</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
