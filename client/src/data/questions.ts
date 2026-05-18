import { Question } from '../types';

export const CATEGORIES_CONFIG = [
  { name: 'مسلسلات عربية', icon: '/img/categories/msar.jpg' },
  { name: 'مسلسلات خليجية', icon: '/img/categories/msk.jpg' },
  { name: 'مسلسلات أجنبية', icon: '/img/categories/msag.jpg' },
  { name: 'مسلسلات أنمي', icon: '/img/categories/msan.jpg' },
  { name: 'باب الحارة', icon: '/img/categories/bab.jpg' },
  { name: 'جيم أوف ثرونز', icon: '/img/categories/got.jpg' },
  { name: 'أفلام عربية', icon: '/img/categories/afar.jpg' },
  { name: 'أفلام أجنبي', icon: '/img/categories/afag.jpg' },  
  { name: 'مشاهير عرب', icon: '/img/categories/mshar.jpg' },
  { name: 'مشاهير أجانب', icon: '/img/categories/mshag.jpg' },
  { name: 'ماركات', icon: '/img/categories/mar.jpg' },
  { name: 'تحديات دين', icon: '/img/categories/den.jpg' },
  { name: 'تحديات حسينية', icon: '/img/categories/hs.jpg' },
  { name: 'سيارات', icon: '/img/categories/car.jpg' },
  { name: 'ألعاب الفيديو', icon: '/img/categories/gam.jpg' },
  { name: 'العراق', icon: '/img/categories/iq.jpg' },
  { name: 'كرة قدم  ', icon: '/img/categories/kra.jpg' },
  { name: 'دوري اسباني', icon: '/img/categories/kraas.jpg' },
  { name: 'دوري انكليزي', icon: '/img/categories/kraan.jpg' },
  { name: 'تاريخ', icon: '/img/categories/tar.jpg' },
  { name: 'جغرافية', icon: '/img/categories/ghr.jpg' },
  { name: 'عواصم ودول', icon: '/img/categories/dol.jpg' },
  { name: 'رياضيات وألغاز منطق', icon: '/img/categories/math.jpg' },
  { name: 'لغة عربية', icon: '/img/categories/ar.jpg' },
  { name: 'علوم', icon: '/img/categories/3lm.jpg' }
]
.slice(0, 24); // Ensuring exactly 24 based on instruction, can be more later.

export const CATEGORIES = CATEGORIES_CONFIG.map(c => c.name);

// To add new questions manually, add them to this INITIAL_QUESTIONS array.
export const INITIAL_QUESTIONS: Question[] = [];

// Helper to generate a few minimal questions for testing if needed
const generateMockQuestions = () => {
  return [...INITIAL_QUESTIONS];
};

export const QUESTIONS: Question[] = generateMockQuestions();