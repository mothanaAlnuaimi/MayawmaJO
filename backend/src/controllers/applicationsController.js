const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// POST /api/jobs/:id/apply
const applyToJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const seekerId = req.user.id;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'الوظيفة غير موجودة' });
    if (job.status !== 'OPEN') return res.status(400).json({ error: 'هذه الوظيفة مغلقة' });

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: { jobId, seekerId },
    });
    if (existing) return res.status(400).json({ error: 'لقد تقدمت لهذه الوظيفة من قبل' });

    const application = await prisma.application.create({
      data: { jobId, seekerId },
    });

    // Notify employer
    const seeker = await prisma.user.findUnique({ where: { id: seekerId }, select: { fullName: true } });
    await prisma.notification.create({
      data: {
        userId: job.employerId,
        title: 'طلب جديد على وظيفتك 📋',
        message: `تقدم ${seeker.fullName} لوظيفة "${job.title}"`,
        type: 'NEW_APPLICATION',
      },
    });

    res.status(201).json({ message: 'تم تقديم طلبك بنجاح', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ في تقديم الطلب' });
  }
};

// GET /api/applications/my - Job seeker sees their own applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { seekerId: req.user.id },
      include: {
        job: {
          include: {
            employer: {
              select: { fullName: true, isVerified: true,
                employerProfile: { select: { businessName: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// GET /api/employer/applications - Employer sees applications for their jobs
const getEmployerApplications = async (req, res) => {
  try {
    const { jobId } = req.query;

    const where = {
      job: { employerId: req.user.id },
      ...(jobId && { jobId: parseInt(jobId) }),
    };

    const applications = await prisma.application.findMany({
      where,
      include: {
        seeker: {
          select: {
            id: true, fullName: true, city: true, rating: true, trustScore: true,
            jobSeekerProfile: { select: { skills: true, completedJobs: true, bio: true } },
          },
        },
        job: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// PUT /api/applications/:id/status - Employer accepts/rejects
const updateApplicationStatus = async (req, res) => {
  try {
    const appId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'حالة غير صالحة' });
    }

    const application = await prisma.application.findUnique({
      where: { id: appId },
      include: { job: true },
    });

    if (!application) return res.status(404).json({ error: 'الطلب غير موجود' });
    if (application.job.employerId !== req.user.id) {
      return res.status(403).json({ error: 'ليس لديك صلاحية' });
    }

    const updated = await prisma.application.update({
      where: { id: appId },
      data: { status },
    });

    // Notify job seeker
    const statusText = status === 'ACCEPTED' ? 'قبول' : 'رفض';
    const icon = status === 'ACCEPTED' ? '✅' : '❌';
    await prisma.notification.create({
      data: {
        userId: application.seekerId,
        title: `تم ${statusText} طلبك ${icon}`,
        message: `تم ${statusText} طلبك لوظيفة "${application.job.title}"`,
        type: status === 'ACCEPTED' ? 'APPLICATION_ACCEPTED' : 'APPLICATION_REJECTED',
      },
    });

    res.json({ message: `تم ${statusText} الطلب`, application: updated });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

module.exports = { applyToJob, getMyApplications, getEmployerApplications, updateApplicationStatus };
