/* Blood Diamond Ring Business – weekly submission tracker.
 * Everything is stored in the browser (localStorage). Use "Download backup"
 * to move data between devices. */
(function () {
  'use strict';

  const STORAGE_KEY = 'bdrb-state-v1';
  const DAYS = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
  ];

  // ---------- Sample data (Week 43 sheet) ----------
  function sampleState() {
    const rows = [
      // hierarchy, family, class, specialist, name, mon, tue, wed, adv, remarks, exempt, kiv
      ['Oyabun', 'Nakamura', 'Kumicho', '-', 'Don Nakamura', 0, 0, 0, 0, '', true, false],
      ['Aneki', 'Kizuna', 'Oka-San', 'Melee', 'Leia Yuki', 0, 0, 0, 0, '', true, false],
      ['Aniki', 'Kizuna', 'Kigyo-Shatei', 'Melee', 'Ragna Silver', 0, 0, 0, 0, '', true, false],
      ['Aniki', 'Kizuna', 'Kigyo-Shatei', 'Melee', 'Nick Leon', 0, 250, 0, 0, '', false, false],
      ['Aniki', 'Kizuna', 'Wakagashira', 'Melee & Shooter', 'Ajol Rentaka', 0, 100, 0, 50, 'Adv - WK44', false, false],
      ['Aniki', 'Kizuna', 'Jun-Kouseiin', 'Melee', 'Ezzy Tezu', 250, 0, 0, 250, 'Adv - WK44', false, false],
      ['Onee-San', 'Kurogawa', 'Kage', 'Melee', 'Reyna Kurogawa', 0, 250, 0, 16, 'Adv - WK44', false, false],
      ['Kyoudai', 'Kurogawa', 'Kage', 'Melee', 'Ryouta Kurogawa', 0, 0, 0, 0, '', false, false],
      ['Kyoudai', 'Kurogawa', 'Kage', 'Farming', 'Takeru Kurogawa', 0, 0, 0, 0, '', false, false],
      ['Kyoudai', 'Akuma', 'Wakagashira', 'Melee & Shooter', 'Mikey Ryou', 0, 100, 0, 88, '', false, false],
      ['Kyoudai', 'Akuma', 'Wakashu', 'Melee & Shooter', 'Jin Mori', 0, 0, 0, 0, '', false, false],
      ['Kyoudai', 'Akuma', 'Wakashu', 'Melee & Shooter', 'Joe Apollo', 0, 0, 0, 0, '', false, false],
      ['Kyoudai', 'Akuma', 'Wakashu', 'Melee & Shooter', 'Kaizer DMC', 100, 0, 0, 200, 'Adv - WK45', false, false],
      ['Kyoudai', 'Akuma', 'Wakashu', 'Melee & Shooter', 'Shin Nightingale', 0, 0, 0, 0, '', false, false],
      ['Kyoudai', 'Arakawa', 'Kage', 'Shooter', 'Ash Lee Astrid ARK', 0, 0, 0, 0, '', false, false],
      ['Kyoudai', 'Arakawa', 'Kage', 'Shooter', 'Ayra Astrid ARK', 0, 0, 0, 0, '', false, false],
      ['Kyoudai', 'Arakawa', 'Kage', 'Shooter', 'Supreme Toman Astrid ARK', 0, 0, 0, 0, '', false, false],
      ['Kyoudai', 'Kizuna', 'Kage', 'Farming', 'Dahlia Yasmin', 0, 0, 0, 0, 'KIV', false, true],
      ['Kyoudai', 'Kizuna', 'Kage', 'Shooter', 'El Tiger', 0, 0, 0, 0, '', false, false],
      ['Kyoudai', 'Kizuna', 'Kage', 'Farming', 'Gashima', 0, 0, 0, 0, 'KIV', false, true],
      ['Kyoudai', 'Kizuna', 'Kage', 'Melee', 'Kisaragi Rize', 0, 0, 0, 0, '', false, false],
      ['Kyoudai', 'Kizuna', 'Kage', 'Farming', 'Malik Nuh', 0, 250, 0, 19, 'Adv - WK44', false, false],
      ['Kyoudai', 'Kizuna', 'Kage', 'Shooter', 'Rafiq Azlan', 0, 150, 0, 100, 'Adv - WK44', false, false],
      ['Kyoudai', 'Kizuna', 'Kage', 'Farming', 'Ryu Yukimura', 0, 250, 0, 1005, 'Adv - WK47', false, false],
      ['Kyoudai', 'Kizuna', 'Wakashu', 'Melee & Shooter', 'Tizzy Goh Anran', 0, 100, 0, 51, 'Adv - WK44', false, false],
      ['Kyoudai', 'Shinigami', 'Kage', 'Shooter', 'Lao D. Shinigami', 0, 150, 0, 1, 'Adv - WK44', false, false],
    ];
    return {
      week: 43,
      quotas: { 'Shooter': 150, 'Melee': 250, 'Melee & Shooter': 100, 'Farming': 250 },
      members: rows.map((r, i) => ({
        id: uid(),
        order: i,
        hierarchy: r[0], family: r[1], cls: r[2], specialist: r[3], name: r[4],
        days: { mon: r[5], tue: r[6], wed: r[7] },
        adv: r[8], credit: 0, due: 0, remarks: r[9], exempt: r[10], kiv: r[11],
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
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through to sample */ }
    return sampleState();
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
  function calc(m, quotas) {
    const total = DAYS.reduce((s, d) => s + (Number(m.days[d.key]) || 0), 0);
    const quota = quotas[m.specialist];
    if (m.exempt || quota == null) {
      return { total, quota: null, required: 0, status: 'N/A', pending: null, leftover: total + (m.credit || 0) + (m.adv || 0) };
    }
    const required = quota + (Number(m.due) || 0);
    const covered = total + (Number(m.credit) || 0);
    const status = covered >= required ? 'Completed' : 'Pending';
    return {
      total, quota, required, status,
      pending: Math.min(0, covered - required),
      leftover: Math.max(0, covered - required) + (Number(m.adv) || 0),
    };
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
    let list = viewedMembers().map(m => ({ m, c: calc(m, quotas) }));
    list = list.filter(({ m, c }) => {
      if (q && !m.name.toLowerCase().includes(q)) return false;
      if (fam && m.family !== fam) return false;
      if (spec && m.specialist !== spec) return false;
      if (st === 'KIV' && !m.kiv) return false;
      if (st && st !== 'KIV' && c.status !== st) return false;
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
    const maxQuota = Math.max(1, ...Object.values(viewedQuotas()));
    const rowsHtml = list.map(({ m, c }, i) => {
      const na = c.status === 'N/A';
      const dayCells = DAYS.map(d => `<td>${na && !m.days[d.key] && !editable ? '-' : numInput(m.id, 'day.' + d.key, m.days[d.key], !editable)}</td>`).join('');
      let pendingCell = '-';
      if (!na) {
        const w = Math.min(100, Math.round((-c.pending / maxQuota) * 100));
        pendingCell = `<div class="pending"><span class="val">${c.pending}</span><span class="bar">${w ? `<i style="width:${w}%"></i>` : ''}</span></div>`;
      }
      const statusCls = na ? 'NA' : c.status;
      return `<tr class="${m.kiv ? 'kiv' : ''}">
        <td>${i + 1}</td>
        <td>${esc(m.hierarchy)}</td>
        <td>${esc(m.family)}</td>
        <td>${esc(m.cls)}</td>
        <td>${esc(m.specialist)}</td>
        <td class="name" title="${c.quota != null ? `Quota ${c.quota}/week` : 'No quota'}">${esc(m.name)}</td>
        ${dayCells}
        <td><b>${na && !c.total ? '-' : c.total}</b></td>
        <td><span class="status ${statusCls}">${c.status}</span></td>
        <td>${pendingCell}</td>
        <td>${m.credit ? m.credit : ''}</td>
        <td>${numInput(m.id, 'adv', m.adv, !editable)}</td>
        <td>${na ? '' : numInput(m.id, 'due', m.due, !editable)}</td>
        <td><input class="txt" data-id="${m.id}" data-field="remarks" value="${esc(m.remarks)}" ${editable ? '' : 'disabled'}></td>
        <td class="noprint">${editable ? `<button class="btn small" data-edit="${m.id}">Edit</button>` : ''}</td>
      </tr>`;
    }).join('');
    $('#rows').innerHTML = rowsHtml || `<tr><td colspan="17" style="padding:20px;color:var(--muted)">No members match.</td></tr>`;

    // Totals (over the filtered list, like the sheet's filtered total)
    const sum = f => list.reduce((s, x) => s + f(x), 0);
    const dayTotals = DAYS.map(d => sum(({ m }) => Number(m.days[d.key]) || 0));
    const total = sum(({ c }) => c.total);
    const adv = sum(({ m }) => Number(m.adv) || 0);
    const pend = sum(({ c }) => c.pending || 0);
    $('#foot').innerHTML = `
      <tr>
        <td colspan="6" style="text-align:right">Total</td>
        ${dayTotals.map(t => `<td>${t}</td>`).join('')}
        <td>${total}</td>
        <td></td>
        <td style="color:var(--warn)">${pend}</td>
        <td></td>
        <td>${adv}</td>
        <td colspan="1" style="text-align:right">Sub Total</td>
        <td>${total + adv}</td>
        <td class="noprint"></td>
      </tr>
      <tr class="week"><td colspan="17">Week ${viewWeek}</td></tr>`;

    // Sort indicator
    document.querySelectorAll('#sheet thead th').forEach(th => {
      th.classList.toggle('sorted', th.dataset.sort === sort.key);
      th.classList.toggle('desc', th.dataset.sort === sort.key && sort.desc);
    });

    renderStats(viewedMembers().map(m => calc(m, viewedQuotas())), viewedMembers());
  }

  function renderStats(calcs, members) {
    const active = calcs.filter((c, i) => c.status !== 'N/A' && !members[i].kiv);
    const done = active.filter(c => c.status === 'Completed').length;
    const pending = active.length - done;
    const total = calcs.reduce((s, c) => s + c.total, 0);
    const adv = members.reduce((s, m) => s + (Number(m.adv) || 0), 0);
    const short = active.reduce((s, c) => s + (c.pending || 0), 0);
    const target = active.reduce((s, c) => s + c.required, 0);
    const pct = active.length ? Math.round((done / active.length) * 100) : 0;
    const kiv = members.filter(m => m.kiv).length;
    $('#stats').innerHTML = `
      <div class="stat"><div class="k">Members with quota</div><div class="v">${active.length}</div></div>
      <div class="stat ok"><div class="k">Completed</div><div class="v">${done}</div>
        <div class="progress"><i style="width:${pct}%"></i></div></div>
      <div class="stat bad"><div class="k">Pending</div><div class="v">${pending}</div></div>
      <div class="stat"><div class="k">KIV</div><div class="v">${kiv}</div></div>
      <div class="stat"><div class="k">Total submitted / target</div><div class="v">${total} <small style="font-size:13px;color:var(--muted)">/ ${target}</small></div></div>
      <div class="stat bad"><div class="k">Outstanding pcs</div><div class="v">${short}</div></div>
      <div class="stat"><div class="k">Sub total (incl. advance)</div><div class="v">${total + adv}</div></div>`;
  }

  function renderLegend() {
    const stars = n => '*'.repeat(n + 1);
    $('#legend').innerHTML = Object.entries(viewedQuotas())
      .map(([k, v], i) => `<li>${stars(i)}${esc(k)} = ${v}pcs/Week</li>`).join('');
  }

  // ---------- Header sorting ----------
  const sortKeys = ['order', 'hierarchy', 'family', 'cls', 'specialist', 'name', 'mon', 'tue', 'wed', 'total', 'status', 'pending', 'credit', 'adv', 'due', 'remarks', ''];
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
    if (f === 'remarks') m.remarks = el.value;
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
    $('#dlClass').innerHTML = opts('cls');
    f.name.value = m ? m.name : '';
    f.hierarchy.value = m ? m.hierarchy : 'Kyoudai';
    f.family.value = m ? m.family : '';
    f.cls.value = m ? m.cls : 'Kage';
    f.specialist.value = m ? m.specialist : Object.keys(state.quotas)[0] || '-';
    f.remarks.value = m ? m.remarks : '';
    f.exempt.checked = m ? m.exempt : false;
    f.kiv.checked = m ? m.kiv : false;
    memberDlg.showModal();
  }
  memberDlg.addEventListener('close', () => {
    if (memberDlg.returnValue !== 'ok') return;
    const f = $('#memberForm');
    const data = {
      name: f.name.value.trim(), hierarchy: f.hierarchy.value.trim(), family: f.family.value.trim(),
      cls: f.cls.value.trim(), specialist: f.specialist.value, remarks: f.remarks.value,
      exempt: f.exempt.checked, kiv: f.kiv.checked,
    };
    if (!data.name) return;
    if (editingId) Object.assign(state.members.find(x => x.id === editingId), data);
    else state.members.push({
      id: uid(), order: Math.max(-1, ...state.members.map(x => x.order)) + 1,
      days: Object.fromEntries(DAYS.map(d => [d.key, 0])), adv: 0, credit: 0, due: 0, ...data,
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
      const c = calc(m, state.quotas);
      const carryDue = c.status === 'Pending' && !m.kiv ? -c.pending : 0;
      m.credit = c.status === 'N/A' ? 0 : c.leftover;
      m.due = carryDue;
      m.adv = 0;
      DAYS.forEach(d => { m.days[d.key] = 0; });
      if (/^Adv\b/i.test(m.remarks || '')) m.remarks = '';
    });
    state.week += 1;
    viewWeek = state.week;
    save(); render();
  });

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
      state = { history: [], quotas: {}, ...data };
      viewWeek = state.week;
      save(); render();
    } catch (err) { alert('Restore failed: ' + err.message); }
    e.target.value = '';
  });

  function exportCsv() {
    const quotas = viewedQuotas();
    const head = ['No', 'Hierarchy', 'Family', 'Class', 'Specialist', 'Namelist', ...DAYS.map(d => d.label),
      'Total submission', 'Status', 'Pending Qty', 'Credit B/F', 'Adv Submission', 'Due Submission', 'Remarks', 'KIV'];
    const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const lines = [head.map(q).join(',')];
    filtered().forEach(({ m, c }, i) => {
      lines.push([i + 1, m.hierarchy, m.family, m.cls, m.specialist, m.name, ...DAYS.map(d => m.days[d.key]),
        c.total, c.status, c.pending == null ? '-' : c.pending, m.credit, m.adv, m.due, m.remarks, m.kiv ? 'Yes' : '']
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
