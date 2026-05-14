/**
 * AI Service - Rule-based intelligence for Forsati MVP
 * Contains: Job Matching, Risk Detection, Trust Score, Profile Builder
 */

// ==========================================
// 1. FAKE JOB DETECTION - Risk Score (0-100)
// ==========================================
const calculateRiskScore = ({ title, description, payment, city, isEmployerVerified, startTime, endTime }) => {
  let risk = 0;

  // Short description is suspicious
  if (!description || description.length < 50) risk += 25;
  else if (description.length < 100) risk += 10;

  // No location
  if (!city || city === '') risk += 15;

  // Unusually high payment (> 100 JOD for a few hours)
  if (payment > 100) risk += 20;
  else if (payment > 60) risk += 10;

  // Employer not verified
  if (!isEmployerVerified) risk += 15;

  // No time specified
  if (!startTime || !endTime) risk += 10;

  // Suspicious words in title/description
  const suspiciousWords = ['سريع', 'فوري', 'مضمون ربح', 'استثمار', 'عمولة عالية', 'سري', 'خاص جداً', 'لا تخبر أحد'];
  const text = `${title} ${description}`.toLowerCase();
  suspiciousWords.forEach(word => {
    if (text.includes(word)) risk += 10;
  });

  // Cap at 100
  return Math.min(risk, 100);
};

// ==========================================
// 2. TRUST SCORE CALCULATION
// ==========================================
const calculateTrustScore = ({ isVerified, rating, completedJobs, reportsCount, accountAgeDays }) => {
  let score = 50; // base

  // Verified account adds trust
  if (isVerified) score += 20;

  // Good rating
  if (rating >= 4.5) score += 15;
  else if (rating >= 4.0) score += 10;
  else if (rating >= 3.5) score += 5;
  else if (rating < 2.0) score -= 15;

  // Completed jobs history
  if (completedJobs >= 20) score += 15;
  else if (completedJobs >= 10) score += 10;
  else if (completedJobs >= 5) score += 5;

  // Reports reduce trust
  if (reportsCount >= 3) score -= 30;
  else if (reportsCount >= 1) score -= 10;

  // Account age
  if (accountAgeDays > 365) score += 5;
  else if (accountAgeDays > 90) score += 3;

  return Math.max(0, Math.min(100, score));
};

// ==========================================
// 3. SMART JOB MATCHING
// ==========================================
const matchJobsForSeeker = (seeker, jobs) => {
  const seekerSkills = JSON.parse(seeker.jobSeekerProfile?.skills || '[]').map(s => s.toLowerCase());
  const seekerAvailability = JSON.parse(seeker.jobSeekerProfile?.availability || '[]');
  const preferredTypes = JSON.parse(seeker.jobSeekerProfile?.preferredJobTypes || '[]').map(s => s.toLowerCase());
  const seekerCity = seeker.city?.toLowerCase() || '';

  const scoredJobs = jobs.map(job => {
    let score = 0;
    const reasons = [];

    // City match (highest priority)
    if (job.city === 'عن بعد') {
      score += 30;
      reasons.push('متاحة للعمل عن بعد');
    } else if (job.city?.toLowerCase() === seekerCity) {
      score += 25;
      reasons.push('قريبة من موقعك');
    }

    // Skills match
    const jobText = `${job.title} ${job.category} ${job.description}`.toLowerCase();
    const matchedSkills = seekerSkills.filter(skill => jobText.includes(skill));
    if (matchedSkills.length > 0) {
      score += matchedSkills.length * 15;
      reasons.push(`تناسب مهاراتك في ${matchedSkills.slice(0, 2).join(' و')}`);
    }

    // Preferred job type match
    if (preferredTypes.some(type => job.category?.toLowerCase().includes(type) || type.includes(job.category?.toLowerCase()))) {
      score += 20;
      reasons.push('من التخصصات المفضلة لديك');
    }

    // Verified employer
    if (job.employer?.isVerified) {
      score += 10;
      reasons.push('صاحب العمل موثق');
    }

    // Low risk score
    if (job.riskScore < 20) {
      score += 5;
    }

    // Generate Arabic reason string
    let reasonText = '';
    if (reasons.length > 0) {
      reasonText = `هذه الفرصة مناسبة لك لأنها ${reasons.join('، ')}.`;
    } else {
      reasonText = 'هذه الفرصة قد تناسب ملفك الشخصي.';
    }

    return {
      job,
      matchingScore: Math.min(score, 100),
      reason: reasonText,
    };
  });

  // Sort by score descending and filter score > 0
  return scoredJobs
    .filter(item => item.matchingScore > 0)
    .sort((a, b) => b.matchingScore - a.matchingScore)
    .slice(0, 10);
};

// ==========================================
// 4. AI PROFILE BUILDER
// ==========================================
const buildProfileFromText = (text) => {
  // Category mapping
  const categoryMap = {
    'تصميم': ['فوتوشوب', 'photoshop', 'illustrator', 'canva', 'تصميم', 'جرافيك', 'graphic'],
    'تصوير': ['تصوير', 'كاميرا', 'photography', 'فيديو', 'video'],
    'توصيل': ['توصيل', 'قيادة', 'سيارة', 'دراجة', 'delivery'],
    'إدخال بيانات': ['excel', 'اكسل', 'بيانات', 'data', 'كتابة', 'typing'],
    'خدمة عملاء': ['خدمة عملاء', 'تواصل', 'تسويق', 'customer', 'service'],
    'مبيعات': ['مبيعات', 'بيع', 'sales', 'تسويق'],
    'فعاليات': ['فعاليات', 'تنظيم', 'events', 'حفلات'],
  };

  const textLower = text.toLowerCase();

  // Extract skills from text
  const allSkillKeywords = [
    'فوتوشوب', 'photoshop', 'illustrator', 'canva', 'excel', 'word', 'powerpoint',
    'تصميم', 'تصوير', 'برمجة', 'java', 'python', 'javascript',
    'خدمة عملاء', 'مبيعات', 'تسويق', 'إدخال بيانات', 'توصيل',
    'محاسبة', 'ترجمة', 'تحرير', 'كتابة', 'تدريس',
  ];

  const extractedSkills = allSkillKeywords.filter(skill =>
    textLower.includes(skill.toLowerCase())
  );

  // Find suggested categories
  const suggestedCategories = [];
  Object.entries(categoryMap).forEach(([category, keywords]) => {
    if (keywords.some(kw => textLower.includes(kw))) {
      suggestedCategories.push(category);
    }
  });

  // Generate bio
  const bio = text.length > 20
    ? `باحث عن فرص عمل مرن. ${extractedSkills.length > 0 ? `لدي خبرة في: ${extractedSkills.slice(0, 4).join('، ')}.` : ''} أبحث عن فرص تناسب مهاراتي وتوقيتي.`
    : 'أبحث عن فرص عمل مرنة تناسب وقتي وإمكانياتي.';

  return {
    cleanedSkills: extractedSkills.length > 0 ? extractedSkills : ['لم يتم تحديد مهارات'],
    suggestedCategories: suggestedCategories.length > 0 ? suggestedCategories : ['خدمة عملاء', 'إدخال بيانات'],
    improvedBio: bio,
  };
};

// Risk level label for UI
const getRiskLabel = (riskScore) => {
  if (riskScore >= 70) return { level: 'high', label: 'مخاطرة عالية', color: 'red' };
  if (riskScore >= 40) return { level: 'medium', label: 'يحتاج مراجعة', color: 'orange' };
  return { level: 'low', label: 'آمن', color: 'green' };
};

module.exports = {
  calculateRiskScore,
  calculateTrustScore,
  matchJobsForSeeker,
  buildProfileFromText,
  getRiskLabel,
};
