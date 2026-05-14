const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول أولاً' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true, fullName: true, email: true, role: true,
        city: true, isVerified: true, isBlocked: true, trustScore: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'تم حظر هذا الحساب' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'رمز المصادقة غير صالح' });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'ليس لديك صلاحية للوصول لهذا المورد' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
