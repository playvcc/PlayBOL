// leaderboard.js
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof sb === 'undefined') { renderDemoLB(); return; }

  let allPlayers = [];
  let allTeams   = [];
  let activeTier = 'all';
  let activeView = 'players';

  async function load() {
    document.getElementById('lb-body').innerHTML = '<tr><td colspan="7"><div class="spinner"></div></td></tr>';
    const [{ data: players }, { data: teams }] = await Promise.all([
      sb.from('players').select('*').order('kd', { ascending: false }),
      sb.from('teams').select('*').order('points', { ascending: false }),
    ]);
    allPlayers = players || [];
    allTeams   = teams   || [];
    render();
  }

  function render() {
    if (activeView === 'players') renderPlayers(allPlayers.filter(p => activeTier === 'all' || p.tier === activeTier));
    else                          renderTeams(allTeams.filter(t => activeTier === 'all' || t.tier === activeTier));
  }

  function renderPlayers(list) {
    const body = document.getElementById('lb-body');
    const head = document.getElementById('lb-head');
    head.innerHTML = `<tr>
      <th>#</th><th>Player</th><th>Team</th><th>K/D</th><th>W–L</th><th>SPM</th><th>Tier</th>
    </tr>`;
    if (!list.length) { body.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="es-icon">🎮</div><h3>No Players Found</h3><p>Adjust filters or check back later.</p></div></td></tr>`; return; }
    body.innerHTML = list.map((p, i) => {
      const rank = i + 1;
      const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
      return `<tr class="${rank === 1 ? 'lb-top' : ''}">
        <td><span class="rank ${rankClass}">${rank}</span></td>
        <td><span class="td-name">${p.gamertag}</span></td>
        <td class="text-orange">${p.team || '—'}</td>
        <td><span class="td-name">${Number(p.kd).toFixed(2)}</span></td>
        <td>${p.wins}–${p.losses}</td>
        <td>${p.spm}</td>
        <td><span class="badge badge-orange">${p.tier}</span></td>
      </tr>`;
    }).join('');
  }

  function renderTeams(list) {
    const body = document.getElementById('lb-body');
    const head = document.getElementById('lb-head');
    head.innerHTML = `<tr>
      <th>#</th><th>Team</th><th>Tier</th><th>W</th><th>L</th><th>Map Diff</th><th>Pts</th>
    </tr>`;
    if (!list.length) { body.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="es-icon">🏆</div><h3>No Teams Found</h3></div></td></tr>`; return; }
    body.innerHTML = list.map((t, i) => {
      const rank = i + 1;
      const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
      return `<tr class="${rank === 1 ? 'lb-top' : ''}">
        <td><span class="rank ${rankClass}">${rank}</span></td>
        <td><span class="td-name">${t.name}</span></td>
        <td class="text-orange">${t.tier || '—'}</td>
        <td class="text-green">${t.wins}</td>
        <td class="text-red">${t.losses}</td>
        <td>${t.map_diff >= 0 ? '+' : ''}${t.map_diff}</td>
        <td><span class="td-name td-orange">${t.points}</span></td>
      </tr>`;
    }).join('');
  }

  // View toggle
  document.querySelectorAll('.ms-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ms-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeView = btn.dataset.filter;
      render();
    });
  });

  // Tier filter
  document.querySelectorAll('.tier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTier = btn.dataset.tier;
      render();
    });
  });

  await load();
});

function renderDemoLB() {
  const head = document.getElementById('lb-head');
  const body = document.getElementById('lb-body');
  if (!head || !body) return;
  head.innerHTML = `<tr><th>#</th><th>Player</th><th>Team</th><th>K/D</th><th>W–L</th><th>SPM</th><th>Tier</th></tr>`;
  const demo = [
    { gamertag:'xXSniper_ReaperXx', team:'Phantom Squad', kd:2.84, wins:34, losses:8,  spm:312, tier:'Prestige'   },
    { gamertag:'NightOwl_7',        team:'Black Flag',    kd:2.61, wins:30, losses:10, spm:298, tier:'Prestige'   },
    { gamertag:'T3mpo',             team:'Crimson War',   kd:2.47, wins:28, losses:12, spm:281, tier:'Elite'      },
    { gamertag:'Clutch_Factor',     team:'Iron Ghost',    kd:2.33, wins:26, losses:12, spm:265, tier:'Elite'      },
    { gamertag:'DropShot_King',     team:'Phantom Squad', kd:2.21, wins:25, losses:11, spm:254, tier:'Prestige'   },
    { gamertag:'AK_Fury',           team:'Venom Unit',    kd:2.18, wins:24, losses:12, spm:248, tier:'Challenger' },
    { gamertag:'ZeroDark',          team:'Black Flag',    kd:2.05, wins:24, losses:14, spm:237, tier:'Elite'      },
    { gamertag:'GhostMode_23',      team:'Crimson War',   kd:1.99, wins:22, losses:12, spm:229, tier:'Challenger' },
    { gamertag:'Hex_Breaker',       team:'Iron Ghost',    kd:1.95, wins:21, losses:13, spm:222, tier:'Contender'  },
    { gamertag:'Pixel_Chaos',       team:'Venom Unit',    kd:1.91, wins:20, losses:13, spm:215, tier:'Challenger' },
  ];
  body.innerHTML = demo.map((p, i) => {
    const r = i + 1;
    const rc = r===1?'rank-1':r===2?'rank-2':r===3?'rank-3':'';
    return `<tr class="${r===1?'lb-top':''}">
      <td><span class="rank ${rc}">${r}</span></td>
      <td><span class="td-name">${p.gamertag}</span></td>
      <td class="text-orange">${p.team}</td>
      <td><span class="td-name">${p.kd.toFixed(2)}</span></td>
      <td>${p.wins}–${p.losses}</td>
      <td>${p.spm}</td>
      <td><span class="badge badge-orange">${p.tier}</span></td>
    </tr>`;
  }).join('');
}
