// matches.js — loads and filters match data from Supabase
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof sb === 'undefined') { renderDemoMatches(); return; }

  let allMatches = [];

  async function loadMatches() {
    document.getElementById('matches-list').innerHTML = '<div class="spinner"></div>';
    const { data, error } = await sb
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false });

    if (error) { showToast('Could not load matches: ' + error.message, 'error'); renderDemoMatches(); return; }
    allMatches = data || [];
    renderMatches(allMatches);
  }

  function renderMatches(matches) {
    const list = document.getElementById('matches-list');
    if (!matches.length) {
      list.innerHTML = `<div class="empty-state"><div class="es-icon">📋</div><h3>No Matches Found</h3><p>Check back soon or adjust your filters.</p></div>`;
      return;
    }
    list.innerHTML = matches.map(m => matchCardHTML(m)).join('');
  }

  function matchCardHTML(m) {
    const date     = m.match_date ? new Date(m.match_date) : null;
    const timeStr  = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD';
    const dateStr  = date ? date.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
    const isLive   = m.status === 'live';
    const isDone   = m.status === 'completed' || m.status === 'forfeit';
    const winA     = isDone && m.score_a > m.score_b;
    const winB     = isDone && m.score_b > m.score_a;
    const scoreDisp = isDone ? `${m.score_a}–${m.score_b}` : (isLive ? `${m.score_a}–${m.score_b}` : 'VS');
    const scoreClass = isDone ? 'final' : (isLive ? 'live' : '');

    return `
      <div class="match-card ${isLive ? 'is-live' : ''} ${isDone ? 'is-completed' : ''}">
        <div class="mc-meta">
          ${isLive ? '<span class="badge badge-live">● LIVE</span>' : ''}
          <div class="mc-time">${timeStr} EST</div>
          <div class="mc-date">${dateStr}</div>
        </div>
        <div class="mc-team">
          <div class="mc-team-name ${winA ? 'winner' : ''}">${m.team_a}</div>
          <div class="mc-team-sub">${m.tier || ''}</div>
        </div>
        <div class="mc-center">
          <div class="mc-score ${scoreClass}">${scoreDisp}</div>
          ${!isDone && !isLive ? '<div class="mc-vs">VS</div>' : ''}
          ${m.stream_url ? `<a href="${m.stream_url}" target="_blank" class="mc-stream">▶ Watch</a>` : ''}
        </div>
        <div class="mc-team right">
          <div class="mc-team-name ${winB ? 'winner' : ''}">${m.team_b}</div>
          <div class="mc-team-sub">${m.game_mode || ''}</div>
        </div>
        <div class="mc-info">
          <div class="mc-tier">${m.tier || ''}</div>
          <div class="mc-mode">${m.game_mode || ''}${m.map_name ? ' · ' + m.map_name : ''}</div>
          <div class="mc-mode">${m.status === 'forfeit' ? '⚠ Forfeit' : ''}</div>
        </div>
      </div>`;
  }

  // Tab filters
  let activeTab = 'all';
  document.querySelectorAll('.ms-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ms-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.filter;
      applyFilters();
    });
  });

  // Tier filter
  let activeTier = 'all';
  document.querySelectorAll('.tier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTier = btn.dataset.tier;
      applyFilters();
    });
  });

  function applyFilters() {
    let filtered = [...allMatches];
    if (activeTab !== 'all') filtered = filtered.filter(m => m.status === activeTab);
    if (activeTier !== 'all') filtered = filtered.filter(m => (m.tier || '').toLowerCase() === activeTier.toLowerCase());
    renderMatches(filtered);
  }

  await loadMatches();

  // Admin: add match button
  const addMatchForm = document.getElementById('add-match-form');
  if (addMatchForm) {
    addMatchForm.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(addMatchForm);
      const payload = {
        team_a:     fd.get('team_a'),
        team_b:     fd.get('team_b'),
        tier:       fd.get('tier'),
        game_mode:  fd.get('game_mode'),
        map_name:   fd.get('map_name'),
        match_date: fd.get('match_date') || null,
        status:     fd.get('status') || 'upcoming',
        stream_url: fd.get('stream_url') || null,
      };
      const { error } = await sb.from('matches').insert([payload]);
      if (error) { showToast(error.message, 'error'); return; }
      showToast('Match added!', 'success');
      closeModal('add-match-modal');
      addMatchForm.reset();
      await loadMatches();
    });
  }
});

function renderDemoMatches() {
  const list = document.getElementById('matches-list');
  if (!list) return;
  const demos = [
    { team_a:'Phantom Squad', team_b:'Black Flag',      score_a:3, score_b:1, tier:'Prestige',   game_mode:'Hardpoint', map_name:'Raid',     status:'completed', match_date: new Date(Date.now()-86400000*2).toISOString() },
    { team_a:'Iron Ghost',    team_b:'Venom Unit',      score_a:0, score_b:0, tier:'Prestige',   game_mode:'S&D',       map_name:'Standoff', status:'live',      match_date: new Date().toISOString() },
    { team_a:'Crimson War',   team_b:'Eclipse Squad',   score_a:0, score_b:0, tier:'Elite',      game_mode:'CTF',       map_name:'Slums',    status:'upcoming',  match_date: new Date(Date.now()+86400000).toISOString() },
    { team_a:'Night Owls',    team_b:'Recon Force',     score_a:0, score_b:0, tier:'Challenger', game_mode:'Hardpoint', map_name:'Express',  status:'upcoming',  match_date: new Date(Date.now()+86400000*2).toISOString() },
    { team_a:'Apex Unit',     team_b:'Dark Horizon',    score_a:1, score_b:0, tier:'Contender',  game_mode:'S&D',       map_name:'Hijacked', status:'completed', match_date: new Date(Date.now()-86400000*3).toISOString() },
    { team_a:'Cold Steel',    team_b:'Shadow Protocol', score_a:0, score_b:0, tier:'Elite',      game_mode:'Hardpoint', map_name:'Turbine',  status:'upcoming',  match_date: new Date(Date.now()+86400000*3).toISOString() },
  ];
  list.innerHTML = demos.map(m => {
    const date    = new Date(m.match_date);
    const timeStr = date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    const dateStr = date.toLocaleDateString([], { month:'short', day:'numeric' });
    const isLive  = m.status === 'live';
    const isDone  = m.status === 'completed';
    const winA    = isDone && m.score_a > m.score_b;
    const winB    = isDone && m.score_b > m.score_a;
    const score   = isDone || isLive ? `${m.score_a}–${m.score_b}` : 'VS';
    return `
      <div class="match-card ${isLive?'is-live':''} ${isDone?'is-completed':''}">
        <div class="mc-meta">
          ${isLive ? '<span class="badge badge-live">● LIVE</span>' : ''}
          <div class="mc-time">${timeStr} EST</div>
          <div class="mc-date">${dateStr}</div>
        </div>
        <div class="mc-team">
          <div class="mc-team-name ${winA?'winner':''}">${m.team_a}</div>
          <div class="mc-team-sub">${m.tier}</div>
        </div>
        <div class="mc-center">
          <div class="mc-score ${isDone?'final':isLive?'live':''}">${score}</div>
          ${!isDone&&!isLive?'<div class="mc-vs">VS</div>':''}
        </div>
        <div class="mc-team right">
          <div class="mc-team-name ${winB?'winner':''}">${m.team_b}</div>
          <div class="mc-team-sub">${m.game_mode}</div>
        </div>
        <div class="mc-info">
          <div class="mc-tier">${m.tier}</div>
          <div class="mc-mode">${m.game_mode} · ${m.map_name}</div>
        </div>
      </div>`;
  }).join('');
}
