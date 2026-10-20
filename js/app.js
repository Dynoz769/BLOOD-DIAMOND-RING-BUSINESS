/* Blood Diamond Ring Business – weekly submission tracker.
 * Everything is stored in the browser (localStorage). Use "Download backup"
 * to move data between devices. */
(function () {
  'use strict';

  const STORAGE_KEY = 'bdrb-state-v1';
  const CLASSES = ['Kumicho', 'Oka-San', 'Kigyo-Shatei', 'Wakagashira', 'Jun-Kouseiin', 'Kage', 'Wakashu'];
  const DISCORD_WEBHOOK_RE = /^https:\/\/(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+/;
  const DISCORD_LIMIT = 1900;   // Discord allows 2000 chars per message; keep some margin
  // Discord names that differ from "<prefix><name>" (taken from the family's Discord).
  const KNOWN_DISCORD_NAMES = {
    'Ryouta Kurogawa': 'HK | Ryouta',
    'Takeru Kurogawa': 'HK | Takeru Kurogawa (PEMANGGNG)',
    'Jin Mori': 'HK | JIN MORI ( MONKEY KING )',
    'Shin Nightingale': 'HK | SHIN ( MULUT PUAKA )',
    'Ash Lee Astrid ARK': 'HK | Ash Lee ARK',
    'Supreme Toman Astrid ARK': 'HK | Supreme ARK',
    'El Tiger': 'HK | Eltiger',
  };
  const DAYS = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
  ];

  // ---------- Sample data (Week 43 sheet) ----------
  function sampleState() {
    const rows = [
      // hierarchy, family, class, specialist, name, mon, tue, wed, (unused), exempt, kiv
      // Daily figures include any extra given (e.g. Ryu gave 1255 = 250 quota + 1005 advance).
      ['Oyabun', 'Nakamura', 'Kumicho', '-', 'Don Nakamura', 0, 0, 0, '', true, false],
      ['Aneki', 'Kizuna', 'Oka-San', 'Melee', 'Leia Yuki', 0, 0, 0, '', true, false],
      ['Aniki', 'Kizuna', 'Kigyo-Shatei', 'Melee', 'Ragna Silver', 0, 0, 0, '', true, false],
      ['Aniki', 'Kizuna', 'Kigyo-Shatei', 'Melee', 'Nick Leon', 0, 250, 0, '', false, false],
      ['Aniki', 'Kizuna', 'Wakagashira', 'Melee & Shooter', 'Ajol Rentaka', 0, 150, 0, '', false, false],
      ['Aniki', 'Kizuna', 'Jun-Kouseiin', 'Melee', 'Ezzy Tezu', 500, 0, 0, '', false, false],
      ['Onee-San', 'Kurogawa', 'Kage', 'Melee', 'Reyna Kurogawa', 0, 266, 0, '', false, false],
      ['Kyoudai', 'Kurogawa', 'Kage', 'Melee', 'Ryouta Kurogawa', 0, 0, 0, '', false, false],
      ['Kyoudai', 'Kurogawa', 'Kage', 'Farming', 'Takeru Kurogawa', 0, 0, 0, '', false, false],
      ['Kyoudai', 'Akuma', 'Wakagashira', 'Melee & Shooter', 'Mikey Ryou', 0, 188, 0, '', false, false],
      ['Kyoudai', 'Akuma', 'Wakashu', 'Melee & Shooter', 'Jin Mori', 0, 0, 0, '', false, false],
      ['Kyoudai', 'Akuma', 'Wakashu', 'Melee & Shooter', 'Joe Apollo', 0, 0, 0, '', false, false],
      ['Kyoudai', 'Akuma', 'Wakashu', 'Melee & Shooter', 'Kaizer DMC', 300, 0, 0, '', false, false],
      ['Kyoudai', 'Akuma', 'Wakashu', 'Melee & Shooter', 'Shin Nightingale', 0, 0, 0, '', false, false],
      ['Kyoudai', 'Arakawa', 'Kage', 'Shooter', 'Ash Lee Astrid ARK', 0, 0, 0, '', false, false],
      ['Kyoudai', 'Arakawa', 'Kage', 'Shooter', 'Ayra Astrid ARK', 0, 0, 0, '', false, false],
      ['Kyoudai', 'Arakawa', 'Kage', 'Shooter', 'Supreme Toman Astrid ARK', 0, 0, 0, '', false, false],
      ['Kyoudai', 'Kizuna', 'Kage', 'Farming', 'Dahlia Yasmin', 0, 0, 0, 'KIV', false, true],
      ['Kyoudai', 'Kizuna', 'Kage', 'Shooter', 'El Tiger', 0, 0, 0, '', false, false],
      ['Kyoudai', 'Kizuna', 'Kage', 'Farming', 'Gashima', 0, 0, 0, 'KIV', false, true],
      ['Kyoudai', 'Kizuna', 'Kage', 'Melee', 'Kisaragi Rize', 0, 0, 0, '', false, false],
      ['Kyoudai', 'Kizuna', 'Kage', 'Farming', 'Malik Nuh', 0, 269, 0, '', false, false],
      ['Kyoudai', 'Kizuna', 'Kage', 'Shooter', 'Rafiq Azlan', 0, 250, 0, '', false, false],
      ['Kyoudai', 'Kizuna', 'Kage', 'Farming', 'Ryu Yukimura', 0, 1255, 0, '', false, false],
      ['Kyoudai', 'Kizuna', 'Wakashu', 'Melee & Shooter', 'Tizzy Goh Anran', 0, 151, 0, '', false, false],
      ['Kyoudai', 'Shinigami', 'Kage', 'Shooter', 'Lao D. Shinigami', 0, 151, 0, '', false, false],
    ];
    return {
      version: 4,
      week: 43,
      quotas: { 'Shooter': 150, 'Melee': 250, 'Melee & Shooter': 100, 'Farming': 250 },
      members: rows.map((r, i) => ({
        id: uid(),
        order: i,
        hierarchy: r[0], family: r[1], cls: r[2], specialist: r[3], name: r[4],
        days: { mon: r[5], tue: r[6], wed: r[7] },
        carry: 0, due: 0, exempt: r[9], away: r[10] ? 'KIV' : '',
        discordName: KNOWN_DISCORD_NAMES[r[4]] || '',
      })),
      history: [],
    };
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---------- State ----------
  let state = load();
  let viewWeek = state.week;            // week being displayed
  let sort = { key: 'order', desc: false };
  let editingId = null;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return migrate(JSON.parse(raw));
    } catch (e) { /* fall through to sample */ }
    return sampleState();
  }
  // v1 had a manual Adv Submission and a separate Credit B/F; both become carry-forward.
  // v2 had free-text remarks and a KIV checkbox; v3 has auto remarks and away = '' | 'KIV' | 'Leave'.
  // v4 adds discordName.
  function migrate(s) {
    if (s.version === 4) return s;
    const fix = m => {
      if (m.carry == null) m.carry = (Number(m.credit) || 0) + (Number(m.adv) || 0);
      if (m.away == null) m.away = m.kiv ? 'KIV' : '';
      if (m.discordName == null) m.discordName = KNOWN_DISCORD_NAMES[m.name] || '';
      delete m.credit; delete m.adv; delete m.kiv; delete m.remarks;
    };
    s.members.forEach(fix);
    (s.history || []).forEach(h => h.members.forEach(fix));
    s.version = 4;
    return s;
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { alert('Could not save data in this browser: ' + e.message); }
  }

  const isCurrent = () => viewWeek === state.week;
  function viewedMembers() {
    if (isCurrent()) return state.members;
    const h = state.history.find(x => x.week === viewWeek);
    return h ? h.members : [];
  }
  function viewedQuotas() {
    if (isCurrent()) return state.quotas;
    const h = state.history.find(x => x.week === viewWeek);
    return (h && h.quotas) || state.quotas;
  }

  // ---------- Calculations ----------
  // given  = pcs handed in this week (Mon–Wed)
  // carry  = extra from earlier weeks, used automatically before this week's pcs
  // total  = what counts for this week (capped at the requirement)
  // adv    = anything above the requirement; pushed to next week on rollover
  // A member on KIV or Leave has no requirement that week, so their advance is kept whole.
  function calc(m, quotas, week) {
    const given = DAYS.reduce((s, d) => s + (Number(m.days[d.key]) || 0), 0);
    const carry = Number(m.carry) || 0;
    const quota = quotas[m.specialist];
    if (m.exempt || quota == null) {
      return { given, carry: 0, total: given, quota: null, required: 0, status: 'N/A', pending: null, adv: 0, advNote: '' };
    }
    const available = given + carry;
    if (m.away) {
      return { given, carry: 0, total: 0, quota, required: 0, status: m.away, pending: null, adv: available, advNote: advNote(available, quota, week) };
    }
    const required = quota + (Number(m.due) || 0);
    const adv = Math.max(0, available - required);
    return {
      given, carry, quota, required, adv,
      total: Math.min(available, required),
      status: available >= required ? 'Completed' : 'Pending',
      pending: Math.min(0, available - required),
      advNote: advNote(adv, quota, week),
    };
  }

  // Auto remark: how many future weeks the advance covers, e.g. "Adv 4 Week (WK44–WK47) +5pcs".
  function advNote(adv, quota, week) {
    if (!adv || !quota) return '';
    const full = Math.floor(adv / quota);
    const rest = adv - full * quota;
    if (!full) return `Adv ${rest}pcs (WK${week + 1})`;
    const range = full === 1 ? `WK${week + 1}` : `WK${week + 1}–WK${week + full}`;
    return `Adv ${full} Week (${range})${rest ? ` +${rest}pcs` : ''}`;
  }

  // ---------- Rendering ----------
  const $ = sel => document.querySelector(sel);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function render() {
    renderWeekSelect();
    renderFilters();
    renderTable();
    renderLegend();
    $('#readonlyNote').hidden = isCurrent();
    $('#readonlyNote').textContent = isCurrent() ? '' : `Viewing archived Week ${viewWeek} (read-only). Select Week ${state.week} to edit.`;
    $('#addBtn').disabled = !isCurrent();
    $('#newWeekBtn').disabled = !isCurrent();
  }

  function renderWeekSelect() {
    const weeks = [state.week, ...state.history.map(h => h.week)].sort((a, b) => b - a);
    $('#weekSelect').innerHTML = weeks.map(w =>
      `<option value="${w}" ${w === viewWeek ? 'selected' : ''}>Week ${w}${w === state.week ? ' (current)' : ''}</option>`).join('');
  }

  function fillSelect(sel, values, label) {
    const el = $(sel);
    const cur = el.value;
    el.innerHTML = `<option value="">${label}</option>` + values.map(v => `<option>${esc(v)}</option>`).join('');
    el.value = values.includes(cur) ? cur : '';
  }

  function uniq(arr) { return [...new Set(arr.filter(Boolean))].sort(); }

  function renderFilters() {
    const ms = viewedMembers();
    fillSelect('#filterFamily', uniq(ms.map(m => m.family)), 'All families');
    fillSelect('#filterSpecialist', uniq(ms.map(m => m.specialist)), 'All specialists');
  }

  function filtered() {
    const q = $('#search').value.trim().toLowerCase();
    const fam = $('#filterFamily').value;
    const spec = $('#filterSpecialist').value;
    const st = $('#filterStatus').value;
    const quotas = viewedQuotas();
    let list = viewedMembers().map(m => ({ m, c: calc(m, quotas, viewWeek) }));
    list = list.filter(({ m, c }) => {
      if (q && !m.name.toLowerCase().includes(q)) return false;
      if (fam && m.family !== fam) return false;
      if (spec && m.specialist !== spec) return false;
      if (st && c.status !== st) return false;
      return true;
    });
    const key = sort.key;
    const val = ({ m, c }) => {
      if (key === 'order') return m.order;
      if (key in c) return c[key] == null ? -Infinity : c[key];
      if (key in m.days) return m.days[key];
      return m[key];
    };
    list.sort((a, b) => {
      const x = val(a), y = val(b);
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.desc ? -r : r;
    });
    return list;
  }

  function numInput(id, field, value, disabled) {
    return `<input class="num" type="number" min="0" step="1" data-id="${id}" data-field="${field}" value="${value || 0}" ${disabled ? 'disabled' : ''}>`;
  }

  function renderTable() {
    const editable = isCurrent();
    const list = filtered();
    const quotas = viewedQuotas();
    const maxQuota = Math.max(1, ...Object.values(quotas));
    $('#dlClassAll').innerHTML = uniq([...CLASSES, ...state.members.map(x => x.cls)]).map(v => `<option value="${esc(v)}">`).join('');
    const rowsHtml = list.map(({ m, c }, i) => {
      const na = c.status === 'N/A';
      const dayCells = DAYS.map(d => `<td>${na && !m.days[d.key] && !editable ? '-' : numInput(m.id, 'day.' + d.key, m.days[d.key], !editable)}</td>`).join('');
      let pendingCell = '-';
      if (c.pending != null) {
        const w = Math.min(100, Math.round((-c.pending / maxQuota) * 100));
        pendingCell = `<div class="pending"><span class="val">${c.pending}</span><span class="bar">${w ? `<i style="width:${w}%"></i>` : ''}</span></div>`;
      }
      const statusCls = na ? 'NA' : c.status;
      const specs = ['-', ...Object.keys(quotas)];
      if (!specs.includes(m.specialist)) specs.push(m.specialist);
      const statusCell = editable && !na
        ? `<select class="status-sel ${statusCls}" data-id="${m.id}" data-field="away" title="Set KIV / Leave">
            <option value="" ${m.away ? '' : 'selected'}>${m.away ? 'Active' : c.status}</option>
            <option ${m.away === 'KIV' ? 'selected' : ''}>KIV</option>
            <option ${m.away === 'Leave' ? 'selected' : ''}>Leave</option>
          </select>`
        : `<span class="status ${statusCls}">${c.status}</span>`;
      return `<tr class="${m.away ? m.away.toLowerCase() : ''}">
        <td>${i + 1}</td>
        <td>${esc(m.hierarchy)}</td>
        <td>${esc(m.family)}</td>
        <td>${editable ? `<input class="txt cls" list="dlClassAll" data-id="${m.id}" data-field="cls" value="${esc(m.cls)}">` : esc(m.cls)}</td>
        <td>${editable ? `<select class="spec" data-id="${m.id}" data-field="specialist">${specs.map(v => `<option ${v === m.specialist ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>` : esc(m.specialist)}</td>
        <td class="name" title="${c.quota != null ? `Quota ${c.quota}/week` : 'No quota'}">${esc(m.name)}</td>
        ${dayCells}
        <td title="${c.carry ? `Includes ${Math.min(c.carry, c.required)} pcs from earlier advance` : ''}"><b>${na && !c.total ? '-' : c.total}</b>${c.carry ? ` <small class="from-adv">(adv ${Math.min(c.carry, c.required)})</small>` : ''}</td>
        <td>${statusCell}</td>
        <td>${pendingCell}</td>
        <td>${c.adv || ''}</td>
        <td>${na ? '' : numInput(m.id, 'due', m.due, !editable)}</td>
        <td class="adv-tag">${c.advNote}</td>
        <td class="noprint">${editable ? `<button class="btn small" data-edit="${m.id}">Edit</button>` : ''}</td>
      </tr>`;
    }).join('');
    $('#rows').innerHTML = rowsHtml || `<tr><td colspan="16" style="padding:20px;color:var(--muted)">No members match.</td></tr>`;

    // Totals (over the filtered list, like the sheet's filtered total)
    const sum = f => list.reduce((s, x) => s + f(x), 0);
    const dayTotals = DAYS.map(d => sum(({ m }) => Number(m.days[d.key]) || 0));
    const total = sum(({ c }) => c.total);
    const adv = sum(({ c }) => c.adv);
    const pend = sum(({ c }) => c.pending || 0);
    $('#foot').innerHTML = `
      <tr>
        <td colspan="6" style="text-align:right">Total</td>
        ${dayTotals.map(t => `<td>${t}</td>`).join('')}
        <td>${total}</td>
        <td></td>
        <td style="color:var(--warn)">${pend}</td>
        <td>${adv}</td>
        <td colspan="1" style="text-align:right">Sub Total</td>
        <td>${total + adv}</td>
        <td class="noprint"></td>
      </tr>
      <tr class="week"><td colspan="16">Week ${viewWeek}</td></tr>`;

    // Sort indicator
    document.querySelectorAll('#sheet thead th').forEach(th => {
      th.classList.toggle('sorted', th.dataset.sort === sort.key);
      th.classList.toggle('desc', th.dataset.sort === sort.key && sort.desc);
    });

    renderStats(viewedMembers().map(m => calc(m, viewedQuotas(), viewWeek)), viewedMembers());
  }

  function renderStats(calcs, members) {
    const active = calcs.filter((c, i) => c.status !== 'N/A' && !members[i].away);
    const done = active.filter(c => c.status === 'Completed').length;
    const pending = active.length - done;
    const total = calcs.reduce((s, c) => s + c.total, 0);
    const given = calcs.reduce((s, c) => s + c.given, 0);
    const adv = calcs.reduce((s, c) => s + c.adv, 0);
    const short = active.reduce((s, c) => s + (c.pending || 0), 0);
    const target = active.reduce((s, c) => s + c.required, 0);
    const pct = active.length ? Math.round((done / active.length) * 100) : 0;
    const kiv = members.filter(m => m.away === 'KIV').length;
    const leave = members.filter(m => m.away === 'Leave').length;
    $('#stats').innerHTML = `
      <div class="stat"><div class="k">Members with quota</div><div class="v">${active.length}</div></div>
      <div class="stat ok"><div class="k">Completed</div><div class="v">${done}</div>
        <div class="progress"><i style="width:${pct}%"></i></div></div>
      <div class="stat bad"><div class="k">Pending</div><div class="v">${pending}</div></div>
      <div class="stat"><div class="k">KIV / Leave</div><div class="v">${kiv} <small style="font-size:13px;color:var(--muted)">/ ${leave}</small></div></div>
      <div class="stat"><div class="k">Total submitted / target</div><div class="v">${total} <small style="font-size:13px;color:var(--muted)">/ ${target}</small></div></div>
      <div class="stat bad"><div class="k">Outstanding pcs</div><div class="v">${short}</div></div>
      <div class="stat"><div class="k">Pcs given this week</div><div class="v">${given}</div></div>
      <div class="stat"><div class="k">Advance to next week</div><div class="v">${adv}</div></div>`;
  }

  function renderLegend() {
    const stars = n => '*'.repeat(n + 1);
    $('#legend').innerHTML = Object.entries(viewedQuotas())
      .map(([k, v], i) => `<li>${stars(i)}${esc(k)} = ${v}pcs/Week</li>`).join('');
  }

  // ---------- Header sorting ----------
  const sortKeys = ['order', 'hierarchy', 'family', 'cls', 'specialist', 'name', 'mon', 'tue', 'wed', 'total', 'status', 'pending', 'adv', 'due', 'adv', ''];
  document.querySelectorAll('#sheet thead th').forEach((th, i) => {
    th.dataset.sort = sortKeys[i];
    if (!sortKeys[i]) return;
    th.addEventListener('click', () => {
      if (sort.key === sortKeys[i]) sort.desc = !sort.desc;
      else sort = { key: sortKeys[i], desc: false };
      renderTable();
    });
  });

  // ---------- Inline edits ----------
  $('#rows').addEventListener('change', e => {
    const el = e.target;
    const id = el.dataset.id;
    if (!id || !isCurrent()) return;
    const m = state.members.find(x => x.id === id);
    if (!m) return;
    const f = el.dataset.field;
    if (f === 'away' || f === 'cls' || f === 'specialist') m[f] = el.value.trim();
    else {
      const v = Math.max(0, Math.floor(Number(el.value) || 0));
      if (f.startsWith('day.')) m.days[f.slice(4)] = v;
      else m[f] = v;
    }
    save();
    renderTable();
  });
  $('#rows').addEventListener('focusin', e => { if (e.target.classList.contains('num')) e.target.select(); });
  $('#rows').addEventListener('click', e => {
    const id = e.target.dataset.edit;
    if (id) openMember(id);
  });

  // ---------- Filters ----------
  ['#search', '#filterFamily', '#filterSpecialist', '#filterStatus'].forEach(s =>
    $(s).addEventListener('input', renderTable));
  $('#weekSelect').addEventListener('change', e => { viewWeek = Number(e.target.value); render(); });

  // ---------- Member dialog ----------
  const memberDlg = $('#memberDlg');
  function openMember(id) {
    editingId = id;
    const m = id ? state.members.find(x => x.id === id) : null;
    const f = $('#memberForm');
    $('#memberDlgTitle').textContent = m ? 'Edit member' : 'Add member';
    $('#deleteMemberBtn').hidden = !m;
    const specs = ['-', ...Object.keys(state.quotas)];
    if (m && !specs.includes(m.specialist)) specs.push(m.specialist);
    $('#specialistSelect').innerHTML = specs.map(s => `<option>${esc(s)}</option>`).join('');
    const opts = k => uniq(state.members.map(x => x[k])).map(v => `<option value="${esc(v)}">`).join('');
    $('#dlHierarchy').innerHTML = opts('hierarchy');
    $('#dlFamily').innerHTML = opts('family');
    $('#dlClass').innerHTML = uniq([...CLASSES, ...state.members.map(x => x.cls)]).map(v => `<option value="${esc(v)}">`).join('');
    f.name.value = m ? m.name : '';
    f.hierarchy.value = m ? m.hierarchy : 'Kyoudai';
    f.family.value = m ? m.family : '';
    f.cls.value = m ? m.cls : 'Kage';
    f.specialist.value = m ? m.specialist : Object.keys(state.quotas)[0] || '-';
    f.exempt.checked = m ? m.exempt : false;
    f.away.value = m ? (m.away || '') : '';
    f.discordId.value = m ? (m.discordId || '') : '';
    f.discordName.value = m ? (m.discordName || '') : '';
    f.discordName.placeholder = `${settings().prefix}${m ? m.name : 'Name'}`;
    memberDlg.showModal();
  }
  memberDlg.addEventListener('close', () => {
    if (memberDlg.returnValue !== 'ok') return;
    const f = $('#memberForm');
    const data = {
      name: f.name.value.trim(), hierarchy: f.hierarchy.value.trim(), family: f.family.value.trim(),
      cls: f.cls.value.trim(), specialist: f.specialist.value,
      exempt: f.exempt.checked, away: f.away.value, discordId: f.discordId.value.replace(/\D/g, ''),
      discordName: f.discordName.value.trim(),
    };
    if (!data.name) return;
    if (editingId) Object.assign(state.members.find(x => x.id === editingId), data);
    else state.members.push({
      id: uid(), order: Math.max(-1, ...state.members.map(x => x.order)) + 1,
      days: Object.fromEntries(DAYS.map(d => [d.key, 0])), carry: 0, due: 0, ...data,
    });
    save(); render();
  });
  $('#deleteMemberBtn').addEventListener('click', () => {
    const m = state.members.find(x => x.id === editingId);
    if (m && confirm(`Delete ${m.name}? This cannot be undone.`)) {
      state.members = state.members.filter(x => x.id !== editingId);
      memberDlg.close('cancel');
      save(); render();
    }
  });
  $('#addBtn').addEventListener('click', () => openMember(null));

  // ---------- Quota dialog ----------
  const quotaDlg = $('#quotaDlg');
  function quotaRow(name, val) {
    const d = document.createElement('div');
    d.className = 'quota-row';
    d.innerHTML = `<input class="qn" value="${esc(name)}" placeholder="Specialist"><input class="qv" type="number" min="0" value="${val}"><button type="button" class="btn small danger">✕</button>`;
    d.querySelector('button').onclick = () => d.remove();
    return d;
  }
  $('#quotaBtn').addEventListener('click', () => {
    const list = $('#quotaList');
    list.innerHTML = '';
    Object.entries(state.quotas).forEach(([k, v]) => list.appendChild(quotaRow(k, v)));
    quotaDlg.showModal();
  });
  $('#addQuotaBtn').addEventListener('click', () => $('#quotaList').appendChild(quotaRow('', 0)));
  quotaDlg.addEventListener('close', () => {
    if (quotaDlg.returnValue !== 'ok') return;
    const q = {};
    document.querySelectorAll('#quotaList .quota-row').forEach(r => {
      const n = r.querySelector('.qn').value.trim();
      if (n) q[n] = Math.max(0, Number(r.querySelector('.qv').value) || 0);
    });
    state.quotas = q;
    save(); render();
  });

  // ---------- New week ----------
  const weekDlg = $('#weekDlg');
  $('#newWeekBtn').addEventListener('click', () => {
    $('#weekDlgText').textContent = `Close Week ${state.week} and start Week ${state.week + 1}.`;
    weekDlg.showModal();
  });
  weekDlg.addEventListener('close', () => {
    if (weekDlg.returnValue !== 'ok') return;
    state.history = state.history.filter(h => h.week !== state.week);
    state.history.push({ week: state.week, quotas: { ...state.quotas }, members: JSON.parse(JSON.stringify(state.members)) });
    state.members.forEach(m => {
      const c = calc(m, state.quotas, state.week);
      const carryDue = c.status === 'Pending' ? -c.pending : 0;
      m.carry = c.adv;
      m.due = carryDue;
      DAYS.forEach(d => { m.days[d.key] = 0; });
    });
    state.week += 1;
    viewWeek = state.week;
    save(); render();
  });

  // ---------- Discord ----------
  // The message follows the family's usual reminder text. It can be copied and pasted
  // into Discord by hand, or (optionally) posted through a webhook.
  const discordDlg = $('#discordDlg');
  const DISCORD_DEFAULTS = { webhook: '', title: 'HOKAI FAMILY BUSINESS', greet: '@NAKAMA @HYOUKA', prefix: 'HK | ' };
  const settings = () => (state.settings = { ...DISCORD_DEFAULTS, ...(state.settings || {}) });

  function pendingMembers() {
    return viewedMembers()
      .map(m => ({ m, c: calc(m, viewedQuotas(), viewWeek) }))
      .filter(({ c }) => c.status === 'Pending');
  }

  // Day 1 = Monday … Day 3 = Wednesday (final day). Other days default to the final day.
  function defaultDay() {
    const d = new Date().getDay();   // 0 Sun, 1 Mon …
    return d >= 1 && d <= DAYS.length ? d : DAYS.length;
  }

  // <@id> turns into a real mention once sent from Discord; without an ID only the name is written.
  const discordName = m => m.discordName || `${settings().prefix}${m.name}`;
  const mention = m => (m.discordId ? `<@${m.discordId}>` : `@${discordName(m)}`);

  function buildDiscordMessage(day) {
    const st = settings();
    const dayLabel = day >= DAYS.length ? `Day${day} - Final Day` : `Day${day}`;
    const deadline = DAYS[DAYS.length - 1].label;
    const tags = pendingMembers().map(({ m }) => mention(m)).join(' ');
    return [
      `⛩️ ${st.title} - WK${viewWeek} (${dayLabel}) ⛩️`,
      '',
      `Dear ${st.greet} ,`,
      '',
      `Regarding the Blood Ring submission status, please ensure your submission is completed by 11:59 PM (${deadline}) at the latest.`,
      '',
      "Kindly inform us if you face any difficulties nor issues or need more time completing this week's task. Any pending submissions will be carried forward to the following week.",
      '',
      tags || 'All submissions are completed. Thank you!',
    ].join('\n');
  }

  function refreshDiscordPreview() {
    const f = $('#discordForm');
    const st = settings();
    st.title = f.title.value.trim() || DISCORD_DEFAULTS.title;
    st.greet = f.greet.value.trim();
    st.prefix = f.prefix.value;
    save();
    $('#discordPreview').value = buildDiscordMessage(Number(f.day.value));
  }

  function openDiscord() {
    const f = $('#discordForm');
    const st = settings();
    f.webhook.value = st.webhook;
    f.title.value = st.title;
    f.greet.value = st.greet;
    f.prefix.value = st.prefix;
    f.day.innerHTML = DAYS.map((d, i) => `<option value="${i + 1}">Day${i + 1}${i === DAYS.length - 1 ? ' - Final Day' : ''} (${d.label})</option>`).join('');
    f.day.value = String(defaultDay());
    const missing = pendingMembers().filter(({ m }) => !m.discordId).map(({ m }) => m.name);
    $('#discordMissing').hidden = !missing.length;
    $('#discordMissing').textContent = missing.length
      ? `No Discord User ID yet, so these will show as plain text and NOT ping: ${missing.join(', ')}. Add it via Edit → Discord User ID.` : '';
    $('#discordStatus').textContent = '';
    refreshDiscordPreview();
    discordDlg.showModal();
  }

  async function copyDiscord() {
    const ta = $('#discordPreview');
    try {
      await navigator.clipboard.writeText(ta.value);
    } catch (e) {
      ta.select();
      document.execCommand('copy');
    }
    $('#discordStatus').textContent = '✅ Copied! Paste it in Discord (Ctrl+V) and send.';
  }

  // Splits on line breaks so each piece stays under Discord's limit.
  function chunk(text) {
    const out = [];
    let cur = '';
    text.split('\n').forEach(line => {
      const words = line.length > DISCORD_LIMIT ? line.split(' ') : [line];
      words.forEach((w, i) => {
        const sep = cur === '' ? '' : (i === 0 ? '\n' : ' ');
        if ((cur + sep + w).length > DISCORD_LIMIT) { out.push(cur); cur = w; }
        else cur += sep + w;
      });
    });
    if (cur) out.push(cur);
    return out;
  }

  async function sendDiscord() {
    const f = $('#discordForm');
    const url = f.webhook.value.trim();
    if (!DISCORD_WEBHOOK_RE.test(url)) {
      $('#discordStatus').textContent = 'Please paste a valid Discord webhook URL (or just use Copy message).';
      return;
    }
    settings().webhook = url;
    save();
    const text = $('#discordPreview').value;
    const users = [...new Set([...text.matchAll(/<@!?(\d+)>/g)].map(x => x[1]))].slice(0, 100);
    const roles = [...new Set([...text.matchAll(/<@&(\d+)>/g)].map(x => x[1]))].slice(0, 100);
    const btn = $('#discordSendBtn');
    btn.disabled = true;
    $('#discordStatus').textContent = 'Sending…';
    try {
      for (const content of chunk(text)) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // only ping the users/roles written in the message, never @everyone/@here
          body: JSON.stringify({ content, allowed_mentions: { parse: [], users, roles } }),
        });
        if (!res.ok) throw new Error(`Discord replied ${res.status} ${await res.text()}`);
      }
      $('#discordStatus').textContent = '✅ Sent to Discord.';
    } catch (err) {
      $('#discordStatus').textContent = '❌ Failed: ' + err.message;
    } finally {
      btn.disabled = false;
    }
  }

  $('#discordBtn').addEventListener('click', openDiscord);
  $('#discordCopyBtn').addEventListener('click', copyDiscord);
  $('#discordSendBtn').addEventListener('click', sendDiscord);
  $('#discordCancelBtn').addEventListener('click', () => discordDlg.close());
  ['title', 'greet', 'prefix', 'day'].forEach(n => $('#discordForm')[n].addEventListener('input', refreshDiscordPreview));

  // ---------- More menu ----------
  const menu = $('#moreMenu');
  $('#moreBtn').addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; });
  document.addEventListener('click', () => { menu.hidden = true; });
  menu.addEventListener('click', e => {
    const act = e.target.dataset.act;
    if (act === 'csv') exportCsv();
    if (act === 'backup') download(`bdrb-backup-week${state.week}.json`, JSON.stringify(state, null, 2), 'application/json');
    if (act === 'restore') $('#restoreFile').click();
    if (act === 'print') window.print();
    if (act === 'reset' && confirm('Replace ALL data (including history) with the Week 43 sample?')) {
      state = sampleState(); viewWeek = state.week; save(); render();
    }
  });
  $('#restoreFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.members) || typeof data.week !== 'number') throw new Error('Not a valid backup file');
      state = migrate({ history: [], quotas: {}, ...data });
      viewWeek = state.week;
      save(); render();
    } catch (err) { alert('Restore failed: ' + err.message); }
    e.target.value = '';
  });

  function exportCsv() {
    const quotas = viewedQuotas();
    const head = ['No', 'Hierarchy', 'Family', 'Class', 'Specialist', 'Namelist', ...DAYS.map(d => d.label),
      'Total submission', 'Status', 'Pending Qty', 'Adv Submission', 'Due Submission', 'Remarks'];
    const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const lines = [head.map(q).join(',')];
    filtered().forEach(({ m, c }, i) => {
      lines.push([i + 1, m.hierarchy, m.family, m.cls, m.specialist, m.name, ...DAYS.map(d => m.days[d.key]),
        c.total, c.status, c.pending == null ? '-' : c.pending, c.adv, m.due, c.advNote]
        .map(q).join(','));
    });
    download(`blood-diamond-week${viewWeek}.csv`, lines.join('\r\n'), 'text/csv');
  }

  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  render();
})();
