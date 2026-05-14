const { PrismaClient } = require('@prisma/client');
const { calculateRiskScore } = require('../services/aiService');

const prisma = new PrismaClient();

// GET /api/jobs - List all jobs with filters
const getJobs = async (req, res) => {
  try {
    const { city, category, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status: { not: 'BLOCKED' },
      ...(city && city !== 'الكل' && { city }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: {
            select: { id: true, fullName: true, isVerified: true, rating: true, trustScore: true,
              employerProfile: { select: { businessName: true } } },
          },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.job.count({ where }),
    ]);

    res.json({ jobs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ في جلب الوظائف' });
  }
};

// GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        employer: {
          select: {
            id: true, fullName: true, isVerified: true, rating: true, trustScore: true,
            city: true, createdAt: true,
            employerProfile: { select: { businessName: true, businessType: true, location: true } },
          },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!job) return res.status(404).json({ error: 'الوظيفة غير موجودة' });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// POST /api/jobs - Create job (employer only)
const createJob = async (req, res) => {
  try {
    const {
      title, category, description, requirements,
      city, area, date, startTime, endTime,
      payment, workersNeeded,
    } = req.body;

    if (!title || !category || !description || !city || !date || !payment) {
      return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة' });
    }

    // Calculate risk score for this job
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isVerified: true },
    });

    const riskScore = calculateRiskScore({
      title, description, payment, city,
      isEmployerVerified: employer?.isVerified || false,
      startTime, endTime,
    });

    const job = await prisma.job.create({
      data: {
        employerId: req.user.id,
        title, category, description,
        requirements: requirements || '',
        city, area: area || '',
        date, startTime: startTime || '09:00',
        endTime: endTime || '17:00',
        payment: parseFloat(payment),
        workersNeeded: parseInt(workersNeeded) || 1,
        riskScore,
        status: riskScore > 80 ? 'BLOCKED' : 'OPEN',
      },
    });

    // Notify the employer
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'تم نشر وظيفتك ✅',
        message: `تم نشر وظيفة "${title}" بنجاح. ${riskScore > 60 ? 'تنبيه: تم تصنيف الوظيفة بدرجة مخاطرة مرتفعة.' : ''}`,
        type: 'JOB_POSTED',
      },
    });

    res.status(201).json({ message: 'تم نشر الوظيفة بنجاح', job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ في نشر الوظيفة' });
  }
};

// PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) return res.status(404).json({ error: 'الوظيفة غير موجودة' });
    if (job.employerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'ليس لديك صلاحية لتعديل هذه الوظيفة' });
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: req.body,
    });

    res.json({ message: 'تم تحديث الوظيفة', job: updated });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) return res.status(404).json({ error: 'الوظيفة غير موجودة' });
    if (job.employerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'ليس لديك صلاحية لحذف هذه الوظيفة' });
    }

    await prisma.job.update({ where: { id: jobId }, data: { status: 'CLOSED' } });

    res.json({ message: 'تم إغلاق الوظيفة' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// GET /api/employer/jobs - Get employer's own jobs
const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { employerId: req.user.id },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getEmployerJobs };
