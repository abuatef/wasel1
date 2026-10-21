import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDeliveryPrice, evaluateDriverDebtStatus } from './pricing';
import { getIntercityDistance, isParcelOnDriverCorridor } from './geo';

test('Hebron to Ramallah Express Benchmark matches prompt scenario', () => {
  // Scenario: 65 km, 80 min, express
  const result = calculateDeliveryPrice(65, 80, 'small', 'express', false);

  assert.equal(result.baseFare, 15);
  assert.equal(result.distanceCost, 149.5); // 65 * 2.30
  assert.equal(result.timeDelayCost, 24);   // 80 * 0.30
  assert.equal(result.rawExpressTotal, 188.5); // 15 + 149.5 + 24
  assert.equal(result.finalCustomerPrice, 188.5);
  assert.equal(result.platformRevenue, 37.7); // 20% of 188.5
  assert.equal(result.driverNetRevenue, 150.8); // 80% of 188.5
});

test('Hebron to Ramallah Backhaul Benchmark matches prompt scenario with 35% discount', () => {
  const result = calculateDeliveryPrice(65, 80, 'small', 'backhaul', false);

  // 35% customer discount applied on 188.5:
  // 188.5 - 66.0 = 122.5 ILS
  assert.equal(result.finalCustomerPrice, 122.5);
  // Platform cut at 15%: 122.5 * 0.15 = 18.4 ILS
  assert.equal(result.platformRevenue, 18.4);
  // Driver net cut: 122.5 - 18.4 = 104.1 ILS
  assert.equal(result.driverNetRevenue, 104.1);
  // Net profit covers fuel and leaves substantial surplus:
  assert.ok(result.driverNetProfitAboveFuel > 0);
});

test('Dynamic Surcharge applies when checkpoint delay is severe', () => {
  const normal = calculateDeliveryPrice(45, 50, 'medium', 'express', false);
  const surge = calculateDeliveryPrice(45, 50, 'medium', 'express', true);

  assert.ok(surge.finalCustomerPrice > normal.finalCustomerPrice);
  assert.ok(surge.checkpointSurcharge > 0);
});

test('Driver wallet ledger correctly identifies debt and freezes at credit limit', () => {
  const healthy = evaluateDriverDebtStatus(-20, 150);
  assert.equal(healthy.isFrozen, false);
  assert.equal(healthy.isWarning, false);
  assert.equal(healthy.remainingCredit, 130);

  const warning = evaluateDriverDebtStatus(-110, 150);
  assert.equal(warning.isFrozen, false);
  assert.equal(warning.isWarning, true);

  const frozen = evaluateDriverDebtStatus(-155, 150);
  assert.equal(frozen.isFrozen, true);
  assert.equal(frozen.remainingCredit, 0);
});

test('Intercity Matrix and Corridor Matching accurately identifies waypoints', () => {
  const hebronRamallah = getIntercityDistance('hebron', 'ramallah');
  assert.equal(hebronRamallah.km, 65);
  assert.equal(hebronRamallah.mins, 80);

  // Driver going Ramallah -> Hebron, parcel is Ramallah -> Hebron (direct)
  const directMatch = isParcelOnDriverCorridor('ramallah', 'hebron', 'ramallah', 'hebron', 10);
  assert.equal(directMatch.isMatch, true);
  assert.equal(directMatch.detourKm, 0);
  assert.equal(directMatch.score, 100);

  // Driver going Ramallah -> Hebron, parcel is Bethlehem -> Hebron (on the way)
  const waypointMatch = isParcelOnDriverCorridor('ramallah', 'hebron', 'bethlehem', 'hebron', 15);
  assert.equal(waypointMatch.isMatch, true);
});
