require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// ==========================================
// دالة التحقق من كلمة المرور المتتابعة
// ==========================================
const isSequential = (password) => {
  if (password.length < 3) return false;
  
  // أرقام متتابعة تصاعدي
  let isSequentialUp = true;
  for (let i = 0; i < password.length - 1; i++) {
    if (parseInt(password[i+1]) !== parseInt(password[i]) + 1) {
      isSequentialUp = false;
      break;
    }
  }
  
  // أرقام متتابعة تنازلي
  let isSequentialDown = true;
  for (let i = 0; i < password.length - 1; i++) {
    if (parseInt(password[i+1]) !== parseInt(password[i]) - 1) {
      isSequentialDown = false;
      break;
    }
  }
  
  // نفس الرقم مكرر
  const isAllSame = password.split('').every(char => char === password[0]);
  
  // أنماط ممنوعة
  const forbiddenPatterns = ['123456', '12345678', '111111', '222222', '333333', '444444', '555555'];
  const containsForbidden = forbiddenPatterns.some(pattern => password.includes(pattern));
  
  return isSequentialUp || isSequentialDown || isAllSame || containsForbidden;
};

// ==========================================
// التحقق من البريد الإلكتروني
// ==========================================
app.get('/api/auth/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    res.json({ exists: !!user });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'حدث خطأ في التحقق من البريد الإلكتروني' });
  }
});

// ==========================================
// تسجيل حساب جديد
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, city, role } = req.body;
    
    // التحقق من صحة البريد
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير صالح' });
    }
    
    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }
    
    // التحقق من أن كلمة المرور ليست متتابعة
    if (isSequential(password)) {
      return res.status(400).json({ error: 'كلمة المرور غير مقبولة. لا يمكن استخدام أرقام متتابعة أو مكررة' });
    }
    
    // التحقق إذا البريد موجود
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone: phone || '',
        passwordHash: hashedPassword,
        city: city || 'عمان',
        role: role || 'JOB_SEEKER',
        trustScore: 50,
      },
    });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role,
        city: user.city,
        trustScore: user.trustScore 
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'حدث خطأ في إنشاء الحساب' });
  }
});

// ==========================================
// تسجيل الدخول
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role,
        city: user.city,
        trustScore: user.trustScore,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'حدث خطأ في تسجيل الدخول' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'فرصتي API is running 🚀' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Mayawma server running on port ${PORT}`);
  console.log(`📧 Check email: http://localhost:${PORT}/api/auth/check-email?email=test@example.com`);
});