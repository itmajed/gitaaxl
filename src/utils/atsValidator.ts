export interface ATSWarning {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  messageEn: string;
}

interface CVDataForValidation {
  summary?: string;
  experience?: Array<{ bullets?: string[]; description?: string }>;
  enhancedExperience?: Array<{ bullets?: string[]; description?: string }>;
  skills?: string[];
  enhancedSkills?: string[];
  education?: Array<any>;
  enhancedEducation?: Array<any>;
}

export function validateATS(cvElement: HTMLElement | null, data: CVDataForValidation): ATSWarning[] {
  const warnings: ATSWarning[] = [];

  if (cvElement) {
    // فحص: هل يوجد صور؟
    const images = cvElement.querySelectorAll('img');
    if (images.length > 0) {
      warnings.push({
        type: 'error',
        message: 'يوجد صور في السيرة الذاتية. أنظمة ATS لا تقرأ الصور.',
        messageEn: 'Images detected. ATS systems cannot read images.',
      });
    }

    // فحص: هل يوجد جداول؟
    const tables = cvElement.querySelectorAll('table');
    if (tables.length > 0) {
      warnings.push({
        type: 'error',
        message: 'يوجد جداول في السيرة الذاتية. أنظمة ATS تواجه صعوبة في قراءة الجداول.',
        messageEn: 'Tables detected. ATS systems struggle with tables.',
      });
    }

    // فحص: عدد الصفحات (تقريبي)
    const height = cvElement.scrollHeight;
    const estimatedPages = Math.ceil(height / 1123); // A4 height approx
    if (estimatedPages > 2) {
      warnings.push({
        type: 'warning',
        message: `السيرة الذاتية تقريباً ${estimatedPages} صفحات. يُفضل أن لا تتجاوز صفحتين.`,
        messageEn: `CV is approximately ${estimatedPages} pages. Recommended: max 2 pages.`,
      });
    }

    // فحص: هل يوجد أيقونات SVG مرئية؟
    const svgs = cvElement.querySelectorAll('svg');
    if (svgs.length > 0) {
      warnings.push({
        type: 'warning',
        message: 'يوجد أيقونات في السيرة. بعض أنظمة ATS لا تتعامل معها بشكل صحيح.',
        messageEn: 'Icons detected. Some ATS systems may not handle them correctly.',
      });
    }
  }

  // فحص: هل يوجد أرقام/إنجازات في الخبرات؟
  const experience = data.enhancedExperience || data.experience || [];
  const hasNumbers = experience.some(exp => {
    const text = (exp.bullets || []).join(' ') + ' ' + (exp.description || '');
    return /\d+/.test(text);
  });

  if (experience.length > 0 && !hasNumbers) {
    warnings.push({
      type: 'suggestion',
      message: 'لا توجد أرقام أو نسب في خبراتك. أضف إنجازات قابلة للقياس (مثل: زيادة 25%).',
      messageEn: 'No numbers found in experience. Add measurable achievements (e.g., increased by 25%).',
    });
  }

  // فحص: هل يوجد ملخص مهني؟
  if (!data.summary || data.summary.length < 30) {
    warnings.push({
      type: 'suggestion',
      message: 'الملخص المهني قصير جداً. يُفضل 3-4 أسطر تبرز خبراتك وإنجازاتك.',
      messageEn: 'Professional summary is too short. Recommended: 3-4 lines highlighting your expertise.',
    });
  }

  // فحص: هل يوجد مهارات كافية؟
  const skills = data.enhancedSkills || data.skills || [];
  if (skills.length < 5) {
    warnings.push({
      type: 'suggestion',
      message: 'عدد المهارات قليل. أضف 8-15 مهارة تتناسب مع الوظيفة المستهدفة.',
      messageEn: 'Too few skills. Add 8-15 skills relevant to the target job.',
    });
  }

  // فحص: هل يوجد تعليم؟
  const education = data.enhancedEducation || data.education || [];
  if (education.length === 0) {
    warnings.push({
      type: 'warning',
      message: 'لا يوجد قسم تعليم. معظم أنظمة ATS تبحث عن المؤهلات العلمية.',
      messageEn: 'No education section. Most ATS systems look for educational qualifications.',
    });
  }

  return warnings;
}
