import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

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
        icon: "📸", fa: "عکاسی حرفه‌ای از محیط", en: "Professional Photos of the Venue",
        descFa: "۲-۳ ساعت وقت بذار. هتل، گرومینگ، حیاط بازی، سگ‌ها. پایه همه چیزه.",
        descEn: "Spend 2-3 hours. Hotel interior, grooming area, play yard, dogs. This is the foundation of everything.",
        effort: "۲-۳ ساعت", effortEn: "2-3 hrs"
      },
      {
        icon: "🗺️", fa: "راه‌اندازی Google Maps", en: "Set Up Google Maps",
        descFa: "Google Business Profile کامل کن. لینک review مستقیم بگیر.",
        descEn: "Complete Google Business Profile. Get the direct review link.",
        effort: "۱ ساعت", effortEn: "1 hr"
      },
    ]
  },
  {
    phase: "این ماه", phaseEn: "This Month", color: C.gold,
    items: [
      {
        icon: "📅", fa: "تقویم محتوایی ماهانه", en: "Monthly Content Calendar",
        descFa: "جدول ساده: چه روزی چه پستی. Reel سه‌شنبه‌ها، Story روزانه، پست آموزشی هر دو هفته.",
        descEn: "Simple table: which day, which post. Reels on Tuesdays, daily Stories, educational post bi-weekly.",
        effort: "۲ ساعت", effortEn: "2 hrs"
      },
      {
        icon: "💬", fa: "Template‌های واتس‌اپ", en: "WhatsApp Message Templates",
        descFa: "۵ پیام آماده: خوش‌آمد، گزارش روزانه، بدرقه، درخواست review، تخفیف برگشت.",
        descEn: "5 ready messages: welcome, daily report, farewell, review request, return discount.",
        effort: "۱ ساعت", effortEn: "1 hr"
      },
      {
        icon: "🎨", fa: "طراحی Report Card", en: "Design the Report Card",
        descFa: "توی Canva یه تمپلیت بساز: لوگو، عکس سگ، آمار روزانه. مشتری استوری میکنه.",
        descEn: "Build a Canva template: logo, dog photo, daily stats. Customers will story it — free advertising.",
        effort: "۲ ساعت", effortEn: "2 hrs"
      },
      {
        icon: "🌐", fa: "لندینگ پیج ساده", en: "Simple Landing Page",
        descFa: "حتی Wix کافیه. قیمت‌ها، پکیج‌ها، گالری، فرم رزرو.",
        descEn: "Even Wix works fine. Prices, packages, photo gallery, booking form.",
        effort: "۴-۵ ساعت", effortEn: "4-5 hrs"
      },
    ]
  },
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
    cat: "زیرساخت دیجیتال", catEn: "Digital Foundation", color: C.blue,
    items: [
      { id: "c1", fa: "Google Business Profile کامل راه‌اندازی شده", en: "Google Business Profile fully set up" },
      { id: "c2", fa: "عکس‌های حرفه‌ای از محیط هتل گرفته شده", en: "Professional photos of the hotel taken" },
      { id: "c3", fa: "لینک مستقیم Google Review گرفته شده", en: "Google Review direct link obtained" },
      { id: "c4", fa: "لندینگ پیج یا وبسایت راه‌اندازی شده", en: "Landing page or website launched" },
      { id: "c5", fa: "پیج اینستاگرام با هایلایت و بیو کامل", en: "Instagram page with full bio & highlights" },
    ]
  },
  {
    cat: "مارکتینگ محتوا", catEn: "Content Marketing", color: C.gold,
    items: [
      { id: "c6", fa: "تقویم محتوایی ماهانه ساخته شده", en: "Monthly content calendar created" },
      { id: "c7", fa: "اولین Reel قبل/بعد گرومینگ پست شده", en: "First before/after grooming Reel posted" },
      { id: "c8", fa: "Story روزانه از داخل هتل شروع شده", en: "Daily Stories from inside the hotel started" },
      { id: "c9", fa: "Template پیام‌های واتس‌اپ آماده شده", en: "WhatsApp message templates prepared" },
      { id: "c10", fa: "اولین ۵ تا Google Review جمع‌آوری شده", en: "First 5 Google Reviews collected" },
    ]
  },
  {
    cat: "خدمات جدید", catEn: "New Services", color: C.green,
    items: [
      { id: "c11", fa: "Daycare روزانه راه‌اندازی شده", en: "Daily Daycare launched" },
      { id: "c12", fa: "Pet Taxi راه‌اندازی شده", en: "Pet Taxi service launched" },
      { id: "c13", fa: "Live Camera برای مشتری‌ها فعال شده", en: "Live Camera activated for clients" },
      { id: "c14", fa: "پکیج ترکیبی طراحی و اعلام شده", en: "Bundle package designed and announced" },
      { id: "c15", fa: "سیستم گزارش روزانه واتس‌اپ شروع شده", en: "Daily WhatsApp report system started" },
    ]
  },
  {
    cat: "اعتمادسازی", catEn: "Trust Building", color: C.rose,
    items: [
      { id: "c16", fa: "همکاری با کلینیک دامپزشکی شروع شده", en: "Partnership with vet clinic started" },
      { id: "c17", fa: "همکاری با پت‌شاپ محلی شروع شده", en: "Partnership with local pet shop started" },
      { id: "c18", fa: "Report Card در Canva طراحی شده", en: "Report Card template designed in Canva" },
      { id: "c19", fa: "پروتکل واکسیناسیون اعلام شده", en: "Vaccination protocol announced" },
      { id: "c20", fa: "ویدیوی معرفی کارکنان پست شده", en: "Staff introduction video posted" },
    ]
  },
  {
    cat: "رشد و تبلیغات", catEn: "Growth & Ads", color: C.purple,
    items: [
      { id: "c21", fa: "اولین کمپین Instagram Ads اجرا شده", en: "First Instagram Ads campaign launched" },
      { id: "c22", fa: "با ۲ میکرو اینفلوئنسر پت همکاری شده", en: "Collaborated with 2 pet micro-influencers" },
      { id: "c23", fa: "Loyalty Card راه‌اندازی شده", en: "Loyalty Card system launched" },
      { id: "c24", fa: "آفر تخفیف اولین اقامت اعلام شده", en: "First-stay discount offer announced" },
      { id: "c25", fa: "بنر در مجتمع‌های مسکونی نصب شده", en: "Banner installed in residential complexes" },
    ]
  },
];

const TABS = [
  { id: "services", icon: "🐾", fa: "خدمات جدید", en: "Services", color: C.green },
  { id: "marketing", icon: "📣", fa: "مارکتینگ", en: "Marketing", color: C.gold },
  { id: "trust", icon: "🤝", fa: "اعتمادسازی", en: "Trust", color: C.blue },
  { id: "tasks", icon: "✅", fa: "وظایف تو", en: "Your Tasks", color: C.rose },
  { id: "priority", icon: "🎯", fa: "اولویت‌ها", en: "Priorities", color: C.purple },
  { id: "checklist", icon: "☑️", fa: "چک‌لیست", en: "Checklist", color: C.orange },
];

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
export default function PetHotelPlan() {
  const [lang, setLang] = useState<"fa" | "en">("fa");
  const [active, setActive] = useState("services");
  const isFa = lang === "fa";
  const tab = TABS.find(t => t.id === active);

  const render = () => {
    const props = { lang };
    switch (active) {
      case "services": return <ServicesSection  {...props} />;
      case "marketing": return <MarketingSection {...props} />;
      case "trust": return <TrustSection     {...props} />;
      case "tasks": return <TasksSection     {...props} />;
      case "priority": return <PrioritySection  {...props} />;
      case "checklist": return <ChecklistSection {...props} />;
      default: return null;
    }
  };

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

          <div style={{ fontSize: 48, marginBottom: 16 }}>🐾</div>
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
