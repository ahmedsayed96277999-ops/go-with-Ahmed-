import React, { useState, useEffect } from "react";
import { Landmark, Calendar, User, Search, MapPin, Printer, Star, ArrowUpRight, ShieldCheck, CheckCircle2, BedDouble, UserPlus, UserMinus, Smartphone, Sparkles, MessageSquare } from "lucide-react";
import { Language, HotelOption } from "../types";
import { translations } from "../utils/translations";
import { generateHotelVoucherPDF } from "../utils/pdfGenerator";

interface HotelBookingProps {
  lang: Language;
  theme?: "dark" | "light";
}

export default function HotelBooking({ lang, theme = "dark" }: HotelBookingProps) {
  const t = translations[lang];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const playClick = () => {
    try {
      if ((window as any).gwaPlayClick) {
        (window as any).gwaPlayClick();
      }
    } catch(e){}
  };

  const [destination, setDestination] = useState(lang === "ar" ? "باريس، فرنسا" : "Paris, France");
  const [checkIn, setCheckIn] = useState("2026-06-15");
  const [checkOut, setCheckOut] = useState("2026-06-22");
  const [guests, setGuests] = useState(2);
  
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<HotelOption[] | null>(null);
  
  // Voucher builder state
  const [selectedHotel, setSelectedHotel] = useState<HotelOption | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guest2Name, setGuest2Name] = useState("");
  const [guest3Name, setGuest3Name] = useState("");
  const [activeGuestFields, setActiveGuestFields] = useState<number>(1); // 1 = Main, 2 = Main + Second, 3 = All three
  const [refundPolicy, setRefundPolicy] = useState("Free cancellation up to 24 hours before check-in");
  const [roomType, setRoomType] = useState("Deluxe King Room with Skyline View");
  const [boardBasis, setBoardBasis] = useState("Breakfast Included");
  const [roomNumber, setRoomNumber] = useState("Suite 402");
  const [bookingNumber, setBookingNumber] = useState("AH-" + Math.floor(100000 + Math.random() * 900000));

  // Famous hotel booking links
  const bookingPortals = [
    { name: "Booking.com", url: "https://www.booking.com", color: "bg-blue-600 hover:bg-blue-700 text-white" },
    { name: "Expedia", url: "https://www.expedia.com", color: "bg-amber-500 hover:bg-amber-600 text-white" },
    { name: "Agoda", url: "https://www.agoda.com", color: "bg-rose-500 hover:bg-rose-600 text-white" },
    { name: "Hotels.com", url: "https://www.hotels.com", color: "bg-red-600 hover:bg-red-700 text-white" },
    { name: "Airbnb", url: "https://www.airbnb.com", color: "bg-pink-500 hover:bg-pink-600 text-white" }
  ];

  const handleSearchHotels = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHotels(null);
    setSelectedHotel(null);

    setTimeout(() => {
      const isSyria = destination.toLowerCase().includes("syria") || destination.includes("سوريا") || destination.toLowerCase().includes("damascus") || destination.includes("دمشق");
      const mockHotels: HotelOption[] = [
        {
          id: "H-1",
          name: isSyria
            ? (lang === "ar" ? "فندق داما روز دمشق البانورامي" : "Dama Rose Hotel Damascus")
            : (lang === "ar" ? "منتجع وفندق رويال بالاس الفاخر" : "Grand Palace Royal Inn & Resort"),
          location: destination,
          stars: 5,
          pricePerNight: isSyria ? 140 : 180,
          rating: 4.9,
          image: "🏨",
          amenities: [
            lang === "ar" ? "مسبح بإنفينيتي خارجي مع تدفئة" : "Heated outdoor infinity pool",
            lang === "ar" ? "نادي صحي وجلسات يوغا نهارية مجانية" : "Prestige health spa & complimentary yoga access",
            lang === "ar" ? "إفطار بوفيه مفتوح كامل" : "Full luxurious open-buffet chef breakfast daily",
            lang === "ar" ? "شبكة إنترنت فايبر عالية السرعة ومفتوحة" : "Uncapped multi-gigabit fiber Wi-Fi access"
          ]
        },
        {
          id: "H-2",
          name: isSyria
            ? (lang === "ar" ? "فندق فور سيزونز دمشق" : "Four Seasons Hotel Damascus")
            : (lang === "ar" ? "فندق ساكورا بوتيك للفنون" : "Sakura Boutique Art Space"),
          location: destination,
          stars: 5,
          pricePerNight: isSyria ? 230 : 125,
          rating: 4.8,
          image: "🌸",
          amenities: [
            lang === "ar" ? "غرف مع تراس يطل على حدائق المدينة" : "Private terrace suites overlooking landscaped gardens",
            lang === "ar" ? "إطلالة بانورامية رائعة على معالم المدينة" : "Scenic floor-to-ceiling skyline views",
            lang === "ar" ? "قريب من محطة القطار والمترو (أقل من 3 دقائق)" : "Superior proximity walking access to central rail terminal"
          ]
        },
        {
          id: "H-3",
          name: isSyria
            ? (lang === "ar" ? "فندق شيراتون دمشق التاريخي" : "Sheraton Damascus Hotel")
            : (lang === "ar" ? "شقق أوريانتل هافن السكنية الراقية" : "Oriental Haven Luxury Suites"),
          location: destination,
          stars: 5,
          pricePerNight: isSyria ? 165 : 240,
          rating: 4.7,
          image: "💎",
          amenities: [
            lang === "ar" ? "مطبخ مجهز بالكامل وغسالة ملابس خاصة" : "En-suite designer kitchen & private laundry clothes dryer",
            lang === "ar" ? "نظام خدمة شخصية ومرشد محلي خاص للرحلة" : "24/7 Personal concierge & customized private travel butler",
            lang === "ar" ? "خدمة استلام وتسليم مجانية بالسيارة من المطار" : "Luxury chauffeured airport terminal transfers included"
          ]
        }
      ];

      setHotels(mockHotels);
      setLoading(false);
    }, 1500);
  };

  const handleIssueVoucher = (hotel: HotelOption) => {
    setSelectedHotel(hotel);
    setBookingNumber("AH-" + Math.floor(100000 + Math.random() * 900000));
    // Scroll to passenger sheet form helper
    setTimeout(() => {
      const el = document.getElementById("hotel-guest-form");
      el?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handlePrintVoucherPDF = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel || !guestName.trim()) return;

    const guestDoc = {
      name: guestName,
      guest2: activeGuestFields >= 2 ? guest2Name : "",
      guest3: activeGuestFields >= 3 ? guest3Name : "",
      roomType: roomType,
      checkIn: checkIn,
      checkOut: checkOut,
      boardBasis: boardBasis,
      roomNumber: roomNumber,
      bookingNumber: bookingNumber,
      refundPolicy: refundPolicy
    };

    generateHotelVoucherPDF(selectedHotel, guestDoc, lang);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Exclusive Hotel.info Promotional Banner */}
      <div id="hotel-info-free-booking-banner" className={`rounded-3xl p-6 md:p-8 border transition-all duration-300 relative overflow-hidden shadow-xl ${
        theme === "dark" 
          ? "bg-gradient-to-br from-amber-950/40 via-[#100c24] to-purple-950/30 border-amber-600/30 text-amber-100" 
          : "bg-gradient-to-br from-amber-500/10 via-white to-purple-500/5 border-amber-500/20 text-slate-800"
      }`}>
        {/* Ambient absolute glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center gap-6 justify-between relative z-10">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-400 font-extrabold bg-amber-950/85 px-2.5 py-1 rounded-full border border-amber-500/30 uppercase animate-pulse">
                <Sparkles className="w-3 h-3 text-amber-405" />
                {lang === "ar" ? "ثغرة قنصلية للمسافرين" : "Consular Exclusive backdoor"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400 font-extrabold bg-emerald-950/85 px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase">
                {lang === "ar" ? "حجز مؤكد بدون بطاقة" : "Real Confirmed Booking"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-indigo-400 font-extrabold bg-indigo-950/85 px-2.5 py-1 rounded-full border border-indigo-500/30 uppercase">
                {lang === "ar" ? "إرسال رسالة SMS فورية" : "Instant SMS Notification"}
              </span>
            </div>

            <h2 className={`text-lg md:text-2xl font-black leading-snug tracking-tight ${
              theme === "dark" ? "text-amber-300" : "text-amber-800"
            }`}>
              {lang === "ar" 
                ? "طريقة حجز فندقي مؤكد 100% بدون دفع مسبق وبدون بطاقة ائتمان (فيزا كارد) عبر منصة Hotel.info!" 
                : "100% Free Confirmed Hotel Booking Without Credit Card + Instant SMS Confirmation via Hotel.info!"}
            </h2>

            <p className={`text-xs md:text-sm leading-relaxed ${
              theme === "dark" ? "text-slate-300" : "text-slate-600"
            }`}>
              {lang === "ar"
                ? "هل تبحث عن حجز فندقي حقيقي وموثق تقبله القنصليات لفيزا الشنجن والمطارات دون دفع مسبق ودون إدخال أية بيانات فيزا كارد؟ يوفر لك موقع Hotel.info العالمي هذه الميزة الأسطورية! بمجرد إتمام حجزك المجاني، ستحصل على مستند حجز رسمي، بالإضافة إلى إرسال رسالة نصية SMS فورية على هاتفك المحمول لتأكيد موعدك وموقع الإقامة لضمان عبور آمن وعرضه أمام القنصل ومكاتب الأمن."
                : "Looking for a real, legal hotel reservation accepted by Schengen embassies and airlines without paying in advance or typing any credit card credentials? Hotel.info provides this phenomenal backdoor feature! Once you make your free booking, they instantly dispatch an official SMS text reminder straight to your phone confirming your room status to guarantee pure confidence at submission & check-in."}
            </p>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm font-semibold pt-1 ${
              theme === "dark" ? "text-slate-200" : "text-slate-700"
            }`}>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{lang === "ar" ? "حجز معتمد بطلب مؤكد ورقم حجز حقيقي" : "Official verification code with live booking ID"}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{lang === "ar" ? "آمن تماماً - لا يتطلب إدخال فيزا كارد أو حساب بنكي" : "Guaranteed secure - zero credit card requirements"}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{lang === "ar" ? "إرسال رسالة تأكيد SMS فورية لهاتفك بالكامل لتأكيد جدية السفر" : "Instant SMS delivered directly to Egyptian / international numbers"}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{lang === "ar" ? "مقبول لدى مكاتب TLScontact و VFS Global و السفارات مباشرة" : "Fully accepted by prime VFS Global, TLS contact centers"}</span>
              </div>
            </div>

            <div className="pt-3">
              <a
                href="https://www.hotel.info/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs md:text-sm shadow-lg shadow-amber-950/20 active:scale-95 transition-all"
              >
                <span>{lang === "ar" ? "احجز مجاناً الآن عبر موقع Hotel.info" : "Book For Free Now on Hotel.info"}</span>
                <ArrowUpRight className="w-4 h-5 animate-pulse" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Flight header banner */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <BedDouble className="w-8 h-8 text-slate-100" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{t.hotelHeader}</h1>
            <p className="text-slate-100 text-xs md:text-sm mt-2 max-w-xl leading-relaxed font-semibold">
              {t.hotelIntro}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form fields */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-800" />
            <span>{lang === "ar" ? "البحث والمقارنة" : "Hotel Parameters"}</span>
          </h3>

          <form onSubmit={handleSearchHotels} className="space-y-4">
            {/* Destination */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {t.labelDestination}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t.placeholderDestination}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* In / Out Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {lang === "ar" ? "تاريخ الوصول" : "Check-in"}
                </label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none text-slate-800 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {lang === "ar" ? "تاريخ المغادرة" : "Check-out"}
                </label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Guests count */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {t.guestsLabel}
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none text-slate-800 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={playClick}
              className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">{t.searchingHotels}</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span className="text-sm">{t.searchHotelsBtn}</span>
                </>
              )}
            </button>
          </form>

          {/* Hotel portals direct links */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.majorBookingPortals}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              {t.majorBookingDesc}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {bookingPortals.map((portal) => (
                <a
                  key={portal.name}
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 ${portal.color}`}
                >
                  <span>{portal.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Display results */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm space-y-6 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-50 border-t-slate-800 rounded-full animate-spin"></div>
                <BedDouble className="w-8 h-8 text-slate-800 absolute inset-0 m-auto" />
              </div>
              <p className="text-slate-800 font-extrabold text-base md:text-lg animate-pulse">
                {lang === "ar" ? "جاري مطابقة أسعار ومخازن الغرف بالفنادق..." : "Querying local room rates & availability..."}
              </p>
            </div>
          )}

          {!loading && !hotels && (
            <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <BedDouble className="w-14 h-14 text-slate-300 stroke-1 mb-4" />
              <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed font-semibold">
                {lang === "ar"
                  ? "حدد بلد ومدينة الإقامة للبحث عن أفضل الفنادق وإصدار مستخرج تأكيد حجر رسمي للعبور."
                  : "Specify target city on the left filter input to verify hotel listings and print official confirmation vouchers."}
              </p>
            </div>
          )}

          {!loading && hotels && (
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold text-slate-800 px-2 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-slate-800" />
                <span>{t.foundHotels}</span>
              </h3>

              {/* Hotels grid */}
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className={`bg-white rounded-3xl border p-6 shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                      selectedHotel?.id === hotel.id ? "border-slate-800 ring-2 ring-slate-100" : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    {/* Hotel logo / Name */}
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-3xl bg-slate-50 p-4 rounded-2xl flex-shrink-0">{hotel.image}</span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base sm:text-lg font-black text-slate-900">{hotel.name}</h4>
                          <div className="flex text-amber-500">
                            {Array.from({ length: hotel.stars }).map((_, sIdx) => (
                              <Star key={sIdx} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold">{hotel.location}</p>
                        
                        {/* Amenities pills */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {hotel.amenities.slice(0, 2).map((amen, aIdx) => (
                            <span key={aIdx} className="text-[9px] bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                              {amen}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Fare & Booking */}
                    <div className="flex items-center md:flex-col justify-between w-full md:w-auto gap-4 border-t border-slate-50 md:border-0 pt-4 md:pt-0">
                      <div className="md:text-right">
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                          ★ {hotel.rating} / 5.0
                        </span>
                        <div className="pt-2">
                          <span className="text-xl font-extrabold text-slate-900 font-mono">${hotel.pricePerNight}</span>
                          <span className="text-slate-400 text-[10px] font-bold uppercase block">{t.night}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => { handleIssueVoucher(hotel); playClick(); }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                          selectedHotel?.id === hotel.id
                            ? "bg-slate-800 text-white"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        <span>{t.btnGenerateHotelVoucher}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Passenger form for dummy ticket - scrolls in view upon selection */}
              {selectedHotel && (
                <div id="hotel-guest-form" className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
                  <div className="border-b border-slate-50 pb-5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-800 bg-slate-50 px-3 py-1 rounded-full">
                      Step 2: Generate Hotel Voucher (PDF)
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-2">{t.hotelModalTitle}</h4>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                      {t.hotelModalDesc}
                    </p>
                  </div>

                  <form onSubmit={handlePrintVoucherPDF} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Guest Full Name */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {lang === "ar" ? "اسم الضيف الرئيسي الأول" : "Lead Guest Full Name"}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g., AHMED SAYED"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Second Guest Name - Rendered conditionally */}
                    {activeGuestFields >= 2 && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                          {lang === "ar" ? "اسم الضيف الثاني" : "Second Guest Name"}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                          <input
                            type="text"
                            required
                            value={guest2Name}
                            onChange={(e) => setGuest2Name(e.target.value)}
                            placeholder="e.g., KHALED AHMED"
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* Third Guest Name - Rendered conditionally */}
                    {activeGuestFields >= 3 && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                          {lang === "ar" ? "اسم الضيف الثالث" : "Third Guest Name"}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                          <input
                            type="text"
                            required
                            value={guest3Name}
                            onChange={(e) => setGuest3Name(e.target.value)}
                            placeholder="e.g., OMAR SAYED"
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* Interactive Guest Controls Block */}
                    <div className="col-span-1 md:col-span-2 flex flex-wrap items-center gap-3 pt-1">
                      {activeGuestFields < 3 && (
                        <button
                          type="button"
                          id="btn-add-companion-guest"
                          onClick={() => {
                            setActiveGuestFields(prev => prev + 1);
                            playClick();
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 border border-emerald-200/50 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>{lang === "ar" ? "إضافة ضيف مرافق جديد" : "Add Companion Guest"}</span>
                        </button>
                      )}
                      {activeGuestFields > 1 && (
                        <button
                          type="button"
                          id="btn-remove-companion-guest"
                          onClick={() => {
                            if (activeGuestFields === 3) {
                              setGuest3Name("");
                            } else if (activeGuestFields === 2) {
                              setGuest2Name("");
                            }
                            setActiveGuestFields(prev => prev - 1);
                            playClick();
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200/50 rounded-xl text-xs font-bold transition-all"
                        >
                          <UserMinus className="w-4 h-4" />
                          <span>{lang === "ar" ? "إزالة الضيف المرافق" : "Remove Last Guest"}</span>
                        </button>
                      )}
                    </div>

                    {/* Refund & Cancellation Policy */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {lang === "ar" ? "سياسة إلغاء واسترداد الحجز" : "Cancellation & Refund Policy"}
                      </label>
                      <select
                        value={refundPolicy}
                        onChange={(e) => setRefundPolicy(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-800 shadow-sm"
                      >
                        <option value="Free cancellation up to 24 hours before check-in">
                          {lang === "ar" ? "إلغاء مجاني واسترداد كامل قبل 24 ساعة من الوصول" : "Fully Refundable - Cancel up to 24h prior"}
                        </option>
                        <option value="Free cancellation up to 7 days before check-in">
                          {lang === "ar" ? "إلغاء مجاني واسترداد كامل حتى 7 أيام قبل الوصول" : "Refundable - Cancel up to 7 days prior"}
                        </option>
                        <option value="Non-refundable booking - No cancellation or refund allowed">
                          {lang === "ar" ? "غير قابل للاسترداد نهائياً / تطبق رسوم للإلغاء" : "Non-Refundable Bookings Only- No Refund"}
                        </option>
                        <option value="Super flexible policy - Modify or cancel free anytime during stay">
                          {lang === "ar" ? "مرونة فائقة - تعديل وإلغاء مجاني بأي وقت خلال الإقامة" : "Super Flexible - Free modification anytime"}
                        </option>
                      </select>
                    </div>

                    {/* Room selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {t.roomTypeLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        placeholder="e.g., Deluxe King Room with Balcony View"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-800"
                      />
                    </div>

                    {/* Meal Option selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {t.boardBasis}
                      </label>
                      <select
                        value={boardBasis}
                        onChange={(e) => setBoardBasis(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-800"
                      >
                        <option value="Breakfast Included">{t.breakfastInc}</option>
                        <option value="All Inclusive (Meals, beverages & private guide) / شامل بالكامل">
                          {t.allInc}
                        </option>
                        <option value="Room Only">{t.roomOnly}</option>
                      </select>
                    </div>

                    {/* Room Number */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {lang === "ar" ? "رقم الغرفة" : "Room Number"}
                      </label>
                      <input
                        type="text"
                        required
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g., Suite 402"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-800"
                      />
                    </div>

                    {/* Booking Reference Number */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {lang === "ar" ? "رقم تأكيد الحجز" : "Booking Reference Number"}
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingNumber}
                        onChange={(e) => setBookingNumber(e.target.value)}
                        placeholder="e.g., AH-839210"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-slate-800"
                      />
                    </div>

                    {/* Dates reminder badge */}
                    <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{lang === "ar" ? "تواریخ الإقامة النشطة" : "Active Check-In Schedule"}</span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 font-mono">
                        {checkIn} {lang === "ar" ? "إلى" : "to"} {checkOut}
                      </p>
                    </div>

                    {/* Submit printing */}
                    <div className="md:col-span-2 pt-2">
                      <button
                        type="submit"
                        onClick={playClick}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Printer className="w-5 h-5" />
                        <span>{t.btnDownloadHotelVoucher}</span>
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
