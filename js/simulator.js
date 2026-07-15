/* =========================================================================
   simulator.js — the election engine and election-night animation.

   Overview of the model (all weighted probability, not pure randomness):
   1. Score each candidate 0-100 from their traits (weighted average).
   2. Roll a random "national mood" lean for each policy question, and
      score how closely each candidate's platform matches that mood.
   3. Combine trait score + issue alignment into a national "strength".
   4. Convert the strength gap into a national vote-share split.
   5. Draw 3-6 random campaign events; each nudges its target's share.
   6. Simulate every one of the 51 electoral-map entries individually,
      applying home-state bonus, regional-focus bonus, swing-state
      volatility, and independent random noise, so no two runs match.
   7. Tally electors, popular vote, and produce a results object that
      results.html renders.
   ========================================================================= */

let pending = [];      // queued setTimeout handles, so "skip" can clear them
let simRunning = false;
let simResult = null;

function randRange([min, max]) { return min + Math.random() * (max - min); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function traitScore(candidate) {
  const t = candidate.traits;
  return (
    t.charisma * 0.15 + t.integrity * 0.10 + t.publicSpeaking * 0.12 +
    t.debateSkill * 0.12 + t.fundraising * 0.10 + t.popularity * 0.15 +
    t.experience * 0.13 + t.intelligence * 0.13
  );
}

function rollNationalMood() {
  const mood = {};
  GameData.POLICY_QUESTIONS.forEach(q => { mood[q.id] = randRange([-2, 2]); });
  return mood;
}

function issueAlignment(candidate, mood) {
  let total = 0, count = 0;
  const perIssue = {};
  GameData.POLICY_QUESTIONS.forEach(q => {
    const opt = q.options.find(o => o.value === candidate[q.id]);
    if (!opt) return;
    const dist = Math.abs(opt.lean - mood[q.id]);
    const fit = 4 - dist; // 0 (bad) .. 4 (perfect)
    perIssue[q.id] = fit;
    total += fit; count++;
  });
  return { avg: count ? total / count : 2, perIssue };
}

function pickEvents() {
  const pool = [...GameData.CAMPAIGN_EVENTS];
  const n = 3 + Math.floor(Math.random() * 4); // 3-6 events
  const chosen = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const event = pool.splice(idx, 1)[0];
    const target = Math.random() < 0.5 ? "player" : "opponent";
    const swing = randRange(event.swing);
    chosen.push({ ...event, target, swing });
  }
  return chosen;
}

function focusMatchesState(candidate, state) {
  const haystack = [candidate.economicFocus, candidate.foreignPolicyFocus, candidate.militaryPosition, candidate.environmentPosition]
    .join(" ").toLowerCase();
  const keywordMap = { manufacturing: "manufacturing", tech: "tech", coastal: "coastal", resource: "resource", rural: "rural", urban: "urban" };
  return state.type.some(tag => keywordMap[tag] && haystack.includes(keywordMap[tag]));
}

function runElection(player, opponent) {
  const mood = rollNationalMood();
  const alignA = issueAlignment(player, mood);
  const alignB = issueAlignment(opponent, mood);

  const strengthA = traitScore(player) * 0.65 + (alignA.avg * 25) * 0.35;
  const strengthB = traitScore(opponent) * 0.65 + (alignB.avg * 25) * 0.35;

  const events = pickEvents();
  let eventDeltaA = 0, eventDeltaB = 0;
  events.forEach(e => { if (e.target === "player") eventDeltaA += e.swing; else eventDeltaB += e.swing; });

  const otherShare = randRange([1, 4]); // third-party / undecided sliver
  const k = 0.42;
  let nationalShareA = 50 + (strengthA - strengthB) * k + (eventDeltaA - eventDeltaB);
  nationalShareA = clamp(nationalShareA, 8, 92);

  const stateResults = GameData.ELECTORAL_MAP.map(state => {
    let shareA = nationalShareA;
    if (state.state === player.state) shareA += 6;
    if (state.state === opponent.state) shareA -= 6;
    if (focusMatchesState(player, state)) shareA += 3;
    if (focusMatchesState(opponent, state)) shareA -= 3;
    const swingAmplifier = state.type.includes("swing") ? 1.6 : 1;
    shareA += (Math.random() * 16 - 8) * swingAmplifier;
    shareA = clamp(shareA, 3, 97);
    const winner = shareA >= 50 ? "player" : "opponent";
    return { state: state.state, electors: state.electors, region: state.region, shareA, shareB: 100 - shareA, winner };
  });

  const electorsA = stateResults.filter(s => s.winner === "player").reduce((a, s) => a + s.electors, 0);
  const electorsB = 538 - electorsA;

  const totalElectorWeight = stateResults.reduce((a, s) => a + s.electors, 0);
  const popVoteA = stateResults.reduce((a, s) => a + s.shareA * s.electors, 0) / totalElectorWeight;
  const popVoteAAdj = popVoteA * (1 - otherShare / 100);
  const popVoteBAdj = (100 - popVoteA) * (1 - otherShare / 100);

  const winnerKey = electorsA >= 270 ? "player" : (electorsB >= 270 ? "opponent" : (electorsA > electorsB ? "player" : "opponent"));

  const mostInfluentialEvent = events.slice().sort((x, y) => Math.abs(y.swing) - Math.abs(x.swing))[0];

  const traitLabels = { charisma: "Charisma", integrity: "Integrity", publicSpeaking: "Public Speaking",
    debateSkill: "Debate Skill", fundraising: "Fundraising", popularity: "Popularity", experience: "Experience", intelligence: "Intelligence" };
  const winnerCandidate = winnerKey === "player" ? player : opponent;
  const loserCandidate = winnerKey === "player" ? opponent : player;
  const sortedTraits = Object.keys(winnerCandidate.traits).sort((a, b) => winnerCandidate.traits[b] - winnerCandidate.traits[a]);
  const strengths = sortedTraits.slice(0, 3).map(k => `${traitLabels[k]} (${winnerCandidate.traits[k]}/100)`);
  const weaknesses = sortedTraits.slice(-2).map(k => `${traitLabels[k]} (${winnerCandidate.traits[k]}/100)`);

  const alignWin = winnerKey === "player" ? alignA : alignB;
  const decidingIssues = GameData.POLICY_QUESTIONS
    .map(q => ({ id: q.id, label: q.label, fit: alignWin.perIssue[q.id] }))
    .sort((a, b) => b.fit - a.fit).slice(0, 2).map(i => i.label);

  const marginElectors = Math.abs(electorsA - electorsB);
  let rating;
  if (marginElectors > 250) rating = "Historic Landslide";
  else if (marginElectors > 120) rating = "Decisive Mandate";
  else if (marginElectors > 40) rating = "Comfortable Win";
  else rating = "Nail-Biter";

  const swingStatesWon = stateResults.filter(s =>
    GameData.ELECTORAL_MAP.find(m => m.state === s.state).type.includes("swing") && s.winner === winnerKey
  ).length;

  return {
    player, opponent, mood, events, mostInfluentialEvent,
    stateResults, electorsA, electorsB,
    popVoteA: popVoteAAdj, popVoteB: popVoteBAdj, otherShare,
    winnerKey, winnerCandidate, loserCandidate,
    strengths, weaknesses, decidingIssues, rating,
    statesWonA: stateResults.filter(s => s.winner === "player").length,
    statesWonB: stateResults.filter(s => s.winner === "opponent").length,
    swingStatesWon,
    timestamp: Date.now()
  };
}

/* ---------------------------- Animation ---------------------------- */
function schedule(fn, delay) { const h = setTimeout(fn, delay); pending.push(h); return h; }
function clearSchedule() { pending.forEach(clearTimeout); pending = []; }

function logLine(text, tone) {
  const log = document.getElementById("simLog");
  const p = document.createElement("p");
  p.className = "tag-" + (tone || "mixed");
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

function initStateGrid(result) {
  const grid = document.getElementById("stateGrid");
  grid.innerHTML = "";
  result.stateResults.forEach(s => {
    const chip = document.createElement("div");
    chip.className = "state-chip pending";
    chip.dataset.state = s.state;
    chip.innerHTML = `${s.state}<span class="ev">${s.electors}</span>`;
    grid.appendChild(chip);
  });
}

function setCounters(evA, evB) {
  document.getElementById("counterA").textContent = evA;
  document.getElementById("counterB").textContent = evB;
  const pct = (evA / 538) * 100;
  document.getElementById("evBarA").style.width = pct + "%";
  document.getElementById("evBarB").style.width = (100 - pct) + "%";
}

function runAnimation(result) {
  simRunning = true;
  document.getElementById("runBtn").disabled = true;
  document.getElementById("skipBtn").disabled = false;
  document.getElementById("simLog").innerHTML = "";
  initStateGrid(result);
  setCounters(0, 0);
  document.getElementById("popRow").style.display = "none";
  document.getElementById("winnerLink").style.display = "none";

  let step = 0;
  logLine("Polls have closed nationwide. Counting begins…", "mixed");

  // 1) reveal campaign events first, spaced out
  result.events.forEach((e, i) => {
    schedule(() => {
      const who = e.target === "player" ? result.player.name : result.opponent.name;
      const tone = e.tone === "positive" ? (e.swing >= 0 ? "positive" : "negative")
                 : e.tone === "negative" ? (e.swing < 0 ? "negative" : "positive") : "mixed";
      logLine(`${e.label}: ${who} ${e.text}`, tone);
      playBlip(e.swing >= 0 ? 620 : 300, 0.08);
    }, 500 + i * 650);
  });

  const eventsDone = 500 + result.events.length * 650 + 400;

  // 2) reveal states one at a time in random order
  const order = [...result.stateResults].sort(() => Math.random() - 0.5);
  let runningA = 0, runningB = 0;
  order.forEach((s, i) => {
    schedule(() => {
      const chip = document.querySelector(`.state-chip[data-state="${CSS.escape(s.state)}"]`);
      chip.classList.remove("pending");
      chip.classList.add(s.winner === "player" ? "called-a" : "called-b");
      if (s.winner === "player") runningA += s.electors; else runningB += s.electors;
      setCounters(runningA, runningB);
      if (i % 4 === 0) playBlip(s.winner === "player" ? 500 : 340, 0.05);
      if (runningA >= 270 || runningB >= 270) {
        document.getElementById("projectionNote").textContent =
          (runningA >= 270 ? result.player.name : result.opponent.name) + " has crossed 270 electoral votes.";
      }
    }, eventsDone + i * 90);
  });

  const statesDone = eventsDone + order.length * 90 + 300;

  // 3) reveal popular vote bars
  schedule(() => {
    document.getElementById("popRow").style.display = "block";
    document.getElementById("popLabelA").textContent = `${result.player.name} ${result.popVoteA.toFixed(1)}%`;
    document.getElementById("popLabelB").textContent = `${result.opponent.name} ${result.popVoteB.toFixed(1)}%`;
    document.getElementById("popBarA").style.width = result.popVoteA + "%";
    document.getElementById("popBarB").style.width = result.popVoteB + "%";
    logLine("National popular vote totals are in.", "mixed");
  }, statesDone);

  // 4) announce winner
  schedule(() => {
    const winnerName = result.winnerCandidate.name;
    logLine(`${winnerName} wins the election. (${result.rating})`, "positive");
    document.getElementById("winnerAnnounce").textContent = `${winnerName} wins the presidency!`;
    document.getElementById("winnerLink").style.display = "inline-flex";
    launchConfetti(document.getElementById("confettiLayer"), 110);
    playBlip(880, 0.25, "triangle");
    Storage.save(Storage.KEY_RESULT, result);
    document.getElementById("runBtn").disabled = false;
    document.getElementById("skipBtn").disabled = true;
    simRunning = false;
  }, statesDone + 900);
}

function skipToEnd() {
  clearSchedule();
  if (!simResult) return;
  const result = simResult;
  initStateGrid(result);
  result.stateResults.forEach(s => {
    const chip = document.querySelector(`.state-chip[data-state="${CSS.escape(s.state)}"]`);
    chip.classList.remove("pending");
    chip.classList.add(s.winner === "player" ? "called-a" : "called-b");
  });
  setCounters(result.electorsA, result.electorsB);
  document.getElementById("popRow").style.display = "block";
  document.getElementById("popLabelA").textContent = `${result.player.name} ${result.popVoteA.toFixed(1)}%`;
  document.getElementById("popLabelB").textContent = `${result.opponent.name} ${result.popVoteB.toFixed(1)}%`;
  document.getElementById("popBarA").style.width = result.popVoteA + "%";
  document.getElementById("popBarB").style.width = result.popVoteB + "%";
  const log = document.getElementById("simLog");
  log.innerHTML = "";
  result.events.forEach(e => {
    const who = e.target === "player" ? result.player.name : result.opponent.name;
    logLine(`${e.label}: ${who} ${e.text}`, e.swing >= 0 ? "positive" : "negative");
  });
  document.getElementById("winnerAnnounce").textContent = `${result.winnerCandidate.name} wins the presidency!`;
  document.getElementById("winnerLink").style.display = "inline-flex";
  launchConfetti(document.getElementById("confettiLayer"), 110);
  Storage.save(Storage.KEY_RESULT, result);
  document.getElementById("runBtn").disabled = false;
  document.getElementById("skipBtn").disabled = true;
  simRunning = false;
}

function renderMatchup(player, opponent) {
  document.getElementById("matchupA").innerHTML = miniCard(player, "var(--navy-600)");
  document.getElementById("matchupB").innerHTML = miniCard(opponent, "var(--red-500)");
}
function miniCard(c, color) {
  return `<div class="candidate-card-banner" style="background:linear-gradient(135deg, ${color}, var(--navy-900)); height:60px;"></div>
    <div class="candidate-card-body" style="margin-top:-28px;">
      <div class="candidate-avatar" style="width:56px;height:56px;font-size:1.1rem;">${c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
      <h3 class="candidate-name" style="font-size:1.15rem;">${c.name}</h3>
      <div class="candidate-party">${c.party}</div>
      <p class="candidate-slogan">"${c.slogan}"</p>
    </div>`;
}

function initSimulatorPage() {
  const player = Storage.load(Storage.KEY_PLAYER);
  const opponent = Storage.load(Storage.KEY_OPPONENT);
  const missing = document.getElementById("missingNotice");
  const consoleEl = document.getElementById("simConsole");

  if (!player || !opponent) {
    missing.style.display = "block";
    consoleEl.style.display = "none";
    return;
  }
  missing.style.display = "none";
  consoleEl.style.display = "block";
  renderMatchup(player, opponent);
  initStateGrid({ stateResults: GameData.ELECTORAL_MAP.map(s => ({ state: s.state, electors: s.electors, winner: null })) });
  setCounters(0, 0);

  document.getElementById("runBtn").addEventListener("click", () => {
    clearSchedule();
    document.getElementById("confettiLayer").innerHTML = "";
    document.getElementById("projectionNote").textContent = "";
    simResult = runElection(player, opponent);
    runAnimation(simResult);
  });

  document.getElementById("skipBtn").addEventListener("click", skipToEnd);
  document.getElementById("skipBtn").disabled = true;
}

document.addEventListener("DOMContentLoaded", initSimulatorPage);
