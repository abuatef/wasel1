import React, { useEffect, useRef, useState } from 'react';
import {
  PALESTINIAN_CHECKPOINTS,
  PALESTINIAN_CITIES,
} from '../../utils/geo';
import { CheckpointInfo, CityData, Coordinates, Driver, Order } from '../../types';
import { MapPin, Navigation, AlertTriangle, ShieldCheck, Layers, Eye, RefreshCw, Radio } from 'lucide-react';

interface PalestineMapProps {
  activeDriver?: Driver;
  activeOrder?: Order;
  highlightRoute?: { fromCityId: string; toCityId: string };
  showCheckpoints?: boolean;
  showCorridor?: boolean;
  simulatedDriverCoords?: Coordinates;
  simulatedHeadingDeg?: number;
  simulatedSpeedKmh?: number;
  simulatedLandmark?: string;
  passedBreadcrumbs?: Coordinates[];
  onSelectCity?: (city: CityData) => void;
  onSelectCheckpoint?: (checkpoint: CheckpointInfo) => void;
}

export const PalestineMap: React.FC<PalestineMapProps> = ({
  activeDriver,
  activeOrder,
  highlightRoute,
  showCheckpoints = true,
  showCorridor = true,
  simulatedDriverCoords,
  simulatedHeadingDeg = 0,
  simulatedSpeedKmh = 50,
  simulatedLandmark,
  passedBreadcrumbs = [],
  onSelectCity,
  onSelectCheckpoint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [mapEngineLoaded, setMapEngineLoaded] = useState<boolean>(false);
  const [selectedPin, setSelectedPin] = useState<{ title: string; subtitle: string; type: string } | null>(null);

  // Fallback SVG coordinates projector (maps lat 31.4 to 32.6, lng 34.8 to 35.6 to SVG viewport 600x800)
  const projectToSvg = (coords: Coordinates) => {
    const minLat = 31.35;
    const maxLat = 32.65;
    const minLng = 34.85;
    const maxLng = 35.65;

    const x = ((coords.lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - coords.lat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (!mapContainerRef.current) return;
      try {
        const L = (await import('leaflet')).default;
        if (!isMounted) return;

        // Check if already initialized
        if (!leafletMapRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [31.85, 35.20],
            zoom: 9,
            zoomControl: false,
            attributionControl: false,
          });

          // Add reliable standard OpenStreetMap tiles
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
          }).addTo(map);

          L.control.zoom({ position: 'bottomleft' }).addTo(map);

          const layerGroup = L.layerGroup().addTo(map);
          leafletMapRef.current = map;
          layerGroupRef.current = layerGroup;
          setMapEngineLoaded(true);
        }
      } catch (err) {
        console.warn('Leaflet tile loading fallback to interactive SVG network:', err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Leaflet layers when props change
  useEffect(() => {
    if (!leafletMapRef.current || !layerGroupRef.current) return;

    import('leaflet').then(({ default: L }) => {
      const layerGroup = layerGroupRef.current;
      layerGroup.clearLayers();

      // 1. Plot Palestinian Cities
      PALESTINIAN_CITIES.forEach((city) => {
        const isFrom = highlightRoute?.fromCityId === city.id;
        const isTo = highlightRoute?.toCityId === city.id;

        const markerColor = isFrom ? '#10b981' : isTo ? '#f43f5e' : '#3b82f6';
        const markerRadius = isFrom || isTo ? 8 : city.isMajorHub ? 6 : 4;

        const circle = L.circleMarker([city.coords.lat, city.coords.lng], {
          radius: markerRadius,
          color: '#ffffff',
          weight: 2,
          fillColor: markerColor,
          fillOpacity: 0.9,
        });

        circle.bindTooltip(
          `<strong>${city.nameAr}</strong><br/><span style="font-size:11px;color:#64748b;">${city.nameEn}</span>`,
          { direction: 'top' }
        );

        circle.on('click', () => {
          setSelectedPin({
            title: city.nameAr,
            subtitle: `محافظة فلسطينية (${city.nameEn})`,
            type: 'city',
          });
          onSelectCity?.(city);
        });

        circle.addTo(layerGroup);
      });

      // 2. Plot Route Polyline & Corridor if active
      if (highlightRoute?.fromCityId && highlightRoute?.toCityId) {
        const fromCity = PALESTINIAN_CITIES.find((c) => c.id === highlightRoute.fromCityId);
        const toCity = PALESTINIAN_CITIES.find((c) => c.id === highlightRoute.toCityId);

        if (fromCity && toCity) {
          const latlngs: [number, number][] = [
            [fromCity.coords.lat, fromCity.coords.lng],
          ];

          if (
            (fromCity.id === 'ramallah' && toCity.id === 'hebron') ||
            (fromCity.id === 'hebron' && toCity.id === 'ramallah')
          ) {
            latlngs.push([31.8890, 35.2110]);
            latlngs.push([31.8320, 35.2450]);
            latlngs.push([31.7950, 35.2650]);
            latlngs.push([31.7580, 35.2710]);
            latlngs.push([31.7480, 35.2750]); // Wadi al-Nar
            latlngs.push([31.7054, 35.2024]); // Bethlehem
            latlngs.push([31.6450, 35.1480]);
            latlngs.push([31.5720, 35.1050]); // Halhul
          } else if (
            (fromCity.id === 'ramallah' && toCity.id === 'nablus') ||
            (fromCity.id === 'nablus' && toCity.id === 'ramallah')
          ) {
            latlngs.push([31.988, 35.195]); // Atara
            latlngs.push([32.132, 35.257]); // Za'atara
            latlngs.push([32.181, 35.267]); // Huwwara
          } else if (
            (fromCity.id === 'nablus' && toCity.id === 'jenin') ||
            (fromCity.id === 'jenin' && toCity.id === 'nablus')
          ) {
            latlngs.push([32.285, 35.215]); // Deir Sharaf
            latlngs.push([32.335, 35.228]); // Silat al-Dhahr
            latlngs.push([32.385, 35.255]); // Jaba
          }

          latlngs.push([toCity.coords.lat, toCity.coords.lng]);

          // Draw corridor buffer if requested (Backhaul radial search)
          if (showCorridor) {
            latlngs.forEach((coord) => {
              L.circle(coord, {
                radius: 6500, // ~6.5km radial tolerance corridor
                color: '#10b981',
                weight: 1,
                dashArray: '4, 4',
                fillColor: '#10b981',
                fillOpacity: 0.07,
              }).addTo(layerGroup);
            });
          }

          // Full route line (remaining path)
          const routeLine = L.polyline(latlngs, {
            color: '#10b981',
            weight: 4,
            opacity: 0.7,
            dashArray: '6, 6',
          });
          routeLine.addTo(layerGroup);
        }
      }

      // 3. Draw Passed Breadcrumbs Trail if live driver is moving
      if (passedBreadcrumbs && passedBreadcrumbs.length > 1) {
        const trailPoints: [number, number][] = passedBreadcrumbs.map((c) => [c.lat, c.lng]);
        const trailLine = L.polyline(trailPoints, {
          color: '#059669',
          weight: 6,
          opacity: 0.95,
        });
        trailLine.addTo(layerGroup);
      }

      // 4. Plot Checkpoints
      if (showCheckpoints) {
        PALESTINIAN_CHECKPOINTS.forEach((cp) => {
          const cpMarker = L.circleMarker([cp.coords.lat, cp.coords.lng], {
            radius: cp.status === 'crowded' ? 9 : 6,
            color: cp.status === 'crowded' ? '#ef4444' : '#f59e0b',
            weight: 3,
            fillColor: cp.status === 'crowded' ? '#dc2626' : '#d97706',
            fillOpacity: 0.9,
          });

          cpMarker.bindTooltip(
            `<strong>⚠️ ${cp.nameAr}</strong><br/>تأخير متوقع: ${cp.delayEstimateMins} دقيقة<br/><span style="font-size:10px;color:#94a3b8;">${cp.locationNear}</span>`,
            { direction: 'top' }
          );

          cpMarker.on('click', () => {
            setSelectedPin({
              title: cp.nameAr,
              subtitle: `تأخير متوقع: ${cp.delayEstimateMins} دقيقة (${cp.locationNear})`,
              type: 'checkpoint',
            });
            onSelectCheckpoint?.(cp);
          });

          cpMarker.addTo(layerGroup);
        });
      }

      // 5. Plot Real-Time Live Simulated Driver Location
      const targetDriverCoords = simulatedDriverCoords || activeDriver?.currentLocation;

      if (targetDriverCoords) {
        // Create an immersive custom HTML marker for the moving vehicle
        const liveCarHtml = `
          <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(16,185,129,0.35); animation:ping-slow 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(5,150,105,0.2); border:1px solid #10b981;"></div>
            <div style="width:26px; height:26px; border-radius:50%; background:#10b981; border:2px solid #ffffff; box-shadow:0 4px 12px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; font-size:13px; transform:rotate(${simulatedHeadingDeg}deg); transition:transform 0.4s ease;">
              🚕
            </div>
            <div style="position:absolute; top:-22px; white-space:nowrap; background:#020617; color:#34d399; font-weight:bold; font-size:10px; padding:2px 6px; border-radius:9999px; border:1px solid rgba(16,185,129,0.5); box-shadow:0 2px 6px rgba(0,0,0,0.4); direction:rtl;">
              ${simulatedSpeedKmh} كم/س
            </div>
          </div>
        `;

        const carIcon = L.divIcon({
          html: liveCarHtml,
          className: 'custom-live-car-icon',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const liveMarker = L.marker([targetDriverCoords.lat, targetDriverCoords.lng], {
          icon: carIcon,
          zIndexOffset: 1000,
        });

        liveMarker.bindTooltip(
          `<strong>🚕 ${activeDriver?.name || 'الكابتن على الطريق'}</strong><br/>
           <span>📍 ${simulatedLandmark || 'طريق واد النار السريع'}</span><br/>
           <span style="font-size:10px; color:#10b981;">● تتبع GPS حي ومباشر</span>`,
          { permanent: false, direction: 'top' }
        );

        liveMarker.addTo(layerGroup);
      }
    });
  }, [
    highlightRoute,
    showCheckpoints,
    showCorridor,
    activeDriver,
    activeOrder,
    simulatedDriverCoords,
    simulatedHeadingDeg,
    simulatedSpeedKmh,
    simulatedLandmark,
    passedBreadcrumbs,
    mapEngineLoaded,
  ]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-900 flex flex-col">
      {/* Top Map HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2 text-xs">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">
            {simulatedDriverCoords ? 'تتبع GPS المباشر لمركبة الكابتن' : 'الخريطة المباشرة لشبكة النقل الفلسطينية'}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-400 font-mono text-[11px]">
            {simulatedLandmark || 'شارع 60 وواد النار'}
          </span>
        </div>

        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">نقطة الانطلاق</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">الوجهة</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">حاجز / أزمة</span>
          </div>
        </div>
      </div>

      {/* Primary Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 relative z-[1]">
        {!mapEngineLoaded && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M 45 15 L 43 35 L 38 55 L 42 70 L 35 90"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                  fill="none"
                />

                {PALESTINIAN_CITIES.map((city) => {
                  const pt = projectToSvg(city.coords);
                  const isFrom = highlightRoute?.fromCityId === city.id;
                  const isTo = highlightRoute?.toCityId === city.id;
                  const color = isFrom ? '#10b981' : isTo ? '#f43f5e' : '#60a5fa';

                  return (
                    <g key={city.id} className="cursor-pointer" onClick={() => onSelectCity?.(city)}>
                      <circle cx={pt.x} cy={pt.y} r={isFrom || isTo ? 3.5 : 2} fill={color} />
                      <text
                        x={pt.x}
                        y={pt.y - 3}
                        fill="#f8fafc"
                        fontSize="3"
                        textAnchor="middle"
                        className="font-medium"
                      >
                        {city.nameAr}
                      </text>
                    </g>
                  );
                })}

                {/* Simulated driver point in SVG fallback */}
                {simulatedDriverCoords && (
                  <circle
                    cx={projectToSvg(simulatedDriverCoords).x}
                    cy={projectToSvg(simulatedDriverCoords).y}
                    r={3}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                )}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Floating Card if a pin is clicked */}
      {selectedPin && (
        <div className="absolute bottom-4 right-4 z-[400] max-w-sm bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
          <div>
            <div className="text-xs font-semibold text-emerald-400">
              {selectedPin.type === 'checkpoint' ? '⚠️ تقرير حاجز مروري' : '📍 موقع في الضفة الغربية'}
            </div>
            <div className="text-sm font-bold text-white">{selectedPin.title}</div>
            <div className="text-xs text-slate-300 mt-0.5">{selectedPin.subtitle}</div>
          </div>
          <button
            onClick={() => setSelectedPin(null)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="إغلاق التنبيه"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
