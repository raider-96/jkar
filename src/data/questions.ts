
import { Question } from '../types';

export const CATEGORIES_CONFIG = [
  { name: 'مسلسلات عربية', icon: '🎬' },
  { name: 'مسلسلات خليجية', icon: '📺' },
  { name: 'مسلسلات أجنبية', icon: '🌎' },
  { name: 'مسلسلات أنمي', icon: '⛩️' },
  { name: 'باب الحارة', icon: '🏘️' },
  { name: 'جيم أوف ثرونز', icon: '⚔️' },
  { name: 'أفلام عربية', icon: '🎭' },
  { name: 'أفلام أجنبي', icon: '🎥' },
  { name: 'تحديات دين', icon: '🕌' },
  { name: 'تحديات حسينية', icon: '🏴' },
  { name: 'عن القران', icon: '📖' },
  { name: 'سيارات', icon: '🏎️' },
  { name: 'مشاهير عرب', icon: '🌟' },
  { name: 'ألعاب الفيديو', icon: '🎮' },
  { name: 'مشاهير أجانب', icon: '💎' },
  { name: 'العراق', icon: '🇮🇶' },
  { name: 'كرة قدم بشكل عام', icon: '⚽' },
  { name: 'دوري اسباني', icon: '🇪🇸' },
  { name: 'دوري انكليزي', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'لاعبين كرة قدم', icon: '🏃' },
  { name: 'ماركات', icon: '🏷️' },
  { name: 'تاريخ', icon: '📜' },
  { name: 'جغرافية', icon: '🗺️' },
  { name: 'عواصم ودول', icon: '🚩' },
  { name: 'رياضيات وألغاز منطق', icon: '🧩' },
  { name: 'لغة عربية', icon: '✒️' },
  { name: 'علوم', icon: '🧪' }
];

export const CATEGORIES = CATEGORIES_CONFIG.map(c => c.name);

// To add new questions manually, add them to this INITIAL_QUESTIONS array.
export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'rm-hard-1',
    category: 'دوري اسباني',
    difficulty: 'hard',
    points: 400,
    type: 'text',
    question: 'ما هو النادي الذي فاز بلقب الدوري الإسباني في موسم 1999-2000 لأول مرة في تاريخه؟',
    answer: 'ديبورتيفو لاكورونيا'
  },
  {
    id: 'iraq-easy-1',
    category: 'العراق',
    difficulty: 'easy',
    points: 100,
    type: 'image',
    question: 'خمن المعلم الأثري الموجود في الصورة؟',
    answer: 'ملوية سامراء',
    image: 'https://images.unsplash.com/photo-1590011400271-925762744093?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'act-sample-1',
    category: 'مسلسلات عربية',
    difficulty: 'medium',
    points: 200,
    type: 'act',
    question: 'تحدي تمثيل: مثل دور "شخص خائف" في مشهد رعب بدون كلام لمدة 20 ثانية',
    answer: 'أداء دور الخوف'
  }
];

// Helper to generate dynamic mock questions if needed (for initial testing)
const generateMockQuestions = () => {
  const qs: Question[] = [...INITIAL_QUESTIONS];
  CATEGORIES.forEach((cat) => {
    // Fill up to 10 for each category if not already present
    const existingCount = qs.filter(q => q.category === cat).length;
    for (let i = existingCount + 1; i <= 20; i++) {
      const difficulty: any = i <= 7 ? 'easy' : i <= 14 ? 'medium' : 'hard';
      const points = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 400;
      const type: any = i % 3 === 0 ? 'act' : i % 3 === 1 ? 'image' : 'text';
      
      qs.push({
        id: `mock-${cat}-${i}`,
        category: cat,
        difficulty,
        points,
        type,
        question: `[سؤال تلقائي] تحدي رقم ${i} في صنف ${cat}: ${type === 'act' ? 'قم بتمثيل المشهد...' : 'ما هو...'}`,
        answer: `إجابة السؤال ${i}`,
        image: type === 'image' ? 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=500' : undefined
      });
    }
  });
  return qs;
};

export const QUESTIONS: Question[] = generateMockQuestions();
