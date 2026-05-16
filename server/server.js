const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// الأسطر السحرية لترجمة البيانات القادمة من الفرونت إند
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 1. تعريف الهياكل (Schemas & Models)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  role: { type: String, default: 'user' },
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

// تلافي إعادة تعريف الموديل إذا كان معرفاً مسبقاً في الـ Cache
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

const MONGO_URI = 'mongodb+srv://reder:reder1212@cluster0.xnenrtq.mongodb.net/?appName=Cluster0';

const connectDB = async () => {
  // إذا كان الاتصال قائماً بالفعل، لا تقم بإنشاء اتصال جديد
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("تم الاتصال بقاعدة البيانات بنجاح");
  } catch (err) {
    console.error("خطأ اتصال قاعدة البيانات:", err.message);
  }
};

// استدعاء دالة الاتصال داخل الـ Middleware أو قبل التعريفات
app.use(async (req, res, next) => {
  await connectDB();
  next();
});
// دالة تفقد حساب الأدمن
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: '123',
        role: 'admin',
        isActive: true
      });
      console.log('👤 تم إنشاء حساب الأدمن');
    }
  } catch (err) {
    console.log('ملاحظة الـ Seed:', err.message);
  }
};

// تفعيل الاتصال في كل مسار لضمان الاستقرار السحابي
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ================= 3. مسارات الـ API =================

// جلب المستخدمين
app.get('/api/users', async (req, res) => {
  try {
    await seedAdmin(); // تفقد الأدمن عند الطلب الأول
    const users = await User.find().sort({ createdAt: -1 });
    res.json(Array.isArray(users) ? users : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة مستخدم جديد
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username) return res.status(400).json({ error: 'اسم المستخدم مطلوب' });

    const newUser = new User({ 
      username: username.trim(), 
      password: password || "", 
      role: role || 'user', 
      isActive: true 
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: 'اليوزر مسجل بالفعل أو البيانات غير صالحة' });
  }
});

// تفعيل / تعطيل مستخدم
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

// حذف مستخدم
app.delete('/api/users/:username', async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ username: req.params.username });
    if (!deletedUser) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// جلب الأسئلة
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(Array.isArray(questions) ? questions : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة سؤال جديد
app.post('/api/questions', async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. تشغيل وتصدير السيرفر
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 localhost:${PORT}`));
}

module.exports = app;