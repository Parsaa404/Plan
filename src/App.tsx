import { useState, useEffect, type FormEvent } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import logoSrc from "./assets/logo.png";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ─── PALETTE — warm cream & forest green, easy on the eyes ── */
const C = {
  bg: "#f7f3ee",
  surface: "#ffffff",
  surfaceAlt: "#f0ebe3",
  border: "#ddd5c8",
  borderSoft: "#e8e1d8",
  green: "#2d6a4f",
  greenMid: "#52b788",
  greenLight: "#d8f3dc",
  gold: "#b5830a",
  goldLight: "#fef3c7",
  blue: "#1d6fa4",
  blueLight: "#dbeafe",
  rose: "#b5454a",
  roseLight: "#fde8e8",
  purple: "#6d3fa0",
  purpleLight: "#ede9fe",
  orange: "#c2540a",
  orangeLight: "#ffedd5",
  text: "#1c1c1c",
  textMid: "#4a4a4a",
  textSoft: "#7a7068",
  textMuted: "#a09484",
};

/* ─── FONTS ────────────────────────────────────────────────── */
const F = {
  enDisplay: "'Lora', Georgia, serif",
  enBody: "'DM Sans', 'Segoe UI', sans-serif",
  faDisplay: "'Vazirmatn', 'Tahoma', sans-serif",
  faBody: "'Vazirmatn', 'Tahoma', sans-serif",
};

/* ─── LANGUAGE CONTEXT ─────────────────────────────────────── */
// lang = "fa" | "en"
// t(fa, en) returns the right string
function useT(lang: "fa" | "en") {
  return (fa: string, en: string) => lang === "fa" ? fa : en;
}

/* ─── SHARED UI ────────────────────────────────────────────── */
function Pip({ color }: { color: string }) {
  return <span style={{
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: color, flexShrink: 0
  }} />;
}

function Tag({ text, color, bg }: { text: string; color: string; bg?: string }) {
  return (
    <span style={{
      fontFamily: F.enBody, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
      textTransform: "uppercase", color: color, background: bg || color + "18",
      border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 8px", whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

function ImpactDots({ n, color }: { n: number; color?: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          display: "inline-block", width: 7, height: 7, borderRadius: "50%",
          background: i <= n ? (color || C.green) : C.border
        }} />
      ))}
    </span>
  );
}

function SectionCard({ children, style: s = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.borderSoft}`,
      borderRadius: 14, padding: 20,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", ...s
    }}>{children}</div>
  );
}

/* ─── DATA ─────────────────────────────────────────────────── */
const SERVICES = [
  {
    priority: "فوری", priorityEn: "Immediate", color: C.green, tagBg: C.greenLight,
    items: [
      {
        icon: "📹", fa: "Live Camera Access", en: "Live Camera Access",
        descFa: "قوی‌ترین ابزار اعتمادسازی. صاحب سگ هر لحظه از گوشیش ببینه سگش چیکار میکنه — استرسش صفر میشه.",
        descEn: "Strongest trust-builder. Owners watch their dog live on their phone — separation anxiety disappears instantly.",
        tag: "High Impact"
      },
      {
        icon: "🚗", fa: "Pet Taxi", en: "Pet Taxi",
        descFa: "سرویس رفت و برگشت سگ. توی KL/Selangor با ترافیک سنگین، خیلی‌ها حوصله نمیارن سگ رو خودشون بیارن.",
        descEn: "Pick-up & drop-off service. In KL/Selangor traffic, many owners simply can't make the trip themselves.",
        tag: "Quick Revenue"
      },
      {
        icon: "☀️", fa: "Daycare روزانه", en: "Daily Daycare",
        descFa: "نگهداری روزانه. صبح میارن، عصر برمیدارن. درآمد ثابت بدون نیاز به اتاق شبانه.",
        descEn: "Drop off in the morning, pick up in the evening. Steady income without overnight rooms.",
        tag: "Steady Income"
      },
    ]
  },
  {
    priority: "میان‌مدت", priorityEn: "Mid-term", color: C.gold, tagBg: C.goldLight,
    items: [
      {
        icon: "📦", fa: "پکیج ترکیبی", en: "Bundle Packages",
        descFa: "۳ شب اقامت + گرومینگ + حمام با تخفیف ۱۵٪. مشتری احساس ارزش میکنه و margin بهتره.",
        descEn: "3 nights boarding + grooming + bath at 15% off. Better margin, stronger perceived value.",
        tag: "Better Margin"
      },
      {
        icon: "📊", fa: "گزارش روزانه", en: "Daily Report",
        descFa: "عکس + ویدیو کوتاه + چند خط توضیح به واتس‌اپ صاحب سگ. هزینه صفر، word-of-mouth منفجر میکنه.",
        descEn: "Photo + short video + a note via WhatsApp daily. Zero cost, massively boosts word-of-mouth.",
        tag: "Free"
      },
      {
        icon: "🎓", fa: "آموزش پایه", en: "Basic Training",
        descFa: "Potty training یا فرمان ساده در طول اقامت. درآمد اضافه بدون فضای بیشتر.",
        descEn: "Potty training or basic commands during the stay. Extra revenue, no extra space needed.",
        tag: "Upsell"
      },
      {
        icon: "🛍️", fa: "Pet Boutique کوچک", en: "Mini Pet Boutique",
        descFa: "یه گوشه برای تشویقی، اسباب‌بازی، مکمل غذایی. حاشیه سود خوب.",
        descEn: "A corner for treats, toys, supplements. Good margins, customers love the surprise.",
        tag: "Passive Income"
      },
    ]
  },
  {
    priority: "ایده طلایی", priorityEn: "Golden Ideas", color: C.orange, tagBg: C.orangeLight,
    items: [
      {
        icon: "🏆", fa: "Report Card اقامت", en: "Stay Report Card",
        descFa: "یه تصویر قشنگ (Canva) بعد از هر اقامت: سگ چی خورد، چقدر بازی کرد، یه عکس. مشتری استوری میکنه — تبلیغ رایگان.",
        descEn: "A designed Canva card after each stay: what they ate, play time, a photo. Owners story it — free advertising.",
        tag: "Viral"
      },
      {
        icon: "💳", fa: "Loyalty Card دیجیتال", en: "Digital Loyalty Card",
        descFa: "واتس‌اپ-based. هر بار مشتری میاد امتیاز میگیره. بعد از ۵ گرومینگ یه حمام رایگان. هزینه صفر، retention عالی.",
        descEn: "WhatsApp-based points. After 5 groomings, one free bath. Zero cost, excellent retention.",
        tag: "Retention"
      },
    ]
  },
];

const MARKETING = [
  {
    channel: "اینستاگرام", channelEn: "Instagram", icon: "📱", color: C.gold,
    badge: "مهم‌ترین کانال", badgeEn: "#1 Channel",
    items: [
      {
        fa: "قبل/بعد گرومینگ", en: "Before/After Grooming",
        descFa: "سگ پشمالو میاد، شیک میره. هر بار گرومینگ یه Reel بساز. این یه ویدیو میتونه وایرال بشه.",
        descEn: "Messy dog in, stylish dog out. Make a Reel every time. This single format can go viral."
      },
      {
        fa: "لحظه بازگشت صاحب سگ", en: "Owner Reunion Moment",
        descFa: "وقتی صاحب سگ برمیگرده و سگ دیوونه خوشحال میشه — احساسیه، شیر میشه، هیچ تبلیغی اینقدر قوی نیست.",
        descEn: "When the owner returns and the dog goes wild with joy — emotional, shareable, better than any paid ad."
      },
      {
        fa: "معرفی شخصیت سگ‌ها", en: "Dog Character Stories",
        descFa: "«امروز Max اومد، اول خجالتی بود ولی الان با همه دوست شده» — مردم عاشق این محتوان.",
        descEn: "'Max arrived shy today but made friends with everyone by evening' — people love character content."
      },
      {
        fa: "فرمول هفتگی", en: "Weekly Formula",
        descFa: "۳ Reel + Story روزانه + هر ۲ هفته یه پست آموزشی.",
        descEn: "3 Reels/week + daily Stories + one educational post every 2 weeks."
      },
    ]
  },
  {
    channel: "Google Maps", channelEn: "Google Maps", icon: "🗺️", color: C.blue,
    badge: "اکثراً نادیده", badgeEn: "Most Overlooked",
    items: [
      {
        fa: "Google Business Profile کامل", en: "Complete Google Business Profile",
        descFa: "عکس حرفه‌ای، ساعت کاری، قیمت‌ها، خدمات. پروفایل ناقص = مشتری به رقیب میره.",
        descEn: "Professional photos, hours, prices, services. An incomplete profile silently sends customers to competitors."
      },
      {
        fa: "جمع کردن Review", en: "Collect Reviews",
        descFa: "بعد از هر سرویس پیام واتس‌اپ + لینک مستقیم. ۲۰ review اول حیاتیه.",
        descEn: "After every service, send a WhatsApp + direct link. The first 20 reviews are absolutely critical."
      },
      {
        fa: "کلمات کلیدی محلی", en: "Local Keywords",
        descFa: "«dog boarding Cyberjaya»، «pet hotel Selangor» رو توی توضیحات پروفایل بنویس.",
        descEn: "Use 'dog boarding Cyberjaya', 'pet hotel Selangor' in your profile description for search visibility."
      },
    ]
  },
  {
    channel: "Local Marketing", channelEn: "Local Marketing", icon: "🤝", color: C.green,
    badge: "ارزون‌ترین و موثرترین", badgeEn: "Cheapest & Best",
    items: [
      {
        fa: "همکاری با دامپزشکی", en: "Vet Clinic Partnership",
        descFa: "کارت ویزیت بذار اونجا، به مشتری‌هاشون تخفیف بده. اعتماد دامپزشک منتقل میشه.",
        descEn: "Leave cards there, give their clients a discount. The vet's trust transfers directly to you."
      },
      {
        fa: "همکاری با پت‌شاپ", en: "Pet Shop Partnership",
        descFa: "معرفی متقابل. اون‌ها غذا میفروشن، تو نگهداری. مشتری‌هاشون میشن مشتری تو.",
        descEn: "Cross-referral. They sell food, you provide care. Their customers naturally become yours."
      },
      {
        fa: "بنر مجتمع مسکونی", en: "Residential Complex Banner",
        descFa: "Cyberjaya/Putrajaya پر از آپارتمان‌نشین‌هاست که سگ دارن. یه بنر توی لابی معجزه میکنه.",
        descEn: "Cyberjaya/Putrajaya is full of apartment dog owners. A simple lobby banner works wonders."
      },
    ]
  },
  {
    channel: "تبلیغات پولی", channelEn: "Paid Ads", icon: "💰", color: C.purple,
    badge: "با بودجه کم شروع کن", badgeEn: "Low Budget Start",
    items: [
      {
        fa: "Instagram/Facebook Ads", en: "Instagram / Facebook Ads",
        descFa: "Dog Owners در Selangor/KL، سن ۲۵-۴۵. با RM200-300/هفته شروع کن.",
        descEn: "Target 'Dog Owners' in Selangor/KL, age 25-45. Start with RM200-300/week and test creatives."
      },
      {
        fa: "میکرو اینفلوئنسر", en: "Micro-Influencers",
        descFa: "پیج‌های پت با ۵k-20k فالوور توی KL. یه گرومینگ رایگان بده، محتوا میسازن.",
        descEn: "Pet pages with 5k-20k followers in KL. Give one free grooming session, they create content."
      },
    ]
  },
];

const TRUST = [
  {
    icon: "🎥", fa: "ویدیوهای واقعی از داخل", en: "Real Behind-the-Scenes Videos",
    descFa: "نه عکس استوکی. فضای واقعی، سگ‌های واقعی، کارکنان واقعی. صداقت رو مردم حس میکنن.",
    descEn: "No stock photos. Real space, real dogs, real staff. People sense authenticity immediately."
  },
  {
    icon: "🧼", fa: "نمایش تمیزی محیط", en: "Show Your Cleanliness",
    descFa: "ویدیوی روتین تمیزکاری بذار. «ما ضدعفونی میکنیم» رو نشون بده، نگو.",
    descEn: "Post your cleaning routine video. Don't say 'we sanitize' — show it. Seeing is believing."
  },
  {
    icon: "👤", fa: "معرفی کارکنان", en: "Introduce Your Staff",
    descFa: "اسم و چهره‌ی آدم‌هایی که با سگ‌ها کار میکنن. مشتری وقتی میدونه «علی» مراقب سگشه آروم‌تره.",
    descEn: "Show the name and face of whoever cares for the dogs. Owners relax when they know who it is."
  },
  {
    icon: "⭐", fa: "نظرات مشتری واقعی", en: "Real Customer Testimonials",
    descFa: "Screenshot واتس‌اپ، ویدیوی رضایت، نظر گوگل — همه رو هایلایت کن.",
    descEn: "WhatsApp screenshots, satisfaction videos, Google reviews — highlight them everywhere."
  },
  {
    icon: "🏥", fa: "همکاری با دامپزشک", en: "Vet Clinic Partnership",
    descFa: "اگه یه کلینیک شریک داری این رو حتماً توی مارکتینگ بگو. خیلی اعتماد میسازه.",
    descEn: "If you have a partner vet clinic, mention it everywhere in your marketing."
  },
  {
    icon: "📋", fa: "پروتکل واکسیناسیون", en: "Vaccination Protocol",
    descFa: "فقط سگ‌های واکسینه بپذیر و اعلام کن. مشتری‌های خوب این رو میخوان.",
    descEn: "Only accept vaccinated dogs and announce it. Good clients want this — it filters out the rest."
  },
];

const TASKS = [
  {
    phase: "این هفته", phaseEn: "This Week", color: C.rose,
    items: [
      {
        icon: "📱", fa: "ویرایش کپشن پست boarding (حذف برچسب‌های AI)", en: "Edit boarding post caption (Remove AI tags)",
        descFa: "کپشن پست boarding که labelهای AI داره رو ویرایش کن و طبیعی بنویس.",
        descEn: "Edit the boarding post caption that contains AI labels to make it feel natural.",
        effort: "۵ دقیقه", effortEn: "5 min"
      },
      {
        icon: "🔗", fa: "تغییر لینک بیو به واتس‌اپ مستقیم", en: "Change bio link to direct WhatsApp",
        descFa: "لینک بیو اینستاگرام رو از gmail به لینک مستقیم واتس‌اپ تغییر بده.",
        descEn: "Change the bio link from Gmail to a direct WhatsApp chat link.",
        effort: "۵ دقیقه", effortEn: "5 min"
      },
      {
        icon: "📌", fa: "unpin کردن flyerها و pin کردن بهترین Reel", en: "Unpin flyers & pin best Reel",
        descFa: "فلایرها رو از پین در بیار و بهترین ویدیوی ریل واقعی رو پین کن.",
        descEn: "Unpin the flyers and pin the absolute best real guest dog Reel instead.",
        effort: "۵ دقیقه", effortEn: "5 min"
      },
      {
        icon: "💵", fa: "اضافه کردن هایلایت Pricing", en: "Add Pricing highlight",
        descFa: "هایلایت استوری جدیدی برای لیست قیمت‌ها و پکیج‌ها بساز.",
        descEn: "Create a new story highlight dedicated to pricing and packages.",
        effort: "۱۵ دقیقه", effortEn: "15 min"
      },
      {
        icon: "⭐", fa: "طراحی کاور هایلایت Our Reviews", en: "Design 'Our Reviews' highlight cover",
        descFa: "یه کاور شیک و هماهنگ برای هایلایت نظرات مشتریان طراحی و ست کن.",
        descEn: "Design and set a matching premium cover for 'Our Reviews' highlight.",
        effort: "۱۵ دقیقه", effortEn: "15 min"
      },
      {
        icon: "🗺️", fa: "تکمیل Google Business Profile", en: "Complete Google Business Profile",
        descFa: "اطلاعات، ساعت کاری، خدمات و توضیحات گوگل مپس رو کامل کن.",
        descEn: "Fill in all working hours, services, details, and keywords on Google Business.",
        effort: "۳۰ دقیقه", effortEn: "30 min"
      },
      {
        icon: "📸", fa: "آپلود ۱۰+ عکس واقعی از داخل هتل", en: "Upload 10+ real photos of the hotel",
        descFa: "حداقل ۱۰ عکس باکیفیت و واقعی از بخش‌های مختلف داخل هتل در گوگل مپس آپلود کن.",
        descEn: "Upload 10 or more high-quality real photos of the hotel interior and play area.",
        effort: "۱ ساعت", effortEn: "1 hr"
      },
      {
        icon: "✉️", fa: "ارسال لینک مستقیم review به مشتریان قبلی", en: "Send direct review link to past clients",
        descFa: "لینک مستقیم ثبت نظر گوگل مپس رو بردار و برای مشتری‌های قبلی بفرست.",
        descEn: "Retrieve the direct Google review link and share it with previous clients via WhatsApp.",
        effort: "۳۰ دقیقه", effortEn: "30 min"
      },
    ]
  },
  {
    phase: "این ماه", phaseEn: "This Month", color: C.gold,
    items: [
      {
        icon: "📅", fa: "ساختن تقویم محتوایی ماهانه", en: "Create monthly content calendar",
        descFa: "برنامه و موضوعات پست‌ها و استوری‌های کل ماه رو بنویس.",
        descEn: "Map out the content schedule and topics for posts and stories for the entire month.",
        effort: "۲ ساعت", effortEn: "2 hrs"
      },
      {
        icon: "🐕", fa: "شروع Story روزانه از سگ‌های مهمان", en: "Start daily Stories of guest dogs",
        descFa: "هر روز از بازی و استراحت سگ‌های مهمان استوری‌های شاد و واقعی بذار.",
        descEn: "Post daily behind-the-scenes stories showing guest dogs playing and relaxing.",
        effort: "۱۰ دقیقه/روز", effortEn: "10m/day"
      },
      {
        icon: "✂️", fa: "ساخت اولین Reel قبل/بعد گرومینگ کامل", en: "Create first grooming Before/After Reel",
        descFa: "یه ویدیوی جذاب از تغییر ظاهر سگ قبل و بعد از گرومینگ کامل درست کن.",
        descEn: "Produce a transformation Reel showing a dog before and after a full grooming session.",
        effort: "۱ ساعت", effortEn: "1 hr"
      },
      {
        icon: "📝", fa: "طراحی Report Card در Canva", en: "Design Report Card template in Canva",
        descFa: "یه قالب قشنگ برای کارنامه روزانه سگ‌ها توی کانوا طراحی کن.",
        descEn: "Design a customized daily report card template for dogs using Canva.",
        effort: "۱ ساعت", effortEn: "1 hr"
      },
      {
        icon: "💬", fa: "آماده کردن ۵ تا Template پیام واتساپ", en: "Prepare 5 WhatsApp message templates",
        descFa: "پیام‌های آماده خوش‌آمد، گزارش روزانه، درخواست نظر و غیره رو آماده کن.",
        descEn: "Draft 5 reusable templates: welcome, daily updates, checkout, review request, etc.",
        effort: "۴۵ دقیقه", effortEn: "45 min"
      },
      {
        icon: "📝", fa: "راه‌اندازی Google Form برای رزرو آنلاین", en: "Set up Google Form for online booking",
        descFa: "یه فرم ساده و مشخص برای ثبت درخواست رزرو آنلاین مشتریان بساز.",
        descEn: "Create a clear, simple Google Form for clients to submit online booking requests.",
        effort: "۱ ساعت", effortEn: "1 hr"
      },
      {
        icon: "📢", fa: "ساختن WhatsApp Broadcast List", en: "Create WhatsApp Broadcast List",
        descFa: "لیست انتشار واتس‌اپ از مشتری‌های قبلی برای ارسال خبرنامه‌ها بساز.",
        descEn: "Compile past clients into a WhatsApp Broadcast list for quick announcements.",
        effort: "۳۰ دقیقه", effortEn: "30 min"
      },
      {
        icon: "🎁", fa: "اعلام Referral Program (معرفی دوست = حمام رایگان)", en: "Announce Referral Program",
        descFa: "طرح جدید معرف رو اعلام کن: معرفی هر مشتری جدید مساوی با یک حمام رایگان سگ خودشان.",
        descEn: "Announce the referral program: recommend a friend and get a free dog bath.",
        effort: "۳۰ دقیقه", effortEn: "30 min"
      },
    ]
  },
  {
    phase: "ماه دوم", phaseEn: "Month 2", color: C.green,
    items: [
      {
        icon: "🌐", fa: "لندینگ پیج ساده (Wix یا React)", en: "Simple Landing Page (Wix or React)",
        descFa: "یه لندینگ پیج ساده برای معرفی خدمات، گالری، قیمت‌ها و لینک‌های رزرو بساز.",
        descEn: "Build a single-page site showing services, prices, gallery, and booking links.",
        effort: "۴-۵ ساعت", effortEn: "4-5 hrs"
      },
      {
        icon: "🎂", fa: "طراحی و اعلام Birthday Package", en: "Design & launch Birthday Package",
        descFa: "پکیج تولد سگ شامل کیک مخصوص پت، تزیین و عکاسی رو معرفی کن.",
        descEn: "Design and promote a special dog birthday package (pet cake, decorations, photos).",
        effort: "۲ ساعت", effortEn: "2 hrs"
      },
      {
        icon: "🏆", fa: "شروع کمپین Dog of the Month", en: "Launch 'Dog of the Month' campaign",
        descFa: "کمپین معرفی سگ ماه و اهدای تشویقی/لوح یادبود رو آغاز کن.",
        descEn: "Kick off the monthly dog spotlight award with custom treats or digital certificate.",
        effort: "۱ ساعت", effortEn: "1 hr"
      },
      {
        icon: "🤝", fa: "همکاری با ۲ میکرو اینفلوئنسر پت در KL", en: "Partner with 2 KL pet micro-influencers",
        descFa: "با ۲ اینفلوئنسر محلی پت صحبت کن و در ازای خدمات رایگان، تبلیغ بگیر.",
        descEn: "Connect with 2 local pet micro-influencers for content creation in exchange for stays.",
        effort: "۳ ساعت", effortEn: "3 hrs"
      },
      {
        icon: "📷", fa: "کمپین Pawparazzi (روز عکاسی حرفه‌ای)", en: "Pawparazzi Day (Professional Dog Photos)",
        descFa: "یه روز عکاسی حرفه‌ای از سگ‌های هتل با عکاس حیوانات هماهنگ کن.",
        descEn: "Organize a special day for professional pet portrait photography for guests.",
        effort: "نصف روز", effortEn: "Half-day"
      },
    ]
  },
  {
    phase: "ماه سوم", phaseEn: "Month 3", color: C.purple,
    items: [
      {
        icon: "⚙️", fa: "سیستم رزرو آنلاین کامل", en: "Full Online Booking System",
        descFa: "یک سیستم رزرواسیون و پرداخت آنلاین حرفه‌ای راه‌اندازی کن.",
        descEn: "Integrate a comprehensive online booking, availability calendar, and payment system.",
        effort: "۸-۱۰ ساعت", effortEn: "8-10 hrs"
      },
      {
        icon: "👥", fa: "ساخت گروه WhatsApp Community", en: "Create WhatsApp Community group",
        descFa: "جامعه مشتریان هتل رو در یک گروه واتس‌اپ بزرگ‌تر جمع کن.",
        descEn: "Build a broader WhatsApp Community for pet owners to share updates and advice.",
        effort: "۳۰ دقیقه", effortEn: "30 min"
      },
      {
        icon: "🎯", fa: "راه‌اندازی تبلیغات Retargeting Ads", en: "Launch Retargeting Ads",
        descFa: "تبلیغات هدف‌گیری مجدد برای کسانی که از سایت بازدید کرده‌اند اجرا کن.",
        descEn: "Set up Facebook/Google retargeting pixels to reach previous website visitors.",
        effort: "۳ ساعت", effortEn: "3 hrs"
      },
      {
        icon: "🤖", fa: "ساخت Dog Personality AI Report", en: "Create Dog Personality AI Reports",
        descFa: "یه گزارش طنز یا علمی با هوش مصنوعی درباره شخصیت سگ‌ها بعد از اقامت بساز.",
        descEn: "Generate a fun or insightful AI personality scorecard for dogs after their stay.",
        effort: "۴ ساعت", effortEn: "4 hrs"
      },
      {
        icon: "🎉", fa: "رویداد Play Date ماهانه سگ‌ها", en: "Monthly Play Date Event",
        descFa: "یه رویداد حضوری دورهمی سگ‌ها در هتل یا کافه‌های همکار برگزار کن.",
        descEn: "Host a monthly socialization play date event for dog owners at the hotel or cafe.",
        effort: "۴ ساعت", effortEn: "4 hrs"
      },
    ]
  }
];

const PRIORITY = [
  { rank: 1, fa: "Google Maps + اولین Reviews", en: "Google Maps + First Reviews", cost: "رایگان", costEn: "Free", impact: 5, time: "۱ ساعت", timeEn: "1 hr" },
  { rank: 2, fa: "عکاسی حرفه‌ای از محیط", en: "Professional Photos of Venue", cost: "رایگان", costEn: "Free", impact: 5, time: "۳ ساعت", timeEn: "3 hrs" },
  { rank: 3, fa: "گزارش روزانه واتس‌اپ", en: "Daily WhatsApp Report", cost: "رایگان", costEn: "Free", impact: 4, time: "۵ دقیقه/روز", timeEn: "5 min/day" },
  { rank: 4, fa: "همکاری با دامپزشک/پت‌شاپ", en: "Vet & Pet Shop Partnerships", cost: "رایگان", costEn: "Free", impact: 4, time: "چند تماس", timeEn: "A few calls" },
  { rank: 5, fa: "Reel روزانه اینستاگرام", en: "Daily Instagram Reels", cost: "رایگان", costEn: "Free", impact: 4, time: "۱۵ دقیقه/روز", timeEn: "15 min/day" },
  { rank: 6, fa: "Live Camera راه‌اندازی", en: "Live Camera Setup", cost: "RM200-500", costEn: "RM200-500", impact: 5, time: "یه‌بار", timeEn: "One-time" },
  { rank: 7, fa: "Instagram Ads", en: "Instagram Ads", cost: "RM200-300/هفته", costEn: "RM200-300/wk", impact: 3, time: "مداوم", timeEn: "Ongoing" },
  { rank: 8, fa: "لندینگ پیج", en: "Landing Page", cost: "رایگان-کم", costEn: "Free-Low", impact: 3, time: "۵ ساعت", timeEn: "5 hrs" },
];

const CHECKLIST = [
  {
    cat: "این هفته — فوری", catEn: "This Week - Immediate", color: C.rose,
    items: [
      { id: "tw1", fa: "ویرایش کپشن پست boarding (حذف برچسب‌های AI)", en: "Edit boarding post caption (Remove AI tags)" },
      { id: "tw2", fa: "تغییر لینک بیو از gmail به واتساپ مستقیم", en: "Change bio link from Gmail to direct WhatsApp" },
      { id: "tw3", fa: "unpin کردن flyerها، pin کردن بهترین Reel", en: "Unpin flyers, pin the best Reel" },
      { id: "tw4", fa: "اضافه کردن هایلایت Pricing", en: "Add Pricing highlight" },
      { id: "tw5", fa: "درست کردن کاور هایلایت «Our Reviews»", en: "Make cover highlight for 'Our Reviews'" },
      { id: "tw6", fa: "تکمیل Google Business Profile", en: "Complete Google Business Profile" },
      { id: "tw7", fa: "آپلود ۱۰+ عکس واقعی از داخل هتل", en: "Upload 10+ real photos of the hotel interior" },
      { id: "tw8", fa: "گرفتن لینک review مستقیم و فرستادن به مشتریهای قبلی", en: "Send direct review link to past clients" },
    ]
  },
  {
    cat: "این ماه — مهم", catEn: "This Month - Important", color: C.gold,
    items: [
      { id: "tm1", fa: "ساختن تقویم محتوایی ماهانه", en: "Create monthly content calendar" },
      { id: "tm2", fa: "شروع Story روزانه از سگهای مهمان", en: "Start daily Stories of guest dogs" },
      { id: "tm3", fa: "ساختن اولین Reel before/after گرومینگ کامل", en: "Create first grooming Before/After Reel" },
      { id: "tm4", fa: "طراحی Report Card در Canva", en: "Design Report Card template in Canva" },
      { id: "tm5", fa: "آماده کردن ۵ تا Template پیام واتساپ", en: "Prepare 5 WhatsApp message templates" },
      { id: "tm6", fa: "راهاندازی Google Form برای رزرو آنلاین", en: "Set up Google Form for online booking" },
      { id: "tm7", fa: "ساختن WhatsApp Broadcast List از مشتریهای قبلی", en: "Create WhatsApp Broadcast List" },
      { id: "tm8", fa: "اعلام Referral Program (معرفی دوست = حمام رایگان)", en: "Announce Referral Program (free bath)" },
    ]
  },
  {
    cat: "ماه دوم — رشد", catEn: "Month 2 - Growth", color: C.green,
    items: [
      { id: "m2_1", fa: "لندینگ پیج ساده (Wix یا React)", en: "Simple Landing Page (Wix or React)" },
      { id: "m2_2", fa: "Birthday Package طراحی و اعلام کن", en: "Design & launch Birthday Package" },
      { id: "m2_3", fa: "Dog of the Month کمپین شروع کن", en: "Start Dog of the Month campaign" },
      { id: "m2_4", fa: "همکاری با ۲ میکرو اینفلوئنسر پت در KL", en: "Collaborate with 2 pet micro-influencers in KL" },
      { id: "m2_5", fa: "Pawparazzi — یه روز عکاسی حرفهای از سگها", en: "Pawparazzi - professional dog photography day" },
    ]
  },
  {
    cat: "ماه سوم — پیشرفته", catEn: "Month 3 - Advanced", color: C.purple,
    items: [
      { id: "m3_1", fa: "سیستم رزرو آنلاین کامل", en: "Full Online Booking System" },
      { id: "m3_2", fa: "WhatsApp Community گروه بساز", en: "Create WhatsApp Community group" },
      { id: "m3_3", fa: "Retargeting Ads راهانداز", en: "Launch Retargeting Ads" },
      { id: "m3_4", fa: "Dog Personality AI Report بساز", en: "Create Dog Personality AI Report" },
      { id: "m3_5", fa: "Play Date Event ماهانه", en: "Monthly Play Date Event" },
    ]
  }
];

const TABS = [
  { id: "services", icon: "🐾", fa: "خدمات جدید", en: "Services", color: C.green },
  { id: "marketing", icon: "📣", fa: "مارکتینگ", en: "Marketing", color: C.gold },
  { id: "trust", icon: "🛡️", fa: "اعتمادسازی", en: "Trust", color: C.blue },
  { id: "instagram", icon: "📱", fa: "اینستاگرام", en: "Instagram", color: C.purple },
  { id: "ideas", icon: "💡", fa: "ایده‌های ناب", en: "Advanced Ideas", color: C.orange },
  { id: "tasks", icon: "✅", fa: "وظایف تو", en: "Your Tasks", color: C.rose },
  { id: "priority", icon: "🎯", fa: "اولویت‌ها", en: "Priorities", color: C.purple },
  { id: "checklist", icon: "☑️", fa: "چک‌لیست", en: "Checklist", color: C.orange },
  { id: "partners", icon: "🤝", fa: "شرکای محلی", en: "Local Partners", color: C.green }
];

const PARTNERS_CLINICS = [
  {
    nameFa: "۱. کلینیک دامپزشکی Pet Haven ⭐",
    nameEn: "1. Pet Haven Veterinary Clinic ⭐",
    highlightFa: "نزدیک‌ترین به هتل — بهترین گزینه برای همکاری",
    highlightEn: "Closest to hotel — Best candidate for partnership",
    addressFa: "12, Ground Floor, Jalan 22B/70A, Desa Sri Hartamas, 50480 KL",
    addressEn: "12, Ground Floor, Jalan 22B/70A, Desa Sri Hartamas, 50480 KL",
    phone: "+6012 634 2007",
    email: "vetspethaven@gmail.com",
    hoursFa: "تماس بگیرید",
    hoursEn: "Call to check",
    servicesFa: "واکسیناسیون (vaccination)، عقیم‌سازی (neutering)، آزمایش خون (blood test)، طب سوزنی (acupuncture)",
    servicesEn: "vaccination, neutering, blood test, acupuncture",
    whyFa: "همین خیابون هتله — بهترین گزینه برای شروع همکار متقابل و معرفی کارت ویزیت.",
    whyEn: "Located on the same street as the hotel — perfect for mutual cross-referral partnerships.",
    color: C.green
  },
  {
    nameFa: "۲. کلینیک دامپزشکی Ohana",
    nameEn: "2. Ohana Veterinary Clinic & Surgery",
    addressFa: "12, Jalan 22b/70A, Desa Sri Hartamas, 50480 KL",
    addressEn: "12, Jalan 22b/70A, Desa Sri Hartamas, 50480 KL",
    hoursFa: "روزهای هفته 9:30am-5pm، شنبه 9:30am-3:30pm",
    hoursEn: "Weekdays 9:30am-5pm, Saturday 9:30am-3:30pm",
    servicesFa: "آزمایش خون، سونوگرافی، دندان‌پزشکی، عقیم‌سازی، گرومینگ، بردینگ",
    servicesEn: "blood test, ultrasound, dental, neutering, grooming, boarding",
    whyFa: "دارای خدمات گرومینگ و بردینگ است (رقیب ملایم ولی مناسب برای همکارهای جانبی).",
    whyEn: "Offers grooming and boarding as well. Gentle competitor but still good for peripheral referrals.",
    color: C.gold
  },
  {
    nameFa: "۳. کلینیک دامپزشکی Hartamas",
    nameEn: "3. Hartamas Veterinary Clinic",
    addressFa: "Plaza Crystalville 1, GF9, Jalan 23/70A, Desa Sri Hartamas, 50480 KL",
    addressEn: "Plaza Crystalville 1, GF9, Jalan 23/70A, Desa Sri Hartamas, 50480 KL",
    hoursFa: "تماس بگیرید",
    hoursEn: "Call to check",
    servicesFa: "خدمات درمانی عمومی دامپزشکی حیوانات خانگی",
    servicesEn: "General pet healthcare and clinic services",
    whyFa: "همین محله است — گزینه‌ای عالی برای گذاشتن کارت ویزیت و بروشور.",
    whyEn: "Located in the same neighborhood — excellent option for leaving business cards.",
    color: C.blue
  },
  {
    nameFa: "۴. کلینیک دامپزشکی VPAC ⭐",
    nameEn: "4. VPAC — Vets for Pets Animal Clinic ⭐",
    highlightFa: "معروف‌ترین کلینیک منطقه — مشتریان بسیار وفادار",
    highlightEn: "Most famous clinic in the area — highly loyal clients",
    addressFa: "No. 5 (G floor), Jalan Solaris 4, Solaris Mont Kiara, 50480 KL",
    addressEn: "No. 5 (G floor), Jalan Solaris 4, Solaris Mont Kiara, 50480 KL",
    phone: "+6014 919 4980",
    hoursFa: "دوشنبه تا جمعه 10am-1pm و 2pm-7pm، شنبه و یکشنبه 10am-3pm",
    hoursEn: "Mon-Fri 10am-1pm & 2pm-7pm, Sat-Sun 10am-3pm",
    servicesFa: "معاینات سلامت، میکروچیپ، مراقبت دندان، واکسیناسیون، بردینگ، گرومینگ",
    servicesEn: "wellness examination, microchipping, dental care, vaccination, boarding, grooming",
    whyFa: "معروف‌ترین کلینیک منطقه است و مشتری‌های وفادار زیادی دارد که می‌توان با یک آفر خاص جذبشان کرد.",
    whyEn: "The most popular clinic in the district, yielding many loyal clients you can attract via special co-promotions.",
    color: C.purple
  }
];

const PARTNERS_CAFES = [
  {
    nameFa: "۱. کافه CuBs & CuPs ⭐",
    nameEn: "1. CuBs & CuPs ⭐",
    highlightFa: "بهترین گزینه برای همکاری (مخاطب ۱۰۰٪ هدف)",
    highlightEn: "Best candidate for partnership (100% target audience)",
    addressFa: "Lot 22, Wisma Rapid, Jalan 30/70A, Desa Sri Hartamas, KL",
    addressEn: "Lot 22, Wisma Rapid, Jalan 30/70A, Desa Sri Hartamas, KL",
    servicesFa: "منوی مخصوص سگ، فضای بازی سرپوشیده و باز، غذاهای کره‌ای و غربی",
    servicesEn: "Special dog menu, indoor and outdoor play areas, Korean & Western food",
    whyFa: "مستقیماً توی محله هتله و تمام مشتری‌هاش dog ownerها هستند. بهترین محل برای رویدادهای مشترک.",
    whyEn: "Located directly in the hotel's neighborhood, catering exclusively to dog owners. Perfect for joint events.",
    color: C.green
  },
  {
    nameFa: "۲. کافه Bark-A-Bout",
    nameEn: "2. Bark-A-Bout",
    addressFa: "22, Jalan 30/70A, Desa Sri Hartamas, 50480 KL",
    addressEn: "22, Jalan 30/70A, Desa Sri Hartamas, 50480 KL",
    phone: "+6017 24 2495",
    hoursFa: "وسط هفته 11:30am-9:30pm، آخر هفته 9:30am-10:30pm (چهارشنبه‌ها تعطیل)",
    hoursEn: "Weekdays 11:30am-9:30pm, Weekends 9:30am-10:30pm (Closed Wednesdays)",
    servicesFa: "استخر اختصاصی سگ، گرومینگ، فضای بازی",
    servicesEn: "Dog swimming pool, grooming, play area",
    whyFa: "دارای استخر و جامعه فعالی از پت‌اونرهاست. گزینه عالی برای رویدادهای آب‌بازی و تبلیغات متقابل.",
    whyEn: "Features a dog pool and an active community. Great for pool event collaborations and cross-ads.",
    color: C.gold
  },
  {
    nameFa: "۳. کافه Kopenhagen Coffee ⭐",
    nameEn: "3. Kopenhagen Coffee ⭐",
    highlightFa: "پاتوق مشتریان Expat و حرفه‌ای",
    highlightEn: "Expat & professional client hub",
    addressFa: "Shoplot 7, Vista Kiara, 6-7, Jln Kiara 3, Mont Kiara, 50480 KL",
    addressEn: "Shoplot 7, Vista Kiara, 6-7, Jln Kiara 3, Mont Kiara, 50480 KL",
    phone: "03-6211 6363",
    hoursFa: "دوشنبه تا جمعه 7am-4pm، شنبه و یکشنبه 8am-5pm",
    hoursEn: "Mon-Fri 7am-4pm, Sat-Sun 8am-5pm",
    servicesFa: "کافه pet-friendly با استایل مینیمالیستی اسکاندیناوی",
    servicesEn: "Pet-friendly cafe, minimalist Scandinavian style",
    whyFa: "پت‌فرندلی است و مشتری‌های خارجی و با درآمد بالا (Professional) زیادی به آن سر می‌زنند.",
    whyEn: "Highly pet-friendly, attracting expat and high-income professional dog owners.",
    color: C.blue
  },
  {
    nameFa: "۴. کافه KoFi by 77",
    nameEn: "4. KoFi by 77",
    highlightFa: "ورود پت به داخل سالن آزاد است (کمیاب)",
    highlightEn: "Pets welcomed indoors (Rare)",
    addressFa: "Shoplot 7, Vista Kiara, 5, Jln Kiara 3, Mont Kiara, KL",
    addressEn: "Shoplot 7, Vista Kiara, 5, Jln Kiara 3, Mont Kiara, KL",
    phone: "03-6206 1020",
    hoursFa: "دوشنبه تا جمعه 7:30am-4pm، شنبه و یکشنبه 8am-4:30pm",
    hoursEn: "Mon-Fri 7:30am-4pm, Sat-Sun 8am-4:30pm",
    servicesFa: "پذیرایی و منوی کافه‌ای، اجازه ورود پت به داخل سالن (Indoors welcome)",
    servicesEn: "Cafe menu, pets welcomed indoors",
    whyFa: "اجازه ورود سگ به داخل سالن سرپوشیده را می‌دهد که در مالزی کم‌یاب است و مشتریان صمیمی دارد.",
    whyEn: "Rarely in KL, they allow dogs inside the air-conditioned area. Creates a very loyal local community.",
    color: C.purple
  },
  {
    nameFa: "۵. کافه Ra-Ft Café Mont Kiara",
    nameEn: "5. Ra-Ft Café Mont Kiara",
    addressFa: "G-17, Ground Level, Arcoris Plaza, 10, Jalan Kiara, Mont Kiara, 50480 KL",
    addressEn: "G-17, Ground Level, Arcoris Plaza, 10, Jalan Kiara, Mont Kiara, 50480 KL",
    phone: "03-6412 2127",
    hoursFa: "دوشنبه تا جمعه 8am-5pm، شنبه و یکشنبه 8am-6pm",
    hoursEn: "Mon-Fri 8am-5pm, Sat-Sun 9am-6pm",
    servicesFa: "قهوه‌های تخصصی، صبحانه‌های عالی و محیط دوستدار حیوانات در فضای باز",
    servicesEn: "Specialty coffee, great breakfast, outdoor pet-friendly seating",
    whyFa: "واقع در مجتمع Arcoris Mont Kiara، محل تجمع افراد با پت‌های خانگی در روزهای تعطیل.",
    whyEn: "Located in Arcoris Mont Kiara, a very popular weekend hub for local dog owners.",
    color: C.orange
  }
];

const PARTNERS_SHOPS = [
  {
    nameFa: "۱. پت‌شاپ Furball Haven ⭐",
    nameEn: "1. Furball Haven ⭐",
    highlightFa: "رقیب مستقیم و همکار بالقوه",
    highlightEn: "Direct competitor & potential partner",
    addressFa: "1-1, Jalan Solaris 4, Solaris Mont Kiara, 50480 KL",
    addressEn: "1-1, Jalan Solaris 4, Solaris Mont Kiara, 50480 KL",
    phone: "+6018 205 6330",
    servicesFa: "گرومینگ (grooming)، بردینگ (boarding)، دی‌کر (daycare)، سرویس رفت و آمد (pick-up & drop-off)",
    servicesEn: "grooming, boarding, daycare, pick-up & drop-off in Hartamas & Mont Kiara",
    whyFa: "⚠️ رقیب مستقیم شماست ولی می‌توان روی خدمات متفاوت یا ظرفیت‌های سرریز باهم همکاری کرد.",
    whyEn: "⚠️ Direct competitor, but potential for referral when either is fully booked or for distinct styling services.",
    color: C.rose
  },
  {
    nameFa: "۲. پت‌شاپ Doggie House",
    nameEn: "2. Doggie House",
    addressFa: "Desa Sri Hartamas, Kuala Lumpur",
    addressEn: "Desa Sri Hartamas, Kuala Lumpur",
    servicesFa: "وسایل حیوانات خانگی (pet supplies)، گرومینگ (grooming)",
    servicesEn: "pet supplies, grooming",
    whyFa: "پت‌شاپ محلی با فروش بالا؛ گزینه عالی برای گذاشتن کارت ویزیت و بنر کوچک معرفی هتل.",
    whyEn: "Local supplies shop; great location to drop off pamphlets and business cards.",
    color: C.gold
  },
  {
    nameFa: "۳. پت‌شاپ Pet Lovers Centre",
    nameEn: "3. Pet Lovers Centre",
    addressFa: "1 Mont Kiara Mall, No 1, Jln Kiara 1",
    addressEn: "1 Mont Kiara Mall, No 1, Jln Kiara 1",
    servicesFa: "بزرگ‌ترین زنجیره پت‌شاپ در مالزی، فروش انواع برندهای معتبر غذا و لوازم سگ",
    servicesEn: "Large pet shop chain, extensive supply of food, accessories, and health products",
    whyFa: "بزرگ‌ترین زنجیره فروشگاهی پت در مالزی است. برای قرار دادن بروشورها در بردهای اعلانات مناسب است.",
    whyEn: "Huge chain. Suitable for placing community brochures or advertising on public message boards.",
    color: C.blue
  }
];

const OUTREACH_SCRIPT = {
  fa: `«سلام، من از پت هتل Paw Boutique در دسا سری هارتاماس تماس می‌گیرم. ما علاقه‌مندیم همکاری ساده‌ای در زمینه معرفی مشتری دوطرفه داشته باشیم — به این صورت که ما کلینیک/کافه شما را به مشتریانمان پیشنهاد می‌کنیم و شما هم در صورت نیاز، صاحبان پت را برای خدمات پانسیون و گرومینگ به ما معرفی کنید. این همکاری هیچ هزینه‌ای ندارد و صرفاً منفعت متقابل است. خوشحال می‌شیم اگر تمایل داشته باشید گفتگوی کوتاهی در این زمینه داشته باشیم.»`,
  en: `“Hi, I'm from Paw Boutique Pet Hotel in Desa Sri Hartamas. We'd love to explore a simple cross-referral partnership — we recommend your clinic/cafe to our clients, and you can refer pet owners to us for boarding and grooming. No cost, just mutual benefit. Would you be open to a quick chat?”`
};

const PARTNERS_PRIORITY = [
  { rank: 1, nameFa: "کلینیک Pet Haven Vet", nameEn: "Pet Haven Vet Clinic", locFa: "سری هارتاماس", locEn: "Desa Sri Hartamas", whyFa: "همین خیابون هتله — بهترین دسترسی", whyEn: "Same street as hotel — closest proximity" },
  { rank: 2, nameFa: "کافه CuBs & CuPs", nameEn: "CuBs & CuPs Cafe", locFa: "سری هارتاماس", locEn: "Desa Sri Hartamas", whyFa: "دقیقاً پر از مخاطب سگ‌دار هدف", whyEn: "Full of target dog-owner clientele" },
  { rank: 3, nameFa: "دامپزشکی VPAC Mont Kiara", nameEn: "VPAC Vet Clinic", locFa: "مونت کیارا", locEn: "Mont Kiara", whyFa: "معروف‌ترین کلینیک با مشتریان وفادار", whyEn: "Most famous clinic with high-loyalty base" },
  { rank: 4, nameFa: "کافه Kopenhagen Coffee", nameEn: "Kopenhagen Coffee", locFa: "مونت کیارا", locEn: "Mont Kiara", whyFa: "مشتریان expat و صاحبان سگ با درآمد بالا", whyEn: "Expat & high-spending dog owners" },
  { rank: 5, nameFa: "کافه Bark-A-Bout", nameEn: "Bark-A-Bout Cafe", locFa: "سری هارتاماس", locEn: "Desa Sri Hartamas", whyFa: "دارای استخر و جامعه فعال سگ‌ها", whyEn: "Has dog pool and active owner community" }
];

const ADVANCED_IDEAS = [
  {
    catFa: "🚀 خدمات لوکس و راحتی", catEn: "Luxury & Convenience Services", color: C.purple,
    items: [
      {
        icon: "🚐",
        titleFa: "گرومینگ و اسپا سیار در محل (Mobile Grooming Van)",
        titleEn: "Mobile Grooming & Spa Van",
        descFa: "یک ون مجهز به وان شستشو، سشوار صنعتی و میز گرومینگ که مستقیماً می‌رود جلوی کندوهای مسکونی دسا سری هارتاماس یا مونت کیارا. وقتی ماشین با لوگوی شیک جلوی لابی پارک می‌کند، تمام صاحبان سگ در حال پیاده‌روی شما را می‌بینند — تبلیغ محیطی رایگان در قلب جامعه هدف.",
        descEn: "A fully equipped van with wash tub, industrial dryer, and grooming table going directly to residential condo lobbies in Desa Sri Hartamas or Mont Kiara. When the branded van parks in front of a lobby, every dog owner in the building sees you — free ambient advertising inside your target community.",
        bombFa: "صاحب پت نیازی ندارد سگ خیس یا کثیف را سوار ماشین خودش کند و دو بار مسیر رفت‌وبرگشت را در ترافیک KL طی کند.",
        bombEn: "Pet owner doesn't need to put a wet or dirty dog in their own car and fight KL traffic twice for a round trip.",
        tag: "High Impact"
      },
      {
        icon: "🚕",
        titleFa: "تاکسی اشتراکی آخر هفته به پارک (Weekend Park Shuttle)",
        titleEn: "Weekend Park Shuttle",
        descFa: "صاحبان سگ در KL عاشق بردن پت به پارک‌هایی مثل Desa ParkCity هستند، اما ترافیک و پارکینگ کلافه‌کننده است. یک سرویس شاتل آخر هفته راه‌اندازی کنید — سگ‌ها و صاحبانشان را از یک نقطه در هارتاماس سوار کنید، به پارک ببرید و برگردانید.",
        descEn: "KL dog owners love taking pets to parks like Desa ParkCity, but traffic and parking are nightmares. Launch a weekend shuttle — pick up dogs and owners from a fixed Hartamas point, drive to the park and back.",
        bombFa: "شما تبدیل به لیدر «جامعه صاحبان سگ» در منطقه می‌شوید و مستقیماً برای هتل و گرومینگ هم به سراغتان می‌آیند.",
        bombEn: "You become the community leader for local dog owners, who naturally convert to hotel and grooming clients.",
        tag: "Community Hub"
      },
      {
        icon: "📦",
        titleFa: "پکیج اکسپت‌ها: سفر بدون استرس (Expat's Peace of Mind)",
        titleEn: "Expat's Peace of Mind Package",
        descFa: "جامعه خارجی‌های مقیم مالزی (Mont Kiara / Hartamas) مدام سفر می‌روند و هیچ فامیلی ندارند که پت بگذارند. تضمین آپدیت روزانه به انگلیسی روان، سرویس رفت‌وبرگشت رایگان فرودگاهی برای اقامت‌های بالای ۵ شب، و دسترسی ۲۴ ساعته به دامپزشک آنکال.",
        descEn: "Expats in Mont Kiara / Hartamas travel constantly with no family to leave pets with. Includes daily fluent English updates (photo + video), free airport pet taxi for stays over 5 nights, and 24-hour on-call vet access.",
        bombFa: "این پکیج را در گروه‌های فیسبوک 'Expats in KL' و 'Mont Kiara Community' معرفی کنید — بازار پولسازی که رقبا کاملاً نادیده گرفته‌اند.",
        bombEn: "Promote in 'Expats in KL' and 'Mont Kiara Community' Facebook groups — a lucrative market your competitors are completely ignoring.",
        tag: "Premium Revenue"
      },
      {
        icon: "🧼",
        titleFa: "اشتراک ماهانه گرومینگ (Monthly Grooming Subscription)",
        titleEn: "Monthly Grooming Subscription",
        descFa: "به جای رزرو موردی، یک اشتراک ماهانه ثابت تعریف کنید: ۲ بار حمام و برس + ۱ بار گرومینگ کامل + کوتاهی ناخن رایگان. مزیت برای مشتری: ۱۵٪ الی ۲۰٪ ارزان‌تر + اولویت رزرو آخر هفته.",
        descEn: "Instead of ad-hoc bookings, sell a fixed monthly subscription: 2 baths + 1 full groom + free nail trim. Client benefit: 15-20% cheaper than per-session + priority weekend slots.",
        bombFa: "درآمد ماهیانه پایدار و قابل پیش‌بینی — می‌دانید هر ماه چقدر درآمد دارید، صرف نظر از اینکه مشتری تماس می‌گیرد یا نه.",
        bombEn: "Stable, predictable monthly recurring revenue — you know exactly how much income you have each month.",
        tag: "Recurring Revenue"
      },
      {
        icon: "🎂",
        titleFa: "پکیج VIP تولد سگ (The Paw-ty Birthday Package)",
        titleEn: "Paw-ty Birthday VIP Package",
        descFa: "اگر اقامت سگ با روز تولدش همزمان شد: کلاه تولد، کاپکیک Dog-friendly، دکور مینیاتوری عکاسی، و یک ویدیوی ادیت‌شده ۱۵ ثانیه‌ای از لحظه خوردن کیک برای صاحب پت.",
        descEn: "If the dog's stay coincides with their birthday: birthday hat, dog-friendly cupcake, mini photo backdrop, and a 15-second edited video of the cake moment sent to the owner.",
        bombFa: "صاحب پت قطعاً این ویدیو را در اینستاگرام استوری می‌کند و تمام دوستان سگ‌دارش با پیج شما آشنا می‌شوند.",
        bombEn: "Pet owners WILL story this video and every dog-owning friend of theirs will discover your page — guaranteed organic reach.",
        tag: "Viral + Upsell"
      },
    ]
  },
  {
    catFa: "🥷 مارکتینگ چریکی و محلی", catEn: "Guerrilla & Local Marketing", color: C.rose,
    items: [
      {
        icon: "🏷️",
        titleFa: "کمپین دستمال گردن برند (The Grooming Bandana)",
        titleEn: "The Branded Grooming Bandana",
        descFa: "بعد از هر بار گرومینگ، یک دستمال گردن (Bandana) کوچک، ارزان ولی شیک و مینیمالیستی با رنگ برند به گردن سگ ببندید. روی آن نوشته شود: «من در Paw Boutique خوشتیپ شدم! 🐾»",
        descEn: "After every grooming, tie a small, cheap but chic minimalist bandana in brand colors around the dog's neck. Text: 'I got styled at Paw Boutique! 🐾'",
        bombFa: "سگ‌ها بعد از گرومینگ به پیاده‌روی می‌روند. صاحبان دیگر سگ‌ها در خیابان یا پارک فوری متوجه این دستمال شیک می‌شوند — بهترین بازاریابی دهان‌به‌دهان در دنیای واقعی.",
        bombEn: "Dogs go for walks after grooming. Other dog owners on the street or park instantly notice the chic bandana — the best real-world word-of-mouth marketing you can buy for pennies.",
        tag: "Free Marketing"
      },
      {
        icon: "🦴",
        titleFa: "بار تشویقی رایگان برای سگ‌های پیاده‌رو (Sidewalk Treat Bar)",
        titleEn: "The Sidewalk Treat Bar",
        descFa: "یک ظرف آب تمیز و یک شیشه شیک پر از تشویقی رایگان بیرون بگذارید با تابلوی مینیمال بامزه: «سگ خسته؟ اینجا یه تشویقی رایگان بزن! 🦴»",
        descEn: "Place a clean water bowl and a stylish jar of free treats outside with a minimal cute sign: 'Tired pup? Free treat right here! 🦴'",
        bombFa: "سگ‌ها حافظه مکانی فوق‌العاده‌ای دارند. دفعه بعد خودِ سگ بند قلاده را می‌کشد تا بیاید جلوی مغازه شما! این کار روی صاحب پت تأثیر عاطفی شدیدی می‌گذارد.",
        bombEn: "Dogs have extraordinary location memory. Next time, the dog itself pulls the leash to come to your storefront! Creates a powerful emotional connection with the owner.",
        tag: "Emotional Hook"
      },
      {
        icon: "📱",
        titleFa: "ربودن مخاطب اینستاگرام (Audience Hijacking)",
        titleEn: "Local Audience Hijacking",
        descFa: "پیج کافه‌های pet-friendly (مثل CuBs & CuPs) یا تگ لوکیشن پارک‌های سگ (مثل Desa ParkCity) را باز کنید. کسانی که زیر پست‌هاشون کامنت گذاشتند مشتری هدف ۱۰۰٪ شما هستند. کامنت‌های صمیمی و واقعی (نه رباتی) زیر پست‌های پت آن‌ها بگذارید.",
        descEn: "Open pet-friendly cafe pages (like CuBs & CuPs) or dog park location tags (like Desa ParkCity). Those who commented are 100% your target clients. Leave genuine warm comments (NOT robotic ad comments) under their pet posts.",
        bombFa: "این کار دایره مخاطبان محلی را بدون هزینه به شدت سریع بالا می‌برد — به جای منتظر ماندن برای الگوریتم، مستقیم سراغ مشتری‌های آماده بروید.",
        bombEn: "This rapidly grows your local audience for free — instead of waiting for the algorithm, go directly to ready-to-buy customers.",
        tag: "Zero Cost"
      },
      {
        icon: "🚗",
        titleFa: "بیلبورد متحرک روی ماشین سرویس (Branded Pet Taxi Wrap)",
        titleEn: "The Branded Pet Taxi Billboard",
        descFa: "روی ماشین سرویس رفت‌وبرگشت، یک Vinyl Wrap باکیفیت، فانتزی و مینیمالیستی بچسبانید. شعار: «سگ شما در راه رفتن به تعطیلات لوکس! 🐾 Paw Boutique» به همراه QR Code بزرگ و آدرس اینستاگرام.",
        descEn: "Apply a high-quality minimalist vinyl wrap to the pet taxi car. Slogan: 'Your dog is heading to a luxury staycation! 🐾 Paw Boutique' + large QR code and Instagram handle.",
        bombFa: "بازاریابی محیطی رایگان در سراسر خیابان‌های KL و Selangor — چشم‌ها در ترافیک‌های سنگین KL به شما می‌افتند.",
        bombEn: "Free ambient marketing across KL and Selangor streets — eyes in heavy KL traffic fall directly on your brand every single trip.",
        tag: "Ambient Ads"
      },
      {
        icon: "📲",
        titleFa: "استند QR ریویو روی کانتر (Instant Review Station)",
        titleEn: "Counter QR Review Station",
        descFa: "یک استند کوچک روی کانتر پذیرش بگذارید: «گرفتن ناخن رایگان یا یک تشویقی پریمیوم، در ازای ثبت نظر روی گوگل مپ در همین لحظه!» لینک مستقیم بخش ریویو را به صورت QR دربیاورید تا با یک اسکن، صفحه کامنت باز شود.",
        descEn: "Place a small stand on the reception counter: 'Free nail trim or premium treat for leaving a Google review right now!' Turn the direct review link into a QR code so one scan opens the comment page.",
        bombFa: "صاحبان پت تنبل‌تر از آن هستند که سرچ کنند — این کار نرخ گرفتن ریویو را ۵ برابر افزایش می‌دهد.",
        bombEn: "Pet owners are too lazy to search manually — this multiplies your review acquisition rate by 5x.",
        tag: "GMaps Boost"
      },
    ]
  },
  {
    catFa: "🔥 محتوای ویروسی اینستاگرام و تیکتاک", catEn: "Viral Instagram & TikTok Content", color: C.gold,
    items: [
      {
        icon: "🤫",
        titleFa: "ریلز «نقد سگ‌ها از خدمات» (The Dog's Review)",
        titleEn: "The Dog's Professional Review Reel",
        descFa: "به جای اینکه شما از خودتان تعریف کنید، بگذارید سگ‌ها با صداگذاری Voice-over طنز و جدی شما را نقد کنند. مثال: سگی که ماساژ اسپا می‌گیرد، گوینده جدی می‌گوید: «خدمات عالی بود، اما فقط دو تا تشویقی مرغ گرفتم که برای یک سگ لایقِ من، کم بود. ۴ از ۵ ستاره می‌دم!»",
        descEn: "Instead of self-promotion, let dogs critique you with funny formal Voice-over narration. Example: dog getting spa massage, serious narrator: 'Service was excellent, however I received only two chicken treats which for a dog of my caliber, was insufficient. 4 out of 5 stars.'",
        bombFa: "لحن رسمی روی قیافه بامزه سگ‌ها تضاد خنده‌داری ایجاد می‌کند — این مدل ویدیوها به شدت دست‌به‌دست (Share) می‌شوند.",
        bombEn: "Formal narration over funny dog faces creates hilarious contrast — these videos go massively viral through shares.",
        tag: "Viral"
      },
      {
        icon: "📸",
        titleFa: "استند عکاسی «پاپاراتزی» (Pawparazzi Backdrop)",
        titleEn: "Pawparazzi Photo Backdrop",
        descFa: "یک دیوار کوچک با دکور مینیمال، شیک و نورپردازی عالی (مثل استودیوهای عکاسی مدلینگ) آماده کنید. وقتی صاحب سگ می‌آید تحویل بگیرد، سگ را آنجا بگذارید و یک عکس فوق‌العاده باکیفیت و Insta-worthy بگیرید و فوری بفرستید.",
        descEn: "Set up a small wall with minimal decor, chic styling, and excellent lighting (like a modeling photography studio). When owners come for pickup, place the dog there and snap a stunning Insta-worthy photo to send immediately.",
        bombFa: "صاحبان پت نمی‌توانند جلوی خودشان را بگیرند و این عکس‌های آتلیه‌ای را حتماً در استوری با تگ کردن پیج شما منتشر می‌کنند.",
        bombEn: "Pet owners simply cannot resist posting these studio-quality photos in stories, always tagging your page — guaranteed free advertising every single pickup.",
        tag: "Free Ads"
      },
      {
        icon: "🎙️",
        titleFa: "سری «اعترافات سگ‌ها» (Dog Confessions Series)",
        titleEn: "Dog Confessions Video Series",
        descFa: "یک سری ریلز بسازید: سگی که به دوربین زل زده، صدا می‌گوید: «امروز مامانم فکر کرد دلم براش تنگ شده، ولی راستش داشتم به تشویقی‌های گوشت اردک هتل فکر می‌کردم...🤫» سری «Dog Personality»: معرفی سگ‌های هتل با کاراکترهای خنده‌دار — تدی (لیدر گروه)، لوسی (دراماتیک)، بارنی (همیشه خواب).",
        descEn: "Reel series: dog staring at camera, voice: 'Mom thought I missed her today, but honestly I was thinking about the hotel's duck treat snacks...🤫' Dog Personality series: introduce hotel dogs with funny profiles — Teddy (the leader), Lucy (the dramatic one), Barney (always sleeping).",
        bombFa: "صاحبان سگ عاشق تگ کردن دوستانشان زیر این ویدیوها هستند — هر ویدیو ده‌ها تگ دست‌ساز رایگان می‌آورد.",
        bombEn: "Dog owners love tagging their friends in these — each video organically brings dozens of free manual tags and new followers.",
        tag: "Series Content"
      },
      {
        icon: "🏷️",
        titleFa: "تگ کردن مشتریان در استوری روزانه (Daily Story Tagging)",
        titleEn: "Daily Story Client Tagging",
        descFa: "وقتی استوری روزانه از بازی سگ‌ها می‌گذارید، حتماً آیدی اینستاگرام صاحب سگ را (حتی پنهان یا کوچک) در استوری قرار دهید. صاحبان پت به محض دیدن استوری از سگشان آن را ریپوست (Repost) می‌کنند.",
        descEn: "When posting daily dog play Stories, always tag the dog owner's Instagram handle (even small or hidden). Pet owners immediately repost Stories featuring their own dog.",
        bombFa: "تمام فالوورهای صاحب سگ — که بیشترشان سگ‌دار هم هستند — پیج شما را می‌بینند. Reach ارگانیک رایگان هر روز.",
        bombEn: "All of the owner's followers — most of whom also own dogs — see your page. Free organic reach growth every single day.",
        tag: "Organic Reach"
      },
      {
        icon: "💬",
        titleFa: "گزارش روزانه با Speech Bubble بامزه (Funny Daily Report)",
        titleEn: "Funny Speech Bubble Daily Report",
        descFa: "عکس روزانه‌ای که می‌فرستید را با یک فرمت ثابت و بامزه بفرستید: عکس سگ با یک بالن متن (Speech Bubble) از زبان خودش خطاب به صاحبش: «مامان/بابا، امروز با لوسی بازی کردم و تشویقی مرغ خوردم، اصلاً نگران من نباش!»",
        descEn: "Send daily photos in a consistent funny format: dog photo with a Speech Bubble from their own perspective to the owner: 'Mom/Dad, I played with Lucy today and had chicken treats, don't worry about me at all!'",
        bombFa: "صاحب سگ این عکس ادیت‌شده و بامزه را ۱۰۰٪ در استوری اینستاگرامش ریپوست می‌کند — تبلیغ رایگان و ارگانیک برای Paw Boutique.",
        bombEn: "The owner will 100% repost this funny edited photo in their Instagram story — free, authentic organic advertising for Paw Boutique.",
        tag: "Viral Format"
      },
    ]
  },
  {
    catFa: "💎 وفاداری، اعتماد و سیستم‌سازی", catEn: "Loyalty, Trust & Systems", color: C.green,
    items: [
      {
        icon: "🎫",
        titleFa: "کلوپ سگ‌های VIP — کارت طلایی (Golden Paw Club)",
        titleEn: "Golden Paw Club — VIP Card",
        descFa: "یک کارت فیزیکی مشکی/طلایی شیک (مثل کارت‌های اعتباری لوکس) به مشتریان وفادار بدهید. روی کارت: «عضو رسمی کلوپ سگ‌های خوش‌شانس». آفر: هر ۵ بار گرومینگ = ۱ حمام رایگان + اولویت رزرو در چینیز نیوییر و کریسمس.",
        descEn: "Give loyal customers a sleek physical black/gold card (like a luxury credit card). Text: 'Official Member of the Lucky Dogs Club'. Offer: Every 5 groomings = 1 free bath + priority booking for Chinese New Year & Christmas when everywhere is full.",
        bombFa: "مشتری این کارت را در کیف پولش نگه می‌دارد و هر بار که آن را می‌بیند، یاد بیزنس شما می‌افتد — retention عالی.",
        bombEn: "Clients keep this card in their wallet and think of your business every time they see it — excellent retention and top-of-mind awareness.",
        tag: "Retention"
      },
      {
        icon: "🤝",
        titleFa: "کارت تخفیف دوطرفه معرفی دوست (Dual Referral Card)",
        titleEn: "The Dual Referral Card",
        descFa: "یک کارت تخفیف دوطرفه طراحی کنید. به مشتری فعلی بگویید: «این کارت رو بده به یکی از دوستات که سگ داره. هم اون برای اولین گرومینگش ۲۰٪ تخفیف می‌گیره، هم به محض اینکه اون بیاد، گرومینگ بعدی سگ خودت نیمه‌بها حساب می‌شه.»",
        descEn: "Design a dual-sided discount card. Tell current client: 'Give this to a dog-owning friend. They get 20% off their first grooming, and the moment they visit, your next grooming is half price.'",
        bombFa: "قوی‌ترین سیستم جذب مشتری در دنیای پت — صاحبان سگ در پارک‌ها جامعه دارند و به توصیه هم اعتماد می‌کنند.",
        bombEn: "The strongest client acquisition system in the pet world — dog owners form communities in parks and trust each other's recommendations more than any ad.",
        tag: "Acquisition"
      },
      {
        icon: "🩺",
        titleFa: "نشان تأییدیه دامپزشک همکار (Vet-Approved Badge)",
        titleEn: "Official Vet-Approved Safety Badge",
        descFa: "با یکی از کلینیک‌های تاپ (VPAC یا Pet Haven) هماهنگ کنید که پروتکل‌های بهداشتی هتل را یک‌بار بازبینی کنند. پس از تأیید، بنر دیجیتال در سایت و هایلایت اینستاگرام بگذارید: «پروتکل‌های بهداشتی Paw Boutique تحت نظارت و تأیید کلینیک [نام کلینیک] می‌باشد.»",
        descEn: "Coordinate with a top clinic (VPAC or Pet Haven) to review hotel hygiene protocols once. After approval, display a digital badge: 'Paw Boutique safety protocols approved and supervised by [Clinic Name].'",
        bombFa: "این کار سطح اعتبار شما را از یک پت‌شاپ معمولی به یک مرکز کاملاً تخصصی و علمی ارتقا می‌دهد — بزرگ‌ترین ترس صاحبان پت از بین می‌رود.",
        bombEn: "Elevates you from a regular pet shop to a fully certified professional center — eliminates the pet owner's biggest fear of their dog getting sick during the stay.",
        tag: "Trust Builder"
      },
      {
        icon: "📋",
        titleFa: "فرم آنبوردینگ «داستان زندگی پت من» (Pet Life Story Form)",
        titleEn: "Pet Life Story Onboarding Form",
        descFa: "یک گوگل‌فرم شیک بسازید که صاحب پت قبل از پذیرش پر کند. سوالات نه فقط پزشکی، بلکه رفتار روحی سگ: «سگ شما از چه صدایی می‌ترسد؟»، «کدام قسمت بدنش را دوست دارد ماساژ دهید؟»، «وقتی لجبازی می‌کند چه چیزی آرامش می‌کند؟»",
        descEn: "Build a sleek Google Form owners complete before check-in. Questions go beyond medical — they explore emotional behavior: 'What sounds is your dog afraid of?', 'Which body part do they love being massaged?', 'What calms them down when stubborn?'",
        bombFa: "صاحب پت با دیدن این سوالات می‌فهمد که شما قرار است مانند فرزند خودش از سگش مراقبت کنید، نه فقط آب و غذا بدهید — اعتماد عمیق فوری.",
        bombEn: "Seeing these questions, the owner realizes you'll care for their dog like their own child, not just feed and water them — instant deep trust.",
        tag: "Deep Trust"
      },
      {
        icon: "🤖",
        titleFa: "سیستم CRM ساده: تبریک تولد سگ (WhatsApp Birthday CRM)",
        titleEn: "Simple WhatsApp Birthday CRM",
        descFa: "تاریخ تولد هر سگ را یادداشت کنید. یک هفته قبل از تولد پیام بفرستید: «سلام [نام صاحب]! هفته دیگه [اسم سگ] ۳ ساله می‌شه 🎉 می‌خواید یه پکیج تولد VIP رزرو کنید؟» ساده‌ترین ابزار CRM بدون هیچ هزینه‌ای.",
        descEn: "Record every dog's birthday. One week before, send: 'Hi [Owner Name]! Next week [Dog Name] turns 3! 🎉 Would you like to book our Birthday VIP Package?' The simplest CRM tool with zero cost.",
        bombFa: "این پیام نرخ تبدیل فوق‌العاده بالایی دارد — کسی نمی‌تواند برای تولد پتش نه بگوید!",
        bombEn: "This message has an incredibly high conversion rate — nobody can say no to celebrating their pet's birthday!",
        tag: "CRM"
      },
      {
        icon: "🌐",
        titleFa: "میکرو اینفلوئنسر — تبادل ارزش (Dog Influencer Value Exchange)",
        titleEn: "Dog Influencer Value Exchange",
        descFa: "پیج‌هایی در KL با ۳k-10k فالوور که فقط برای سگشان پیج زده‌اند (Dog Influencers) را پیدا کنید. ۱ یا ۲ شب اقامت کاملاً رایگان + یک جلسه گرومینگ VIP هدیه بدهید. در عوض: حداقل ۳ استوری از محیط و پرسنل، و ۱ Collaborative Post با پیج شما.",
        descEn: "Find KL pages with 3k-10k followers running exclusively for their dog (Dog Influencers). Gift 1-2 nights fully free stay + VIP grooming session. In return: minimum 3 Stories of the space and staff, plus 1 Collaborative Post with your page.",
        bombFa: "بک‌لینک و سیگنال‌های محلی اینستاگرام بدون پرداخت هزینه‌های سنگین به اینفلوئنسرهای بزرگ.",
        bombEn: "Instagram local signals and authentic backlinks without paying heavy fees to large influencers — the value exchange is perfectly balanced.",
        tag: "Collaboration"
      },
    ]
  },
];


function AdvancedIdeasSection({ lang }: { lang: "fa" | "en" }) {
  const t = useT(lang);
  const isFa = lang === "fa";
  const [activeCategory, setActiveCategory] = useState(0);

  const cat = ADVANCED_IDEAS[activeCategory];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Intro */}
      <SectionCard style={{ background: C.orangeLight, border: `1px solid ${C.orange}40` }}>
        <p style={{
          fontFamily: isFa ? F.faBody : F.enBody,
          fontSize: 14, color: C.text, margin: 0, lineHeight: 1.8,
          direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
        }}>
          💡 {t(
            "این بخش شامل ایده‌های پیشرفته‌ای است که برای رشد سریع Paw Boutique طراحی شده‌اند. هر ایده یک «مارکتینگ بمب» دارد که توضیح می‌دهد چرا کار می‌کند.",
            "This section contains advanced ideas designed for rapid Paw Boutique growth. Each idea has a 'Marketing Bomb' explaining exactly why it works."
          )}
        </p>
      </SectionCard>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ADVANCED_IDEAS.map((cat, i) => (
          <button key={i} onClick={() => setActiveCategory(i)} style={{
            background: activeCategory === i ? cat.color : "transparent",
            border: `2px solid ${cat.color}`,
            color: activeCategory === i ? "#fff" : cat.color,
            fontFamily: isFa ? F.faBody : F.enBody,
            fontWeight: 700, fontSize: 12.5, padding: "8px 16px",
            borderRadius: 20, cursor: "pointer", transition: "all 0.2s",
            whiteSpace: "nowrap"
          }}>
            {isFa ? cat.catFa : cat.catEn}
          </button>
        ))}
      </div>

      {/* Ideas grid */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {cat.items.map((item: any, i: number) => (
          <SectionCard key={i} style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
            {/* Top color accent */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: cat.color }} />

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 4 }}>
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <span style={{
                fontFamily: F.enBody, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", color: cat.color, background: cat.color + "18",
                border: `1px solid ${cat.color}40`, borderRadius: 4, padding: "2px 8px", whiteSpace: "nowrap"
              }}>{item.tag}</span>
            </div>

            {/* Title */}
            <div style={{
              fontFamily: isFa ? F.faBody : F.enDisplay,
              fontSize: 15, fontWeight: 700, color: C.text,
              direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left",
              fontStyle: isFa ? "normal" : "italic"
            }}>
              {t(item.titleFa, item.titleEn)}
            </div>

            {/* Description */}
            <div style={{
              fontFamily: isFa ? F.faBody : F.enBody,
              fontSize: 13, color: C.textSoft, lineHeight: 1.85,
              direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
            }}>
              {t(item.descFa, item.descEn)}
            </div>

            {/* Marketing Bomb */}
            <div style={{
              marginTop: 4, padding: "10px 14px",
              background: cat.color + "10", border: `1px solid ${cat.color}30`,
              borderRadius: 8, direction: isFa ? "rtl" : "ltr"
            }}>
              <span style={{
                fontFamily: isFa ? F.faBody : F.enBody,
                fontSize: 12.5, color: cat.color, fontWeight: 700
              }}>
                💥 {t("مارکتینگ بمب: ", "Marketing Bomb: ")}
              </span>
              <span style={{
                fontFamily: isFa ? F.faBody : F.enBody,
                fontSize: 12.5, color: C.textMid, lineHeight: 1.7
              }}>
                {t(item.bombFa, item.bombEn)}
              </span>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

function PartnersSection({ lang }: { lang: "fa" | "en" }) {
  const t = useT(lang);
  const isFa = lang === "fa";
  const [subTab, setSubTab] = useState<"clinics" | "cafes" | "shops" | "outreach">("clinics");
  const [copied, setCopied] = useState(false);

  const handleCopyScript = () => {
    const scriptText = isFa ? OUTREACH_SCRIPT.fa : OUTREACH_SCRIPT.en;
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sub-navigation */}
      <div style={{
        display: "flex", gap: 8, flexWrap: "wrap",
        justifyContent: isFa ? "flex-end" : "flex-start",
        borderBottom: `1px solid ${C.borderSoft}`, paddingBottom: 12
      }}>
        {[
          { id: "clinics", fa: "🏥 کلینیک‌های دامپزشکی", en: "🏥 Vet Clinics" },
          { id: "cafes", fa: "☕ کافه‌های پت‌فرندلی", en: "☕ Pet Cafes" },
          { id: "shops", fa: "🛒 پت‌شاپ‌ها", en: "🛒 Pet Shops" },
          { id: "outreach", fa: "📞 پیام و اولویت تماس", en: "📞 Outreach & Priority" }
        ].map((st: any) => (
          <button key={st.id} onClick={() => setSubTab(st.id as any)} style={{
            background: subTab === st.id ? C.green : C.surfaceAlt,
            border: `1px solid ${subTab === st.id ? C.green : C.border}`,
            color: subTab === st.id ? "#fff" : C.textMid,
            fontFamily: isFa ? F.faBody : F.enBody,
            fontWeight: subTab === st.id ? 700 : 400, fontSize: 13,
            borderRadius: 8, padding: "8px 16px", cursor: "pointer",
            transition: "all 0.15s",
          }}>
            {t(st.fa, st.en)}
          </button>
        ))}
      </div>

      {/* Render Clinics */}
      {subTab === "clinics" && (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {PARTNERS_CLINICS.map((c: any, i: number) => {
            const phoneNode = c.phone ? (
              <p style={{ margin: 0 }}>
                📞 <strong>{t("تلفن: ", "Phone: ")}</strong>
                <a href={"tel:" + c.phone} style={{ color: C.blue, textDecoration: "none" }}>{c.phone}</a>
              </p>
            ) : null;
            
            const emailNode = c.email ? (
              <p style={{ margin: 0 }}>
                ✉️ <strong>{t("ایمیل: ", "Email: ")}</strong>
                <a href={"mailto:" + c.email} style={{ color: C.blue, textDecoration: "none" }}>{c.email}</a>
              </p>
            ) : null;

            const hoursNode = c.hoursFa ? (
              <p style={{ margin: 0 }}>
                🕒 <strong>{t("ساعت کاری: ", "Hours: ")}</strong>
                {t(c.hoursFa, c.hoursEn || "")}
              </p>
            ) : null;

            return (
              <SectionCard key={i} style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                    <h3 style={{
                      fontFamily: isFa ? F.faDisplay : F.enDisplay,
                      fontSize: 18, fontWeight: 700, margin: 0, color: C.text,
                      direction: isFa ? "rtl" : "ltr"
                    }}>
                      {isFa ? c.nameFa : c.nameEn}
                    </h3>
                    {c.highlightFa && (
                      <span style={{
                        fontFamily: isFa ? F.faBody : F.enBody, fontSize: 10, fontWeight: 700,
                        color: c.color, background: c.color + "15", border: `1px solid ${c.color}35`,
                        borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap"
                      }}>
                        {t(c.highlightFa, c.highlightEn)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: C.textSoft, direction: isFa ? "rtl" : "ltr" }}>
                    <p style={{ margin: 0 }}>📍 <strong>{t("آدرس: ", "Address: ")}</strong>{t(c.addressFa, c.addressEn)}</p>
                    {phoneNode}
                    {emailNode}
                    {hoursNode}
                    <p style={{ margin: 0 }}>🩺 <strong>{t("خدمات: ", "Services: ")}</strong>{t(c.servicesFa, c.servicesEn)}</p>
                  </div>
                </div>
                <div style={{
                  marginTop: 16, paddingTop: 12, borderTop: `1px dashed ${C.borderSoft}`,
                  fontStyle: isFa ? "normal" : "italic", fontSize: 13, color: C.textMid,
                  direction: isFa ? "rtl" : "ltr"
                }}>
                  💡 <strong>{t("چرا مهمه: ", "Why it's important: ")}</strong>{t(c.whyFa, c.whyEn)}
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}

      {/* Render Cafes */}
      {subTab === "cafes" && (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {PARTNERS_CAFES.map((c: any, i: number) => {
            const phoneNode = c.phone ? (
              <p style={{ margin: 0 }}>
                📞 <strong>{t("تلفن: ", "Phone: ")}</strong>
                <a href={"tel:" + c.phone} style={{ color: C.blue, textDecoration: "none" }}>{c.phone}</a>
              </p>
            ) : null;
            
            const hoursNode = c.hoursFa ? (
              <p style={{ margin: 0 }}>
                🕒 <strong>{t("ساعت کاری: ", "Hours: ")}</strong>
                {t(c.hoursFa, c.hoursEn || "")}
              </p>
            ) : null;

            return (
              <SectionCard key={i} style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                    <h3 style={{
                      fontFamily: isFa ? F.faDisplay : F.enDisplay,
                      fontSize: 18, fontWeight: 700, margin: 0, color: C.text,
                      direction: isFa ? "rtl" : "ltr"
                    }}>
                      {isFa ? c.nameFa : c.nameEn}
                    </h3>
                    {c.highlightFa && (
                      <span style={{
                        fontFamily: isFa ? F.faBody : F.enBody, fontSize: 10, fontWeight: 700,
                        color: c.color, background: c.color + "15", border: `1px solid ${c.color}35`,
                        borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap"
                      }}>
                        {t(c.highlightFa, c.highlightEn)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: C.textSoft, direction: isFa ? "rtl" : "ltr" }}>
                    <p style={{ margin: 0 }}>📍 <strong>{t("آدرس: ", "Address: ")}</strong>{t(c.addressFa, c.addressEn)}</p>
                    {phoneNode}
                    {hoursNode}
                    <p style={{ margin: 0 }}>🍔 <strong>{t("خدمات: ", "Services: ")}</strong>{t(c.servicesFa, c.servicesEn)}</p>
                  </div>
                </div>
                <div style={{
                  marginTop: 16, paddingTop: 12, borderTop: `1px dashed ${C.borderSoft}`,
                  fontStyle: isFa ? "normal" : "italic", fontSize: 13, color: C.textMid,
                  direction: isFa ? "rtl" : "ltr"
                }}>
                  💡 <strong>{t("چرا مهمه: ", "Why it's important: ")}</strong>{t(c.whyFa, c.whyEn)}
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}

      {/* Render Pet Shops */}
      {subTab === "shops" && (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {PARTNERS_SHOPS.map((c: any, i: number) => {
            const phoneNode = c.phone ? (
              <p style={{ margin: 0 }}>
                📞 <strong>{t("تلفن: ", "Phone: ")}</strong>
                <a href={"tel:" + c.phone} style={{ color: C.blue, textDecoration: "none" }}>{c.phone}</a>
              </p>
            ) : null;

            return (
              <SectionCard key={i} style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                    <h3 style={{
                      fontFamily: isFa ? F.faDisplay : F.enDisplay,
                      fontSize: 18, fontWeight: 700, margin: 0, color: C.text,
                      direction: isFa ? "rtl" : "ltr"
                    }}>
                      {isFa ? c.nameFa : c.nameEn}
                    </h3>
                    {c.highlightFa && (
                      <span style={{
                        fontFamily: isFa ? F.faBody : F.enBody, fontSize: 10, fontWeight: 700,
                        color: c.color, background: c.color + "15", border: `1px solid ${c.color}35`,
                        borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap"
                      }}>
                        {t(c.highlightFa, c.highlightEn)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: C.textSoft, direction: isFa ? "rtl" : "ltr" }}>
                    <p style={{ margin: 0 }}>📍 <strong>{t("آدرس: ", "Address: ")}</strong>{t(c.addressFa, c.addressEn)}</p>
                    {phoneNode}
                    <p style={{ margin: 0 }}>🛍️ <strong>{t("خدمات: ", "Services: ")}</strong>{t(c.servicesFa, c.servicesEn)}</p>
                  </div>
                </div>
                <div style={{
                  marginTop: 16, paddingTop: 12, borderTop: `1px dashed ${C.borderSoft}`,
                  fontStyle: isFa ? "normal" : "italic", fontSize: 13, color: C.textMid,
                  direction: isFa ? "rtl" : "ltr"
                }}>
                  💡 <strong>{t("چرا مهمه: ", "Why it's important: ")}</strong>{t(c.whyFa, c.whyEn)}
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}

      {/* Render Outreach & Priority */}
      {subTab === "outreach" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Script Box */}
          <SectionCard style={{ background: C.surfaceAlt, border: `1px solid ${C.greenMid}40` }}>
            <h3 style={{
              fontFamily: isFa ? F.faDisplay : F.enDisplay,
              fontSize: 18, color: C.green, margin: "0 0 12px 0",
              textAlign: isFa ? "right" : "left"
            }}>
              {t("💬 پیام پیشنهادی برای تماس اول", "💬 Suggested Outreach Script")}
            </h3>
            <p style={{
              fontFamily: isFa ? F.faBody : F.enBody,
              fontSize: 14.5, color: C.text, lineHeight: 1.8, margin: "0 0 16px 0",
              direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left",
              whiteSpace: "pre-line"
            }}>
              {t(OUTREACH_SCRIPT.fa, OUTREACH_SCRIPT.en)}
            </p>
            <div style={{ display: "flex", justifyContent: isFa ? "flex-start" : "flex-end" }}>
              <button onClick={handleCopyScript} style={{
                background: C.green, color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 20px", fontFamily: isFa ? F.faBody : F.enBody,
                fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s"
              }}>
                {copied ? t("✅ کپی شد!", "✅ Copied!") : t("📋 کپی کردن پیام", "📋 Copy Script")}
              </button>
            </div>
          </SectionCard>

          {/* Priority Table */}
          <SectionCard>
            <h3 style={{
              fontFamily: isFa ? F.faDisplay : F.enDisplay,
              fontSize: 18, color: C.text, margin: "0 0 16px 0",
              textAlign: isFa ? "right" : "left"
            }}>
              {t("🎯 اولویت تماس با همکاران محلی", "🎯 Partner Contact Priority")}
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", borderCollapse: "collapse",
                fontFamily: isFa ? F.faBody : F.enBody, fontSize: 13.5,
                direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
              }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}`, color: C.textMid }}>
                    <th style={{ padding: "12px 8px", fontWeight: 700, width: 60, textAlign: isFa ? "right" : "left" }}>{t("اولویت", "Rank")}</th>
                    <th style={{ padding: "12px 8px", fontWeight: 700, textAlign: isFa ? "right" : "left" }}>{t("نام همکار", "Partner Name")}</th>
                    <th style={{ padding: "12px 8px", fontWeight: 700, textAlign: isFa ? "right" : "left" }}>{t("مکان", "Location")}</th>
                    <th style={{ padding: "12px 8px", fontWeight: 700, textAlign: isFa ? "right" : "left" }}>{t("دلیل اولویت", "Priority Reason")}</th>
                  </tr>
                </thead>
                <tbody>
                  {PARTNERS_PRIORITY.map((row: any, idx: number) => (
                    <tr key={idx} style={{
                      borderBottom: `1px solid ${C.borderSoft}`,
                      background: idx % 2 === 0 ? "transparent" : C.surfaceAlt + "40"
                    }}>
                      <td style={{ padding: "12px 8px", fontFamily: F.enBody, fontWeight: 700, color: C.green }}>{row.rank}</td>
                      <td style={{ padding: "12px 8px", fontWeight: 600, color: C.text }}>{t(row.nameFa, row.nameEn)}</td>
                      <td style={{ padding: "12px 8px", color: C.textSoft }}>{t(row.locFa, row.locEn)}</td>
                      <td style={{ padding: "12px 8px", color: C.textMid }}>{t(row.whyFa, row.whyEn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

/* ─── SECTIONS ─────────────────────────────────────────────── */
function ServicesSection({ lang }: { lang: "fa" | "en" }) {
  const t = useT(lang);
  const isFa = lang === "fa";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {SERVICES.map((group, gi) => (
        <div key={gi}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
            flexDirection: "row", justifyContent: "flex-start"
          }}>
            <Pip color={group.color} />
            <span style={{
              fontFamily: isFa ? F.faBody : F.enBody,
              fontWeight: 700, fontSize: 13, color: group.color, letterSpacing: isFa ? 0 : "0.08em",
              textTransform: isFa ? "none" : "uppercase"
            }}>
              {t(group.priority, group.priorityEn)}
            </span>
          </div>
          <div style={{
            display: "grid", gap: 14,
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))"
          }}>
            {group.items.map((item, ii) => (
              <SectionCard key={ii}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between", alignItems: "flex-start",
                  flexDirection: "row", marginBottom: 12
                }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <Tag text={item.tag} color={group.color} bg={group.tagBg} />
                </div>
                <div style={{
                  fontFamily: isFa ? F.faBody : F.enDisplay,
                  fontSize: 16, fontWeight: 700, color: C.text,
                  direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left",
                  fontStyle: isFa ? "normal" : "italic", marginBottom: 8
                }}>
                  {t(item.fa, item.en)}
                </div>
                <div style={{
                  fontFamily: isFa ? F.faBody : F.enBody,
                  fontSize: 13, color: C.textSoft, lineHeight: 1.8,
                  direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
                }}>
                  {t(item.descFa, item.descEn)}
                </div>
              </SectionCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MarketingSection({ lang }: { lang: "fa" | "en" }) {
  const t = useT(lang);
  const isFa = lang === "fa";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {MARKETING.map((ch, ci) => (
        <div key={ci} style={{
          border: `1px solid ${C.borderSoft}`, borderRadius: 14,
          overflow: "hidden", background: C.surface, boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
          <div style={{
            background: C.surfaceAlt, padding: "14px 18px",
            borderBottom: `1px solid ${C.borderSoft}`, display: "flex",
            alignItems: "center", gap: 12,
            flexDirection: "row"
          }}>
            <span style={{ fontSize: 22 }}>{ch.icon}</span>
            <div style={{ flex: 1, textAlign: isFa ? "right" : "left" }}>
              <div style={{
                fontFamily: isFa ? F.faBody : F.enDisplay,
                fontSize: 17, fontWeight: 700, color: C.text,
                fontStyle: isFa ? "normal" : "italic"
              }}>
                {t(ch.channel, ch.channelEn)}
              </div>
              <Tag text={t(ch.badge, ch.badgeEn)} color={ch.color} />
            </div>
          </div>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
            {ch.items.map((item, ii) => (
              <div key={ii} style={{
                display: "flex", gap: 12,
                paddingBottom: ii < ch.items.length - 1 ? 14 : 0,
                borderBottom: ii < ch.items.length - 1 ? `1px solid ${C.borderSoft}` : "none",
                flexDirection: "row"
              }}>
                <div style={{
                  width: 3, borderRadius: 2, background: ch.color + "60",
                  flexShrink: 0, alignSelf: "stretch", minHeight: 32
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: isFa ? F.faBody : F.enBody,
                    fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 5,
                    direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
                  }}>
                    {t(item.fa, item.en)}
                  </div>
                  <div style={{
                    fontFamily: isFa ? F.faBody : F.enBody,
                    fontSize: 13, color: C.textSoft, lineHeight: 1.8,
                    direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
                  }}>
                    {t(item.descFa, item.descEn)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrustSection({ lang }: { lang: "fa" | "en" }) {
  const t = useT(lang);
  const isFa = lang === "fa";
  return (
    <div style={{
      display: "grid", gap: 14,
      gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))"
    }}>
      {TRUST.map((item, i) => (
        <SectionCard key={i}>
          <span style={{ fontSize: 28, display: "block", marginBottom: 10 }}>{item.icon}</span>
          <div style={{
            fontFamily: isFa ? F.faBody : F.enDisplay,
            fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8,
            direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left",
            fontStyle: isFa ? "normal" : "italic"
          }}>
            {t(item.fa, item.en)}
          </div>
          <div style={{
            fontFamily: isFa ? F.faBody : F.enBody,
            fontSize: 13, color: C.textSoft, lineHeight: 1.8,
            direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
          }}>
            {t(item.descFa, item.descEn)}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function InstagramSection({ lang }: { lang: "fa" | "en" }) {
  const t = useT(lang);
  const isFa = lang === "fa";
  const rows = [
    {
      icon: "🔴", titleFa: "کپشن‌های AI را فوری حذف کن", titleEn: "Remove pasted AI captions immediately",
      descFa: "اگر در کپشن برچسب یا label می‌بینی، آن را پاک کن و متن را طبیعی کن.",
      descEn: "If the caption contains labels or AI tags, remove them and make the copy feel natural."
    },
    {
      icon: "🟢", titleFa: "لینک بیو را واتس‌اپ کن", titleEn: "Change bio link to WhatsApp",
      descFa: "بیو باید حرفه‌ای و مستقیم باشد: Book via WhatsApp 🐾.",
      descEn: "The bio must be professional and direct: Book via WhatsApp 🐾."
    },
    {
      icon: "📌", titleFa: "پست‌های پین‌شده را مرتب کن", titleEn: "Reorder pinned posts",
      descFa: "فایلرهای پین‌شده را بردار و یک Reel واقعی با سگ مهمان روی پیج نگه دار.",
      descEn: "Unpin flyers and keep a real dog Reel pinned instead."
    },
    {
      icon: "🎥", titleFa: "Reel های واقعی بیشتر بساز", titleEn: "Create more real Reels",
      descFa: "هر هفته حداقل یک Reel با صاحب کسب‌وکار یا سگ مهمان داشته باش.",
      descEn: "Post at least one Reel per week featuring the owner or a guest dog."
    },
    {
      icon: "⭐", titleFa: "Pricing و Reviews را برجسته کن", titleEn: "Highlight Pricing and Reviews",
      descFa: "هایلایت Pricing بساز و کاور Reviews را به استایل طلایی هماهنگ کن.",
      descEn: "Add a Pricing highlight and style Reviews with the same gold visual language."
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionCard>
        <h3 style={{
          fontFamily: isFa ? F.faDisplay : F.enDisplay,
          fontSize: 22, margin: 0, color: C.purple
        }}>
          {t("اینستاگرام", "Instagram")}
        </h3>
        <p style={{
          fontFamily: isFa ? F.faBody : F.enBody,
          fontSize: 14, color: C.textMid, margin: "12px 0 0", lineHeight: 1.7,
          direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
        }}>
          {t(
            "این بخش راهنمای فوری برای صفحه اینستاگرام Paw Boutique است. تمرکز روی Reel واقعی، بیو حرفه‌ای و پست‌های پین‌شده درست است.",
            "This section is a quick Instagram playbook for Paw Boutique. Focus on real Reels, a professional bio, and the right pinned content."
          )}
        </p>
      </SectionCard>

      <SectionCard style={{ padding: 22 }}>
        <h4 style={{
          fontFamily: isFa ? F.faDisplay : F.enDisplay,
          fontSize: 18, margin: 0, color: C.green
        }}>
          {t("جمع‌بندی سریع", "Quick Instagram Summary")}
        </h4>
        <p style={{
          fontFamily: isFa ? F.faBody : F.enBody,
          fontSize: 13, color: C.textMid, margin: "12px 0 0", lineHeight: 1.75,
          direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
        }}>
          {t(
            "خبر خوب: Reel‌های واقعی دارید. مشکل این است که flyerها جلو تجربه اصلی پیج را می‌گیرند.",
            "Good news: you already have real Reels. The issue is that flyers are hiding the page’s strongest content."
          )}
        </p>
        <ul style={{
          margin: "16px 0 0 18px", paddingLeft: 16,
          fontFamily: isFa ? F.faBody : F.enBody,
          fontSize: 13, color: C.text, lineHeight: 1.8,
          direction: isFa ? "rtl" : "ltr"
        }}>
          <li>{t("کپشن boarding را همین امشب ویرایش کن.", "Edit the boarding caption tonight.")}</li>
          <li>{t("لینک بیو را به واتس‌اپ مستقیم تغییر بده: Book via WhatsApp 🐾.", "Change the bio link to direct WhatsApp: Book via WhatsApp 🐾.")}</li>
          <li>{t("دو flyer پین‌شده را بردار و یک Reel واقعی را پین کن.", "Unpin the flyer posts and pin a real Reel.")}</li>
          <li>{t("قانون جدید: از هر ۵ پست، حداکثر ۱ flyer.", "New rule: max 1 flyer in every 5 posts.")}</li>
          <li>{t("هایلایت Pricing اضافه کن و کاور Reviews را طلایی هماهنگ کن.", "Add a Pricing highlight and style Reviews with gold cover art.")}</li>
        </ul>
      </SectionCard>

      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((row, index) => (
          <SectionCard key={index} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ fontSize: 24 }}>{row.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: isFa ? F.faDisplay : F.enDisplay,
                fontSize: 15, fontWeight: 700, margin: 0, color: C.text
              }}>
                {t(row.titleFa, row.titleEn)}
              </p>
              <p style={{
                fontFamily: isFa ? F.faBody : F.enBody,
                fontSize: 13.5, color: C.textMid, margin: "8px 0 0", lineHeight: 1.7,
                direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
              }}>
                {t(row.descFa, row.descEn)}
              </p>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

function TasksSection({ lang }: { lang: "fa" | "en" }) {
  const t = useT(lang);
  const isFa = lang === "fa";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {TASKS.map((group, gi) => (
        <div key={gi}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
            flexDirection: "row", justifyContent: "flex-start"
          }}>
            <Pip color={group.color} />
            <span style={{
              fontFamily: isFa ? F.faBody : F.enBody,
              fontWeight: 700, fontSize: 13, color: group.color,
              letterSpacing: isFa ? 0 : "0.08em",
              textTransform: isFa ? "none" : "uppercase"
            }}>
              {t(group.phase, group.phaseEn)}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {group.items.map((task, ti) => (
              <SectionCard key={ti} style={{
                display: "flex", gap: 14, alignItems: "flex-start",
                flexDirection: "row"
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{task.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "flex",
                    justifyContent: isFa ? "flex-start" : "space-between",
                    alignItems: "flex-start", marginBottom: 6,
                    flexDirection: "row", gap: 8
                  }}>
                    <div style={{
                      fontFamily: isFa ? F.faBody : F.enBody,
                      fontWeight: 700, fontSize: 14, color: C.text,
                      direction: isFa ? "rtl" : "ltr"
                    }}>
                      {t(task.fa, task.en)}
                    </div>
                    <span style={{
                      fontFamily: F.enBody, fontSize: 10, color: group.color,
                      background: group.color + "15", border: `1px solid ${group.color}30`,
                      borderRadius: 5, padding: "2px 9px", whiteSpace: "nowrap", flexShrink: 0
                    }}>
                      {isFa ? task.effort : task.effortEn}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: isFa ? F.faBody : F.enBody,
                    fontSize: 13, color: C.textSoft, lineHeight: 1.8,
                    direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
                  }}>
                    {t(task.descFa, task.descEn)}
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrioritySection({ lang }: { lang: "fa" | "en" }) {
  const t = useT(lang);
  const isFa = lang === "fa";
  return (
    <div>
      <p style={{
        fontFamily: isFa ? F.faBody : F.enBody,
        fontSize: 13, color: C.textMuted, marginBottom: 18, lineHeight: 1.7,
        direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
      }}>
        {t(
          "از ردیف اول شروع کن — ارزون‌ترین و پرتاثیرترین اول.",
          "Start from #1 — ordered by lowest cost and highest impact."
        )}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PRIORITY.map((item) => (
          <div key={item.rank} style={{
            background: C.surface, border: `1px solid ${C.borderSoft}`, borderRadius: 10,
            padding: "13px 16px", display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            flexDirection: "row"
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: item.rank <= 2 ? C.greenLight : item.rank <= 5 ? C.goldLight : C.surfaceAlt,
              border: `2px solid ${item.rank <= 2 ? C.green : item.rank <= 5 ? C.gold : C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F.enBody, fontWeight: 800, fontSize: 13,
              color: item.rank <= 2 ? C.green : item.rank <= 5 ? C.gold : C.textMuted,
            }}>{item.rank}</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: isFa ? F.faBody : F.enBody,
                fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 5,
                direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
              }}>
                {t(item.fa, item.en)}
              </div>
              <div style={{
                display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
                flexDirection: "row"
              }}>
                <ImpactDots n={item.impact} color={item.rank <= 2 ? C.green : C.gold} />
                <span style={{
                  fontFamily: F.enBody, fontSize: 11,
                  color: (isFa ? item.cost : item.costEn).includes("Free") || item.cost === "رایگان" ? C.green : C.gold
                }}>
                  {isFa ? item.cost : item.costEn}
                </span>
                <span style={{
                  fontFamily: isFa ? F.faBody : F.enBody,
                  fontSize: 11, color: C.textMuted
                }}>
                  ⏱ {isFa ? item.time : item.timeEn}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 22, padding: 18,
        background: C.greenLight, border: `1px solid ${C.greenMid}50`, borderRadius: 12
      }}>
        <p style={{
          fontFamily: isFa ? F.faBody : F.enBody, fontSize: 13.5,
          color: C.text, lineHeight: 1.9, margin: 0,
          direction: isFa ? "rtl" : "ltr", textAlign: isFa ? "right" : "left"
        }}>
          <strong style={{ color: C.green }}>
            {t("قانون طلایی: ", "Golden Rule: ")}
          </strong>
          {t(
            "اگه خدمات خوب باشه ولی مارکتینگ نباشه → شکست. اگه مارکتینگ عالی باشه ولی خدمات بد → موقتی موفق میشه. هر دو رو با هم داشته باش.",
            "Great service without marketing → failure. Great marketing without service → temporary success. You need both."
          )}
        </p>
      </div>
    </div>
  );
}

function ChecklistSection({ lang }: { lang: "fa" | "en" }) {
  const t = useT(lang);
  const isFa = lang === "fa";
  const [statuses, setStatuses] = useState<Record<string, "done" | "planned" | "pending">>({});
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const docRef = doc(db, "checklist", "global");
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatuses(snapshot.data() as any);
      }
    });
    return () => unsubscribe();
  }, []);

  const cycle = (id: string) => {
    setStatuses(prev => {
      const cur = prev[id] || "pending";
      const next: "done" | "planned" | "pending" = cur === "pending" ? "done" : cur === "done" ? "planned" : "pending";
      const newState: Record<string, "done" | "planned" | "pending"> = { ...prev, [id]: next };
      setDoc(doc(db, "checklist", "global"), newState).catch(console.error);
      return newState;
    });
  };
  const get = (id: string) => statuses[id] || "pending";

  const STATUS = {
    done: { fa: "✅ انجام شد", en: "✅ Done", color: C.green, bg: C.greenLight },
    planned: { fa: "📅 برنامه‌ریزی شده", en: "📅 Planned", color: C.gold, bg: C.goldLight },
    pending: { fa: "⏳ انجام نشده", en: "⏳ Not Started", color: C.textMuted, bg: C.surfaceAlt },
  };

  const FILTERS = [
    { k: "all", fa: "همه", en: "All" },
    { k: "done", fa: "انجام شده", en: "Done" },
    { k: "planned", fa: "برنامه‌ریزی", en: "Planned" },
    { k: "pending", fa: "انجام نشده", en: "Not Started" },
  ];

  const all = CHECKLIST.flatMap(c => c.items);
  const doneN = all.filter(i => get(i.id) === "done").length;
  const planN = all.filter(i => get(i.id) === "planned").length;
  const pct = Math.round((doneN / all.length) * 100);

  return (
    <div>
      {/* Progress */}
      <SectionCard style={{ marginBottom: 20 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 12,
          flexDirection: "row"
        }}>
          <div style={{ textAlign: isFa ? "right" : "left" }}>
            <div style={{
              fontFamily: isFa ? F.faBody : F.enBody,
              fontWeight: 700, fontSize: 15, color: C.text
            }}>
              {t("پیشرفت کلی", "Overall Progress")}
            </div>
            <div style={{
              fontFamily: isFa ? F.faBody : F.enBody,
              fontSize: 12, color: C.textMuted
            }}>
              {doneN} {t("از", "of")} {all.length} {t("کار انجام شده", "tasks done")}
            </div>
          </div>
          <span style={{ fontFamily: F.enBody, fontWeight: 800, fontSize: 30, color: C.green }}>{pct}%</span>
        </div>
        <div style={{ background: C.borderSoft, borderRadius: 6, height: 9, overflow: "hidden", marginBottom: 14 }}>
          <div style={{
            width: `${pct}%`, height: "100%", borderRadius: 6,
            background: `linear-gradient(90deg, ${C.greenMid}, ${C.green})`,
            transition: "width 0.4s ease"
          }} />
        </div>
        <div style={{
          display: "flex", gap: 14, flexWrap: "wrap",
          flexDirection: "row"
        }}>
          {[
            { ...STATUS.done, count: doneN },
            { ...STATUS.planned, count: planN },
            { ...STATUS.pending, count: all.length - doneN - planN },
          ].map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 5,
              flexDirection: "row"
            }}>
              <Pip color={s.color} />
              <span style={{
                fontFamily: isFa ? F.faBody : F.enBody,
                fontSize: 12, color: s.color
              }}>
                {t(s.fa, s.en)} ({s.count})
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Filter */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap",
        justifyContent: isFa ? "flex-end" : "flex-start"
      }}>
        {FILTERS.map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{
            background: filter === f.k ? C.green : C.surfaceAlt,
            border: `1px solid ${filter === f.k ? C.green : C.border}`,
            color: filter === f.k ? "#fff" : C.textMid,
            fontFamily: isFa ? F.faBody : F.enBody,
            fontWeight: filter === f.k ? 700 : 400, fontSize: 12,
            borderRadius: 20, padding: "5px 14px", cursor: "pointer",
            transition: "all 0.15s",
          }}>
            {t(f.fa, f.en)}
          </button>
        ))}
      </div>

      {/* Items */}
      {CHECKLIST.map((cat, ci) => {
        const visible = cat.items.filter(item =>
          filter === "all" || get(item.id) === filter);
        if (!visible.length) return null;
        return (
          <div key={ci} style={{ marginBottom: 22 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
              flexDirection: "row", justifyContent: "flex-start"
            }}>
              <Pip color={cat.color} />
              <span style={{
                fontFamily: isFa ? F.faBody : F.enBody,
                fontWeight: 700, fontSize: 12.5, color: cat.color,
                letterSpacing: isFa ? 0 : "0.07em",
                textTransform: isFa ? "none" : "uppercase"
              }}>
                {t(cat.cat, cat.catEn)}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {visible.map(item => {
                const s = get(item.id);
                const sc = STATUS[s];
                return (
                  <div key={item.id} onClick={() => cycle(item.id)} style={{
                    background: sc.bg, borderRadius: 10, padding: "13px 15px",
                    border: `1px solid ${s === "pending" ? C.borderSoft : sc.color + "40"}`,
                    display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    transition: "all 0.18s",
                    flexDirection: "row",
                  }}>
                    {/* status box */}
                    <div style={{
                      width: 30, height: 30, borderRadius: 7, flexShrink: 0, fontSize: 14,
                      background: s === "pending" ? C.surfaceAlt : sc.bg,
                      border: `2px solid ${s === "pending" ? C.border : sc.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {s === "done" ? "✅" : s === "planned" ? "📅" : "⬜"}
                    </div>
                    {/* text */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: isFa ? F.faBody : F.enBody,
                        fontSize: 13.5, fontWeight: 500,
                        color: s === "done" ? C.textMuted : C.text,
                        textDecoration: s === "done" ? "line-through" : "none",
                        direction: isFa ? "rtl" : "ltr",
                        textAlign: isFa ? "right" : "left",
                        lineHeight: 1.5,
                      }}>
                        {t(item.fa, item.en)}
                      </div>
                    </div>
                    {/* badge */}
                    <span style={{
                      fontFamily: isFa ? F.faBody : F.enBody,
                      fontSize: 10, fontWeight: 700, color: sc.color,
                      border: `1px solid ${sc.color}50`,
                      borderRadius: 5, padding: "2px 8px",
                      background: sc.bg, whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      {t(sc.fa.replace(/^.{2}/, "").trim(), sc.en.replace(/^.{2}/, "").trim())}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{
        marginTop: 14, padding: 14,
        background: C.goldLight, border: `1px solid ${C.gold}40`,
        borderRadius: 10, textAlign: "center"
      }}>
        <p style={{
          fontFamily: isFa ? F.faBody : F.enBody, fontSize: 12,
          color: C.gold, margin: 0
        }}>
          {t(
            "💡 روی هر آیتم ضربه بزن: انجام نشده ← ✅ انجام شد ← 📅 برنامه‌ریزی",
            "💡 Tap each item to cycle: Not Started → ✅ Done → 📅 Planned"
          )}
        </p>
      </div>
    </div>
  );
}

/* ─── ROOT ─────────────────────────────────────────────────── */
const PASSWORD = import.meta.env.VITE_APP_PASSWORD as string;

export default function PetHotelPlan() {
  const [lang, setLang] = useState<"fa" | "en">("fa");
  const [active, setActive] = useState("services");
  const [passwordInput, setPasswordInput] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const t = useT(lang);
  const isFa = lang === "fa";
  const tab = TABS.find(t => t.id === active);

  useEffect(() => {
    if (localStorage.getItem("petHotelUnlocked") === "true") {
      setAuthorized(true);
    }
  }, []);

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordInput === PASSWORD) {
      setAuthorized(true);
      localStorage.setItem("petHotelUnlocked", "true");
      return;
    }
    alert("Password is incorrect. Try again.");
    setPasswordInput("");
  };

  const render = () => {
    const props = { lang };
    switch (active) {
      case "services": return <ServicesSection  {...props} />;
      case "marketing": return <MarketingSection {...props} />;
      case "trust": return <TrustSection     {...props} />;
      case "instagram": return <InstagramSection {...props} />;
      case "ideas": return <AdvancedIdeasSection {...props} />;
      case "tasks": return <TasksSection     {...props} />;
      case "priority": return <PrioritySection  {...props} />;
      case "checklist": return <ChecklistSection {...props} />;
      case "partners": return <PartnersSection  {...props} />;
      default: return null;
    }
  };

  if (!authorized) {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg,
        fontFamily: F.enBody, direction: "ltr",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24
      }}>
        <div style={{
          width: "100%", maxWidth: 420, background: C.surface,
          border: `1px solid ${C.borderSoft}`, borderRadius: 20,
          padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.08)"
        }}>
          <h1 style={{
            fontFamily: F.enDisplay,
            fontSize: 28, margin: 0, color: C.green
          }}>
            Page Locked
          </h1>
          <p style={{
            fontFamily: F.enBody,
            fontSize: 14, color: C.textMid, margin: "12px 0 24px", lineHeight: 1.7,
            direction: "ltr", textAlign: "left"
          }}>
            Enter the password to continue.
          </p>
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              style={{
                width: "100%", borderRadius: 12, border: `1px solid ${C.border}`,
                padding: "14px 16px", fontSize: 14,
                fontFamily: F.enBody, color: C.text
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                width: "100%", borderRadius: 12, padding: "14px 16px",
                border: "none", background: C.green, color: "#fff",
                fontFamily: F.enBody, fontWeight: 700,
                cursor: "pointer", fontSize: 14
              }}
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: isFa ? F.faBody : F.enBody, direction: isFa ? "rtl" : "ltr",
      display: "flex", flexDirection: "column", alignItems: "center"
    }}>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,400;1,600&family=DM+Sans:wght@400;500;700&family=Vazirmatn:wght@400;500;700;800&display=swap" rel="stylesheet" />

      {/* Main Full-Screen but Centered Container */}
      <div style={{
        width: "100%", maxWidth: 1100, minHeight: "100vh",
        background: C.surface, boxShadow: "0 0 30px rgba(0,0,0,0.03)",
        display: "flex", flexDirection: "column", position: "relative"
      }}>
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div style={{
          background: C.surface, borderBottom: `1px solid ${C.borderSoft}`,
          padding: "40px 30px 30px", textAlign: isFa ? "right" : "left", position: "relative",
          display: "flex", flexDirection: "column", alignItems: isFa ? "flex-start" : "center"
        }}>

          {/* Language Toggle */}
          <div style={{
            position: "absolute", top: 20,
            left: isFa ? 20 : "auto", right: isFa ? "auto" : 20,
            display: "flex", background: C.surfaceAlt,
            border: `1px solid ${C.borderSoft}`, borderRadius: 24, overflow: "hidden",
            boxShadow: "0 2px 5px rgba(0,0,0,0.02)"
          }}>
            {(["fa", "en"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? C.green : "transparent",
                border: "none", color: lang === l ? "#fff" : C.textMuted,
                fontFamily: F.enBody, fontWeight: 700, fontSize: 13,
                padding: "8px 20px", cursor: "pointer", transition: "all 0.2s",
              }}>
                {l === "fa" ? "فارسی" : "EN"}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 16, display: "flex", justifyContent: isFa ? "flex-end" : "flex-start" }}>
            <img src={logoSrc} alt={t("لوگوی Paw Boutique", "Paw Boutique Logo")} style={{ width: 84, maxWidth: 120, height: "auto" }} />
          </div>
          <h1 style={{
            fontFamily: isFa ? F.faDisplay : F.enDisplay,
            fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800,
            fontStyle: isFa ? "normal" : "italic",
            color: C.green, margin: 0, marginBottom: 12,
            lineHeight: 1.3
          }}>
            {isFa ? "پلن" : "Plan"}
          </h1>
          <p style={{
            fontFamily: isFa ? F.faBody : F.enBody,
            fontSize: 15, color: C.textMid, margin: 0,
            maxWidth: 600, lineHeight: 1.6
          }}>
            {isFa
              ? ""
              : ""}
          </p>
        </div>

        {/* ── TABS ──────────────────────────────────────────── */}
        <div style={{
          background: C.surfaceAlt, borderBottom: `1px solid ${C.borderSoft}`,
          display: "flex", overflowX: "auto",
          justifyContent: "center", padding: "0 10px",
          scrollbarWidth: "none", /* Hide scrollbar for clean look */
        }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActive(tab.id)} style={{
              background: active === tab.id ? C.surface : "transparent",
              border: "none",
              borderTop: active === tab.id ? `3px solid ${tab.color}` : "3px solid transparent",
              color: active === tab.id ? tab.color : C.textMid,
              fontFamily: isFa ? F.faBody : F.enBody,
              fontWeight: active === tab.id ? 700 : 500,
              fontSize: 14, padding: "16px 24px", cursor: "pointer",
              whiteSpace: "nowrap", transition: "all 0.2s ease-in-out",
              display: "flex", alignItems: "center", gap: 8,
              borderTopLeftRadius: active === tab.id ? 8 : 0,
              borderTopRightRadius: active === tab.id ? 8 : 0,
              boxShadow: active === tab.id ? "0 -2px 10px rgba(0,0,0,0.02)" : "none",
              marginTop: 4
            }}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span>{isFa ? tab.fa : tab.en}</span>
            </button>
          ))}
        </div>

        {/* ── SECTION HEADER ────────────────────────────────── */}
        <div style={{ padding: "40px 40px 0", display: "flex", flexDirection: "column", alignItems: isFa ? "flex-start" : "flex-start" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
            flexDirection: "row"
          }}>
            <span style={{ fontSize: 26, background: `${tab?.color}15`, padding: "10px", borderRadius: "12px" }}>{tab?.icon}</span>
            <h2 style={{
              fontFamily: isFa ? F.faDisplay : F.enDisplay,
              fontSize: 26, fontWeight: 700, color: C.text, margin: 0,
              fontStyle: isFa ? "normal" : "italic",
            }}>
              {isFa ? tab?.fa : tab?.en}
            </h2>
          </div>
          <div style={{
            height: 4, width: 60, borderRadius: 2,
            background: tab?.color, marginBottom: 30,
            marginRight: isFa ? 0 : "auto", marginLeft: isFa ? "auto" : 0,
            [isFa ? "marginLeft" : "marginRight"]: 0
          }} />
        </div>

        {/* ── CONTENT ──────────────────────────────────────── */}
        <div style={{ padding: "0 40px 60px", flex: 1 }}>{render()}</div>
      </div>
    </div>
  );
}
