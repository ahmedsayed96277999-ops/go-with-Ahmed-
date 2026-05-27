import React, { useState } from "react";
import { Landmark, Ticket, HelpCircle, MapPin, Sparkles, Printer, Search, Calendar, ChevronRight, ArrowUpRight, Award, CheckCircle2, User } from "lucide-react";
import { Language, MuseumEventsData, MuseumItem } from "../types";
import { translations } from "../utils/translations";
import { generateMuseumPassPDF } from "../utils/pdfGenerator";

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
            <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <Ticket className="w-14 h-14 text-slate-300 stroke-1 mb-4" />
              <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed">
                {lang === "ar"
                  ? "أدخل الدولة والمدينة للتعرف على أوقات الدخول المجاني للمتاحف، ايفنت برايت، واستخراج تذكرتك المجانية!"
                  : "Insert target city and country on the explorer column to search free entries and local cultural passes!"}
              </p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.eventsPlatforms.map((plat, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold font-sans">
                          {plat.platform}
                        </span>
                        <h4 className="text-sm md:text-base font-extrabold text-slate-800">
                          {lang === "ar" ? `الحصول على فعاليات من ${plat.platform}` : `Free Community coordination via ${plat.platform}`}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                          {plat.guide}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{t.howToFilter}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
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
