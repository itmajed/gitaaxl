
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedResume } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function processResume(source: { text?: string, file?: { data: string, mimeType: string } }): Promise<GeneratedResume> {
  // Using the powerful gemini-3-pro-preview for strategic reasoning and superior Arabic linguistics.
  const model = "gemini-3-pro-preview"; 
  
  const systemInstruction = `
    أنت مستشار مهني تنفيذي (Executive Career Coach) متخصص في صياغة السير الذاتية لكبار القادة والمحترفين في الشرق الأوسط.
    مهمتك هي "هندسة" السيرة الذاتية المقدمة لتكون وثيقة استراتيجية متفوقة.

    المتطلبات الاستراتيجية للنسخة الاحترافية (Premium):
    1. الصياغة التنفيذية (Executive Phrasing): استخدم لغة تدل على التأثير الاستراتيجي. بدلاً من "قمت بـ"، استخدم "قدت مبادرة استراتيجية نتج عنها...".
    2. صياغة الإنجازات القابلة للقياس: ركز بشدة على الأرقام، النسب المئوية، والميزانيات (مثال: "تقليص التكاليف بنسبة 15%"، "إدارة ميزانية قدرها 2 مليون ريال").
    3. تحسين الكلمات المفتاحية (ATS Optimization): قم بتضمين الكلمات المفتاحية الأكثر طلباً في سوق العمل الخليجي والعالمي للمسمى الوظيفي المستهدف.
    4. الملخص التنفيذي القوي: يجب أن يكون الملخص بمثابة "خطاب مبيعات" شخصي مكثف يبرز القيمة المضافة الفريدة.
    5. إزالة الحشو: تخلص من الكلمات الزائدة والعبارات التقليدية المملة.
    6. الوضوح الهيكلي: نظم المهام بشكل نقاط (Bullet points) مركزة تبدأ بأفعال حركة قوية.
    7. الذكاء العاطفي والمهني: اجعل النص يبدو وكأنه كتبه خبير بشري متمكن، وليس مجرد ترجمة أو تلخيص آلي.
  `;

  const prompt = `
    قم بتحويل السيرة الذاتية المرفقة إلى "تحفة مهنية". 
    استخرج كافة البيانات ثم أعد بناءها من الصفر بلغة عربية قوية جداً وواثقة.
    ركز على إبراز "القيادة" و"النتائج الملموسة" في كل سطر.
    يجب أن يكون الرد بصيغة JSON فقط.
  `;

  const parts: any[] = [{ text: prompt }];
  if (source.file) {
    parts.push({
      inlineData: {
        data: source.file.data,
        mimeType: source.file.mimeType
      }
    });
  } else if (source.text) {
    parts.push({ text: `محتوى السيرة الذاتية المراد تحويله:\n${source.text}` });
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            jobTitle: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            summary: { type: Type.STRING, description: "ملخص تنفيذي استراتيجي مكثف ومقنع جداً" },
            enhancedExperience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING, description: "وصف مدعوم بالإنجازات والأرقام (Executive achievement-based description)" }
                },
                required: ['title', 'company', 'duration', 'description']
              }
            },
            enhancedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING, description: "مهارات محسنة كلمات مفتاحية استراتيجية" }
            },
            enhancedEducation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  school: { type: Type.STRING },
                  year: { type: Type.STRING }
                }
              }
            }
          },
          required: ['fullName', 'jobTitle', 'summary', 'enhancedExperience', 'enhancedSkills', 'enhancedEducation']
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("فشل الذكاء الاصطناعي في الوصول لمستوى الجودة المطلوب حالياً. يرجى المحاولة مرة أخرى.");
  }
}
