import { Coordinates } from '../types';
import { PALESTINIAN_CITIES, haversineDistance } from './geo';

export interface RouteWaypointInfo {
  coords: Coordinates;
  landmarkAr: string;
  speedKmh: number;
}

// Detailed realistic road corridors in the West Bank
export const DETAILED_ROUTES: Record<string, Record<string, RouteWaypointInfo[]>> = {
  ramallah: {
    hebron: [
      { coords: { lat: 31.9038, lng: 35.2034 }, landmarkAr: 'دوار المنارة - مركز رام الله', speedKmh: 35 },
      { coords: { lat: 31.8890, lng: 35.2110 }, landmarkAr: 'شارع القدس - مفرق كفر عقب', speedKmh: 45 },
      { coords: { lat: 31.8320, lng: 35.2450 }, landmarkAr: 'مفرق حزما / جبع', speedKmh: 65 },
      { coords: { lat: 31.7950, lng: 35.2650 }, landmarkAr: 'الزعيم وأبو ديس', speedKmh: 60 },
      { coords: { lat: 31.7580, lng: 35.2710 }, landmarkAr: 'بلدة العبيدية - مدخل واد النار', speedKmh: 50 },
      { coords: { lat: 31.7480, lng: 35.2750 }, landmarkAr: 'حاجز واد النار (الكونتينر)', speedKmh: 20 },
      { coords: { lat: 31.7250, lng: 35.2450 }, landmarkAr: 'منحدرات واد النار باتجاه دار صلاح', speedKmh: 45 },
      { coords: { lat: 31.7054, lng: 35.2024 }, landmarkAr: 'التفافي بيت لحم - مفرق النشاش', speedKmh: 70 },
      { coords: { lat: 31.6450, lng: 35.1480 }, landmarkAr: 'شارع 60 - محيط مخيم العروب', speedKmh: 65 },
      { coords: { lat: 31.5950, lng: 35.1150 }, landmarkAr: 'بلدة بيت أمر وكركفة', speedKmh: 70 },
      { coords: { lat: 31.5720, lng: 35.1050 }, landmarkAr: 'مدخل حلحول الشمالي (النبي يونس)', speedKmh: 50 },
      { coords: { lat: 31.5450, lng: 35.1010 }, landmarkAr: 'راس الجورة - المدخل الشمالي للخليل', speedKmh: 40 },
      { coords: { lat: 31.5326, lng: 35.0998 }, landmarkAr: 'دوار ابن رشد - وسط مدينة الخليل', speedKmh: 25 },
    ],
  },
  nablus: {
    jenin: [
      { coords: { lat: 32.2211, lng: 35.2544 }, landmarkAr: 'دوار الشهداء - وسط نابلس', speedKmh: 35 },
      { coords: { lat: 32.2450, lng: 35.2350 }, landmarkAr: 'شارع بيت ايبا - زواتا', speedKmh: 55 },
      { coords: { lat: 32.2850, lng: 35.2150 }, landmarkAr: 'بلدة دير شرف', speedKmh: 65 },
      { coords: { lat: 32.3350, lng: 35.2280 }, landmarkAr: 'مفرق بزاريا وسيلة الظهر', speedKmh: 70 },
      { coords: { lat: 32.3850, lng: 35.2550 }, landmarkAr: 'الفندقومية وجبع جنين', speedKmh: 60 },
      { coords: { lat: 32.4250, lng: 35.2850 }, landmarkAr: 'مثلث الشهداء ومحيط قباطية', speedKmh: 70 },
      { coords: { lat: 32.4608, lng: 35.3009 }, landmarkAr: 'شارع فلسطين - مركز جنين', speedKmh: 30 },
    ],
  },
};

/**
 * Gets or dynamically generates realistic waypoints for any inter-city route
 */
export function getRouteWaypoints(fromCityId: string, toCityId: string): RouteWaypointInfo[] {
  // Check predefined detailed routes
  if (DETAILED_ROUTES[fromCityId]?.[toCityId]) {
    return DETAILED_ROUTES[fromCityId][toCityId];
  }

  // Reverse route if available
  if (DETAILED_ROUTES[toCityId]?.[fromCityId]) {
    const reversed = [...DETAILED_ROUTES[toCityId][fromCityId]].reverse();
    return reversed;
  }

  // Fallback: interpolate points between cities
  const fromCity = PALESTINIAN_CITIES.find((c) => c.id === fromCityId);
  const toCity = PALESTINIAN_CITIES.find((c) => c.id === toCityId);

  if (!fromCity || !toCity) {
    return [
      { coords: { lat: 31.9038, lng: 35.2034 }, landmarkAr: 'نقطة الانطلاق', speedKmh: 50 },
      { coords: { lat: 31.5326, lng: 35.0998 }, landmarkAr: 'نقطة الوصول', speedKmh: 50 },
    ];
  }

  const steps = 8;
  const result: RouteWaypointInfo[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = fromCity.coords.lat + (toCity.coords.lat - fromCity.coords.lat) * t;
    const lng = fromCity.coords.lng + (toCity.coords.lng - fromCity.coords.lng) * t;
    const pct = Math.round(t * 100);

    result.push({
      coords: { lat, lng },
      landmarkAr:
        i === 0
          ? `نقطة الانطلاق: ${fromCity.nameAr}`
          : i === steps
          ? `نقطة التسليم: ${toCity.nameAr}`
          : `شارع الربط الإقليمي (${pct}% من المسار)`,
      speedKmh: i === 0 || i === steps ? 30 : 65,
    });
  }

  return result;
}

export interface LiveDriverLocationState {
  currentCoords: Coordinates;
  currentLandmark: string;
  progressPct: number; // 0 to 100
  speedKmh: number;
  bearingDeg: number;
  remainingDistanceKm: number;
  remainingMinutes: number;
  isNearDestination: boolean;
  passedWaypoints: Coordinates[];
}

/**
 * Calculates current live driver coordinates along a simulated route progression (progress 0 to 1)
 */
export function interpolateDriverRouteLocation(
  fromCityId: string,
  toCityId: string,
  progress: number // 0.0 to 1.0
): LiveDriverLocationState {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const waypoints = getRouteWaypoints(fromCityId, toCityId);

  if (waypoints.length === 0) {
    return {
      currentCoords: { lat: 31.9, lng: 35.2 },
      currentLandmark: 'الموقع غير محدد',
      progressPct: 0,
      speedKmh: 0,
      bearingDeg: 0,
      remainingDistanceKm: 0,
      remainingMinutes: 0,
      isNearDestination: false,
      passedWaypoints: [],
    };
  }

  const totalSegments = waypoints.length - 1;
  const segmentFloat = clampedProgress * totalSegments;
  const segmentIndex = Math.min(Math.floor(segmentFloat), totalSegments - 1);
  const segmentFraction = segmentFloat - segmentIndex;

  const p1 = waypoints[segmentIndex];
  const p2 = waypoints[segmentIndex + 1] || p1;

  // Linear coordinate interpolation
  const lat = p1.coords.lat + (p2.coords.lat - p1.coords.lat) * segmentFraction;
  const lng = p1.coords.lng + (p2.coords.lng - p1.coords.lng) * segmentFraction;

  // Bearing angle calculation in degrees (0 to 360)
  const dLat = p2.coords.lat - p1.coords.lat;
  const dLng = p2.coords.lng - p1.coords.lng;
  let angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  if (angle < 0) angle += 360;

  // Calculate remaining distance from current interpolated position to final destination
  let remDist = haversineDistance({ lat, lng }, p2.coords);
  for (let j = segmentIndex + 1; j < totalSegments; j++) {
    remDist += haversineDistance(waypoints[j].coords, waypoints[j + 1].coords);
  }
  remDist = Number(remDist.toFixed(1));

  // Current speed interpolated
  const speedKmh = Math.round(p1.speedKmh + (p2.speedKmh - p1.speedKmh) * segmentFraction);

  // Remaining minutes based on speed and road factor
  const remainingMinutes = Math.max(1, Math.round((remDist / Math.max(30, speedKmh)) * 60));

  const passedWaypoints: Coordinates[] = waypoints
    .slice(0, segmentIndex + 1)
    .map((w) => w.coords);
  passedWaypoints.push({ lat, lng });

  return {
    currentCoords: { lat, lng },
    currentLandmark: p1.landmarkAr,
    progressPct: Math.round(clampedProgress * 100),
    speedKmh,
    bearingDeg: Math.round(angle),
    remainingDistanceKm: remDist,
    remainingMinutes,
    isNearDestination: clampedProgress >= 0.92,
    passedWaypoints,
  };
}
