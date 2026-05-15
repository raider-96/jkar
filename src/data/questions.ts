
import { Question } from '../types';

export const CATEGORIES_CONFIG = [
  { name: ' ', icon: '/img/categories/msar.jpg' },
  { name: ' ', icon: '/img/categories/msk.jpg' },
  { name: 'مسلسلات أجنبية', icon: '/img/categories/msag.jpg' },
  { name: 'مسلسلات أنمي', icon: '/img/categories/msan.jpg' },
  { name: 'باب الحارة', icon: '/img/categories/bab.jpg' },
  { name: 'جيم أوف ثرونز', icon: '/img/categories/got.jpg' },
  { name: 'أفلام عربية', icon: '/img/categories/afar.jpg' },
  { name: 'أفلام أجنبي', icon: '/img/categories/afag.jpg' },  
  { name: 'مشاهير عرب', icon: '/img/categories/' },
  { name: 'مشاهير أجانب', icon: '/img/categories/ .png' },
  { name: 'ماركات', icon: '/img/categories/ .png' },
  { name: 'تحديات دين', icon: '/img/categories/den.jpg' },
  { name: 'تحديات حسينية', icon: '/img/categories/hs.jpg' },
  { name: 'سيارات', icon: '/img/categories/ .png' },
  { name: 'ألعاب الفيديو', icon: '/img/categories/ .png' },
  { name: 'العراق', icon: '/img/categories/ .png' },
  { name: 'كرة قدم  ', icon: '/img/categories/ .png' },
  { name: 'دوري اسباني', icon: '/img/categories/ .png' },
  { name: 'دوري انكليزي', icon: '/img/categories/ .png' },
  { name: 'تاريخ', icon: '/img/categories/ .png' },
  { name: 'جغرافية', icon: '/img/categories/ .png' },
  { name: 'عواصم ودول', icon: '/img/categories/ .png' },
  { name: 'رياضيات وألغاز منطق', icon: '/img/categories/ .png' },
  { name: 'لغة عربية', icon: '/img/categories/ .png' },
  { name: 'علوم', icon: '/img/categories/ .png' }
];

export const CATEGORIES = CATEGORIES_CONFIG.map(c => c.name);

// To add new questions manually, add them to this INITIAL_QUESTIONS array.
export const INITIAL_QUESTIONS: Question[] = [];

// Helper to generate a few minimal questions for testing if needed
const generateMockQuestions = () => {
  return [...INITIAL_QUESTIONS];
};

export const QUESTIONS: Question[] = generateMockQuestions();