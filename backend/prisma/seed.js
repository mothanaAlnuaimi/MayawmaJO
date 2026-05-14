const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Admin
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@forsati.jo' },
    update: {},
    create: {
      fullName: 'مدير المنصة',
      email: 'admin@forsati.jo',
      phone: '0799000000',
      passwordHash: adminHash,
      role: 'ADMIN',
      city: 'عمان',
      trustScore: 100,
      isVerified: true,
    },
  });

  // Create Employers
  const employerHash = await bcrypt.hash('employer123', 10);

  const employer1 = await prisma.user.upsert({
    where: { email: 'events@jordanpro.jo' },
    update: {},
    create: {
      fullName: 'أحمد الخالدي',
      email: 'events@jordanpro.jo',
      phone: '0791234567',
      passwordHash: employerHash,
      role: 'EMPLOYER',
      city: 'عمان',
      rating: 4.5,
      trustScore: 82,
      isVerified: true,
      employerProfile: {
        create: {
          businessName: 'شركة جوردان برو للفعاليات',
          businessType: 'تنظيم فعاليات',
          location: 'عمان - الشميساني',
          verifiedDocumentsStatus: 'APPROVED',
        },
      },
    },
  });

  const employer2 = await prisma.user.upsert({
    where: { email: 'delivery@zarqa.jo' },
    update: {},
    create: {
      fullName: 'محمد السالم',
      email: 'delivery@zarqa.jo',
      phone: '0781234567',
      passwordHash: employerHash,
      role: 'EMPLOYER',
      city: 'الزرقاء',
      rating: 4.2,
      trustScore: 75,
      isVerified: true,
      employerProfile: {
        create: {
          businessName: 'توصيل الزرقاء السريع',
          businessType: 'توصيل وشحن',
          location: 'الزرقاء - المدينة الجديدة',
          verifiedDocumentsStatus: 'APPROVED',
        },
      },
    },
  });

  const employer3 = await prisma.user.upsert({
    where: { email: 'tech@irbid.jo' },
    update: {},
    create: {
      fullName: 'سارة عبد الله',
      email: 'tech@irbid.jo',
      phone: '0771234567',
      passwordHash: employerHash,
      role: 'EMPLOYER',
      city: 'إربد',
      rating: 4.8,
      trustScore: 90,
      isVerified: true,
      employerProfile: {
        create: {
          businessName: 'تك إربد للتقنية',
          businessType: 'تقنية معلومات',
          location: 'إربد - الجامعة اليرموك',
          verifiedDocumentsStatus: 'APPROVED',
        },
      },
    },
  });

  const employer4 = await prisma.user.upsert({
    where: { email: 'design@amman.jo' },
    update: {},
    create: {
      fullName: 'ليلى النجار',
      email: 'design@amman.jo',
      phone: '0761234567',
      passwordHash: employerHash,
      role: 'EMPLOYER',
      city: 'عمان',
      rating: 4.6,
      trustScore: 85,
      isVerified: false,
      employerProfile: {
        create: {
          businessName: 'ستوديو إبداع',
          businessType: 'تصميم وإعلام',
          location: 'عمان - الجبيهة',
          verifiedDocumentsStatus: 'PENDING',
        },
      },
    },
  });

  // Create Job Seekers
  const seekerHash = await bcrypt.hash('seeker123', 10);

  const seeker1 = await prisma.user.upsert({
    where: { email: 'omar@student.jo' },
    update: {},
    create: {
      fullName: 'عمر حسن',
      email: 'omar@student.jo',
      phone: '0791111111',
      passwordHash: seekerHash,
      role: 'JOB_SEEKER',
      city: 'عمان',
      rating: 4.3,
      trustScore: 70,
      isVerified: false,
      jobSeekerProfile: {
        create: {
          skills: JSON.stringify(['تصميم جرافيك', 'فوتوشوب', 'illustrator', 'سوشال ميديا']),
          availability: JSON.stringify(['صباح', 'مساء', 'عطل نهاية الأسبوع']),
          preferredJobTypes: JSON.stringify(['تصميم', 'تصوير', 'إدخال بيانات']),
          completedJobs: 5,
          bio: 'طالب جامعي في تخصص الفنون، أبحث عن فرص عمل مرنة في مجال التصميم والتصوير.',
        },
      },
    },
  });

  const seeker2 = await prisma.user.upsert({
    where: { email: 'nour@graduate.jo' },
    update: {},
    create: {
      fullName: 'نور الأحمد',
      email: 'nour@graduate.jo',
      phone: '0782222222',
      passwordHash: seekerHash,
      role: 'JOB_SEEKER',
      city: 'الزرقاء',
      rating: 4.7,
      trustScore: 80,
      isVerified: false,
      jobSeekerProfile: {
        create: {
          skills: JSON.stringify(['خدمة عملاء', 'إدخال بيانات', 'مبيعات', 'تواصل اجتماعي']),
          availability: JSON.stringify(['مساء', 'عطل نهاية الأسبوع']),
          preferredJobTypes: JSON.stringify(['خدمة عملاء', 'مبيعات', 'إدخال بيانات']),
          completedJobs: 12,
          bio: 'خريجة إدارة أعمال، لدي خبرة في خدمة العملاء والمبيعات.',
        },
      },
    },
  });

  // Create Jobs
  const job1 = await prisma.job.create({
    data: {
      employerId: employer1.id,
      title: 'مساعد تنظيم فعالية زفاف',
      category: 'فعاليات',
      description: 'مطلوب مساعدون لتنظيم حفل زفاف كبير في قاعة الشميساني. المهام تشمل الاستقبال، توزيع الطعام، ومساعدة الضيوف.',
      requirements: 'مظهر لائق، قدرة على الوقوف لساعات طويلة، اللباقة في التعامل مع الناس',
      city: 'عمان',
      area: 'الشميساني',
      date: '2024-02-15',
      startTime: '16:00',
      endTime: '23:00',
      payment: 15,
      workersNeeded: 5,
      status: 'OPEN',
      isVerified: true,
      riskScore: 8,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      employerId: employer2.id,
      title: 'مندوب توصيل طلبات مطاعم',
      category: 'توصيل',
      description: 'مطلوب مندوبو توصيل لتوصيل طلبات المطاعم في منطقة الزرقاء. يُشترط امتلاك دراجة نارية أو سيارة.',
      requirements: 'رخصة قيادة سارية، دراجة نارية أو سيارة، معرفة بشوارع الزرقاء',
      city: 'الزرقاء',
      area: 'المدينة الجديدة',
      date: '2024-02-10',
      startTime: '11:00',
      endTime: '16:00',
      payment: 12,
      workersNeeded: 3,
      status: 'OPEN',
      isVerified: true,
      riskScore: 15,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      employerId: employer3.id,
      title: 'إدخال بيانات عن بعد',
      category: 'إدخال بيانات',
      description: 'مطلوب موظف لإدخال بيانات شركة عن بعد. العمل على برامج Excel وقواعد البيانات.',
      requirements: 'إتقان Excel، سرعة الكتابة، دقة عالية',
      city: 'عن بعد',
      area: 'عن بعد',
      date: '2024-02-12',
      startTime: '09:00',
      endTime: '12:00',
      payment: 10,
      workersNeeded: 2,
      status: 'OPEN',
      isVerified: true,
      riskScore: 5,
    },
  });

  const job4 = await prisma.job.create({
    data: {
      employerId: employer4.id,
      title: 'مصمم بوستات سوشال ميديا',
      category: 'تصميم',
      description: 'مطلوب مصمم جرافيك لتصميم بوستات إعلانية لحسابات التواصل الاجتماعي.',
      requirements: 'إتقان Photoshop أو Canva، ذوق فني، القدرة على العمل تحت الضغط',
      city: 'عن بعد',
      area: 'عن بعد',
      date: '2024-02-08',
      startTime: '10:00',
      endTime: '14:00',
      payment: 20,
      workersNeeded: 1,
      status: 'OPEN',
      isVerified: false,
      riskScore: 30,
    },
  });

  const job5 = await prisma.job.create({
    data: {
      employerId: employer3.id,
      title: 'ممثل خدمة عملاء مؤقت',
      category: 'خدمة عملاء',
      description: 'مطلوب موظف خدمة عملاء للرد على مكالمات العملاء وتقديم الدعم.',
      requirements: 'لغة عربية ممتازة، صوت واضح، خبرة في خدمة العملاء مفضلة',
      city: 'إربد',
      area: 'وسط المدينة',
      date: '2024-02-14',
      startTime: '08:00',
      endTime: '14:00',
      payment: 14,
      workersNeeded: 4,
      status: 'OPEN',
      isVerified: true,
      riskScore: 10,
    },
  });

  const job6 = await prisma.job.create({
    data: {
      employerId: employer1.id,
      title: 'مصور فوتوغرافي لفعالية',
      category: 'تصوير',
      description: 'مطلوب مصور محترف لتوثيق فعالية شركة. يُشترط امتلاك كاميرا احترافية.',
      requirements: 'خبرة في التصوير الاحترافي، امتلاك كاميرا DSLR، portfolio حديث',
      city: 'عمان',
      area: 'العبدلي',
      date: '2024-02-20',
      startTime: '17:00',
      endTime: '21:00',
      payment: 35,
      workersNeeded: 1,
      status: 'OPEN',
      isVerified: true,
      riskScore: 12,
    },
  });

  const job7 = await prisma.job.create({
    data: {
      employerId: employer2.id,
      title: 'مساعد في متجر إلكترونيات',
      category: 'مبيعات',
      description: 'مطلوب مساعد مبيعات في متجر إلكترونيات في الزرقاء. المهام: مساعدة العملاء، ترتيب البضائع، الكاشير.',
      requirements: 'خبرة في المبيعات مفضلة، معرفة بالأجهزة الإلكترونية',
      city: 'الزرقاء',
      area: 'الهاشمي الشمالي',
      date: '2024-02-11',
      startTime: '10:00',
      endTime: '18:00',
      payment: 18,
      workersNeeded: 2,
      status: 'OPEN',
      isVerified: true,
      riskScore: 20,
    },
  });

  // Create some applications
  await prisma.application.create({
    data: {
      jobId: job4.id,
      seekerId: seeker1.id,
      status: 'PENDING',
    },
  });

  await prisma.application.create({
    data: {
      jobId: job3.id,
      seekerId: seeker2.id,
      status: 'ACCEPTED',
    },
  });

  await prisma.application.create({
    data: {
      jobId: job5.id,
      seekerId: seeker2.id,
      status: 'PENDING',
    },
  });

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: seeker1.id,
        title: 'مرحباً بك في فرصتي!',
        message: 'تم إنشاء حسابك بنجاح. ابدأ بتصفح الفرص المتاحة.',
        type: 'WELCOME',
        isRead: false,
      },
      {
        userId: seeker2.id,
        title: 'تم قبول طلبك!',
        message: 'تم قبول طلبك لوظيفة إدخال بيانات عن بعد. تواصل مع صاحب العمل.',
        type: 'APPLICATION_ACCEPTED',
        isRead: false,
      },
      {
        userId: seeker2.id,
        title: 'فرصة جديدة قريبة منك',
        message: 'تم نشر فرصة عمل جديدة في الزرقاء تناسب مهاراتك.',
        type: 'NEW_JOB',
        isRead: true,
      },
      {
        userId: employer1.id,
        title: 'طلب جديد على وظيفتك',
        message: 'تقدم باحث عمل جديد لوظيفة "مساعد تنظيم فعالية زفاف".',
        type: 'NEW_APPLICATION',
        isRead: false,
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test accounts:');
  console.log('Admin: admin@forsati.jo / admin123');
  console.log('Employer 1: events@jordanpro.jo / employer123');
  console.log('Employer 2: delivery@zarqa.jo / employer123');
  console.log('Employer 3: tech@irbid.jo / employer123');
  console.log('Job Seeker 1: omar@student.jo / seeker123');
  console.log('Job Seeker 2: nour@graduate.jo / seeker123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
