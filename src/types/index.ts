export type RoomType = 'deluxe' | 'premium' | 'suite' | 'family' | 'villa';

export interface User {
  id?: string;
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: 'guest' | 'staff' | 'manager' | 'admin';
  department?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface MealPlan {
  code: 'ep' | 'cp' | 'map' | 'ap' | string;
  label: string;
  adultPrice: number;
  childPrice: number;
  description?: string;
}

export interface PublicSettings {
  resortName: string;
  tagline: string;
  phone: string;
phoneSecondary: string;
whatsapp: string;
email: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationHours: number;
  mealPlans: MealPlan[];
  social: { instagram?: string; facebook?: string; youtube?: string };
  bookingsOpen: boolean;
  announcement: string;
  assetBaseUrl?: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  name: string;
  slug: string;
  type: RoomType;
  floor?: number;
  status?: string;
  pricePerNight: number;
  maxAdults: number;
  maxChildren: number;
  bedType?: string;
  view?: string;
  size?: number;
  amenities: string[];
  highlights: string[];
  imageUrls: string[];
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  available?: boolean;
}

export interface Quote {
  nights: number;
  pricePerNight: number;
  roomAmount: number;
  mealAmount: number;
  discountAmount: number;
  promoCode?: string;
  promoMessage?: string;
  total: number;
  baseAmount: number;
  gstRate: number;
  gstAmount: number;
}

export interface Payment { _id?: string; amount: number; method: string; reference?: string; note?: string; at: string }
export interface Extra { _id?: string; description: string; amount: number; addedAt?: string; source?: string }

export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';

export interface Booking {
  _id: string;
  bookingRef: string;
  roomId: string | { _id?: string; imageUrls?: string[]; slug?: string; name?: string };
  roomNumber?: string;
  roomName: string;
  roomType?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  mealPlan: string;
  specialRequests?: string;
  status: BookingStatus;
  paymentStatus: 'pending' | 'partial' | 'paid';
  pricePerNight: number;
  roomAmount: number;
  mealAmount: number;
  discountAmount: number;
  promoCode?: string;
  extras?: Extra[];
  extrasTotal?: number;
  gstRate: number;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  payments?: Payment[];
  paidAmount?: number;
  balanceDue?: number;
  source?: string;
  cancelledAt?: string;
  cancelReason?: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  createdAt?: string;
}

export interface ThreadMessage { _id?: string; sender: 'guest' | 'staff'; body: string; staffName?: string; at: string; pending?: boolean }
export type ThreadStatus = 'new' | 'open' | 'resolved';
export interface Thread {
  _id?: string;
  ref: string;
  token?: string;
  name: string;
  subject: string;
  topic: string;
  status: ThreadStatus;
  lastMessageAt: string;
  unreadByGuest?: boolean;
  messages: ThreadMessage[];
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  isVeg: boolean;
  imageUrl?: string;
  isAvailable: boolean;
  isSignature: boolean;
  sortOrder?: number;
}

export interface Review {
  _id: string;
  name: string;
  location?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

export interface Promotion {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percent' | 'flat' | string;
  discountValue: number;
  minNights?: number;
  minAmount?: number;
  maxDiscountAmount?: number;
  validTo?: string;
}
