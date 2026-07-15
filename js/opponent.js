/* =========================================================================
   opponent.js — Choose Opponent page.
   Two tabs: build a second custom candidate, or pick from the 25 prebuilt
   fictional politicians. Selection is stored under Storage.KEY_OPPONENT.
   ========================================================================= */

const OPP_TRAITS = [
  { id: "charisma", label: "Charisma" }, { id: "integrity", label: "Integrity" },
  { id: "publicSpeaking", label: "Public Speaking" }, { id: "debateSkill", label: "Debate Skill" },
  { id: "fundraising", label: "Fundraising Ability" }, { id: "popularity", label: "Popularity" },
  { id: "experience", label: "Experience" }, { id: "intelligence", label: "Intelligence" }
];

function defaultOpponent() {
  return {
    name: "", party: "", slogan: "", age: 50, state: "Ohio",
    experience: "", occupation: "", leadership: GameData.LEADERSHIP_STYLES[1],
    speech: GameData.SPEECH_STYLES[1], economicFocus: "", foreignPolicyFocus: "",
    educationPosition: "", healthcarePosition: "", immigrationPosition: "",
    environmentPosition: "", crimePosition: "", taxPosition: "", militaryPosition: "", governmentSize: "",
    traits: { charisma: 55, integrity: 55, publicSpeaking: 55, debateSkill: 55, fundraising: 55, popularity: 55, experience: 55, intelligence: 55 },
    logoColor: GameData.LOGO_COLOR_PALETTE[1]
  };
}
let customOpponent = defaultOpponent();

function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.target).classList.add("active");
      playBlip(480, 0.06);
    });
  });
}

/* ---------------- Custom opponent builder (mirrors create.html) ---------------- */
function buildSelect(select, list, selected) {
  select.innerHTML = "";
  list.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item; opt.textContent = item;
    if (item === selected) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderOppPolicyGroups() {
  const wrap = document.getElementById("oppPolicyGroups");
  wrap.innerHTML = "";
  GameData.POLICY_QUESTIONS.forEach(q => {
    if (!customOpponent[q.id]) customOpponent[q.id] = q.options[0].value;
    const fs = document.createElement("fieldset");
    fs.innerHTML = `<legend>${q.label}</legend>`;
    const group = document.createElement("div");
    group.className = "choice-group";
    q.options.forEach(opt => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "choice-chip" + (customOpponent[q.id] === opt.value ? " selected" : "");
      chip.textContent = opt.value;
      chip.addEventListener("click", () => {
        customOpponent[q.id] = opt.value;
        group.querySelectorAll(".choice-chip").forEach(c => c.classList.remove("selected"));
        chip.classList.add("selected");
        updateOppPreview();
      });
      group.appendChild(chip);
    });
    fs.appendChild(group);
    wrap.appendChild(fs);
  });
}

function renderOppTraitSliders() {
  const wrap = document.getElementById("oppTraitSliders");
  wrap.innerHTML = "";
  OPP_TRAITS.forEach(t => {
    const field = document.createElement("div");
    field.className = "slider-field";
    field.innerHTML = `<label for="opp-trait-${t.id}">${t.label}</label>
      <div class="slider-row"><input type="range" min="0" max="100" value="${customOpponent.traits[t.id]}" id="opp-trait-${t.id}">
      <span class="slider-value">${customOpponent.traits[t.id]}</span></div>`;
    wrap.appendChild(field);
    const input = field.querySelector("input");
    const val = field.querySelector(".slider-value");
    input.addEventListener("input", () => { customOpponent.traits[t.id] = Number(input.value); val.textContent = input.value; updateOppPreview(); });
  });
}

function initials(name) { return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?"; }

function updateOppPreview() {
  const p = document.getElementById("oppPreviewCard");
  if (!p) return;
  const traitsHtml = OPP_TRAITS.map(t => {
    const v = customOpponent.traits[t.id];
    return `<div class="stat-bar-row"><span>${t.label}</span><div class="stat-bar-track"><div class="stat-bar-fill" style="width:${v}%"></div></div><span>${v}</span></div>`;
  }).join("");
  p.innerHTML = `
    <div class="candidate-card-banner" style="background:linear-gradient(135deg, ${customOpponent.logoColor}, var(--navy-900));"></div>
    <div class="candidate-card-body">
      <div class="candidate-avatar" style="background:${customOpponent.logoColor}22;">${initials(customOpponent.name || "Rival Candidate")}</div>
      <h3 class="candidate-name">${customOpponent.name || "Rival Candidate"}</h3>
      <div class="candidate-party">${customOpponent.party || "Opposition Party"}</div>
      <p class="candidate-slogan">"${customOpponent.slogan || "A slogan for the ages"}"</p>
      <dl class="candidate-meta"><dt>Age</dt><dd>${customOpponent.age||"—"}</dd><dt>Home State</dt><dd>${customOpponent.state||"—"}</dd>
      <dt>Occupation</dt><dd>${customOpponent.occupation||"—"}</dd><dt>Leadership</dt><dd>${customOpponent.leadership||"—"}</dd></dl>
      <div class="stat-bars">${traitsHtml}</div>
    </div>`;
}

function bindOppField(id, key, isNumber) {
  const el = document.getElementById(id);
  el.value = customOpponent[key] ?? "";
  el.addEventListener("input", () => { customOpponent[key] = isNumber ? Number(el.value) : el.value; updateOppPreview(); });
}

function initCustomOpponentForm() {
  buildSelect(document.getElementById("oppStateSelect"), GameData.US_STATE_LIST, customOpponent.state);
  buildSelect(document.getElementById("oppLeadershipSelect"), GameData.LEADERSHIP_STYLES, customOpponent.leadership);
  buildSelect(document.getElementById("oppSpeechSelect"), GameData.SPEECH_STYLES, customOpponent.speech);
  bindOppField("oppNameInput", "name");
  bindOppField("oppPartyInput", "party");
  bindOppField("oppSloganInput", "slogan");
  bindOppField("oppAgeInput", "age", true);
  bindOppField("oppOccupationInput", "occupation");
  bindOppField("oppExperienceInput", "experience");
  document.getElementById("oppStateSelect").addEventListener("change", e => { customOpponent.state = e.target.value; updateOppPreview(); });
  document.getElementById("oppLeadershipSelect").addEventListener("change", e => { customOpponent.leadership = e.target.value; updateOppPreview(); });
  document.getElementById("oppSpeechSelect").addEventListener("change", e => { customOpponent.speech = e.target.value; updateOppPreview(); });
  renderOppPolicyGroups();
  renderOppTraitSliders();
  updateOppPreview();

  document.getElementById("oppRandomSloganBtn").addEventListener("click", () => {
    customOpponent.slogan = GameData.generateRandomSlogan();
    document.getElementById("oppSloganInput").value = customOpponent.slogan;
    updateOppPreview();
  });

  document.getElementById("oppRandomizeBtn").addEventListener("click", () => {
    customOpponent.name = GameData.generateRandomName();
    customOpponent.party = ["Heritage Party","Prosperity Alliance","National Reform Party","Cornerstone Party"][Math.floor(Math.random()*4)];
    customOpponent.slogan = GameData.generateRandomSlogan();
    customOpponent.age = 40 + Math.floor(Math.random()*45);
    customOpponent.state = GameData.US_STATE_LIST[Math.floor(Math.random()*GameData.US_STATE_LIST.length)];
    customOpponent.occupation = ["Governor","Senator","Business Owner","General","Mayor"][Math.floor(Math.random()*5)];
    GameData.POLICY_QUESTIONS.forEach(q => { customOpponent[q.id] = q.options[Math.floor(Math.random()*q.options.length)].value; });
    Object.keys(customOpponent.traits).forEach(k => customOpponent.traits[k] = 30 + Math.floor(Math.random()*71));
    document.getElementById("oppNameInput").value = customOpponent.name;
    document.getElementById("oppPartyInput").value = customOpponent.party;
    document.getElementById("oppSloganInput").value = customOpponent.slogan;
    document.getElementById("oppAgeInput").value = customOpponent.age;
    document.getElementById("oppStateSelect").value = customOpponent.state;
    document.getElementById("oppOccupationInput").value = customOpponent.occupation;
    renderOppPolicyGroups();
    renderOppTraitSliders();
    updateOppPreview();
    playBlip(660, 0.1, "triangle");
  });

  document.getElementById("oppSaveBtn").addEventListener("click", () => {
    if (!customOpponent.name.trim() || !customOpponent.party.trim()) {
      document.getElementById("oppFormMessage").textContent = "Give your opponent a name and party first.";
      document.getElementById("oppFormMessage").style.color = "var(--red-400)";
      return;
    }
    Storage.save(Storage.KEY_OPPONENT, customOpponent);
    document.getElementById("oppFormMessage").style.color = "#6be089";
    document.getElementById("oppFormMessage").textContent = "Opponent saved! Head to the Election Simulator.";
    playBlip(700, 0.15, "triangle");
  });
}

/* ---------------- Prebuilt roster ---------------- */
function renderRoster(filter) {
  const grid = document.getElementById("rosterGrid");
  grid.innerHTML = "";
  const term = (filter || "").toLowerCase();
  const selectedId = (Storage.load(Storage.KEY_OPPONENT) || {}).id;
  GameData.PREBUILT_POLITICIANS
    .filter(p => !term || p.name.toLowerCase().includes(term) || p.party.toLowerCase().includes(term))
    .forEach(p => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card opponent-card card-hover" + (p.id === selectedId ? " selected" : "");
      card.innerHTML = `<h4>${p.name}</h4><span class="candidate-party">${p.party}</span>
        <p class="candidate-slogan">"${p.slogan}"</p>
        <p style="font-size:0.8rem;">${p.occupation} • ${p.state}</p>`;
      card.addEventListener("click", () => {
        Storage.save(Storage.KEY_OPPONENT, p);
        document.querySelectorAll(".opponent-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        document.getElementById("rosterMessage").textContent = `${p.name} selected as your opponent.`;
        document.getElementById("rosterMessage").style.color = "#6be089";
        playBlip(700, 0.15, "triangle");
      });
      grid.appendChild(card);
    });
}

function initRoster() {
  renderRoster("");
  document.getElementById("rosterSearch").addEventListener("input", e => renderRoster(e.target.value));
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initCustomOpponentForm();
  initRoster();
});
