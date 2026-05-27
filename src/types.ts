export type Language = "ar" | "en";

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location: string;
}

export interface ItineraryRestaurant {
  name: string;
  type: string;
  tip: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  activities: ItineraryActivity[];
  restaurants: ItineraryRestaurant[];
}

export interface ItineraryPlan {
  country: string;
  duration: number;
  overview: string;
  days: ItineraryDay[];
  essentialTips: string[];
}

export interface MuseumItem {
  name: string;
  location: string;
  ticketType: string;
  bookingGuide: string;
  officialSite: string;
}

export interface EventPlatform {
  platform: string;
  guide: string;
}

export interface LocalEvent {
  title: string;
  description: string;
  monthOrSeason: string;
}

export interface MuseumEventsData {
  country: string;
  city: string;
  museums: MuseumItem[];
  eventsPlatforms: EventPlatform[];
  upcomingLocalEvents: LocalEvent[];
}

export interface FlightOption {
  id: string;
  airline: string;
  logo: string;
  flightNo: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: string;
  classStyle: string;
}

export interface HotelOption {
  id: string;
  name: string;
  location: string;
  stars: number;
  pricePerNight: number;
  rating: number;
  image: string;
  amenities: string[];
}
