// Reads the pasted base sheets in the browser (SheetJS). Every figure is found by label/code, not fixed cell address. Nothing is recalculated.
(function (root) {
  const X = () => root.XLSX, SHEETS = ['Early Bird', 'Rooms Sale', 'City Ledger Balance', 'FCR 2026'];
  const cell = (ws, r, c) => { const x = ws[X().utils.encode_cell({ r: r - 1, c: c - 1 })]; return x ? x.v : null; };
  const rowsOf = ws => X().utils.decode_range(ws['!ref']).e.r + 1, colsOf = ws => X().utils.decode_range(ws['!ref']).e.c + 1;
  const num = v => (typeof v === 'number' ? v : null), str = v => String(v == null ? '' : v).trim();
  const dateOf = v => { if (typeof v === 'number') return new Date(Math.round((v - 25569) * 864e5)).toISOString().slice(0, 10);
    if (v instanceof Date) return v.toISOString().slice(0, 10); const m = str(v).match(/\d{4}-\d\d-\d\d/); return m ? m[0] : null; };
  const findRow = (ws, col, re, from = 1) => { const n = rowsOf(ws); for (let r = from; r <= n; r++) if (re.test(str(cell(ws, r, col)))) return r; return 0; };
  const findCol = (ws, row, re, nth = 0) => { const h = [], n = colsOf(ws); for (let c = 1; c <= n; c++) if (re.test(str(cell(ws, row, c)))) h.push(c); return h[nth] || 0; };
  const detect = wb => (SHEETS.some(n => wb.Sheets[n]) ? 'exec' : 'ageing');

  function parseExec(wb) {
    const miss = SHEETS.filter(n => !wb.Sheets[n]);
    if (miss.length) throw new Error('This workbook is missing the sheet(s): ' + miss.join(', ') + '. Choose the full Daily Executive Report file.');
    const out = { checks: [] }, dates = {}, chk = (label, ok, detail) => out.checks.push({ label, ok: !!ok, detail: detail || '' });
    const cl = wb.Sheets['City Ledger Balance']; dates['City Ledger Balance'] = dateOf(cell(cl, 1, 1));
    const clv = re => { const r = findRow(cl, 1, re); if (!r) throw new Error('City Ledger Balance: row not found ' + re); return { today: num(cell(cl, r, 2)), ly: num(cell(cl, r, 3)) }; };
    const ab = o => ({ today: Math.abs(o.today), ly: Math.abs(o.ly) });
    out.ledger = { opening: clv(/^C\/L Opening/i), additions: clv(/^C\/L Addition/i), collection: ab(clv(/^C\/L Collection/i)), closing: clv(/^C\/L Closing/i) };
    const L = out.ledger;
    chk('City ledger adds up (opening + charges − collections = closing)', Math.abs(L.opening.today + L.additions.today - L.collection.today - L.closing.today) < 1);

    const rs = wb.Sheets['Rooms Sale']; dates['Rooms Sale'] = dateOf(cell(rs, 3, 1));
    const cats = []; for (let c = 2; c <= 9; c++) cats.push(str(cell(rs, 6, c)));
    const rowVals = r => Object.fromEntries(cats.map((n, i) => [n, num(cell(rs, r, i + 2))]));
    const block = (label, off) => { const r = findRow(rs, 1, new RegExp('^' + label, 'i')); if (!r) throw new Error('Rooms Sale: block not found: ' + label);
      return { today: rowVals(r + off), mtd: rowVals(r + off + 1), ytd: rowVals(r + off + 2) }; };
    out.rooms = { categories: cats, revenue: block('ROOMS REVENUE', 2), available: block('ROOMS AVAILABLE', 1), occupied: block('ROOMS OCCUPIED', 1), occupancy: block('OCCUPANCY', 1), arr: block('AVERAGE ROOM RATE', 1) };

    const f = wb.Sheets['FCR 2026'], cM = findCol(f, 12, /M\s*O\s*N\s*T\s*H/i) + 2, cL = findCol(f, 13, /LAST YEAR/i);
    if (cM < 3 || cL < 1) throw new Error('FCR 2026: could not find the month-to-date / last-year cover columns');
    const outlets = [], names = ['ROOM SERVICE', 'ZAMANA COFFEE SHOP', 'AL-MAGHREB', 'BANQUETS', 'RAKAPOSHI LOUNGE', 'BARADARI', 'DAWAT', 'WILD RICE', 'RAKAPOSHI'];
    let cur = null, foodRev = null; const fr = rowsOf(f);
    for (let n = 15; n <= fr; n++) { const a = str(cell(f, n, 1)), A = a.toUpperCase();
      if (A.startsWith('TOTAL FOOD')) { foodRev = num(cell(f, n, 17)); break; }
      const hit = names.find(x => x === A);
      if (hit) { cur = hit; if (['RAKAPOSHI LOUNGE', 'BARADARI'].includes(hit) && num(cell(f, n, cM)) !== null) outlets.push({ name: a, mtd: num(cell(f, n, cM)), ly: num(cell(f, n, cL)) }); }
      else if (A === 'TOTAL' && cur) { outlets.push({ name: cur, mtd: num(cell(f, n, cM)), ly: num(cell(f, n, cL)) }); cur = null; } }
    out.fnb = { covers: outlets };

    const eb = wb.Sheets['Early Bird']; dates['Early Bird'] = dateOf(cell(eb, 3, 2));
    const nv = (r, c) => { const v = cell(eb, r, c); if (typeof v === 'number') return v; if (typeof v === 'string' && v.trim() === '-') return 0; return null; };
    const rows = []; let sec = 'SUMMARY';
    for (let n = 7; n <= rowsOf(eb); n++) { const name = str(cell(eb, n, 2)), code = str(cell(eb, n, 1));
      const r = { sec, code, name, today: nv(n, 3), mtd: nv(n, 4), bud: nv(n, 5), ytd: nv(n, 8), ytdBud: nv(n, 9), ly: nv(n, 12) };
      if (name && r.mtd === null && r.today === null) { sec = name; continue; } if (name && r.mtd !== null) rows.push(r); }
    out.eb = rows; const g = c => rows.find(r => r.code === c);
    for (const c of ['NR', 'GR', 'RT', 'FT', 'OC', 'AR']) if (!g(c)) throw new Error('Early Bird: row with code ' + c + ' not found (or empty)');
    out.date = dates['Early Bird'];

    const ds = Object.entries(dates);
    chk('All four sheets are for the same date', ds.every(([, d]) => d && d === out.date), ds.map(([k, d]) => k + ': ' + d).join(' · '));
    chk('Rooms revenue: Early Bird = Rooms Sale (MTD)', Math.abs(g('RT').mtd - out.rooms.revenue.mtd.Total) < 1);
    if (g('RS')) chk('Rooms occupied: Early Bird = Rooms Sale (MTD)', Math.abs(g('RS').mtd - out.rooms.occupied.mtd.Total) < 1);
    const tf = rows.find(r => r.name === 'TOTAL FOOD'); if (foodRev !== null && tf) chk('Food revenue: Early Bird = FCR 2026 (MTD)', Math.abs(tf.mtd - foodRev) < 1);
    chk('Early Bird adds up (rooms + F&B + other = gross)', Math.abs(g('RT').mtd + g('FT').mtd + (g('TM') ? g('TM').mtd : 0) - g('GR').mtd) < 2);
    const disc = rows.filter(r => /^Less:/i.test(r.name)).reduce((s, r) => s + (r.mtd || 0), 0);
    chk('Early Bird adds up (gross − discounts = net)', Math.abs(g('GR').mtd + disc - g('NR').mtd) < 2);
    return out;
  }

  function parseAgeing(wb) {
    const ws = wb.Sheets[wb.SheetNames[0]], cols = [6, 7, 10, 13, 17, 19, 24, 27], keys = ['notDue', 'd30', 'd60', 'd90', 'd120', 'd150', 'older', 'total'];
    const rowObj = r => Object.fromEntries(keys.map((k, i) => [k, num(cell(ws, r, cols[i])) || 0]));
    const m = str(cell(ws, 2, 5)).match(/(\d\d)\/(\d\d)\/(\d\d)/);
    if (!m) throw new Error('This is not a Daily Executive Report or an ageing file (no report date found).');
    const out = { date: `20${m[3]}-${m[2]}-${m[1]}`, accounts: [], totals: null }, n = rowsOf(ws); let after = false;
    for (let r = 1; r <= n; r++) { const a = str(cell(ws, r, 1));
      if (a.startsWith('Age Analysis')) after = true;
      if (a === 'PKR' && after && !out.totals) out.totals = rowObj(r);
      else if (/^\d+$/.test(a) && !after && str(cell(ws, r + 1, 1)) === 'PKR') out.accounts.push({ code: a, name: str(cell(ws, r, 5)), ...rowObj(r + 1) }); }
    if (!out.totals) throw new Error('Ageing totals row not found');
    const sum = out.accounts.reduce((s, x) => s + x.total, 0);
    out.check = { accounts: out.accounts.length, sumOfAccounts: sum, reportTotal: out.totals.total, matches: Math.abs(sum - out.totals.total) < 1 };
    return out;
  }
  root.ISHParse = { detect, parseExec, parseAgeing };
})(typeof window !== 'undefined' ? window : globalThis);
