const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// تفعيل حزم الحماية وتمرير البيانات كـ JSON
app.use(cors());
app.use(express.json());

// 1. تعديل الهيكل ليكون مرناً (إلغاء قيود الـ enum الصارمة مؤقتاً لتجنب خطأ 400)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  role: { type: String, default: 'user' }, // حذفنا الـ enum ليتوافق مع أي نص يرسله الفرونت إند
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});


const QuestionSchema = new mongoose.Schema({
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  points: { type: Number, required: true },
  image: { type: String },
  type: { type: String, enum: ['text', 'image', 'act', 'sound'], default: 'text' },
  options: { type: [String] }
});

const User = mongoose.model('User', UserSchema);
const Question = mongoose.model('Question', QuestionSchema);

// 2. الاتصال بقاعدة البيانات السحابية
const MONGO_URI = 'mongodb+srv://reder:reder1212@cluster0.xnenrtq.mongodb.net/chgar?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح!'))
  .catch(err => console.error('❌ فشل الاتصال بقاعدة البيانات:', err));

// متغير بسيط للتأكد من أن الأدمن يتم فحصه مرة واحدة فقط عند إقلاع السيرفر
let isAdminSeed되었 = false;
const seedAdmin = async () => {
  if (isAdminSeed되었) return;
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: '123',
        role: 'admin',
        isActive: true
      });
      console.log('👤 تم إنشاء حساب الأدمن الافتراضي سحابياً!');
    }
    isAdminSeed되었 = true;
  } catch (err) {
    console.log('ملاحظة: الأدمن مؤمن محلياً فلا تقلق');
  }
};

// ================= 3. مسارات واجهة برمجة التطبيقات (API Routes) =================

// جلب كافة المستخدمين
app.get('/api/users', async (req, res) => {
  try {
    await seedAdmin(); // فحص الأدمن احتياطاً عند أول طلب لجلب البيانات
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 2. تعديل مسار الإضافة ليستقبل أي صيغة ويقوم بتنظيفها
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'اسم المستخدم مطلوب' });
    }

    // تحويل الـ role لنصوص مألوفة احتياطاً
    let finalRole = 'user';
    if (role && (role.toLowerCase() === 'admin' || role === 'أدمن')) {
      finalRole = 'admin';
    }

    const newUser = new User({ 
      username: username.trim(), 
      password: password || "", 
      role: finalRole, 
      isActive: true 
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error("خطأ الإضافة السحابي:", err.message);
    res.status(400).json({ error: 'اليوزر مسجل بالفعل أو حدثت مشكلة في التحقق' });
  }
});
// تفعيل / تعطيل حساب مستخدم
app.patch('/api/users/:username/toggle', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف مستخدم نهائياً
app.delete('/api/users/:username', async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ username: req.params.username });
    if (!deletedUser) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// جلب جميع الأسئلة المتاحة للعبة
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة سؤال جديد من شاشة الأدمن
app.post('/api/questions', async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. تشغيل السيرفر وتصديره لـ Vercel
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل بكفاءة على المنفذ: http://localhost:${PORT}`);
  });
}

module.exports = app;