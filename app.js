'use strict';
/* Haushaltszentrale Prototyp
   Nur fiktive Beispieldaten. Speicherung ausschließlich im Browser (localStorage), keine Übertragung. */
(function () {
  var KEY = 'haushaltszentrale-demo-v1';
  var WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var WDL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  // ---------- Hilfsfunktionen ----------
  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(x) { return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); }
  function day(off) { var x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() + off); return iso(x); }
  function parse(s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); }
  function fmt(s) { var x = parse(s); return WD[x.getDay()] + ', ' + x.getDate() + '.' + (x.getMonth() + 1) + '.'; }
  function fmtLong(s) { var x = parse(s); return WDL[x.getDay()] + ', ' + x.getDate() + '. ' + MON[x.getMonth()]; }
  function diff(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
  function addMonths(s, n) { var x = parse(s); x.setMonth(x.getMonth() - n); return iso(x); }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function eur(n) { return n.toFixed(2).replace('.', ',') + ' €'; }
  function byTime(a, b) { return (a.date + a.start).localeCompare(b.date + b.start); }

  // ---------- Beispieldaten ----------
  function seed() {
    return {
      v: 1, current: 'm1', view: 'heute', kTab: 'plan',
      members: [
        { id: 'm1', name: 'Sandra', role: 'eltern', color: 0 },
        { id: 'm2', name: 'Jens', role: 'eltern', color: 1 },
        { id: 'k1', name: 'Ben', role: 'kind', stufe: 3, alter: 14, color: 2 },
        { id: 'k2', name: 'Lena', role: 'kind', stufe: 2, alter: 11, color: 3 },
        { id: 'k3', name: 'Mia', role: 'kind', stufe: 1, alter: 6, color: 1 }
      ],
      events: [
        { id: 'e1', date: day(0), start: '16:00', end: '17:30', title: 'Leichtathletik', who: ['k2'] },
        { id: 'e2', date: day(0), start: '17:30', end: '19:00', title: 'Handballtraining', who: ['k1'], group: 'g1' },
        { id: 'e3', date: day(0), start: '19:30', end: '21:00', title: 'Elternabend Klasse 6b', who: ['m1'], group: 'g2' },
        { id: 'e4', date: day(1), start: '15:00', end: '15:45', title: 'Zahnarzt', who: ['k2', 'm2'] },
        { id: 'e5', date: day(1), start: '08:00', end: '12:00', title: 'Kita-Ausflug (Rucksack, Brotdose)', who: ['k3'] },
        { id: 'e6', date: day(2), start: '17:30', end: '19:00', title: 'Handballtraining', who: ['k1'], group: 'g1' },
        { id: 'e7', date: day(3), start: '08:00', end: '', title: 'Wandertag (Brotdose, Regenjacke)', who: ['k2'], group: 'g2' },
        { id: 'e8', date: day(4), start: '14:00', end: '16:00', title: 'Heimspiel gegen TV Beispielhausen', who: ['k1', 'k2', 'k3', 'm1', 'm2'], group: 'g1' },
        { id: 'e9', date: day(5), start: '12:30', end: '', title: 'Mittagessen bei Oma und Opa', who: ['m1', 'm2', 'k1', 'k2', 'k3'] }
      ],
      tasks: [
        { id: 't1', title: 'Spülmaschine ausräumen', who: 'k1', due: day(0), done: false },
        { id: 't2', title: 'Altpapier rausbringen', who: 'k2', due: day(0), done: false },
        { id: 't3', title: 'Elternbrief Wandertag unterschreiben', who: 'm2', due: day(0), done: false },
        { id: 't4', title: 'Sportzeug waschen', who: 'm1', due: day(1), done: false },
        { id: 't5', title: 'Zimmer aufräumen', who: 'k2', due: day(2), done: false },
        { id: 't6', title: 'Hausaufgaben Mathe vorzeigen', who: 'k1', due: day(1), done: false }
      ],
      recipes: [
        { id: 'r1', name: 'Pasta mit Tomatensoße', min: 20, fast: true, z: ['Spaghetti', 'Passierte Tomaten', 'Zwiebel', 'Knoblauch', 'Parmesan'] },
        { id: 'r2', name: 'Ofengemüse mit Feta', min: 40, fast: false, z: ['Paprika', 'Zucchini', 'Kartoffeln', 'Feta', 'Rosmarin'] },
        { id: 'r3', name: 'Pfannkuchen mit Apfelmus', min: 25, fast: true, z: ['Mehl', 'Milch', 'Eier', 'Apfelmus'] },
        { id: 'r4', name: 'Chili sin Carne mit Reis', min: 45, fast: false, z: ['Kidneybohnen', 'Mais', 'Tomaten in Stücken', 'Paprika', 'Reis'] },
        { id: 'r5', name: 'Wraps mit Hähnchen', min: 20, fast: true, z: ['Tortilla-Wraps', 'Hähnchenbrust', 'Salat', 'Joghurt', 'Gurke'] },
        { id: 'r6', name: 'Rührkuchen', min: 70, fast: false, cake: true, z: ['Mehl', 'Zucker', 'Butter', 'Eier', 'Backpulver'] }
      ],
      plan: (function () {
        var p = {}; var ids = ['r2', 'r1', 'r4', 'r3', 'r5', '', 'r1'];
        for (var i = 0; i < 7; i++) p[day(i)] = ids[i];
        return p;
      })(),
      wishes: [{ id: 'w1', who: 'k1', text: 'Pfannkuchen am Wochenende' }],
      shopping: [
        { id: 's1', text: 'Milch', done: false, src: '' },
        { id: 's2', text: 'Bananen', done: false, src: '' },
        { id: 's3', text: 'Brot', done: true, src: '' }
      ],
      groups: [
        {
          id: 'g1', name: 'HSG Musterstadt C-Jugend', typ: 'Mannschaft', kids: ['k1'], lead: 'Trainer Michael K.',
          msgs: [
            { from: 'Trainer Michael K.', role: 'Betreuer', text: 'Training am Mittwoch findet wie gewohnt statt. Bitte Hallenschuhe mitbringen.', when: 'gestern 18:42' },
            { from: 'Familie Yilmaz', role: 'Eltern', text: 'Wer fährt Samstag zum Heimspiel? Wir haben noch einen Platz frei.', when: 'heute 07:15' }
          ],
          helpers: [
            { id: 'h1', task: 'Kuchen für das Heimspiel', date: day(4), cake: true, by: null },
            { id: 'h2', task: 'Kasse Catering 1. Halbzeit', date: day(4), by: 'Familie Becker' },
            { id: 'h3', task: 'Kasse Catering 2. Halbzeit', date: day(4), by: null },
            { id: 'h4', task: 'Fahrdienst Auswärtsspiel', date: day(11), by: null }
          ],
          kasse: { title: 'Saisonabschlussfahrt, 25 € pro Kind', total: 15, paid: 9, ours: false }
        },
        {
          id: 'g2', name: 'Klassenpflegschaft 6b', typ: 'Klasse', kids: ['k2'], lead: 'Elternvertretung 6b',
          msgs: [
            { from: 'Elternvertretung 6b', role: 'Elternvertretung', text: 'Für das Herbstfest suchen wir noch Kuchen und Hilfe beim Aufbau.', when: 'Montag 20:10' }
          ],
          helpers: [
            { id: 'h5', task: 'Kuchen für das Herbstfest', date: day(9), cake: true, by: null },
            { id: 'h6', task: 'Aufbau Herbstfest', date: day(9), by: null }
          ],
          kasse: { title: 'Klassenkasse 1. Halbjahr, 15 € pro Kind', total: 28, paid: 22, ours: true }
        }
      ],
      rsvp: {},
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

  var S;
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) { S = JSON.parse(raw); if (S && S.v === 1) return; } } catch (e) { /* ohne Speicher weiter */ }
    S = seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignorieren */ } }

  // ---------- Rollen und Rechte ----------
  function member(id) { return S.members.find(function (m) { return m.id === id; }); }
  function me() { return member(S.current); }
  function isParent(m) { m = m || me(); return m.role === 'eltern'; }
  function level(m) { m = m || me(); return isParent(m) ? 9 : m.stufe; }
  function chip(id) { var m = member(id); return m ? '<span class="chip p' + m.color + '">' + esc(m.name) + '</span>' : ''; }
  function kids() { return S.members.filter(function (m) { return m.role === 'kind'; }); }
  function canGroups() { return level() >= 3; }
  function visibleEvents() {
    return isParent() ? S.events : S.events.filter(function (e) { return e.who.indexOf(S.current) >= 0; });
  }
  function recipe(id) { return S.recipes.find(function (r) { return r.id === id; }); }
  function myGroups() {
    return S.groups.filter(function (g) {
      return isParent() ? true : g.kids.indexOf(S.current) >= 0;
    });
  }

  // ---------- Verknüpfung Kalender und Küche ----------
  function lateOn(date) {
    return S.events.filter(function (e) { return e.date === date && e.end && e.end >= '18:30'; });
  }
  function mealInfo(date) {
    var r = recipe(S.plan[date]);
    var late = lateOn(date);
    return { r: r, late: late, warn: !!(r && !r.fast && late.length) };
  }
  function lateText(late) {
    return late.map(function (e) {
      return e.who.map(function (w) { return member(w).name; }).join(', ') + ' bis ' + e.end + ' (' + e.title + ')';
    }).join('; ');
  }

  // ---------- Icons ----------
  var IC = {
    heute: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    kalender: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    kueche: '<path d="M6 3v8a3 3 0 0 0 6 0V3M9 3v18M17 3c-2 2-2 6 0 8v10"/>',
    gruppen: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2 1-4 3-4.5 2 .3 3 2.5 3 4.5"/>',
    mehr: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + '</svg>'; }

  // ---------- Ansichten ----------
  function vHeute() {
    var t = day(0), m = me();
    var ev = visibleEvents().filter(function (e) { return e.date === t; }).sort(byTime);
    var tasks = S.tasks.filter(function (x) { return !x.done && x.due <= t && (isParent() || x.who === S.current); });
    var mi = mealInfo(t);
    var h = '<h1>Hallo ' + esc(m.name) + '</h1><p class="sub">' + fmtLong(t) + '</p>';

    h += '<section class="card"><h2>Heute' + (isParent() ? ' in der Familie' : '') + '</h2>';
    h += ev.length ? '<ul class="list">' + ev.map(evRow).join('') + '</ul>' : '<p class="muted">Keine Termine.</p>';
    h += '</section>';

    h += '<section class="card"><div class="row between"><h2>Aufgaben heute</h2><button class="btn small ghost" data-a="go" data-id="aufgaben">Alle</button></div>';
    h += tasks.length ? '<ul class="list">' + tasks.map(taskRow).join('') + '</ul>' : '<p class="muted">Alles erledigt.</p>';
    h += '</section>';

    h += '<section class="card"><h2>Abendessen</h2>';
    h += mi.r ? '<p><strong>' + esc(mi.r.name) + '</strong> <span class="tag' + (mi.r.fast ? ' fast' : '') + '">' + mi.r.min + ' Min.</span></p>' : '<p class="muted">Noch nichts geplant.</p>';
    if (mi.late.length) h += '<div class="note ' + (mi.warn ? 'warn' : 'info') + '">' + esc(lateText(mi.late)) + (mi.warn ? '. Ein schnelles Gericht wäre heute besser.' : '. Passt, das Gericht ist schnell gemacht.') + '</div>';
    if (mi.warn && isParent()) h += '<button class="btn small" data-a="quickmeal" data-id="' + t + '">Schnelles Gericht wählen</button>';
    h += '</section>';

    if (isParent()) {
      var open = 0; S.groups.forEach(function (g) { g.helpers.forEach(function (x) { if (!x.by) open++; }); });
      var soon = S.contracts.filter(function (c) { var d = diff(t, addMonths(c.end, c.notice)); return d >= 0 && d <= 30; });
      h += '<section class="card"><h2>Hinweise</h2><ul class="list">';
      h += '<li><span class="grow">' + open + ' offene Helferaufgaben in euren Gruppen</span><button class="btn small" data-a="go" data-id="gruppen">Ansehen</button></li>';
      soon.forEach(function (c) {
        h += '<li><span class="grow">Kündigungsfrist <strong>' + esc(c.name) + '</strong> endet am ' + fmt(addMonths(c.end, c.notice)) + '</span><button class="btn small" data-a="go" data-id="vertraege">Prüfen</button></li>';
      });
      h += '</ul></section>';
    } else {
      h += '<section class="card"><h2>Essenswunsch</h2><p class="muted small">Dein Wunsch landet bei deinen Eltern im Wochenplan.</p>' + wishForm() + '</section>';
    }
    return h;
  }

  function evRow(e) {
    var g = e.group ? S.groups.find(function (x) { return x.id === e.group; }) : null;
    return '<li><span class="time">' + e.start + (e.end ? '–' + e.end : '') + '</span><span class="grow"><span class="t">' + esc(e.title) + '</span><br>' +
      e.who.map(chip).join('') + (g ? ' <span class="tag">' + esc(g.name) + '</span>' : '') + '</span>' +
      (isParent() ? '<button class="btn small ghost danger" data-a="delevent" data-id="' + e.id + '" aria-label="Termin löschen">✕</button>' : '') + '</li>';
  }

  function taskRow(x) {
    var mine = x.who === S.current || isParent();
    return '<li class="' + (x.done ? 'done' : '') + '"><button class="check' + (x.done ? ' on' : '') + '" data-a="task" data-id="' + x.id + '"' + (mine ? '' : ' disabled') + ' aria-label="Erledigt">' + (x.done ? '✓' : '') + '</button>' +
      '<span class="grow"><span class="t">' + esc(x.title) + '</span><br><span class="small muted">' + (x.due === day(0) ? 'heute' : fmt(x.due)) + '</span></span>' + chip(x.who) + '</li>';
  }

  function vKalender() {
    var h = '<h1>Kalender</h1><p class="sub">' + (isParent() ? 'Alle Termine der Familie, nächste 14 Tage' : 'Deine Termine, nächste 14 Tage') + '</p>';
    if (isParent()) {
      h += '<section class="card"><h2>Termin eintragen</h2><form class="inline" data-f="event">' +
        '<input name="title" placeholder="Was?" required maxlength="80">' +
        '<input name="date" type="date" value="' + day(0) + '" required>' +
        '<input name="start" type="time" value="17:00" required><input name="end" type="time" value="18:00">' +
        '<select name="who">' + S.members.map(function (m) { return '<option value="' + m.id + '">' + esc(m.name) + '</option>'; }).join('') + '<option value="all">Ganze Familie</option></select>' +
        '<button class="btn primary">Eintragen</button></form></section>';
    }
    var ev = visibleEvents();
    h += '<section class="card">';
    for (var i = 0; i < 14; i++) {
      var d = day(i);
      var list = ev.filter(function (e) { return e.date === d; }).sort(byTime);
      if (!list.length && i > 6) continue;
      h += '<div class="day' + (i === 0 ? ' today' : '') + '">' + (i === 0 ? 'Heute, ' : i === 1 ? 'Morgen, ' : '') + fmt(d) + '</div>';
      h += list.length ? '<ul class="list">' + list.map(evRow).join('') + '</ul>' : '<p class="muted small">Nichts geplant.</p>';
    }
    h += '</section>';
    h += '<p class="muted small">Im Produkt: Kalenderabo pro Person für Apple, Google, Outlook und Home Assistant.</p>';
    return h;
  }

  function wishForm() {
    return '<form class="inline" data-f="wish"><input name="text" placeholder="Was möchtest du gern essen?" required maxlength="60"><button class="btn primary">Wünschen</button></form>';
  }

  function vKueche() {
    var h = '<h1>Küche</h1><p class="sub">Wochenplan, Rezepte und Einkaufsliste hängen zusammen.</p>';
    h += '<div class="tabs" role="tablist">' + [['plan', 'Wochenplan'], ['rezepte', 'Rezepte'], ['einkauf', 'Einkauf']].map(function (t) {
      return '<button role="tab" class="' + (S.kTab === t[0] ? 'on' : '') + '" data-a="ktab" data-id="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div>';
    if (S.kTab === 'plan') h += kPlan();
    else if (S.kTab === 'rezepte') h += kRezepte();
    else h += kEinkauf();
    return h;
  }

  function kPlan() {
    var h = '<section class="card">';
    for (var i = 0; i < 7; i++) {
      var d = day(i), mi = mealInfo(d);
      h += '<div class="meal"><div><strong>' + fmt(d).split(',')[0] + '</strong><br><span class="small muted">' + fmt(d).split(', ')[1] + '</span></div><div>';
      if (isParent()) {
        h += '<select data-c="plan" data-id="' + d + '"><option value="">nicht geplant</option>' + S.recipes.filter(function (r) { return !r.cake; }).map(function (r) {
          return '<option value="' + r.id + '"' + (S.plan[d] === r.id ? ' selected' : '') + '>' + esc(r.name) + (r.fast ? ' (schnell)' : '') + '</option>';
        }).join('') + '</select>';
      } else {
        h += mi.r ? esc(mi.r.name) : '<span class="muted">nicht geplant</span>';
      }
      if (mi.late.length) h += '<div class="note ' + (mi.warn ? 'warn' : 'info') + ' small">' + esc(lateText(mi.late)) + (mi.warn ? '. Schnelles Gericht empfohlen.' : '') + '</div>';
      if (mi.warn && isParent()) h += '<button class="btn small" data-a="quickmeal" data-id="' + d + '">Schnelles Gericht wählen</button>';
      h += '</div></div>';
    }
    h += '</section>';
    if (isParent()) h += '<button class="btn primary" data-a="planshop">Zutaten der Woche auf die Einkaufsliste</button><p></p>';
    h += '<section class="card"><h2>Essenswünsche</h2>';
    h += S.wishes.length ? '<ul class="list">' + S.wishes.map(function (w) {
      return '<li><span class="grow">' + esc(w.text) + '</span>' + chip(w.who) + (isParent() ? '<button class="btn small ghost" data-a="delwish" data-id="' + w.id + '" aria-label="Wunsch erledigt">✓</button>' : '') + '</li>';
    }).join('') + '</ul>' : '<p class="muted">Keine Wünsche offen.</p>';
    h += wishForm() + '</section>';
    return h;
  }

  function kRezepte() {
    return S.recipes.map(function (r) {
      return '<section class="card"><div class="row between"><h2>' + esc(r.name) + '</h2><span class="tag' + (r.fast ? ' fast' : '') + '">' + r.min + ' Min.' + (r.fast ? ', schnell' : '') + '</span></div>' +
        '<p class="small muted">' + r.z.map(esc).join(' · ') + '</p>' +
        '<button class="btn small" data-a="recipeshop" data-id="' + r.id + '">Zutaten auf die Einkaufsliste</button></section>';
    }).join('') + '<p class="muted small">Im Produkt: eigene Rezepte anlegen und Rezepte von Webseiten für den privaten Gebrauch importieren.</p>';
  }

  function kEinkauf() {
    var open = S.shopping.filter(function (s) { return !s.done; }), done = S.shopping.filter(function (s) { return s.done; });
    function row(s) {
      return '<li class="' + (s.done ? 'done' : '') + '"><button class="check' + (s.done ? ' on' : '') + '" data-a="shop" data-id="' + s.id + '" aria-label="Erledigt">' + (s.done ? '✓' : '') + '</button><span class="grow"><span class="t">' + esc(s.text) + '</span>' + (s.src ? '<br><span class="small muted">' + esc(s.src) + '</span>' : '') + '</span></li>';
    }
    var h = '<section class="card"><h2>Einkaufsliste</h2><form class="inline" data-f="shop"><input name="text" placeholder="Was fehlt?" required maxlength="60"><button class="btn primary">Hinzufügen</button></form>';
    h += open.length ? '<ul class="list">' + open.map(row).join('') + '</ul>' : '<p class="muted">Liste ist leer.</p>';
    if (done.length) h += '<h3>Im Wagen</h3><ul class="list">' + done.map(row).join('') + '</ul><button class="btn small ghost" data-a="clearshop">Erledigte entfernen</button>';
    return h + '</section>';
  }

  function vGruppen() {
    var h = '<h1>Gruppen</h1><p class="sub">Mannschaft, Klasse, Förderverein</p>';
    if (!canGroups()) return h + '<div class="note lock">Gruppen sind für dein Konto nicht freigeschaltet. Termine aus deinen Gruppen siehst du im Kalender.</div>';
    h += '<div class="note info">Kinderschutz: Keine Privatchats zwischen Betreuern und Kindern. Nachrichten an Kinder sehen auch die Eltern. Telefonnummern werden nicht angezeigt.</div>';
    myGroups().forEach(function (g) {
      var ev = S.events.filter(function (e) { return e.group === g.id && e.date >= day(0); }).sort(byTime);
      h += '<section class="card"><div class="row between"><h2>' + esc(g.name) + '</h2><span class="tag">' + esc(g.typ) + '</span></div>';
      h += '<p class="small muted">Verwaltet von ' + esc(g.lead) + ' · ' + g.kids.map(chip).join('') + '</p>';

      h += '<h3>Termine</h3><ul class="list">' + (ev.length ? ev.map(function (e) {
        var whoKids = isParent() ? g.kids : [S.current];
        return '<li><span class="time">' + fmt(e.date) + '</span><span class="grow">' + esc(e.title) + ' <span class="small muted">' + e.start + '</span>' +
          whoKids.map(function (k) {
            var v = S.rsvp[e.id + '|' + k];
            return '<div class="row small">' + (isParent() ? chip(k) : '') +
              '<button class="btn small' + (v === 'ja' ? ' primary' : '') + '" data-a="rsvp" data-id="' + e.id + '|' + k + '|ja">Zusage</button>' +
              '<button class="btn small' + (v === 'nein' ? ' primary' : '') + '" data-a="rsvp" data-id="' + e.id + '|' + k + '|nein">Absage</button></div>';
          }).join('') + '</span></li>';
      }).join('') : '<li class="muted">Keine Termine.</li>') + '</ul>';

      h += '<h3>Helferliste</h3><ul class="list">' + g.helpers.map(function (x) {
        return '<li><span class="grow">' + esc(x.task) + '<br><span class="small muted">' + fmt(x.date) + (x.by ? ' · übernimmt ' + esc(x.by) : '') + '</span></span>' +
          (x.by ? '<span class="tag">vergeben</span>' : isParent() ? '<button class="btn small" data-a="helper" data-id="' + g.id + '|' + x.id + '">Übernehmen</button>' : '<span class="tag">offen</span>') + '</li>';
      }).join('') + '</ul>';

      h += '<h3>Nachrichten</h3><div>' + g.msgs.map(function (m) {
        return '<div class="msg"><div class="from">' + esc(m.from) + ' <span class="muted small">· ' + esc(m.role) + ' · ' + esc(m.when) + '</span></div>' + esc(m.text) + '</div>';
      }).join('') + '</div>';
      h += '<form class="inline" data-f="msg" data-id="' + g.id + '"><input name="text" placeholder="Nachricht an die ganze Gruppe" required maxlength="300"><button class="btn primary">Senden</button></form>';

      if (isParent()) {
        var pct = Math.round(g.kasse.paid / g.kasse.total * 10) * 10;
        h += '<h3>Kasse</h3><p class="small">' + esc(g.kasse.title) + '</p><div class="bar"><span class="w' + pct + '"></span></div>' +
          '<div class="row between small"><span class="muted">' + g.kasse.paid + ' von ' + g.kasse.total + ' Familien vermerkt</span>' +
          '<button class="btn small' + (g.kasse.ours ? ' primary' : '') + '" data-a="kasse" data-id="' + g.id + '">' + (g.kasse.ours ? 'Unser Beitrag: bezahlt' : 'Unser Beitrag: offen') + '</button></div>' +
          '<p class="small muted">Nur Übersicht. Bezahlt wird außerhalb der App.</p>';
      }
      h += '</section>';
    });
    return h;
  }

  function vMehr() {
    var h = '<h1>Mehr</h1><section class="card menu">';
    h += '<a data-a="go" data-id="aufgaben"><span>Aufgaben</span><span class="muted">›</span></a>';
    if (isParent()) h += '<a data-a="go" data-id="vertraege"><span>Verträge und Abos</span><span class="muted">›</span></a>';
    h += '<a data-a="go" data-id="einstellungen"><span>' + (isParent() ? 'Familie und Datenschutz' : 'Über die App') + '</span><span class="muted">›</span></a>';
    return h + '</section>';
  }

  function back() { return '<button class="btn small ghost" data-a="go" data-id="mehr">‹ Zurück</button>'; }

  function vAufgaben() {
    var h = back() + '<h1>Aufgaben</h1><p class="sub">' + (isParent() ? 'Wer macht was' : 'Deine Aufgaben') + '</p>';
    if (isParent()) {
      h += '<section class="card"><h2>Aufgabe verteilen</h2><form class="inline" data-f="task"><input name="title" placeholder="Was ist zu tun?" required maxlength="80">' +
        '<select name="who">' + S.members.map(function (m) { return '<option value="' + m.id + '">' + esc(m.name) + '</option>'; }).join('') + '</select>' +
        '<input name="due" type="date" value="' + day(0) + '" required><button class="btn primary">Hinzufügen</button></form></section>';
    }
    var people = isParent() ? S.members : [me()];
    people.forEach(function (p) {
      var list = S.tasks.filter(function (x) { return x.who === p.id; }).sort(function (a, b) { return (a.done - b.done) || a.due.localeCompare(b.due); });
      if (!list.length) return;
      h += '<section class="card"><h2>' + chip(p.id) + '</h2><ul class="list">' + list.map(taskRow).join('') + '</ul></section>';
    });
    return h;
  }

  function vVertraege() {
    if (!isParent()) return back() + '<div class="note lock">Nur für Eltern sichtbar.</div>';
    var t = day(0), monthly = 0;
    S.contracts.forEach(function (c) { monthly += c.per === 'jahr' ? c.amount / 12 : c.amount; });
    var h = back() + '<h1>Verträge und Abos</h1><p class="sub">Manuell erfasst. Keine Verbindung zum Bankkonto.</p>';
    h += '<section class="card"><div class="small muted">Fixkosten im Monat</div><div class="sum">' + eur(monthly) + '</div><div class="small muted">' + eur(monthly * 12) + ' im Jahr</div></section>';
    h += '<section class="card"><ul class="list">' + S.contracts.slice().sort(function (a, b) { return addMonths(a.end, a.notice).localeCompare(addMonths(b.end, b.notice)); }).map(function (c) {
      var dl = addMonths(c.end, c.notice), d = diff(t, dl);
      var cls = d < 0 ? 'over' : d <= 30 ? 'soon' : '';
      var txt = d < 0 ? 'Frist verpasst, Vertrag verlängert sich' : 'Kündigen bis ' + fmt(dl) + ' (' + (d === 0 ? 'heute' : 'in ' + d + ' Tagen') + ')';
      return '<li><span class="grow"><strong>' + esc(c.name) + '</strong> <span class="tag">' + esc(c.cat) + '</span><br>' +
        '<span class="small">' + eur(c.amount) + (c.per === 'jahr' ? ' im Jahr' : ' im Monat') + ' · Laufzeit bis ' + fmt(c.end) + '</span><br>' +
        '<span class="small deadline ' + cls + '">' + txt + '</span></span>' +
        (d >= 0 ? '<button class="btn small' + (c.remind ? ' primary' : '') + '" data-a="remind" data-id="' + c.id + '">' + (c.remind ? 'Im Kalender' : 'Erinnern') + '</button>' : '') + '</li>';
    }).join('') + '</ul></section>';
    h += '<section class="card"><h2>Vertrag erfassen</h2><form class="inline" data-f="contract">' +
      '<input name="name" placeholder="Name" required maxlength="60"><input name="cat" placeholder="Kategorie" maxlength="30">' +
      '<input name="amount" type="number" step="0.01" min="0" placeholder="Betrag €" required>' +
      '<select name="per"><option value="monat">pro Monat</option><option value="jahr">pro Jahr</option></select>' +
      '<label class="small muted">Laufzeit bis <input name="end" type="date" value="' + day(90) + '" required></label>' +
      '<select name="notice"><option value="0">monatlich kündbar</option><option value="1">1 Monat Frist</option><option value="2">2 Monate Frist</option><option value="3" selected>3 Monate Frist</option></select>' +
      '<button class="btn primary">Speichern</button></form></section>';
    return h;
  }

  function vEinstellungen() {
    var h = back();
    if (!isParent()) {
      return h + '<h1>Über die App</h1><section class="card"><p>Deine Eltern haben dir diesen Zugang eingerichtet. Du siehst deine Termine und Aufgaben und kannst die Einkaufsliste ergänzen.</p><p class="small muted">Dein Konto braucht keine E-Mail-Adresse und keine Telefonnummer. Dein Standort wird nicht erfasst.</p></section>';
    }
    h += '<h1>Familie und Datenschutz</h1><p class="sub">Rollen, Zugänge und Daten</p>';
    h += '<section class="card"><h2>Familienmitglieder</h2><ul class="list">' + S.members.map(function (m) {
      if (m.role === 'eltern') return '<li><span class="grow">' + chip(m.id) + ' <span class="small muted">Elternteil, volle Rechte</span></span></li>';
      var code = S.pair[m.id];
      return '<li><span class="grow">' + chip(m.id) + ' <span class="small muted">' + m.alter + ' Jahre</span>' +
        '<br><select data-c="stufe" data-id="' + m.id + '" aria-label="Zugangsstufe für ' + esc(m.name) + '">' +
        '<option value="1"' + (m.stufe === 1 ? ' selected' : '') + '>Stufe 1: Profil ohne Zugang</option>' +
        '<option value="2"' + (m.stufe === 2 ? ' selected' : '') + '>Stufe 2: eingeschränkter Zugang</option>' +
        '<option value="3"' + (m.stufe === 3 ? ' selected' : '') + '>Stufe 3: erweiterter Zugang mit Gruppen</option></select>' +
        (code ? '<div class="code">' + code + '</div><div class="small muted">Kopplungscode, 10 Minuten gültig. Im Produkt als QR-Code.</div>' : '') +
        '</span>' + (m.stufe > 1 ? '<button class="btn small" data-a="pair" data-id="' + m.id + '">Gerät koppeln</button>' : '') + '</li>';
    }).join('') + '</ul></section>';
    h += '<section class="card"><h2>Kalenderabo</h2><p class="small">Im Produkt erhält jede Person einen eigenen Abo-Link im ICS-Format für Apple, Google, Outlook und Home Assistant. Der Link ist jederzeit widerrufbar.</p><button class="btn small" disabled>Abo-Link erzeugen (im Prototyp nicht aktiv)</button></section>';
    h += '<section class="card"><h2>Datenschutz</h2><ul class="list small">' +
      '<li>Hosting in Deutschland, keine Übermittlung in Drittländer</li>' +
      '<li>Keine Werbung, keine Analysewerkzeuge Dritter</li>' +
      '<li>Kinder brauchen weder E-Mail-Adresse noch Telefonnummer</li>' +
      '<li>Kein Standort-Tracking</li>' +
      '<li>Keine Verbindung zu Bankkonten, keine Zahlungsabwicklung</li>' +
      '<li>Export und Löschung aller Familiendaten jederzeit</li></ul>' +
      '<div class="note lock">Dieser Prototyp speichert die Beispieldaten nur in deinem Browser. Bitte keine echten Daten eingeben.</div>' +
      '<button class="btn danger" data-a="reset">Beispieldaten zurücksetzen</button></section>';
    return h;
  }

  var VIEWS = { heute: vHeute, kalender: vKalender, kueche: vKueche, gruppen: vGruppen, mehr: vMehr, aufgaben: vAufgaben, vertraege: vVertraege, einstellungen: vEinstellungen };
  var NAVOF = { aufgaben: 'mehr', vertraege: 'mehr', einstellungen: 'mehr' };

  function render() {
    var sel = document.getElementById('who');
    sel.innerHTML = S.members.filter(function (m) { return m.role === 'eltern' || m.stufe >= 2; }).map(function (m) {
      return '<option value="' + m.id + '"' + (m.id === S.current ? ' selected' : '') + '>' + esc(m.name) + (m.role === 'eltern' ? ' (Elternteil)' : ' (Kind, Stufe ' + m.stufe + ')') + '</option>';
    }).join('');
    if (S.view === 'gruppen' && !canGroups()) S.view = 'heute';
    var navs = [['heute', 'Heute'], ['kalender', 'Kalender'], ['kueche', 'Küche']];
    if (canGroups()) navs.push(['gruppen', 'Gruppen']);
    navs.push(['mehr', 'Mehr']);
    var active = NAVOF[S.view] || S.view;
    document.getElementById('nav').innerHTML = navs.map(function (n) {
      return '<button class="' + (active === n[0] ? 'on' : '') + '" data-a="go" data-id="' + n[0] + '"' + (active === n[0] ? ' aria-current="page"' : '') + '>' + icon(n[0]) + n[1] + '</button>';
    }).join('');
    document.getElementById('main').innerHTML = (VIEWS[S.view] || vHeute)();
    save();
  }

  var toastT;
  function toast(msg) {
    var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }
  function addShop(items, src) {
    var n = 0;
    items.forEach(function (z) {
      if (!S.shopping.some(function (s) { return !s.done && s.text.toLowerCase() === z.toLowerCase(); })) { S.shopping.push({ id: uid(), text: z, done: false, src: src }); n++; }
    });
    return n;
  }

  // ---------- Aktionen ----------
  var A = {
    go: function (id) { S.view = id; window.scrollTo(0, 0); },
    ktab: function (id) { S.kTab = id; },
    task: function (id) { var x = S.tasks.find(function (t) { return t.id === id; }); if (x) { x.done = !x.done; if (x.done) toast('Erledigt: ' + x.title); } },
    shop: function (id) { var s = S.shopping.find(function (x) { return x.id === id; }); if (s) s.done = !s.done; },
    clearshop: function () { S.shopping = S.shopping.filter(function (s) { return !s.done; }); },
    delevent: function (id) { S.events = S.events.filter(function (e) { return e.id !== id; }); toast('Termin gelöscht'); },
    delwish: function (id) { S.wishes = S.wishes.filter(function (w) { return w.id !== id; }); },
    quickmeal: function (d) {
      var fast = S.recipes.filter(function (r) { return r.fast; });
      var used = Object.keys(S.plan).map(function (k) { return S.plan[k]; });
      var pick = fast.find(function (r) { return used.indexOf(r.id) < 0; }) || fast[0];
      S.plan[d] = pick.id; toast(fmt(d) + ': ' + pick.name);
    },
    planshop: function () {
      var n = 0;
      for (var i = 0; i < 7; i++) { var r = recipe(S.plan[day(i)]); if (r) n += addShop(r.z, 'Wochenplan: ' + r.name); }
      toast(n + ' Zutaten auf die Einkaufsliste gesetzt');
    },
    recipeshop: function (id) { var r = recipe(id); var n = addShop(r.z, 'Rezept: ' + r.name); toast(n ? n + ' Zutaten hinzugefügt' : 'Steht schon alles auf der Liste'); },
    rsvp: function (id) {
      var p = id.split('|'), k = p[0] + '|' + p[1];
      S.rsvp[k] = S.rsvp[k] === p[2] ? undefined : p[2];
      if (S.rsvp[k]) toast((p[2] === 'ja' ? 'Zusage' : 'Absage') + ' für ' + member(p[1]).name + ' gesendet');
    },
    helper: function (id) {
      var p = id.split('|'), g = S.groups.find(function (x) { return x.id === p[0]; }), x = g.helpers.find(function (y) { return y.id === p[1]; });
      x.by = 'Familie ' + me().name;
      S.events.push({ id: uid(), date: x.date, start: '', end: '', title: x.task, who: [S.current], group: g.id });
      var msg = 'Übernommen und im Kalender eingetragen';
      if (x.cake) { var cake = S.recipes.find(function (r) { return r.cake; }); var n = addShop(cake.z, 'Helferliste: ' + x.task); msg += ', ' + n + ' Zutaten auf der Einkaufsliste'; }
      toast(msg);
    },
    kasse: function (id) { var g = S.groups.find(function (x) { return x.id === id; }); g.kasse.ours = !g.kasse.ours; g.kasse.paid += g.kasse.ours ? 1 : -1; },
    remind: function (id) {
      var c = S.contracts.find(function (x) { return x.id === id; });
      if (c.remind) return;
      c.remind = true;
      var dl = addMonths(c.end, c.notice), rd = diff(day(0), dl) > 7 ? iso(new Date(parse(dl).getTime() - 7 * 86400000)) : day(0);
      S.events.push({ id: uid(), date: rd, start: '09:00', end: '', title: 'Kündigen? ' + c.name + ' (Frist ' + fmt(dl) + ')', who: S.members.filter(function (m) { return m.role === 'eltern'; }).map(function (m) { return m.id; }) });
      toast('Erinnerung am ' + fmt(rd) + ' im Kalender');
    },
    pair: function (id) { S.pair[id] = String(Math.floor(100000 + Math.random() * 900000)).replace(/(\d{3})(\d{3})/, '$1 $2'); },
    reset: function () { if (window.confirm('Alle Beispieldaten zurücksetzen?')) { S = seed(); toast('Zurückgesetzt'); } }
  };

  var F = {
    event: function (fd) {
      var who = fd.get('who');
      S.events.push({ id: uid(), date: fd.get('date'), start: fd.get('start'), end: fd.get('end') || '', title: fd.get('title').trim(), who: who === 'all' ? S.members.map(function (m) { return m.id; }) : [who] });
      toast('Termin eingetragen');
    },
    task: function (fd) { S.tasks.push({ id: uid(), title: fd.get('title').trim(), who: fd.get('who'), due: fd.get('due'), done: false }); toast('Aufgabe an ' + member(fd.get('who')).name); },
    shop: function (fd) { var n = addShop([fd.get('text').trim()], isParent() ? '' : 'von ' + me().name); toast(n ? 'Hinzugefügt' : 'Steht schon drauf'); },
    wish: function (fd) { S.wishes.push({ id: uid(), who: S.current, text: fd.get('text').trim() }); toast('Wunsch gespeichert'); },
    msg: function (fd, f) {
      var g = S.groups.find(function (x) { return x.id === f.dataset.id; });
      g.msgs.push({ from: isParent() ? 'Familie ' + me().name : me().name, role: isParent() ? 'Eltern' : 'Spieler', text: fd.get('text').trim(), when: 'gerade eben' });
    },
    contract: function (fd) {
      S.contracts.push({ id: uid(), name: fd.get('name').trim(), cat: (fd.get('cat') || 'Sonstiges').trim() || 'Sonstiges', amount: parseFloat(fd.get('amount')) || 0, per: fd.get('per'), end: fd.get('end'), notice: parseInt(fd.get('notice'), 10), remind: false });
      toast('Vertrag gespeichert');
    }
  };

  var C = {
    who: function (el) { S.current = el.value; S.view = 'heute'; toast('Ansicht: ' + me().name); },
    plan: function (el) { S.plan[el.dataset.id] = el.value; },
    stufe: function (el) {
      var m = member(el.dataset.id); m.stufe = parseInt(el.value, 10);
      if (m.stufe === 1) delete S.pair[m.id];
      toast(m.name + ': Stufe ' + m.stufe);
    }
  };

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
    e.preventDefault();
    var fn = A[b.dataset.a]; if (fn) { fn(b.dataset.id, b); render(); }
  });
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, fn = F[f.dataset.f]; if (!fn) return;
    fn(new FormData(f), f); render();
  });
  document.addEventListener('change', function (e) {
    var el = e.target, fn = C[el.dataset.c]; if (!fn) return;
    fn(el); render();
  });

  load();
  render();
})();
