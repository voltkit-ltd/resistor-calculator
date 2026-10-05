// Common axial resistor color codes. No DOM, framework, or network required.
// Reference: TI Analog Engineer's Pocket Reference, resistor color code table.
// https://www.ti.com/seclit/eb/slyw038d/slyw038d.pdf
export const COLORS = [
  { id: 'black', name: 'Black', hex: '#252729', digit: 0, exponent: 0, tcr: 250 },
  { id: 'brown', name: 'Brown', hex: '#865136', digit: 1, exponent: 1, tolerance: 1, tcr: 100 },
  { id: 'red', name: 'Red', hex: '#dc4343', digit: 2, exponent: 2, tolerance: 2, tcr: 50 },
  { id: 'orange', name: 'Orange', hex: '#ee923d', digit: 3, exponent: 3, tcr: 15 },
  { id: 'yellow', name: 'Yellow', hex: '#f0cb4b', digit: 4, exponent: 4, tcr: 25 },
  { id: 'green', name: 'Green', hex: '#428363', digit: 5, exponent: 5, tolerance: 0.5, tcr: 20 },
  { id: 'blue', name: 'Blue', hex: '#416fb5', digit: 6, exponent: 6, tolerance: 0.25, tcr: 10 },
  { id: 'violet', name: 'Violet', hex: '#925ea8', digit: 7, exponent: 7, tolerance: 0.1, tcr: 5 },
  { id: 'gray', name: 'Gray', hex: '#8c9298', digit: 8, exponent: 8, tolerance: 0.05, tcr: 1 },
  { id: 'white', name: 'White', hex: '#f7f7f3', digit: 9, exponent: 9 },
  { id: 'gold', name: 'Gold', hex: '#bc9649', exponent: -1, tolerance: 5 },
  { id: 'silver', name: 'Silver', hex: '#aab3bb', exponent: -2, tolerance: 10 },
];

export function bandRoles(count) {
  if (![4, 5, 6].includes(count)) throw new RangeError('Choose 4, 5, or 6 bands.');
  const roles = [
    { label: '1st Band', property: 'digit', first: true },
    { label: '2nd Band', property: 'digit' },
  ];
  if (count > 4) roles.push({ label: '3rd Band', property: 'digit' });
  roles.push({ label: 'Multiplier', property: 'exponent' }, { label: 'Tolerance', property: 'tolerance' });
  if (count === 6) roles.push({ label: 'Temp. coefficient', property: 'tcr' });
  return roles;
}

export function colorsForRole(role) {
  return COLORS.filter((color) => color[role.property] !== undefined && (!role.first || color.digit !== 0));
}

export function calculateResistance(bands) {
  const roles = bandRoles(bands.length);
  const colors = bands.map((id, index) => {
    const color = colorsForRole(roles[index]).find((item) => item.id === id);
    if (!color) throw new RangeError(`Invalid color for ${roles[index].label}: ${id}`);
    return color;
  });
  const digitCount = bands.length === 4 ? 2 : 3;
  const digits = colors.slice(0, digitCount).map((color) => color.digit).join('');
  const multiplier = 10 ** colors[digitCount].exponent;
  const ohms = Number((Number(digits) * multiplier).toPrecision(12));
  const tolerance = colors[digitCount + 1].tolerance;
  return { ohms, tolerance, tcr: colors[digitCount + 2]?.tcr ?? null, digits, multiplier, colors, roles };
}

export function formatResistance(ohms) {
  if (!Number.isFinite(ohms) || ohms < 0) throw new RangeError('Resistance must be finite and nonnegative.');
  const [divisor, unit] = ohms >= 1e9 ? [1e9, 'GΩ'] : ohms >= 1e6 ? [1e6, 'MΩ'] : ohms >= 1e3 ? [1e3, 'kΩ'] : [1, 'Ω'];
  return `${Number((ohms / divisor).toPrecision(12))} ${unit}`;
}

export function bandMeaning(color, role) {
  if (role.property === 'exponent') return `×${10 ** color.exponent}`;
  if (role.property === 'tolerance') return `±${color.tolerance}%`;
  if (role.property === 'tcr') return `${color.tcr} ppm/°C`;
  return String(color.digit);
}
