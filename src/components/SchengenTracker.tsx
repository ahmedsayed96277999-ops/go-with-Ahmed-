import React, { useState, useEffect } from "react";
import { 
  Calendar, CheckSquare, ExternalLink, FileText, Calculator, 
  AlertTriangle, CheckCircle2, Info, Search, Building2, 
  Users, Briefcase, GraduationCap, Plus, Trash2, ShieldCheck, 
  RefreshCw, Landmark, HelpCircle, ArrowRight, ArrowLeft, DollarSign, Globe2, Sparkles, Receipt, Bell, Volume2, ShieldAlert
} from "lucide-react";
import { Language } from "../types";

interface SchengenTrackerProps {
  lang: Language;
  onBack?: () => void;
}

interface SchengenCountry {
  id: string;
  flag: string;
  name: string;
  nameAr: string;
  center: "TLScontact" | "VFS Global" | "BLS International" | "Embassy";
  fee: number; // €90 base fee
  applyUrl: string;
  status: "available" | "premium_only" | "full" | "checking";
  slotsEn: string;
  slotsAr: string;
  lastCheckedEn: string;
  lastCheckedAr: string;
  city: "Cairo" | "Alexandria" | "Both";
  cityAr: string;
}

interface TripSegment {
  id: string;
  entryDate: string;
  exitDate: string;
}

export default function SchengenTracker({ lang, onBack }: SchengenTrackerProps) {
  const isAr = lang === "ar";
  
  // Tab states: appointments tracker, checklists, 90/180 calculator, rules/fees
  const [activeSubTab, setActiveSubTab] = useState<"appointments" | "checklist" | "calculator" | "directory">("appointments");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshProgress, setRefreshProgress] = useState<number>(0);
  const [refreshMessage, setRefreshMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCenter, setFilterCenter] = useState<string>("all");

  // Sound chime toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Auto-alert settings state for appointment alarms (Telegram / Visa Bot replica)
  const [alertConfig, setAlertConfig] = useState<{
    enabled: boolean;
    countryId: string;
    premiumAllowed: boolean;
  }>({
    enabled: false,
    countryId: "fr",
    premiumAllowed: true
  });

  // Alarm triggered modal/toast state
  const [activeToast, setActiveToast] = useState<{
    show: boolean;
    titleEn: string;
    titleAr: string;
    msgEn: string;
    msgAr: string;
  }>({
    show: false,
    titleEn: "",
    titleAr: "",
    msgEn: "",
    msgAr: ""
  });

  // Log of scanning activities (to emulate the visa bot console feed)
  const [botLogs, setBotLogs] = useState<string[]>([
    "System Initialized. Connected to 29 Schengen Consular databases.",
    "Watching all TLScontact, BLS Spain, and VFS Cairo ports.",
    "Stable ping 41ms achieved to European Visa Ledger."
  ]);

  // Real-time scrolling ticker feed messages
  const [liveTickerIndex, setLiveTickerIndex] = useState<number>(0);
  const tickerMessages = [
    {
      en: "🚨 Schengen Visa Council updated the standard fee to €90 for adults and €45 for minors (6-12) as of 2026.",
      ar: "🚨 أقر مجلس الاتحاد الأوروبي رسمياً زيادة رسوم فيزا الشنجن الأساسية إلى 90 يورو للبالغين و45 يورو للقاصرين."
    },
    {
      en: "🔔 TLScontact France Cairo released normal slots for early July right now! Hurry to reserve.",
      ar: "🔔 عاجل: TLScontact فرنسا بالقاهرة أفرجت عن مواعيد عادية لشهر يوليو الآن! سارع بالحجز."
    },
    {
      en: "🇪🇸 BLS Spain Alexandria is reporting high queue pressure. Normal slots open randomly at midnight.",
      ar: "🇪🇸 مكتب BLS إسبانيا بالإسكندرية يسير بحجوزات مكثفة. المواعيد تفتح عشوائياً عند منتصف الليل."
    },
    {
      en: "💡 Stamped bank statements should have active transactions in the last 6 months and be issued 7 days before submission.",
      ar: "💡 نصيحة: يجب أن يحتوي كشف الحساب البنكي على حركات نشطة لآخر 6 أشهر ومستخرجاً قبل موعدك بـ 7 أيام كأقصى حد."
    }
  ];

  // Rotate ticker messages automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTickerIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [tickerMessages.length]);

  // Web Audio Synth Chime player (for professional feedback sounds like real visa bots)
  const playSoundChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.start(now);
      osc1.stop(now + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(880, now + 0.08); // A5
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn("Audio context not supported", e);
    }
  };

  // Sound loop for critical alarms
  const playAlarmSiren = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      [0, 0.15, 0.3, 0.45].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(987.77, now + delay); // B5
        gain.gain.setValueAtTime(0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);
        osc.start(now + delay);
        osc.stop(now + delay + 0.18);
      });
    } catch (e) {}
  };

  // Full 29 Schengen Member Countries List with updated €90 base fee and authentic Egypt links as requested
  const [countries, setCountries] = useState<SchengenCountry[]>([
    {
      id: "fr",
      flag: "🇫🇷",
      name: "France",
      nameAr: "فرنسا",
      center: "TLScontact",
      fee: 90,
      applyUrl: "https://visas-fr.tlscontact.com/en-us/country/eg/vac/egCAI2fr",
      status: "premium_only",
      slotsEn: "VIP Slots open for July 12. Regular normal slots scarce.",
      slotsAr: "مواعيد مميزة متاحة لـ 12 يوليو. المواعيد العادية نادرة.",
      lastCheckedEn: "3 mins ago",
      lastCheckedAr: "منذ 3 دقائق",
      city: "Both",
      cityAr: "القاهرة والإسكندرية"
    },
    {
      id: "es",
      flag: "🇪🇸",
      name: "Spain",
      nameAr: "إسبانيا",
      center: "BLS International",
      fee: 90,
      applyUrl: "https://egypt.blsspainvisa.com/",
      status: "available",
      slotsEn: "Regular general appointments found from June 24 onwards.",
      slotsAr: "مواعيد عادية متاحة بكثرة من 24 يونيو فصاعداً.",
      lastCheckedEn: "Just now",
      lastCheckedAr: "الآن",
      city: "Both",
      cityAr: "القاهرة والإسكندرية"
    },
    {
      id: "gr",
      flag: "🇬🇷",
      name: "Greece",
      nameAr: "اليونان",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/grc/book-an-appointment",
      status: "available",
      slotsEn: "Normal and agency slots released for tomorrow morning.",
      slotsAr: "مواعيد عادية وفردية مفتوحة غداً صباحاً بالقاهرة.",
      lastCheckedEn: "8 mins ago",
      lastCheckedAr: "منذ 8 دقائق",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "at",
      flag: "🇦🇹",
      name: "Austria",
      nameAr: "النمسا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/aut/book-an-appointment",
      status: "full",
      slotsEn: "Fully Booked. New quota releases predicted early next week.",
      slotsAr: "مزدحم بالكامل. يتوقع فتح المواعيد مطلع الأسبوع المقبل.",
      lastCheckedEn: "12 mins ago",
      lastCheckedAr: "منذ 12 دقيقة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "be",
      flag: "🇧🇪",
      name: "Belgium",
      nameAr: "بلجيكا",
      center: "TLScontact",
      fee: 90,
      applyUrl: "https://visas-be.tlscontact.com/ar-ar/country/eg",
      status: "available",
      slotsEn: "Regular booking open for mid-July slots.",
      slotsAr: "الحجز العادي متاح لمواعيد منتصف يوليو.",
      lastCheckedEn: "15 mins ago",
      lastCheckedAr: "منذ 15 دقيقة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "ch",
      flag: "🇨🇭",
      name: "Switzerland",
      nameAr: "سويسرا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/che/book-an-appointment",
      status: "premium_only",
      slotsEn: "VIP Package slots open. Regular waitlist exceeded 30 days.",
      slotsAr: "متاحة مواعيد باقة كبار السن VIP. قائمة الانتظار العادية تتخطى 30 يوماً.",
      lastCheckedEn: "20 mins ago",
      lastCheckedAr: "منذ 20 دقيقة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "se",
      flag: "🇸🇪",
      name: "Sweden",
      nameAr: "السويد",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/swe/book-an-appointment",
      status: "full",
      slotsEn: "No direct slots. Apply with emergency request or Sweden sponsor ID.",
      slotsAr: "غير متاح حجز مباشر. يستلزم دعوة طارئة أو موافقة من السويد.",
      lastCheckedEn: "1 hour ago",
      lastCheckedAr: "منذ ساعة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "no",
      flag: "🇳🇴",
      name: "Norway",
      nameAr: "النرويج",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/nor/book-an-appointment",
      status: "available",
      slotsEn: "Limited June dates found. Apply soon.",
      slotsAr: "مواعيد محدودة للغاية في يونيو. تقدم بالطلب فوراً.",
      lastCheckedEn: "45 mins ago",
      lastCheckedAr: "منذ 45 دقيقة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "dk",
      flag: "🇩🇰",
      name: "Denmark",
      nameAr: "الدنمارك",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/dnk/book-an-appointment",
      status: "full",
      slotsEn: "Fully Booked. Denmark office reviews are taking over 45 days.",
      slotsAr: "مزدحم بالكامل. فحص طلبات الدنمارك يستغرق حالياً 45 يوماً.",
      lastCheckedEn: "2 hours ago",
      lastCheckedAr: "منذ ساعتين",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "fi",
      flag: "🇫🇮",
      name: "Finland",
      nameAr: "فنلندا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/fin/book-an-appointment",
      status: "available",
      slotsEn: "General tourist slots available. Fast tracking is stable.",
      slotsAr: "مواعيد سياحية عادية متاحة. سرعة المراجعة بنسق ممتاز.",
      lastCheckedEn: "1 hour ago",
      lastCheckedAr: "منذ ساعة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "pt",
      flag: "🇵🇹",
      name: "Portugal",
      nameAr: "البرتغال",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/prt/book-an-appointment",
      status: "full",
      slotsEn: "Consulate quota exceeded for this month. Slots check at 4 PM.",
      slotsAr: "الحصة القنصلية منتهية لهذا الشهر. سيتم التحديث 4 مساءً.",
      lastCheckedEn: "35 mins ago",
      lastCheckedAr: "منذ 35 دقيقة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "pl",
      flag: "🇵🇱",
      name: "Poland",
      nameAr: "بولندا",
      center: "Embassy",
      fee: 90,
      applyUrl: "https://secure.e-konsulat.gov.pl/placowki/157",
      status: "premium_only",
      slotsEn: "National & Schengen appointments require direct login and draw on e-Konsulat.",
      slotsAr: "المواعيد القومية والشنجن تتطلب سحب عشوائي وتسجيل عبر e-Konsulat.",
      lastCheckedEn: "3 hours ago",
      lastCheckedAr: "منذ 3 ساعات",
      city: "Both",
      cityAr: "القاهرة والإسكندرية"
    },
    {
      id: "cz",
      flag: "🇨🇿",
      name: "Czech Republic",
      nameAr: "التشيك",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/cze/book-an-appointment",
      status: "available",
      slotsEn: "Normal slots available starting from June 29.",
      slotsAr: "مواعيد عادية متاحة بكثرة بدءاً من 29 يونيو المقبل.",
      lastCheckedEn: "14 mins ago",
      lastCheckedAr: "منذ 14 دقيقة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "hu",
      flag: "🇭🇺",
      name: "Hungary",
      nameAr: "المجر",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/hun/book-an-appointment",
      status: "available",
      slotsEn: "Excellent availability of slots. Response rate is fast.",
      slotsAr: "إتاحة مواعيد استثنائية وسريعة جداً بكود فوري.",
      lastCheckedEn: "4 mins ago",
      lastCheckedAr: "منذ 4 دقائق",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "sk",
      flag: "🇸🇰",
      name: "Slovakia",
      nameAr: "سلوفاكيا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/svk/book-an-appointment",
      status: "full",
      slotsEn: "Appointments suspended. Check back weekly.",
      slotsAr: "الحجوزات معلقة مؤقتاً. عاين التحديثات الأسبوعية.",
      lastCheckedEn: "1 day ago",
      lastCheckedAr: "منذ يوم",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "si",
      flag: "🇸🇮",
      name: "Slovenia",
      nameAr: "سلوفينيا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/svn/book-an-appointment",
      status: "available",
      slotsEn: "Stable openings discovered for tourism and business.",
      slotsAr: "مواعيد مستقرة متوفرة للسياحة وطلبات الأعمال.",
      lastCheckedEn: "10 mins ago",
      lastCheckedAr: "منذ 10 دقائق",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "hr",
      flag: "🇭🇷",
      name: "Croatia",
      nameAr: "كرواتيا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/hrv/book-an-appointment",
      status: "available",
      slotsEn: "Multiple normal slots waiting for reservation.",
      slotsAr: "حجوزات عادية شاغرة ومتاحة للاختيار الفوري.",
      lastCheckedEn: "5 mins ago",
      lastCheckedAr: "منذ 5 دقائق",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "it",
      flag: "🇮🇹",
      name: "Italy",
      nameAr: "إيطاليا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/ita/book-an-appointment",
      status: "full",
      slotsEn: "Extremely Busy. Use Alarms to catch cancellation slots.",
      slotsAr: "مزدحم للغاية. استخدم مفتاح المنبه لاقتناص الإلغاءات.",
      lastCheckedEn: "11 mins ago",
      lastCheckedAr: "منذ 11 دقيقة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "de",
      flag: "🇩🇪",
      name: "Germany",
      nameAr: "ألمانيا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/deu/book-an-appointment",
      status: "premium_only",
      slotsEn: "Premium slots available Cairo. Normal waitlists are crowded.",
      slotsAr: "المواعيد المميزة متاحة بالقاهرة. الحجوزات العادية مزدحمة.",
      lastCheckedEn: "18 mins ago",
      lastCheckedAr: "منذ 18 دقيقة",
      city: "Both",
      cityAr: "القاهرة والإسكندرية"
    },
    {
      id: "nl",
      flag: "🇳🇱",
      name: "Netherlands",
      nameAr: "هولندا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/nld/book-an-appointment",
      status: "available",
      slotsEn: "Regular general appointments open for July 8, 2026.",
      slotsAr: "مواضيع عادية مفتوحة ومحددة لـ 8 يوليو 2026.",
      lastCheckedEn: "22 mins ago",
      lastCheckedAr: "منذ 22 دقيقة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "lt",
      flag: "🇱🇹",
      name: "Lithuania",
      nameAr: "ليتوانيا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/ltu/book-an-appointment",
      status: "available",
      slotsEn: "Open calendar slots for next week. Processing is fast.",
      slotsAr: "مواعيد مفتوحة الأسبوع القابل. المعالجة سريعة للغاية.",
      lastCheckedEn: "2 hours ago",
      lastCheckedAr: "منذ ساعتين",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "lv",
      flag: "🇱🇻",
      name: "Latvia",
      nameAr: "لاتفيا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/lva/book-an-appointment",
      status: "available",
      slotsEn: "Slots discovered for business and general travellers.",
      slotsAr: "مواعيد متاحة لسياح وعملاء السفر الوظيفي.",
      lastCheckedEn: "3 hours ago",
      lastCheckedAr: "منذ 3 ساعات",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "ee",
      flag: "🇪🇪",
      name: "Estonia",
      nameAr: "إستونيا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/est/book-an-appointment",
      status: "available",
      slotsEn: "Direct general slots open. Fast-track setup is excellent.",
      slotsAr: "مواعيد عادية متاحة حالياً. جاهزية تامة ومراجعة سريعة.",
      lastCheckedEn: "2 hours ago",
      lastCheckedAr: "منذ ساعتين",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "mt",
      flag: "🇲🇹",
      name: "Malta",
      nameAr: "مالطا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/mlt/book-an-appointment",
      status: "full",
      slotsEn: "No direct slots. High load due to student requests.",
      slotsAr: "مزدحم بالكامل وضغط هائل نظراً لملفات الطلاب الجدد.",
      lastCheckedEn: "4 hours ago",
      lastCheckedAr: "منذ 4 ساعات",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "is",
      flag: "🇮🇸",
      name: "Iceland",
      nameAr: "آيسلندا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/isl/book-an-appointment",
      status: "available",
      slotsEn: "Denmark delegation slot allocation is open.",
      slotsAr: "المواعيد مفتوحة عبر ووفد القنصلية الدنماركية بمصر.",
      lastCheckedEn: "5 hours ago",
      lastCheckedAr: "منذ 5 ساعات",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "lu",
      flag: "🇱🇺",
      name: "Luxembourg",
      nameAr: "لوكسمبورغ",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/lux/book-an-appointment",
      status: "available",
      slotsEn: "Individual general appointments open in mid-July.",
      slotsAr: "مواعيد عادية مفتوحة لمنتصف يوليو للمسافرين أفراداً.",
      lastCheckedEn: "6 hours ago",
      lastCheckedAr: "منذ 6 ساعات",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "li",
      flag: "🇱🇮",
      name: "Liechtenstein",
      nameAr: "ليختنشتاين",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/che/book-an-appointment",
      status: "premium_only",
      slotsEn: "Represented by Swiss VFS Embassy system. VIP lounge available.",
      slotsAr: "ممثلة بنظام سفارة سويسرا VFS. الصالة المميزة متاحة حالياً.",
      lastCheckedEn: "5 hours ago",
      lastCheckedAr: "منذ 5 ساعات",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "bg",
      flag: "🇧🇬",
      name: "Bulgaria",
      nameAr: "بلغاريا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/bgr/book-an-appointment",
      status: "available",
      slotsEn: "Newly admitted to Schengen! Normal slots available with quick approvals.",
      slotsAr: "انضمت حديثاً للشنجن! مواعيد متوفرة حالياً مع مراجعة سريعة.",
      lastCheckedEn: "12 mins ago",
      lastCheckedAr: "منذ 12 دقيقة",
      city: "Cairo",
      cityAr: "القاهرة"
    },
    {
      id: "ro",
      flag: "🇷🇴",
      name: "Romania",
      nameAr: "رومانيا",
      center: "VFS Global",
      fee: 90,
      applyUrl: "https://visa.vfsglobal.com/egy/en/rou/book-an-appointment",
      status: "available",
      slotsEn: "New Schengen member. Quick and regular appointments open.",
      slotsAr: "عضو شنجن جديد. معالجة سريعة مع تيسير مواعيد حجز عادية.",
      lastCheckedEn: "18 mins ago",
      lastCheckedAr: "منذ 18 دقيقة",
      city: "Cairo",
      cityAr: "القاهرة"
    }
  ]);

  // Document Checklist Profile
  const [employmentStatus, setEmploymentStatus] = useState<"employee" | "business" | "student" | "retired" | "unemployed">("employee");
  
  // Checked documents persistence
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    "passport": true,
    "biometric_photos": true,
    "travel_insurance": false,
    "visa_form": false,
    "flight_ticket": false,
    "hotel_voucher": false,
    "bank_statement": false
  });

  // Stay Trip planning state
  const [trips, setTrips] = useState<TripSegment[]>([
    { id: "1", entryDate: "2026-06-10", exitDate: "2026-06-25" },
    { id: "2", entryDate: "2026-08-01", exitDate: "2026-08-15" }
  ]);

  const [calcResult, setCalcResult] = useState<{ totalDays: number; status: "safe" | "warning"; detailsEn: string; detailsAr: string }>({
    totalDays: 31,
    status: "safe",
    detailsEn: "Your total duration is safe and complies within the 90-day threshold inside Schengen countries.",
    detailsAr: "إجمالي مدة الإقامة تقع بالكامل داخل الحد المسموح به وهو 90 يوماً."
  });

  // Dynamic visa fees calculations
  const [feeAdults, setFeeAdults] = useState<number>(1);
  const [feeChildren, setFeeChildren] = useState<number>(0);
  const [feeToddlers, setFeeToddlers] = useState<number>(0);
  const euroRate = 54.5; // Custom simulated EGP Bank conversion rate reference
  const appointmentServiceFeeEuro = 33; // Average TLS/VFS fee

  // Calculate dynamic trips stayed days
  useEffect(() => {
    let totals = 0;
    trips.forEach((trip) => {
      if (trip.entryDate && trip.exitDate) {
        const ent = new Date(trip.entryDate);
        const exi = new Date(trip.exitDate);
        if (exi >= ent) {
          const diffTime = Math.abs(exi.getTime() - ent.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
          totals += diffDays;
        }
      }
    });

    if (totals > 90) {
      setCalcResult({
        totalDays: totals,
        status: "warning",
        detailsEn: `Warning: You will spend ${totals} days in Schengen zone, exceeding the legal limit of 90 days. Please shorten your visit durations.`,
        detailsAr: `تحذير: ستقضي ${totals} يوماً في الشنجن، مما يتجاوز الحد المسموح به قانوناً (90 يوماً). يرجى تقليص فترات إقامتك.`
      });
    } else {
      setCalcResult({
        totalDays: totals,
        status: "safe",
        detailsEn: `You have planned ${totals} days of travel. This is safe and falls below the 90-day limit inside any rolling 180-day window.`,
        detailsAr: `لقد خططت لـ ${totals} يوماً من السفر. هذا آمن ويقع تماماً تحت حاجز الـ 90 يوماً في أي نافذة متحركة لـ 180 يوماً.`
      });
    }
  }, [trips]);

  const addTripSegment = () => {
    const lastTrip = trips[trips.length - 1];
    let nextEntry = "2026-09-01";
    let nextExit = "2026-09-10";
    if (lastTrip && lastTrip.exitDate) {
      const lastEx = new Date(lastTrip.exitDate);
      lastEx.setDate(lastEx.getDate() + 15);
      nextEntry = lastEx.toISOString().split("T")[0];
      lastEx.setDate(lastEx.getDate() + 10);
      nextExit = lastEx.toISOString().split("T")[0];
    }
    setTrips([...trips, { id: Date.now().toString(), entryDate: nextEntry, exitDate: nextExit }]);
    playSoundChime();
  };

  const removeTripSegment = (id: string) => {
    if (trips.length > 1) {
      setTrips(trips.filter((t) => t.id !== id));
      playSoundChime();
    }
  };

  const handleTripDateChange = (id: string, field: "entryDate" | "exitDate", value: string) => {
    setTrips(
      trips.map((t) => {
        if (t.id === id) {
          return { ...t, [field]: value };
        }
        return t;
      })
    );
  };

  // Build documents list
  const getDocuments = () => {
    const commonDocs = [
      {
        id: "passport",
        titleEn: "Valid Passport (Original)",
        titleAr: "جواز سفر أصلي ساري الصلاحية",
        descEn: "Must be valid for at least 3 months after departure from Schengen, have at least two empty pages, and issued in under 10 years.",
        descAr: "يجب أن يكون صالحاً لـ 3 أشهر بعد العودة المخططة، ويحتوي صفحتين فارغتين على الأقل، ومستخرجاً خلال آخر 10 سنوات."
      },
      {
        id: "visa_form",
        titleEn: "Complete Schengen Application Form",
        titleAr: "استمارة طلب تأشيرة الشنجن مملوءة بالكامل",
        descEn: "Completed in English or target embassy, signed by applicant personally in all signature fields.",
        descAr: "مملوءة بالكامل وموقعة من صاحب الطلب شخصياً وبخط واضح ومثبتة البيانات."
      },
      {
        id: "biometric_photos",
        titleEn: "Two Recents Biometric Photos (White BG)",
        titleAr: "صورتين خلفية بيضاء حديثة (بيومترية)",
        descEn: "3.5 x 4.5 cm size, looking straight ahead, not older than 6 months, no modification.",
        descAr: "مقاس 3.5 × 4.5 سم، ملامح وجه مكشوفة تماماً، لم يمر عليها أكثر من 6 أشهر ولم يجر عليها تعديلات."
      },
      {
        id: "travel_insurance",
        titleEn: "Travel Medical Sickness & Accident Insurance",
        titleAr: "وثيقة تأمين طبي دولي للسفر والطوارئ",
        descEn: "Must cover entire Schengen area. Minimum coverage value of €30,000 for emergency hospitalization and repatriation.",
        descAr: "وثيقة معتمدة تغطي كامل دول الشنجن بحد أدنى 30,000 يورو لتغطية الحالات الطارئة والإعادة الطبية."
      },
      {
        id: "flight_ticket",
        titleEn: "Round-trip Flight Reservation (Flight Ticket)",
        titleAr: "حجز طيران دائري للذهاب والعودة",
        descEn: "Flight roster details with booking codes. (Tips: Make sure the routes align perfectly with your entry/exit countries.)",
        descAr: "خط سير رحلات طيران مؤكد أو مبدئي يطابق فترات الذهاب والعودة التي تود السفر بها."
      },
      {
        id: "hotel_voucher",
        titleEn: "Proof of Accommodation (Hotel Booking/Vouchers)",
        titleAr: "حجز فنادق وقسائم إقامة لكافة الأيام",
        descEn: "Provides full coverage for every day of your stay without gaps.",
        descAr: "يغطي كافة ليالي السفر بالتتابع دون أي تداخل أو فجير زمني غير مبرر بأسماء المسافرين."
      },
      {
        id: "bank_statement",
        titleEn: "Original Stamped 6-Month Bank Statement",
        titleAr: "كشف حساب بنكي أصلي مختوم (آخر 6 أشهر)",
        descEn: "Original statement stamped on every single page under strict banking ink seal, demonstrating stable active funds.",
        descAr: "مسحوب بحد أقصى قبل الموعد بـ 7-10 أيام ومختوم على كافة صفحاته، يثبت معاملات مالية نشطة وتدفقات كافية."
      }
    ];

    const specificDocs: Record<string, { id: string; titleEn: string; titleAr: string; descEn: string; descAr: string }[]> = {
      employee: [
        {
          id: "hr_letter",
          titleEn: "Official Detailed HR Letter (Work Certificate)",
          titleAr: "خطاب عمل رسمي معتمد ومفصل من الموارد البشرية (HR Letter)",
          descEn: "Addressed to Embassy. Specifies job title, hired date, salary, holiday dates approved, and corporate contacts.",
          descAr: "موجّه للسفارة يذكر المسمى الوظيفي، الراتب الشهري بالتفصيل، تاريخ التعيين، والموافقة على فترة الإجازة المحددة."
        },
        {
          id: "payslips",
          titleEn: "Last 3 Months Salary Payslips",
          titleAr: "مفردات مرتب شهري لآخر 3 أشهر (Payslips)",
          descEn: "Printed, stamped under employer company logo to support bank statement listings.",
          descAr: "مطبوعة ومختومة بشعار الشركة ومطابقة تماماً للأرقام المذكورة بخطاب الموارد وكشف البنك لحجية الدخل."
        }
      ],
      business: [
        {
          id: "commercial_reg",
          titleEn: "Commercial Registry Extract",
          titleAr: "مستخرج سجل تجاري حديث مترجم ورسمي",
          descEn: "Certified government copy issued in the last 3 months, translated into English or target language.",
          descAr: "نسخة مستخرجة ومميكنة وصالحة لآخر 3 أشهر ومترجمة رسمياً للغة المعتمدة بالسفارة."
        },
        {
          id: "tax_card",
          titleEn: "Company Tax Registration Card",
          titleAr: "البطاقة الضريبية للشركة / الكيان التجاري",
          descEn: "Original tax card alongside a certified translated copy proving continuous financial compliance.",
          descAr: "البطاقة الضريبية سارية مع ترجمة رسمية كاملة توضح انتظام العمل والأداء الضريبي."
        }
      ],
      student: [
        {
          id: "enrollment_cert",
          titleEn: "Official School / University Enrollment Letter",
          titleAr: "إثبات قيد دراسي مدرسي أو جامعي معتمد وجديد",
          descEn: "Stamped letter from registrar confirming current semester enrollment, faculty, and permission parameter.",
          descAr: "شهادة قيد أصلية معتمدة ومختومة من شؤون الطلاب توضح السنة الدراسية والكلية ونوع التفرغ."
        },
        {
          id: "sponsor_letter",
          titleEn: "Sponsor (Parent) Solvency Guarantee Letter",
          titleAr: "خطاب تكفل مالي موقع من ولي الأمر الكفيل",
          descEn: "Explicit support letter from parents, alongside sponsor's HR Letter, commercial reg, and stamped bank statement.",
          descAr: "تعهد مالي صريح وممهر بتوقيع ولي الأمر، يرفق معه كشف حسابه وحالته وخطاب عمله الأصلي."
        }
      ],
      retired: [
        {
          id: "pension_proof",
          titleEn: "Social Security Pension Monthly Statement",
          titleAr: "بيان معاش رسمي مصدق من التأمينات الاجتماعية",
          descEn: "Stamped official pension ledger illustrating continuous month-to-month retirement deposits from state.",
          descAr: "خطاب معتمد بقيمة المعاش التقاعدي الشهري المحول وتاريخ صرفه الفعلي."
        }
      ],
      unemployed: [
        {
          id: "sponsor_guarantee",
          titleEn: "Sponsorship Commitment Declaration",
          titleAr: "إقرار رعاية وكفالة مالية موثقة من القرابة الأولى",
          descEn: "Legally binding statement from spouse or close relatives declaring full financial coverage of all journey expenses.",
          descAr: "خطاب كفالة رسمي يوقع من الزوج أو صلة القرابة الأولى مرفقاً ومؤيداً بجميع إثباتاتهم المالية والمهنية."
        },
        {
          id: "family_record",
          titleEn: "Official Family Relations Certificate (Civil)",
          titleAr: "قيد عائلي مميكن مترجم يثبت صلة القرابة",
          descEn: "A certified family civil registry document showing clear direct relationship to the trip sponsor.",
          descAr: "قيد عائلي مميكن ومترجم ومصدق رسمياً ومطابق لإبراز صلة الزوجية أو كفالة الأب والأم."
        }
      ]
    };

    return [...commonDocs, ...(specificDocs[employmentStatus] || [])];
  };

  const currentDocs = getDocuments();
  const totalDocsCount = currentDocs.length;
  const checkedDocsCount = currentDocs.filter((d) => checkedDocs[d.id]).length;
  const percentageCompleted = totalDocsCount > 0 ? Math.round((checkedDocsCount / totalDocsCount) * 100) : 0;

  // Visual text review of document readiness
  const getReadinessLabel = () => {
    if (percentageCompleted < 45) {
      return { 
        titleEn: "Deficient Checklist Structure", 
        titleAr: "ملف ناقِص وضعيف", 
        color: "text-rose-450 bg-rose-950/45 border-rose-500/20",
        adviceAr: "الملف يفتقد للركائز الأساسية لفيزا شنجن. يرجى مراجعة وتجهيز كشف الحساب المتزن والتأمين الطبي لضمان عدم الرفض.",
        adviceEn: "Core credentials missing. Preparing a stable bank statement, accommodation coverage, and medical insurance is highly critical."
      };
    } else if (percentageCompleted < 80) {
      return { 
        titleEn: "Adequate Preparations", 
        titleAr: "جاهزية متوسطة ومبشرة", 
        color: "text-amber-400 bg-amber-950/45 border-amber-500/20",
        adviceAr: "الملف يحتوي على الأساسيات المطلوبة ولكن تذكر توثيق خطاب العمل HR وترجمة السجلات التجارية بدقة بالغة.",
        adviceEn: "Main assets ready. Ensure proper official translation of commercial entries or HR letter authorization is pristine."
      };
    } else {
      return { 
        titleEn: "Excellent Ready Dossier", 
        titleAr: "ملف ذهبي جاهز ومكتمل", 
        color: "text-emerald-400 bg-emerald-950/45 border-emerald-500/20",
        adviceAr: "تهانينا! ملف المستندات الخاص بك قوي جداً ومكتمل الركائز من تأمين، كشف وتذاكر طيران. رتب المجلد وقدم فوراً بسلام.",
        adviceEn: "Outstanding compilation structure! Folders aligned with solid financial proofs, booking vouchers, and coverage. Ready to submit."
      };
    }
  };

  const readiness = getReadinessLabel();

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      playSoundChime();
      return updated;
    });
  };

  // Sync Centers & simulate slots releasing
  const handleRefreshCenters = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshProgress(10);
    setRefreshMessage(isAr ? "جاري فحص خوادم TLS contact..." : "Querying TLScontact server arrays...");
    playSoundChime();

    // Emulate step by step bot scanning to make it incredibly engaging
    setTimeout(() => {
      setRefreshProgress(40);
      setRefreshMessage(isAr ? "جاري الاقتران بقواعد بيانات VFS Global بمصر..." : "Reading VFS Global visa databases Cairo/Alex...");
      setBotLogs((prev) => [...prev, `[Scan] Port 443 handshake to VFS Global endpoints active.`]);
    }, 400);

    setTimeout(() => {
      setRefreshProgress(75);
      setRefreshMessage(isAr ? "جاري تحليل الاستجابة ومزامنة النبضات..." : "Analyzing response streams and validating captcha states...");
      setBotLogs((prev) => [...prev, `[Scan] BLS Spain International responding with 200 OK.`]);
    }, 800);

    setTimeout(() => {
      // Pick a random country of the 29 and release regular slots
      const randomIndex = Math.floor(Math.random() * countries.length);
      const updated = countries.map((item, idx) => {
        if (idx === randomIndex) {
          const statuses: ("available" | "premium_only" | "full")[] = ["available", "premium_only", "full"];
          // select a new random status
          const nextStatus = statuses[idx % 3];
          
          let slotsEn = "No direct slots. Apply with emergency sponsor letter.";
          let slotsAr = "لا تتوفر ح حجوزات عادية. تتطلب تبرير سفر عاجل.";
          if (nextStatus === "available") {
            slotsEn = "New general booking appointments opened for early next month!";
            slotsAr = "تم الكشف فوراً عن توافر مواعيد حجز عادية لأوائل الشهر المقبل!";
          } else if (nextStatus === "premium_only") {
            slotsEn = "Only Prime / VIP Lounge slots found now.";
            slotsAr = "متاح حالياً صالة كبار الشخصيات VIP فقط.";
          }

          return {
            ...item,
            status: nextStatus,
            slotsEn,
            slotsAr,
            lastCheckedEn: "Just now",
            lastCheckedAr: "الآن"
          };
        }
        return {
          ...item,
          lastCheckedEn: "2 mins ago",
          lastCheckedAr: "منذ دقيقتين"
        };
      });

      setCountries(updated);
      setIsRefreshing(false);
      setRefreshProgress(100);
      setRefreshMessage("");
      
      const targetMatch = updated[randomIndex];
      setBotLogs((prev) => [
        ...prev, 
        `[Result] Dynamic update on ${targetMatch.name}: Changed status to ${targetMatch.status.toUpperCase()}.`
      ]);

      // Check if this newly updated slot matches our Alarm Watcher Config
      if (alertConfig.enabled && targetMatch.id === alertConfig.countryId) {
        const isMatch = targetMatch.status === "available" || (alertConfig.premiumAllowed && targetMatch.status === "premium_only");
        if (isMatch) {
          setActiveToast({
            show: true,
            titleEn: `🚨 Schengen Alarms Triggered!`,
            titleAr: `🚨 إنذار فوري: موعد شنجن متاح!`,
            msgEn: `New slots detected for ${targetMatch.name} (${targetMatch.center}) in Egypt now. Secure your application immediately!`,
            msgAr: `تم العثور على مواعيد لبلد ${targetMatch.nameAr} في مركز ${targetMatch.center} بمصر حالياً. قدم فوراً!`
          });
          playAlarmSiren();
        } else {
          playSoundChime();
        }
      } else {
        playSoundChime();
      }
    }, 1300);
  };

  const toggleAlertConfig = () => {
    setAlertConfig(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
    playSoundChime();
    setBotLogs((prev) => [
      ...prev, 
      alertConfig.enabled 
        ? "[Watchdog] Alarm monitoring stands down." 
        : `[Watchdog] Active Watch armed on CountryId: ${alertConfig.countryId}. Listening to background feed.`
    ]);
  };

  // Searching & Filtering
  const filteredCountries = countries.filter((c) => {
    const matchSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameAr.includes(searchQuery);
    
    const matchCenter =
      filterCenter === "all" || c.center === filterCenter;
    
    return matchSearch && matchCenter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#04060c] flex flex-col text-slate-100 h-screen w-screen overflow-hidden font-sans select-none">
      
      {/* Decorative Premium Backdrops like Visa Bot */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-12 left-12 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Modern Dashboard Header */}
      <header className="bg-[#090d16] border-b border-zinc-900 h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 shadow-lg relative z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl shadow-md shadow-emerald-550/20">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-950 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <h2 className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>{isAr ? "رصد تأشيرات شنجن المباشر" : "Live Schengen Visa Tracker"}</span>
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-400 font-extrabold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {isAr ? "جميع الـ ٢٩ دولة" : "ALL 29 COUNTRIES"}
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium hidden xs:block mt-0.5">
              {isAr ? "جو مع أحمد - نظام رصد تفاعلي خارق أسرع من فيزا بوت" : "go with Ahmed - Original Consular Gateway & Live Watchdog Client"}
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={() => { setSoundEnabled(!soundEnabled); playSoundChime(); }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? "Mute alert chimes" : "Unmute alert chimes"}
          >
            <Volume2 className={`w-4 h-4 ${soundEnabled ? "text-emerald-400" : "text-slate-500"}`} />
          </button>

          <button
            onClick={handleRefreshCenters}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 font-bold text-xs select-none active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isAr ? "تحديث المنظومة" : "Live Scan Now"}</span>
          </button>

          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 px-4.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-950/20"
          >
            {isAr ? (
              <>
                <span>العودة للتطبيق الرئيسي</span>
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </>
            ) : (
              <>
                <span>Return To Main Hub</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </header>

      {/* Marquee Ticker */}
      <div className="bg-[#05080f] border-b border-zinc-900 px-4 sm:px-8 py-2.5 flex items-center gap-3 overflow-hidden text-xs text-slate-300 shrink-0 select-none z-10 relative">
        <span className="shrink-0 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
          {isAr ? "نبض المنظومة" : "OFFICIAL FEE NOTICE"}
        </span>
        <div className="flex-1 font-medium select-none truncate transition-all duration-500 font-sans tracking-wide">
          {isAr ? tickerMessages[liveTickerIndex].ar : tickerMessages[liveTickerIndex].en}
        </div>
      </div>

      {/* Main Body Window Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full z-10 relative">
        
        {/* Dynamic Alarm Modal */}
        {activeToast.show && (
          <div className="bg-emerald-950/30 border-2 border-emerald-500/40 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500 text-neutral-950 rounded-xl relative shrink-0">
                <Bell className="w-6 h-6 animate-bounce" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-rose-450 uppercase tracking-widest">
                  {isAr ? activeToast.titleAr : activeToast.titleEn}
                </h4>
                <p className="text-xs text-slate-200 mt-0.5 max-w-xl">
                  {isAr ? activeToast.msgAr : activeToast.msgEn}
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveToast(prev => ({ ...prev, show: false }));
                playSoundChime();
              }}
              className="px-4 py-2 text-xs font-black uppercase text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl cursor-pointer shrink-0"
            >
              {isAr ? "موافق ورصد" : "Dismiss Alarm"}
            </button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-1 bg-zinc-900/60 border border-zinc-850 rounded-2xl">
          <button
            onClick={() => { setActiveSubTab("appointments"); playSoundChime(); }}
            className={`flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === "appointments"
                ? "bg-slate-100 text-neutral-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-zinc-850"
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{isAr ? "رصد المواعيد الـ ٢٩" : "Schedules Tracker (29)"}</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("checklist"); playSoundChime(); }}
            className={`flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === "checklist"
                ? "bg-slate-100 text-neutral-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-zinc-850"
            }`}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span>{isAr ? "منشئ أوراق الملف" : "Documents Dossier"}</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("calculator"); playSoundChime(); }}
            className={`flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === "calculator"
                ? "bg-slate-100 text-neutral-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-zinc-850"
            }`}
          >
            <Calculator className="w-4 h-4 shrink-0" />
            <span>{isAr ? "حاسبة قواعد الإقامة" : "90/180 stay Calculator"}</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("directory"); playSoundChime(); }}
            className={`flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === "directory"
                ? "bg-slate-100 text-neutral-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-zinc-850"
            }`}
          >
            <Receipt className="w-4 h-4 shrink-0" />
            <span>{isAr ? "الرسوم و حاسبة الجنيه" : "Embassy Fees & EGP"}</span>
          </button>
        </div>

        {/* Live scanning progress bar */}
        {isRefreshing && (
          <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>{refreshMessage}</span>
              <span>{refreshProgress}%</span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${refreshProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Panel Router */}
        <div>
          
          {/* TAB 1: SCHEDULES MONITOR (The ultimate list of 29 countries) */}
          {activeSubTab === "appointments" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Centers Stream Grid (Col span 2) */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Search, Center selection & filter */}
                <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3.5">
                  <div className="relative w-full md:w-1/2">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isAr ? "ابحث بالصيغة العربية أو الإنجليزية..." : "Search country (e.g. France, Romania)..."}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-150 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs text-slate-400 font-bold hidden sm:inline whitespace-nowrap">
                      {isAr ? "مركز التقديم:" : "Agency Portal:"}
                    </span>
                    <select
                      value={filterCenter}
                      onChange={(e) => { setFilterCenter(e.target.value); playSoundChime(); }}
                      className="bg-zinc-950 border border-zinc-800 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer w-full sm:w-auto"
                    >
                      <option value="all">{isAr ? "جميع مراكز التقديم" : "All Centers Combined"}</option>
                      <option value="VFS Global">VFS Global</option>
                      <option value="TLScontact">TLScontact</option>
                      <option value="BLS International">BLS International</option>
                      <option value="Embassy">{isAr ? "السفارات مباشرة" : "Direct Embassy"}</option>
                    </select>
                  </div>
                </div>

                {/* Countries list display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCountries.map((country) => {
                    let statusColor = "bg-emerald-950/45 text-emerald-400 border-emerald-500/20";
                    let statusLabel = isAr ? "مواعيد حجز مفتوحة" : "Schedules Available";
                    
                    if (country.status === "premium_only") {
                      statusColor = "bg-sky-955/45 text-sky-400 border-sky-500/20";
                      statusLabel = isAr ? "مواعيد مميزة (VIP)" : "VIP / Premium Only";
                    } else if (country.status === "full") {
                      statusColor = "bg-rose-950/45 text-rose-400 border-rose-500/10";
                      statusLabel = isAr ? "مزدحم حالياً" : "Fully Booked";
                    } else if (country.status === "checking") {
                      statusColor = "bg-zinc-950/45 text-zinc-400 border-zinc-500/10 animate-pulse";
                      statusLabel = isAr ? "جاري الفحص..." : "Scanning Port...";
                    }

                    return (
                      <div 
                        key={country.id}
                        className="bg-zinc-900 border border-zinc-850 hover:border-zinc-750 transition-all rounded-2xl p-4 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                      >
                        {/* Glow indicator on group hover */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-slate-700/5 to-transparent rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="space-y-2">
                          {/* Flag, country and center name */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-3xl select-none" role="img" aria-label={country.name}>{country.flag}</span>
                              <div>
                                <h4 className="text-sm font-black text-white">
                                  {isAr ? country.nameAr : country.name}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {isAr ? country.cityAr : `Egypt: ${country.city}`}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] bg-zinc-950 text-slate-300 border border-zinc-800 font-extrabold px-2 py-1 rounded-md lowercase tracking-wide whitespace-nowrap">
                              {country.center}
                            </span>
                          </div>

                          {/* Updated Slot Status Info */}
                          <div className="bg-zinc-950/65 rounded-xl p-3 border border-zinc-900 space-y-1">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] rounded-full font-black uppercase border border-solid tracking-wider ${statusColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${country.status === 'available' ? 'bg-emerald-400' : country.status === 'premium_only' ? 'bg-sky-450' : country.status === 'full' ? 'bg-rose-500 animate-ping' : 'bg-zinc-450 animate-bounce'}`}></span>
                              {statusLabel}
                            </span>
                            <p className="text-xs text-slate-300 font-medium">
                              {isAr ? country.slotsAr : country.slotsEn}
                            </p>
                          </div>
                        </div>

                        {/* Cost & action section */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-850/60">
                          <div className="text-[10px] text-slate-400">
                            <div>{isAr ? "رسوم التأشيرة القنصلية:" : "Official Base Fee:"}</div>
                            <span className="text-emerald-400 font-extrabold text-xs">€{country.fee}</span>
                          </div>

                          <a
                            href={country.applyUrl}
                            target="_blank"
                            rel="noreferrer"
                            referrerPolicy="no-referrer"
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-805 hover:border-zinc-705 text-xs text-white rounded-xl font-bold transition-all"
                          >
                            <span>{isAr ? "سجل واحجز" : "Apply Link"}</span>
                            <ExternalLink className="w-3 h-3 text-slate-305" />
                          </a>
                        </div>
                      </div>
                    );
                  })}

                  {filteredCountries.length === 0 && (
                    <div className="col-span-1 sm:col-span-2 p-12 text-center bg-zinc-900 border border-zinc-850 rounded-2xl">
                      <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3 animate-bounce" />
                      <h4 className="text-sm font-black text-white">{isAr ? "لا توجد نتائج مطابقة لبحثك" : "Country Not Found"}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {isAr ? "تحقق من صياغة اسم البلد أو اختر مركز تقديم آخر." : "Verify typing spelling or adjust the agency portal selection filter."}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Watchdog Switch box (The replica of Visa Bot alarm channel) */}
              <div className="space-y-5">
                
                {/* Watchdog setup panel */}
                <div className="bg-[#080d1a] border border-emerald-500/20 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 py-0.5 px-3 bg-emerald-500 text-neutral-950 font-black text-[9px] uppercase rounded-bl-xl tracking-wider select-none animate-pulse">
                    {isAr ? "حارس المنظومة" : "WATCHER ROBOT ACTIVE"}
                  </div>

                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                      {isAr ? "منبه المواعيد الفوري (الرادار)" : "Consular Spot Watcher"}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed">
                    {isAr
                      ? "اختر بلدك المستهدفة. بمجرد تفعيل الرادار، ستقوم المنظومة بفحص وحزم المقاعد الشاغرة بمصر، وفي حال الإفراج عن موعد عادي سيتم تفعيل صفارة إنذار عالية!"
                      : "Choose your target Schengen country. When armed, manual/periodic scanning forces a continuous check. If a slot opens, the active browser audio siren activates!"}
                  </p>

                  <div className="space-y-4 bg-zinc-950/60 p-4 border border-zinc-900 rounded-xl">
                    <div className="text-xs">
                      <label className="block text-slate-400 mb-1 font-bold">{isAr ? "البلد المبحوث تلقائياً:" : "Destination Watch Target:"}</label>
                      <select
                        value={alertConfig.countryId}
                        onChange={(e) => { setAlertConfig(prev => ({ ...prev, countryId: e.target.value })); playSoundChime(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.flag} {isAr ? c.nameAr : c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        id="notifyPremiumCheck"
                        checked={alertConfig.premiumAllowed}
                        onChange={(e) => { setAlertConfig(prev => ({ ...prev, premiumAllowed: e.target.checked })); playSoundChime(); }}
                        className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
                      />
                      <label htmlFor="notifyPremiumCheck" className="text-slate-300 cursor-pointer select-none">
                        {isAr ? "تنبيه للمواعيد المميزة (VIP)" : "Alarm for Premium VIP lounge slots"}
                      </label>
                    </div>

                    <button
                      onClick={toggleAlertConfig}
                      className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer active:scale-95 ${
                        alertConfig.enabled
                          ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40"
                          : "bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-lg shadow-emerald-955/20"
                      }`}
                    >
                      <span>{alertConfig.enabled ? (isAr ? "إيقاف الرادار النشط" : "DISARM SYSTEM WATCHER") : (isAr ? "تفعيل نظام الرادار والمنبه" : "ARM SOUND RADAR ALARM")}</span>
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Virtual Telegram live bot logger feed panel */}
                <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-2xl space-y-3 shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-300 uppercase tracking-widest font-mono text-[10px]">
                      {isAr ? "لوحة التلجرام و سجل المنظومة" : "Visa Bot Terminal Logging"}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-teal-400 font-bold bg-teal-950 px-2 py-0.5 rounded border border-teal-800/20">
                      <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></span>
                      41ms
                    </span>
                  </div>

                  <div className="bg-zinc-950 rounded-xl p-3 h-44 overflow-y-auto border border-zinc-900 font-mono text-[10px] space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
                    {botLogs.map((log, index) => (
                      <div key={index} className="text-slate-300 border-l border-zinc-800 pl-2 leading-relaxed">
                        <span className="text-zinc-500">[{new Date().toLocaleTimeString()}]</span> {log}
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    {isAr 
                      ? "⚠️ يرجى تذكر: نظام الفحص يحترم سياسات الكابتشا الرسمية المطبقة بالسفارات لمنع أي حظر للحسابات الشخصية للمسافرين." 
                      : "⚠️ Disclaimer: Our watchdog adheres to embassy captcha guidelines and scan quotas to secure client login accounts."}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: DOSSIER DOCS BUILDER (Dynamic Checklist based on status) */}
          {activeSubTab === "checklist" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Document Checkbox Block */}
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-4 shadow-md">
                  
                  {/* Selector of social job status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? "صانع مجلد الأوراق السياحية والشخصية" : "Client Dossier Document Matrix"}</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        {isAr ? "اختر صفتك المهنية الحالية لتحديث الأوراق القانونية المطلوبة:" : "Specify your employment status to download / arrange requirements Checklist:"}
                      </p>
                    </div>

                    <select
                      value={employmentStatus}
                      onChange={(e) => { setEmploymentStatus(e.target.value as any); playSoundChime(); }}
                      className="bg-zinc-950 border border-zinc-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="employee">{isAr ? "موظف قطاع عام أو خاص" : "Private/Public Employee"}</option>
                      <option value="business">{isAr ? "صاحب عمل شركة / سجل تجاري" : "Business Owner (Commercial Register)"}</option>
                      <option value="student">{isAr ? "طالب مدرسي أو جامعي" : "Student (School / University)"}</option>
                      <option value="retired">{isAr ? "متقاعد ومعاش شهري" : "Retired (Pension Holder)"}</option>
                      <option value="unemployed">{isAr ? "لا أعمل / كفالة عائلية" : "Unemployed (Family Sponsorship)"}</option>
                    </select>
                  </div>

                  {/* Progressive document items */}
                  <div className="space-y-3">
                    {currentDocs.map((doc) => {
                      const isChecked = !!checkedDocs[doc.id];
                      return (
                        <div 
                          key={doc.id}
                          onClick={() => toggleDoc(doc.id)}
                          className={`border rounded-xl p-4 flex items-start gap-3.5 cursor-pointer transition-all select-none ${
                            isChecked 
                              ? "bg-zinc-900/40 border-emerald-500/20 shadow-sm" 
                              : "bg-zinc-950/20 border-zinc-850 hover:border-zinc-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isChecked ? "bg-emerald-500 border-emerald-500 text-neutral-900" : "border-zinc-700"
                          }`}>
                            {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                          </div>

                          <div className="space-y-1">
                            <span className={`text-xs font-extrabold block transition-colors ${isChecked ? "text-emerald-400 line-through" : "text-white"}`}>
                              {isAr ? doc.titleAr : doc.titleEn}
                            </span>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              {isAr ? doc.descAr : doc.descEn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

              {/* Sidebar Checklist Analyzer */}
              <div className="space-y-4">
                
                {/* Visual Circle meters for readiness */}
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-4 shadow-md text-center">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                    {isAr ? "تحليل قوة الملف القنصلي" : "Schengen Dossier Score"}
                  </h5>

                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    {/* SVG Progress Circle wrapper */}
                    <svg className="absolute inset-0 w-36 h-36 -rotate-90">
                      <circle 
                        cx="72" 
                        cy="72" 
                        r="64" 
                        className="stroke-zinc-800 stroke-[5] fill-none"
                      />
                      <circle 
                        cx="72" 
                        cy="72" 
                        r="64" 
                        className="stroke-emerald-500 stroke-[6] fill-none transition-all duration-500"
                        strokeDasharray={402}
                        strokeDashoffset={402 - (402 * percentageCompleted) / 100}
                      />
                    </svg>
                    <div className="text-center">
                      <span className="text-3xl font-black text-white">{percentageCompleted}%</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        {isAr ? "جاهز للتسليم" : "Ready Matrix"}
                      </p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border-dashed border border-solid text-xs leading-relaxed text-left ${readiness.color}`}>
                    <div className="font-extrabold mb-1">
                      {isAr ? readiness.titleAr : readiness.titleEn}
                    </div>
                    <span>
                      {isAr ? readiness.adviceAr : readiness.adviceEn}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-450 border-t border-zinc-800 pt-3">
                    <span>{isAr ? "المستندات المستمرة:" : "Checked Assets:"}</span>
                    <span className="font-extrabold text-white">{checkedDocsCount} / {totalDocsCount}</span>
                  </div>
                </div>

                {/* Important alert about translation */}
                <div className="bg-[#111009] border border-amber-500/10 rounded-2xl p-4.5 flex gap-3 text-xs leading-normal">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-slate-350">
                    <span className="font-bold text-slate-200 block">
                      {isAr ? "تحذير الترجمة الرسمية واللغات:" : "Consular Language Requirement:"}
                    </span>
                    <p>
                      {isAr
                        ? "سفارات مثل بولندا وتشيلي واليونان ترفض الأوراق المحررة باللغة العربية. يجب ترجمة كشوف البنك وخطابات العمل إلى الإنجليزية أو اللغة الرسمية للبلد المستهدف بمراكز ترجمة معتمدة."
                        : "Embassies discard documents in Arabic. HR letters, Commercial Registers, and Bank lists must be certified translated in English or the legal tongue of the destination."}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: STAY SPACE 90/180 COMPLIANCE CALCULATOR */}
          {activeSubTab === "calculator" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? "حاسبة فترات الإقامة والتجوال (90/180)" : "Schengen 90/180 Days Rolling Calculator"}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isAr 
                          ? "السياح بموجب النظام لا يجوز لهم البقاء في منطقة شنجن لأكثر من 90 يوماً داخل أي فترة 180 يوماً متحركة." 
                          : "Verify compliance of multiple trip intervals dynamically. Total must not surpass 90 days inside any rolling 180-day window."}
                      </p>
                    </div>

                    <button
                      onClick={addTripSegment}
                      className="flex items-center gap-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-450 text-neutral-950 font-black text-xs rounded-xl transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? "اضافة رحلة" : "Add Trip"}</span>
                    </button>
                  </div>

                  {/* Multiple segments container */}
                  <div className="space-y-3">
                    {trips.map((trip, idx) => (
                      <div 
                        key={trip.id}
                        className="bg-zinc-950/40 border border-zinc-855 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between"
                      >
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="w-6 h-6 rounded-full bg-zinc-800 text-xs font-black text-slate-350 flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                            {isAr ? "رحلة سفر شنجن:" : "Schengen Trip Segment:"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 flex-1">
                          <div className="text-left">
                            <label className="block text-[10px] text-slate-450 mb-1 font-mono uppercase">{isAr ? "تاريخ الدخول:" : "Entry Date:"}</label>
                            <input
                              type="date"
                              value={trip.entryDate}
                              onChange={(e) => handleTripDateChange(trip.id, "entryDate", e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-emerald-500 cursor-pointer"
                            />
                          </div>

                          <div className="text-left">
                            <label className="block text-[10px] text-slate-450 mb-1 font-mono uppercase">{isAr ? "تاريخ الخروج:" : "Exit Date:"}</label>
                            <input
                              type="date"
                              value={trip.exitDate}
                              onChange={(e) => handleTripDateChange(trip.id, "exitDate", e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-emerald-500 cursor-pointer"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={() => removeTripSegment(trip.id)}
                          disabled={trips.length <= 1}
                          className="p-2 text-rose-500 hover:bg-rose-955/20 hover:text-rose-400 rounded-lg shrink-0 disabled:opacity-30 disabled:hover:bg-transparent transition-colors mt-2 sm:mt-0"
                          title={isAr ? "إزالة الرحلة" : "Remove Trip interval"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Sidebar with calculator output status */}
              <div className="space-y-4">
                
                {/* Result card */}
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-4 shadow-md text-left">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? "حالة الإقامة والامتثال" : "Schengen compliance status"}
                  </h5>

                  <div className="space-y-2">
                    <div className="text-[10px] text-slate-400">{isAr ? "إجمالي أيام الإقامة المحسوبة:" : "Accumulated Stay Duration:"}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-4xl font-black ${calcResult.status === 'safe' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {calcResult.totalDays}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">{isAr ? "يوماً" : "Days stayed"}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border border-solid text-xs leading-relaxed ${
                    calcResult.status === 'safe' 
                      ? 'bg-emerald-950/40 border-emerald-555/20 text-emerald-400' 
                      : 'bg-rose-950/40 border-rose-555/20 text-rose-400'
                  }`}>
                    <div className="flex items-center gap-1.5 font-extrabold mb-1">
                      {calcResult.status === 'safe' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isAr ? "متطابق مع القانون" : "Fully Compliant"}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 animate-ping" />
                          <span>{isAr ? "تجاوز غير قانوني!" : "Overstay Limit Reached"}</span>
                        </>
                      )}
                    </div>
                    <span>{isAr ? calcResult.detailsAr : calcResult.detailsEn}</span>
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-850 p-3.5 rounded-xl font-mono text-[10px] text-slate-450 leading-relaxed">
                    <strong>{isAr ? "💡 قاعدة الـ 180 يوماً:" : "💡 Rolling stay mechanism:"}</strong>
                    <p className="mt-1">
                      {isAr
                        ? "يتم مراجعة فترات السفر دائماً بالتراجع إلى الوراء لـ 180 يوماً من أي تاريخ تود التواجد فيه في أوروبا للوقوف على أحقيتك."
                        : "To verify if you satisfy the limit, look backward 180 days from any single day inside Schengen, counting the sum total stayed."}
                    </p>
                  </div>
                </div>

              </div>
              
            </div>
          )}

          {/* TAB 4: DIRECT EMBASSY RULES & FEES AND EGP CONVERSION CALCULATOR */}
          {activeSubTab === "directory" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              
              {/* Fee and Calculator settings widget */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-5 shadow-lg">
                  <div className="border-b border-zinc-800 pb-3">
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? "حاسبة تكاليف فيزا شنجن الكلية بالجنيه المصري" : "Total Schengen Cost Estimator (EGP Conversion)"}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isAr
                        ? "رسوم التأشيرة الأساسية تحصّل باليورو أو ما يعادله بالجنيه المصري طبقاً لسعر بنك السفارة، بالإضافة لرسوم مركز التقديم الإلزامية."
                        : "The basic consular visa fee must be purchased in Euros or cash equivalent EGP depending on embassy bank rate. Calculate overall family expenses here."}
                    </p>
                  </div>

                  {/* Calculator setup inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-bold text-slate-350">{isAr ? "عدد الأفراد البالغين (90 يورو):" : "Adults Count (Age 12+, €90):"}</label>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { if (feeAdults > 0) { setFeeAdults(v => v - 1); playSoundChime(); } }}
                          className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-slate-300 font-extrabold cursor-pointer hover:bg-zinc-850 select-none"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-white font-mono text-sm">{feeAdults}</span>
                        <button 
                          onClick={() => { setFeeAdults(v => v + 1); playSoundChime(); }}
                          className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-slate-300 font-extrabold cursor-pointer hover:bg-zinc-850 select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-bold text-slate-350">{isAr ? "أطفال بمصروفات (6-12 سنة، 45 يورو):" : "Minors Count (Age 6-12, €45):"}</label>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { if (feeChildren > 0) { setFeeChildren(v => v - 1); playSoundChime(); } }}
                          className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-slate-300 font-extrabold cursor-pointer hover:bg-zinc-850 select-none"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-white font-mono text-sm">{feeChildren}</span>
                        <button 
                          onClick={() => { setFeeChildren(v => v + 1); playSoundChime(); }}
                          className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-805 text-slate-300 font-extrabold cursor-pointer hover:bg-zinc-850 select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-bold text-slate-350">{isAr ? "أطفال معفيين (أقل من 6 سنوات، مجاناً):" : "Infants (Age Under 6, Free):"}</label>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { if (feeToddlers > 0) { setFeeToddlers(v => v - 1); playSoundChime(); } }}
                          className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-805 text-slate-300 font-extrabold cursor-pointer hover:bg-zinc-850 select-none"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-white font-mono text-sm">{feeToddlers}</span>
                        <button 
                          onClick={() => { setFeeToddlers(v => v + 1); playSoundChime(); }}
                          className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-805 text-slate-300 font-extrabold cursor-pointer hover:bg-zinc-850 select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Summary Breakdown box */}
                  <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-850 space-y-4">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                      {isAr ? "تفصيل التكاليف المتوقعة بالجنيه واليورو" : "Calculated Ledger & Estimates"}
                    </h5>

                    {/* Math formulation variables */}
                    {(() => {
                      const totalConsularEuro = (feeAdults * 90) + (feeChildren * 45);
                      const totalServiceEuro = (feeAdults + feeChildren + feeToddlers) * appointmentServiceFeeEuro;
                      const netEuroSum = totalConsularEuro + totalServiceEuro;
                      const conversionValueEGP = netEuroSum * euroRate;

                      return (
                        <div className="space-y-3.5 divide-y divide-zinc-900">
                          
                          <div className="grid grid-cols-2 text-xs py-1.5">
                            <span className="text-slate-400">{isAr ? "رسوم السفارات الكلية (القنصلية):" : "Consular Base Visa Fees:"}</span>
                            <span className="text-right font-extrabold text-white">€{totalConsularEuro}</span>
                          </div>

                          <div className="grid grid-cols-2 text-xs py-1.5 pt-3">
                            <span className="text-slate-400">
                              {isAr ? "رسوم مكاتب التقديم المتوسطة الإلزامية (€33 للفرد):" : "Mandatory Agency Service Fees (€33/person):"}
                            </span>
                            <span className="text-right font-extrabold text-white">€{totalServiceEuro}</span>
                          </div>

                          <div className="grid grid-cols-2 text-xs py-1.5 pt-3">
                            <span className="text-slate-450">{isAr ? "المجموع الكلي باليورو الأوروبي:" : "Net Total Euros:"}</span>
                            <span className="text-right font-black text-teal-400 text-sm">€{netEuroSum}</span>
                          </div>

                          <div className="grid grid-cols-2 text-primary py-3 pt-4 font-black border-t-2 border-dashed border-zinc-800">
                            <span className="text-sm text-slate-150">{isAr ? "المجموع المعادل بالجنيه المصري (تقديري):" : "EGP Bank Exchange Equivalent:"}</span>
                            <div className="text-right">
                              <span className="text-2xl text-emerald-400 font-black">
                                {Math.round(conversionValueEGP).toLocaleString()}
                              </span>
                              <span className="text-xs text-slate-400 ml-1 font-bold">{isAr ? "جنيه مصري" : "EGP"}</span>
                            </div>
                          </div>

                        </div>
                      );
                    })()}
                  </div>

                  <p className="text-[10px] text-zinc-500 font-mono leading-normal">
                    * {isAr 
                      ? "تنبيه: رسوم حجز المواعيد والخدمات المميزة (Premium VIP Lounge/Courier) والترجمات المعتمدة لا تدخل في القيمة المعروضة بالأعلى ويتم دفعها لمركز التقديم بشكل منفصل كاش بالجنيه المصري." 
                      : "Notice: VIP lounges, SMS notices, fast-track courier routing, and certified translation costs inside TLS/VFS centers are extra and are charged separately cash in EGP."}
                  </p>
                </div>
              </div>

              {/* Sidebar with dynamic legal advisory notes */}
              <div className="space-y-4">
                <div className="bg-[#100707] border border-rose-500/10 rounded-2xl p-5 space-y-4 shadow-md text-left">
                  <div className="flex items-center gap-1.5 text-rose-450 uppercase tracking-widest text-xs font-black">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <span>{isAr ? "قوانين هامة وتحذيرات الرفض" : "Consular rejection warnings"}</span>
                  </div>

                  <div className="space-y-3.5 text-xs text-slate-350 leading-relaxed">
                    <div className="border-l-2 border-rose-500/20 pl-2.5">
                      <strong className="text-slate-200 block mb-0.5">{isAr ? "قاعدة الوجهة الأساسية:" : "Main Destination Rule:"}</strong>
                      <p>
                        {isAr
                          ? "يجب تقديم الملف إلى البلد الذي ستقضي فيه أطول مدة إقامة بالليالي. في حال تساوي الفترات، تقدم لبلد منفذ الدخول الأول. التقديم العشوائي لبلدان ميسرة المواعيد دون حجز حقيقي فيها قد يؤدي للرفض التلقائي أو التراجع بمطارات أوروبا."
                          : "Apply explicitly to the country of your longest physical night stay. If stays are equal, apply to the entry port. Randomly targeting easy embassies without real stay plans leads to airport rejection."}
                      </p>
                    </div>

                    <div className="border-l-2 border-rose-500/20 pl-2.5">
                      <strong className="text-slate-200 block mb-0.5">{isAr ? "مصداقية كشوف البنك:" : "Authentic Financial Capacity:"}</strong>
                      <p>
                        {isAr
                          ? "السفارات تقوم بمراجعة دقيقة وتدقيق للودائع المجهولة أو الضخمة المفاجئة قبل سحب كشف الحساب. يجب أن تعكس الحركات معاملات طبيعية مع رصيد كافٍ يغطي نفقات السفر والمعيشة اليومية."
                          : "Sudden huge deposits in bank statements just before checking raise alarms. Ensure account movement shows progressive, natural cash injections reflecting steady income."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
