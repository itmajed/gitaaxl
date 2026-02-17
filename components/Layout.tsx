import React, { useState, useEffect } from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#020617]" dir="rtl">
      <header className={`fixed top-0 w-full z-50 px-3 sm:px-4 pt-3 sm:pt-4 transition-all duration-300 ${scrolled ? 'pt-1 sm:pt-2' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`glass-card rounded-2xl px-4 sm:px-6 py-3 flex justify-between items-center transition-all duration-300 ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="gradient-button p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-black text-white tracking-tight">سيرة AI</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#hero" className="text-slate-400 hover:text-white font-medium transition-colors text-sm">الرئيسية</a>
              <a href="#features" className="text-slate-400 hover:text-white font-medium transition-colors text-sm">المميزات</a>
              <a href="#pricing" className="text-slate-400 hover:text-white font-medium transition-colors text-sm">الأسعار</a>
              <a href="#contact" className="text-slate-400 hover:text-white font-medium transition-colors text-sm">تواصل معنا</a>
            </nav>

            <div className="hidden md:block">
              <a href="#hero" className="gradient-button text-white px-6 py-2.5 rounded-xl font-bold shadow-lg text-sm">ابدأ الآن</a>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white bg-transparent border-none cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="القائمة">
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>

          <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="glass-card rounded-2xl px-4 py-4 space-y-2">
              <a href="#hero" onClick={() => setMenuOpen(false)} className="block text-slate-300 hover:text-white font-medium py-3 px-4 text-center rounded-xl hover:bg-white/5 transition-all">الرئيسية</a>
              <a href="#features" onClick={() => setMenuOpen(false)} className="block text-slate-300 hover:text-white font-medium py-3 px-4 text-center rounded-xl hover:bg-white/5 transition-all">المميزات</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-slate-300 hover:text-white font-medium py-3 px-4 text-center rounded-xl hover:bg-white/5 transition-all">الأسعار</a>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="block text-slate-300 hover:text-white font-medium py-3 px-4 text-center rounded-xl hover:bg-white/5 transition-all">تواصل معنا</a>
              <a href="#hero" onClick={() => setMenuOpen(false)} className="gradient-button block text-white px-6 py-3 rounded-xl font-bold shadow-lg text-center mt-2">ابدأ الآن</a>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 sm:pt-28 pb-12 sm:pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-600/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-purple-600/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">{children}</div>
      </main>

      <footer id="contact" className="border-t border-slate-800/50 py-10 sm:py-14 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center sm:text-right">
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="gradient-button p-1.5 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="text-lg font-black text-white">سيرة AI</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">منصة ذكية لتحسين السير الذاتية باستخدام الذكاء الاصطناعي</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm">روابط سريعة</h4>
              <div className="flex flex-col gap-2">
                <a href="#hero" className="text-slate-500 hover:text-white text-sm transition-colors">الرئيسية</a>
                <a href="#pricing" className="text-slate-500 hover:text-white text-sm transition-colors">الأسعار</a>
                <a href="#features" className="text-slate-500 hover:text-white text-sm transition-colors">المميزات</a>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm">تواصل معنا</h4>
              <a href="mailto:info@aaxl.net" className="text-blue-400 hover:text-blue-300 text-sm transition-colors flex items-center gap-2 justify-center sm:justify-start">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                info@aaxl.net
              </a>
              <p className="text-slate-500 text-xs">للدعم والاستفسارات</p>
            </div>
          </div>
          <div className="border-t border-slate-800/50 mt-8 pt-6 text-center">
            <p className="text-slate-600 text-xs">© 2025 سيرة AI - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
