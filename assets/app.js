// ===============================
// SECTOR 7 — FULL APP.JS
// Includes ALL systems (Phases 1–10)
// ===============================

// -------------------------------
// SUPABASE INIT
// -------------------------------
const supabaseUrl = "https://absqahnhiydzoztddlzl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFic3FhaG5oaXlkem96dGRkbHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDc3NTMsImV4cCI6MjA5NzcyMzc1M30.q9QLWIu4bSbs7Zr98K4l-AiCNzbNcLo4nAUyXVaYsSg";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// -------------------------------
// NOTIFICATION SYSTEM
// -------------------------------
function notify(msg) {
  const box = document.getElementById("notification");
  if (!box) return;

  box.textContent = msg;
  box.classList.add("show");

  setTimeout(() => {
    box.classList.remove("show");
  }, 2500);
}

// -------------------------------
// AUTH HANDLING
// -------------------------------
async function checkAuth() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

if (document.getElementById("logout-btn")) {
  document.getElementById("logout-btn").onclick = async () => {
    await supabase.auth.signOut();
    notify("Logged out");
    setTimeout(() => location.reload(), 800);
  };
}

// -------------------------------
// PROFILE LOADING
// -------------------------------
async function loadProfile() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;

  const { data: profile } = await supabase
    .from("sector7_users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return;

  // Fill profile UI
  setText("profile-username", profile.username);
  setText("profile-rank-name", `Rank: ${profile.rank_name}`);
  setText("profile-xp", `XP: ${profile.xp}`);

  // XP progress
  const xpPercent = (profile.xp / profile.rank_xp_needed) * 100;
  setWidth("profile-rank-progress", xpPercent);
  setText("profile-rank-xp", `${profile.xp} / ${profile.rank_xp_needed}`);

  // Seasonal stats
  setText("seasonal-sniper-elo", profile.seasonal_sniper_elo);
  setWidth("seasonal-sniper-progress", profile.seasonal_sniper_elo / 20);

  setText("seasonal-comp-elo", profile.seasonal_competitive_elo);
  setWidth("seasonal-comp-progress", profile.seasonal_competitive_elo / 20);

  setText("seasonal-casual-xp", profile.seasonal_casual_xp);
  setWidth("seasonal-casual-progress", profile.seasonal_casual_xp / 10);

  loadMatchHistory(user.id);
}

// -------------------------------
// MATCH HISTORY
// -------------------------------
async function loadMatchHistory(userId) {
  const container = document.getElementById("match-history");
  if (!container) return;

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .or(`winner_id.eq.${userId},loser_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (!matches || matches.length === 0) {
    container.innerHTML = "<p>No matches yet.</p>";
    return;
  }

  container.innerHTML = matches
    .map(m => {
      const result = m.winner_id === userId ? "WIN" : "LOSS";
      return `<div class="leaderboard-card">${result} vs ${m.opponent_username}</div>`;
    })
    .join("");
}

// -------------------------------
// TEAM SYSTEM
// -------------------------------
async function loadTeams() {
  const container = document.getElementById("teams-list");
  if (!container) return;

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("xp", { ascending: false });

  if (!teams || teams.length === 0) {
    container.innerHTML = "<p>No teams created yet.</p>";
    return;
  }

  container.innerHTML = teams
    .map(
      t => `
      <div class="leaderboard-card">
        <strong>${t.name}</strong> — ${t.type.toUpperCase()} — ${t.xp} XP
      </div>
    `
    )
    .join("");
}

if (document.getElementById("create-team-btn")) {
  document.getElementById("create-team-btn").onclick = async () => {
    const name = document.getElementById("team-name").value;
    const type = document.getElementById("team-type").value;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return notify("You must be logged in");

    await supabase.from("teams").insert({
      name,
      type,
      captain_id: userData.user.id,
    });

    notify("Team created");
    loadTeams();
  };
}

// -------------------------------
// MATCH REPORTING
// -------------------------------
async function submitMatch() {
  const opponent = getVal("opponent-username");
  const type = getVal("match-type");
  const result = getVal("match-result");

  const { data } = await supabase.auth.getUser();
  if (!data.user) return notify("You must be logged in");

  await supabase.from("matches").insert({
    reporter_id: data.user.id,
    opponent_username: opponent,
    type,
    result,
    status: "pending",
  });

  notify("Match submitted");
  loadPendingMatches();
}

if (document.getElementById("submit-match-btn")) {
  document.getElementById("submit-match-btn").onclick = submitMatch;
}

// -------------------------------
// PENDING MATCHES
// -------------------------------
async function loadPendingMatches() {
  const container = document.getElementById("pending-matches");
  if (!container) return;

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "pending");

  if (!matches || matches.length === 0) {
    container.innerHTML = "<p>No pending matches.</p>";
    return;
  }

  container.innerHTML = matches
    .map(
      m => `
      <div class="pending-match-card">
        <strong>${m.opponent_username}</strong> — ${m.type.toUpperCase()}
        <div class="actions">
          <button onclick="approveMatch(${m.id})">Approve</button>
          <button onclick="rejectMatch(${m.id})">Reject</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function approveMatch(id) {
  await supabase.from("matches").update({ status: "approved" }).eq("id", id);
  notify("Match approved");
  loadPendingMatches();
}

async function rejectMatch(id) {
  await supabase.from("matches").update({ status: "rejected" }).eq("id", id);
  notify("Match rejected");
  loadPendingMatches();
}

// -------------------------------
// SNIPER SYSTEM
// -------------------------------
async function submitSniperMatch() {
  const opponent = getVal("sniper-opponent");
  const result = getVal("sniper-result");

  const { data } = await supabase.auth.getUser();
  if (!data.user) return notify("You must be logged in");

  await supabase.from("sniper_matches").insert({
    reporter_id: data.user.id,
    opponent_username: opponent,
    result,
    status: "pending",
  });

  notify("Sniper match submitted");
  loadPendingSniperMatches();
}

if (document.getElementById("submit-sniper-btn")) {
  document.getElementById("submit-sniper-btn").onclick = submitSniperMatch;
}

async function loadPendingSniperMatches() {
  const container = document.getElementById("pending-sniper-matches");
  if (!container) return;

  const { data: matches } = await supabase
    .from("sniper_matches")
    .select("*")
    .eq("status", "pending");

  if (!matches || matches.length === 0) {
    container.innerHTML = "<p>No pending sniper matches.</p>";
    return;
  }

  container.innerHTML = matches
    .map(
      m => `
      <div class="pending-match-card">
        <strong>${m.opponent_username}</strong> — SNIPER
        <div class="actions">
          <button onclick="approveSniper(${m.id})">Approve</button>
          <button onclick="rejectSniper(${m.id})">Reject</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function approveSniper(id) {
  await supabase.from("sniper_matches").update({ status: "approved" }).eq("id", id);
  notify("Sniper match approved");
  loadPendingSniperMatches();
}

async function rejectSniper(id) {
  await supabase.from("sniper_matches").update({ status: "rejected" }).eq("id", id);
  notify("Sniper match rejected");
  loadPendingSniperMatches();
}

// -------------------------------
// LEADERBOARDS
// -------------------------------
async function loadXPLeaderboard() {
  const container = document.getElementById("xp-leaderboard");
  if (!container) return;

  const { data } = await supabase
    .from("sector7_users")
    .select("*")
    .order("xp", { ascending: false })
    .limit(20);

  container.innerHTML = data
    .map(
      (u, i) => `
      <div class="leaderboard-card">
        ${i + 1}. ${u.username} — ${u.xp} XP
      </div>
    `
    )
    .join("");
}

async function loadSniperLeaderboard() {
  const container = document.getElementById("sniper-leaderboard");
  if (!container) return;

  const { data } = await supabase
    .from("sector7_users")
    .select("*")
    .order("seasonal_sniper_elo", { ascending: false })
    .limit(20);

  container.innerHTML = data
    .map(
      (u, i) => `
      <div class="leaderboard-card">
        ${i + 1}. ${u.username} — ${u.seasonal_sniper_elo} ELO
      </div>
    `
    )
    .join("");
}

async function loadCompetitiveLeaderboard() {
  const container = document.getElementById("competitive-leaderboard");
  if (!container) return;

  const { data } = await supabase
    .from("sector7_users")
    .select("*")
    .order("seasonal_competitive_elo", { ascending: false })
    .limit(20);

  container.innerHTML = data
    .map(
      (u, i) => `
      <div class="leaderboard-card">
        ${i + 1}. ${u.username} — ${u.seasonal_competitive_elo} ELO
      </div>
    `
    )
    .join("");
}

async function loadSeasonalLeaderboard() {
  const container = document.getElementById("seasonal-leaderboard");
  if (!container) return;

  const { data } = await supabase
    .from("sector7_users")
    .select("*")
    .order("seasonal_casual_xp", { ascending: false })
    .limit(20);

  container.innerHTML = data
    .map(
      (u, i) => `
      <div class="leaderboard-card">
        ${i + 1}. ${u.username} — ${u.seasonal_casual_xp} XP
      </div>
    `
    )
    .join("");
}

// -------------------------------
// HOME PAGE DYNAMIC SECTIONS
// -------------------------------
async function loadTopTeams() {
  const container = document.getElementById("top-teams");
  if (!container) return;

  const { data } = await supabase
    .from("teams")
    .select("*")
    .order("xp", { ascending: false })
    .limit(5);

  if (!data || data.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = data
    .map((t, i) => `<p>${i + 1}. ${t.name} — ${t.xp} XP</p>`)
    .join("");
}

async function loadTopPlayers() {
  const container = document.getElementById("top-players");
  if (!container) return;

  const { data } = await supabase
    .from("sector7_users")
    .select("*")
    .order("xp", { ascending: false })
    .limit(5);

  if (!data || data.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = data
    .map((p, i) => `<p>${i + 1}. ${p.username} — ${p.xp} XP</p>`)
    .join("");
}

async function loadLiveMatches() {
  const container = document.getElementById("live-matches");
  if (!container) return;

  const { data } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(3);

  if (!data || data.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = data
    .map(m => `<p>Match #${m.id} — ${m.type.toUpperCase()}</p>`)
    .join("");
}

// -------------------------------
// UTILITY HELPERS
// -------------------------------
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setWidth(id, percent) {
  const el = document.getElementById(id);
  if (el) el.style.width = percent + "%";
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

// -------------------------------
// PAGE ROUTER
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

  loadProfile();
  loadTeams();
  loadPendingMatches();
  loadPendingSniperMatches();

  loadXPLeaderboard();
  loadSniperLeaderboard();
  loadCompetitiveLeaderboard();
  loadSeasonalLeaderboard();

  loadTopTeams();
  loadTopPlayers();
  loadLiveMatches();
});
