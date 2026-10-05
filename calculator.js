import { bandRoles, colorsForRole, calculateResistance, formatResistance, bandMeaning } from './core.js';

let instanceCount = 0;

class ResistorCalculator extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;
    this.instanceId = `rc-${++instanceCount}`;
    this.count = 4;
    this.selections = {
      4: ['brown', 'black', 'red', 'gold'],
      5: ['brown', 'black', 'black', 'brown', 'gold'],
      6: ['brown', 'black', 'black', 'brown', 'gold', 'brown'],
    };
    this.classList.add('rc');
    this.innerHTML = `
      <fieldset class="rc-modes">
        <legend>Number of bands</legend>
        <div class="rc-mode-options">
          ${[4, 5, 6].map((count) => `<label><input type="radio" name="${this.instanceId}-count" value="${count}" ${count === 4 ? 'checked' : ''}><span>${count} Band</span></label>`).join('')}
        </div>
      </fieldset>
      <p class="rc-hint">Tap a color band to change it.</p>
      <div class="rc-stage">
        <div class="rc-wire" aria-hidden="true"></div>
        <div class="rc-body" aria-hidden="true"></div>
        <div class="rc-bands"></div>
      </div>
      <div class="rc-result" role="status" aria-live="polite" aria-atomic="true">
        <span class="rc-result-label">Resistance</span>
        <p class="rc-value"></p>
        <p class="rc-temperature" hidden></p>
      </div>
      <div class="rc-details" aria-label="Color band meanings"></div>
      <p class="rc-note">Read from the end with the closest band. The spaced band marks tolerance; a sixth band marks temperature coefficient.</p>
    `;
    this.addEventListener('change', (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) return;
      if (input.type === 'radio') {
        this.count = Number(input.value);
        this.renderBands();
      } else if (input.dataset.band !== undefined) {
        this.selections[this.count][Number(input.dataset.band)] = input.value;
      }
      this.updateResult();
    });
    this.renderBands();
    this.updateResult();
  }

  renderBands() {
    this.dataset.count = String(this.count);
    const positions = { 4: [22, 37, 58, 78], 5: [20, 33, 46, 61, 80], 6: [18, 30, 42, 55, 72, 84] };
    this.querySelector('.rc-bands').innerHTML = bandRoles(this.count).map((role, index) => `
      <div class="rc-band" style="--position: ${positions[this.count][index]}%">
        <span class="rc-stripe" aria-hidden="true"><span class="rc-chevron">⌄</span></span>
        <select data-band="${index}" id="${this.instanceId}-band-${index}" aria-label="${role.label} color">
          ${colorsForRole(role).map((color) => `<option value="${color.id}" ${color.id === this.selections[this.count][index] ? 'selected' : ''}>${color.name} — ${bandMeaning(color, role)}</option>`).join('')}
        </select>
        <span class="rc-connector" aria-hidden="true"></span>
        <label for="${this.instanceId}-band-${index}" class="rc-band-name"></label>
        <span class="rc-band-number" aria-hidden="true">${index + 1}</span>
      </div>
    `).join('');
  }

  updateResult() {
    const result = calculateResistance(this.selections[this.count]);
    result.colors.forEach((color, index) => {
      const band = this.querySelectorAll('.rc-band')[index];
      band.style.setProperty('--band-color', color.hex);
      band.style.setProperty('--band-ink', ['black', 'brown', 'red', 'green', 'blue', 'violet'].includes(color.id) ? '#fff' : '#252729');
      band.querySelector('.rc-band-name').textContent = color.name;
    });
    this.querySelector('.rc-value').textContent = `${formatResistance(result.ohms)} ±${result.tolerance}%`;
    const temperature = this.querySelector('.rc-temperature');
    temperature.hidden = result.tcr === null;
    temperature.textContent = result.tcr === null ? '' : `Temperature coefficient: ${result.tcr} ppm/°C`;
    this.querySelector('.rc-details').innerHTML = result.colors.map((color, index) => `
      <div class="rc-detail">
        <span class="rc-detail-role">${result.roles[index].label}</span>
        <span class="rc-detail-color"><i style="background: ${color.hex}" aria-hidden="true"></i>${color.name}</span>
        <strong>${bandMeaning(color, result.roles[index])}</strong>
      </div>
    `).join('');
  }
}

if (!customElements.get('resistor-calculator')) customElements.define('resistor-calculator', ResistorCalculator);
