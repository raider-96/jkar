const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// تفعيل حزم الحماية وتمرير البيانات كـ JSON
app.use(cors());
app.use(express.json());

// 1. الاتصال بقاعدة البيانات السحابية أو المحلية
// يمكنك تغيير الرابط بالأسفل برابط MongoDB Atlas السحابي لاحقاً لربط الأجهزة عن بعد
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:21017/chgar';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح!'))
  .catch(err => console.error('❌ فشل الاتصال بقاعدة البيانات:', err));

// 2. تعريف الهياكل (Schemas & Models) بناءً على الـ Types الخاصة بالموقع
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
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

// ================= 3. مسارات واجهة برمجة التطبيقات (API Routes) =================

// --- مسارات التحكم بالمستخدمين ---

// جلب كافة المستخدمين
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة مستخدم جديد
app.post('/api/users', async (req, res) => {
  try {
    const { username, role } = req.body;
    const newUser = new User({ username, role: role || 'user', isActive: true });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: 'اليوزر مسجل بالفعل أو البيانات غير صالحة' });
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


// --- مسارات التحكم بالأسئلة ---

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

// 4. تشغيل السيرفر على منفذ مخصص
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل كفاءة على المنفذ: http://localhost:${PORT}`);
});