
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
  { name: 'أسئلة دين', icon: '🌙' },
  { name: 'سيارات', icon: '🏎️' },
  { name: 'مشاهير عرب', icon: '🌟' },
  { name: 'ألعاب الفيديو', icon: '🎮' },
  { name: 'مشاهير أجانب', icon: '💎' },
  { name: 'العراق', icon: '🇮🇶' },
  { name: 'كرة قدم', icon: '⚽' },
  { name: 'ماركات', icon: '🏷️' },
  { name: 'تاريخ', icon: '📜' },
  { name: 'جغرافية', icon: '🗺️' },
  { name: 'عواصم ودول', icon: '🚩' },
  { name: 'رياضيات وألغاز منطق', icon: '🧩' },
  { name: 'لغة عربية', icon: '✒️' },
  { name: 'اسئلة حسينية', icon: '🏴' },
  { name: 'علوم', icon: '🧪' }
];

export const CATEGORIES = CATEGORIES_CONFIG.map(c => c.name);

// Generates dummy questions to simulate the large scale needed (60 per category)
// In a real app, this would be a large JSON or database
const generateMockQuestions = () => {
  const qs: Question[] = [];
  CATEGORIES.forEach((cat) => {
    for (let i = 1; i <= 60; i++) {
      const difficulty: any = i <= 20 ? 'easy' : i <= 40 ? 'medium' : 'hard';
      const points = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 400;
      const type: any = i % 3 === 0 ? 'act' : i % 3 === 1 ? 'image' : 'text';
      
      qs.push({
        id: `${cat}-${i}`,
        category: cat,
        difficulty,
        points,
        type,
        question: `سؤال رقم ${i} في صنف ${cat}: ${type === 'act' ? 'قم بتمثيل المشهد التالي...' : 'ما هو...'}`,
        answer: `إجابة السؤال ${i}`,
        image: type === 'image' ? 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=500' : undefined
      });
    }
  });
  return qs;
};

export const QUESTIONS: Question[] = generateMockQuestions();
