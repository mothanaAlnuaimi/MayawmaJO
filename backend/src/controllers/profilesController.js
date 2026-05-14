const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/profile/me
const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
        reviewsReceived: {
          include: { reviewer: { select: { fullName: true } } },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    const { passwordHash, ...userClean } = user;
    res.json(userClean);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// PUT /api/profile/me
const updateMyProfile = async (req, res) => {
  try {
    const { fullName, phone, city, avatar,
      // Seeker fields
      skills, availability, preferredJobTypes, bio,
      // Employer fields
      businessName, businessType, location } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(city && { city }),
        ...(avatar && { avatar }),
      },
    });

    // Update profile based on role
    if (req.user.role === 'JOB_SEEKER') {
      await prisma.jobSeekerProfile.upsert({
        where: { userId: req.user.id },
        update: {
          ...(skills && { skills: JSON.stringify(skills) }),
          ...(availability && { availability: JSON.stringify(availability) }),
          ...(preferredJobTypes && { preferredJobTypes: JSON.stringify(preferredJobTypes) }),
          ...(bio && { bio }),
        },
        create: {
          userId: req.user.id,
          skills: JSON.stringify(skills || []),
          availability: JSON.stringify(availability || []),
          preferredJobTypes: JSON.stringify(preferredJobTypes || []),
          bio: bio || '',
        },
      });
    } else if (req.user.role === 'EMPLOYER') {
      await prisma.employerProfile.upsert({
        where: { userId: req.user.id },
        update: {
          ...(businessName && { businessName }),
          ...(businessType && { businessType }),
          ...(location && { location }),
        },
        create: {
          userId: req.user.id,
          businessName: businessName || updatedUser.fullName,
          businessType: businessType || '',
          location: location || '',
        },
      });
    }

    res.json({ message: 'تم تحديث الملف الشخصي' });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

// GET /api/users/:id/profile - Public profile
const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true, fullName: true, city: true, rating: true, trustScore: true,
        isVerified: true, createdAt: true,
        jobSeekerProfile: { select: { skills: true, completedJobs: true, bio: true } },
        employerProfile: { select: { businessName: true, businessType: true } },
        reviewsReceived: {
          include: { reviewer: { select: { fullName: true } } },
          take: 3,
        },
      },
    });
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
};

module.exports = { getMyProfile, updateMyProfile, getUserProfile };
