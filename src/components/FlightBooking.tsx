import React, { useState } from "react";
import { Plane, Calendar, User, Search, MapPin, DollarSign, Printer, ArrowRight, ShieldCheck, CreditCard, ChevronRight, RefreshCw } from "lucide-react";
import { Language, FlightOption } from "../types";
import { translations } from "../utils/translations";
import { generateFlightTicketPDF } from "../utils/pdfGenerator";

interface FlightBookingProps {
  lang: Language;
}

export default function FlightBooking({ lang }: FlightBookingProps) {
  const t = translations[lang];
  const [fromCountry, setFromCountry] = useState("Cairo (CAI)");
  const [toCountry, setToCountry] = useState("London (LHR)");
  const [tripType, setTripType] = useState<"round" | "oneway">("round");
  const [cabinClass, setCabinClass] = useState("Economy Class");
  const [departDate, setDepartDate] = useState("2026-06-12");
  const [returnDate, setReturnDate] = useState("2026-06-25");
  const [passengers, setPassengers] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<FlightOption[] | null>(null);
  
  // Custom Boarding pass state
  const [selectedFlight, setSelectedFlight] = useState<FlightOption | null>(null);
  
  // Passenger 1 details
  const [p1Name, setP1Name] = useState("");
  const [p1Passport, setP1Passport] = useState("");
  const [p1Seat, setP1Seat] = useState("14K");
  const [p1Nationality, setP1Nationality] = useState("Egyptian");
  const [p1Dob, setP1Dob] = useState("1996-05-15");
  const [p1PnrCode, setP1PnrCode] = useState("");
  const [p1TicketNum, setP1TicketNum] = useState("");

  // Passenger 2 details (Optional multi-passenger system)
  const [p2Enabled, setP2Enabled] = useState(false);
  const [p2Name, setP2Name] = useState("");
  const [p2Passport, setP2Passport] = useState("");
  const [p2Seat, setP2Seat] = useState("14A");
  const [p2Nationality, setP2Nationality] = useState("Egyptian");
  const [p2Dob, setP2Dob] = useState("1998-08-20");
  const [p2PnrCode, setP2PnrCode] = useState("");
  const [p2TicketNum, setP2TicketNum] = useState("");

  // Expanded High-Fidelity e-ticket fields
  const [flightNoCustom, setFlightNoCustom] = useState("");
  const [aircraftType, setAircraftType] = useState("Boeing 777-300ER");
  const [depTerminal, setDepTerminal] = useState("Terminal 3");
  const [arrTerminal, setArrTerminal] = useState("Terminal 2");
  const [baggage, setBaggage] = useState("2 Pieces (23kg each) + 1 Cabin Bag (7kg)");

  const mockAirliners = [
    { name: "EgyptAir", logo: "✈️ MS", suffix: "MS" },
    { name: "Emirates", logo: "✈️ EK", suffix: "EK" },
    { name: "British Airways", logo: "✈️ BA", suffix: "BA" },
    { name: "Qatar Airways", logo: "✈️ QR", suffix: "QR" },
    { name: "Lufthansa", logo: "✈️ LH", suffix: "LH" },
    { name: "Saudia", logo: "✈️ SV", suffix: "SV" }
  ];

  const handleSearchFlights = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFlights(null);
    setSelectedFlight(null);

    setTimeout(() => {
      // Create highly contextual flight options matching input destination & cabin class
      const destination = toCountry.split("(")[0].trim();
      const origin = fromCountry.split("(")[0].trim();
      
      const flightResults: FlightOption[] = mockAirliners.map((air, index) => {
        const flightNum = `${air.suffix} ${Math.floor(200 + Math.random() * 700)}`;
        const durationHours = 4 + Math.round(Math.random() * 5);
        const durationMinutes = Math.floor(Math.random() * 4) * 15;
        const depHour = 8 + index * 2;
        const arrHour = (depHour + durationHours) % 24;
        
        // Price shifts according to Cabin Class style
        let basePrice = 350 + index * 85;
        if (cabinClass.includes("Business")) basePrice *= 2.5;
        if (cabinClass.includes("First")) basePrice *= 4.2;

        return {
          id: `F-${index + 1}`,
          airline: air.name,
          logo: air.logo,
          flightNo: flightNum,
          departureTime: `${String(depHour).padStart(2, "0")}:15 AM`,
          arrivalTime: `${String(arrHour).padStart(2, "0")}:${String(durationMinutes).padStart(2, "0")} PM`,
          duration: `${durationHours}h ${durationMinutes}m`,
          price: Math.round(basePrice),
          stops: Math.random() > 0.6 ? "1 Stop (Transit)" : t.directNonStop,
          classStyle: cabinClass.split(" ")[0]
        };
      });

      setFlights(flightResults);
      setLoading(false);
    }, 1500);
  };

  const handleBookFlight = (flight: FlightOption) => {
    setSelectedFlight(flight);
    setFlightNoCustom(flight.flightNo);
    
    // Generate Passenger 1 unique codes
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pnr1 = "";
    for (let i = 0; i < 6; i++) {
      pnr1 += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setP1PnrCode(pnr1);

    const ticks = ["077", "176", "220", "098"];
    const prefix1 = ticks[Math.floor(Math.random() * ticks.length)];
    const p1Ticket = `${prefix1}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setP1TicketNum(p1Ticket);
    setP1Seat("14K (Window / نافذة)");

    // Generate Passenger 2 unique codes
    let pnr2 = "";
    do {
      pnr2 = "";
      for (let i = 0; i < 6; i++) {
        pnr2 += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (pnr2 === pnr1);
    setP2PnrCode(pnr2);

    let p2Ticket = "";
    do {
      const prefix2 = ticks[Math.floor(Math.random() * ticks.length)];
      p2Ticket = `${prefix2}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    } while (p2Ticket === p1Ticket);
    setP2TicketNum(p2Ticket);
    setP2Seat("14A (Window / نافذة)");

    if (flight.airline.includes("EgyptAir")) {
      setAircraftType("Boeing 777-300ER");
      setDepTerminal("Terminal 3");
      setArrTerminal("Terminal 2");
    } else if (flight.airline.includes("Emirates")) {
      setAircraftType("Airbus A380-800");
      setDepTerminal("Terminal 3");
      setArrTerminal("Terminal 1");
    } else if (flight.airline.includes("Saudia")) {
      setAircraftType("Boeing 787-9 Dreamliner");
      setDepTerminal("Terminal 2");
      setArrTerminal("Terminal 1");
    } else {
      setAircraftType("Airbus A350-900");
      setDepTerminal("Terminal 1");
      setArrTerminal("Terminal A");
    }

    setBaggage("2 Pieces (23kg each) + 1 Cabin Bag (7kg)");

    // Auto-scroll to passenger sheet
    setTimeout(() => {
      const el = document.getElementById("passenger-data-form");
      el?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const refreshBookingCodes = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const ticks = ["077", "176", "220", "098"];

    // Passenger 1 random updates
    let pnr1 = "";
    for (let i = 0; i < 6; i++) {
      pnr1 += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setP1PnrCode(pnr1);

    const prefix1 = ticks[Math.floor(Math.random() * ticks.length)];
    const p1Ticket = `${prefix1}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setP1TicketNum(p1Ticket);

    const seats1 = ["14K (Window / نافذة)", "12D (Aisle / ممر)", "10E (Middle / وسط)", "16F (Window / نافذة)"];
    setP1Seat(seats1[Math.floor(Math.random() * seats1.length)]);

    // Passenger 2 random updates (fully distinct from P1)
    let pnr2 = "";
    do {
      pnr2 = "";
      for (let i = 0; i < 6; i++) {
        pnr2 += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (pnr2 === pnr1);
    setP2PnrCode(pnr2);

    let p2Ticket = "";
    do {
      const prefix2 = ticks[Math.floor(Math.random() * ticks.length)];
      p2Ticket = `${prefix2}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    } while (p2Ticket === p1Ticket);
    setP2TicketNum(p2Ticket);

    const seats2 = ["14A (Window / نافذة)", "15C (Aisle / ممر)", "11B (Middle / وسط)", "17E (Aisle / ممر)"];
    setP2Seat(seats2[Math.floor(Math.random() * seats2.length)]);
  };

  const handleGeneratePDFBoarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight || !p1Name.trim() || !p1Passport.trim()) return;
    if (p2Enabled && (!p2Name.trim() || !p2Passport.trim())) return;

    // Enforce highly distinct PNR and Ticket numbers for multi-ticket issuance
    let finalP1Pnr = p1PnrCode.trim();
    let finalP2Pnr = p2PnrCode.trim();
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const ticks = ["077", "176", "220", "098"];

    if (!finalP1Pnr) {
      for (let i = 0; i < 6; i++) {
        finalP1Pnr += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    }
    if (!finalP2Pnr || finalP2Pnr === finalP1Pnr) {
      do {
        finalP2Pnr = "";
        for (let i = 0; i < 6; i++) {
          finalP2Pnr += characters.charAt(Math.floor(Math.random() * characters.length));
        }
      } while (finalP2Pnr === finalP1Pnr);
    }

    let finalP1Ticket = p1TicketNum.trim();
    let finalP2Ticket = p2TicketNum.trim();
    if (!finalP1Ticket) {
      const prefix = ticks[Math.floor(Math.random() * ticks.length)];
      finalP1Ticket = `${prefix}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    }
    if (!finalP2Ticket || finalP2Ticket === finalP1Ticket) {
      do {
        const prefix = ticks[Math.floor(Math.random() * ticks.length)];
        finalP2Ticket = `${prefix}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      } while (finalP2Ticket === finalP1Ticket);
    }

    // 1. Generate E-Ticket for Passenger 1
    const p1Doc = {
      name: p1Name,
      passport: p1Passport,
      from: fromCountry,
      to: toCountry,
      seat: p1Seat,
      departDate: departDate,
      nationality: p1Nationality,
      dob: p1Dob,
      flightNoCustom: flightNoCustom || selectedFlight.flightNo,
      pnrCode: finalP1Pnr,
      aircraftType: aircraftType || "Boeing 777-300ER",
      depTerminal: depTerminal || "Terminal 3",
      arrTerminal: arrTerminal || "Terminal 2",
      baggage: baggage || "2 Pieces (23kg each) + 1 Cabin Bag (7kg)",
      ticketNum: finalP1Ticket,
    };
    generateFlightTicketPDF(selectedFlight, p1Doc, lang);

    // 2. Generate E-Ticket for Passenger 2 dynamically with delay to allow separate file saving
    if (p2Enabled) {
      setTimeout(() => {
        const p2Doc = {
          name: p2Name,
          passport: p2Passport,
          from: fromCountry,
          to: toCountry,
          seat: p2Seat || "14A",
          departDate: departDate,
          nationality: p2Nationality,
          dob: p2Dob,
          flightNoCustom: flightNoCustom || selectedFlight.flightNo,
          pnrCode: finalP2Pnr,
          aircraftType: aircraftType || "Boeing 777-300ER",
          depTerminal: depTerminal || "Terminal 3",
          arrTerminal: arrTerminal || "Terminal 2",
          baggage: baggage || "2 Pieces (23kg each) + 1 Cabin Bag (7kg)",
          ticketNum: finalP2Ticket,
        };
        generateFlightTicketPDF(selectedFlight, p2Doc, lang);
      }, 800);
    }

    // Automatically regenerate unique reservation code, ticket number and seat for subsequent bookings
    setTimeout(() => {
      refreshBookingCodes();
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Flight header banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Plane className="w-8 h-8 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{t.flightHeader}</h1>
            <p className="text-indigo-100 text-xs md:text-sm mt-2 max-w-xl leading-relaxed font-semibold">
              {t.flightIntro}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form fields */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" />
            <span>{lang === "ar" ? "تفاصيل البحث والمطارات" : "Flight Parameters"}</span>
          </h3>

          <form onSubmit={handleSearchFlights} className="space-y-4">
            {/* Trip Type Selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => setTripType("round")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tripType === "round" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
                }`}
              >
                {t.tripTypeRound}
              </button>
              <button
                type="button"
                onClick={() => setTripType("oneway")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tripType === "oneway" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
                }`}
              >
                {t.tripTypeOneWay}
              </button>
            </div>

            {/* Departure */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {t.labelFromCountry}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={fromCountry}
                  onChange={(e) => setFromCountry(e.target.value)}
                  placeholder="Cairo (CAI)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {t.labelToCountry}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={toCountry}
                  onChange={(e) => setToCountry(e.target.value)}
                  placeholder="London (LHR)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Cabin select */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {t.cabinClass}
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
              >
                <option value="Economy Class">{t.economyClass}</option>
                <option value="Business Class">{t.businessClass}</option>
                <option value="First Class">{t.firstClass}</option>
              </select>
            </div>

            {/* Date depart & return */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {t.labelDepartDate}
                </label>
                <input
                  type="date"
                  required
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none text-slate-800 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {t.labelReturnDate}
                </label>
                <input
                  type="date"
                  disabled={tripType === "oneway"}
                  required={tripType === "round"}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none text-slate-800 font-mono disabled:opacity-40"
                />
              </div>
            </div>

            {/* Passengers quantity */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                {t.passengerCount}
              </label>
              <input
                type="number"
                min="1"
                max="9"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none text-slate-800 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">{t.searchingFlights}</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span className="text-sm">{t.btnSearchFlights}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Display options */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm space-y-6 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                <Plane className="w-8 h-8 text-indigo-600 absolute inset-0 m-auto" />
              </div>
              <p className="text-slate-800 font-extrabold text-base md:text-lg animate-pulse">
                {lang === "ar" ? "جاري مطابقة الرحلات المناسبة لمساركم..." : "Matching global airline schedules..."}
              </p>
            </div>
          )}

          {!loading && !flights && (
            <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <Plane className="w-14 h-14 text-slate-300 stroke-1 mb-4" />
              <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed">
                {lang === "ar"
                  ? "قم بتحديد مدينة القيام ومدينة الوصول للحصول على أفضل التذاكر وطباعة تذكرة وهمية فورا."
                  : "Specify departure and destination airports to retrieve verified flight coordinates and print dummy coupons."}
              </p>
            </div>
          )}

          {!loading && flights && (
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold text-slate-800 px-2 flex items-center gap-2">
                <Plane className="w-5 h-5 text-indigo-600" />
                <span>{t.foundFlightsTitle}</span>
              </h3>

              {/* Flights grid */}
              <div className="space-y-4">
                {flights.map((flight) => (
                  <div
                    key={flight.id}
                    className={`bg-white rounded-3xl border p-6 shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                      selectedFlight?.id === flight.id ? "border-indigo-600 ring-2 ring-indigo-50" : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    {/* Airline & Logo */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl bg-slate-50 p-3 rounded-2xl">{flight.logo}</span>
                      <div>
                        <h4 className="text-base font-bold text-slate-800">{flight.airline}</h4>
                        <span className="text-xs text-slate-400 font-mono font-bold uppercase">{flight.flightNo}</span>
                      </div>
                    </div>

                    {/* Timeline airports */}
                    <div className="flex items-center gap-6">
                      <div className="text-center md:text-left">
                        <span className="block text-base font-black text-slate-800 font-mono">{flight.departureTime}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                          {fromCountry.substring(fromCountry.indexOf("(") + 1, fromCountry.indexOf(")"))}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center flex-1 min-w-[80px]">
                        <span className="text-[10px] text-slate-400 font-bold font-mono">{flight.duration}</span>
                        <div className="w-full h-0.5 bg-slate-100 relative my-1">
                          <Plane className="w-3.5 h-3.5 text-indigo-600 absolute inset-0 mx-auto -top-1.5" />
                        </div>
                        <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          {flight.stops}
                        </span>
                      </div>

                      <div className="text-center md:text-right">
                        <span className="block text-base font-black text-slate-800 font-mono">{flight.arrivalTime}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                          {toCountry.substring(toCountry.indexOf("(") + 1, toCountry.indexOf(")"))}
                        </span>
                      </div>
                    </div>

                    {/* Fare & Booking */}
                    <div className="flex items-center md:flex-col justify-between w-full md:w-auto gap-4 border-t border-slate-50 md:border-0 pt-4 md:pt-0">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">{flight.classStyle}</span>
                        <span className="text-xl font-extrabold text-slate-900 font-mono">${flight.price}</span>
                      </div>
                      
                      <button
                        onClick={() => handleBookFlight(flight)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                          selectedFlight?.id === flight.id
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        <span>{t.btnBookDummyTicket}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Passenger form for dummy ticket - scrolls in view upon selection */}
              {selectedFlight && (
                <div id="passenger-data-form" className="bg-white rounded-3xl border border-indigo-100 p-6 md:p-8 shadow-sm space-y-6">
                  <div className="border-b border-slate-50 pb-5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      Step 2: Generate Ticket (PDF)
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-2">{t.modalDummyTicketTitle}</h4>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                      {t.modalDummyTicketDesc}
                    </p>
                  </div>

                  <form onSubmit={handleGeneratePDFBoarding} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Passenger 1 Heading */}
                    <div className="md:col-span-2 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-sm font-bold text-slate-800">
                        {lang === "ar" ? "بيانات المسافر الأول (الأساسي)" : "Passenger 1 (Primary Traveler)"}
                      </h4>
                    </div>

                    {/* Passenger 1 Full Name */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {lang === "ar" ? "الاسم الكامل للمسافر الأول (مطابق للجواز)" : "Passenger 1 Full Name (Matches Passport)"}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          required
                          value={p1Name}
                          onChange={(e) => setP1Name(e.target.value)}
                          placeholder="e.g., AHMED SAYED"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Passport */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {lang === "ar" ? "رقم جواز السفر" : "Passport Number"}
                      </label>
                      <input
                        type="text"
                        required
                        value={p1Passport}
                        onChange={(e) => setP1Passport(e.target.value)}
                        placeholder={t.passportPlaceholder}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
                      />
                    </div>

                    {/* Preferred Seat */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {t.passengerSeat}
                      </label>
                      <select
                        value={p1Seat}
                        onChange={(e) => setP1Seat(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
                      >
                        <option value="14A (Window / نافذة)">14A (Window / نافذة)</option>
                        <option value="14K (Window / نافذة)">14K (Window / نافذة)</option>
                        <option value="12D (Aisle / ممر)">12D (Aisle / ممر)</option>
                        <option value="15C (Aisle / ممر)">15C (Aisle / ممر)</option>
                        <option value="10E (Middle / وسط)">10E (Middle / وسط)</option>
                      </select>
                    </div>

                    {/* Nationality */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {t.nationalityLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={p1Nationality}
                        onChange={(e) => setP1Nationality(e.target.value)}
                        placeholder="e.g., Egyptian"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
                      />
                    </div>

                    {/* DOB */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {lang === "ar" ? "تاريخ الميلاد للمسافر الأول" : "Passenger 1 DOB (Date of Birth)"}
                      </label>
                      <input
                        type="date"
                        required
                        value={p1Dob}
                        onChange={(e) => setP1Dob(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-slate-800"
                      />
                    </div>

                    {/* Toggle Passenger 2 Section */}
                    <div className="md:col-span-2 border border-slate-150 bg-slate-50/50 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h5 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-emerald-600" />
                          <span>{lang === "ar" ? "إضافة بيانات مسافر ٢ (عائلي / رفيق)" : "Add Passenger 2 Details (Companion)"}</span>
                        </h5>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {lang === "ar" ? "قم بتفعيل هذا الخيار لإضافة مرافق منفصل برقم حجز (PNR) ومقعد مختلفين تماماً" : "Enable to inject details for a second traveler with their own unique reservation reference code and seat."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setP2Enabled(!p2Enabled)}
                        className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                          p2Enabled
                            ? "bg-rose-500 hover:bg-rose-600 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        {p2Enabled ? (lang === "ar" ? "تعطيل وإلغاء مسافر ٢" : "Deactivate Passenger 2") : (lang === "ar" ? "تفعيل وإضافة بيانات مسافر ٢" : "Activate Passenger 2")}
                      </button>
                    </div>

                    {/* Passenger 2 section if enabled */}
                    {p2Enabled && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border border-indigo-50 bg-indigo-50/10 rounded-3xl animate-fade-in">
                        {/* Heading */}
                        <div className="md:col-span-2 border-b border-indigo-100/50 pb-2 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-rose-600" />
                          <h4 className="text-sm font-extrabold text-indigo-900">
                            {lang === "ar" ? "بيانات المسافر الثاني (بيانات مسافر ٢)" : "Passenger 2 Details (Companion)"}
                          </h4>
                        </div>

                        {/* Passenger 2 Full Name */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                            {lang === "ar" ? "الاسم الكامل لمسافر ٢" : "Passenger 2 Full Name"}
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                            <input
                              type="text"
                              required={p2Enabled}
                              value={p2Name}
                              onChange={(e) => setP2Name(e.target.value)}
                              placeholder="e.g., MARIAM SAYED"
                              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
                            />
                          </div>
                        </div>

                        {/* Passenger 2 Passport */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                            {lang === "ar" ? "رقم جواز سفر مسافر ٢" : "Passenger 2 Passport Number"}
                          </label>
                          <input
                            type="text"
                            required={p2Enabled}
                            value={p2Passport}
                            onChange={(e) => setP2Passport(e.target.value)}
                            placeholder="A00000000"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
                          />
                        </div>

                        {/* Passenger 2 Preferred Seat */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                            {lang === "ar" ? "المقعد لمسافر ٢" : "Passenger 2 Seat"}
                          </label>
                          <select
                            value={p2Seat}
                            onChange={(e) => setP2Seat(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
                          >
                            <option value="14A (Window / نافذة)">14A (Window / نافذة)</option>
                            <option value="14K (Window / نافذة)">14K (Window / نافذة)</option>
                            <option value="12D (Aisle / ممر)">12D (Aisle / ممر)</option>
                            <option value="15C (Aisle / ممر)">15C (Aisle / ممر)</option>
                            <option value="10E (Middle / وسط)">10E (Middle / وسط)</option>
                          </select>
                        </div>

                        {/* Passenger 2 Nationality */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                            {lang === "ar" ? "الجنسية لمسافر ٢" : "Passenger 2 Nationality"}
                          </label>
                          <input
                            type="text"
                            required={p2Enabled}
                            value={p2Nationality}
                            onChange={(e) => setP2Nationality(e.target.value)}
                            placeholder="e.g., Egyptian"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800"
                          />
                        </div>

                        {/* Passenger 2 DOB */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                            {lang === "ar" ? "تاريخ ميلاد مسافر ٢" : "Passenger 2 Date of Birth"}
                          </label>
                          <input
                            type="date"
                            required={p2Enabled}
                            value={p2Dob}
                            onChange={(e) => setP2Dob(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* High-Fidelity Confirmed Ticket Simulation Details */}
                    <div className="md:col-span-2 border border-dashed border-indigo-200 bg-indigo-50/20 p-5 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-indigo-100/50">
                        <h5 className="text-xs font-extrabold text-indigo-700 tracking-wider uppercase flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>{lang === "ar" ? "تفاصيل تذكرة الطيرون المؤكدة (محاكاة كاملة للأصل)" : "E-Ticket Authenticity Simulation Details"}</span>
                        </h5>
                        <button
                          type="button"
                          onClick={refreshBookingCodes}
                          className="flex items-center gap-1 py-1 px-2.5 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700 hover:bg-indigo-50 active:scale-95 transition-all shadow-sm"
                        >
                          <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin-hover" />
                          <span>{lang === "ar" ? "توليد كود ومقعد جديد" : "Generate New PNR & Seat"}</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">
                            {lang === "ar" ? "رقم الرحلة" : "Flight Number"}
                          </label>
                          <input
                            type="text"
                            required
                            value={flightNoCustom}
                            onChange={(e) => setFlightNoCustom(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">
                            {lang === "ar" ? "طراز الطائرة والشركة" : "Aircraft / Plane Type"}
                          </label>
                          <input
                            type="text"
                            required
                            value={aircraftType}
                            onChange={(e) => setAircraftType(e.target.value)}
                            placeholder="e.g., Boeing 777-300ER"
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>

                        {/* Passenger 1 PNR & Ticket */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-indigo-700 uppercase">
                            {lang === "ar" ? "رمز كود حجز المسافر الأول (PNR 1)" : "Passenger 1 PNR Reference (PNR 1)"}
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={p1PnrCode}
                            onChange={(e) => setP1PnrCode(e.target.value.toUpperCase())}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-indigo-700 uppercase">
                            {lang === "ar" ? "رقم تذكرة المسافر الأول الإلكترونية" : "Passenger 1 E-Ticket Number"}
                          </label>
                          <input
                            type="text"
                            required
                            value={p1TicketNum}
                            onChange={(e) => setP1TicketNum(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>

                        {/* Passenger 2 PNR & Ticket (Highly discrete!) */}
                        {p2Enabled && (
                          <>
                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-rose-600 uppercase">
                                {lang === "ar" ? "رمز كود حجز المسافر الثاني (PNR 2)" : "Passenger 2 PNR Reference (PNR 2)"}
                              </label>
                              <input
                                type="text"
                                required={p2Enabled}
                                maxLength={6}
                                value={p2PnrCode}
                                onChange={(e) => setP2PnrCode(e.target.value.toUpperCase())}
                                className="w-full px-3 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-rose-600 uppercase">
                                {lang === "ar" ? "رقم تذكرة المسافر الثاني الإلكترونية" : "Passenger 2 E-Ticket Number"}
                              </label>
                              <input
                                type="text"
                                required={p2Enabled}
                                value={p2TicketNum}
                                onChange={(e) => setP2TicketNum(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              />
                            </div>
                          </>
                        )}

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">
                            {lang === "ar" ? "مبنى الإقلاع ومطار القيام" : "Departure Terminal & Airport"}
                          </label>
                          <input
                            type="text"
                            required
                            value={depTerminal}
                            onChange={(e) => setDepTerminal(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">
                            {lang === "ar" ? "مبنى الهبوط ومطار الوصول" : "Arrival/Landing Terminal & Airport"}
                          </label>
                          <input
                            type="text"
                            required
                            value={arrTerminal}
                            onChange={(e) => setArrTerminal(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">
                            {lang === "ar" ? "الحقائب والوزن المسموح بالرحلة" : "Checked & Cabin Baggage Allowance"}
                          </label>
                          <input
                            type="text"
                            required
                            value={baggage}
                            onChange={(e) => setBaggage(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit generate */}
                    <div className="md:col-span-2 pt-2">
                      <button
                        type="submit"
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Printer className="w-5 h-5" />
                        <span>
                          {p2Enabled 
                            ? (lang === "ar" ? "طباعة تذاكر المسافرين (ملفان منفصلان)" : "Print E-Tickets for Both Passengers (2 PDFs)") 
                            : (lang === "ar" ? "طباعة تذكرة المسافر الأول" : "Print Passenger 1 E-Ticket (PDF)")}
                        </span>
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
