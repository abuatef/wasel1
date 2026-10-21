import { CheckpointInfo, CityData, Coordinates } from '../types';

export const PALESTINIAN_CITIES: CityData[] = [
  {
    id: 'hebron',
    nameAr: 'الخليل',
    nameEn: 'Hebron',
    region: 'south',
    coords: { lat: 31.5326, lng: 35.0998 },
    isMajorHub: true,
  },
  {
    id: 'bethlehem',
    nameAr: 'بيت لحم',
    nameEn: 'Bethlehem',
    region: 'south',
    coords: { lat: 31.7054, lng: 35.2024 },
    isMajorHub: false,
  },
  {
    id: 'jerusalem',
    nameAr: 'القدس',
    nameEn: 'Jerusalem',
    region: 'jerusalem',
    coords: { lat: 31.7683, lng: 35.2137 },
    isMajorHub: true,
  },
  {
    id: 'ramallah',
    nameAr: 'رام الله والبيرة',
    nameEn: 'Ramallah & Al-Bireh',
    region: 'center',
    coords: { lat: 31.9038, lng: 35.2034 },
    isMajorHub: true,
  },
  {
    id: 'jericho',
    nameAr: 'أريحا والأغوار',
    nameEn: 'Jericho',
    region: 'center',
    coords: { lat: 31.8611, lng: 35.4616 },
    isMajorHub: false,
  },
  {
    id: 'salfit',
    nameAr: 'سلفيت',
    nameEn: 'Salfit',
    region: 'center',
    coords: { lat: 32.0833, lng: 35.1833 },
    isMajorHub: false,
  },
  {
    id: 'nablus',
    nameAr: 'نابلس',
    nameEn: 'Nablus',
    region: 'north',
    coords: { lat: 32.2211, lng: 35.2544 },
    isMajorHub: true,
  },
  {
    id: 'qalqilya',
    nameAr: 'قلقيلية',
    nameEn: 'Qalqilya',
    region: 'north',
    coords: { lat: 32.1903, lng: 34.9708 },
    isMajorHub: false,
  },
  {
    id: 'tulkarm',
    nameAr: 'طولكرم',
    nameEn: 'Tulkarm',
    region: 'north',
    coords: { lat: 32.3113, lng: 35.0275 },
    isMajorHub: true,
  },
  {
    id: 'tubas',
    nameAr: 'طوباس',
    nameEn: 'Tubas',
    region: 'north',
    coords: { lat: 32.3211, lng: 35.3697 },
    isMajorHub: false,
  },
  {
    id: 'jenin',
    nameAr: 'جنين',
    nameEn: 'Jenin',
    region: 'north',
    coords: { lat: 32.4608, lng: 35.3009 },
    isMajorHub: true,
  },
];

// Actual highway inter-city distances (KM) and normal travel minutes
export const INTERCITY_MATRIX: Record<string, Record<string, { km: number; mins: number }>> = {
  hebron: {
    ramallah: { km: 65, mins: 80 }, // Via Wadi al-Nar bypass
    bethlehem: { km: 24, mins: 30 },
    nablus: { km: 110, mins: 130 },
    jenin: { km: 153, mins: 175 },
    jericho: { km: 75, mins: 90 },
    jerusalem: { km: 38, mins: 50 },
    tulkarm: { km: 142, mins: 160 },
    qalqilya: { km: 130, mins: 145 },
    salfit: { km: 92, mins: 110 },
    tubas: { km: 132, mins: 150 },
  },
  ramallah: {
    hebron: { km: 65, mins: 80 },
    bethlehem: { km: 42, mins: 55 },
    nablus: { km: 45, mins: 50 },
    jenin: { km: 88, mins: 100 },
    jericho: { km: 38, mins: 45 },
    jerusalem: { km: 18, mins: 30 },
    tulkarm: { km: 77, mins: 85 },
    qalqilya: { km: 65, mins: 75 },
    salfit: { km: 35, mins: 40 },
    tubas: { km: 67, mins: 75 },
  },
  nablus: {
    hebron: { km: 110, mins: 130 },
    ramallah: { km: 45, mins: 50 },
    jenin: { km: 43, mins: 45 },
    tulkarm: { km: 32, mins: 40 },
    qalqilya: { km: 34, mins: 42 },
    tubas: { km: 25, mins: 30 },
    salfit: { km: 26, mins: 32 },
    jericho: { km: 72, mins: 75 },
    bethlehem: { km: 87, mins: 105 },
    jerusalem: { km: 63, mins: 75 },
  },
  jenin: {
    nablus: { km: 43, mins: 45 },
    ramallah: { km: 88, mins: 100 },
    hebron: { km: 153, mins: 175 },
    tulkarm: { km: 48, mins: 50 },
    tubas: { km: 28, mins: 32 },
    qalqilya: { km: 65, mins: 70 },
    jericho: { km: 115, mins: 120 },
    bethlehem: { km: 130, mins: 150 },
    jerusalem: { km: 106, mins: 125 },
    salfit: { km: 69, mins: 75 },
  },
  bethlehem: {
    hebron: { km: 24, mins: 30 },
    ramallah: { km: 42, mins: 55 },
    jerusalem: { km: 10, mins: 20 },
    nablus: { km: 87, mins: 105 },
    jenin: { km: 130, mins: 150 },
    jericho: { km: 40, mins: 50 },
    tulkarm: { km: 119, mins: 135 },
    qalqilya: { km: 107, mins: 120 },
    salfit: { km: 77, mins: 90 },
    tubas: { km: 109, mins: 125 },
  },
};

export const PALESTINIAN_CHECKPOINTS: CheckpointInfo[] = [
  {
    id: 'wadi_alnar',
    nameAr: 'حاجز واد النار (الكونتينر)',
    nameEn: 'Wadi Al-Nar (Container)',
    locationNear: 'بين العبيدية وأبو ديس (شريان الجنوب بالوسط)',
    coords: { lat: 31.748, lng: 35.275 },
    status: 'crowded',
    delayEstimateMins: 35,
    reportedAt: 'منذ 15 دقيقة',
  },
  {
    id: 'zaatara',
    nameAr: 'حاجز زعترة (تقاطع تفوح)',
    nameEn: 'Zaatara Junction',
    locationNear: 'جنوب نابلس / شارع 60',
    coords: { lat: 32.132, lng: 35.257 },
    status: 'crowded',
    delayEstimateMins: 25,
    reportedAt: 'منذ 22 دقيقة',
  },
  {
    id: 'huwwara',
    nameAr: 'حاجز حوارة',
    nameEn: 'Huwwara Checkpoint',
    locationNear: 'المدخل الجنوبي لمدينة نابلس',
    coords: { lat: 32.181, lng: 35.267 },
    status: 'normal',
    delayEstimateMins: 10,
    reportedAt: 'منذ 5 دقائق',
  },
  {
    id: 'qalandia',
    nameAr: 'حاجز قلنديا',
    nameEn: 'Qalandia Checkpoint',
    locationNear: 'بين القدس ورام الله',
    coords: { lat: 31.864, lng: 35.228 },
    status: 'crowded',
    delayEstimateMins: 40,
    reportedAt: 'منذ 10 دقائق',
  },
  {
    id: 'atara',
    nameAr: 'حاجز عطارة / جبع',
    nameEn: 'Atara / Jaba',
    locationNear: 'شمال رام الله ومفرق بيرزيت',
    coords: { lat: 31.988, lng: 35.195 },
    status: 'normal',
    delayEstimateMins: 8,
    reportedAt: 'منذ 30 دقيقة',
  },
  {
    id: 'tarqumiya',
    nameAr: 'حاجز ترقوميا',
    nameEn: 'Tarqumiya',
    locationNear: 'غرب الخليل',
    coords: { lat: 31.579, lng: 34.985 },
    status: 'normal',
    delayEstimateMins: 5,
    reportedAt: 'منذ ساعة',
  },
];

/**
 * Haversine formula for spherical distance between two points in KM
 */
export function haversineDistance(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Gets highway distance & travel time between any two cities
 */
export function getIntercityDistance(fromCityId: string, toCityId: string): { km: number; mins: number } {
  if (fromCityId === toCityId) {
    return { km: 5, mins: 15 }; // intra-city standard
  }

  const direct = INTERCITY_MATRIX[fromCityId]?.[toCityId];
  if (direct) return direct;

  const reverse = INTERCITY_MATRIX[toCityId]?.[fromCityId];
  if (reverse) return reverse;

  // Fallback: calculate using coordinates with realistic winding mountain detour factor 1.35x
  const fromCity = PALESTINIAN_CITIES.find((c) => c.id === fromCityId);
  const toCity = PALESTINIAN_CITIES.find((c) => c.id === toCityId);

  if (fromCity && toCity) {
    const rawKm = haversineDistance(fromCity.coords, toCity.coords);
    const roadKm = Math.round(rawKm * 1.35);
    const estMins = Math.round(roadKm * 1.15 + 10);
    return { km: roadKm, mins: estMins };
  }

  return { km: 50, mins: 60 };
}

/**
 * Finds checkpoints along or near a route between two cities
 */
export function getCheckpointsForRoute(fromCityId: string, toCityId: string): CheckpointInfo[] {
  const isSouthToCenter =
    (fromCityId === 'hebron' || fromCityId === 'bethlehem') &&
    (toCityId === 'ramallah' || toCityId === 'nablus' || toCityId === 'jenin');
  const isCenterToSouth =
    (fromCityId === 'ramallah' || fromCityId === 'nablus' || fromCityId === 'jenin') &&
    (toCityId === 'hebron' || toCityId === 'bethlehem');

  const isNorthToCenter =
    (fromCityId === 'nablus' || fromCityId === 'jenin') &&
    (toCityId === 'ramallah' || toCityId === 'jerusalem' || toCityId === 'hebron');
  const isCenterToNorth =
    (fromCityId === 'ramallah' || fromCityId === 'jerusalem') &&
    (toCityId === 'nablus' || toCityId === 'jenin');

  const checkpoints: CheckpointInfo[] = [];

  if (isSouthToCenter || isCenterToSouth) {
    const wadi = PALESTINIAN_CHECKPOINTS.find((cp) => cp.id === 'wadi_alnar');
    if (wadi) checkpoints.push(wadi);
  }

  if (isNorthToCenter || isCenterToNorth) {
    const zaatara = PALESTINIAN_CHECKPOINTS.find((cp) => cp.id === 'zaatara');
    if (zaatara) checkpoints.push(zaatara);
  }

  return checkpoints;
}

/**
 * Smart Radial & Waypoint Corridor Matching
 * Checks if a parcel (pickup -> dropoff) lies along a driver's backhaul trip (driverOrigin -> driverDest)
 * with tolerable detour and direction alignment.
 */
export function isParcelOnDriverCorridor(
  driverOriginId: string,
  driverDestId: string,
  parcelPickupCityId: string,
  parcelDropoffCityId: string,
  toleranceKm: number = 10
): {
  isMatch: boolean;
  score: number; // 0 to 100
  detourKm: number;
  reasonAr: string;
} {
  // Case 1: Exact city-to-city match
  if (driverOriginId === parcelPickupCityId && driverDestId === parcelDropoffCityId) {
    return {
      isMatch: true,
      score: 100,
      detourKm: 0,
      reasonAr: 'تطابق تام على نفس خط السير المباشر بدون أي انحراف (0 كم)',
    };
  }

  // Case 2: Origin is on the way, same destination
  // E.g. Driver is returning Ramallah -> Hebron, parcel is Bethlehem -> Hebron
  const driverDirect = getIntercityDistance(driverOriginId, driverDestId);
  const distToPickup = getIntercityDistance(driverOriginId, parcelPickupCityId);
  const distPickupToDrop = getIntercityDistance(parcelPickupCityId, parcelDropoffCityId);
  const distDropToDest = getIntercityDistance(parcelDropoffCityId, driverDestId);

  const totalTripWithParcel = distToPickup.km + distPickupToDrop.km + distDropToDest.km;
  const detourKm = Math.max(0, totalTripWithParcel - driverDirect.km);

  if (detourKm <= toleranceKm) {
    const score = Math.round(100 - (detourKm / toleranceKm) * 35);
    return {
      isMatch: true,
      score,
      detourKm,
      reasonAr: `نقطة توقف مثالية على المسار (انحراف بسيط: ${detourKm} كم فقط)`,
    };
  }

  return {
    isMatch: false,
    score: 0,
    detourKm,
    reasonAr: `خارج مسار العودة (يتطلب انحرافاً كبيراً: ${detourKm} كم)`,
  };
}
