# Voltkit Resistor Calculator

A tiny, mobile-friendly resistor color code calculator written in vanilla JavaScript. No dependencies, build step, API, or Calculate button.

## Features

- 4 bands: two digits, multiplier, tolerance.
- 5 bands: three digits, multiplier, tolerance.
- 6 bands: three digits, multiplier, tolerance, temperature coefficient.
- Tap a band to open a native color dropdown. Results and explanation cards update immediately.
- Each band-count mode remembers its selections during the session.
- Keyboard accessible controls and live result announcements.
- Resistance displayed in Ω, kΩ, MΩ, or GΩ.

## Run

Serve this directory with any static HTTP server, for example:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. ES modules require HTTP; do not open `index.html` using a `file://` URL.

## Embed

Copy this directory to your site and include:

```html
<link rel="stylesheet" href="/tools/resistor-calculator/calculator.css">
<resistor-calculator></resistor-calculator>
<script type="module" src="/tools/resistor-calculator/calculator.js"></script>
```

## Calculation only

```js
import { calculateResistance, formatResistance } from './core.js';

const result = calculateResistance(['brown', 'black', 'red', 'gold']);
console.log(`${formatResistance(result.ohms)} ±${result.tolerance}%`);
// 1 kΩ ±5%
```

Calculation: concatenate the significant digits, then multiply by the multiplier. The sixth band describes temperature coefficient in ppm/°C and does not change nominal resistance. Dropdowns offer only valid colors for their role; the first significant digit is nonzero. No-band tolerance and specialized manufacturer codes are outside this 4/5/6-band calculator.

Color references: [Vishay resistor color code chart](https://www.vishay.com/docs/49478/_dale_resistor_color_code_chart_vmn_ms0002_1612.pdf) and [TI Analog Engineer’s Pocket Reference](https://www.ti.com/seclit/eb/slyw038d/slyw038d.pdf), resistor color code table (including temperature coefficients). Manufacturer markings can vary; consult the part datasheet for specialized codes.

## Verify

```sh
node --test core.test.mjs
```

Live page: https://voltkit.net/resistor-calculator

## License

MIT. See [LICENSE](./LICENSE). The license applies to this calculator directory only.
