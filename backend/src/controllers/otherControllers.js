const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// =================== REVIEWS ===================

const createReview = async (req, res) => {
  try {
    const { reviewedUserId, jobId, rating, comment } = req.body;

    if (!reviewedUserId || !jobId || !rating) {
      return res.status(400).json({ error: 'يرجى ملء جميع الحقول' });
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: req.user.id,
        reviewedUserId: parseInt(reviewedUserId),
        jobId: parseInt(jobId),
        rating: parseInt(rating),
        comment,
      },
    });

    // Update reviewed user's average rating
    const reviews = await prisma.review.findMany({ where: { reviewedUserId: parseInt(reviewedUserId) } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.user.update({ where: { id: parseInt(reviewedUserId) }, data: { rating: avgRating } });

    res.status(201).json({ message: 'تم إضافة التقييم', review });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { reviewedUserId: parseInt(req.params.id) },
      include: { reviewer: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// =================== REPORTS ===================

const createReport = async (req, res) => {
  try {
    const { jobId, reason } = req.body;
    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        jobId: parseInt(jobId),
        reason,
      },
    });

    // Auto-block job if > 3 reports
    const reportCount = await prisma.report.count({ where: { jobId: parseInt(jobId) } });
    if (reportCount >= 3) {
      await prisma.job.update({ where: { id: parseInt(jobId) }, data: { status: 'BLOCKED' } });
    }

    res.status(201).json({ message: 'تم إرسال البلاغ', report });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

const getAdminReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { fullName: true } },
        job: { select: { title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const report = await prisma.report.update({
      where: { id: parseInt(req.params.id) },
      data: { status: req.body.status },
    });
    res.json({ message: 'تم تحديث البلاغ', report });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// =================== NOTIFICATIONS ===================

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true },
    });
    res.json({ message: 'تم تحديث الإشعار' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// =================== ADMIN ===================

const getAdminStats = async (req, res) => {
  try {
    const [users, jobs, applications, reports] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.report.count({ where: { status: 'OPEN' } }),
    ]);
    res.json({ users, jobs, applications, openReports: reports });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, fullName: true, email: true, role: true, city: true,
        isVerified: true, isBlocked: true, trustScore: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isBlocked: req.body.isBlocked },
    });
    res.json({ message: `تم ${req.body.isBlocked ? 'حظر' : 'إلغاء حظر'} المستخدم` });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

const verifyEmployer = async (req, res) => {
  try {
    await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { isVerified: true } });
    await prisma.employerProfile.updateMany({
      where: { userId: parseInt(req.params.id) },
      data: { verifiedDocumentsStatus: 'APPROVED' },
    });
    res.json({ message: 'تم توثيق صاحب العمل' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

const blockJob = async (req, res) => {
  try {
    await prisma.job.update({ where: { id: parseInt(req.params.id) }, data: { status: 'BLOCKED' } });
    res.json({ message: 'تم حظر الوظيفة' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

module.exports = {
  createReview, getUserReviews,
  createReport, getAdminReports, updateReportStatus,
  getNotifications, markNotificationRead,
  getAdminStats, getAdminUsers, blockUser, verifyEmployer, blockJob,
};
