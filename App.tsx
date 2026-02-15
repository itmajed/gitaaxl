
import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Step, GeneratedResume } from './types';
import { processResume } from './geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Welcome);
  const [isPremium, setIsPremium] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResume | null>(null);
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    setError(null);
    setStep(Step.Processing);
    try {
      const base64 = await blobToBase64(file);
      const data = await processResume({ 
        file: { data: base64, mimeType: file.type } 
      });
      setResult(data);
      setStep(Step.Preview);
    } catch (err: any) {
      setError(err.message);
      setStep(Step.Input);
    }
  };

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) {
      setError("يرجى لصق نص السيرة الذاتية أولاً");
      return;
    }
    setError(null);
    setStep(Step.Processing);
    try {
      const data = await processResume({ text: pastedText });
      setResult(data);
      setStep(Step.Preview);
    } catch (err: any) {
      setError(err.message);
      setStep(Step.Input);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsUploading(true);
  };

  const handleDragLeave = () => {
    setIsUploading(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsUploading(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const LockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={`${className} text-slate-400`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 overflow-visible">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border-r-4 border-red-500 text-red-400 font-bold rounded-xl animate-in fade-in slide-in-from-top-2 z-50 relative">
            {error}
          </div>
        )}

        {step === Step.Welcome && (
          <div className="space-y-32 pb-32">
            {/* 1 & 2: Hero & Visual Analysis Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-12 md:pt-20">
              <div className="text-right space-y-8 order-2 lg:order-1">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-card text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]"></span>
                  تكنولوجيا التوظيف بالذكاء الاصطناعي
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                  سيرتك الذاتية هي <br />
                  <span className="gradient-text">بوابتك للقمة</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed font-medium">
                  نحن لا نكتب الكلمات، بل نصمم مستقبلك. حوّل خبراتك التقليدية إلى إنجازات استراتيجية تخطف الأنظار وتتجاوز أنظمة الفرز الآلي بذكاء استشاري بشري.
                </p>
                
                <div className="flex flex-col items-start gap-6">
                  <button 
                    onClick={() => setStep(Step.Input)}
                    className="gradient-button px-14 py-6 text-white rounded-2xl font-black text-2xl shadow-2xl shadow-blue-900/40 w-full md:w-auto"
                  >
                    ارتقِ بمستقبلك المهني الآن
                  </button>
                  <div className="flex items-center gap-6 opacity-60">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      آمن 100%
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      متوافق مع ATS
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Analysis Card */}
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  
                  <div className="flex justify-between items-center mb-10">
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">تحليل الذكاء الاصطناعي</span>
                      <h4 className="text-white text-xl font-black">تقييم السيرة الذاتية</h4>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-2xl border border-indigo-500/30">
                      84%
                    </div>
                  </div>

                  <div className="space-y-8 mb-10">
                    <div>
                      <div className="flex justify-between text-xs font-black mb-2">
                        <span className="text-slate-400">ATS COMPATIBILITY</span>
                        <span className="text-indigo-400">92%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[92%] shadow-[0_0_10px_#6366f1]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-black mb-2">
                        <span className="text-slate-400">KEYWORD STRENGTH</span>
                        <span className="text-blue-400">78%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[78%] shadow-[0_0_10px_#3b82f6]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0">✨</div>
                      <div className="text-right">
                        <p className="text-white text-sm font-black mb-1">رسالة التحسين</p>
                        <p className="text-slate-400 text-[11px] leading-relaxed font-bold">تم رصد ضعف في صياغة الإنجازات. ننصح باستخدام أفعال حركة أقوى لتحسين فرص القبول بنسبة 45%.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3: How it Works */}
            <div className="space-y-16">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white mb-4">كيف تعمل سيرة AI؟</h2>
                <p className="text-slate-500 font-bold">ثلاث خطوات تفصلك عن وظيفة أحلامك</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: "01", title: 'ارفع ملفك', desc: 'ارفع سيرتك الذاتية الحالية بأي صيغة (PDF, Docx, Image).' },
                  { step: "02", title: 'تحليل ذكي', desc: 'يقوم محركنا بتحليل كل جملة ومقارنتها بمعايير التوظيف العالمية.' },
                  { step: "03", title: 'تحسين فوري', desc: 'احصل على نسخة استشارية تعيد صياغة خبراتك بأسلوب تنفيذي.' },
                ].map((f, i) => (
                  <div key={i} className="glass-card p-10 rounded-[2.5rem] text-right group hover:-translate-y-2 transition-all duration-500 border border-white/5">
                    <div className="text-4xl font-black text-white/5 mb-4 group-hover:text-indigo-500/20 transition-colors">{f.step}</div>
                    <h3 className="font-black text-2xl text-white mb-3 tracking-tight">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-bold">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4: Fear-based Persuasive Section */}
            <div className="glass-card rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1/2 h-full bg-indigo-600/5 blur-[100px] pointer-events-none"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">لا تدع الفرصة تفوتك <br/><span className="text-indigo-400">بسبب أخطاء بسيطة</span></h2>
                  <p className="text-slate-400 text-lg font-medium">9 من أصل 10 سير ذاتية يتم استبعادها في الثواني الست الأولى. لا تكن مجرد رقم آخر في قاعدة البيانات.</p>
                  <ul className="space-y-5">
                    {[
                      'تجاوز أنظمة الفرز الآلي (ATS) بذكاء',
                      'مراجعة احترافية شاملة للهيكل والمحتوى',
                      'تحسينات فورية قابلة للتطبيق لزيادة الجذب المهني'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-white font-black text-sm">
                        <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-white/5 text-center">
                  <div className="text-6xl mb-6">⚠️</div>
                  <h4 className="text-white text-xl font-black mb-4">هل تعلم؟</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-bold">معظم الشركات الكبرى تستخدم برامج ذكاء اصطناعي لفرز الموظفين قبل أن يرى البشر ملفك. إذا لم تكن لغتك "استراتيجية"، فلن تصل أبداً للمقابلة.</p>
                </div>
              </div>
            </div>

            {/* 6: Pricing Section */}
            <div className="space-y-16">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white mb-4">اختر خطة نجاحك</h2>
                <p className="text-slate-500 font-bold">استثمر في مستقبلك المهني اليوم</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center">
                  <h3 className="text-xl font-black text-white mb-2">الباقة المجانية</h3>
                  <div className="text-4xl font-black text-white mb-8">مجاناً</div>
                  <ul className="space-y-4 mb-10 w-full text-right opacity-60">
                    <li className="flex items-center justify-end gap-2 text-sm font-bold text-slate-400">تحليل أولي للسيرة <span>✓</span></li>
                    <li className="flex items-center justify-end gap-2 text-sm font-bold text-slate-400">إعادة صياغة الملخص المهني <span>✓</span></li>
                    <li className="flex items-center justify-end gap-2 text-sm font-bold text-slate-400 opacity-30">فتح كامل الخبرات الاستراتيجية <span>✕</span></li>
                    <li className="flex items-center justify-end gap-2 text-sm font-bold text-slate-400 opacity-30">تحميل ملف PDF عالي الجودة <span>✕</span></li>
                  </ul>
                  <button onClick={() => setStep(Step.Input)} className="w-full py-4 rounded-xl border border-white/10 text-white font-black hover:bg-white/5 transition">ابدأ مجاناً</button>
                </div>
                
                {/* Premium Plan */}
                <div className="glass-card p-10 rounded-[2.5rem] border-2 border-indigo-500/50 flex flex-col items-center text-center relative">
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">الأكثر اختياراً</div>
                  <h3 className="text-xl font-black text-white mb-2">التقرير الكامل</h3>
                  <div className="text-4xl font-black text-white mb-8">29 ريال <span className="text-sm font-normal text-slate-500">مرة واحدة</span></div>
                  <ul className="space-y-4 mb-10 w-full text-right">
                    <li className="flex items-center justify-end gap-2 text-sm font-bold text-white">تحليل استشاري عميق <span>✓</span></li>
                    <li className="flex items-center justify-end gap-2 text-sm font-bold text-white">إعادة هندسة الإنجازات (Executive) <span>✓</span></li>
                    <li className="flex items-center justify-end gap-2 text-sm font-bold text-white">تحسين الكلمات المفتاحية للـ ATS <span>✓</span></li>
                    <li className="flex items-center justify-end gap-2 text-sm font-bold text-white">تحميل ملف PDF جاهز للتقديم <span>✓</span></li>
                  </ul>
                  <button onClick={() => setStep(Step.Input)} className="w-full py-4 rounded-xl gradient-button text-white font-black shadow-xl shadow-indigo-500/20">فتح التقرير الكامل</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === Step.Input && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 py-12">
            <h2 className="text-3xl font-black text-white text-center">الخطوة الأولى: بياناتك الحالية</h2>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`glass-card p-12 rounded-[2.5rem] border-2 border-dashed transition-all duration-300 text-center cursor-pointer ${
                isUploading ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.doc,.docx,.jpg,.png" 
              />
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-400 shadow-xl border border-slate-800">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">ارفع سيرتك الذاتية</h3>
              <p className="text-slate-400 max-w-sm mx-auto">اسحب الملف هنا أو اضغط للاختيار (PDF, Word, JPG)</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">أو ألصق النص</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
              <textarea 
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full bg-slate-900/50 text-white px-6 py-5 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[200px] transition placeholder:text-slate-600 text-right"
                placeholder="ألصق محتوى سيرتك الذاتية هنا..."
              />
              <button 
                onClick={handleTextSubmit}
                className="w-full gradient-button text-white py-5 rounded-2xl font-black text-xl shadow-xl"
              >
                بدء الهندسة الذكية ✨
              </button>
            </div>
          </div>
        )}

        {step === Step.Processing && (
          <div className="text-center py-32 animate-in fade-in zoom-in">
            <div className="relative w-32 h-32 mx-auto mb-12">
               <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[40px] opacity-20 animate-pulse"></div>
               <div className="relative w-full h-full bg-slate-900 rounded-[2.5rem] border border-indigo-500/30 flex items-center justify-center shadow-2xl">
                <svg className="w-16 h-16 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-black text-white mb-6 tracking-tight">إعادة صياغة مسارك المهني</h2>
            <p className="text-slate-500 text-xl max-w-lg mx-auto leading-relaxed font-bold">
              مستشارك الاصطناعي يحلل كل نقطة قوة الآن لتقديمها بأفضل صورة ممكنة.
            </p>
          </div>
        )}

        {step === Step.Preview && result && (
          <div className="space-y-12 animate-in fade-in zoom-in duration-1000 pb-32">
            {/* 5: Premium Blur Card (Inside the Preview) */}
            <div className="glass-card p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center border-indigo-500/20 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16"></div>
              <div className="text-right relative z-10">
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">تحويل استراتيجي مكتمل</h2>
                <p className="text-slate-400">تم فتح الملخص المهني مجاناً. فتح التقرير الكامل متاح الآن بـ 29 ريال.</p>
              </div>
              <div className="mt-8 md:mt-0 flex gap-4 relative z-10">
                <button 
                  onClick={() => setIsPremium(true)}
                  className="gradient-button text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-indigo-500/30 transition transform hover:-translate-y-1 flex items-center gap-3"
                >
                  فتح التقرير الكامل — 29 ريال
                </button>
              </div>
            </div>

            {/* Resume Document Wrapper */}
            <div className="bg-white rounded-lg shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden relative resume-preview-container mx-auto max-w-[800px] p-16 text-right text-slate-900 border border-white/10">
              <div className="border-b-4 border-slate-900 pb-10 mb-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-5xl font-black mb-2 tracking-tight">{result.fullName}</h1>
                    <h2 className="text-2xl text-indigo-600 font-black">{result.jobTitle}</h2>
                  </div>
                  <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter self-start">AI Re-engineered</div>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-bold mt-6">
                  {result.location && <span className="flex items-center gap-2">📍 {result.location}</span>}
                  {result.email && <span className="flex items-center gap-2">📧 {result.email}</span>}
                  {result.phone && <span className="flex items-center gap-2">📱 {result.phone}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-14">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black flex items-center gap-3 text-slate-900">
                      <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                      الملخص التنفيذي الاستراتيجي
                    </h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-lg font-medium">
                    {result.summary}
                  </p>
                </section>

                <section className="relative">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black flex items-center gap-3 text-slate-900">
                      <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                      الخبرات المهنية (محسنة بالكامل)
                    </h3>
                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                      {!isPremium && <LockIcon className="w-3 h-3" />} Premium Only
                    </span>
                  </div>
                  
                  <div className={`space-y-12 transition-all duration-700 ${!isPremium ? 'filter blur-[18px] select-none opacity-20 pointer-events-none' : ''}`}>
                    {result.enhancedExperience.map((exp, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-black text-xl text-slate-900">{exp.title}</h4>
                          <span className="text-xs text-slate-500 font-black tracking-widest uppercase bg-slate-100 px-3 py-1 rounded-lg">{exp.duration}</span>
                        </div>
                        <p className="text-indigo-600 font-black mb-5 text-lg">{exp.company}</p>
                        <p className="text-slate-600 leading-loose whitespace-pre-line text-base border-r-2 border-slate-100 pr-6 group-hover:border-indigo-200 transition-colors">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {!isPremium && (
                    <div className="absolute inset-0 flex flex-col items-center justify-start pt-24">
                      <div className="text-center p-12 bg-slate-900/95 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/10 max-w-lg mx-4 relative z-20">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-white shadow-2xl transform -rotate-6">
                           <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        </div>
                        <h4 className="text-white text-2xl font-black mb-4 tracking-tight">افتح هندسة الخبرات</h4>
                        <div className="space-y-4 mb-10 text-right">
                          <p className="text-slate-400 text-sm font-bold">بتحميل التقرير الكامل ستحصل على:</p>
                          <div className="flex items-center gap-3 justify-end text-slate-200">
                             <span className="text-sm font-black">إعادة صياغة الخبرات بلغة الإنجازات (Executive Level)</span>
                             <span className="w-5 h-5 bg-indigo-500/40 rounded-full flex items-center justify-center text-[8px]">✨</span>
                          </div>
                          <div className="flex items-center gap-3 justify-end text-slate-200">
                             <span className="text-sm font-black">تحسين الكلمات المفتاحية لمجاوزة الـ ATS</span>
                             <span className="w-5 h-5 bg-indigo-500/40 rounded-full flex items-center justify-center text-[8px]">🔍</span>
                          </div>
                        </div>
                        <button onClick={() => setIsPremium(true)} className="w-full gradient-button text-white py-5 rounded-2xl font-black text-xl">فتح التقرير الكامل — 29 ريال</button>
                      </div>
                    </div>
                  )}
                </section>

                <section className={`relative transition-all duration-700 ${!isPremium ? 'opacity-30' : ''}`}>
                  <h3 className="text-xl font-black mb-8 text-slate-900">المهارات والتعليم المحدثة</h3>
                  <div className={!isPremium ? 'filter blur-[18px] select-none pointer-events-none' : 'space-y-14'}>
                    <div>
                      <h4 className="font-black text-xs text-slate-400 mb-6 uppercase tracking-[0.2em] border-b pb-2">Technical & Strategic Skills</h4>
                      <div className="flex flex-wrap gap-4">
                        {result.enhancedSkills.map((skill, idx) => (
                          <span key={idx} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-slate-400 mb-6 uppercase tracking-[0.2em] border-b pb-2">Academic Background</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.enhancedEducation.map((ed, idx) => (
                          <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                            <h4 className="font-black text-lg text-slate-900 mb-1">{ed.degree}</h4>
                            <p className="text-indigo-600 font-black mb-2">{ed.school}</p>
                            <span className="text-[10px] text-slate-400 font-black">{ed.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-6 pb-32">
              <button 
                onClick={() => window.print()} 
                className={`px-20 py-7 rounded-[2.5rem] font-black text-2xl transition shadow-2xl flex items-center gap-4 ${
                  isPremium ? 'gradient-button text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                }`}
                disabled={!isPremium}
              >
                {!isPremium && <LockIcon className="w-6 h-6" />}
                {isPremium ? 'تحميل السيرة الذاتية PDF' : 'تحميل PDF (متاح للمشتركين)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
