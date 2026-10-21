import test from 'node:test';
import assert from 'node:assert/strict';
import { getRouteWaypoints, interpolateDriverRouteLocation } from './simulation';

test('getRouteWaypoints returns realistic corridor for Ramallah to Hebron', () => {
  const waypoints = getRouteWaypoints('ramallah', 'hebron');
  assert.ok(waypoints.length >= 10);
  
  // Checks that origin is Ramallah and final point is Hebron
  assert.match(waypoints[0].landmarkAr, /رام الله/);
  assert.match(waypoints[waypoints.length - 1].landmarkAr, /الخليل/);

  // Checks that Wadi al-Nar checkpoint is on the way
  const hasWadiAlNar = waypoints.some((w) => w.landmarkAr.includes('واد النار'));
  assert.ok(hasWadiAlNar, 'Route must include Wadi al-Nar bypass corridor');
});

test('interpolateDriverRouteLocation calculates smooth progress, bearing and distance', () => {
  // Start (0% progress)
  const start = interpolateDriverRouteLocation('ramallah', 'hebron', 0.0);
  assert.equal(start.progressPct, 0);
  assert.ok(start.remainingDistanceKm > 40);
  assert.equal(start.isNearDestination, false);

  // Midpoint (50% progress)
  const mid = interpolateDriverRouteLocation('ramallah', 'hebron', 0.5);
  assert.equal(mid.progressPct, 50);
  assert.ok(mid.remainingDistanceKm < start.remainingDistanceKm);
  assert.ok(mid.speedKmh > 0);

  // End (100% progress)
  const end = interpolateDriverRouteLocation('ramallah', 'hebron', 1.0);
  assert.equal(end.progressPct, 100);
  assert.equal(end.remainingDistanceKm, 0);
  assert.equal(end.isNearDestination, true);
});
