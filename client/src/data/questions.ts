import { Question } from '../types';

export const CATEGORIES_CONFIG = [
  { name: 'مسلسلات عربية', image: '/img/categories/msar.jpg' },
  { name: 'مسلسلات خليجية', image: '/img/categories/msk.jpg' },
  { name: 'مسلسلات أجنبية', image: '/img/categories/msag.jpg' },
  { name: 'مسلسلات أنمي', image:'/img/categories/msan.jpg' },
  { name: 'باب الحارة', image:'/img/categories/bab.jpg' },
  { name: 'جيم أوف ثرونز', image: '/img/categories/got.jpg' },
  { name: 'أفلام عربية', image: '/img/categories/afar.jpg' },
  { name: 'أفلام أجنبي', image: '/img/categories/afag.jpg' },  
  { name: 'مشاهير عرب', image: '/img/categories/mshar.jpg' },
  { name: 'مشاهير أجانب', image: '/img/categories/mshag.jpg' },
  { name: 'ماركات', image: '/img/categories/mar.jpg' },
  { name: 'تحديات دين', image: '/img/categories/den.jpg' },
  { name: 'تحديات حسينية', image:'/img/categories/hs.jpg' },
  { name: 'سيارات', image:'/img/categories/car.jpg' },
  { name: 'ألعاب الفيديو', image: '/img/categories/gam.jpg' },
  { name: 'العراق', image: '/img/categories/iq.jpg' },
  { name: 'كرة قدم  ', image: '/img/categories/kra.jpg' },
  { name: 'دوري اسباني', image: '/img/categories/kraas.jpg' },
  { name: 'دوري انكليزي', image: '/img/categories/kraan.jpg' },
  { name: 'تاريخ', image: '/img/categories/tar.jpg' },
  { name: 'جغرافية',image: '/img/categories/ghr.jpg' },
  { name: 'عواصم ودول', image: '/img/categories/dol.jpg' },
  { name: 'رياضيات وألغاز منطق', image: '/img/categories/math.jpg' },
  { name: 'لغة عربية', image: '/img/categories/ar.jpg' },
  { name: 'علوم',image: '/img/categories/3lm.jpg' }
]
export const CATEGORIES = CATEGORIES_CONFIG.map(c => c.name);

// To add new questions manually, add them to this INITIAL_QUESTIONS array.
export const INITIAL_QUESTIONS: Question[] = [];

// Helper to generate a few minimal questions for testing if needed
const generateMockQuestions = () => {
  return [...INITIAL_QUESTIONS];
};

export const QUESTIONS: Question[] = generateMockQuestions();
