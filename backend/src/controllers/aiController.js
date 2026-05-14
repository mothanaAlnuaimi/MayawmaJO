const { PrismaClient } = require('@prisma/client');
const { matchJobsForSeeker, buildProfileFromText, calculateTrustScore } = require('../services/aiService');

const prisma = new PrismaClient();

// GET /api/ai/recommended-jobs
const getRecommendedJobs = async (req, res) => {
  try {
    const seeker = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { jobSeekerProfile: true },
    });

    const jobs = await prisma.job.findMany({
      where: { status: 'OPEN' },
      include: {
        employer: {
          select: { id: true, fullName: true, isVerified: true, rating: true, trustScore: true,
            employerProfile: { select: { businessName: true } } },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    const matched = matchJobsForSeeker(seeker, jobs);
    res.json(matched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ في جلب التوصيات' });
  }
};

// POST /api/ai/profile-suggestions
const getProfileSuggestions = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'يرجى إدخال نص' });

    const suggestions = buildProfileFromText(text);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// GET /api/ai/trust-score/:userId
const getUserTrustScore = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: { select: { completedJobs: true } },
        reports: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const accountAgeDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    const score = calculateTrustScore({
      isVerified: user.isVerified,
      rating: user.rating,
      completedJobs: user.jobSeekerProfile?.completedJobs || 0,
      reportsCount: user.reports.length,
      accountAgeDays,
    });

    // Update trust score in DB
    await prisma.user.update({ where: { id: userId }, data: { trustScore: score } });

    res.json({ trustScore: score, userId });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

module.exports = { getRecommendedJobs, getProfileSuggestions, getUserTrustScore };
