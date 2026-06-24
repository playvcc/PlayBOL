// assets/app.js

// 1) INIT SUPABASE
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// 2) PAGE ROUTER
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");

  if (!supabase) {
    console.warn("Supabase client not loaded (you must include the Supabase JS CDN in index.html <head> if you want live data).");
  }

  switch (page) {
    case "home":
      loadHome();
      break;
    case "ladders":
      loadLadders();
      break;
    case "teams":
      loadTeams();
      break;
    case "players":
      loadPlayers();
      break;
    case "divisions":
      loadDivisions();
      break;
    case "matches":
      loadMatches();
      break;
    case "rankings":
      loadRankings();
      break;
    case "tournaments":
      loadTournaments();
      break;
    case "recruitment":
      initRecruitmentForm();
      break;
    case "support":
      initSupportForm();
      break;
    case "hall-of-fame":
      loadHallOfFame();
      break;
    case "admin":
      initAdmin();
      break;
    default:
      break;
  }
});

// 3) HOME
async function loadHome() {
  if (!supabase) return;

  // Top teams
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("xp", { ascending: false })
    .limit(5);

  const list = document.getElementById("top-teams-list");
  if (list && teams) {
    list.innerHTML = "";
    teams.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = `${t.name} — ${t.xp} XP`;
      list.appendChild(li);
    });
  }

  // Top players
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("xp", { ascending: false })
    .limit(5);

  const playersList = document.getElementById("top-players-list");
  if (playersList && players) {
    playersList.innerHTML = "";
    players.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `${p.gamertag} — ${p.xp} XP`;
      playersList.appendChild(li);
    });
  }

  // Live matches
  const { data: matches } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)")
    .eq("status", "live")
    .limit(5);

  const liveList = document.getElementById("live-matches-list");
  if (liveList && matches) {
    liveList.innerHTML = "";
    matches.forEach((m) => {
      const li = document.createElement("li");
      li.textContent = `${m.home_team.name} vs ${m.away_team.name} — ${m.mode}: ${m.map_name} (LIVE)`;
      liveList.appendChild(li);
    });
  }
}

// 4) LADDERS
async function loadLadders() {
  if (!supabase) return;
  const { data } = await supabase.from("ladders").select("*");
  const tbody = document.querySelector("#ladders-table tbody");
  if (!tbody || !data) return;
  tbody.innerHTML = "";
  data.forEach((l) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.name}</td>
      <td>${l.mode}</td>
      <td>${l.team_size}v${l.team_size}</td>
      <td>${l.season_label}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 5) TEAMS
async function loadTeams() {
  if (!supabase) return;
  const { data } = await supabase
    .from("teams")
    .select("*, division:divisions(name)")
    .order("xp", { ascending: false });

  const tbody = document.querySelector("#teams-table tbody");
  if (!tbody || !data) return;
  tbody.innerHTML = "";
  data.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.name}</td>
      <td>${t.division ? t.division.name : "—"}</td>
      <td>${t.xp}</td>
      <td>${t.record_wins}-${t.record_losses}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 6) PLAYERS
async function loadPlayers() {
  if (!supabase) return;
  const { data } = await supabase
    .from("players")
    .select("*, team:teams(name)")
    .order("xp", { ascending: false });

  const tbody = document.querySelector("#players-table tbody");
  if (!tbody || !data) return;
  tbody.innerHTML = "";
  data.forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.gamertag}</td>
      <td>${p.team ? p.team.name : "Free Agent"}</td>
      <td>${p.xp}</td>
      <td>${index + 1}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 7) DIVISIONS
async function loadDivisions() {
  if (!supabase) return;
  const { data } = await supabase.from("divisions").select("*");
  const list = document.getElementById("divisions-list");
  if (!list || !data) return;
  list.innerHTML = "";
  data.forEach((d) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${d.name}:</strong> ${d.description || ""}`;
    list.appendChild(li);
  });
}

// 8) MATCHES
async function loadMatches() {
  if (!supabase) return;
  const { data } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)")
    .order("created_at", { ascending: false })
    .limit(20);

  const tbody = document.querySelector("#matches-table tbody");
  if (!tbody || !data) return;
  tbody.innerHTML = "";
  data.forEach((m) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.home_team.name}</td>
      <td>${m.away_team.name}</td>
      <td>${m.mode}</td>
      <td>${m.map_name}</td>
      <td>${m.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 9) RANKINGS
async function loadRankings() {
  if (!supabase) return;
  const { data } = await supabase
    .from("teams")
    .select("*")
    .order("xp", { ascending: false });

  const tbody = document.querySelector("#rankings-table tbody");
  if (!tbody || !data) return;
  tbody.innerHTML = "";
  data.forEach((t, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${t.name}</td>
      <td>${t.xp}</td>
      <td>${t.record_wins}-${t.record_losses}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 10) TOURNAMENTS
async function loadTournaments() {
  if (!supabase) return;
  const { data } = await supabase.from("tournaments").select("*");
  const list = document.getElementById("tournaments-list");
  if (!list || !data) return;
  list.innerHTML = "";
  data.forEach((t) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${t.name}</strong> — ${t.status} — ${t.start_date || ""}`;
    list.appendChild(li);
  });
}

// 11) RECRUITMENT FORM
function initRecruitmentForm() {
  const form = document.getElementById("recruitment-form");
  const msg = document.getElementById("recruitment-message");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!supabase) {
      msg.textContent = "Backend not configured.";
      return;
    }

    const formData = new FormData(form);
    const payload = {
      gamertag: formData.get("gamertag"),
      division_preference: formData.get("division"),
      role: formData.get("role"),
      reason: formData.get("reason"),
    };

    const { error } = await supabase.from("recruitment_applications").insert(payload);
    if (error) {
      msg.textContent = "Error submitting application.";
    } else {
      msg.textContent = "Application submitted. Staff will review soon.";
      form.reset();
    }
  });
}

// 12) SUPPORT FORM
function initSupportForm() {
  const form = document.getElementById("support-form");
  const msg = document.getElementById("support-message");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!supabase) {
      msg.textContent = "Backend not configured.";
      return;
    }

    const formData = new FormData(form);
    const payload = {
      email: formData.get("email"),
      category: formData.get("category"),
      details: formData.get("details"),
    };

    const { error } = await supabase.from("support_tickets").insert(payload);
    if (error) {
      msg.textContent = "Error submitting ticket.";
    } else {
      msg.textContent = "Ticket submitted. Staff will respond soon.";
      form.reset();
    }
  });
}

// 13) HALL OF FAME
async function loadHallOfFame() {
  if (!supabase) return;
  const { data } = await supabase.from("hall_of_fame").select("*").order("year", { ascending: false });
  const list = document.getElementById("hof-list");
  if (!list || !data) return;
  list.innerHTML = "";
  data.forEach((entry) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${entry.name}</strong> (${entry.year}) — ${entry.description}`;
    list.appendChild(li);
  });
}

// 14) ADMIN
function initAdmin() {
  const form = document.getElementById("admin-login-form");
  const msg = document.getElementById("admin-login-message");
  const dashboard = document.getElementById("admin-dashboard");
  const refreshBtn = document.getElementById("refresh-data");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!supabase) {
      msg.textContent = "Backend not configured.";
      return;
    }

    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      msg.textContent = "Login failed.";
    } else {
      msg.textContent = "Logged in.";
      form.style.display = "none";
      if (dashboard) dashboard.style.display = "block";
    }
  });

async function loadDivisionsIntoSelect() {
  const { data } = await supabase.from("divisions").select("*");
  const select = document.getElementById("division-select");
  if (!select || !data) return;

  select.innerHTML = "";
  data.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.name;
    select.appendChild(opt);
  });
}

async function initTeamCreation() {
  const form = document.getElementById("create-team-form");
  const msg = document.getElementById("team-create-message");

  if (!form) return;

  await loadDivisionsIntoSelect();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const payload = {
      captain_id: (await supabase.auth.getUser()).data.user.id,
      team_name: formData.get("team_name"),
      division_id: formData.get("division_id")
    };

    const { error } = await supabase
      .from("team_creation_requests")
      .insert(payload);

    msg.textContent = error
      ? "Error submitting team request."
      : "Team submitted for approval.";

    if (!error) form.reset();
  });
}


  
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      alert("Future: refresh admin data.");
    });
  }
}
