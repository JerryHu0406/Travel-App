
export interface Activity {
  id: string;
  time_slot: string;
  location: string;
  notes: string;
  mapUrl?: string;
}

export interface DailyPlan {
  id: string;
  day: number;
  theme: string;
  activities: Activity[];
}

export interface PackingItem {
  id: string;
  name: string;
  checked: boolean;
  category: string;
}

export type Currency = 'TWD' | 'JPY' | 'USD';

export interface TransportInfo {
  id: string;
  type: '飛機' | '地鐵' | '巴士' | '租車';
  detail: string;
  date?: string; // Departure date for non-rental
  time: string; // Departure time
  arrivalTime?: string;
  terminal?: string; // Departure Terminal
  arrivalTerminal?: string; // Arrival Terminal
  pickupDate?: string;
  returnDate?: string;
  pickupTime?: string;
  returnTime?: string;
  pickupLocation?: string;
  returnLocation?: string;
  isSameLocation?: boolean;
  cost: number;
  currency: Currency;
  flightNumber?: string;
  gate?: string;
  seat?: string;
  images?: string[];
}

export interface ConcertInfo {
  id: string;
  artist: string;
  venue: string;
  date: string;
  merchTime: string;
  entryTime: string;
  startTime: string;
  venueMapUrl?: string;
  seat: string;
  ticketCost: number;
  merchCost: number;
  currency: Currency;
  notes: string;
  checklist: { id: string; name: string; checked: boolean }[];
  imageUrl?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  quantity: number;
  priority: '重要必買' | '不買沒關係' | '在地美食';
  date: string; // Added date field
  imageUrl?: string;
  locationUrl?: string;
  link?: string;
  checked: boolean;
}

export interface Itinerary {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  trip_summary: {
    city: string;
    total_days: number;
    vibe: string[]; // Changed to support multiple selections
  };
  daily_itinerary: DailyPlan[];
  packing_list: PackingItem[];
  transports: TransportInfo[];
  concerts: ConcertInfo[];
  shopping_list: ShoppingItem[];
  createdAt: number;
}
