import React, { useState } from "react";
import { Compass, Calendar, AlertTriangle, Printer, Sparkles, MapPin, CheckCircle2, Search, ArrowRight, Utensils, HelpCircle } from "lucide-react";
import { Language, ItineraryPlan } from "../types";
import { translations } from "../utils/translations";
import { generateItineraryPDF } from "../utils/pdfGenerator";

const POPULAR_DESTINATIONS = [
  { cityEn: "Rome", cityAr: "روما", countryEn: "Italy", countryAr: "إيطاليا", flag: "🇮🇹" },
  { cityEn: "Venice", cityAr: "البندقية", countryEn: "Italy", countryAr: "إيطاليا", flag: "🇮🇹" },
  { cityEn: "Milan", cityAr: "ميلان", countryEn: "Italy", countryAr: "إيطاليا", flag: "🇮🇹" },
  { cityEn: "Florence", cityAr: "فلورنسا", countryEn: "Italy", countryAr: "إيطاليا", flag: "🇮🇹" },
  { cityEn: "Cairo", cityAr: "القاهرة", countryEn: "Egypt", countryAr: "مصر", flag: "🇪🇬" },
  { cityEn: "Alexandria", cityAr: "الإسكندرية", countryEn: "Egypt", countryAr: "مصر", flag: "🇪🇬" },
  { cityEn: "Luxor", cityAr: "الأقصر", countryEn: "Egypt", countryAr: "مصر", flag: "🇪🇬" },
  { cityEn: "Aswan", cityAr: "أسوان", countryEn: "Egypt", countryAr: "مصر", flag: "🇪🇬" },
  { cityEn: "Sharm El Sheikh", cityAr: "شرم الشيخ", countryEn: "Egypt", countryAr: "مصر", flag: "🇪🇬" },
  { cityEn: "Hurghada", cityAr: "الغردقة", countryEn: "Egypt", countryAr: "مصر", flag: "🇪🇬" },
  { cityEn: "London", cityAr: "لندن", countryEn: "United Kingdom", countryAr: "المملكة المتحدة", flag: "🇬🇧" },
  { cityEn: "Paris", cityAr: "باريس", countryEn: "France", countryAr: "فرنسا", flag: "🇫🇷" },
  { cityEn: "Nice", cityAr: "نيس", countryEn: "France", countryAr: "فرنسا", flag: "🇫🇷" },
  { cityEn: "Riyadh", cityAr: "الرياض", countryEn: "Saudi Arabia", countryAr: "المملكة العربية السعودية", flag: "🇸🇦" },
  { cityEn: "Jeddah", cityAr: "جدة", countryEn: "Saudi Arabia", countryAr: "المملكة العربية السعودية", flag: "🇸🇦" },
  { cityEn: "Mecca", cityAr: "مكة", countryEn: "Saudi Arabia", countryAr: "المملكة العربية السعودية", flag: "🇸🇦" },
  { cityEn: "Medina", cityAr: "المدينة المنورة", countryEn: "Saudi Arabia", countryAr: "المملكة العربية السعودية", flag: "🇸🇦" },
  { cityEn: "Dubai", cityAr: "دبي", countryEn: "United Arab Emirates", countryAr: "الإمارات العربية المتحدة", flag: "🇦🇪" },
  { cityEn: "Abu Dhabi", cityAr: "أبو ظبي", countryEn: "United Arab Emirates", countryAr: "الإمارات العربية المتحدة", flag: "🇦🇪" },
  { cityEn: "Istanbul", cityAr: "إسطنبول", countryEn: "Turkey", countryAr: "تركيا", flag: "🇹🇷" },
  { cityEn: "Antalya", cityAr: "أنطاليا", countryEn: "Turkey", countryAr: "تركيا", flag: "🇹🇷" },
  { cityEn: "Cappadocia", cityAr: "كبادوكيا", countryEn: "Turkey", countryAr: "تركيا", flag: "🇹🇷" },
  { cityEn: "Tokyo", cityAr: "طوكيو", countryEn: "Japan", countryAr: "اليابان", flag: "🇯🇵" },
  { cityEn: "Kyoto", cityAr: "كيوتو", countryEn: "Japan", countryAr: "اليابان", flag: "🇯🇵" },
  { cityEn: "New York", cityAr: "نيويورك", countryEn: "United States", countryAr: "الولايات المتحدة الأمريكية", flag: "🇺🇸" },
  { cityEn: "Los Angeles", cityAr: "لوس أنجلوس", countryEn: "United States", countryAr: "الولايات المتحدة الأمريكية", flag: "🇺🇸" },
  { cityEn: "Madrid", cityAr: "مدريد", countryEn: "Spain", countryAr: "إسبانيا", flag: "🇪🇸" },
  { cityEn: "Barcelona", cityAr: "برشلونة", countryEn: "Spain", countryAr: "إسبانيا", flag: "🇪🇸" },
  { cityEn: "Berlin", cityAr: "برلين", countryEn: "Germany", countryAr: "ألمانيا", flag: "🇩🇪" },
  { cityEn: "Munich", cityAr: "ميونخ", countryEn: "Germany", countryAr: "ألمانيا", flag: "🇩🇪" },
  { cityEn: "Zurich", cityAr: "زيورخ", countryEn: "Switzerland", countryAr: "سويسرا", flag: "🇨🇭" },
  { cityEn: "Geneva", cityAr: "جنيف", countryEn: "Switzerland", countryAr: "سويسرا", flag: "🇨🇭" },
];

interface AIPlannerProps {
  lang: Language;
}

export default function AIPlanner({ lang }: AIPlannerProps) {
  const t = translations[lang];
  const [country, setCountry] = useState("");
  const [duration, setDuration] = useState(3);
  const [isMultiCity, setIsMultiCity] = useState(false);
  const [city1, setCity1] = useState("");
  const [city1Duration, setCity1Duration] = useState(3);
  const [city2, setCity2] = useState("");
  const [city2Duration, setCity2Duration] = useState(3);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [planLanguage, setPlanLanguage] = useState<"en" | "ar">("en");
  const [generatedLang, setGeneratedLang] = useState<"en" | "ar">("en");

  const normalizeArabicText = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[أإآا]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/[ىي]/g, "ي")
      .replace(/[ًٌٍَُِّ]/g, "")
      .trim();
  };

  const stagesEN = [
    "Analyzing regional travel rules & weather reports...",
    "Querying local historical indexes...",
    "Selecting top-tier dining recommendations...",
    "Coordinating timezone schedules down to the second...",
    "Finalizing beautiful PDF layout...",
  ];

  const stagesAR = [
    "تحليل المسافات الجغرافية والطقس لبلد الوجهة...",
    "البحث في الدلائل والمقاصد التاريخية المعتمدة...",
    "انتقاء أفضل المطاعم والوجبات المحلية بعناية...",
    "تنسيق الوقت والجدول الزمني بالثانية والدقيقة لراحتك...",
    "تجهيز المخطط الورقي والملف السياحي للتحميل..."
  ];

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country.trim()) return;
    if (isMultiCity) {
      if (!city1.trim() || !city2.trim()) return;
    }

    setLoading(true);
    setErrorMsg(null);
    setPlan(null);

    const stages = planLanguage === "ar" ? stagesAR : stagesEN;
    let stageIndex = 0;
    setLoadingStage(stages[0]);

    const interval = setInterval(() => {
      stageIndex = (stageIndex + 1) % stages.length;
      setLoadingStage(stages[stageIndex]);
    }, 1200);

    const finalDuration = isMultiCity ? (Number(city1Duration) + Number(city2Duration)) : Number(duration);

    try {
      const resp = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: country.trim(),
          duration: finalDuration,
          language: planLanguage,
          city1: isMultiCity ? city1.trim() : undefined,
          city1Duration: isMultiCity ? Number(city1Duration) : undefined,
          city2: isMultiCity ? city2.trim() : undefined,
          city2Duration: isMultiCity ? Number(city2Duration) : undefined,
        }),
      });

      if (!resp.ok) {
        throw new Error("Failed to contact the tourist scheduler service.");
      }

      const data = (await resp.json()) as ItineraryPlan;
      setPlan(data);
      setGeneratedLang(planLanguage);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        lang === "ar"
          ? "حدث خطأ أثناء تواصلنا بالذكاء الاصطناعي. يرجى مراجعة الاتصال وإعادة المحاولة."
          : "Could not contact AI travel cluster. Please verify network is healthy and try again."
      );
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!plan) return;
    generateItineraryPDF(plan, generatedLang);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Compass className="w-8 h-8 text-primary-100" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{t.plannerHeader}</h1>
            <p className="text-primary-100 text-xs md:text-sm mt-2 max-w-xl leading-relaxed">
              {t.plannerIntro}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Input panel */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <form onSubmit={handleCreatePlan} className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <span>{lang === "ar" ? "أدخل تفاصيل رحلتك" : "Build Itinerary Details"}</span>
            </h3>

            {/* Country Destination */}
            <div className="space-y-3 relative">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {t.labelCountry}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={country}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder={t.placeholderCountry}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all text-slate-800"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                (() => {
                  const normalizedValue = normalizeArabicText(country);
                  const matched = country.trim() ? POPULAR_DESTINATIONS.filter(item => 
                    normalizeArabicText(item.cityEn).includes(normalizedValue) ||
                    normalizeArabicText(item.cityAr).includes(normalizedValue) ||
                    normalizeArabicText(item.countryEn).includes(normalizedValue) ||
                    normalizeArabicText(item.countryAr).includes(normalizedValue)
                  ).slice(0, 8) : [];

                  if (matched.length === 0) return null;

                  return (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-50 scrollbar-thin">
                      {matched.map((item, idx) => {
                        const label = lang === "ar" 
                          ? `${item.cityAr}، ${item.countryAr}` 
                          : `${item.cityEn}, ${item.countryEn}`;
                        return (
                          <div
                            key={idx}
                            onMouseDown={() => {
                              setCountry(label);
                              setShowSuggestions(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors text-sm text-slate-700 font-medium"
                          >
                            <span className="text-lg">{item.flag}</span>
                            <div className="flex-1">
                              <span className="font-bold text-slate-800">
                                {lang === "ar" ? item.cityAr : item.cityEn}
                              </span>
                              <span className="text-xs text-slate-400 mx-1.5">•</span>
                              <span className="text-xs text-slate-500">
                                {lang === "ar" ? item.countryAr : item.countryEn}
                              </span>
                            </div>
                            <span className="text-[10px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full font-bold">
                              {lang === "ar" ? "اختر" : "Select"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}

              {/* Popular quick-tap recommendations panel */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {lang === "ar" ? "وجهات مقترحة سريعة:" : "Recommended shortcuts:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { nameEn: "Rome, Italy", nameAr: "روما، إيطاليا", display: "🇮🇹 Rome / روما" },
                    { nameEn: "Cairo, Egypt", nameAr: "القاهرة، مصر", display: "🇪🇬 Cairo / القاهرة" },
                    { nameEn: "London, UK", nameAr: "لندن، بريطانيا", display: "🇬🇧 London / لندن" },
                    { nameEn: "Paris, France", nameAr: "باريس، فرنسا", display: "🇫🇷 Paris / باريس" }
                  ].map((shortcut, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => {
                        const dest = lang === "ar" ? shortcut.nameAr : shortcut.nameEn;
                        setCountry(dest);
                      }}
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-100 border border-slate-200 text-slate-600 transition-all cursor-pointer"
                    >
                      {shortcut.display}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trip Type Switcher */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {lang === "ar" ? "نوع الرحلة" : "Trip Type"}
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsMultiCity(false)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    !isMultiCity
                      ? "bg-white text-primary-700 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {lang === "ar" ? "مدينة واحدة" : "Single Destination"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMultiCity(true)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isMultiCity
                      ? "bg-white text-primary-700 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {lang === "ar" ? "تقسيم لمدينتين" : "Two-City Split"}
                </button>
              </div>
            </div>

            {!isMultiCity ? (
              /* Duration Days slider */
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {t.labelDuration}
                  </label>
                  <span className="text-sm font-extrabold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full font-mono">
                    {duration} {lang === "ar" ? "أيام" : "Days"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono px-1">
                  <span>1 D</span>
                  <span>3 D</span>
                  <span>5 D</span>
                  <span>7 D</span>
                  <span>10 D</span>
                  <span>14 D</span>
                </div>
              </div>
            ) : (
              <div className="space-y-5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                {/* Total Duration Info */}
                <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
                  <span className="text-xs font-bold text-slate-500">
                    {lang === "ar" ? "إجمالي أيام الرحلة:" : "Total Trip Duration:"}
                  </span>
                  <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full font-mono">
                    {Number(city1Duration) + Number(city2Duration)} {lang === "ar" ? "أيام" : "Days"}
                  </span>
                </div>

                {/* City 1 Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {lang === "ar" ? "📍 المدينة الأولى" : "📍 First City"}
                  </label>
                  <input
                    type="text"
                    required
                    value={city1}
                    onChange={(e) => setCity1(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: روما" : "E.g. Rome"}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800"
                  />
                  
                  {/* City 1 Duration slider */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>{lang === "ar" ? "مدة الإقامة الأولى:" : "Stay duration:"}</span>
                      <span className="text-primary-600 font-bold">{city1Duration} {lang === "ar" ? "أيام" : "Days"}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={city1Duration}
                      onChange={(e) => setCity1Duration(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                </div>

                {/* City 2 Input */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {lang === "ar" ? "📍 المدينة الثانية" : "📍 Second City"}
                  </label>
                  <input
                    type="text"
                    required
                    value={city2}
                    onChange={(e) => setCity2(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: فينيسيا (البندقية)" : "E.g. Venice"}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 text-slate-800"
                  />
                  
                  {/* City 2 Duration slider */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>{lang === "ar" ? "مدة الإقامة الثانية:" : "Stay duration:"}</span>
                      <span className="text-primary-600 font-bold">{city2Duration} {lang === "ar" ? "أيام" : "Days"}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={city2Duration}
                      onChange={(e) => setCity2Duration(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Plan Language Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {lang === "ar" ? "لغة تفاصيل المخطط" : "Itinerary Language"}
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPlanLanguage("en")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    planLanguage === "en"
                      ? "bg-white text-primary-700 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🇬🇧 English ({lang === "ar" ? "الإنجليزية" : "English"})
                </button>
                <button
                  type="button"
                  onClick={() => setPlanLanguage("ar")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    planLanguage === "ar"
                      ? "bg-white text-primary-700 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🇸🇦 العربية ({lang === "ar" ? "العربية" : "Arabic"})
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                {lang === "ar"
                  ? "💡 ننصح باللغة الإنجليزية حتى تظهر أسماء الأماكن والمزارات والمطاعم بشكل دقيق ومفهوم عالمياً."
                  : "💡 We recommend English for highly realistic landmarks and street names worldwide."}
              </p>
            </div>

            {/* Trigger Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">{t.btnGenerating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">{t.btnGeneratePlanner}</span>
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2 font-medium">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Display Panel */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm space-y-6 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
                <Compass className="w-8 h-8 text-primary-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-slate-800 font-extrabold text-base md:text-lg">
                  {lang === "ar" ? "جاري نسج خطتكم الموثوقة..." : "Drafting Your World-Class Itinerary..."}
                </p>
                <p className="text-slate-400 text-xs md:text-sm font-medium animate-pulse">
                  {loadingStage}
                </p>
              </div>
            </div>
          )}

          {!loading && !plan && (
            <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <Compass className="w-14 h-14 text-slate-300 stroke-1 mb-4" />
              <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed">
                {lang === "ar"
                  ? "بلد سياحي رائع في بالك؟ ضع البلد واستخرج برنامج سياحي مفصل بالثانية فورا!"
                  : "Have a dream tourism country in mind? Enter it on the left panel to output a precise hour-by-hour calendar!"}
              </p>
            </div>
          )}

          {!loading && plan && (
            <div className="space-y-6 animate-fade-in">
              {/* Plan Header Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                      {plan.duration} {generatedLang === "ar" ? "أيام سياحية متكاملة" : "Days Coordinated Itinerary"}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-2">
                      {plan.country.toUpperCase()}
                    </h2>
                  </div>
                  
                  <button
                    onClick={handleDownloadPDF}
                    id="btn-dl-plan-pdf"
                    className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-sm transition-all shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t.btnDownloadPdf}</span>
                  </button>
                </div>

                {/* Synopsis */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-primary-600" />
                    <span>{generatedLang === "ar" ? "ملخص الوجهة السياحية" : "Destination Synopsis"}</span>
                  </h4>
                  <p className={`text-sm md:text-base text-slate-600 leading-relaxed font-medium ${generatedLang === "ar" ? "text-right" : "text-left"}`}>
                    {plan.overview}
                  </p>
                </div>
              </div>

              {/* Day-by-day itinerary listing */}
              <div className="space-y-6">
                <h3 className="text-lg font-extrabold text-slate-800 px-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span>{generatedLang === "ar" ? "جدول الأنشطة اليومية بالتفصيل" : "Tour Timeline"}</span>
                </h3>

                {plan.days.map((day) => (
                  <div key={day.dayNumber} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    {/* Day Title Block */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full font-mono">
                        {generatedLang === "ar" ? `اليوم ${day.dayNumber}` : `Day ${day.dayNumber}`}
                      </span>
                      <h4 className={`text-sm md:text-base font-bold text-slate-800 ${generatedLang === "ar" ? "text-right" : "text-left"}`}>
                        {day.title}
                      </h4>
                    </div>

                    {/* Timeline items */}
                    <div className="p-6 space-y-6">
                      <div className={`relative space-y-6 ${generatedLang === "ar" ? "border-r-2 border-primary-100 pr-6 mr-2 text-right" : "border-l-2 border-primary-100 pl-6 ml-2 text-left"}`} style={{ direction: generatedLang === "ar" ? "rtl" : "ltr" }}>
                        {day.activities.map((act, actIdx) => (
                          <div key={actIdx} className="relative group">
                            {/* Marker dot */}
                            <div className={`absolute top-1 w-4 h-4 rounded-full border-2 border-primary-600 bg-white group-hover:bg-primary-600 transition-colors ${generatedLang === "ar" ? "-right-[33px]" : "-left-[33px]"}`}></div>
                            
                            <div className="space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-xs font-bold text-primary-600 font-mono tracking-wide bg-primary-50 px-2 py-0.5 rounded-md w-fit">
                                  {act.time}
                                </span>
                                <span className="text-xs font-semibold text-slate-400">
                                  {act.location}
                                </span>
                              </div>
                              <h5 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
                                {act.title}
                              </h5>
                              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                                {act.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dining section for day */}
                      {day.restaurants && day.restaurants.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-50 bg-slate-50/50 -mx-6 -mb-6 p-6">
                          <h6 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                            <Utensils className="w-4 h-4 text-primary-600" />
                            <span>{generatedLang === "ar" ? "ترشيحات المطاعم والوجبات المحلية" : "Curated Dining Places"}</span>
                          </h6>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {day.restaurants.map((rest, rIdx) => (
                              <div key={rIdx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-bold text-slate-800">{rest.name}</span>
                                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                                    {rest.type}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed italic pt-1">
                                  <span className="font-bold text-primary-600">{generatedLang === "ar" ? "الطبق المميز: " : "Must Try: "} </span>
                                  {rest.tip}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Essential Tips */}
              {plan.essentialTips && plan.essentialTips.length > 0 && (
                <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary-600" />
                    <span>{generatedLang === "ar" ? "أهم النصائح الإرشادية واللوائح التنظيمية للبلد" : "Essential Regional Guidelines & Travel Tips"}</span>
                  </h3>
                  
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.essentialTips.map((tip, index) => (
                      <li key={index} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0 font-mono">
                          {index + 1}
                        </span>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold">
                          {tip}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
