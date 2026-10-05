import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateResistance, formatResistance, bandRoles, colorsForRole } from './core.js';

test('decodes representative four, five, and six band resistors', () => {
  for (const [bands, ohms, tolerance, tcr] of [
    [['brown', 'black', 'red', 'gold'], 1000, 5, null],
    [['red', 'red', 'brown', 'gold'], 220, 5, null],
    [['yellow', 'violet', 'red', 'silver'], 4700, 10, null],
    [['brown', 'black', 'black', 'red', 'brown'], 10000, 1, null],
    [['red', 'orange', 'violet', 'black', 'brown'], 237, 1, null],
    [['brown', 'black', 'black', 'red', 'brown', 'red'], 10000, 1, 50],
    [['yellow', 'violet', 'gold', 'gold'], 4.7, 5, null],
    [['brown', 'black', 'silver', 'silver'], 0.1, 10, null],
    [['white', 'white', 'white', 'white', 'gray', 'gray'], 999e9, 0.05, 1],
  ]) {
    const result = calculateResistance(bands);
    assert.equal(result.ohms, ohms);
    assert.equal(result.tolerance, tolerance);
    assert.equal(result.tcr, tcr);
  }
});

test('formats fractional values and every unit boundary without floating point noise', () => {
  for (const [ohms, label] of [[0.1, '0.1 Ω'], [4.7, '4.7 Ω'], [999, '999 Ω'], [1000, '1 kΩ'], [4700, '4.7 kΩ'], [1e6, '1 MΩ'], [1e9, '1 GΩ'], [999e9, '999 GΩ']]) {
    assert.equal(formatResistance(ohms), label);
  }
});

test('rejects wrong counts, invalid role colors, and invalid resistance', () => {
  assert.throws(() => calculateResistance(['brown', 'black', 'red']), RangeError);
  assert.throws(() => calculateResistance(['gold', 'black', 'red', 'gold']), RangeError);
  assert.throws(() => calculateResistance(['brown', 'black', 'red', 'black']), RangeError);
  assert.throws(() => calculateResistance(['brown', 'black', 'black', 'brown', 'gold', 'gold']), RangeError);
  assert.throws(() => formatResistance(NaN), RangeError);
  assert.throws(() => formatResistance(-1), RangeError);
  assert.equal(colorsForRole(bandRoles(4)[0]).some((color) => color.id === 'black'), false);
});
