import React, { useState, useEffect } from "react";
import { Compass, Landmark, Plane, BedDouble, Globe, HelpCircle, ShieldCheck, ArrowLeft, ArrowRight, Home, Sun, Moon, Sparkles, Volume2, VolumeX } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"planner" | "museums" | "flights" | "hotels" | "schengen" | "dashboard">("dashboard");
  const [aiInitialized, setAiInitialized] = useState<boolean>(true); // Default to true to prevent screen flash
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("gwa_theme");
    return (saved as "dark" | "light") || "dark";
  });
  
  // Local Sound preference state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("gwa_sound_enabled");
    return saved !== "false"; // Defaults to true
  });

  // Splash screen onboarding
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [splashFadeOut, setSplashFadeOut] = useState<boolean>(false);

  // Update document direction dynamically based on selected language
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  // Scroll to absolute top immediately when changing active sub-app tab so cards or promotional banner appear from the topmost pixel!
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Sync state to localStorage & window global for other components
  useEffect(() => {
    localStorage.setItem("gwa_sound_enabled", soundEnabled ? "true" : "false");
    (window as any).gwaSoundEnabled = soundEnabled;
  }, [soundEnabled]);

  // Command dynamic haptic button micro-tap click sound
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Clean, elegant high-end Digital Click
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      // Very fast, crisp frequency chirp starting high at 2200Hz falling rapidly to 400Hz represents a beautiful modern digital selector tap
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

      gainNode.gain.setValueAtTime(0, now);
      // Perfect peak amplitude for amazing audibility without being harsh or annoying
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);

      // Subtle high-frequency digital secondary click sparkle
      const tick = ctx.createOscillator();
      const tickGain = ctx.createGain();
      tick.type = "triangle";
      tick.frequency.setValueAtTime(4500, now + 0.002);
      tickGain.gain.setValueAtTime(0, now + 0.002);
      tickGain.gain.linearRampToValueAtTime(0.12, now + 0.003);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
      
      tick.connect(tickGain);
      tickGain.connect(ctx.destination);
      tick.start(now + 0.002);
      tick.stop(now + 0.015);
    } catch (e) {
      console.warn(e);
    }
  };

  // Bind key methods globally to window so sibling/child files like Hotels/Schengen can leverage them instantly!
  useEffect(() => {
    (window as any).gwaPlayClick = playClickSound;
  }, [soundEnabled]);

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

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("gwa_theme", next);
    playClickSound();
  };

  // Cinematic Romantic Synthesizer Fanfare / Calm peaceful celestial intro
  const triggerWelcomeEntrance = () => {
    if (soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const now = ctx.currentTime;

          // Extremely soft, quiet, and romantic ambient chord swell (warm velvet cinematic entry)
          const playNote = (freq: number, type: OscillatorType, delay: number, dur: number, peakVal: number, attack: number = 0.8) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now + delay);
            
            gainNode.gain.setValueAtTime(0, now + delay);
            // Ultra-slow, premium smooth fade-in to feel exceptionally gentle and eye/ear-safe
            gainNode.gain.linearRampToValueAtTime(peakVal, now + delay + attack);
            // Smooth natural release transition
            gainNode.gain.setValueAtTime(peakVal, now + delay + dur - 0.8);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + dur);
          };

          // A beautiful, dream-like whisper: soft major ninth warm chord (using very low amplitudes)
          playNote(130.81, "sine", 0.0, 4.2, 0.03, 1.2);  // C3 deep warm foundational stabilizer
          playNote(196.00, "sine", 0.15, 3.9, 0.02, 1.0); // G3 peaceful soft perfect fifth
          playNote(261.63, "sine", 0.3, 3.6, 0.02, 0.9);  // C4 gentle middle C grounding node
          playNote(329.63, "sine", 0.45, 3.3, 0.015, 0.9); // E4 romantic and comforting major third
          playNote(392.00, "sine", 0.6, 3.0, 0.012, 0.8); // G4 smooth fifth melody
          playNote(493.88, "sine", 0.8, 2.7, 0.008, 0.8); // B4 warm premium major seventh dream accent
          playNote(587.33, "sine", 1.0, 2.4, 0.005, 0.8); // D5 ultra-delicate cinematic ninth whisper
        }
      } catch (e) {
        console.warn("Audio Context blocked or unsupported:", e);
      }
    }

    // Begin fade-out sequence with beautiful animation
    setSplashFadeOut(true);
    setTimeout(() => {
      setShowSplash(false);
    }, 600);
  };

  const t = translations[lang];

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col font-sans transition-all duration-300 pb-16 selection:bg-[#7c3aed]/30 selection:text-white ${
      theme === "dark" 
        ? "bg-[#080512] text-slate-100" 
        : "bg-[#f5f6ff] text-slate-800"
    }`}>
      
      {/* Dynamic Interactive Welcome Splash Screen Overlay */}
      {showSplash && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 backdrop-blur-xl ${
          splashFadeOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        } ${
          theme === "dark" ? "bg-[#06030e]" : "bg-[#f0f2fd]"
        }`}>
          {/* Glowing orbital design items */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

          <div className={`w-full max-w-xl p-8 md:p-12 rounded-3xl border shadow-2xl relative overflow-hidden text-center space-y-8 flex flex-col items-center justify-center transition-all duration-300 ${
            theme === "dark" 
              ? "bg-[#0f0b21]/90 border-violet-950/70 text-white" 
              : "bg-white border-purple-200/60 text-slate-950 shadow-md"
          }`}>
            {/* Embedded glow spots inside the welcome card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

            {/* Top glowing travel badge */}
            <div className="flex justify-center shrink-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-500/10 to-violet-500/10 border border-amber-500/20 rounded-full text-[11px] font-black tracking-widest text-amber-300 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{lang === "ar" ? "نـظـام الـسـفـر الأكـبـر" : "PREMIUM CO-PILOT VERSION"}</span>
              </div>
            </div>

            {/* Coordinated Premium Brand Badge */}
            <div className="flex flex-col select-none relative z-10 scale-105" dir="ltr">
              <div className="flex items-stretch rounded-2xl overflow-hidden border-2 border-[#7c3aed] bg-white h-[44px] shadow-lg shadow-purple-950/30" dir="ltr">
                <span className="bg-white px-4 flex items-center font-black text-xl text-[#7c3aed] tracking-tight leading-none font-sans">
                  go
                </span>
                <span className="bg-[#7c3aed] px-3.5 flex items-center font-bold text-xs text-white tracking-widest uppercase leading-none font-sans">
                  with
                </span>
                <span className="bg-slate-50/90 px-5 flex items-center font-black text-base sm:text-lg text-[#4c1d95] tracking-wider uppercase leading-none font-sans border-l border-slate-200/50">
                  Ahmed Prime
                </span>
              </div>
            </div>

            {/* Narrative text block optimized to engage and excite visitors */}
            <div className="space-y-4 max-w-xl mx-auto relative z-10">
              <h1 className="text-xl md:text-3xl font-black tracking-tight leading-snug">
                {lang === "ar" ? "عـالـمٌ بـلا حـدود بـين يـديـك" : "A Borderless World"}
              </h1>
              
              <div className={`text-xs md:text-sm leading-relaxed p-5 rounded-2xl border text-center ${
                theme === "dark" ? "bg-zinc-950/50 border-zinc-900" : "bg-slate-50 border-purple-50"
              }`}>
                {lang === "ar" ? (
                  <div className="space-y-3 text-slate-200">
                    <p className="text-base md:text-lg text-[#a78bfa] font-semibold">
                      مرحباً بك في
                    </p>
                    <p className="text-lg md:text-2xl text-[#f3e8ff] font-sans font-black tracking-wide" dir="ltr">
                      go With Ahmed Prime ✈️
                    </p>
                    <p className="text-xs md:text-sm text-slate-300 font-medium">
                      منصتك الذكية لإدارة رحلتك بالكامل — من متابعة مواعيد الشنجن لحظة بلحظة، إلى حجز الفنادق والطيران، وإنشاء خطة سفر متكاملة بكل سهولة.
                    </p>
                    <p className="text-xs md:text-sm text-emerald-400 font-extrabold mt-2">
                      ابدأ الآن رحلتك بثقة… واترك التفاصيل علينا.
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold text-slate-700">
                    Welcome to the supreme travel suite. Designed with professional rigor for Schengen tracking, AI flight planning, and verified booking documents.
                  </p>
                )}
              </div>
            </div>

            {/* Launch button playing visual pulsing animation */}
            <div className="pt-2 relative z-10 w-full max-w-xs">
              <button
                onClick={triggerWelcomeEntrance}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] hover:from-[#6d28d9] hover:to-[#4c1d95] text-white font-black text-sm md:text-md uppercase tracking-wide shadow-xl shadow-purple-950/40 hover:shadow-purple-950/60 active:scale-95 transition-all text-center border border-purple-500/20"
              >
                <Volume2 className="w-5 h-5 text-purple-200 animate-bounce" />
                <span>{lang === "ar" ? "دخـول الـبرنـامـج والـتـفـعـيـل 🔊" : "Activate Portal & Enter 🔊"}</span>
              </button>
              
              <p className="text-[10px] text-slate-450 font-bold mt-3 font-mono">
                {lang === "ar" ? "● يتطلب السماح بالصوت لسماع موسيقى الترحيب" : "▲ Click will play introductory startup sequence"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Decorative premium high-end travel background glow spots */}
      {theme === "dark" ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[50%] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-indigo-500/6 rounded-full blur-[100px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[50%] bg-emerald-500/4 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-indigo-500/3 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Main Top Header Strip */}
      <header className={`border-b shadow-xl sticky top-0 z-40 transition-all duration-300 backdrop-blur-md ${
        theme === "dark"
          ? "bg-[#0b071a]/90 border-b border-violet-950/45"
          : "bg-white/95 border-b border-purple-100"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          
          {/* Logo & the 3 Toolbar Switches right under it */}
          <div className="flex flex-col items-start gap-3">
            {/* Logo Group */}
            <div 
              onClick={() => { setActiveTab("dashboard"); playClickSound(); }}
              className="flex items-center gap-3 cursor-pointer group transition-transform duration-200 active:scale-95"
              title={lang === "ar" ? "العودة للوحة القيادة" : "Back to Home Dashboard"}
            >
              <div className="flex flex-col select-none" dir="ltr">
                <div className="flex items-stretch rounded-2xl overflow-hidden border-2 border-[#7c3aed] bg-white h-[42px] shadow-lg shadow-purple-950/30" dir="ltr">
                  {/* Left side: "go" chunk on white background */}
                  <span className="bg-white px-3.5 flex items-center font-black text-xl text-[#7c3aed] tracking-tight leading-none font-sans">
                    go
                  </span>
                  
                  {/* Middle side: "with" on violet background block */}
                  <span className="bg-[#7c3aed] px-3.5 flex items-center font-bold text-xs text-white tracking-widest uppercase leading-none font-sans">
                    with
                  </span>

                  {/* Right side: "AHMED" in dark royal violet on light warm grey */}
                  <span className="bg-slate-50/90 px-5 flex items-center font-black text-base sm:text-lg text-[#4c1d95] tracking-wider uppercase leading-none font-sans border-l border-slate-200/50">
                    Ahmed Prime
                  </span>
                </div>

                {/* Bottom bar: Travel • Volunteering • Study */}
                <div className="mt-1 flex justify-center" dir="ltr">
                  <div className="w-full bg-gradient-to-r from-[#5b21b6] to-[#4c1d95] text-[9.5px] font-black tracking-widest text-[#f5f3ff] px-3.5 py-1 rounded-xl border border-violet-700/30 uppercase flex items-center justify-center gap-2 shadow-sm">
                    <span>{lang === "ar" ? "سياحة" : "Travel"}</span>
                    <span className="text-purple-400 font-extrabold">•</span>
                    <span>{lang === "ar" ? "تطوع" : "Volunteering"}</span>
                    <span className="text-purple-400 font-extrabold">•</span>
                    <span>{lang === "ar" ? "دراسة" : "Study"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium 3-Button Toolbar: Sound, Language, Theme (Always in one beautiful row horizontally, completely visible, no wrapping crop) */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Premium Sound Switcher toggle button with beautiful visual feedback */}
              <button
                id="sound-toggle-btn"
                onClick={() => {
                  const nextVal = !soundEnabled;
                  setSoundEnabled(nextVal);
                  if (nextVal) {
                    // Play custom gentle unmute chime instantly
                    setTimeout(() => {
                      try {
                        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                        if (AudioCtx) {
                          const ctx = new AudioCtx();
                          const now = ctx.currentTime;
                          const osc = ctx.createOscillator();
                          const g = ctx.createGain();
                          osc.frequency.setValueAtTime(600, now);
                          g.gain.setValueAtTime(0, now);
                          g.gain.linearRampToValueAtTime(0.015, now + 0.01);
                          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
                          osc.connect(g);
                          g.connect(ctx.destination);
                          osc.start(now);
                          osc.stop(now + 0.14);
                        }
                      } catch(e){}
                    }, 40);
                  }
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  theme === "dark"
                    ? "bg-violet-950/40 hover:bg-violet-900/40 border-violet-900/60 text-violet-200"
                    : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-[#7c3aed]"
                }`}
                title={lang === "ar" ? "كتم / تشغيل أصوات المنظومة البريميوم" : "Mute/Unmute Premium System Audio"}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[11px] font-bold leading-none">{lang === "ar" ? "الصوت: مفعّل" : "Sound: On"}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-[11px] font-bold leading-none">{lang === "ar" ? "الصوت: مكتوم" : "Sound: Off"}</span>
                  </>
                )}
              </button>

              {/* Quick Language switcher button */}
              <button
                id="language-toggle-btn"
                onClick={() => { setLang((prev) => (prev === "ar" ? "en" : "ar")); playClickSound(); }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  theme === "dark"
                    ? "bg-violet-950/40 hover:bg-violet-900/40 border-violet-900/60 text-violet-200"
                    : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-[#7c3aed]"
                }`}
              >
                <Globe className="w-4 h-4 text-[#8b5cf6] shrink-0" />
                <span className="text-[11px] font-bold leading-none">{lang === "ar" ? "English" : "العربية"}</span>
              </button>

              {/* Premium Theme Switcher toggle button */}
              <button
                id="theme-toggle-btn"
                onClick={toggleTheme}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  theme === "dark"
                    ? "bg-violet-950/40 hover:bg-violet-900/40 border-violet-900/60 text-violet-200"
                    : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-[#7c3aed]"
                }`}
                title={lang === "ar" ? "تبديل الوضع الداكن والفاتح" : "Toggle Light / Dark Mode"}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-bold leading-none">{lang === "ar" ? "الوضع الفاتح" : "Light"}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-[#7c3aed] shrink-0" />
                    <span className="text-[11px] font-bold leading-none">{lang === "ar" ? "الوضع الداكن" : "Dark"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end self-end sm:self-center md:self-auto gap-2">
            {/* Direct Back to Home Button if inside any tab */}
            {activeTab !== "dashboard" && (
              <button
                onClick={() => { setActiveTab("dashboard"); playClickSound(); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                  theme === "dark"
                    ? "bg-violet-950/40 hover:bg-violet-900/40 border border-violet-900/60 text-violet-200"
                    : "bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#7c3aed]"
                }`}
              >
                <Home className="w-4 h-4 text-[#8b5cf6] shrink-0" />
                <span>{lang === "ar" ? "الرئيسية" : "Home Menu"}</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Container Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 flex-1">
        
        {/* Render Dashboard Hub if activeTab is "dashboard" */}
        {activeTab === "dashboard" ? (
          <div className="space-y-8">
            {/* Intro Card */}
            <div className={`rounded-3xl p-6 md:p-10 shadow-2xl text-center max-w-4xl mx-auto space-y-4 relative overflow-hidden backdrop-blur-md border transition-all duration-300 ${
              theme === "dark" 
                ? "bg-[#0f0b21]/75 border-violet-950/45 text-white" 
                : "bg-white border-purple-200/60 text-slate-950 shadow-md"
            }`}>
              <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="bg-amber-400/10 border border-amber-400/20 text-amber-300 px-4 py-1.5 rounded-full text-[10px] font-black inline-block uppercase tracking-wider">
                👑 GWA PREMIUM SYSTEM CLIENT
              </div>

              <h2 className={`text-2xl md:text-4xl font-black leading-snug tracking-tight transition-colors duration-300 ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
                {lang === "ar" ? "أهلاً بك في جناح السفر رفيقك الدائم" : "Your Borderless International Travel Companion"}
              </h2>
              <p className={`text-xs md:text-sm leading-relaxed max-w-2xl mx-auto font-medium transition-colors duration-300 ${
                theme === "dark" ? "text-violet-200/80" : "text-slate-600"
              }`}>
                {t.subtitle}
              </p>
              
              <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-semibold font-mono">
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-violet-950/30 border-violet-900/30 text-violet-300"
                    : "bg-violet-50 border-violet-100 text-[#7c3aed]"
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  {lang === "ar" ? "ذكاء اصطناعي فوري" : "Instant Generative AI"}
                </span>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-violet-950/30 border-violet-900/30 text-violet-300"
                    : "bg-violet-50 border-violet-100 text-[#7c3aed]"
                }`}>
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block animate-pulse"></span>
                  {lang === "ar" ? "تصدير وتوثيق مستندات PDF" : "Certified PDF Signatures"}
                </span>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-violet-950/30 border-violet-900/30 text-violet-300"
                    : "bg-violet-50 border-violet-100 text-[#7c3aed]"
                }`}>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block animate-pulse"></span>
                  {lang === "ar" ? "رصد تأشيرات شنجن حي" : "Live Visa Monitor"}
                </span>
              </div>
            </div>

            {/* Title above launching grid */}
            <div className="text-center md:text-left md:rtl:text-right max-w-5xl mx-auto animate-fade-in">
              <h3 className={`text-xs font-black uppercase tracking-widest mb-2 px-2 font-mono transition-colors duration-300 ${
                theme === "dark" ? "text-[#a78bfa]" : "text-[#7c3aed]"
              }`}>
                {lang === "ar" ? "الخدمات المتميزة المتوفرة" : "AVAILABLE PRIME SUITE APPLICATIONS"}
              </h3>
            </div>

            {/* Redesigned 5-Launchpad Bento Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 max-w-5xl mx-auto pt-1 animate-fade-in">
              
              {/* Tab 1: AI Planner */}
              <div
                onClick={() => { setActiveTab("planner"); playClickSound(); }}
                className={`group relative flex flex-col items-center justify-between text-center p-6 rounded-3xl border transition-all duration-300 hover:scale-102 cursor-pointer shadow-lg hover:shadow-xl ${
                  theme === "dark"
                    ? "border-violet-950/45 hover:border-violet-600/50 bg-[#0f0b21]/70 hover:bg-[#140e2b]/80 text-white hover:shadow-purple-900/10"
                    : "border-purple-100 hover:border-[#7c3aed]/50 bg-white hover:bg-slate-50/50 text-slate-950 hover:shadow-purple-100"
                }`}
              >
                <span className={`absolute top-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-violet-950/50 text-violet-300 border-violet-900/40"
                    : "bg-violet-50 text-[#7c3aed] border-violet-100"
                }`}>
                  {lang === "ar" ? "جناح الذكاء الاصطناعي" : "AI PLANNER"}
                </span>
                <div className="my-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-md flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                    <Compass className="w-7 h-7 stroke-[2]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className={`text-sm font-black tracking-tight transition-colors ${
                    theme === "dark" 
                      ? "text-white group-hover:text-violet-400" 
                      : "text-slate-950 group-hover:text-[#7c3aed]"
                  }`}>
                    {t.navPlanner}
                  </h4>
                  <p className={`text-[11px] font-medium transition-colors ${
                    theme === "dark" ? "text-violet-300/60" : "text-slate-500"
                  }`}>
                    {lang === "ar" ? "مخطط الرحلات الذكي بالساعة" : "Hour-by-hour dynamic plans"}
                  </p>
                </div>
              </div>

              {/* Tab 2: Museums */}
              <div
                onClick={() => { setActiveTab("museums"); playClickSound(); }}
                className={`group relative flex flex-col items-center justify-between text-center p-6 rounded-3xl border transition-all duration-300 hover:scale-102 cursor-pointer shadow-lg hover:shadow-xl ${
                  theme === "dark"
                    ? "border-violet-950/45 hover:border-rose-600/50 bg-[#0f0b21]/70 hover:bg-[#140e2b]/80 text-white hover:shadow-rose-900/10"
                    : "border-purple-100 hover:border-rose-500/50 bg-white hover:bg-slate-50/50 text-slate-950 hover:shadow-rose-100"
                }`}
              >
                <span className={`absolute top-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-rose-950/50 text-rose-300 border-rose-900/40"
                    : "bg-rose-50 text-rose-700 border-rose-100"
                }`}>
                  {lang === "ar" ? "تذاكر مجانية" : "FREE TICKETS"}
                </span>
                <div className="my-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                    <Landmark className="w-7 h-7 stroke-[2]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className={`text-sm font-black tracking-tight transition-colors ${
                    theme === "dark" 
                      ? "text-white group-hover:text-rose-400" 
                      : "text-slate-950 group-hover:text-rose-600"
                  }`}>
                    {t.navMuseums}
                  </h4>
                  <p className={`text-[11px] font-medium transition-colors ${
                    theme === "dark" ? "text-violet-300/60" : "text-slate-500"
                  }`}>
                    {lang === "ar" ? "متاحف وفعاليات وتذاكر مجانية" : "Entrance cards builder"}
                  </p>
                </div>
              </div>

              {/* Tab 3: Flights */}
              <div
                onClick={() => { setActiveTab("flights"); playClickSound(); }}
                className={`group relative flex flex-col items-center justify-between text-center p-6 rounded-3xl border transition-all duration-300 hover:scale-102 cursor-pointer shadow-lg hover:shadow-xl ${
                  theme === "dark"
                    ? "border-violet-950/45 hover:border-indigo-600/50 bg-[#0f0b21]/70 hover:bg-[#140e2b]/80 text-white hover:shadow-indigo-900/10"
                    : "border-purple-100 hover:border-indigo-500/50 bg-white hover:bg-slate-50/50 text-slate-950 hover:shadow-indigo-100"
                }`}
              >
                <span className={`absolute top-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-indigo-950/50 text-indigo-300 border-indigo-900/40"
                    : "bg-indigo-50 text-indigo-700 border-indigo-100"
                }`}>
                  {lang === "ar" ? "تأكيد فوري" : "PNR ACTIVE"}
                </span>
                <div className="my-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                    <Plane className="w-7 h-7 stroke-[2]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className={`text-sm font-black tracking-tight transition-colors ${
                    theme === "dark" 
                      ? "text-white group-hover:text-indigo-400" 
                      : "text-slate-950 group-hover:text-indigo-600"
                  }`}>
                    {t.navFlights}
                  </h4>
                  <p className={`text-[11px] font-medium transition-colors ${
                    theme === "dark" ? "text-violet-300/60" : "text-slate-500"
                  }`}>
                    {lang === "ar" ? "حجز طيران وهمي وبطاقات صعود" : "Simulated PNR dummy booking"}
                  </p>
                </div>
              </div>

              {/* Tab 4: Hotels */}
              <div
                onClick={() => { setActiveTab("hotels"); playClickSound(); }}
                className={`group relative flex flex-col items-center justify-between text-center p-6 rounded-3xl border transition-all duration-300 hover:scale-102 cursor-pointer shadow-lg hover:shadow-xl ${
                  theme === "dark"
                    ? "border-violet-950/45 hover:border-amber-600/50 bg-[#0f0b21]/70 hover:bg-[#140e2b]/80 text-white hover:shadow-amber-900/10"
                    : "border-purple-100 hover:border-amber-500/50 bg-white hover:bg-slate-50/50 text-slate-950 hover:shadow-amber-100"
                }`}
              >
                <span className={`absolute top-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-amber-950/50 text-amber-300 border-amber-900/40"
                    : "bg-amber-50 text-amber-700 border-amber-100"
                }`}>
                  {lang === "ar" ? "مستند بروفيشنال" : "HOTEL VOUCHERS"}
                </span>
                <div className="my-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-white shadow-md flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                    <BedDouble className="w-7 h-7 stroke-[2]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className={`text-sm font-black tracking-tight transition-colors ${
                    theme === "dark" 
                      ? "text-white group-hover:text-amber-400" 
                      : "text-slate-950 group-hover:text-amber-600"
                  }`}>
                    {t.navHotels}
                  </h4>
                  <p className={`text-[11px] font-medium transition-colors ${
                    theme === "dark" ? "text-violet-300/60" : "text-slate-500"
                  }`}>
                    {lang === "ar" ? "تصميم وطباعة إيصال حجز الفندق" : "Voucher PDF Generator"}
                  </p>
                </div>
              </div>

              {/* Tab 5: Schengen Visa Live Tracker */}
              <div
                onClick={() => { setActiveTab("schengen"); playClickSound(); }}
                className={`group relative flex flex-col items-center justify-between text-center p-6 rounded-3xl border transition-all duration-300 hover:scale-102 cursor-pointer md:col-span-2 lg:col-span-1 shadow-lg hover:shadow-xl ${
                  theme === "dark"
                    ? "border-emerald-900 hover:border-emerald-500 bg-emerald-950/20 hover:bg-[#0d2a23]/30 hover:shadow-emerald-950/10"
                    : "border-emerald-250 hover:border-emerald-500 bg-emerald-50/60 hover:bg-emerald-100/30 hover:shadow-emerald-100"
                }`}
              >
                <span className={`absolute top-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border flex items-center gap-1 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-[#0d2a23] text-emerald-300 border-emerald-800"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  {lang === "ar" ? "رصد تأشيرات" : "LIVE SCAN"}
                </span>
                <div className="my-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                    <ShieldCheck className="w-7 h-7 stroke-[2]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className={`text-sm font-black tracking-tight transition-colors ${
                    theme === "dark" ? "text-emerald-300" : "text-emerald-800"
                  }`}>
                    {t.navSchengen}
                  </h4>
                  <p className={`text-[11px] font-bold transition-colors ${
                    theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                  }`}>
                    {lang === "ar" ? "تتبع وحجز مواعيد القنصلية" : "29 Schengen Countries Tracker"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header with Exit controls inside active tab layout */}
            <div className={`flex justify-between items-center px-6 py-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 ${
              theme === "dark"
                ? "bg-[#0f0b21]/80 border-violet-950/45"
                : "bg-white border-purple-150 shadow-md text-slate-900"
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#10b981] shadow-md shadow-emerald-950"></span>
                <span className={`font-black text-sm md:text-md tracking-wider uppercase transition-colors duration-300 ${
                  theme === "dark" ? "text-[#a78bfa]" : "text-[#7c3aed]"
                }`}>
                  {activeTab === "planner" && t.navPlanner}
                  {activeTab === "museums" && t.navMuseums}
                  {activeTab === "flights" && t.navFlights}
                  {activeTab === "hotels" && t.navHotels}
                </span>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-955/40 hover:bg-rose-900/40 border border-rose-900/60 text-rose-200 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-sm select-none active:scale-95 whitespace-nowrap"
              >
                {lang === "ar" ? "الخروج للقائمة الرئيسية" : "Return to Dashboard Menu"}
              </button>
            </div>

            {/* Dynamic Card Container for Tab Component with Beautiful High-Contrast Style */}
            <div className={`rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md border min-h-[550px] transition-all duration-300 ${
              theme === "dark"
                ? "bg-[#0f0b21]/80 border-violet-950/45 text-slate-100"
                : "bg-white border-purple-150 text-slate-800 shadow-md"
            }`}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
              {activeTab === "planner" && <AIPlanner lang={lang} />}
              {activeTab === "museums" && <MuseumEvents lang={lang} />}
              {activeTab === "flights" && <FlightBooking lang={lang} />}
              {activeTab === "hotels" && <HotelBooking lang={lang} theme={theme} />}
            </div>

          </div>
        )}

        {/* Seamless full screen overlay render for Schengen Tracker */}
        {activeTab === "schengen" && (
          <SchengenTracker lang={lang} onBack={() => setActiveTab("dashboard")} theme={theme} />
        )}

      </main>

      {/* Small Elegant Footer */}
      <footer className={`mt-20 text-center text-[11px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t pt-8 transition-colors duration-300 ${
        theme === "dark" 
          ? "text-violet-400/30 border-violet-950/35" 
          : "text-slate-400/80 border-purple-100"
      }`}>
        <p>© 2000-2026 Go with Ahmed Prime Coordinated Travel Systems. All virtual itinerary plans, boarding passes, dummy e-ticket PDFs, and hotel vouchers are intended for simulation, travel verification visualization, and airport scan mockups only.</p>
      </footer>
    </div>
  );
}
