import React, { useState } from "react";
import { Landmark, Ticket, HelpCircle, MapPin, Sparkles, Printer, Search, Calendar, ChevronRight, ArrowUpRight, Award, CheckCircle2, User, Compass, Users, Briefcase } from "lucide-react";
import { Language, MuseumEventsData, MuseumItem } from "../types";
import { translations } from "../utils/translations";
import { generateMuseumPassPDF } from "../utils/pdfGenerator";

const GLOBAL_PLATFORMS = [
  {
    id: "whichmuseum",
    nameEn: "WhichMuseum Free Admission Guide",
    nameAr: "دليل المتاحف - WhichMuseum",
    costEn: "Museum Entry Finder",
    costAr: "دليل تذاكر المتاحف المجانية",
    categoryEn: "Free Tickets",
    categoryAr: "متاحف وتذاكر",
    descEn: "Locate entirely free museums, zero-cost days, and pass waivers in global capitals.",
    descAr: "اضغط للبحث عن المتاحف المجانية تماماً بالمدن العالمية وأيام الدخول المفتوح للجمهور وساعات الإعفاء.",
    url: "https://whichmuseum.com/place/europe-18287/free",
    iconName: "Landmark",
    iconClass: "bg-rose-100 text-rose-600 border border-rose-200/50",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-100",
    actionEn: "Search Free Museums",
    actionAr: "تصفح متاحف أوروبا والوجهات"
  },
  {
    id: "sandemans",
    nameEn: "Sandemans New Europe Tours",
    nameAr: "جولات سانديمانز - Sandemans",
    costEn: "Free Walking Tours",
    costAr: "جولات مشي ممتازة بالمرشد",
    categoryEn: "Guided Tours",
    categoryAr: "جولات بالمرشد",
    descEn: "The premier network for booking free walking tours across major European cities with certified guides.",
    descAr: "احجز جولتك المروية الممتعة لتستكشف أهم معالم وسط البلد والقصص التراثية بصحبة مرشدين متميزين.",
    url: "https://www.neweuropetours.eu/budapest-walking-tours/",
    iconName: "Compass",
    iconClass: "bg-emerald-100 text-emerald-600 border border-emerald-200/50",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-100",
    actionEn: "Book Free City Tour",
    actionAr: "حجز جولة سانديمانز للمشي"
  },
  {
    id: "guruwalk",
    nameEn: "GuruWalk Volunteer Guides",
    nameAr: "جولات الدليل الحر - GuruWalk",
    costEn: "Local Volunteer Walk",
    costAr: "مرشد محلي سياحي متطوع",
    categoryEn: "Volunteer Tours",
    categoryAr: "مرشدون محليون",
    descEn: "Universal marketplace for pay-what-you-wish walking tours with native guides in 100+ countries.",
    descAr: "جولات مخصصة وتجول بالهواء الطلق مع سكان محليين ومرشدين في كافة ربوع العالم ومختلف الدول لميزانيتك.",
    url: "https://www.guruwalk.com/?ref=wsx1xymxspth05suq3y3&ref_campaign=15312872088__home__en_free-walking-tour_130357236656_pf00&ref=wsx1xymxspth05suq3y3&pf=pf00&cid=15312872088&pid=&stg=home&pl=&lg=en&ag=free-walking-tour&agid=130357236656&loc=9063015&gad_source=1&gad_campaignid=15312872088&gbraid=0AAAAADMAfcU3xcG2_npvJZDAfI9Kd7a6q&gclid=CjwKCAjwrNrQBhBjEiwAoR4VO5lJFKMkMRDWiYiqJscG0FmADLxVKNumSRTXvti5wR3G76b4_9nHuRoCz8sQAvD_BwE",
    iconName: "Users",
    iconClass: "bg-amber-100 text-amber-600 border border-amber-200/50",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-100",
    actionEn: "Explore GuruWalk Guides",
    actionAr: "حجز جولة محلية مجانية"
  },
  {
    id: "eventbrite",
    nameEn: "Eventbrite Concerts & Shows",
    nameAr: "الفعاليات والحفلات - Eventbrite",
    costEn: "Local Community Shows",
    costAr: "حفلات غنائية وايفنتات حية",
    categoryEn: "Live Shows",
    categoryAr: "كرنفالات وموسيقى",
    descEn: "Find active live concerts, localized festivals, free meetups, and open-mic gatherings in your town.",
    descAr: "المنصة الرائدة دولياً لاستعراض تذاكر الأنشطة الفنية والعروض والمهرجانات الحية والتجمعات الاجتماعية.",
    url: "https://www.eventbrite.com/",
    iconName: "Sparkles",
    iconClass: "bg-orange-100 text-orange-600 border border-orange-200/50",
    badgeClass: "bg-orange-50 text-orange-800 border-orange-100",
    actionEn: "Search Eventbrite Events",
    actionAr: "معاينة الفعاليات والحفلات"
  },
  {
    id: "eventseye",
    nameEn: "EventsEye Trade Exhibitions",
    nameAr: "معارض الأعمال والبزنس - EventsEye",
    costEn: "Global Business Expo",
    costAr: "معارض تجارية للمستثمرين وبزنس",
    categoryEn: "Business Summit",
    categoryAr: "معارض وإكسبو",
    descEn: "Direct access to the primary listing directory for global trade fairs, commercial expos, and conventions.",
    descAr: "تصفح أجندة معارض التجارة والأعمال، المعارض الفنية والمهنية الكبرى في أي مدينة بالعالم مجاناً.",
    url: "https://www.eventseye.com/",
    iconName: "Briefcase",
    iconClass: "bg-indigo-100 text-indigo-600 border border-indigo-200/50",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-100",
    actionEn: "View Trade Fairs List",
    actionAr: "تصفح معارض الأعمال الدولية"
  }
];

const getIconComponent = (name: string) => {
  switch (name) {
    case "Landmark": return <Landmark className="w-5 h-5 flex-shrink-0" />;
    case "Compass": return <Compass className="w-5 h-5 flex-shrink-0" />;
    case "Users": return <Users className="w-5 h-5 flex-shrink-0" />;
    case "Sparkles": return <Sparkles className="w-5 h-5 flex-shrink-0" />;
    case "Briefcase": return <Briefcase className="w-5 h-5 flex-shrink-0" />;
    default: return <Ticket className="w-5 h-5 flex-shrink-0" />;
  }
};

interface MuseumEventsProps {
  lang: Language;
}

export default function MuseumEvents({ lang }: MuseumEventsProps) {
  const t = translations[lang];
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MuseumEventsData | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"museums" | "platforms" | "events" | "pass">("museums");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for the Museum Free Pass builder
  const [visitorName, setVisitorName] = useState("");
  const [visitorPassport, setVisitorPassport] = useState("");
  const [selectedMuseum, setSelectedMuseum] = useState("");
  const [visitDate, setVisitDate] = useState("2026-06-15");
  const [visitTime, setVisitTime] = useState("Morning (10:00 AM - 01:00 PM)");

  const renderGlobalPlatformsGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {GLOBAL_PLATFORMS.map((plat) => {
          const isAr = lang === "ar";
          return (
            <div
              key={plat.id}
              className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                {/* Visual Header Fusing Icon and Tag on it */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2.5 rounded-xl ${plat.iconClass} flex items-center justify-center transition-transform hover:scale-105`}>
                      {getIconComponent(plat.iconName)}
                    </div>
                    {/* Brand Name */}
                    <span className="text-xs font-black text-slate-800 tracking-tight">
                      {isAr ? plat.nameAr.split(" - ")[1] : plat.nameEn.split(" Platform")[0].split(" Elite")[0].split(" Festive")[0]}
                    </span>
                  </div>
                  
                  {/* Fused label pill */}
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${plat.badgeClass}`}>
                    {isAr ? plat.costAr : plat.costEn}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-800">
                    {isAr ? plat.nameAr : plat.nameEn}
                  </h4>
                  <p className="text-slate-550 text-xs leading-relaxed font-semibold">
                    {isAr ? plat.descAr : plat.descEn}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-50">
                <a
                  href={plat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-slate-50 hover:bg-rose-50 border border-slate-200/50 hover:border-rose-200 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  <span>{isAr ? plat.actionAr : plat.actionEn}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleSearchCulture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setData(null);

    try {
      const resp = await fetch("/api/get-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: country.trim(),
          city: city.trim() || undefined,
          language: lang,
        }),
      });

      if (!resp.ok) {
        throw new Error("Could not contact the cultural ticketing database.");
      }

      const responseData = (await resp.json()) as MuseumEventsData;
      setData(responseData);
      
      // Select first museum for the Pass generator by default
      if (responseData.museums && responseData.museums.length > 0) {
        setSelectedMuseum(responseData.museums[0].name);
      }
      setActiveSubTab("museums");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        lang === "ar"
          ? "لم نتمكن من إتمام البحث الاستكشافي المتاح للمتاحف والفعاليات. يرجى مراجعة اتصال الشبكة."
          : "Failure establishing handshake with community events cluster. Please verify network health."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrintFreePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPassport.trim() || !selectedMuseum) return;

    const payload = {
      name: visitorName,
      passport: visitorPassport,
      visitDate: visitDate,
      visitTime: visitTime,
    };

    generateMuseumPassPDF(selectedMuseum, payload, lang);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-br from-rose-600 to-red-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Landmark className="w-8 h-8 text-rose-100" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{t.museumHeader}</h1>
            <p className="text-rose-100 text-xs md:text-sm mt-2 max-w-xl leading-relaxed">
              {t.museumIntro}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Input parameters panel */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-rose-600" />
            <span>{lang === "ar" ? "تحديد النطاق الجغرافي" : "Filter Coords"}</span>
          </h3>

          <form onSubmit={handleSearchCulture} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {t.labelCountry}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t.placeholderCountry}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {t.labelCity}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t.placeholderCity}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">{lang === "ar" ? "جاري المسح الثقافي..." : "Mining Local registries..."}</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span className="text-sm">{t.btnGetMuseumEvents}</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-start gap-2">
              <span className="text-red-600 flex-shrink-0">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Display results */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm space-y-6 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-rose-50 border-t-rose-600 rounded-full animate-spin"></div>
                <Landmark className="w-8 h-8 text-rose-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2 max-w-sm">
                <p className="text-slate-800 font-extrabold text-base md:text-lg">
                  {lang === "ar" ? "جاري مطابقة المتاحف وحيل الحجز المجاني..." : "Analyzing cultural exemption directories..."}
                </p>
                <p className="text-slate-400 text-xs font-medium animate-pulse">
                  {lang === "ar" ? "البحث في Eventbrite و Meetup ومستودعات المتاحف الوطنية..." : "Scanning Eventbrite, local councils, and national heritage databases..."}
                </p>
              </div>
            </div>
          )}

          {!loading && !data && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center">
                <Ticket className="w-12 h-12 text-slate-300 stroke-1 mb-3" />
                <p className="text-slate-500 text-xs sm:text-sm max-w-[420px] leading-relaxed font-semibold">
                  {lang === "ar"
                    ? "أدخل الدولة والمدينة على اليمين للبحث الثقافي الدقيق وحيل الحجز المجاني، أو استكشف المنصات العالمية المباشرة بالأسفل!"
                    : "Insert target city and country to search free museum entries and local cultural passes, or explore direct global directories below!"}
                </p>
              </div>

              {/* Verified platforms grid - Always visible before search */}
              <div className="space-y-4">
                <div className="border-l-4 border-rose-600 pl-3 rtl:border-l-0 rtl:border-r-4 rtl:pr-3 py-1">
                  <h3 className="text-sm font-extrabold text-slate-800">
                    {lang === "ar" ? "المنصات العالمية الشريكة والموثوقة للتذاكر والجولات" : "Verified International Platforms for Free Tickets & Guided Tours"}
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">
                    {lang === "ar" ? "أهم البوابات الموثوقة لحجز متاحف مجانية، جولات مشي مع مرشدين بامتياز، ومعارض أعمال" : "Direct verified platforms to locate zero-cost museum hours, join voluntary walking guides and business expos"}
                  </p>
                </div>
                
                {renderGlobalPlatformsGrid()}
              </div>
            </div>
          )}

          {!loading && data && (
            <div className="space-y-6 animate-fade-in">
              {/* Category selector pills */}
              <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                <button
                  onClick={() => setActiveSubTab("museums")}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
                    activeSubTab === "museums" ? "bg-rose-50 text-rose-700 shadow-sm" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t.tabFreeMuseums}
                </button>
                <button
                  onClick={() => setActiveSubTab("platforms")}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
                    activeSubTab === "platforms" ? "bg-rose-50 text-rose-700 shadow-sm" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t.tabFreePlatforms}
                </button>
                <button
                  onClick={() => setActiveSubTab("events")}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
                    activeSubTab === "events" ? "bg-rose-50 text-rose-700 shadow-sm" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t.tabFreeEvents}
                </button>
                <button
                  onClick={() => setActiveSubTab("pass")}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
                    activeSubTab === "pass" ? "bg-rose-50 text-rose-700 shadow-sm" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t.tabPrintMuseumPass}
                </button>
              </div>

              {/* Sub-tab 1: Museums admission guidance */}
              {activeSubTab === "museums" && (
                <div className="space-y-4">
                  {data.museums.map((mus, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-extrabold bg-rose-50 text-rose-700 px-3 py-1 rounded-full">
                            {mus.ticketType}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-slate-800 mt-2">
                            {mus.name}
                          </h4>
                          <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-1 font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{mus.location}</span>
                          </p>
                        </div>
                        <Award className="w-8 h-8 text-rose-600 bg-rose-50 p-1.5 rounded-xl flex-shrink-0" />
                      </div>

                      <div className="pt-3 border-t border-slate-50 space-y-2">
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {t.howToBook}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                          {mus.bookingGuide}
                        </p>
                      </div>

                      {mus.officialSite && (
                        <div className="pt-2 flex items-center gap-1 text-xs text-rose-600 font-bold hover:underline cursor-pointer">
                          <span>{t.officialWeb}</span>
                          <a href={mus.officialSite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5">
                            <span>{mus.officialSite.replace("https://", "")}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-tab 2: Platforms Eventbrite/Meetup guidelines */}
              {activeSubTab === "platforms" && (
                <div className="space-y-8">
                  {/* Global Platforms Segment */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-rose-600 pl-3 rtl:border-l-0 rtl:border-r-4 rtl:pr-3 py-1">
                      <h4 className="text-sm md:text-base font-extrabold text-slate-800">
                        {lang === "ar" ? "المنصات العالمية الشريكة والموثوقة للتذاكر والجولات" : "Verified Global Channels for Direct Tickets & Free Tours"}
                      </h4>
                      <p className="text-slate-400 text-xs font-semibold mt-0.5">
                        {lang === "ar" ? "أهم المواقع المعترف بها دولياً لحجز المتاحف مجاناً وجولات المشي مع مرشدين سياحيين" : "World-leading direct entry desks for museum admission waivers, walking guides and exhibitions"}
                      </p>
                    </div>
                    {renderGlobalPlatformsGrid()}
                  </div>

                  {/* Local Platforms Segment from search */}
                  {data.eventsPlatforms && data.eventsPlatforms.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <div className="border-l-4 border-slate-800 pl-3 rtl:border-l-0 rtl:border-r-4 rtl:pr-3 py-1">
                        <h4 className="text-sm md:text-base font-extrabold text-slate-800">
                          {lang === "ar" 
                            ? `توصيات ومعايير البحث المخصصة لوجهتك (${data.city || data.country})` 
                            : `Localized Filtering Guidelines for Your Destination (${data.city || data.country})`}
                        </h4>
                        <p className="text-slate-400 text-xs font-semibold mt-0.5">
                          {lang === "ar" ? "خطوات فلترة وعرض الأنشطة مجاتاً في المجموعات البلدية المحلية" : "Steps to locate free community listings and council gatherings for this specific zone"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.eventsPlatforms.map((plat, idx) => (
                          <div key={idx} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                              <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold font-sans">
                                {plat.platform}
                              </span>
                              <h5 className="text-sm md:text-base font-extrabold text-slate-800">
                                {lang === "ar" ? `الحصول على فعاليات من ${plat.platform}` : `Free Community coordination via ${plat.platform}`}
                              </h5>
                              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                                {plat.guide}
                              </p>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-black text-slate-800">
                              <span>{t.howToFilter}</span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 3: Seasonal culture & town events */}
              {activeSubTab === "events" && (
                <div className="space-y-4">
                  {data.upcomingLocalEvents.map((evt, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-start gap-4">
                      <div className="p-3 bg-red-50 rounded-2xl text-rose-600 font-bold text-xs uppercase text-center w-24 flex-shrink-0">
                        <Calendar className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-[9px] block tracking-wide">{evt.monthOrSeason}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">{evt.title}</h4>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{evt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-tab 4: Print Custom museum pass tool */}
              {activeSubTab === "pass" && (
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{t.museumPassFormTitle}</h4>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-1">
                      {t.museumPassFormDesc}
                    </p>
                  </div>

                  <form onSubmit={handlePrintFreePass} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Visitor Name */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {t.visitorNameLabel}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          required
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          placeholder="e.g., AHMED SAYED"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Visitor Passport */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {t.visitorPassportLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={visitorPassport}
                        onChange={(e) => setVisitorPassport(e.target.value)}
                        placeholder="e.g., A10204050"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all text-slate-800"
                      />
                    </div>

                    {/* Choose Museum dropdown */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {t.museumNameLabel}
                      </label>
                      <select
                        value={selectedMuseum}
                        onChange={(e) => setSelectedMuseum(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all text-slate-800"
                      >
                        {data.museums.map((mus, mIdx) => (
                          <option key={mIdx} value={mus.name}>
                            {mus.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Estimated Visit Date */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {t.visitDateLabel}
                      </label>
                      <input
                        type="date"
                        required
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all text-slate-800 font-mono"
                      />
                    </div>

                    {/* Selected period slot */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {t.visitTimeLabel}
                      </label>
                      <select
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all text-slate-800"
                      >
                        <option value="Morning Hours (09:00 AM - 12:00 PM)">Morning Hours (09:00 AM - 12:00 PM)</option>
                        <option value="Noon Slots (12:00 PM - 03:00 PM)">Noon Slots (12:00 PM - 03:00 PM)</option>
                        <option value="Afternoon Slump (03:00 PM - 06:00 PM)">Afternoon Slump (03:00 PM - 06:00 PM)</option>
                        <option value="Evening VIP Window (06:00 PM - 08:00 PM)">Evening VIP Window (06:00 PM - 08:00 PM)</option>
                      </select>
                    </div>

                    {/* Submit printing */}
                    <div className="md:col-span-2 pt-2">
                      <button
                        type="submit"
                        className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <Printer className="w-5 h-5" />
                        <span>{t.btnPrintMuseumPass}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
