import React, { useState, useEffect } from "react";
import { Compass, Landmark, Plane, BedDouble, Globe, Smartphone, HelpCircle, ShieldCheck } from "lucide-react";
import { Language } from "./types";
import { translations } from "./utils/translations";

// Subcomponents
import AIPlanner from "./components/AIPlanner";
import MuseumEvents from "./components/MuseumEvents";
import FlightBooking from "./components/FlightBooking";
import HotelBooking from "./components/HotelBooking";
import SchengenTracker from "./components/SchengenTracker";

export default function App() {
  const [lang, setLang] = useState<Language>("ar"); // Default to Arabic as requested by user
  const [activeTab, setActiveTab] = useState<"planner" | "museums" | "flights" | "hotels" | "schengen">("planner");
  const [aiInitialized, setAiInitialized] = useState<boolean>(true); // Default to true to prevent screen flash
  
  // Update document direction dynamically based on selected language
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  // Query server-side AI initialization status upon mount
  useEffect(() => {
    fetch("/api/ai-status")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setAiInitialized(!!data.initialized);
      })
      .catch(() => {
        setAiInitialized(false);
      });
  }, []);

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-all duration-300 pb-16">
      {/* Dynamic Alert if GEMINI_API_KEY is missing (checked dynamically via secure backend state) */}
      {!aiInitialized && (
        <div className="bg-amber-500 text-white font-semibold text-center py-2 px-4 text-xs flex justify-center items-center gap-2">
          <span>⚠️</span>
          <span>{t.alertMissingAi}</span>
        </div>
      )}

      {/* Main Top Header Strip */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center gap-4">
          {/* Logo & title block */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-sm transform hover:rotate-12 transition-transform cursor-pointer">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-none">
                {t.title}
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400 font-semibold mt-1">
                {lang === "ar" ? "برنامج سياحة متكامل بكافة اللغات" : "Ultimate Complete Tourism Package"}
              </p>
            </div>
          </div>

          {/* Quick Language switcher button */}
          <div className="flex items-center gap-2">
            <button
              id="language-toggle-btn"
              onClick={() => setLang((prev) => (prev === "ar" ? "en" : "ar"))}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Globe className="w-4 h-4 text-primary-600" />
              <span>{lang === "ar" ? "English (LTR)" : "العربية (RTL)"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Welcome Block with Tabs Navigator */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 flex-1">
        
        {/* Intro Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
            {lang === "ar" ? "أهلاً بك في جناح السفر رفيقك الدائم" : "Your Borderless International Travel Companion"}
          </h2>
          <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Dashboard Core Tab selections navigation */}
        <div className="flex flex-wrap md:flex-nowrap justify-center gap-2 bg-white border border-slate-100 p-2 rounded-2xl md:rounded-3xl max-w-4xl mx-auto shadow-sm">
          {/* Tab 1: AI Travel planner */}
          <button
            onClick={() => setActiveTab("planner")}
            id="tab-planner"
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === "planner"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t.navPlanner}</span>
          </button>

          {/* Tab 2: Free Museums events */}
          <button
            onClick={() => setActiveTab("museums")}
            id="tab-museums"
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === "museums"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-rose-600"
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>{t.navMuseums}</span>
          </button>

          {/* Tab 3: Flight simulated reservations */}
          <button
            onClick={() => setActiveTab("flights")}
            id="tab-flights"
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === "flights"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>{t.navFlights}</span>
          </button>

          {/* Tab 4: Hotel Reservations Vouchers */}
          <button
            onClick={() => setActiveTab("hotels")}
            id="tab-hotels"
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === "hotels"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>{t.navHotels}</span>
          </button>

          {/* Tab 5: Schengen Visa Tracker */}
          <button
            onClick={() => setActiveTab("schengen")}
            id="tab-schengen"
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === "schengen"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.navSchengen}</span>
          </button>
        </div>

        {/* Selected Active Component View Area */}
        <div className={
          activeTab === "schengen"
            ? "bg-[#090C15] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[750px]"
            : "bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm min-h-[500px]"
        }>
          {activeTab === "planner" && <AIPlanner lang={lang} />}
          {activeTab === "museums" && <MuseumEvents lang={lang} />}
          {activeTab === "flights" && <FlightBooking lang={lang} />}
          {activeTab === "hotels" && <HotelBooking lang={lang} />}
          {activeTab === "schengen" && <SchengenTracker lang={lang} onBack={() => setActiveTab("planner")} />}
        </div>

      </main>

      {/* Small Elegant Footer */}
      <footer className="mt-16 text-center text-xs text-slate-400 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-6">
        <p>© 2026 Go with Ahmed Coordinated Travel Systems. All dummy boarding passes, ticket PDFs, and hotel vouchers are intended for travel visualization and verification simulation only.</p>
      </footer>
    </div>
  );
}
