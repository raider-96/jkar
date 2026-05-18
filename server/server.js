const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// إعدادات ترجمة البيانات ورفع حد حجم الصور المرفوعة (مثل الـ Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// ================= 1. تعريف الهياكل والموديلات (Models) =================

// موديول المستخدمين
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// موديول الأسئلة
const QuestionSchema = new mongoose.Schema({
  id: { type: String }, // لدعم معرفات الفرونت إند مثل custom-
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  points: { type: Number, required: true },
  image: { type: String },
  type: { type: String, default: 'text' },
  options: { type: [String] }
});

// موديول التصنيفات (تم إضافته ليتوافق مع كود الـ React)
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String },
  color: { type: String }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// ================= 2. الاتصال بقاعدة البيانات (MongoDB) =================

// استخدام الرابط المباشر في حال عدم وجود ملف .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://reder:reder1212@cluster0.xnenrtq.mongodb.net/chgar?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح");
  } catch (err) {
    console.error("❌ خطأ في اتصال قاعدة البيانات:", err.message);
  }
};

// استدعاء دالة الاتصال (مرة واحدة تكفي كـ Middleware)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// دالة فحص وإنشاء حساب الأدمن الافتراضي تلقائياً
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
      console.log('👤 تم إنشاء حساب الأدمن الافتراضي (admin / 123)');
    }
  } catch (err) {
    console.log('ملاحظة الـ Seed:', err.message);
  }
};

// ================= 3. مسارات الـ API للمستخدمين =================

// جلب المستخدمين
app.get('/api/users', async (req, res) => {
  try {
    await seedAdmin(); 
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
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

// تفعيل / تعطيل مستخدم (تم تعديل المسار من PATCH لـ PUT ليتوافق مع الـ React)
app.put('/api/users/:username', async (req, res) => {
   try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    
    if (req.body.isActive !== undefined) {
      user.isActive = req.body.isActive;
    }
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

// ================= 4. مسارات الـ API للأسئلة =================

// جلب الأسئلة
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة سؤال جديد
app.post('/api/questions', async (req, res) => {
  try {
    // توليد معرف مخصص إذا لم يرسله الفرونت إند
    const questionData = { ...req.body };
    if (!questionData.id) {
      questionData.id = 'custom-' + new Date().getTime();
    }
    const newQuestion = new Question(questionData);
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// حذف سؤال
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // محاولة الحذف بالمعرف المخصص أو معرف المونجو الافتراضي _id
    let result = await Question.deleteOne({ id: id });
    if (result.deletedCount === 0) {
      await Question.findByIdAndDelete(id);
    }

    res.status(200).json({ success: true, message: "تم حذف التحدي بنجاح من السيرفر" });
  } catch (error) {
    res.status(500).json({ success: false, error: "حدث خطأ في السيرفر أثناء محاولة الحذف" });
  }
});

// ================= 5. مسارات الـ API للتصنيفات (Categories) =================

// جلب التصنيفات
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة تصنيف جديد
app.post('/api/categories', async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// حذف تصنيف
app.delete('/api/categories/:name', async (req, res) => {
  try {
    await Category.findOneAndDelete({ name: req.params.name });
    res.json({ message: 'تم حذف الصنف بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= 6. تشغيل وتصدير السيرفر =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});


module.exports = app;