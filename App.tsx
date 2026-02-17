import React, { useState, useRef, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Step, GeneratedResume } from './types';
import { processResume } from './geminiService';
import CVRender from './src/templates/CVRender';
import TemplatePicker from './src/components/TemplatePicker';
import JobMatcher from './src/components/JobMatcher';
import ATSWarnings from './src/components/ATSWarnings';
import { exportCvPdf } from './src/utils/exportPdf';
import { validateATS, ATSWarning } from './src/utils/atsValidator';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Welcome);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [templateId, setTemplateId] = useState('ats_ar_classic');
  const [atsWarnings, setAtsWarnings] = useState<ATSWarning[]>([]);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [currentPlan] = useState<'free' | 'gold' | 'pro'>('free');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLDivElement>(null);

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

  const processFile = async (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('يرجى رفع ملف PDF أو Word فقط. لا يُسمح بأنواع أخرى.');
      return;
    }
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setError('امتداد الملف غير مسموح. يرجى رفع ملف PDF أو Word.');
      return;
    }
    const maxSize = currentPlan === 'free' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      setError(`حجم الملف كبير جداً. الحد الأقصى ${maxMB} ميجابايت${currentPlan === 'free' ? ' في الباقة المجانية' : ''}.`);
      return;
    }
    setError(null);
    setShowUpgrade(false);
    setIsUploading(true);
    setStep(Step.Processing);
    try {
      const base64 = await blobToBase64(file);
      const data = await processResume({ data: base64, mimeType: file.type }, currentPlan);
      setResult(data);
      setStep(Step.Preview);
    } catch (err: any) {
      if (err.upgrade) setShowUpgrade(true);
      setError(err.message || 'حدث خطأ غير متوقع.');
      setStep(Step.Input);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleExportPdf = useCallback(async () => {
    if (currentPlan === 'free') {
      setError('تحميل PDF متاح فقط في الباقة الذهبية والاحترافية.');
      setShowUpgrade(true);
      return;
    }
    const warnings = validateATS(cvRef.current, result || {});
    setAtsWarnings(warnings);
    if (warnings.some(w => w.type === 'error')) {
      setError('يوجد مشاكل في السيرة تمنع التوافق مع ATS. يرجى مراجعة التحذيرات.');
      return;
    }
    try {
      await exportCvPdf(cvRef.current, `SiraAI-${result?.fullName || 'CV'}.pdf`);
    } catch {
      setError('فشل تحميل PDF. يرجى المحاولة مرة أخرى.');
    }
  }, [currentPlan, result]);

  const runAtsCheck = useCallback(() => {
    setAtsWarnings(validateATS(cvRef.current, result || {}));
  }, [result]);

  const isFree = currentPlan === 'free';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* === ERROR BANNER === */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <div>
              <p className="text-red-400 font-medium text-sm">{error}</p>
              {showUpgrade && (
                <a href="#pricing" className="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-block font-medium" onClick={() => setError(null)}>ترقية الباقة لمزيد من التحليلات ←</a>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ==================== WELCOME / HERO ======================== */}
        {/* ============================================================ */}
        {step === Step.Welcome && (
          <div className="space-y-20 sm:space-y-28 py-4 sm:py-8">

            {/* === HERO SECTION === */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
              <div className="text-right space-y-5 sm:space-y-7">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-emerald-400 text-[11px] sm:text-xs font-bold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  مخصص لسوق العمل السعودي
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.3]">
                  أنشئ سيرة ذاتية مهيأة<br/>
                  <span className="gradient-text">لسوق العمل السعودي</span><br/>
                  <span className="text-2xl sm:text-3xl lg:text-4xl">خلال دقيقة واحدة</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
                  حلّل سيرتك، حسّنها بالذكاء الاصطناعي، وارفع فرص قبولك في الشركات السعودية والخليجية.
                </p>

                {/* مخصص للسعودية */}
                <div className="space-y-2.5 py-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    متوافق مع أنظمة التوظيف (ATS) في الشركات السعودية
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    صياغة عربية احترافية رسمية
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    قوالب مناسبة للقطاع الحكومي والخاص
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setStep(Step.Input)} className="gradient-button px-8 py-4 text-white rounded-2xl font-bold text-base shadow-2xl shadow-indigo-500/20 w-full sm:w-auto">
                    حلّل سيرتي الآن
                  </button>
                  <a href="#before-after" className="px-8 py-4 text-slate-400 rounded-2xl font-medium text-base border border-slate-700/50 hover:border-slate-600 hover:text-white transition-all text-center">
                    شوف الفرق
                  </a>
                </div>
              </div>

              {/* Hero Card */}
              <div className="flex justify-center">
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 w-full max-w-sm">
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-sm">توافق الـ ATS</span>
                      <span className="text-emerald-400 font-black text-sm">94%</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-l from-emerald-400 to-emerald-600 w-[94%] rounded-full"></div>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">سيرة احترافية تزيد فرص قبولك في الشركات السعودية</p>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-blue-400 font-black text-lg">+85%</div>
                        <div className="text-slate-500 text-[10px] mt-1">فرص القبول</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-purple-400 font-black text-lg">60 ث</div>
                        <div className="text-slate-500 text-[10px] mt-1">وقت التحليل</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-emerald-400 font-black text-lg">AI</div>
                        <div className="text-slate-500 text-[10px] mt-1">ذكاء متقدم</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* === BEFORE / AFTER === */}
            <div id="before-after" className="space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white">شوف الفرق بنفسك</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">كيف يحوّل الذكاء الاصطناعي سيرتك من عادية إلى احترافية</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* قبل */}
                <div className="glass-card p-6 rounded-2xl border border-red-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    <span className="text-red-400 font-bold text-sm">قبل التحسين</span>
                  </div>
                  <div className="space-y-4 text-right">
                    <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                      <p className="text-slate-400 text-sm leading-relaxed">مسؤول عن إدارة فريق.</p>
                    </div>
                    <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                      <p className="text-slate-400 text-sm leading-relaxed">عملت في مجال المبيعات وحققت نتائج جيدة.</p>
                    </div>
                    <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                      <p className="text-slate-400 text-sm leading-relaxed">لدي خبرة في التسويق الرقمي.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-red-400 text-xs">
                    <span className="font-bold">ATS: 32%</span>
                    <span className="text-slate-600">— احتمال رفض عالي</span>
                  </div>
                </div>
                {/* بعد */}
                <div className="glass-card p-6 rounded-2xl border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-emerald-400 font-bold text-sm">بعد التحسين بسيرة AI</span>
                  </div>
                  <div className="space-y-4 text-right">
                    <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                      <p className="text-white text-sm leading-relaxed font-medium">أدرت فريقاً مكوّناً من <strong className="text-emerald-400">6 موظفين</strong> ورفعت كفاءة الأداء بنسبة <strong className="text-emerald-400">30%</strong>.</p>
                    </div>
                    <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                      <p className="text-white text-sm leading-relaxed font-medium">حققت نمواً في المبيعات بنسبة <strong className="text-emerald-400">45%</strong> خلال الربع الأول عبر استراتيجية بيع استشاري.</p>
                    </div>
                    <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                      <p className="text-white text-sm leading-relaxed font-medium">قدت حملات تسويق رقمي رفعت معدل التحويل <strong className="text-emerald-400">120%</strong> وخفضت تكلفة الاستحواذ <strong className="text-emerald-400">35%</strong>.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs">
                    <span className="font-bold">ATS: 94%</span>
                    <span className="text-slate-400">— جاهز للقبول</span>
                  </div>
                </div>
              </div>
            </div>

            {/* === FEATURES === */}
            <div id="features" className="space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white">لماذا سيرة AI؟</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">أدوات ذكية مصممة خصيصاً لسوق العمل السعودي والخليجي</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">تحليل ذكي</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">يحلل سيرتك ويحدد نقاط القوة والضعف بدقة حسب معايير التوظيف السعودية</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">صياغة تنفيذية</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">يعيد صياغة خبراتك بأسلوب احترافي يبرز إنجازاتك بأرقام ونسب</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">متوافق مع ATS</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">يحسن الكلمات المفتاحية لتجاوز أنظمة الفرز في الشركات السعودية</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-yellow-500/20 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">مطابقة وظيفية</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">اعرف نسبة تطابق سيرتك مع الوظيفة قبل التقديم من LinkedIn أو أي موقع</p>
                </div>
              </div>
            </div>

            {/* === TEMPLATES SECTION === */}
            <div className="space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white">قوالب مصممة للسوق السعودي</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">بدون صور — بدون زخرفة — ATS-safe</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
                <div className="glass-card p-6 rounded-2xl border border-white/5 text-center hover:border-emerald-500/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">قالب رسمي</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">للجهات الحكومية والشبه حكومية</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/5 text-center hover:border-blue-500/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">قالب احترافي</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">للشركات الخاصة والتقنية</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/5 text-center hover:border-purple-500/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">قالب تنفيذي</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">للمدراء والقياديين</p>
                </div>
              </div>
            </div>

            {/* === JOB MATCHING PROMO === */}
            <div className="glass-card p-8 sm:p-12 rounded-3xl border border-blue-500/10 max-w-4xl mx-auto text-center">
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">اعرف نسبة تطابق سيرتك مع الوظيفة</h2>
                <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                  الصق وصف الوظيفة من LinkedIn أو أي موقع توظيف، وسنحسب لك نسبة التطابق ونقترح الكلمات المفقودة التي ترفع فرص قبولك.
                </p>
                <button onClick={() => setStep(Step.Input)} className="gradient-button px-8 py-3 text-white rounded-2xl font-bold text-sm inline-block">
                  جرّب الآن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ==================== UPLOAD ================================ */}
        {/* ============================================================ */}
        {step === Step.Input && (
          <div className="max-w-2xl mx-auto text-center space-y-6 py-8 sm:py-16">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-white">ارفع سيرتك الذاتية</h2>
              <p className="text-slate-400 text-sm">يدعم ملفات PDF و Word فقط (الحد الأقصى {currentPlan === 'free' ? '2' : '5'} ميجابايت)</p>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              className={`border-2 border-dashed rounded-3xl p-12 sm:p-20 transition-all cursor-pointer glass-card active:scale-[0.98] ${
                dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-blue-500/50'
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} hidden accept=".pdf,.doc,.docx" />
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <p className="text-base sm:text-lg text-white font-bold">اسحب الملف هنا أو اضغط للرفع</p>
                <p className="text-slate-500 text-xs">PDF أو Word فقط — لا صور ولا نص حر</p>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-slate-600 text-[10px]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    ملفاتك محمية ومشفرة
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(Step.Welcome)} className="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm">
              ← العودة للرئيسية
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* ==================== PROCESSING ============================ */}
        {/* ============================================================ */}
        {step === Step.Processing && (
          <div className="max-w-md mx-auto text-center py-24 sm:py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl sm:text-2xl font-black text-white">جاري تحليل سيرتك الذاتية...</h2>
            <p className="text-slate-400 text-sm">يقوم الذكاء الاصطناعي بتحليل سيرتك حسب معايير سوق العمل السعودي</p>
            <p className="text-slate-600 text-xs">تنبيه: الذكاء الاصطناعي مساعد فقط. يُنصح بمراجعة النتائج.</p>
          </div>
        )}

        {/* ============================================================ */}
        {/* ==================== PREVIEW RESULTS ======================= */}
        {/* ============================================================ */}
        {step === Step.Preview && result && (
          <div className="space-y-6 py-6 sm:py-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{result.fullName}</h2>
                <p className="text-blue-400 font-bold text-sm mt-1">{result.jobTitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {result.atsScore && (
                  <div className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
                    result.atsScore >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    result.atsScore >= 40 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    ATS: {result.atsScore}%
                  </div>
                )}
                <div className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
                  isFree ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isFree ? 'معاينة مجانية (20%)' : 'تقرير كامل'}
                </div>
                {result.remaining !== undefined && (
                  <div className="bg-white/5 text-slate-400 px-3 py-1.5 rounded-xl text-xs border border-white/10">
                    متبقي: {result.remaining} محاولة
                  </div>
                )}
              </div>
            </div>

            {/* Free Quick Feedback */}
            {isFree && result.quickFeedback && (
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  تقييم سريع
                </h3>
                <ul className="space-y-2">
                  {result.quickFeedback.map((fb: string, i: number) => (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      {fb}
                    </li>
                  ))}
                </ul>
                {result.overallRating && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                    <span className="text-slate-500 text-xs">التقييم العام:</span>
                    <span className={`font-bold text-xs ${
                      result.overallRating === 'ممتاز' ? 'text-emerald-400' :
                      result.overallRating === 'جيد' ? 'text-blue-400' :
                      result.overallRating === 'متوسط' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{result.overallRating}</span>
                  </div>
                )}
                {result.missingKeywords && result.missingKeywords.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-slate-500 text-xs block mb-2">كلمات مفتاحية مفقودة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords.map((kw: string, i: number) => (
                        <span key={i} className="bg-red-500/10 text-red-400 px-2 py-1 rounded-lg text-[10px] border border-red-500/20">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* العمود الأيسر - الأدوات */}
              <div className="space-y-4 order-2 lg:order-1">
                <TemplatePicker value={templateId} onChange={setTemplateId} locked={isFree} />
                <JobMatcher
                  cvSkills={result.enhancedSkills || result.skills || []}
                  cvExperience={(result.enhancedExperience || result.experience || []).map((e: any) => e.description || (e.bullets || []).join(' '))}
                  cvSummary={result.summary || ''}
                  locked={isFree}
                />
                <div className="space-y-3">
                  <button onClick={runAtsCheck} className="w-full py-3 rounded-xl border border-white/10 text-white font-medium bg-transparent hover:bg-white/5 transition-all cursor-pointer text-sm flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    فحص توافق ATS
                  </button>
                  <button onClick={handleExportPdf} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${isFree ? 'border border-white/10 text-slate-500 cursor-not-allowed' : 'gradient-button text-white cursor-pointer'}`} disabled={isFree}>
                    {isFree ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        تحميل PDF (الباقة الذهبية)
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        تحميل PDF
                      </>
                    )}
                  </button>
                </div>
                {atsWarnings.length > 0 && <ATSWarnings warnings={atsWarnings} />}
              </div>

              {/* العمود الأيمن - معاينة CV */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                {!isFree ? (
                  <div className="glass-card p-4 rounded-2xl border border-white/5 overflow-auto">
                    <div ref={cvRef} style={{ transform: 'scale(0.75)', transformOrigin: 'top right', marginBottom: '-25%' }}>
                      <CVRender data={result} templateId={templateId} watermark={false} />
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-4 rounded-2xl border border-white/5 overflow-auto relative">
                    <div className="absolute inset-0 z-10 backdrop-blur-[3px] bg-black/20 rounded-2xl flex items-center justify-center">
                      <div className="text-center p-6">
                        <svg className="w-12 h-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <p className="text-white font-bold text-sm mb-1">المعاينة الكاملة مقفلة</p>
                        <p className="text-slate-400 text-xs mb-4">اشترك في الباقة الذهبية لمعاينة وتحميل سيرتك كاملة</p>
                        <a href="#pricing" className="gradient-button px-6 py-2.5 text-white rounded-xl font-bold text-xs inline-block">افتح التقرير الكامل — 69 ريال</a>
                      </div>
                    </div>
                    <div ref={cvRef} style={{ transform: 'scale(0.75)', transformOrigin: 'top right', marginBottom: '-25%', filter: 'blur(2px)' }}>
                      <CVRender data={result} templateId={templateId} watermark={true} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => { setStep(Step.Input); setResult(null); setError(null); setShowUpgrade(false); setAtsWarnings([]); }} className="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm">
                ← تحليل سيرة ذاتية أخرى
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ==================== PRICING =============================== */}
        {/* ============================================================ */}
        <section id="pricing" className="py-16 sm:py-24 border-t border-white/5">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">باقات الاشتراك</h2>
            <p className="text-slate-500 text-sm">اختر الباقة التي تناسب احتياجك</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">

            {/* باقة التجربة */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 flex flex-col">
              <h3 className="text-base font-bold text-white mb-1">باقة التجربة</h3>
              <div className="text-3xl font-black text-white mb-5">0 <span className="text-xs font-normal text-slate-500">ريال</span></div>
              <ul className="space-y-3 mb-8 flex-grow">
                {['تحليل سريع بالذكاء الاصطناعي', 'حساب نسبة ATS تقريبية', 'معاينة 20% من التحسينات', 'معاينة قالب واحد', '1 تحليل لكل 24 ساعة'].map((item, i) => (
                  <li key={i} className="text-slate-400 text-xs flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
                {['إعادة الصياغة الكاملة', 'تحميل PDF', 'مطابقة الوصف الوظيفي'].map((item, i) => (
                  <li key={`l-${i}`} className="text-slate-500 text-xs flex items-center gap-2 opacity-50">
                    <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setStep(Step.Input)} className="w-full py-3 rounded-xl border border-white/10 text-white font-medium bg-transparent hover:bg-white/5 transition-all cursor-pointer text-sm">
                جرّب تحليل سيرتك الآن
              </button>
            </div>

            {/* الباقة الذهبية */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border-2 border-yellow-500/30 flex flex-col relative shadow-xl shadow-yellow-500/5 sm:scale-[1.03]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-4 py-1 rounded-full text-[10px] font-black whitespace-nowrap">الأكثر طلباً</div>
              <h3 className="text-base font-bold text-white mb-1 mt-1">الباقة الذهبية</h3>
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-slate-500 line-through text-lg">99</span>
                <span className="text-3xl font-black text-white">69</span>
                <span className="text-xs font-normal text-slate-500">ريال</span>
                <span className="text-[10px] text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-full">لفترة محدودة</span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {['تقرير ATS كامل ومفصل', 'إعادة صياغة احترافية كاملة', 'تحسين الكلمات المفتاحية', '3 تحسينات إضافية', 'تحميل PDF جاهز', 'اختيار من القوالب', 'مطابقة الوصف الوظيفي'].map((item, i) => (
                  <li key={i} className="text-white text-xs flex items-center gap-2 font-medium">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              {/* عناصر الثقة */}
              <div className="space-y-2 mb-5 py-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  ضمان استرجاع خلال 24 ساعة
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  دفع آمن
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span className="text-sm flex-shrink-0">🇸🇦</span>
                  مخصص لسوق العمل السعودي
                </div>
              </div>
              <button className="gradient-button w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg">
                افتح تقريرك الكامل الآن
              </button>
            </div>

            {/* الباقة الاحترافية */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 flex flex-col sm:col-span-2 lg:col-span-1">
              <h3 className="text-base font-bold text-white mb-1">الباقة الاحترافية</h3>
              <div className="text-3xl font-black text-white mb-5">129 <span className="text-xs font-normal text-slate-500">ريال</span></div>
              <ul className="space-y-3 mb-8 flex-grow">
                {['تحسينات غير محدودة لمدة 7 أيام', 'جميع القوالب الاحترافية', 'تخصيص حسب الوظيفة', 'تحسينات متعددة النسخ', 'أولوية تنفيذ', 'مطابقة الوصف الوظيفي'].map((item, i) => (
                  <li key={i} className="text-slate-300 text-xs flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="space-y-2 mb-5 py-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  ضمان استرجاع خلال 24 ساعة
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span className="text-sm flex-shrink-0">🇸🇦</span>
                  مخصص لسوق العمل السعودي
                </div>
              </div>
              <button className="w-full py-3 rounded-xl border border-white/10 text-white font-medium bg-transparent hover:bg-white/5 transition-all cursor-pointer text-sm">
                ترقية للاحترافي
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* ==================== PRIVACY & TERMS ======================= */}
        {/* ============================================================ */}
        <section className="py-8 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-6 text-xs">
            <button onClick={() => setShowPrivacy(!showPrivacy)} className="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer underline">سياسة الخصوصية</button>
            <button onClick={() => setShowTerms(!showTerms)} className="text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer underline">شروط الاستخدام</button>
          </div>
          {showPrivacy && (
            <div className="mt-6 glass-card p-6 rounded-2xl border border-white/5 max-w-3xl mx-auto text-right">
              <h3 className="text-white font-bold text-base mb-4">سياسة الخصوصية</h3>
              <div className="text-slate-400 text-xs space-y-3 leading-relaxed">
                <p>نحن في سيرة AI نلتزم بحماية خصوصيتك وبياناتك الشخصية.</p>
                <p><strong className="text-white">جمع البيانات:</strong> نقوم بجمع الملفات التي ترفعها (السيرة الذاتية) لغرض التحليل فقط. لا نحتفظ بملفاتك بعد انتهاء التحليل.</p>
                <p><strong className="text-white">استخدام البيانات:</strong> تُستخدم بياناتك فقط لتحسين سيرتك الذاتية عبر الذكاء الاصطناعي. لا نشارك بياناتك مع أطراف ثالثة.</p>
                <p><strong className="text-white">التخزين:</strong> لا يتم تخزين ملفاتك على خوادمنا. يتم معالجتها في الوقت الفعلي وحذفها فوراً.</p>
                <p><strong className="text-white">ملفات تعريف الارتباط:</strong> نستخدم ملفات تعريف الارتباط الأساسية فقط لتحسين تجربة الاستخدام.</p>
                <p><strong className="text-white">حقوقك:</strong> يحق لك طلب حذف أي بيانات مرتبطة بك عبر التواصل معنا على info@aaxl.net</p>
              </div>
            </div>
          )}
          {showTerms && (
            <div className="mt-6 glass-card p-6 rounded-2xl border border-white/5 max-w-3xl mx-auto text-right">
              <h3 className="text-white font-bold text-base mb-4">شروط الاستخدام</h3>
              <div className="text-slate-400 text-xs space-y-3 leading-relaxed">
                <p><strong className="text-white">طبيعة الخدمة:</strong> سيرة AI هي أداة مساعدة تعمل بالذكاء الاصطناعي لتحسين السير الذاتية. النتائج استرشادية ويُنصح بمراجعتها.</p>
                <p><strong className="text-white">الاستخدام المسموح:</strong> يُسمح باستخدام الخدمة لأغراض شخصية ومهنية مشروعة فقط.</p>
                <p><strong className="text-white">الملفات:</strong> يُسمح فقط برفع ملفات PDF و Word. أي محاولة لرفع ملفات خبيثة ستؤدي لحظر الحساب.</p>
                <p><strong className="text-white">الباقات:</strong> الباقة المجانية محدودة بمحاولة واحدة يومياً. الباقات المدفوعة تخضع لشروط كل باقة.</p>
                <p><strong className="text-white">الاسترجاع:</strong> يحق لمشتركي الباقة الذهبية والاحترافية طلب استرجاع المبلغ خلال 24 ساعة من الاشتراك.</p>
                <p><strong className="text-white">إخلاء المسؤولية:</strong> الذكاء الاصطناعي مساعد فقط ولا يضمن القبول في أي وظيفة. المستخدم مسؤول عن مراجعة والتحقق من دقة المحتوى.</p>
                <p><strong className="text-white">التواصل:</strong> لأي استفسار أو شكوى: info@aaxl.net</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default App;
