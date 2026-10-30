'use strict';
/* Haushaltszentrale Prototyp v4 (Gesprächsversion)
   Nur fiktive Beispieldaten. Speicherung ausschließlich im Browser (localStorage), keine Übertragung. */
(() => {
  const KEY = 'haushaltszentrale-demo-v4';
  const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const WDL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  // ---------- Hilfsfunktionen ----------
  const pad = n => String(n).padStart(2, '0');
  const iso = x => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  const day = off => { const x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() + off); return iso(x); };
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
  const fmt = s => { const x = parse(s); return `${WD[x.getDay()]}, ${x.getDate()}.${x.getMonth() + 1}.`; };
  const fmtLong = s => { const x = parse(s); return `${WDL[x.getDay()]}, ${x.getDate()}. ${MON[x.getMonth()]}`; };
  const diff = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const minusMonths = (s, n) => { const x = parse(s); x.setMonth(x.getMonth() - n); return iso(x); };
  const uid = () => Math.random().toString(36).slice(2, 9);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = n => n.toFixed(2).replace('.', ',') + ' €';
  const byTime = (a, b) => (a.date + (a.start || '00:00')).localeCompare(b.date + (b.start || '00:00'));
  const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const relDay = d => { const n = diff(day(0), d); return n === 0 ? 'Heute' : n === 1 ? 'Morgen' : fmt(d); };

  // ---------- Ferien und Feiertage NRW (Quelle: Ferienordnung NRW, Schuljahr 2026/27) ----------
  const FERIEN = [['2026-10-17', '2026-10-31', 'Herbstferien'], ['2026-12-23', '2027-01-06', 'Weihnachtsferien'], ['2027-03-22', '2027-04-03', 'Osterferien'], ['2027-05-18', '2027-05-18', 'Pfingstferien'], ['2027-07-19', '2027-08-31', 'Sommerferien']];
  const FEIERTAGE = { '2026-11-01': 'Allerheiligen', '2026-12-25': '1. Weihnachtstag', '2026-12-26': '2. Weihnachtstag', '2027-01-01': 'Neujahr', '2027-03-26': 'Karfreitag', '2027-03-28': 'Ostersonntag', '2027-03-29': 'Ostermontag', '2027-05-01': 'Tag der Arbeit', '2027-05-06': 'Christi Himmelfahrt', '2027-05-16': 'Pfingstsonntag', '2027-05-17': 'Pfingstmontag', '2027-05-27': 'Fronleichnam', '2027-10-03': 'Tag der Deutschen Einheit' };
  function dayInfo(d) {
    const f = FERIEN.find(([a, b]) => d >= a && d <= b);
    return { holiday: FEIERTAGE[d] || '', ferien: f ? f[2] : '', ferienEnd: f ? f[1] : '' };
  }

  // ---------- Icons ----------
  const IC = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    cal: '<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    tasks: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m8 12 3 3 5-6"/>',
    food: '<path d="M5 2v7a3 3 0 0 0 6 0V2M8 2v20M18 15V2a4 4 0 0 0-4 4v6a3 3 0 0 0 3 3h1zm0 0v7"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.2-6 6.5-6s6 2.5 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.2c3 .1 5 2.3 5.5 5.3"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    file: '<path d="M14 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5z"/><path d="M14 2.5v5h5M9 13h6M9 17h4"/>',
    shield: '<path d="M12 2.5 4.5 5.5v6c0 4.7 3.2 8.6 7.5 10 4.3-1.4 7.5-5.3 7.5-10v-6z"/><path d="m9 12 2 2 4-4"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    tick: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21.5 8H6.4"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>',
    userplus: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.2-6 6.5-6s6 2.5 6.5 6M19 8v6M16 11h6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    left: '<path d="m15 6-6 6 6 6"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    cake: '<path d="M4 21v-8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8M2.5 21h19M4 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 2.5-1 2.5-1M12 11V7M12 3.5v1"/>',
    car: '<path d="M5 16h14M4 16v3h3v-2M17 17v2h3v-3M4 16l1.5-5.5A2 2 0 0 1 7.4 9h9.2a2 2 0 0 1 1.9 1.5L20 16"/>',
    msg: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
    euro: '<path d="M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9M12 3C9.5 5.5 8.5 8.5 8.5 12s1 6.5 3.5 9M3.5 9h17M3.5 15h17"/>',
    school: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
    heart: '<path d="M12 20s-7.5-4.5-9-9.5C2 6.5 6 4 9 5.5c1.3.6 2.3 1.8 3 3 .7-1.2 1.7-2.4 3-3 3-1.5 7 1 6 5-1.5 5-9 9.5-9 9.5z"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    repeat: '<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11V9a3 3 0 0 1 3-3h14"/><path d="M7 21.5 3.5 18 7 14.5"/><path d="M20.5 13v2a3 3 0 0 1-3 3h-14"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    phoneapp: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    wave: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V10M10 9.5V4.5a1.5 1.5 0 0 1 3 0V10M13 9.5V6a1.5 1.5 0 0 1 3 0v6"/><path d="M16 10a1.5 1.5 0 0 1 3 0v3a8 8 0 0 1-8 8h-.5a7 7 0 0 1-5.6-2.8L2.8 15a1.6 1.6 0 0 1 2.5-2L7 15"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
    send: '<path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5-7.5-4z"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4a1.5 1.5 0 0 1 3 0v7M14 10.5V5.5a1.5 1.5 0 0 1 3 0V13"/><path d="M17 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L3.2 15a1.6 1.6 0 0 1 2.5-2L8 15"/>'
  };
  const ic = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

  // ---------- Beispieldaten ----------
  const famList = (arr) => arr.map(([fam, kids, phone, addr]) => ({ fam, kids, phone: phone || '', addr: addr || '' }));
  function seed() {
    // Beispieltermine auf passende Wochentage legen, Schultermine nicht in Ferien oder auf Feiertage
    const nd = (dow, min = 0) => { for (let i = min; i < min + 7; i++) if (parse(day(i)).getDay() === dow) return i; return min; };
    const ns = (dow, min = 0) => { for (let i = min; i < min + 90; i++) { const d = day(i), w = parse(d).getDay(), inf = dayInfo(d); if ((dow == null ? w > 0 && w < 6 : w === dow) && !inf.ferien && !inf.holiday) return i; } return min; };
    const oMo = nd(1), oDi = nd(2), oMi = nd(3), oDo = nd(4), oFr = nd(5), oSa = nd(6, 1), oSo = nd(0, 1), oFest = ns(5, 7), oAus = nd(6, oSa + 7), oBday = nd(6, oSa + 14);
    return {
      v: 4, current: 'm1', introDone: false, modules: { kueche: true, gruppen: true, vertraege: true }, cTab: 'gruppen', view: 'heute', kTab: 'plan', gid: null, gTab: 'info', wk: 0, modal: null,
      family: 'Neumann', phone: '0160 5550142', addr: 'Lindenweg 4, Musterstadt',
      members: [
        { id: 'm1', name: 'Sandra', role: 'eltern', color: 0 },
        { id: 'm2', name: 'Jens', role: 'eltern', color: 1 },
        { id: 'k1', name: 'Ben', role: 'kind', stufe: 3, alter: 14, color: 2 },
        { id: 'k2', name: 'Lena', role: 'kind', stufe: 2, alter: 11, color: 3 },
        { id: 'k3', name: 'Mia', role: 'kind', stufe: 1, alter: 6, color: 4 }
      ],
      events: [
        { id: 'e1', date: day(oDi), start: '07:15', end: '', title: 'Sportzeug einpacken', who: ['k1'], repeat: 'weekly' },
        { id: 'e2', date: day(oMo), start: '16:00', end: '17:30', title: 'Leichtathletik', who: ['k2'], place: 'Sportplatz Nord', repeat: 'weekly', bring: 'm1', pick: '' },
        { id: 'e3', date: day(oDi), start: '17:30', end: '19:00', title: 'Handballtraining', who: ['k1'], group: 'g1', place: 'Sporthalle am Park', repeat: 'weekly', bring: 'm2', pick: 'fam:Yilmaz' },
        { id: 'e7', date: day(oDo), start: '17:30', end: '19:00', title: 'Handballtraining', who: ['k1'], group: 'g1', place: 'Sporthalle am Park', repeat: 'weekly', bring: '', pick: 'm1' },
        { id: 'e14', date: day(oMi), start: '16:30', end: '17:15', title: 'Musikschule Klavier', who: ['k2'], place: 'Musikschule, Lindenplatz', repeat: 'weekly', bring: 'self', pick: 'self' },
        { id: 'e11', date: day(oSa), start: '10:00', end: '11:00', title: 'Schwimmkurs', who: ['k3', 'm2'], repeat: 'weekly' },
        { id: 'e9', date: day(oSa), start: '14:00', end: '16:00', title: 'Heimspiel gegen TV Beispielhausen', who: ['k1', 'k2', 'k3', 'm1', 'm2'], group: 'g1' },
        { id: 'e10', date: day(oSo), start: '12:30', end: '15:00', title: 'Mittagessen bei Oma und Opa', who: ['m1', 'm2', 'k1', 'k2', 'k3'] },
        { id: 'e5', date: day(oFr), start: '08:00', end: '12:00', title: 'Kita-Ausflug', who: ['k3'], note: 'Rucksack, Brotdose' },
        { id: 'e6', date: day(nd(4, 1)), start: '15:00', end: '15:45', title: 'Zahnarzt', who: ['k2', 'm2'] },
        { id: 'e4', date: day(ns(3, 1)), start: '19:30', end: '21:00', title: 'Elternabend Klasse 6b', who: ['m1'], group: 'g2', place: 'Gymnasium, Raum 104' },
        { id: 'e8', date: day(ns(null, 2)), start: '08:00', end: '13:00', title: 'Wandertag', who: ['k2'], group: 'g2', note: 'Brotdose, Regenjacke' },
        { id: 'e12', date: day(nd(4, 7)), start: '19:00', end: '20:30', title: 'Fördervereinssitzung', who: ['m2'] }
      ],
      tasks: [
        { id: 't1', title: 'Spülmaschine ausräumen', who: 'k1', due: day(0), done: false },
        { id: 't2', title: 'Altpapier rausbringen', who: 'k2', due: day(0), done: false },
        { id: 't3', title: 'Elternbrief Wandertag unterschreiben', who: 'm2', due: day(0), done: false },
        { id: 't4', title: 'Sportzeug waschen', who: 'm1', due: day(1), done: false },
        { id: 't5', title: 'Zimmer aufräumen', who: 'k2', due: day(2), done: false },
        { id: 't6', title: 'Hausaufgaben Mathe vorzeigen', who: 'k1', due: day(1), done: false },
        { id: 't7', title: 'Spielzeug wegräumen', who: 'k3', due: day(0), done: true },
        { id: 't8', title: 'Geschenk für Emmas Geburtstag', who: 'm1', due: day(oBday - 2), done: false }
      ],
      recipes: [
        { id: 'r1', name: 'Pasta mit Tomatensoße', min: 20, fast: true, pal: ['#f6cf8e', '#e8925d', '#e9b44c', '#d9472b', '#7bb661'], z: ['Spaghetti', 'Passierte Tomaten', 'Zwiebel', 'Knoblauch', 'Parmesan'] },
        { id: 'r2', name: 'Ofengemüse mit Feta', min: 40, fast: false, pal: ['#b5d6a6', '#5f9e7a', '#e2763f', '#f0c64a', '#f7f2e8'], z: ['Paprika', 'Zucchini', 'Kartoffeln', 'Feta', 'Rosmarin'] },
        { id: 'r3', name: 'Pfannkuchen mit Apfelmus', min: 25, fast: true, pal: ['#f8deaa', '#e9b874', '#e8b45a', '#f5dd99', '#c0703c'], z: ['Mehl', 'Milch', 'Eier', 'Apfelmus'] },
        { id: 'r4', name: 'Chili sin Carne mit Reis', min: 45, fast: false, pal: ['#eb9a7d', '#b8473a', '#a8322a', '#f1d070', '#f7f2e8'], z: ['Kidneybohnen', 'Mais', 'Tomaten in Stücken', 'Paprika', 'Reis'] },
        { id: 'r5', name: 'Wraps mit Hähnchen', min: 20, fast: true, pal: ['#d3e6b3', '#8fb877', '#f0dca8', '#6da84f', '#e07a5f'], z: ['Tortilla-Wraps', 'Hähnchenbrust', 'Salat', 'Joghurt', 'Gurke'] },
        { id: 'r6', name: 'Rührkuchen', min: 70, fast: false, cake: true, pal: ['#f3d2cc', '#d98e8a', '#e6b06a', '#f6e2b3', '#b85c4a'], z: ['Mehl', 'Zucker', 'Butter', 'Eier', 'Backpulver'] }
      ],
      plan: Object.fromEntries(['r2', 'r1', 'r4', 'r3', 'r5', '', 'r1'].map((r, i) => [day(i), r])),
      wishes: [{ id: 'w1', who: 'k1', text: 'Pfannkuchen am Wochenende' }, { id: 'w2', who: 'k2', text: 'Mal wieder Wraps' }],
      shopping: [
        { id: 's1', text: 'Milch', done: false, src: '' },
        { id: 's2', text: 'Bananen', done: false, src: 'von Lena' },
        { id: 's3', text: 'Brot', done: true, src: '' }
      ],
      groups: [
        {
          id: 'g1', name: 'HSG Musterstadt C-Jugend', typ: 'Mannschaft', icon: 'ball', gi: 0, kids: ['k1'], admin: false, lead: 'Trainer Michael K.',
          share: { phone: false, addr: false }, requests: [],
          families: famList([['Yilmaz', ['Can'], '0170 5550101'], ['Becker', ['Lukas']], ['Schulz', ['Jonas'], '0151 5550199', 'Ahornweg 12'], ['Wagner', ['Finn', 'Paul']], ['Hoffmann', ['Leon'], '0176 5550123']]),
          msgs: [
            { from: 'Trainer Michael K.', role: 'Betreuer', text: 'Training am Mittwoch findet wie gewohnt statt. Bitte Hallenschuhe mitbringen.', when: 'gestern 18:42' },
            { from: 'Familie Yilmaz', role: 'Eltern', text: 'Wer fährt Samstag zum Heimspiel? Wir haben noch einen Platz frei.', when: 'heute 07:15' }
          ],
          helpers: [
            { id: 'h1', task: 'Kuchen für das Heimspiel', date: day(oSa), cake: true, by: null },
            { id: 'h2', task: 'Kasse Catering 1. Halbzeit', date: day(oSa), by: 'Familie Becker' },
            { id: 'h3', task: 'Kasse Catering 2. Halbzeit', date: day(oSa), by: null },
            { id: 'h4', task: 'Fahrdienst Auswärtsspiel', date: day(oAus), by: null }
          ],
          kasse: { title: 'Saisonabschlussfahrt, 25 € pro Kind', total: 15, paid: 9, ours: false }
        },
        {
          id: 'g2', name: 'Klassenpflegschaft 6b', typ: 'Klasse', icon: 'school', gi: 1, kids: ['k2'], admin: true, lead: 'Sandra Neumann (Elternvertretung)', code: '731 204',
          share: { phone: true, addr: false },
          requests: [{ id: 'q1', fam: 'Krämer', kid: 'Emil' }, { id: 'q2', fam: 'Öztürk', kid: 'Elif' }],
          families: famList([['Hoffmann', ['Emma'], '0172 5550188'], ['Schmidt', ['Noah']], ['Lehmann', ['Sophie'], '0160 5550177', 'Birkenstraße 3'], ['Fischer', ['Marie']], ['Yilmaz', ['Aylin'], '0170 5550101']]),
          msgs: [{ from: 'Sandra Neumann', role: 'Elternvertretung', text: 'Für das Herbstfest suchen wir noch Kuchen und Hilfe beim Aufbau. Bitte in die Helferliste eintragen.', when: 'Montag 20:10', mine: true }],
          helpers: [
            { id: 'h5', task: 'Kuchen für das Herbstfest', date: day(oFest), cake: true, by: null },
            { id: 'h6', task: 'Aufbau Herbstfest', date: day(oFest), by: 'Familie Lehmann' },
            { id: 'h7', task: 'Getränkestand Herbstfest', date: day(oFest), by: null }
          ],
          kasse: { title: 'Klassenkasse 1. Halbjahr, 15 € pro Kind', total: 28, paid: 22, ours: true }
        }
      ],
      joinable: { '482913': { name: 'Förderverein Grundschule am Park', typ: 'Förderverein', icon: 'heart', gi: 2, lead: 'Vorstand Förderverein', families: famList([['Krause', ['Ida']], ['Neumeyer', ['Tom'], '0151 5550111'], ['Arslan', ['Deniz']]]) } },
      rsvp: { ['e9@' + day(oSa) + '|k1']: 'ja' },
      connections: [
        { id: 'f1', fam: 'Yilmaz', status: 'verbunden', via: 'HSG Musterstadt C-Jugend', note: 'Fahrgemeinschaft Training dienstags' },
        { id: 'f2', fam: 'Becker', status: 'eingehend', via: 'HSG Musterstadt C-Jugend' },
        { id: 'f3', fam: 'Lehmann', status: 'verbunden', via: 'Klassenpflegschaft 6b', note: '' }
      ],
      invites: [
        { id: 'i1', from: 'Hoffmann', title: 'Emmas 11. Geburtstag', date: day(oBday), start: '15:00', end: '18:00', kid: 'k2', place: 'Trampolinhalle Musterstadt', answer: null }
      ],
      contracts: [
        { id: 'c1', name: 'Handyvertrag Ben', cat: 'Mobilfunk', amount: 9.99, per: 'monat', end: day(52), notice: 1, remind: false },
        { id: 'c2', name: 'Streamingdienst', cat: 'Unterhaltung', amount: 13.99, per: 'monat', end: day(18), notice: 0, remind: false },
        { id: 'c3', name: 'Vereinsbeitrag HSG', cat: 'Verein', amount: 120, per: 'jahr', end: day(62), notice: 1, remind: false },
        { id: 'c4', name: 'Musikschule Lena', cat: 'Bildung', amount: 58, per: 'monat', end: day(152), notice: 3, remind: false },
        { id: 'c5', name: 'Zeitschrift', cat: 'Abo', amount: 89, per: 'jahr', end: day(40), notice: 2, remind: false }
      ],
      pair: {}
    };
  }

  let S;
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === 4) { S = s; S.modal = S.introDone ? null : { t: 'intro', step: 1 }; return; } } } catch (e) { /* ohne Speicher weiter */ }
    S = seed(); S.modal = { t: 'intro', step: 1 };
  }
  function save() { try { const c = Object.assign({}, S, { modal: null, popId: null, celebrate: false }); localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* ignorieren */ } }

  // ---------- Rollen und Rechte ----------
  const member = id => S.members.find(m => m.id === id);
  const me = () => member(S.current);
  const isParent = (m = me()) => m.role === 'eltern';
  const level = (m = me()) => isParent(m) ? 9 : m.stufe;
  const mod = k => !S.modules || S.modules[k] !== false;
  const canGroups = () => level() >= 3 && mod('gruppen');
  const canFamilies = () => isParent() && mod('gruppen');
  const canContracts = () => isParent() && mod('vertraege');
  const parents = () => S.members.filter(m => m.role === 'eltern');
  const av = (id, cls = '') => { const m = member(id); return m ? `<span class="av ${cls} p${m.color}" title="${esc(m.name)}">${esc(m.name[0])}</span>` : ''; };
  const avs = (ids, cls = 'sm') => `<span class="avs">${ids.map(i => av(i, cls)).join('')}</span>`;
  const famAv = (fam, cls = '') => `<span class="av fam ${cls}">${esc(fam[0])}</span>`;
  const visibleEvents = () => isParent() ? S.events : S.events.filter(e => e.who.includes(S.current));
  const recipe = id => S.recipes.find(r => r.id === id);
  const group = id => S.groups.find(g => g.id === id);
  // Serien: Termine an einem Tag inklusive wöchentlicher Wiederholungen
  function eventsOn(d, all = false) {
    const src = all ? S.events : visibleEvents();
    return src.filter(e => e.date === d || (e.repeat === 'weekly' && d > e.date && parse(d).getDay() === parse(e.date).getDay() && !(e.skip || []).includes(d)))
      .map(e => Object.assign({}, e, { date: d, oid: e.id + '@' + d })).sort(byTime);
  }
  function eventsAhead(days, all = false) { let r = []; for (let i = 0; i < days; i++) r = r.concat(eventsOn(day(i), all)); return r; }
  const findOcc = oid => { const [id, d] = String(oid).split('@'); const e = S.events.find(x => x.id === id); return e ? Object.assign({}, e, { date: d || e.date, oid }) : null; };
  // Fahrten
  const needRide = e => !!e.place && e.who.some(w => member(w) && member(w).role === 'kind') && !e.who.some(w => member(w) && member(w).role === 'eltern');
  function rideName(v) {
    if (!v) return '';
    if (v === 'self') return 'allein';
    if (v.startsWith('fam:')) return 'Familie ' + v.slice(4);
    const m = member(v); return m ? m.name : '';
  }
  const rideOptions = sel => [['', 'noch offen'], ...parents().map(m => [m.id, m.name]), ['self', 'fährt allein'], ...S.connections.filter(c => c.status === 'verbunden').map(c => ['fam:' + c.fam, 'Familie ' + c.fam])].map(([v, l]) => `<option value="${v}" ${v === (sel || '') ? 'selected' : ''}>${esc(l)}</option>`).join('');
  function rideInfo(e) {
    if (!needRide(e)) return '';
    const b = rideName(e.bring), p = rideName(e.pick);
    if (!b || !p) return `<span class="pill warm">${ic('car')} ${!b && !p ? 'Fahrten offen' : !b ? 'Hinfahrt offen' : 'Abholung offen'}</span>`;
    return `<span class="pill">${ic('car')} hin ${esc(b)} · zurück ${esc(p)}</span>`;
  }
  const myGroups = () => S.groups.filter(g => isParent() || g.kids.includes(S.current));
  const firstColor = e => member(e.who[0]) ? member(e.who[0]).color : 0;

  // ---------- Verknüpfung Kalender und Küche ----------
  const lateOn = date => eventsOn(date, true).filter(e => e.end && e.end > '18:30' && e.start < '19:00');
  function mealInfo(date) {
    const r = recipe(S.plan[date]);
    const late = lateOn(date);
    return { r, late, warn: !!(r && !r.fast && late.length) };
  }
  const lateShort = late => late.map(e => `${e.who.map(w => member(w).name).join(' und ')} ab ${e.end}`).join(', ');

  // ---------- Illustration Essen ----------
  function foodArt(r, cls = 'food') {
    if (!r) return `<svg class="${cls}" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="320" height="160" fill="var(--surface2)"/><ellipse cx="160" cy="82" rx="62" ry="38" fill="none" stroke="var(--surface3)" stroke-width="3" stroke-dasharray="8 8"/><path d="M160 66v32M144 82h32" stroke="var(--muted)" stroke-width="3" stroke-linecap="round" opacity=".5"/></svg>`;
    const [a, b, f1, f2, f3] = r.pal;
    const g = `g${r.id}`;
    const extra = r.cake
      ? `<path d="M116 92h88v-26a8 8 0 0 0-8-8h-72a8 8 0 0 0-8 8z" fill="${f1}"/><path d="M116 70h88" stroke="${f2}" stroke-width="7"/><path d="M116 66c10 8 18 8 22 0s14-8 22 0 18 8 22 0 14-8 22 0" fill="none" stroke="${f2}" stroke-width="6" stroke-linecap="round"/><circle cx="160" cy="52" r="7" fill="${f3}"/>`
      : `<circle cx="140" cy="80" r="24" fill="${f1}"/><circle cx="176" cy="76" r="21" fill="${f2}"/><circle cx="158" cy="100" r="16" fill="${f3}"/><circle cx="124" cy="98" r="6" fill="${f2}"/><circle cx="194" cy="96" r="7" fill="${f1}"/><ellipse cx="190" cy="62" rx="10" ry="5" fill="#6aa65a" transform="rotate(-30 190 62)"/><ellipse cx="134" cy="60" rx="8" ry="4" fill="#6aa65a" transform="rotate(25 134 60)"/>`;
    return `<svg class="${cls}" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(r.name)}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="320" height="160" fill="url(#${g})"/><circle cx="270" cy="22" r="54" fill="#fff" opacity=".14"/><circle cx="34" cy="150" r="40" fill="#fff" opacity=".1"/><ellipse cx="160" cy="92" rx="90" ry="54" fill="#000" opacity=".08"/><ellipse cx="160" cy="84" rx="88" ry="54" fill="#fffdf9"/><ellipse cx="160" cy="84" rx="66" ry="39" fill="#f4ede3"/>${extra}</svg>`;
  }

  // ---------- Bausteine ----------
  const hero = (eyebrow, title, lead, actions = '') => `<div class="hero"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div>${actions ? `<div class="row wrap">${actions}</div>` : ''}</div>`;
  const cardH = (icon, title, right = '', tone = '') => `<div class="card-h"><div class="ttl"><span class="ic ${tone}">${ic(icon)}</span><h2>${title}</h2></div>${right}</div>`;
  const emptyArt = k => `<svg class="empty-art" viewBox="0 0 120 84" aria-hidden="true"><circle class="ea1" cx="60" cy="42" r="34"/><circle class="ea2" cx="97" cy="18" r="7"/><circle class="ea3" cx="22" cy="66" r="9"/><circle class="ea2" cx="18" cy="22" r="3"/><g class="ea-ic" transform="translate(42 24) scale(1.5)" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${IC[k] || IC.sparkle}</g></svg>`;
  const empty = (t, art) => `<div class="empty">${art ? emptyArt(art) : ''}<div>${t}</div></div>`;

  function taskLi(x) {
    const mine = x.who === S.current || isParent();
    return `<li class="li ${x.done ? 'done' : ''}"><button class="check ${x.done ? 'on' : ''} ${S.popId === x.id ? 'pop' : ''}" data-a="task" data-id="${x.id}" ${mine ? '' : 'disabled'} aria-label="${x.done ? 'Als offen markieren' : 'Erledigt'}">${x.done ? ic('tick') : ''}</button><div class="grow"><div class="t">${esc(x.title)}</div><div class="xs muted">${relDay(x.due)}</div></div>${av(x.who)}</li>`;
  }

  function timeline(date) {
    const ev = eventsOn(date);
    if (!ev.length) return empty('Heute ist nichts geplant.', 'sun');
    const now = nowHM();
    let shown = false, h = '<ul class="tl">';
    ev.forEach(e => {
      if (date === day(0) && !shown && e.start > now) { h += `<li class="tl-now">Jetzt ${now}</li>`; shown = true; }
      const g = e.group ? group(e.group) : null;
      h += `<li class="tl-item" data-a="openevent" data-id="${e.oid}"><div class="tl-time">${e.start}${e.end ? `<small>${e.end}</small>` : ''}</div><div class="tl-body bl${firstColor(e)}"><div class="t">${esc(e.title)}${e.repeat ? ` <span class="rep" title="wöchentlich">${ic('repeat')}</span>` : ''}</div><div class="tl-meta">${avs(e.who)}${g ? `<span class="pill">${esc(g.name)}</span>` : ''}${rideInfo(e)}${e.place ? `<span class="xs muted">${esc(e.place)}</span>` : ''}</div></div></li>`;
    });
    if (date === day(0) && !shown) h += `<li class="tl-now">Jetzt ${now}</li>`;
    return h + '</ul>';
  }

  // ---------- Teilen: was gerade sinnvoll weiterzusagen ist ----------
  function shareOptions() {
    const o = [];
    S.groups.filter(g => !g.pending).forEach(g => { const n = g.helpers.filter(x => !x.by).length; if (n) o.push(['helpers|' + g.id, 'hand', 'Helfer gesucht', `${esc(g.name)}, ${n} offen`, 'gold']); });
    const sh = S.shopping.filter(x => !x.done).length;
    if (mod('kueche') && sh) o.push(['shop|x', 'cart', 'Einkaufsliste', `${sh} Artikel`, 'warm']);
    const ev = eventsOn(day(0), true).length;
    if (ev) o.push(['day|' + day(0), 'cal', 'Tagesplan heute', `${ev} ${ev === 1 ? 'Termin' : 'Termine'}, ohne Namen`, '']);
    S.groups.filter(g => g.admin && g.code).forEach(g => o.push(['invite|' + g.id, 'userplus', 'Einladung', esc(g.name), '']));
    return o;
  }
  const shareList = (o) => `<ul class="list">${o.map(([id, i, l, d, tone]) => `<li class="li clickable" data-a="share" data-id="${id}"><span class="card-h"><span class="ic ${tone}">${ic(i)}</span></span><div class="grow"><div class="t">${l}</div><div class="xs muted">${d}</div></div><span class="pill green">${ic('copy')} Text</span></li>`).join('')}</ul>`;

  // ---------- Ansicht: Heute ----------
  function ring(done, total) {
    const r = 34, c = 2 * Math.PI * r, p = total ? done / total : 1;
    return `<svg class="ring" viewBox="0 0 84 84" aria-label="${done} von ${total} erledigt"><circle class="ring-bg" cx="42" cy="42" r="${r}"/>${done ? `<circle class="ring-fg" cx="42" cy="42" r="${r}" stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 42 42)"/>` : ''}<text x="42" y="40" text-anchor="middle" class="ring-n">${done}/${total}</text><text x="42" y="55" text-anchor="middle" class="ring-l">erledigt</text></svg>`;
  }

  function vHeuteKind() {
    const t = day(0), m = me();
    const tasks = S.tasks.filter(x => x.who === m.id && (x.due === t || (!x.done && x.due < t)));
    const done = tasks.filter(x => x.done).length, all = tasks.length && done === tasks.length;
    const mi = mealInfo(t);
    const rides = eventsOn(t).filter(needRide);
    let h = `<div class="kid-hero"><div class="row">${av(m.id, 'xl')}<div><p class="eyebrow">${fmtLong(t)}</p><h1>Hey ${esc(m.name)}!</h1><p class="lead">${all ? 'Alles erledigt für heute. Stark!' : tasks.length ? 'Noch ' + (tasks.length - done) + ' Aufgabe' + (tasks.length - done === 1 ? '' : 'n') + ' für heute.' : 'Heute hast du keine Aufgaben.'}</p></div></div>${tasks.length ? ring(done, tasks.length) : ''}</div>`;
    const left = `<section class="card kid">${cardH('tasks', 'Deine Aufgaben')}${tasks.length ? `<ul class="list">${tasks.map(taskLi).join('')}</ul>` : empty('Keine Aufgaben. Genieß den Tag!', 'sun')}</section>
      <section class="card">${cardH('clock', 'Dein Tag', `<button class="btn sm ghost" data-a="go" data-id="kalender">Woche ${ic('right')}</button>`)}${timeline(t)}${rides.map(e => `<div class="hint ${e.pick ? 'green' : 'warm'}">${ic('car')}<div class="grow">${esc(e.title)}: ${e.bring === 'self' ? 'Du fährst allein hin' : 'Hin bringt dich ' + esc(rideName(e.bring) || 'noch niemand')}${e.pick === 'self' ? ', zurück auch allein.' : e.pick ? ', zurück holt dich ' + esc(rideName(e.pick)) + ' ab.' : ', die Abholung ist noch offen.'}</div></div>`).join('')}</section>`;
    const right = !mod('kueche') ? '' : `<section class="card">${cardH('food', 'Heute Abend', '', 'warm')}<div class="meal-hero">${foodArt(mi.r)}<div><div class="strong">${mi.r ? esc(mi.r.name) : 'Noch nichts geplant'}</div></div></div></section>
      <section class="card">${cardH('sparkle', 'Essenswunsch', '', 'gold')}<p class="small muted">Dein Wunsch landet bei deinen Eltern im Wochenplan.</p>${wishForm()}</section>
      <section class="card">${cardH('cart', 'Fehlt was?')}<p class="small muted">Setz es direkt auf die Einkaufsliste.</p><form class="addbar" data-f="shop"><input class="input" name="text" placeholder="z. B. Müsli" required maxlength="60" aria-label="Artikel"><button class="btn primary">${ic('plus')}</button></form></section>`;
    return h + `<div class="grid g-dash"><div class="stack">${left}</div><div class="stack">${right}</div></div>`;
  }

  function vHeute() {
    if (!isParent()) return vHeuteKind();
    const t = day(0), m = me(), hr = new Date().getHours();
    const greet = hr < 11 ? 'Guten Morgen' : hr < 17 ? 'Hallo' : 'Guten Abend';
    const evCount = eventsOn(t).length;
    const tasks = S.tasks.filter(x => !x.done && x.due <= t && (isParent() || x.who === S.current));
    const shopOpen = S.shopping.filter(s => !s.done).length;
    const mi = mealInfo(t);

    const di = dayInfo(t), tm = dayInfo(day(1));
    const lead = di.holiday ? `Heute ist ${di.holiday}.` : di.ferien ? `${di.ferien} bis ${fmt(di.ferienEnd)}` : tm.holiday ? `Morgen ist ${tm.holiday}.` : 'Das steht heute bei euch an.';
    let h = hero(fmtLong(t), `${greet}, ${esc(m.name)}`, lead);
    h += `<div class="stats">
      <button class="stat" data-a="go" data-id="kalender"><b>${evCount}</b><span>Termine heute</span></button>
      <button class="stat" data-a="go" data-id="aufgaben"><b>${tasks.length}</b><span>offene Aufgaben</span></button>
      <button class="stat" data-a="shoplist"><b>${shopOpen}</b><span>auf der Einkaufsliste</span></button></div>`;

    const left = `<section class="card">${cardH('clock', 'Tagesablauf', `<button class="btn sm ghost" data-a="go" data-id="kalender">Woche ${ic('right')}</button>`)}${timeline(t)}</section>
      <section class="card">${cardH('tasks', 'Aufgaben heute', `<button class="btn sm ghost" data-a="go" data-id="aufgaben">Alle ${ic('right')}</button>`)}${tasks.length ? `<ul class="list">${tasks.map(taskLi).join('')}</ul>` : empty('Alles erledigt. Schön!', 'tasks')}</section>`;

    let meal = `<section class="card">${cardH('food', 'Abendessen', '', 'warm')}<div class="meal-hero">${foodArt(mi.r)}<div><div class="strong">${mi.r ? esc(mi.r.name) : 'Noch nichts geplant'}</div>${mi.r ? `<div class="row mt"><span class="pill ${mi.r.fast ? 'green' : ''}">${ic('clock')} ${mi.r.min} Min.</span></div>` : ''}</div></div>`;
    if (mi.late.length) meal += `<div class="hint ${mi.warn ? 'warm' : 'green'}">${ic(mi.warn ? 'clock' : 'tick')}<div class="grow">${esc(lateShort(mi.late))} zu Hause.${mi.warn ? ' Heute passt ein schnelles Gericht besser.' : ''}</div></div>`;
    if (mi.warn && isParent()) meal += `<button class="btn soft sm mt" data-a="quickmeal" data-id="${t}">${ic('sparkle')} Schnelles Gericht wählen</button>`;
    meal += '</section>';

    const so = shareOptions().slice(0, 3);
    const shareCard = so.length ? `<section class="card share-card">${cardH('copy', 'Für den Messenger', `<button class="btn sm ghost" data-a="modal" data-id="sharepick">Alle ${ic('right')}</button>`)}<p class="xs muted">Fertigen Text kopieren und selbst in WhatsApp, Signal oder Threema einfügen. Für Eltern, die die App noch nicht nutzen.</p>${shareList(so)}</section>` : '';
    let right = (mod('kueche') ? meal : '') + shareCard;
    const rides = eventsOn(t, true).filter(needRide);
    if (isParent() && rides.length) {
      right += `<section class="card">${cardH('car', 'Fahrten heute', rides.some(e => !e.bring || !e.pick) ? '<span class="pill warm">offen</span>' : '<span class="pill green">alles geklärt</span>')}<ul class="list">${rides.map(e => `<li class="li clickable" data-a="openevent" data-id="${e.oid}">${av(e.who[0])}<div class="grow"><div class="t">${esc(e.title)}</div><div class="xs muted">${e.start} bis ${e.end} · ${esc(e.place)}</div><div class="row wrap mt-xs"><span class="pill ${e.bring ? '' : 'warm'}">hin: ${esc(rideName(e.bring) || 'offen')}</span><span class="pill ${e.pick ? '' : 'warm'}">zurück: ${esc(rideName(e.pick) || 'offen')}</span></div></div>${ic('right')}</li>`).join('')}</ul></section>`;
    }
    if (isParent()) {
      const items = [];
      S.groups.filter(g => g.admin && g.requests.length).forEach(g => items.push([`<b>${g.requests.length} Beitrittsanfragen</b> für ${esc(g.name)}`, 'userplus', `<button class="btn sm soft" data-a="opengroup" data-id="${g.id}">Prüfen</button>`]));
      S.invites.filter(i => !i.answer).forEach(i => items.push([`Einladung: <b>${esc(i.title)}</b> für ${esc(member(i.kid).name)}`, 'cake', `<button class="btn sm soft" data-a="go" data-id="familien">Antworten</button>`]));
      S.connections.filter(c => c.status === 'eingehend').forEach(c => items.push([`<b>Familie ${esc(c.fam)}</b> möchte sich verbinden`, 'link', `<button class="btn sm soft" data-a="go" data-id="familien">Ansehen</button>`]));
      const open = S.groups.reduce((n, g) => n + g.helpers.filter(x => !x.by).length, 0);
      if (open) items.push([`${open} offene Helferaufgaben in euren Gruppen`, 'hand', `<button class="btn sm ghost" data-a="go" data-id="gruppen">${ic('right')}</button>`]);
      S.contracts.forEach(c => { const dl = minusMonths(c.end, c.notice), d = diff(t, dl); if (d >= 0 && d <= 30) items.push([`Kündigungsfrist <b>${esc(c.name)}</b> in ${d} Tagen`, 'file', `<button class="btn sm ghost" data-a="go" data-id="vertraege">${ic('right')}</button>`]); });
      right += `<section class="card">${cardH('bell', 'Für euch', items.length ? `<span class="badge">${items.length}</span>` : '', 'gold')}${items.length ? `<ul class="list">${items.map(([txt, icn, btn]) => `<li class="li"><span class="muted">${ic(icn)}</span><div class="grow small">${txt}</div>${btn}</li>`).join('')}</ul>` : empty('Nichts Neues.')}</section>`;
    } else {
      right += `<section class="card">${cardH('sparkle', 'Essenswunsch', '', 'gold')}<p class="small muted">Dein Wunsch landet bei deinen Eltern im Wochenplan.</p>${wishForm()}</section>`;
    }
    return h + `<div class="grid g-dash"><div class="stack">${left}</div><div class="stack">${right}</div></div>`;
  }

  // ---------- Ansicht: Kalender ----------
  function vKalender() {
    const start = S.wk * 7, first = day(start), last = day(start + 6);
    const actions = `<div class="seg"><button data-a="wk" data-id="-1" aria-label="Vorherige Woche">${ic('left')}</button><button class="${S.wk === 0 ? 'on' : ''}" data-a="wk" data-id="0">Heute</button><button data-a="wk" data-id="1" aria-label="Nächste Woche">${ic('right')}</button></div>${isParent() ? `<button class="btn primary" data-a="modal" data-id="newevent">${ic('plus')} Termin</button>` : ''}`;
    let h = hero('Kalender', `${parse(first).getDate()}. ${MON[parse(first).getMonth()]} bis ${parse(last).getDate()}. ${MON[parse(last).getMonth()]}`, isParent() ? 'Alle Termine der Familie' : 'Deine Termine', actions);
    h += '<div class="week">';
    for (let i = 0; i < 7; i++) {
      const d = day(start + i), x = parse(d), list = eventsOn(d);
      const inf = dayInfo(d);
      h += `<div class="dcol ${d === day(0) ? 'today' : ''} ${inf.holiday || inf.ferien ? 'offday' : ''}"><div class="dhead"><b>${x.getDate()}</b><span>${d === day(0) ? 'Heute' : WDL[x.getDay()]}</span></div>${inf.holiday ? `<span class="pill red xs-pill">${esc(inf.holiday)}</span>` : inf.ferien ? `<span class="pill gold xs-pill">${esc(inf.ferien)}</span>` : ''}`;
      h += list.length ? list.map(e => `<div class="ev bl${firstColor(e)}" data-a="openevent" data-id="${e.oid}"><small>${e.start}${e.end ? '–' + e.end : ''}${e.repeat ? ' ' + ic('repeat') : ''}</small><b>${esc(e.title)}</b><span class="row">${avs(e.who)}${needRide(e) && (!e.bring || !e.pick) ? `<span class="c2" title="Fahrt offen">${ic('car')}</span>` : ''}</span></div>`).join('') : `<div class="free">${ic('sun')}<span>frei</span></div>`;
      h += '</div>';
    }
    h += '</div>' + timeGrid(start);
    h += '<div class="hint gray mt">' + ic('info') + '<div class="grow">Ferien und Feiertage NRW sind eingetragen. Im Produkt bekommt jede Person zusätzlich ein Kalenderabo für Apple, Google, Outlook oder Home Assistant.</div></div>';
    return h;
  }

  function timeGrid(start) {
    const H0 = 7, H1 = 22, PX = 46, toMin = t => { const [a, b] = t.split(':').map(Number); return a * 60 + b; };
    let head = '<div class="tg-corner"></div>', all = '<div class="tg-lbl">ganztägig</div>', cols = '';
    for (let i = 0; i < 7; i++) {
      const d = day(start + i), x = parse(d), inf = dayInfo(d), list = eventsOn(d);
      head += `<div class="tg-dh ${d === day(0) ? 'today' : ''}"><span>${WD[x.getDay()]}</span><b>${x.getDate()}</b></div>`;
      const timed = list.filter(e => e.start && toMin(e.start) >= H0 * 60 && toMin(e.start) < H1 * 60), untimed = list.filter(e => !timed.includes(e));
      all += `<div class="tg-ad ${inf.holiday || inf.ferien ? 'offday' : ''}">${inf.holiday ? `<span class="pill red xs-pill">${esc(inf.holiday)}</span>` : inf.ferien ? `<span class="pill gold xs-pill">${esc(inf.ferien)}</span>` : ''}${untimed.map(e => `<div class="ev bl${firstColor(e)}" data-a="openevent" data-id="${e.oid}"><b>${esc(e.title)}</b></div>`).join('')}</div>`;
      const lanes = [], placed = timed.map(e => {
        const s0 = toMin(e.start), s1 = e.end ? Math.max(toMin(e.end), s0 + 30) : s0 + 30;
        let lane = lanes.findIndex(end => end <= s0); if (lane < 0) { lane = lanes.length; lanes.push(0); } lanes[lane] = s1;
        return { e, s0, s1, lane };
      });
      const n = Math.max(1, lanes.length);
      let col = `<div class="tg-col ${d === day(0) ? 'today' : ''} ${inf.holiday || inf.ferien ? 'offday' : ''}">`;
      placed.forEach(({ e, s0, s1, lane }) => {
        col += `<div class="tg-ev bl${firstColor(e)}" data-a="openevent" data-id="${e.oid}" data-top="${((s0 - H0 * 60) / 60 * PX).toFixed(0)}" data-h="${((s1 - s0) / 60 * PX - 3).toFixed(0)}" data-l="${(lane * 100 / n).toFixed(2)}" data-w="${(100 / n).toFixed(2)}">${(s1 - s0) < 60 ? `<b class="one"><small>${e.start}</small> ${esc(e.title)}</b>` : `<small>${e.start}${e.end ? '–' + e.end : ''}</small><b>${esc(e.title)}</b>${avs(e.who)}`}</div>`;
      });
      if (d === day(0)) { const nm = toMin(nowHM()); if (nm > H0 * 60 && nm < H1 * 60) col += `<div class="tg-now" data-top="${((nm - H0 * 60) / 60 * PX).toFixed(0)}"></div>`; }
      cols += col + '</div>';
    }
    let hours = '';
    for (let hr = H0; hr < H1; hr++) hours += `<div class="tg-h">${pad(hr)}:00</div>`;
    return `<div class="tgrid"><div class="tg-head">${head}</div><div class="tg-all">${all}</div><div class="tg-body"><div class="tg-hours">${hours}</div>${cols}</div></div>`;
  }

  // ---------- Ansicht: Aufgaben ----------
  function vAufgaben() {
    let h = hero('Aufgaben', isParent() ? 'Wer macht was' : 'Deine Aufgaben', isParent() ? 'Kinder sehen nur ihre eigenen Aufgaben und haken sie selbst ab.' : 'Hake ab, was du erledigt hast.', isParent() ? `<button class="btn primary" data-a="modal" data-id="newtask">${ic('plus')} Aufgabe</button>` : '');
    const people = isParent() ? S.members : [me()];
    h += `<div class="grid ${isParent() ? 'g3' : ''}">`;
    people.forEach(p => {
      const list = S.tasks.filter(x => x.who === p.id).sort((a, b) => (a.done - b.done) || a.due.localeCompare(b.due));
      const open = list.filter(x => !x.done).length;
      h += `<section class="card"><div class="card-h"><div class="ttl">${av(p.id, 'lg')}<div><h2>${esc(p.name)}</h2><div class="xs muted">${open} offen</div></div></div></div>${list.length ? `<ul class="list">${list.map(taskLi).join('')}</ul>` : empty('Keine Aufgaben.', 'tasks')}</section>`;
    });
    return h + '</div>';
  }

  // ---------- Ansicht: Küche ----------
  const wishForm = () => `<form class="addbar" data-f="wish"><input class="input" name="text" placeholder="Was möchtest du gern essen?" required maxlength="60" aria-label="Essenswunsch"><button class="btn primary">${ic('send')}</button></form>`;

  function vKueche() {
    if (!mod('kueche')) { S.view = 'heute'; return vHeute(); }
    const actions = S.kTab === 'plan' && isParent() ? `<button class="btn primary" data-a="planshop">${ic('cart')} Zutaten der Woche auf die Liste</button>` : '';
    let h = hero('Küche', S.kTab === 'plan' ? 'Wochenplan' : S.kTab === 'rezepte' ? 'Rezepte' : 'Einkaufsliste', 'Wochenplan, Rezepte und Einkauf hängen zusammen.', actions);
    h += `<div class="tabs" role="tablist">${[['plan', 'Wochenplan'], ['rezepte', 'Rezepte'], ['einkauf', 'Einkauf']].map(([k, l]) => `<button role="tab" class="${S.kTab === k ? 'on' : ''}" data-a="ktab" data-id="${k}">${l}</button>`).join('')}</div>`;
    if (S.kTab === 'plan') h += kPlan(); else if (S.kTab === 'rezepte') h += kRezepte(); else h += kEinkauf();
    return h;
  }

  function kPlan() {
    let h = '<div class="plan">';
    for (let i = 0; i < 7; i++) {
      const d = day(i), mi = mealInfo(d), x = parse(d);
      h += `<section class="card pday"><div class="row between"><div><div class="strong">${i === 0 ? 'Heute' : i === 1 ? 'Morgen' : WDL[x.getDay()]}</div><div class="xs muted">${x.getDate()}. ${MON[x.getMonth()]}</div></div>${mi.r ? `<span class="pill ${mi.r.fast ? 'green' : ''}">${mi.r.min} Min.</span>` : ''}</div>${foodArt(mi.r)}`;
      if (isParent()) h += `<select data-c="plan" data-id="${d}" aria-label="Gericht am ${fmt(d)}"><option value="">nicht geplant</option>${S.recipes.filter(r => !r.cake).map(r => `<option value="${r.id}" ${S.plan[d] === r.id ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select>`;
      else h += `<div class="strong small">${mi.r ? esc(mi.r.name) : '<span class="muted">nicht geplant</span>'}</div>`;
      if (mi.late.length) h += `<span class="pill ${mi.warn ? 'warm' : 'green'}">${ic('clock')} ${esc(lateShort(mi.late))}</span>`;
      if (mi.warn && isParent()) h += `<button class="btn sm soft" data-a="quickmeal" data-id="${d}">${ic('sparkle')} Schnell tauschen</button>`;
      h += '</section>';
    }
    h += `<section class="card pday">${cardH('sparkle', 'Wünsche', '', 'gold')}${S.wishes.length ? `<ul class="list">${S.wishes.map(w => `<li class="li">${av(w.who, 'sm')}<span class="grow small">${esc(w.text)}</span>${isParent() ? `<button class="btn sm ghost" data-a="delwish" data-id="${w.id}" aria-label="Wunsch erledigt">${ic('tick')}</button>` : ''}</li>`).join('')}</ul>` : empty('Keine Wünsche offen.', 'sparkle')}${wishForm()}</section>`;
    return h + '</div>';
  }

  function kRezepte() {
    return `<div class="recipes">${S.recipes.map(r => `<section class="card rcard">${foodArt(r)}<div class="rb"><div class="row between"><h2>${esc(r.name)}</h2><span class="pill ${r.fast ? 'green' : ''}">${r.min} Min.</span></div><div class="small muted">${r.z.map(esc).join(' · ')}</div><div class="grow"></div><button class="btn sm" data-a="recipeshop" data-id="${r.id}">${ic('cart')} Zutaten auf die Liste</button></div></section>`).join('')}</div><div class="hint gray mt">${ic('info')}<div class="grow">Im Produkt: eigene Rezepte anlegen und Rezepte von Webseiten für den privaten Gebrauch importieren.</div></div>`;
  }

  function kEinkauf() {
    const open = S.shopping.filter(s => !s.done), done = S.shopping.filter(s => s.done);
    const row = s => `<li class="li ${s.done ? 'done' : ''}"><button class="check ${s.done ? 'on' : ''} ${S.popId === s.id ? 'pop' : ''}" data-a="shop" data-id="${s.id}" aria-label="Erledigt">${s.done ? ic('tick') : ''}</button><div class="grow"><div class="t">${esc(s.text)}</div>${s.src ? `<div class="xs muted">${esc(s.src)}</div>` : ''}</div></li>`;
    return `<div class="grid g2"><section class="card">${cardH('cart', 'Noch zu kaufen', `<div class="row"><span class="pill">${open.length}</span><button class="btn sm ghost icon-btn" data-a="share" data-id="shop|x" aria-label="Liste als Text kopieren">${ic('copy')}</button></div>`)}<form class="addbar" data-f="shop"><input class="input" name="text" placeholder="Was fehlt?" required maxlength="60" aria-label="Artikel"><button class="btn primary">${ic('plus')}</button></form><ul class="list mt">${open.map(row).join('') || empty('Alles da. Die Liste ist leer.', 'cart')}</ul></section>
      <section class="card">${cardH('tick', 'Im Wagen', done.length ? `<button class="btn sm ghost" data-a="clearshop">Leeren</button>` : '')}${done.length ? `<ul class="list">${done.map(row).join('')}</ul>` : empty('Noch nichts im Wagen.', 'tick')}</section></div>`;
  }

  // ---------- Ansicht: Gemeinschaft ----------
  function commHead(tab, actions) {
    const req = S.groups.reduce((n, g) => n + (g.admin ? g.requests.length : 0), 0);
    const fam = S.connections.filter(c => c.status === 'eingehend').length + S.invites.filter(i => !i.answer).length;
    let h = hero('Gemeinschaft', 'Gruppen und Kontakte', tab === 'gruppen' ? 'Beitritt nur auf Einladung. Kein öffentliches Verzeichnis.' : 'Verbindungen entstehen nur, wenn beide Familien zustimmen.', actions);
    if (canFamilies()) h += `<div class="tabs" role="tablist"><button role="tab" class="${tab === 'gruppen' ? 'on' : ''}" data-a="go" data-id="gruppen">Gruppen${req ? ` <span class="badge">${req}</span>` : ''}</button><button role="tab" class="${tab === 'kontakte' ? 'on' : ''}" data-a="go" data-id="familien">Kontakte und Einladungen${fam ? ` <span class="badge">${fam}</span>` : ''}</button></div>`;
    return h;
  }

  // ---------- Ansicht: Gruppen ----------
  function vGruppen() {
    if (!canGroups()) return hero('Gruppen', 'Nicht freigeschaltet', '') + `<div class="hint gray">${ic('lock')}<div class="grow">Gruppen sind für dein Konto nicht freigeschaltet. Termine aus deinen Gruppen siehst du im Kalender.</div></div>`;
    const actions = isParent() ? `<button class="btn" data-a="modal" data-id="join">${ic('key')} Mit Code beitreten</button><button class="btn primary" data-a="modal" data-id="creategroup">${ic('plus')} Gruppe gründen</button>` : '';
    let h = commHead('gruppen', actions);
    h += `<div class="grid g3">`;
    myGroups().forEach(g => {
      const open = g.helpers.filter(x => !x.by).length;
      h += `<section class="card gcard" data-a="opengroup" data-id="${g.id}"><div class="row"><span class="gicon gi${g.gi}">${ic(g.icon)}</span><div class="grow"><h2>${esc(g.name)}</h2><div class="xs muted">${esc(g.typ)} · ${g.families.length + 1} Familien</div></div></div>
        <div class="row wrap">${g.pending ? '<span class="pill gold">Wartet auf Bestätigung</span>' : ''}${g.admin ? '<span class="pill green">Du verwaltest</span>' : ''}${g.admin && g.requests.length ? `<span class="pill warm">${g.requests.length} Anfragen</span>` : ''}${open && !g.pending ? `<span class="pill">${open} Helfer gesucht</span>` : ''}</div>
        <div class="row between"><span class="xs muted">${isParent() ? 'Für ' + g.kids.map(k => esc(member(k).name)).join(', ') : esc(g.lead)}</span>${avs(g.kids)}</div></section>`;
    });
    h += '</div>';
    h += `<div class="hint green mt">${ic('shield')}<div class="grow">Kinderschutz: Keine Privatchats zwischen Erwachsenen und Kindern anderer Familien. Nachrichten an Kinder sehen auch die Eltern. Kontaktdaten gibt jede Familie nur freiwillig frei.</div></div>`;
    return h;
  }

  function vGruppe() {
    const g = group(S.gid);
    if (!g || !(isParent() || g.kids.includes(S.current))) { S.view = 'gruppen'; return vGruppen(); }
    const tabs = [['info', 'Übersicht'], ['msgs', 'Nachrichten']];
    if (isParent()) tabs.push(['members', 'Mitglieder'], ['kasse', 'Kasse']);
    if (!tabs.some(t => t[0] === S.gTab)) S.gTab = 'info';
    let h = `<button class="btn sm ghost" data-a="go" data-id="gruppen">${ic('left')} Gemeinschaft</button>`;
    h += `<div class="hero"><div class="row"><span class="gicon gi${g.gi}">${ic(g.icon)}</span><div><p class="eyebrow">${esc(g.typ)}</p><h1>${esc(g.name)}</h1><p class="lead">Verwaltet von ${esc(g.lead)}</p></div></div>${g.admin ? `<div class="row"><button class="btn primary" data-a="modal" data-id="invite">${ic('userplus')} Familien einladen</button></div>` : ''}</div>`;
    if (g.pending) return h + `<section class="card"><div class="hint gold">${ic('clock')}<div class="grow">Eure Beitrittsanfrage liegt beim Gruppenverwalter. Sobald sie bestätigt ist, seht ihr Termine, Nachrichten und Helferlisten.</div></div><button class="btn mt" data-a="approveme" data-id="${g.id}">Bestätigung simulieren (nur Demo)</button></section>`;
    h += `<div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" class="${S.gTab === k ? 'on' : ''}" data-a="gtab" data-id="${k}">${l}${k === 'info' && g.admin && g.requests.length ? ` <span class="badge">${g.requests.length}</span>` : ''}</button>`).join('')}</div>`;

    if (S.gTab === 'info') {
      const ev = eventsAhead(21, true).filter(e => e.group === g.id).slice(0, 5);
      const whoKids = isParent() ? g.kids : [S.current];
      let left = '';
      if (g.admin && g.requests.length) {
        left += `<section class="card">${cardH('userplus', 'Beitrittsanfragen', `<span class="badge">${g.requests.length}</span>`, 'warm')}<ul class="list">${g.requests.map(q => `<li class="li act">${famAv(q.fam)}<div class="grow"><div class="t">Familie ${esc(q.fam)}</div><div class="xs muted">für ${esc(q.kid)} · per Einladungscode</div></div><button class="btn sm ghost" data-a="decline" data-id="${q.id}">Ablehnen</button><button class="btn sm primary" data-a="accept" data-id="${q.id}">Bestätigen</button></li>`).join('')}</ul></section>`;
      }
      left += `<section class="card">${cardH('cal', 'Termine')}${ev.length ? `<ul class="list">${ev.map(e => `<li class="li"><div class="grow"><div class="t">${esc(e.title)}</div><div class="xs muted">${relDay(e.date)}, ${e.start} Uhr</div></div><div class="stack">${whoKids.map(k => { const v = S.rsvp[e.oid + '|' + k]; return `<div class="row">${isParent() ? av(k, 'sm') : ''}<div class="seg"><button class="yes ${v === 'ja' ? 'on' : ''}" data-a="rsvp" data-id="${e.oid}|${k}|ja">Zusage</button><button class="no ${v === 'nein' ? 'on' : ''}" data-a="rsvp" data-id="${e.oid}|${k}|nein">Absage</button></div></div>`; }).join('')}</div></li>`).join('')}</ul>` : empty('Keine Termine.')}</section>`;
      const right = `<section class="card">${cardH('hand', 'Helferliste', isParent() || g.admin ? `<button class="btn sm" data-a="share" data-id="helpers|${g.id}">${ic('copy')} Text kopieren</button>` : '', 'gold')}<ul class="list">${g.helpers.map(x => `<li class="li"><span class="muted">${ic(x.cake ? 'cake' : x.task.includes('Fahr') ? 'car' : 'hand')}</span><div class="grow"><div class="t">${esc(x.task)}</div><div class="xs muted">${relDay(x.date)}${x.by ? ' · ' + esc(x.by) : ''}</div></div>${x.by ? '<span class="pill green">vergeben</span>' : isParent() ? `<button class="btn sm soft" data-a="helper" data-id="${g.id}|${x.id}">Übernehmen</button>` : '<span class="pill">offen</span>'}</li>`).join('')}</ul>${isParent() ? `<div class="hint gray">${ic('info')}<div class="grow">Wer einen Kuchen übernimmt, bekommt die Zutaten automatisch auf die Einkaufsliste.</div></div>` : ''}</section>`;
      h += `<div class="grid g2"><div class="stack">${left}</div><div class="stack">${right}</div></div>`;
    } else if (S.gTab === 'msgs') {
      h += `<section class="card">${cardH('msg', 'Gruppennachrichten')}<div class="hint green">${ic('shield')}<div class="grow">Nur Nachrichten an die ganze Gruppe. Keine Privatchats, keine Telefonnummern.</div></div><div class="mt">${g.msgs.map(m => `<div class="msg ${m.mine ? 'mine' : ''}">${m.mine ? av(S.current) : famAv(m.from.replace('Familie ', '').replace('Trainer ', ''))}<div class="bubble"><div class="from">${esc(m.from)} <span class="muted xs">· ${esc(m.role)} · ${esc(m.when)}</span></div><div class="small">${esc(m.text)}</div></div></div>`).join('')}</div><form class="addbar" data-f="msg" data-id="${g.id}"><input class="input" name="text" placeholder="Nachricht an die ganze Gruppe" required maxlength="300" aria-label="Nachricht"><button class="btn primary">${ic('send')}</button></form></section>`;
    } else if (S.gTab === 'members') {
      h += `<div class="grid g2"><section class="card">${cardH('shield', 'Was ihr teilt')}<p class="small muted">Gilt nur für diese Gruppe und ist jederzeit widerrufbar.</p><ul class="list">
        <li class="li"><span class="muted">${ic('users')}</span><div class="grow"><div class="t">Familienname und Vornamen der Kinder</div><div class="xs muted">Familie ${esc(S.family)} · ${g.kids.map(k => esc(member(k).name)).join(', ')}</div></div><button class="toggle on" disabled aria-label="Immer sichtbar"></button></li>
        <li class="li"><span class="muted">${ic('phone')}</span><div class="grow"><div class="t">Telefonnummer</div><div class="xs muted">${esc(S.phone)}</div></div><button class="toggle ${g.share.phone ? 'on' : ''}" data-a="share" data-id="${g.id}|phone" aria-pressed="${g.share.phone}" aria-label="Telefonnummer teilen"></button></li>
        <li class="li"><span class="muted">${ic('pin')}</span><div class="grow"><div class="t">Adresse</div><div class="xs muted">${esc(S.addr)}</div></div><button class="toggle ${g.share.addr ? 'on' : ''}" data-a="share" data-id="${g.id}|addr" aria-pressed="${g.share.addr}" aria-label="Adresse teilen"></button></li></ul></section>
        <section class="card">${cardH('users', 'Kontaktliste', `<span class="pill">${g.families.length + 1} Familien</span>`)}<ul class="list">
        <li class="li">${famAv(S.family)}<div class="grow"><div class="t">Familie ${esc(S.family)} <span class="pill green">ihr</span></div><div class="xs muted">${[g.share.phone ? S.phone : '', g.share.addr ? S.addr : ''].filter(Boolean).map(esc).join(' · ') || 'nur Name sichtbar'}</div></div></li>
        ${g.families.map(f => { const con = S.connections.find(c => c.fam === f.fam); return `<li class="li">${famAv(f.fam)}<div class="grow"><div class="t">Familie ${esc(f.fam)}</div><div class="xs muted">${f.kids.map(esc).join(', ')}${f.phone ? ' · ' + esc(f.phone) : ''}${f.addr ? ' · ' + esc(f.addr) : ''}${!f.phone && !f.addr ? ' · keine Kontaktdaten freigegeben' : ''}</div></div>${con ? `<span class="pill ${con.status === 'verbunden' ? 'green' : 'gold'}">${con.status === 'verbunden' ? 'verbunden' : 'angefragt'}</span>` : `<button class="btn sm" data-a="connect" data-id="${esc(f.fam)}|${esc(g.name)}">${ic('link')} Verbinden</button>`}</li>`; }).join('')}</ul></section></div>`;
    } else {
      const pct = Math.round(g.kasse.paid / g.kasse.total * 10) * 10;
      h += `<section class="card">${cardH('euro', 'Kasse', '', 'gold')}<p class="strong">${esc(g.kasse.title)}</p><div class="bar"><span class="w${pct}"></span></div><div class="row between wrap"><span class="small muted">${g.kasse.paid} von ${g.kasse.total} Familien als bezahlt vermerkt</span><button class="btn sm ${g.kasse.ours ? 'primary' : ''}" data-a="kasse" data-id="${g.id}">${g.kasse.ours ? ic('tick') + ' Unser Beitrag bezahlt' : 'Als bezahlt vermerken'}</button></div><div class="hint gray">${ic('info')}<div class="grow">Nur Übersicht. Gezahlt wird außerhalb der App, es gibt keine Verbindung zu Bankkonten.</div></div></section>`;
    }
    return h;
  }

  // ---------- Ansicht: Familien ----------
  function vFamilien() {
    if (!canFamilies()) { S.view = 'heute'; return vHeute(); }
    let h = commHead('kontakte', `<button class="btn primary" data-a="modal" data-id="connectpick">${ic('link')} Familie verbinden</button>`);
    const inc = S.connections.filter(c => c.status === 'eingehend'), con = S.connections.filter(c => c.status === 'verbunden'), out = S.connections.filter(c => c.status === 'angefragt');
    let left = '';
    if (inc.length) left += `<section class="card">${cardH('link', 'Anfragen an euch', `<span class="badge">${inc.length}</span>`, 'warm')}<ul class="list">${inc.map(c => `<li class="li act">${famAv(c.fam)}<div class="grow"><div class="t">Familie ${esc(c.fam)}</div><div class="xs muted">kennt ihr aus ${esc(c.via)}</div></div><button class="btn sm ghost" data-a="condecline" data-id="${c.id}">Ablehnen</button><button class="btn sm primary" data-a="conaccept" data-id="${c.id}">Annehmen</button></li>`).join('')}</ul></section>`;
    left += `<section class="card">${cardH('users', 'Verbundene Familien', `<span class="pill">${con.length}</span>`)}${con.length ? `<ul class="list">${con.map(c => `<li class="li">${famAv(c.fam)}<div class="grow"><div class="t">Familie ${esc(c.fam)}</div><div class="xs muted">${c.note ? esc(c.note) : 'über ' + esc(c.via)}</div></div>${c.note ? `<span class="pill green">${ic('car')} Fahrgemeinschaft</span>` : ''}</li>`).join('')}</ul>` : empty('Noch keine Verbindungen.')}${out.length ? `<h3>Von euch angefragt</h3><ul class="list">${out.map(c => `<li class="li">${famAv(c.fam)}<div class="grow"><div class="t">Familie ${esc(c.fam)}</div><div class="xs muted">wartet auf Zustimmung</div></div><span class="pill gold">angefragt</span></li>`).join('')}</ul>` : ''}</section>`;
    const right = `<section class="card">${cardH('cake', 'Einladungen', '', 'gold')}${S.invites.length ? `<ul class="list">${S.invites.map(i => `<li class="li" ><div class="grow"><div class="t">${esc(i.title)}</div><div class="xs muted">von Familie ${esc(i.from)} · für ${esc(member(i.kid).name)}<br>${fmtLong(i.date)}, ${i.start} bis ${i.end} Uhr · ${esc(i.place)}</div><div class="seg mt"><button class="yes ${i.answer === 'ja' ? 'on' : ''}" data-a="invite" data-id="${i.id}|ja">Zusagen</button><button class="no ${i.answer === 'nein' ? 'on' : ''}" data-a="invite" data-id="${i.id}|nein">Absagen</button></div></div>${av(i.kid, 'lg')}</li>`).join('')}</ul>` : empty('Keine Einladungen.', 'cake')}<div class="hint gray">${ic('info')}<div class="grow">Eine Zusage trägt den Termin automatisch in den Kalender des Kindes ein.</div></div></section>
      <section class="card">${cardH('shield', 'So schützen wir euch')}<ul class="list small"><li class="li">Erwachsene können Kindern anderer Familien nie direkt schreiben.</li><li class="li">Verbinden geht nur mit Familien aus gemeinsamen Gruppen.</li><li class="li">Verbindungen können jederzeit beendet werden.</li></ul></section>`;
    return h + `<div class="grid g2"><div class="stack">${left}</div><div class="stack">${right}</div></div>`;
  }

  // ---------- Ansicht: Verträge ----------
  function vVertraege() {
    if (!canContracts()) { S.view = 'heute'; return vHeute(); }
    const t = day(0);
    const monthly = S.contracts.reduce((n, c) => n + (c.per === 'jahr' ? c.amount / 12 : c.amount), 0);
    const soon = S.contracts.filter(c => { const d = diff(t, minusMonths(c.end, c.notice)); return d >= 0 && d <= 30; }).length;
    let h = hero('Verträge und Abos', 'Laufende Kosten im Blick', 'Manuell erfasst, ohne Verbindung zum Bankkonto.', `<button class="btn primary" data-a="modal" data-id="newcontract">${ic('plus')} Vertrag</button>`);
    h += `<div class="stats"><div class="stat"><b>${eur(monthly)}</b><span>im Monat</span></div><div class="stat"><b>${eur(monthly * 12)}</b><span>im Jahr</span></div><div class="stat"><b>${soon}</b><span>Fristen in 30 Tagen</span></div></div>`;
    h += `<section class="card"><ul class="list">${S.contracts.slice().sort((a, b) => minusMonths(a.end, a.notice).localeCompare(minusMonths(b.end, b.notice))).map(c => {
      const dl = minusMonths(c.end, c.notice), d = diff(t, dl);
      const pill = d < 0 ? '<span class="pill red">Frist verpasst</span>' : d <= 30 ? `<span class="pill warm">noch ${d} Tage</span>` : `<span class="pill">bis ${fmt(dl)}</span>`;
      return `<li class="li"><span class="card-h"><span class="ic">${ic('file')}</span></span><div class="grow"><div class="t">${esc(c.name)}</div><div class="xs muted">${esc(c.cat)} · ${eur(c.amount)} ${c.per === 'jahr' ? 'im Jahr' : 'im Monat'} · Laufzeit bis ${fmt(c.end)}${d < 0 ? ' · verlängert sich' : ''}</div></div>${pill}${d >= 0 ? `<button class="btn sm ${c.remind ? 'soft' : ''}" data-a="remind" data-id="${c.id}">${c.remind ? ic('tick') + ' Erinnert' : ic('bell') + ' Erinnern'}</button>` : ''}</li>`;
    }).join('')}</ul></section>`;
    return h;
  }

  // ---------- Ansicht: Einstellungen ----------
  function vEinstellungen() {
    if (!isParent()) {
      return hero('Über die App', 'Dein Zugang', '') + `<section class="card"><p>Deine Eltern haben dir diesen Zugang eingerichtet. Du siehst deine Termine und Aufgaben und kannst die Einkaufsliste ergänzen.</p><div class="hint green">${ic('shield')}<div class="grow">Dein Konto braucht keine E-Mail-Adresse und keine Telefonnummer. Dein Standort wird nicht erfasst.</div></div></section>`;
    }
    let h = hero('Einstellungen', 'Familie und Datenschutz', 'Rollen, Zugänge und eure Daten.');
    h += `<div class="grid g2"><section class="card">${cardH('users', 'Familie ' + esc(S.family))}<ul class="list">${S.members.map(m => {
      if (m.role === 'eltern') return `<li class="li">${av(m.id, 'lg')}<div class="grow"><div class="t">${esc(m.name)}</div><div class="xs muted">Elternteil, volle Rechte</div></div></li>`;
      const code = S.pair[m.id];
      return `<li class="li">${av(m.id, 'lg')}<div class="grow"><div class="t">${esc(m.name)} <span class="xs muted">${m.alter} Jahre</span></div><select class="input mt" data-c="stufe" data-id="${m.id}" aria-label="Zugangsstufe für ${esc(m.name)}"><option value="1" ${m.stufe === 1 ? 'selected' : ''}>Stufe 1: Profil ohne Zugang</option><option value="2" ${m.stufe === 2 ? 'selected' : ''}>Stufe 2: eigene Termine, Aufgaben, Liste</option><option value="3" ${m.stufe === 3 ? 'selected' : ''}>Stufe 3: zusätzlich Gruppen</option></select>${code ? `<div class="code">${code}</div><div class="xs muted">Kopplungscode, 10 Minuten gültig. Im Produkt als QR-Code zum Scannen.</div>` : ''}</div>${m.stufe > 1 ? `<button class="btn sm" data-a="pair" data-id="${m.id}">${ic('key')} Gerät koppeln</button>` : ''}</li>`;
    }).join('')}</ul></section>
    <section class="card">${cardH('layers', 'Module', '<span class="pill">Beispielpreise</span>', 'gold')}<p class="small muted">Die Basis enthält Kalender, Aufgaben, Rollen und Ferien. Module schaltet ihr nach Bedarf dazu.</p><ul class="list">
      <li class="li"><span class="muted">${ic('home')}</span><div class="grow"><div class="t">Basis</div><div class="xs muted">Kalender, Aufgaben, Rollen, Ferien und Feiertage</div></div><span class="pill">3 € / Monat</span><button class="toggle on" disabled aria-label="Basis immer aktiv"></button></li>
      ${[['kueche', 'food', 'Küche', 'Wochenplan, Rezepte, Einkaufsliste', '+1 €'], ['gruppen', 'users', 'Gemeinschaft', 'Gruppen, Kontakte, Einladungen', 'für Mitglieder kostenlos'], ['vertraege', 'file', 'Verträge und Abos', 'Kosten, Fristen, Erinnerungen', '+1 €']].map(([k, i, l, d, pr]) => `<li class="li"><span class="muted">${ic(i)}</span><div class="grow"><div class="t">${l}</div><div class="xs muted">${d}</div></div><span class="pill">${pr}</span><button class="toggle ${mod(k) ? 'on' : ''}" data-a="module" data-id="${k}" aria-pressed="${mod(k)}" aria-label="${l} ein- oder ausschalten"></button></li>`).join('')}</ul></section>
    <div class="stack"><section class="card">${cardH('phoneapp', 'Als App installieren', '', 'warm')}${window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ? `<div class="hint green">${ic('tick')}<div class="grow">Läuft bereits als installierte App.</div></div>` : installPrompt ? `<p class="small muted">Eigenes Symbol auf dem Startbildschirm, Vollbild, funktioniert auch offline.</p><button class="btn primary" data-a="install">${ic('plus')} Jetzt installieren</button>` : `<p class="small muted">Eigenes Symbol auf dem Startbildschirm, Vollbild, funktioniert auch offline.</p><ol class="install-steps"><li><b>iPhone (Safari):</b> Teilen-Symbol, dann „Zum Home-Bildschirm“.</li><li><b>Android (Chrome):</b> Menü mit drei Punkten, dann „App installieren“.</li><li><b>PC (Chrome, Edge):</b> Installieren-Symbol rechts in der Adressleiste.</li></ol>`}</section>
    <section class="card">${cardH('cal', 'Kalenderabo')}<p class="small muted">Im Produkt bekommt jede Person einen eigenen Abo-Link für Apple, Google, Outlook und Home Assistant. Der Link ist jederzeit widerrufbar.</p><button class="btn sm" disabled>Abo-Link erzeugen (im Prototyp nicht aktiv)</button></section>
    <section class="card">${cardH('shield', 'Datenschutz', '', 'gold')}<ul class="list small">${['Hosting in Deutschland, keine Übermittlung in Drittländer', 'Keine Werbung, keine Analysewerkzeuge Dritter', 'Kinder brauchen weder E-Mail-Adresse noch Telefonnummer', 'Kein Standort-Tracking', 'Keine Verbindung zu Bankkonten', 'Export und Löschung aller Familiendaten jederzeit'].map(x => `<li class="li"><span class="c3">${ic('tick')}</span>${x}</li>`).join('')}</ul><div class="hint gray">${ic('info')}<div class="grow">Dieser Prototyp speichert die Beispieldaten nur in deinem Browser. Bitte keine echten Daten eingeben.</div></div><div class="row wrap mt"><button class="btn" data-a="intro">${ic('wave')} Einführung zeigen</button><button class="btn danger" data-a="reset">${ic('trash')} Beispieldaten zurücksetzen</button></div></section></div></div>`;
    return h;
  }

  function vMehr() {
    const req = S.groups.reduce((n, g) => n + (g.admin ? g.requests.length : 0), 0) + S.connections.filter(c => c.status === 'eingehend').length + S.invites.filter(i => !i.answer).length;
    const tiles = [];
    if (mod('kueche')) tiles.push(['kueche', 'food', 'Küche', 'Wochenplan, Rezepte, Einkauf', 'warm', 0]);
    if (canGroups()) tiles.push(['gruppen', 'users', 'Gemeinschaft', 'Gruppen und Kontakte', '', isParent() ? req : 0]);
    if (canContracts()) tiles.push(['vertraege', 'file', 'Verträge', 'Kosten und Fristen', 'gold', 0]);
    tiles.push(['einstellungen', 'shield', isParent() ? 'Einstellungen' : 'Über die App', isParent() ? 'Familie, Module, Datenschutz' : 'Dein Zugang', '', 0]);
    return hero('', 'Mehr', '') + `<div class="tiles">${tiles.map(([v, i, l, d, tone, b]) => `<button class="tile" data-a="go" data-id="${v}"><span class="card-h"><span class="ic ${tone}">${ic(i)}</span></span><b>${l}${b ? ` <span class="badge">${b}</span>` : ''}</b><span class="xs muted">${d}</span></button>`).join('')}</div>`;
  }

  // ---------- Dialoge ----------
  const sheet = (title, body, sub = '') => `<div class="backdrop" data-a="close-bg"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-h"><div><h2>${title}</h2>${sub ? `<p class="small muted">${sub}</p>` : ''}</div><button class="btn ghost icon-btn" data-a="close" aria-label="Schließen">${ic('x')}</button></div>${body}</div></div>`;
  const memberOpts = (sel) => S.members.map(m => `<option value="${m.id}" ${m.id === sel ? 'selected' : ''}>${esc(m.name)}</option>`).join('');

  const MODALS = {
    quick() {
      const t = [];
      if (isParent()) t.push(['newevent', 'cal', 'Termin', '']);
      if (isParent()) t.push(['newtask', 'tasks', 'Aufgabe', '']);
      if (mod('kueche')) t.push(['quickshop', 'cart', 'Einkauf', 'warm'], ['quickwish', 'sparkle', 'Essenswunsch', 'gold']);
      if (isParent()) t.push(['sharepick', 'copy', 'Text kopieren', '']);
      return sheet('Neu anlegen', `<div class="qtiles">${t.map(([m, i, l, tone]) => `<button class="tile" data-a="modal" data-id="${m}"><span class="card-h"><span class="ic ${tone}">${ic(i)}</span></span><b>${l}</b></button>`).join('')}</div>`);
    },
    sharepick() {
      const o = shareOptions();
      return sheet('Text für den Messenger', `<p class="small muted">Wählt aus, was ihr weitersagen wollt. Die App erstellt den Text, ihr kopiert ihn und fügt ihn selbst in euren Messenger ein.</p>${o.length ? shareList(o) : empty('Gerade gibt es nichts weiterzusagen.', 'copy')}`);
    },
    quickshop() {
      const open = S.shopping.filter(x => !x.done).slice(-5).reverse();
      return sheet('Auf die Einkaufsliste', `<form class="addbar" data-f="shop"><input class="input" name="text" placeholder="Was fehlt?" required maxlength="60" aria-label="Artikel" autofocus><button class="btn primary">${ic('plus')}</button></form><div class="xs muted mt">Zuletzt auf der Liste: ${open.map(x => esc(x.text)).join(', ') || 'noch nichts'}</div>`);
    },
    quickwish() { return sheet('Essenswunsch', `<p class="small muted">Landet im Wochenplan bei den Wünschen.</p>${wishForm()}`); },
    intro() {
      const st = S.modal.step || 1, dots = `<div class="steps">${[1, 2, 3].map(i => `<span class="${i <= st ? 'on' : ''}"></span>`).join('')}</div>`;
      const pages = {
        1: ['home', 'Willkommen in der Haushaltszentrale', 'Termine, Aufgaben, Essen und eure Gruppen an einem Ort. Ihr seht hier die Beispielfamilie Neumann: Sandra, Jens, Ben (14), Lena (11) und Mia (6).'],
        2: ['users', 'Jeder in seiner Rolle', 'Oben wechselst du die Ansicht zwischen Eltern und Kindern. Kinder sehen nur ihre eigenen Termine und Aufgaben. Mia ist noch zu klein und hat keinen eigenen Zugang.'],
        3: ['shield', 'Eure Daten bleiben eure', 'Hosting in Deutschland, keine Werbung, kein Standort-Tracking, keine Telefonnummern für Kinder. Dieser Prototyp speichert nur Beispieldaten in deinem Browser.']
      }[st];
      return sheet('', `<div class="intro">${dots}${emptyArt(pages[0])}<h2>${pages[1]}</h2><p class="muted">${pages[2]}</p>${st === 2 ? `<div class="row intro-avs">${S.members.map(m => av(m.id, 'lg')).join('')}</div>` : ''}<div class="row between mt"><button class="btn ghost" data-a="introdone">Überspringen</button><button class="btn primary" data-a="${st < 3 ? 'intronext' : 'introdone'}">${st < 3 ? 'Weiter' : 'Los geht’s'}</button></div></div>`);
    },
    share() {
      return sheet(esc(S.modal.title), `<label class="lbl" for="share-text">Text, den ihr kopiert</label><textarea id="share-text" class="share-edit" rows="7" spellcheck="true">${esc(S.modal.text)}</textarea><div class="hint green">${ic('shield')}<div class="grow">Die App verschickt nichts. Namen von Kindern und Familien sowie Kontaktdaten werden nicht übernommen. Prüft den Text kurz und passt ihn bei Bedarf an.</div></div><button class="btn primary block mt ${S.modal.copied ? 'copied' : ''}" data-a="copytext">${S.modal.copied ? ic('tick') + ' Kopiert' : ic('copy') + ' Text kopieren'}</button>${S.modal.copied ? `<p class="small mt center">Jetzt in WhatsApp, Signal oder Threema einfügen.</p>` : ''}`);
    },
    openevent() {
      const e = findOcc(S.modal.id); if (!e) return '';
      const g = e.group ? group(e.group) : null;
      const ride = needRide(e) ? (isParent() ? `<li class="li"><span class="muted">${ic('car')}</span><div class="grow fgrid"><div class="field"><label for="r-b">Hinbringen</label><select id="r-b" data-c="ride" data-id="${e.id}|bring">${rideOptions(e.bring)}</select></div><div class="field"><label for="r-p">Abholen</label><select id="r-p" data-c="ride" data-id="${e.id}|pick">${rideOptions(e.pick)}</select></div>${e.repeat ? '<div class="xs muted span2">Gilt für die ganze Serie.</div>' : ''}</div></li>` : `<li class="li"><span class="muted">${ic('car')}</span><div class="grow">Hin: ${esc(rideName(e.bring) || 'noch offen')}<br>Zurück: ${esc(rideName(e.pick) || 'noch offen')}</div></li>`) : '';
      return sheet(esc(e.title), `<ul class="list"><li class="li"><span class="muted">${ic('clock')}</span><div class="grow">${fmtLong(e.date)}<div class="small muted">${e.start ? e.start + (e.end ? ' bis ' + e.end : '') + ' Uhr' : 'ganztägig'}${e.repeat ? ' · jede Woche' : ''}</div></div></li>${ride}${e.place ? `<li class="li"><span class="muted">${ic('pin')}</span><div class="grow">${esc(e.place)}</div></li>` : ''}${e.note ? `<li class="li"><span class="muted">${ic('info')}</span><div class="grow">${esc(e.note)}</div></li>` : ''}<li class="li"><span class="muted">${ic('users')}</span><div class="grow row wrap">${e.who.map(w => `<span class="row">${av(w, 'sm')}<span class="small">${esc(member(w).name)}</span></span>`).join('')}</div></li>${g ? `<li class="li"><span class="muted">${ic(g.icon)}</span><div class="grow">${esc(g.name)}</div></li>` : ''}</ul><div class="row between wrap mt">${isParent() ? (e.repeat ? `<div class="row wrap"><button class="btn danger sm" data-a="delocc" data-id="${e.oid}">${ic('trash')} Nur diesen</button><button class="btn danger sm" data-a="delevent" data-id="${e.id}">Ganze Serie</button></div>` : `<button class="btn danger" data-a="delevent" data-id="${e.id}">${ic('trash')} Löschen</button>`) : '<span></span>'}<div class="row"><button class="btn" data-a="share" data-id="event|${e.oid}">${ic('copy')} Als Text</button><button class="btn primary" data-a="close">Fertig</button></div></div>`);
    },
    newevent() {
      return sheet('Neuer Termin', `<form data-f="event"><div class="field"><label for="f-t">Was?</label><input id="f-t" name="title" required maxlength="80" placeholder="z. B. Elterngespräch"></div><div class="fgrid"><div class="field"><label for="f-d">Datum</label><input id="f-d" name="date" type="date" value="${day(0)}" required></div><div class="field"><label for="f-p">Ort</label><input id="f-p" name="place" maxlength="60"></div><div class="field"><label for="f-s">Beginn</label><input id="f-s" name="start" type="time" value="17:00" required></div><div class="field"><label for="f-e">Ende</label><input id="f-e" name="end" type="time" value="18:00"></div></div><div class="field"><label for="f-w">Für wen?</label><select id="f-w" name="who">${memberOpts()}<option value="all">Ganze Familie</option></select></div><label class="row small"><input type="checkbox" name="repeat"> Jede Woche wiederholen</label><button class="btn primary block mt">Eintragen</button></form>`);
    },
    newtask() {
      return sheet('Aufgabe verteilen', `<form data-f="task"><div class="field"><label for="f-t">Was ist zu tun?</label><input id="f-t" name="title" required maxlength="80"></div><div class="fgrid"><div class="field"><label for="f-w">Wer?</label><select id="f-w" name="who">${memberOpts('k1')}</select></div><div class="field"><label for="f-d">Bis wann?</label><input id="f-d" name="due" type="date" value="${day(0)}" required></div></div><button class="btn primary block">Hinzufügen</button></form>`);
    },
    newcontract() {
      return sheet('Vertrag erfassen', `<form data-f="contract"><div class="field"><label for="f-n">Name</label><input id="f-n" name="name" required maxlength="60" placeholder="z. B. Fitnessstudio"></div><div class="fgrid"><div class="field"><label for="f-c">Kategorie</label><input id="f-c" name="cat" maxlength="30" placeholder="Sonstiges"></div><div class="field"><label for="f-a">Betrag in €</label><input id="f-a" name="amount" type="number" step="0.01" min="0" required></div><div class="field"><label for="f-p">Zahlweise</label><select id="f-p" name="per"><option value="monat">pro Monat</option><option value="jahr">pro Jahr</option></select></div><div class="field"><label for="f-e">Laufzeit bis</label><input id="f-e" name="end" type="date" value="${day(90)}" required></div></div><div class="field"><label for="f-k">Kündigungsfrist</label><select id="f-k" name="notice"><option value="0">monatlich kündbar</option><option value="1">1 Monat</option><option value="2">2 Monate</option><option value="3" selected>3 Monate</option></select></div><button class="btn primary block">Speichern</button></form>`);
    },
    join() {
      const st = S.modal.step || 1, steps = `<div class="steps">${[1, 2, 3].map(i => `<span class="${i <= st ? 'on' : ''}"></span>`).join('')}</div>`;
      if (st === 1) return sheet('Gruppe beitreten', steps + `<form data-f="joincode"><div class="field"><label for="f-code">Einladungscode</label><input id="f-code" class="code-in" name="code" inputmode="numeric" autocomplete="off" maxlength="7" placeholder="000 000" required></div>${S.modal.err ? `<div class="hint warm">${ic('info')}<div class="grow">${S.modal.err}</div></div>` : ''}<div class="hint gray">${ic('info')}<div class="grow">Den Code bekommt ihr vom Gruppenverwalter, etwa auf dem Elternabend oder per Elternbrief. Demo-Code: <b>482 913</b></div></div><button class="btn primary block mt">Weiter</button></form>`, 'Gruppen sind nicht öffentlich auffindbar.');
      const j = S.joinable[S.modal.code];
      if (st === 2) return sheet('Gruppe beitreten', steps + `<div class="row"><span class="gicon gi${j.gi}">${ic(j.icon)}</span><div><div class="strong">${esc(j.name)}</div><div class="xs muted">${esc(j.typ)} · verwaltet von ${esc(j.lead)}</div></div></div><form data-f="joinconfirm" class="mt"><div class="field"><span class="lbl">Welches Kind gehört zur Gruppe?</span>${S.members.filter(m => m.role === 'kind').map(m => `<label class="row li"><input type="checkbox" name="kid" value="${m.id}" ${m.id === 'k3' ? 'checked' : ''}> ${av(m.id, 'sm')} ${esc(m.name)}</label>`).join('')}</div><div class="hint green">${ic('shield')}<div class="grow">Die Gruppe sieht nur euren Familiennamen und den Vornamen des Kindes. Telefonnummer und Adresse könnt ihr später freiwillig freigeben.</div></div><label class="row small mt"><input type="checkbox" name="ok" required> Ich habe die Datenschutzhinweise der Gruppe gelesen.</label><button class="btn primary block mt">Beitritt anfragen</button></form>`);
      return sheet('Anfrage gesendet', steps + `<div class="hint gold">${ic('clock')}<div class="grow">Der Gruppenverwalter muss eure Anfrage bestätigen. Bis dahin seht ihr noch keine Inhalte der Gruppe.</div></div><button class="btn primary block mt" data-a="close">Verstanden</button>`);
    },
    creategroup() {
      if (S.modal.step === 2) {
        const g = group(S.modal.gid);
        return sheet('Gruppe angelegt', `<p class="small">Teilt diesen Code mit den Familien. Jede Anfrage bestätigt ihr selbst.</p><div class="code">${g.code}</div><div class="hint gray">${ic('info')}<div class="grow">Im Produkt zusätzlich als QR-Code und Link. Codes lassen sich jederzeit widerrufen und neu erzeugen.</div></div><div class="row mt"><button class="btn" data-a="share" data-id="invite|${g.id}">${ic('copy')} Einladung kopieren</button><button class="btn primary grow" data-a="opengroup" data-id="${g.id}">Zur Gruppe</button></div>`);
      }
      return sheet('Gruppe gründen', `<form data-f="creategroup"><div class="field"><label for="f-n">Name der Gruppe</label><input id="f-n" name="name" required maxlength="60" placeholder="z. B. Kita Sonnenblume, Igelgruppe"></div><div class="fgrid"><div class="field"><label for="f-t">Art</label><select id="f-t" name="typ"><option>Kita-Gruppe</option><option>Klasse</option><option>Mannschaft</option><option>Förderverein</option><option>Sonstige</option></select></div><div class="field"><label for="f-k">Kind</label><select id="f-k" name="kid">${S.members.filter(m => m.role === 'kind').map(m => `<option value="${m.id}" ${m.id === 'k3' ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div></div><div class="hint gray">${ic('shield')}<div class="grow">Als Gruppenverwalter seid ihr für die Daten der Gruppe verantwortlich. Die Haushaltszentrale verarbeitet sie in eurem Auftrag.</div></div><label class="row small mt"><input type="checkbox" name="av" required> Ich übernehme die Verwaltung und schließe den Vertrag zur Auftragsverarbeitung ab.</label><button class="btn primary block mt">Gruppe anlegen</button></form>`);
    },
    invite() {
      const g = group(S.gid);
      return sheet('Familien einladen', `<p class="small">Teilt diesen Code oder den Link mit den Familien der Gruppe <b>${esc(g.name)}</b>.</p><div class="code">${g.code || '000 000'}</div><div class="row"><button class="btn" data-a="newcode" data-id="${g.id}">Neuer Code</button><button class="btn primary grow" data-a="share" data-id="invite|${g.id}">${ic('copy')} Einladung kopieren</button></div><div class="hint gray">${ic('info')}<div class="grow">Ein neuer Code macht den alten sofort ungültig. Beitritte bestätigt ihr einzeln.</div></div>`);
    },
    connectpick() {
      const known = [];
      S.groups.filter(g => !g.pending).forEach(g => g.families.forEach(f => { if (!S.connections.some(c => c.fam === f.fam) && !known.some(k => k.fam === f.fam)) known.push({ fam: f.fam, via: g.name, kids: f.kids }); }));
      return sheet('Familie verbinden', `<p class="small muted">Verbinden könnt ihr euch nur mit Familien aus gemeinsamen Gruppen. Die andere Familie muss zustimmen.</p><ul class="list">${known.map(k => `<li class="li">${famAv(k.fam)}<div class="grow"><div class="t">Familie ${esc(k.fam)}</div><div class="xs muted">${k.kids.map(esc).join(', ')} · ${esc(k.via)}</div></div><button class="btn sm soft" data-a="connect" data-id="${esc(k.fam)}|${esc(k.via)}">Anfragen</button></li>`).join('') || empty('Ihr seid schon mit allen verbunden.')}</ul>`);
    }
  };

  // ---------- Rendern ----------
  const VIEWS = { heute: vHeute, kalender: vKalender, aufgaben: vAufgaben, kueche: vKueche, gruppen: vGruppen, gruppe: vGruppe, familien: vFamilien, vertraege: vVertraege, einstellungen: vEinstellungen, mehr: vMehr };

  function navSections() {
    const req = S.groups.reduce((n, g) => n + (g.admin ? g.requests.length : 0), 0);
    const fam = S.connections.filter(c => c.status === 'eingehend').length + S.invites.filter(i => !i.answer).length;
    const home = [['heute', 'home', 'Heute'], ['kalender', 'cal', 'Kalender'], ['aufgaben', 'tasks', 'Aufgaben']];
    if (mod('kueche')) home.push(['kueche', 'food', 'Küche']);
    const sec = [['Zuhause', home]];
    if (canGroups()) sec.push(['Gemeinschaft', [['gruppen', 'users', 'Gruppen', isParent() ? req + fam : 0]]]);
    const adm = [];
    if (canContracts()) adm.push(['vertraege', 'file', 'Verträge']);
    adm.push(['einstellungen', 'shield', isParent() ? 'Einstellungen' : 'Über die App']);
    sec.push(['Verwaltung', adm]);
    return sec;
  }

  function whoBar() {
    return S.members.filter(m => m.role === 'eltern' || m.stufe >= 2).map(m => `<button class="who-btn ${m.id === S.current ? 'on' : ''}" data-a="who" data-id="${m.id}" title="${esc(m.name)}${m.role === 'eltern' ? ' (Elternteil)' : ' (Kind, Stufe ' + m.stufe + ')'}" aria-label="Ansicht als ${esc(m.name)}" aria-pressed="${m.id === S.current}">${av(m.id)}</button>`).join('');
  }

  function render() {
    const html = (VIEWS[S.view] || vHeute)();
    const active = ['gruppe', 'familien'].includes(S.view) ? 'gruppen' : S.view;
    const plus = isParent() || mod('kueche');
    document.getElementById('sidenew').innerHTML = plus ? `<button class="btn primary block newbtn" data-a="modal" data-id="quick">${ic('plus')} Neu</button>` : '';
    document.getElementById('sidenav').innerHTML = navSections().map(([label, items]) => `<div class="nav-sec">${label}</div>` + items.map(([v, i, l, b]) => `<button class="${active === v ? 'on' : ''}" data-a="go" data-id="${v}" ${active === v ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span>${b ? `<span class="badge">${b}</span>` : ''}</button>`).join('')).join('');
    const bActive = ['kueche', 'gruppen', 'vertraege', 'einstellungen'].includes(active) ? 'mehr' : active;
    const nb = ([v, i, l]) => `<button class="${bActive === v ? 'on' : ''}" data-a="go" data-id="${v}" ${bActive === v ? 'aria-current="page"' : ''}>${ic(i)}${l}</button>`;
    const badgeMore = isParent() ? S.groups.reduce((n, g) => n + (g.admin ? g.requests.length : 0), 0) + S.connections.filter(c => c.status === 'eingehend').length : 0;
    document.getElementById('bnav').innerHTML = nb(['heute', 'home', 'Heute']) + nb(['kalender', 'cal', 'Kalender']) + (plus ? `<button class="fab" data-a="modal" data-id="quick" aria-label="Neu anlegen">${ic('plus')}</button>` : '') + nb(['aufgaben', 'tasks', 'Aufgaben']) + nb(['mehr', 'more', 'Mehr']).replace('Mehr</button>', `Mehr${badgeMore ? `<span class="dot"></span>` : ''}</button>`);
    document.getElementById('sidewho').innerHTML = whoBar();
    document.getElementById('topwho').innerHTML = whoBar();
    const main = document.getElementById('main'), key = [S.current, S.view, S.gid, S.kTab, S.gTab, S.wk].join('|');
    main.innerHTML = html;
    main.querySelectorAll('[data-top]').forEach(el => { el.style.top = el.dataset.top + 'px'; if (el.dataset.h) el.style.height = el.dataset.h + 'px'; if (el.dataset.w) { el.style.left = el.dataset.l + '%'; el.style.width = el.dataset.w + '%'; } });
    if (key !== lastKey) { main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter'); lastKey = key; }
    document.getElementById('modal').innerHTML = S.modal && MODALS[S.modal.t] ? MODALS[S.modal.t]() : '';
    S.popId = null;
    if (S.celebrate) { S.celebrate = false; confetti(); }
    save();
  }

  let lastKey = '';
  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 46; i++) {
      const p = document.createElement('i');
      p.className = 'cf' + (i % 5);
      p.style.left = (5 + Math.random() * 90) + '%';
      p.style.animationDelay = (Math.random() * 0.25) + 's';
      p.style.setProperty('--dx', (Math.random() * 160 - 80).toFixed(0) + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 2200);
  }

  let toastT;
  function toast(msg) {
    const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function addShop(items, src) {
    let n = 0;
    items.forEach(z => { if (!S.shopping.some(s => !s.done && s.text.toLowerCase() === z.toLowerCase())) { S.shopping.push({ id: uid(), text: z, done: false, src }); n++; } });
    return n;
  }
  const newCode = () => String(Math.floor(100000 + Math.random() * 900000)).replace(/(\d{3})(\d{3})/, '$1 $2');

  // ---------- Aktionen ----------
  const A = {
    go(id) { S.view = id; S.modal = null; window.scrollTo(0, 0); },
    who(id) { S.current = id; if (!VIEWS[S.view] || S.view === 'gruppe') S.view = 'heute'; toast('Ansicht: ' + me().name); },
    modal(id) { S.modal = { t: id }; },
    close() { S.modal = null; },
    'close-bg'(id, el, ev) { if (ev.target === el) S.modal = null; else return false; },
    openevent(id) { S.modal = { t: 'openevent', id }; },
    opengroup(id) { S.gid = id; S.gTab = 'info'; S.view = 'gruppe'; S.modal = null; window.scrollTo(0, 0); },
    gtab(id) { S.gTab = id; },
    ktab(id) { S.kTab = id; },
    wk(id) { S.wk = id === '0' ? 0 : Math.max(-4, Math.min(8, S.wk + Number(id))); },
    shoplist() { S.view = 'kueche'; S.kTab = 'einkauf'; },
    task(id) {
      const x = S.tasks.find(t => t.id === id); if (!x) return;
      x.done = !x.done; S.popId = x.id;
      if (x.done) {
        const mine = S.tasks.filter(t => t.who === x.who && t.due <= day(0));
        if (!isParent() && mine.every(t => t.done)) { S.celebrate = true; toast('Alles geschafft, ' + me().name + '!'); } else toast('Erledigt: ' + x.title);
      }
    },
    shop(id) { const s = S.shopping.find(x => x.id === id); if (s) { s.done = !s.done; S.popId = s.id; } },
    clearshop() { S.shopping = S.shopping.filter(s => !s.done); },
    delevent(id) { S.events = S.events.filter(e => e.id !== id); S.modal = null; toast('Termin gelöscht'); },
    delocc(oid) { const [id, d] = oid.split('@'), e = S.events.find(x => x.id === id); if (e.date === d) { const nx = parse(d); nx.setDate(nx.getDate() + 7); e.date = iso(nx); } else { e.skip = (e.skip || []).concat(d); } S.modal = null; toast('Termin am ' + fmt(d) + ' fällt aus'); },
    delwish(id) { S.wishes = S.wishes.filter(w => w.id !== id); },
    quickmeal(d) {
      const fast = S.recipes.filter(r => r.fast), used = Object.values(S.plan);
      const pick = fast.find(r => !used.includes(r.id)) || fast[0];
      S.plan[d] = pick.id; toast(relDay(d) + ': ' + pick.name);
    },
    planshop() { let n = 0; for (let i = 0; i < 7; i++) { const r = recipe(S.plan[day(i)]); if (r) n += addShop(r.z, 'Wochenplan: ' + r.name); } toast(n + ' Zutaten auf die Einkaufsliste gesetzt'); },
    recipeshop(id) { const r = recipe(id), n = addShop(r.z, 'Rezept: ' + r.name); toast(n ? n + ' Zutaten hinzugefügt' : 'Steht schon alles auf der Liste'); },
    rsvp(id) { const [e, k, v] = id.split('|'), key = e + '|' + k; S.rsvp[key] = S.rsvp[key] === v ? undefined : v; if (S.rsvp[key]) toast((v === 'ja' ? 'Zusage' : 'Absage') + ' für ' + member(k).name + ' gesendet'); },
    helper(id) {
      const [gid, hid] = id.split('|'), g = group(gid), x = g.helpers.find(y => y.id === hid);
      x.by = 'Familie ' + S.family + ' (' + me().name + ')';
      S.events.push({ id: uid(), date: x.date, start: '', end: '', title: x.task, who: [S.current], group: g.id });
      let msg = 'Übernommen und im Kalender eingetragen';
      if (x.cake) { const cake = S.recipes.find(r => r.cake), n = addShop(cake.z, 'Helferliste: ' + x.task); msg += ', ' + n + ' Zutaten auf der Liste'; }
      toast(msg);
    },
    kasse(id) { const g = group(id); g.kasse.ours = !g.kasse.ours; g.kasse.paid += g.kasse.ours ? 1 : -1; },
    share(id) { const [gid, k] = id.split('|'), g = group(gid); g.share[k] = !g.share[k]; toast(g.share[k] ? 'Für diese Gruppe freigegeben' : 'Freigabe zurückgezogen'); },
    accept(id) { const g = group(S.gid), q = g.requests.find(r => r.id === id); g.requests = g.requests.filter(r => r.id !== id); g.families.push({ fam: q.fam, kids: [q.kid], phone: '', addr: '' }); toast('Familie ' + q.fam + ' ist jetzt in der Gruppe'); },
    decline(id) { const g = group(S.gid); g.requests = g.requests.filter(r => r.id !== id); toast('Anfrage abgelehnt'); },
    approveme(id) { const g = group(id); g.pending = false; toast('Beitritt bestätigt'); },
    newcode(id) { group(id).code = newCode(); toast('Neuer Code erzeugt, der alte ist ungültig'); },
    copyinvite(id) {
      const g = group(id), txt = `Hallo zusammen, wir organisieren die Gruppe "${g.name}" ab sofort in der Haushaltszentrale. Beitreten mit dem Code ${g.code}. Eure Telefonnummern bleiben privat, solange ihr sie nicht selbst freigebt.`;
      try { navigator.clipboard.writeText(txt).then(() => toast('Einladungstext kopiert'), () => toast('Kopieren nicht möglich')); } catch (e) { toast('Kopieren nicht möglich'); }
      return false;
    },
    connect(id) { const [fam, via] = id.split('|'); if (!S.connections.some(c => c.fam === fam)) S.connections.push({ id: uid(), fam, via, status: 'angefragt', note: '' }); toast('Anfrage an Familie ' + fam + ' gesendet'); },
    conaccept(id) { const c = S.connections.find(x => x.id === id); c.status = 'verbunden'; toast('Mit Familie ' + c.fam + ' verbunden'); },
    condecline(id) { S.connections = S.connections.filter(x => x.id !== id); toast('Anfrage abgelehnt'); },
    invite(id) {
      const [iid, v] = id.split('|'), i = S.invites.find(x => x.id === iid), evId = 'inv-' + iid;
      i.answer = i.answer === v ? null : v;
      S.events = S.events.filter(e => e.id !== evId);
      if (i.answer === 'ja') { S.events.push({ id: evId, date: i.date, start: i.start, end: i.end, title: i.title, who: [i.kid], place: i.place }); toast('Zugesagt und im Kalender eingetragen'); }
      else if (i.answer === 'nein') toast('Abgesagt');
    },
    remind(id) {
      const c = S.contracts.find(x => x.id === id); if (c.remind) return;
      c.remind = true;
      const dl = minusMonths(c.end, c.notice), rd = diff(day(0), dl) > 7 ? iso(new Date(parse(dl).getTime() - 7 * 86400000)) : day(0);
      S.events.push({ id: uid(), date: rd, start: '09:00', end: '', title: 'Kündigen? ' + c.name, note: 'Frist endet am ' + fmt(dl), who: parents().map(m => m.id) });
      toast('Erinnerung am ' + fmt(rd) + ' im Kalender');
    },
    pair(id) { S.pair[id] = newCode(); },
    module(k) { S.modules[k] = !mod(k); toast((S.modules[k] ? 'Eingeschaltet: ' : 'Ausgeschaltet: ') + { kueche: 'Küche', gruppen: 'Gemeinschaft', vertraege: 'Verträge' }[k]); },
    intro() { S.modal = { t: 'intro', step: 1 }; },
    intronext() { S.modal.step = (S.modal.step || 1) + 1; },
    introdone() { S.introDone = true; S.modal = null; },
    install() { if (installPrompt) { installPrompt.prompt(); installPrompt.userChoice.finally(() => { installPrompt = null; render(); }); } return false; },
    share(id) {
      const [kind, ref] = id.split('|'), link = location.origin && location.origin !== 'null' ? location.origin + location.pathname : 'https://haushaltszentrale.netlify.app';
      let title = 'Teilen', text = '';
      if (kind === 'helpers') {
        const g = group(ref), open = g.helpers.filter(x => !x.by);
        if (!open.length) { toast('Alle Aufgaben sind vergeben'); return; }
        title = 'Helfer gesucht';
        text = `${g.name}: Wir suchen noch Unterstützung.\n${open.map(x => `• ${x.task} (${fmt(x.date)})`).join('\n')}\n\nEintragen in der Haushaltszentrale: ${link}`;
      } else if (kind === 'event') {
        const e = findOcc(ref); title = 'Termin als Text';
        text = `${e.title}\n${fmtLong(e.date)}${e.start ? ', ' + e.start + (e.end ? ' bis ' + e.end : '') + ' Uhr' : ''}${e.place ? '\nOrt: ' + e.place : ''}`;
      } else if (kind === 'day') {
        const list = eventsOn(ref, true); title = 'Tagesplan als Text';
        text = `Unser Tag, ${fmtLong(ref)}:\n${list.map(e => `• ${e.start ? e.start + ' ' : ''}${e.title}${e.place ? ' (' + e.place + ')' : ''}`).join('\n')}`;
      } else if (kind === 'shop') {
        const open = S.shopping.filter(x => !x.done); if (!open.length) { toast('Die Liste ist leer'); return; }
        title = 'Einkaufsliste als Text'; text = `Einkaufsliste:\n${open.map(x => '• ' + x.text).join('\n')}`;
      } else if (kind === 'invite') {
        const g = group(ref); title = 'Einladung als Text';
        text = `Hallo zusammen, wir organisieren „${g.name}“ ab sofort in der Haushaltszentrale.\nBeitreten mit dem Code ${g.code}\n${link}\n\nTelefonnummern bleiben privat, solange ihr sie nicht selbst freigebt.`;
      }
      S.modal = { t: 'share', title, text, copied: false };
    },
    copytext() {
      const ta = document.getElementById('share-text'), text = ta ? ta.value : S.modal.text;
      S.modal.text = text;
      const ok = () => { S.modal.copied = true; render(); };
      const fallback = () => { try { ta.focus(); ta.select(); if (document.execCommand('copy')) ok(); else toast('Bitte Text markieren und manuell kopieren'); } catch (e) { toast('Bitte Text markieren und manuell kopieren'); } };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
      return false;
    },
    reset() { if (window.confirm('Alle Beispieldaten zurücksetzen?')) { S = seed(); toast('Zurückgesetzt'); } }
  };

  const F = {
    event(fd) {
      const who = fd.get('who');
      S.events.push({ id: uid(), date: fd.get('date'), start: fd.get('start'), end: fd.get('end') || '', title: fd.get('title').trim(), place: (fd.get('place') || '').trim(), who: who === 'all' ? S.members.map(m => m.id) : [who], repeat: fd.get('repeat') ? 'weekly' : undefined, bring: '', pick: '' });
      S.modal = null; toast('Termin eingetragen');
    },
    task(fd) { S.tasks.push({ id: uid(), title: fd.get('title').trim(), who: fd.get('who'), due: fd.get('due'), done: false }); S.modal = null; toast('Aufgabe an ' + member(fd.get('who')).name); },
    contract(fd) {
      S.contracts.push({ id: uid(), name: fd.get('name').trim(), cat: (fd.get('cat') || '').trim() || 'Sonstiges', amount: parseFloat(fd.get('amount')) || 0, per: fd.get('per'), end: fd.get('end'), notice: parseInt(fd.get('notice'), 10), remind: false });
      S.modal = null; toast('Vertrag gespeichert');
    },
    shop(fd) { const n = addShop([fd.get('text').trim()], isParent() ? '' : 'von ' + me().name); toast(n ? 'Hinzugefügt' : 'Steht schon drauf'); },
    wish(fd) { S.wishes.push({ id: uid(), who: S.current, text: fd.get('text').trim() }); if (S.modal) S.modal = null; toast('Wunsch gespeichert'); },
    msg(fd, f) { const g = group(f.dataset.id); g.msgs.push({ from: isParent() ? me().name + ' ' + S.family : me().name, role: isParent() ? 'Eltern' : 'Spieler', text: fd.get('text').trim(), when: 'gerade eben', mine: true }); },
    joincode(fd) {
      const code = String(fd.get('code')).replace(/\D/g, '');
      if (S.groups.some(g => g.joinCode === code)) { S.modal = { t: 'join', step: 1, err: 'Ihr seid dieser Gruppe bereits beigetreten.' }; return; }
      if (!S.joinable[code]) { S.modal = { t: 'join', step: 1, err: 'Dieser Code ist ungültig oder abgelaufen. Fragt beim Gruppenverwalter nach.' }; return; }
      S.modal = { t: 'join', step: 2, code };
    },
    joinconfirm(fd) {
      const j = S.joinable[S.modal.code], kids = fd.getAll('kid');
      if (!kids.length) { toast('Bitte ein Kind auswählen'); return; }
      S.groups.push({ id: 'g' + uid(), joinCode: S.modal.code, name: j.name, typ: j.typ, icon: j.icon, gi: j.gi, kids, admin: false, lead: j.lead, pending: true, share: { phone: false, addr: false }, requests: [], families: j.families, msgs: [{ from: j.lead, role: 'Verwaltung', text: 'Herzlich willkommen! Termine und Helferlisten findet ihr in der Übersicht.', when: 'gerade eben' }], helpers: [{ id: uid(), task: 'Waffelstand Sankt-Martins-Fest', date: day(12), by: null }], kasse: { title: 'Mitgliedsbeitrag Förderverein, 24 € im Jahr', total: 41, paid: 30, ours: false } });
      S.modal = { t: 'join', step: 3 };
    },
    creategroup(fd) {
      const typ = fd.get('typ'), icon = { 'Kita-Gruppe': 'heart', Klasse: 'school', Mannschaft: 'ball', 'Förderverein': 'heart' }[typ] || 'users';
      const g = { id: 'g' + uid(), name: fd.get('name').trim(), typ, icon, gi: 2, kids: [fd.get('kid')], admin: true, lead: me().name + ' ' + S.family, code: newCode(), share: { phone: false, addr: false }, requests: [], families: [], msgs: [], helpers: [], kasse: { title: 'Noch keine Kasse angelegt', total: 1, paid: 0, ours: false } };
      S.groups.push(g); S.modal = { t: 'creategroup', step: 2, gid: g.id };
    }
  };

  const C = {
    plan(el) { S.plan[el.dataset.id] = el.value; },
    ride(el) { const [id, k] = el.dataset.id.split('|'), e = S.events.find(x => x.id === id); e[k] = el.value; toast(k === 'bring' ? 'Hinfahrt: ' + (rideName(el.value) || 'offen') : 'Abholung: ' + (rideName(el.value) || 'offen')); },
    stufe(el) { const m = member(el.dataset.id); m.stufe = parseInt(el.value, 10); if (m.stufe === 1) delete S.pair[m.id]; toast(m.name + ': Stufe ' + m.stufe); }
  };

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
    const fn = A[b.dataset.a]; if (!fn) return;
    if (b.dataset.a !== 'close-bg') e.preventDefault();
    if (fn(b.dataset.id, b, e) === false) return;
    render();
  });
  document.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, fn = F[f.dataset.f]; if (!fn) return;
    fn(new FormData(f), f); render();
    const inp = document.querySelector(`form[data-f="${f.dataset.f}"] input[name="text"]`); if (inp && !S.modal) inp.focus();
  });
  document.addEventListener('change', e => { const el = e.target, fn = C[el.dataset.c]; if (fn) { fn(el); render(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.modal) { S.modal = null; render(); } });

  // Installierbar als App
  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; if (S.view === 'einstellungen') render(); });
  window.addEventListener('appinstalled', () => { installPrompt = null; toast('Als App installiert'); });
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

  load();
  render();
})();
