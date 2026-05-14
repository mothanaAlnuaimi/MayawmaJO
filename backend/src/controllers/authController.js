const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { calculateTrustScore } = require('../services/aiService');

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      fullName, email, phone, password, city, role,
      // Job Seeker fields
      skills, availability, preferredJobTypes,
      // Employer fields
      businessName, businessType, location,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة' });
    }

    if (!['JOB_SEEKER', 'EMPLOYER'].includes(role)) {
      return res.status(400).json({ error: 'نوع الحساب غير صالح' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with profile in one transaction
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        role,
        city,
        trustScore: 50,
        // Create respective profile
        ...(role === 'JOB_SEEKER' && {
          jobSeekerProfile: {
            create: {
              skills: JSON.stringify(skills || []),
              availability: JSON.stringify(availability || []),
              preferredJobTypes: JSON.stringify(preferredJobTypes || []),
            },
          },
        }),
        ...(role === 'EMPLOYER' && {
          employerProfile: {
            create: {
              businessName: businessName || fullName,
              businessType,
              location,
            },
          },
        }),
      },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'مرحباً بك في فرصتي! 🎉',
        message: 'تم إنشاء حسابك بنجاح. ابدأ بتصفح الفرص المتاحة في منطقتك.',
        type: 'WELCOME',
      },
    });

    const token = generateToken(user.id);

    // Remove sensitive data
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'تم حظر هذا الحساب. يرجى التواصل مع الدعم.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const token = generateToken(user.id);
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

module.exports = { register, login, getMe };
