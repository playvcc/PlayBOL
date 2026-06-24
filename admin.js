// admin.js — only loads on admin.html, all writes require auth
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof sb === 'undefined') {
    document.getElementById('admin-auth-wall')?.classList.remove('hidden');
    return;
  }
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    document.getElementById('admin-auth-wall')?.classList.remove('hidden');
    document.getElementById('admin-content')?.classList.add('hidden');
    return;
  }
  document.getElementById('admin-auth-wall')?.classList.add('hidden');
  document.getElementById('admin-content')?.classList.remove('hidden');
  loadAdminData();
});

async function loadAdminData() {
  await Promise.all([loadAdminMatches(), loadAdminPlayers(), loadAdminTeams(), loadAdminAnnouncements()]);
}

/* ── Admin panel tab switching ── */
document.querySelectorAll('.admin-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.panel)?.classList.add('active');
  });
});

/* ── MATCHES ── */
async function loadAdminMatches() {
  const { data } = await sb.from('matches').select('*').order('match_date', { ascending: false });
  const tbody = document.getElementById('admin-matches-tbody');
  if (!tbody) return;
  tbody.innerHTML = (data || []).map(m => `
    <tr>
      <td class="td-name">${m.team_a} vs ${m.team_b}</td>
      <td>${m.tier || '—'}</td>
      <td>${m.game_mode || '—'}</td>
      <td><span class="badge ${m.status==='live'?'badge-live':m.status==='completed'?'badge-green':'badge-grey'}">${m.status}</span></td>
      <td>${m.match_date ? new Date(m.match_date).toLocaleDateString() : '—'}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="editMatch('${m.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMatch('${m.id}')">Del</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--grey-lt)">No matches yet</td></tr>';
}

window.deleteMatch = async (id) => {
  if (!confirm('Delete this match?')) return;
  const { error } = await sb.from('matches').delete().eq('id', id);
  if (error) showToast(error.message, 'error');
  else { showToast('Match deleted', 'success'); loadAdminMatches(); }
};

document.getElementById('add-match-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    team_a: fd.get('team_a'), team_b: fd.get('team_b'),
    tier: fd.get('tier'), game_mode: fd.get('game_mode'),
    map_name: fd.get('map_name'), match_date: fd.get('match_date') || null,
    status: fd.get('status'), stream_url: fd.get('stream_url') || null,
    score_a: 0, score_b: 0,
  };
  const { error } = await sb.from('matches').insert([payload]);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Match added!', 'success');
  closeModal('add-match-modal');
  e.target.reset();
  loadAdminMatches();
});

/* ── PLAYERS ── */
async function loadAdminPlayers() {
  const { data } = await sb.from('players').select('*').order('kd', { ascending: false });
  const tbody = document.getElementById('admin-players-tbody');
  if (!tbody) return;
  tbody.innerHTML = (data || []).map(p => `
    <tr>
      <td class="td-name">${p.gamertag}</td>
      <td>${p.platform}</td>
      <td><span class="badge badge-orange">${p.tier}</span></td>
      <td class="text-orange">${p.team || '—'}</td>
      <td>${p.kd}</td>
      <td><span class="badge ${p.status==='Signed'?'badge-green':'badge-grey'}">${p.status}</span></td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deletePlayer('${p.id}')">Del</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--grey-lt)">No players yet</td></tr>';
}

window.deletePlayer = async (id) => {
  if (!confirm('Remove this player?')) return;
  const { error } = await sb.from('players').delete().eq('id', id);
  if (error) showToast(error.message, 'error');
  else { showToast('Player removed', 'success'); loadAdminPlayers(); }
};

document.getElementById('add-player-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    gamertag: fd.get('gamertag'), platform: fd.get('platform'),
    tier: fd.get('tier'), team: fd.get('team') || null,
    kd: parseFloat(fd.get('kd')) || 0, wins: parseInt(fd.get('wins')) || 0,
    losses: parseInt(fd.get('losses')) || 0, spm: parseInt(fd.get('spm')) || 0,
    status: fd.get('status'), discord: fd.get('discord') || null,
  };
  const { error } = await sb.from('players').insert([payload]);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Player added!', 'success');
  closeModal('add-player-modal');
  e.target.reset();
  loadAdminPlayers();
});

/* ── TEAMS ── */
async function loadAdminTeams() {
  const { data } = await sb.from('teams').select('*').order('points', { ascending: false });
  const tbody = document.getElementById('admin-teams-tbody');
  if (!tbody) return;
  tbody.innerHTML = (data || []).map(t => `
    <tr>
      <td class="td-name">${t.name}</td>
      <td><span class="badge badge-orange">${t.tier || '—'}</span></td>
      <td class="text-green">${t.wins}</td>
      <td class="text-red">${t.losses}</td>
      <td>${t.map_diff >= 0 ? '+' : ''}${t.map_diff}</td>
      <td class="td-orange">${t.points}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteTeam('${t.id}')">Del</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--grey-lt)">No teams yet</td></tr>';
}

window.deleteTeam = async (id) => {
  if (!confirm('Delete this team?')) return;
  const { error } = await sb.from('teams').delete().eq('id', id);
  if (error) showToast(error.message, 'error');
  else { showToast('Team deleted', 'success'); loadAdminTeams(); }
};

document.getElementById('add-team-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    name: fd.get('name'), tier: fd.get('tier'),
    wins: parseInt(fd.get('wins')) || 0, losses: parseInt(fd.get('losses')) || 0,
    map_diff: parseInt(fd.get('map_diff')) || 0, points: parseInt(fd.get('points')) || 0,
  };
  const { error } = await sb.from('teams').insert([payload]);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Team added!', 'success');
  closeModal('add-team-modal');
  e.target.reset();
  loadAdminTeams();
});

/* ── ANNOUNCEMENTS ── */
async function loadAdminAnnouncements() {
  const { data } = await sb.from('announcements').select('*').order('created_at', { ascending: false });
  const tbody = document.getElementById('admin-ann-tbody');
  if (!tbody) return;
  tbody.innerHTML = (data || []).map(a => `
    <tr>
      <td class="td-name">${a.title}</td>
      <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.body || '—'}</td>
      <td>${a.pinned ? '<span class="badge badge-orange">Pinned</span>' : '—'}</td>
      <td>${new Date(a.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteAnn('${a.id}')">Del</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--grey-lt)">No announcements yet</td></tr>';
}

window.deleteAnn = async (id) => {
  if (!confirm('Delete this announcement?')) return;
  const { error } = await sb.from('announcements').delete().eq('id', id);
  if (error) showToast(error.message, 'error');
  else { showToast('Deleted', 'success'); loadAdminAnnouncements(); }
};

document.getElementById('add-ann-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const { error } = await sb.from('announcements').insert([{
    title: fd.get('title'), body: fd.get('body'), pinned: fd.get('pinned') === 'on',
  }]);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Announcement posted!', 'success');
  closeModal('add-ann-modal');
  e.target.reset();
  loadAdminAnnouncements();
});
