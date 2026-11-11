/* <liquid-logo> — liquid pixel-stretch logo.
   Hover (mouse/pen) or tap (touch): the force enters where the pointer meets the logo and the
   stretch flows away from it, draining out of the opposite edge.
   Usage: load this file with a script tag (defer), then place a liquid-logo element in the page.
   Colour = CSS `color` of the element. Size = CSS width (height follows). */
(() => {
  const CFG = {"W":628.4,"H":126.6,"slack":50,"sigma":10.0,"G":11,"bounds":[9.22,127.0,164.16,201.31,237.88,288.57,336.09,362.87,390.52,418.17,478.07],"wscale":[1.3,0.921,1.149,1.096,1.209,0.945,1.3,1.3,0.924,0.998,0.956,0.72],"seams":[[0,1],[1,2],[2,3],[3,4],[7,8],[6,9],[10,11]],"sx":1.7361553150859326,"vbW":1091,"vbH":219,"arcX0":-80,"arcStep":4,"arc":[0.0,6.5,12.9,19.4,25.8,32.3,38.8,45.2,51.7,58.1,64.6,71.1,77.5,84.0,90.5,96.9,103.4,109.8,116.3,122.8,129.2,135.7,142.2,148.8,155.4,162.1,168.9,175.8,182.7,189.7,196.8,203.9,210.9,217.8,224.6,231.2,237.7,243.9,250.0,255.9,261.6,267.3,272.9,278.6,284.5,290.5,296.8,303.4,310.3,317.5,324.9,332.6,340.5,348.5,356.5,364.5,372.5,380.4,388.2,396.0,403.6,411.3,418.9,426.5,434.3,442.1,449.9,457.9,465.9,473.9,481.9,489.8,497.6,505.3,512.7,520.0,527.2,534.2,541.2,548.2,555.4,562.8,570.4,578.4,586.6,595.0,603.6,612.2,620.8,629.2,637.4,645.4,653.0,660.3,667.4,674.2,681.0,687.7,694.6,701.6,708.8,716.4,724.3,732.7,741.4,750.7,760.4,770.4,780.8,791.5,802.4,813.3,824.2,835.0,845.5,855.7,865.6,874.9,883.8,892.2,900.2,907.7,914.9,921.8,928.6,935.4,942.3,949.4,956.7,964.4,972.5,980.9,989.6,998.6,1007.8,1017.0,1026.3,1035.6,1044.8,1054.0,1063.2,1072.4,1081.6,1090.8,1100.2,1109.8,1119.4,1129.3,1139.4,1149.6,1160.0,1170.5,1181.3,1192.1,1203.1,1214.1,1225.3,1236.5,1247.7,1258.8,1269.9,1280.9,1291.8,1302.4,1312.7,1322.7,1332.2,1341.4,1350.0,1358.1,1365.7,1372.7,1379.3,1385.4,1391.0,1396.3,1401.3,1406.1,1410.7,1415.3,1419.9,1424.6,1429.2,1433.8,1438.4,1443.1,1447.7,1452.3,1456.9,1461.6,1466.2,1470.8,1475.5,1480.1,1484.7,1489.3,1494.0,1498.6,1503.2],"arcFull":1340.8};
  const PATHS = [{"eo":false,"subs":[["M",80.689,27.969,1,"C",80.689,59.433,1,55.183,84.939,1,23.719,84.939,1,"C",21.101,84.939,1,18.524,84.762,0,16.0,84.42,1,"L",16.0,84.42,0,"C",10.363,83.656,0,4.988,82.068,0,0.0,79.781,0,"L",0.0,0.0,0,"L",16.0,0.0,0,"L",16.0,0.0,1,"L",73.362,0.0,1,"C",78.027,8.262,1,80.689,17.805,1,80.689,27.969,1]]},{"eo":true,"subs":[["M",477.0,0.0,5,"L",477.0,219.0,5,"L",587.037,219.0,7,"L",586.507,150.029,7,"C",586.421,138.821,7,595.4,129.688,7,606.506,129.688,7,"L",630.0,129.688,7,"L",630.0,129.688,8,"L",684.531,129.688,8,"L",672.5,219.0,8,"L",830.0,219.0,10,"L",830.0,219.0,11,"L",849.0,219.0,11,"L",849.0,160.97,11,"L",830.0,160.97,11,"L",830.0,160.97,10,"L",773.49,160.97,10,"C",761.171,160.97,10,751.781,149.942,10,753.746,137.781,10,"L",776.0,0.0,10,"L",776.162,0.194,10,"L",776.191,0.0,10,"L",776.0,0.0,10,"L",580.0,0.0,9,"L",580.0,0.0,6,"L",477.0,0.0,5],["M",544.5,43.0,6,"C",533.73,43.0,6,525.0,51.73,6,525.0,62.5,6,"C",525.0,73.269,6,533.73,82.0,6,544.5,82.0,6,"L",580.0,82.0,6,"L",580.0,82.0,9,"L",692.035,82.0,9,"L",698.0,43.0,9,"L",580.0,43.0,9,"L",580.0,43.0,6,"L",544.5,43.0,6]]},{"eo":false,"subs":[["M",879.0,0.0,11,"L",830.0,0.0,11,"L",830.0,0.0,10,"L",811.326,0.0,10,"L",794.698,106.69,10,"C",793.28,115.785,10,800.313,124.0,10,809.519,124.0,10,"L",830.0,124.0,10,"L",830.0,124.0,11,"L",1045.0,124.0,11,"L",1045.0,143.0,11,"L",1044.98,143.0,11,"C",1044.99,143.331,11,1045.0,143.665,11,1045.0,144.0,11,"L",1045.0,153.0,11,"C",1045.0,164.046,11,1036.05,173.0,11,1025.0,173.0,11,"L",944.0,173.0,11,"C",935.799,173.0,11,928.75,168.064,11,925.664,161.0,11,"L",879.0,161.0,11,"L",879.0,219.0,11,"L",1091.0,219.0,11,"L",1091.0,0.0,11,"L",1029.0,0.0,11,"L",1029.0,45.0,11,"C",1029.0,56.046,11,1020.05,65.0,11,1009.0,65.0,11,"L",899.0,65.0,11,"C",887.954,65.0,11,879.0,56.046,11,879.0,45.0,11,"L",879.0,0.0,11]]},{"eo":false,"subs":[["M",0.5,219.0,0,"L",191.0,219.0,1,"L",191.0,152.5,1,"C",191.0,136.208,1,204.208,123.0,1,220.5,123.0,1,"L",220.5,123.0,2,"C",236.792,123.0,2,250.0,136.208,2,250.0,152.5,2,"L",250.0,219.0,2,"L",320.0,219.0,3,"L",320.0,152.5,3,"C",320.0,136.208,3,333.208,123.0,3,349.5,123.0,3,"L",349.5,123.0,4,"C",365.792,123.0,4,379.0,136.208,4,379.0,152.5,4,"L",379.0,219.0,4,"L",447.0,219.0,5,"L",447.0,0.0,5,"L",320.0,0.0,3,"L",320.0,18.0,3,"C",320.0,29.046,3,311.046,38.0,3,300.0,38.0,3,"L",285.0,38.0,3,"L",285.0,38.0,2,"L",270.0,38.0,2,"C",258.954,38.0,2,250.0,29.046,2,250.0,18.0,2,"L",250.0,0.0,2,"L",109.712,0.0,1,"C",112.497,8.709,1,114.0,17.992,1,114.0,27.625,1,"C",114.0,77.676,1,73.426,118.25,1,23.375,118.25,1,"C",20.892,118.25,1,18.432,118.15,0,16.0,117.954,1,"L",16.0,117.954,0,"C",10.691,117.527,0,5.511,116.642,0,0.5,115.338,0,"L",0.5,219.0,0]]}];
  const TUNE = {
    inject: 0.45,      // s to press the slack in
    flowDelay: 0.42,   // s before it starts to flow
    flowFull: 1.63,    // s to flow across the full logo (shorter trips scale down)
    flowMin: 0.55,
    lin: 0.6,          // 1 = constant flow speed, 0 = strong ease in/out
    w0: 17, zeta: 0.92, // follower spring: near-critical = liquid, no bounce
    handover: 0.3,    // s for an old flow to drain when too many are running
    maxRuns: 4,       // ripples allowed to overlap
    cap: 1.25,        // soft limit on total stretch, in units of one full slack
    stirMin: 0.12,    // pointer speed (logo px/ms) needed to stir while hovering
    stirFull: 1.1,    // pointer speed that gives a full-strength surge
    stirGap: 110      // ms between stir ripples
  };
  const NS = 'http://www.w3.org/2000/svg';
  const OV = 1;
  let uid = 0;
  const smoother = u => (u = Math.min(Math.max(u, 0), 1), u * u * u * (u * (6 * u - 15) + 10));
  const sig = z => 1 / (1 + Math.exp(-z));
  const arcAt = x => {
    const f = (x - CFG.arcX0) / CFG.arcStep, i = Math.max(0, Math.min(CFG.arc.length - 2, Math.floor(f)));
    return CFG.arc[i] + (CFG.arc[i + 1] - CFG.arc[i]) * Math.min(Math.max(f - i, 0), 1);
  };
  const xAtArc = a => {
    const A = CFG.arc; let lo = 0, hi = A.length - 1;
    if (a <= A[0]) return CFG.arcX0; if (a >= A[hi]) return CFG.arcX0 + hi * CFG.arcStep;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; (A[m] <= a ? lo = m : hi = m); }
    return CFG.arcX0 + (lo + (a - A[lo]) / (A[hi] - A[lo])) * CFG.arcStep;
  };
  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.getElementById('liquid-logo-style')) {
    const st = document.createElement('style');
    st.id = 'liquid-logo-style';
    st.textContent = ':where(liquid-logo){display:inline-block;width:315px;color:#98A4BA;line-height:0;' +
      '-webkit-tap-highlight-color:transparent;touch-action:pan-y}' +
      'liquid-logo>svg{width:100%;height:auto;overflow:visible;display:block}';
    document.head.appendChild(st);
  }

  class LiquidLogo extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      const id = 'liquid-logo-' + (++uid);
      const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
      const svg = el('svg', { viewBox: `0 0 ${CFG.vbW} ${CFG.vbH}`, role: 'img', 'aria-label': this.getAttribute('label') || 'Logo' });
      this._paths = PATHS.map(p => el('path', p.eo ? { fill: 'currentColor', 'fill-rule': 'evenodd' } : { fill: 'currentColor' }, svg));
      this.appendChild(svg);
      this._svg = svg;
      this._x = new Float64Array(CFG.G + 1); this._v = new Float64Array(CFG.G + 1);
      this._runs = [];
      this._clock = null;
      this._d = [];
      this._lastMove = 0;
      this._render();

      // entering (mouse/pen) or touching starts a full surge; moving inside keeps stirring
      this.addEventListener('pointerenter', e => {
        const x = this._localX(e);
        this._stir = { x, t: e.timeStamp, v: 0, zone: this._zone(x), last: e.timeStamp };
        if (e.pointerType !== 'touch') this.play(x, e.movementX || 0);
      });
      this.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'touch') return;
        const x = this._localX(e);
        this._stir = { x, t: e.timeStamp, v: 0, zone: this._zone(x), last: e.timeStamp };
        this.play(x, 0);
      });
      this.addEventListener('pointermove', e => this._onMove(e));
      this.addEventListener('pointerleave', () => { this._stir = null; });
    }

    _localX(e) {
      const r = this._svg.getBoundingClientRect();
      return (e.clientX - r.left) / r.width * CFG.W; // flow units
    }

    _zone(x) { let z = 0; for (const b of CFG.bounds) if (x > b) z++; return z; }

    _onMove(e) {
      const S = this._stir; if (!S) return;
      const x = this._localX(e), dt = Math.max(1, e.timeStamp - S.t);
      const vInst = (x - S.x) / dt;                      // logo px per ms
      S.v = S.v * 0.6 + vInst * 0.4;                      // smoothed pointer velocity
      S.x = x; S.t = e.timeStamp;
      const zone = this._zone(x);
      if (zone === S.zone) return;                        // ripple only when sweeping across a seam
      S.zone = zone;
      const speed = Math.abs(S.v);
      if (speed < TUNE.stirMin || e.timeStamp - S.last < TUNE.stirGap) return;
      S.last = e.timeStamp;
      const amp = Math.min(1, 0.3 + 0.7 * (speed - TUNE.stirMin) / (TUNE.stirFull - TUNE.stirMin));
      this.play(x, Math.sign(S.v) * 10, amp, true);
    }

    /** Start the liquid stretch. x0: force point in logo units (0..W). dx: horizontal motion hint.
        Can be called at any time: a running flow hands over to the new force smoothly. */
    play(x0 = 0, dx = 0, amp = 1, stir = false) {
      if (reduceMotion()) return;
      const now = performance.now();
      if (!stir && now - (this._lastPlay || 0) < 90) return; // ignore edge jitter
      this._lastPlay = now;
      x0 = Math.min(Math.max(x0, 0), CFG.W);
      // direction: follow clear sideways motion, otherwise flow away from the nearer edge
      const dir = Math.abs(dx) > 2 ? Math.sign(dx) : (x0 < CFG.W / 2 ? 1 : -1);
      // snap the force to the nearest seam so something visibly stretches first
      let k = 0, best = Infinity;
      CFG.bounds.forEach((b, i) => { const d = Math.abs(b - x0); if (d < best) { best = d; k = i; } });
      const s = CFG.sigma;
      const p0 = CFG.bounds[k] - dir * 1.5 * s;
      const pEnd = dir > 0 ? CFG.W + 4.5 * s : -4.5 * s;
      const a0 = arcAt(p0), a1 = arcAt(pEnd);
      const flow = Math.max(TUNE.flowMin, TUNE.flowFull * Math.abs(a1 - a0) / CFG.arcFull);
      this._runs = this._runs || [];
      // ripples overlap; only the oldest ones drain away once there are too many
      const live = this._runs.filter(r => r.kill == null);
      for (let i = 0; i <= live.length - TUNE.maxRuns; i++) live[i].kill = live[i].t;
      this._runs.push({ dir, a0, a1, flow, amp, t: 0 });
      this.setAttribute('data-playing', dir > 0 ? 'ltr' : 'rtl');
      if (!this._clock) {
        this._clock = { acc: 0, last: now };
        requestAnimationFrame(this._tick.bind(this));
      }
    }

    // adds one flow's target displacement per group into out; returns true when it has fully drained
    _addTargets(R, out) {
      const s = CFG.sigma, t = R.t, t1 = TUNE.flowDelay + R.flow;
      let u = (t - TUNE.flowDelay) / R.flow; u = Math.min(Math.max(u, 0), 1);
      const e = TUNE.lin * u + (1 - TUNE.lin) * smoother(u);
      const p = xAtArc(R.a0 + (R.a1 - R.a0) * e);
      let A = R.amp * CFG.slack * smoother(t / TUNE.inject) * (1 - smoother((t - (t1 - 0.15)) / 0.35));
      if (R.kill != null) A *= 1 - smoother((t - R.kill) / TUNE.handover);
      const B = CFG.bounds; // B[k] = boundary between group k and k+1
      for (let g = 0; g <= CFG.G; g++) {
        if (R.dir > 0) out[g] += g === 0 ? 0 : A * sig((B[g - 1] - p) / s);
        else out[g] += g === CFG.G ? 0 : -A * sig((p - B[g]) / s);
      }
      return t > t1 + 0.35 || (R.kill != null && t > R.kill + TUNE.handover);
    }

    _tick(now) {
      const C = this._clock; if (!C) return;
      const x = this._x, v = this._v, tgt = this._tgt || (this._tgt = new Float64Array(CFG.G + 1));
      C.acc += Math.min(0.05, (now - C.last) / 1000); C.last = now;
      const dt = 1 / 240;
      while (C.acc >= dt) {
        C.acc -= dt;
        tgt.fill(0);
        this._runs = this._runs.filter(R => { R.t += dt; return !this._addTargets(R, tgt); });
        const lim = CFG.slack * TUNE.cap; // soft cap so stacked ripples stay elegant
        for (let g = 0; g <= CFG.G; g++) tgt[g] = lim * Math.tanh(tgt[g] / lim);
        for (let g = 0; g <= CFG.G; g++) {
          const w = TUNE.w0 * CFG.wscale[g];
          v[g] += (w * w * (tgt[g] - x[g]) - 2 * TUNE.zeta * w * v[g]) * dt;
          x[g] += v[g] * dt;
        }
      }
      let settled = this._runs.length === 0;
      if (settled) for (let g = 0; g <= CFG.G; g++) if (Math.abs(x[g]) > 0.02 || Math.abs(v[g]) > 0.2) { settled = false; break; }
      if (settled) { x.fill(0); v.fill(0); }
      this._render();
      if (settled) { this._clock = null; this.removeAttribute('data-playing'); this.dispatchEvent(new Event('liquidend')); }
      else requestAnimationFrame(this._tick.bind(this));
    }

    _render() {
      const x = this._x, off = this._off || (this._off = new Float64Array(CFG.G + 1));
      for (let g = 0; g <= CFG.G; g++) off[g] = x[g] * CFG.sx;
      for (const [l, r] of CFG.seams) if (off[r] < off[l]) off[r] = off[l]; // stretch only, never squash
      PATHS.forEach((p, i) => {
        let d = '';
        for (const sub of p.subs) {
          for (let j = 0; j < sub.length;) {
            const t = sub[j];
            if (typeof t === 'string') { d += t; j++; continue; }
            d += (sub[j] + off[sub[j + 2]]).toFixed(2) + ' ' + sub[j + 1] + ' ';
            j += 3;
          }
          d += 'Z';
        }
        if (this._d[i] !== d) { this._d[i] = d; this._paths[i].setAttribute('d', d); }
      });
    }
  }
  if (!customElements.get('liquid-logo')) customElements.define('liquid-logo', LiquidLogo);
})();
