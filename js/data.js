/* =========================================================================
   data.js — Build-A-Politician
   All static game data: policy option lists, the 51 "states" used by the
   electoral map, the 25 pre-built opponent candidates, campaign-event
   definitions, and small generator word-banks (slogans, names, colors).
   Nothing in this file touches the DOM — it is pure data + small helpers.
   ========================================================================= */

/* -------------------------------------------------------------------------
   Policy question bank.
   Each entry: { id, label, options: [ {value, label, lean} ] }
   `lean` is a rough -2..+2 ideological weight used only to compare how
   close two candidates are on an issue (for the "issue alignment" factor
   in the election engine). It has no real-world meaning.
   ------------------------------------------------------------------------- */
const POLICY_QUESTIONS = [
  {
    id: "taxPosition",
    label: "Tax Position",
    options: [
      { value: "Strongly Lower", lean: -2 },
      { value: "Lower", lean: -1 },
      { value: "Keep Same", lean: 0 },
      { value: "Raise Slightly", lean: 1 },
      { value: "Raise Significantly", lean: 2 }
    ]
  },
  {
    id: "healthcarePosition",
    label: "Healthcare Focus",
    options: [
      { value: "Private", lean: -2 },
      { value: "Mixed", lean: -0.5 },
      { value: "Public Option", lean: 1 },
      { value: "Universal", lean: 2 }
    ]
  },
  {
    id: "educationPosition",
    label: "Education Focus",
    options: [
      { value: "Local Control", lean: -1 },
      { value: "State Control", lean: -0.3 },
      { value: "Federal Expansion", lean: 1.5 }
    ]
  },
  {
    id: "immigrationPosition",
    label: "Immigration Position",
    options: [
      { value: "Strict Enforcement", lean: -2 },
      { value: "Controlled Reform", lean: -0.5 },
      { value: "Open Pathways", lean: 1 },
      { value: "Full Amnesty Focus", lean: 2 }
    ]
  },
  {
    id: "environmentPosition",
    label: "Environment Position",
    options: [
      { value: "Deregulate Industry", lean: -2 },
      { value: "Balanced Approach", lean: 0 },
      { value: "Green Investment", lean: 1.5 },
      { value: "Aggressive Climate Action", lean: 2 }
    ]
  },
  {
    id: "crimePosition",
    label: "Crime Position",
    options: [
      { value: "Tough on Crime", lean: -2 },
      { value: "Community Policing", lean: 0 },
      { value: "Justice Reform Focus", lean: 1.5 }
    ]
  },
  {
    id: "militaryPosition",
    label: "Military Position",
    options: [
      { value: "Expand Military", lean: -2 },
      { value: "Maintain Strength", lean: -0.5 },
      { value: "Diplomacy First", lean: 1 },
      { value: "Reduce Spending", lean: 2 }
    ]
  },
  {
    id: "governmentSize",
    label: "Government Size",
    options: [
      { value: "Very Small Government", lean: -2 },
      { value: "Small Government", lean: -1 },
      { value: "Balanced", lean: 0 },
      { value: "Active Government", lean: 1 },
      { value: "Large Government", lean: 2 }
    ]
  }
];

/* Free-text focus fields (no lean scoring, flavor + card display only) */
const FOCUS_FIELDS = [
  { id: "economicFocus", label: "Economic Focus", placeholder: "e.g. Small business growth" },
  { id: "foreignPolicyFocus", label: "Foreign Policy Focus", placeholder: "e.g. Strengthening alliances" }
];

const LEADERSHIP_STYLES = [
  "Decisive", "Collaborative", "Visionary", "Pragmatic",
  "Bold", "Steady", "Reformist", "Diplomatic"
];

const SPEECH_STYLES = [
  "Fiery & Energetic", "Calm & Measured", "Folksy & Relatable",
  "Intellectual & Precise", "Inspirational", "Blunt & Direct"
];

const US_STATE_LIST = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
  "District of Columbia"
];

/* -------------------------------------------------------------------------
   Electoral map. Real state names + their real elector counts are public,
   non-partisan facts (sums to 538 / 270 to win). The "region" and "type"
   tags below are simplified fictional gameplay categories only — they do
   not represent real political leanings, they just give the engine
   something to match a candidate's stated focus against.
   ------------------------------------------------------------------------- */
const ELECTORAL_MAP = [
  { state:"Alabama", electors:9, region:"South", type:["rural","manufacturing"] },
  { state:"Alaska", electors:3, region:"West", type:["rural","resource"] },
  { state:"Arizona", electors:11, region:"West", type:["swing","urban"] },
  { state:"Arkansas", electors:6, region:"South", type:["rural"] },
  { state:"California", electors:54, region:"West", type:["urban","coastal","tech"] },
  { state:"Colorado", electors:10, region:"West", type:["swing","urban"] },
  { state:"Connecticut", electors:7, region:"Northeast", type:["urban","coastal"] },
  { state:"Delaware", electors:3, region:"Northeast", type:["coastal"] },
  { state:"Florida", electors:30, region:"South", type:["swing","coastal","urban"] },
  { state:"Georgia", electors:16, region:"South", type:["swing","urban"] },
  { state:"Hawaii", electors:4, region:"West", type:["coastal"] },
  { state:"Idaho", electors:4, region:"West", type:["rural"] },
  { state:"Illinois", electors:19, region:"Midwest", type:["urban","manufacturing"] },
  { state:"Indiana", electors:11, region:"Midwest", type:["manufacturing","rural"] },
  { state:"Iowa", electors:6, region:"Midwest", type:["rural","swing"] },
  { state:"Kansas", electors:6, region:"Midwest", type:["rural"] },
  { state:"Kentucky", electors:8, region:"South", type:["rural","manufacturing"] },
  { state:"Louisiana", electors:8, region:"South", type:["rural","resource"] },
  { state:"Maine", electors:4, region:"Northeast", type:["rural","swing"] },
  { state:"Maryland", electors:10, region:"Northeast", type:["urban","coastal"] },
  { state:"Massachusetts", electors:11, region:"Northeast", type:["urban","tech"] },
  { state:"Michigan", electors:15, region:"Midwest", type:["swing","manufacturing"] },
  { state:"Minnesota", electors:10, region:"Midwest", type:["swing","rural"] },
  { state:"Mississippi", electors:6, region:"South", type:["rural"] },
  { state:"Missouri", electors:10, region:"Midwest", type:["rural","manufacturing"] },
  { state:"Montana", electors:4, region:"West", type:["rural","resource"] },
  { state:"Nebraska", electors:5, region:"Midwest", type:["rural"] },
  { state:"Nevada", electors:6, region:"West", type:["swing","urban"] },
  { state:"New Hampshire", electors:4, region:"Northeast", type:["swing","rural"] },
  { state:"New Jersey", electors:14, region:"Northeast", type:["urban","coastal"] },
  { state:"New Mexico", electors:5, region:"West", type:["swing","rural"] },
  { state:"New York", electors:28, region:"Northeast", type:["urban","coastal","tech"] },
  { state:"North Carolina", electors:16, region:"South", type:["swing","urban"] },
  { state:"North Dakota", electors:3, region:"Midwest", type:["rural","resource"] },
  { state:"Ohio", electors:17, region:"Midwest", type:["swing","manufacturing"] },
  { state:"Oklahoma", electors:7, region:"South", type:["rural","resource"] },
  { state:"Oregon", electors:8, region:"West", type:["urban","coastal"] },
  { state:"Pennsylvania", electors:19, region:"Northeast", type:["swing","manufacturing"] },
  { state:"Rhode Island", electors:4, region:"Northeast", type:["coastal"] },
  { state:"South Carolina", electors:9, region:"South", type:["rural","coastal"] },
  { state:"South Dakota", electors:3, region:"Midwest", type:["rural"] },
  { state:"Tennessee", electors:11, region:"South", type:["rural","manufacturing"] },
  { state:"Texas", electors:40, region:"South", type:["swing","urban","resource"] },
  { state:"Utah", electors:6, region:"West", type:["rural","tech"] },
  { state:"Vermont", electors:3, region:"Northeast", type:["rural"] },
  { state:"Virginia", electors:13, region:"South", type:["swing","urban"] },
  { state:"Washington", electors:12, region:"West", type:["urban","tech","coastal"] },
  { state:"West Virginia", electors:4, region:"South", type:["rural","resource"] },
  { state:"Wisconsin", electors:10, region:"Midwest", type:["swing","rural"] },
  { state:"Wyoming", electors:3, region:"West", type:["rural","resource"] },
  { state:"District of Columbia", electors:3, region:"Northeast", type:["urban"] }
];

/* -------------------------------------------------------------------------
   Campaign events. Each has a headline, flavor text, a polling swing range
   (percentage points applied to the candidate it targets), and whether it
   targets the player, the opponent, or is drawn independently for each.
   ------------------------------------------------------------------------- */
const CAMPAIGN_EVENTS = [
  { id:"debate-excellent", label:"Excellent Debate Performance", tone:"positive", swing:[2,5],
    text:"delivered a commanding, quotable debate performance that dominated the news cycle." },
  { id:"scandal", label:"Campaign Scandal", tone:"negative", swing:[-6,-2],
    text:"was hit with a damaging scandal that put the campaign on the defensive for days." },
  { id:"endorsement", label:"Major Endorsement", tone:"positive", swing:[1,4],
    text:"received a high-profile endorsement that energized the base." },
  { id:"econ-boom", label:"Economic Boom", tone:"positive", swing:[1,3],
    text:"benefited from a wave of strong economic news right before voters headed to the polls." },
  { id:"econ-recession", label:"Economic Downturn", tone:"negative", swing:[-4,-1],
    text:"faced tough questions as economic anxiety spread among undecided voters." },
  { id:"disaster", label:"Natural Disaster Response", tone:"mixed", swing:[-3,3],
    text:"response to a natural disaster became a defining moment of the final stretch." },
  { id:"speech", label:"Electrifying Speech", tone:"positive", swing:[1,4],
    text:"gave a speech that instantly went viral and reset the campaign narrative." },
  { id:"ad-success", label:"Advertisement Success", tone:"positive", swing:[1,3],
    text:"rolled out an ad campaign that resonated deeply with swing voters." },
  { id:"fundraising-record", label:"Fundraising Record", tone:"positive", swing:[1,3],
    text:"shattered fundraising records, flooding the airwaves in the final weeks." },
  { id:"volunteer-surge", label:"Volunteer Surge", tone:"positive", swing:[1,2],
    text:"saw a surge of grassroots volunteers supercharge the ground game." },
  { id:"fact-check", label:"Fact-Check Controversy", tone:"negative", swing:[-3,-1],
    text:"was dogged by a fact-check controversy that dominated cable news." },
  { id:"town-hall", label:"Town Hall Success", tone:"positive", swing:[1,3],
    text:"connected with undecided voters in a widely praised town hall." },
  { id:"weather", label:"Election Day Weather", tone:"mixed", swing:[-2,2],
    text:"turnout was reshaped by election-day weather patterns across key regions." },
  { id:"gaffe", label:"Public Gaffe", tone:"negative", swing:[-4,-1],
    text:"stumbled through a widely mocked public gaffe in the campaign's final days." },
  { id:"momentum", label:"Late Momentum Shift", tone:"positive", swing:[1,3],
    text:"caught a wave of late momentum as undecided voters broke in one direction." },
  { id:"october-surprise", label:"October Surprise", tone:"mixed", swing:[-5,5],
    text:"was rocked by a last-minute October surprise that scrambled the race." }
];

/* Slogan generator word banks */
const SLOGAN_OPENERS = [
  "Forward Together", "A New Chapter", "Building", "Stronger", "Rise Up for",
  "The Future is", "Real Leadership for", "Restoring", "One Nation,", "Time for"
];
const SLOGAN_CLOSERS = [
  "for Every Family", "for a Brighter Tomorrow", "Starts Now", "with Us",
  "for the People", "for Main Street", "That Works", "for All of Us",
  "for the Next Generation", "Together"
];

function generateRandomSlogan() {
  const o = SLOGAN_OPENERS[Math.floor(Math.random() * SLOGAN_OPENERS.length)];
  const c = SLOGAN_CLOSERS[Math.floor(Math.random() * SLOGAN_CLOSERS.length)];
  return `${o} ${c}`;
}

const FIRST_NAMES = ["Alex","Jordan","Morgan","Taylor","Casey","Riley","Sam","Jamie",
  "Avery","Quinn","Reese","Emerson","Rowan","Dakota","Skyler","Elliot"];
const LAST_NAMES = ["Winters","Hale","Prescott","Reyes","Whitfield","Barnett","Sinclair",
  "Delgado","Ashford","Monroe","Callahan","Ferris","Whitmore","Castellan","Beaumont"];

function generateRandomName() {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}

const LOGO_COLOR_PALETTE = ["#c8102e", "#0a2540", "#d4af37", "#1f4e79", "#7a1f2b", "#2e6b4f", "#4a2f6b"];

/* -------------------------------------------------------------------------
   25 fictional opponent candidates.
   Each is an ORIGINAL fictional character with a fictional name. None use
   the name or likeness of any real person. Party names are invented.
   All fields mirror the shape produced by the candidate builder so the
   election engine can treat player-built and pre-built candidates
   identically.
   ------------------------------------------------------------------------- */
const PREBUILT_POLITICIANS = [
  mk("Jack Thompson","Golden Freedom Party","Make It Great Again",78,"New York","Businessman & Former Host","Business Executive","Bold","Fiery & Energetic","Trade protection and deregulation","America First diplomacy","Local Control","Private","Strict Enforcement","Deregulate Industry","Tough on Crime","Strongly Lower","Expand Military","Small Government",{charisma:88,integrity:40,publicSpeaking:82,debateSkill:78,fundraising:90,popularity:80,experience:55,intelligence:60}),
  mk("Michael Carter","Unity Coalition","Hope and Change",47,"Illinois","Community Organizer & Senator","Attorney","Visionary","Inspirational","Middle-class tax relief","Multilateral diplomacy","Federal Expansion","Public Option","Controlled Reform","Green Investment","Community Policing","Raise Slightly","Maintain Strength","Active Government",{charisma:92,integrity:75,publicSpeaking:95,debateSkill:85,fundraising:80,popularity:82,experience:60,intelligence:88}),
  mk("William Harris","Working Families Party","Restoring the Soul of the Nation",78,"Delaware","Longtime Senator & Vice President","Career Legislator","Steady","Calm & Measured","Middle-class jobs push","Rebuild alliances","State Control","Mixed","Controlled Reform","Balanced Approach","Community Policing","Keep Same","Maintain Strength","Balanced",{charisma:60,integrity:70,publicSpeaking:55,debateSkill:60,fundraising:70,popularity:58,experience:95,intelligence:65}),
  mk("Thomas Walker","Liberty & Prosperity Party","Morning in America",73,"California","Actor Turned Governor","Former Governor","Bold","Inspirational","Supply-side tax cuts","Peace through strength","Local Control","Private","Strict Enforcement","Deregulate Industry","Tough on Crime","Strongly Lower","Expand Military","Very Small Government",{charisma:90,integrity:68,publicSpeaking:93,debateSkill:80,fundraising:75,popularity:85,experience:70,intelligence:65}),
  mk("Nathan Adams","Founders' Party","A Union Worth Fighting For",57,"Virginia","Military General","General","Decisive","Calm & Measured","Agrarian self-sufficiency","Neutrality & caution","Local Control","Private","Strict Enforcement","Balanced Approach","Tough on Crime","Lower","Expand Military","Very Small Government",{charisma:70,integrity:95,publicSpeaking:60,debateSkill:55,fundraising:40,popularity:88,experience:90,intelligence:75}),
  mk("Daniel Brooks","People's Progress Party","Not Me, Us",81,"Vermont","Longtime Independent Senator","Legislator","Reformist","Blunt & Direct","Wealth tax & wage reform","Diplomacy over intervention","Federal Expansion","Universal","Full Amnesty Focus","Aggressive Climate Action","Justice Reform Focus","Raise Significantly","Reduce Spending","Large Government",{charisma:75,integrity:90,publicSpeaking:70,debateSkill:82,fundraising:65,popularity:78,experience:80,intelligence:80}),
  mk("Samuel Grant","National Union Party","A House United",52,"Kentucky","Frontier Lawyer","Attorney","Visionary","Inspirational","Rebuilding industry","National unity first","State Control","Private","Controlled Reform","Balanced Approach","Community Policing","Keep Same","Expand Military","Balanced",{charisma:82,integrity:97,publicSpeaking:88,debateSkill:90,fundraising:35,popularity:85,experience:75,intelligence:90}),
  mk("Henry Marshall","Progressive Rough Riders Party","A Square Deal for All",42,"New York","Reformist Governor","Former Governor","Bold","Fiery & Energetic","Trust-busting & fair labor","Big-stick diplomacy","State Control","Mixed","Controlled Reform","Balanced Approach","Tough on Crime","Raise Slightly","Expand Military","Active Government",{charisma:88,integrity:80,publicSpeaking:85,debateSkill:78,fundraising:60,popularity:90,experience:65,intelligence:85}),
  mk("Edward Franklin","New Deal Coalition","The Only Thing We Have to Fear",51,"New York","Governor During Crisis","Former Governor","Steady","Inspirational","Public works & relief programs","Arsenal of democracy","Federal Expansion","Public Option","Controlled Reform","Balanced Approach","Community Policing","Raise Significantly","Expand Military","Large Government",{charisma:85,integrity:78,publicSpeaking:90,debateSkill:75,fundraising:55,popularity:92,experience:85,intelligence:88}),
  mk("James Sullivan","New Frontier Party","Ask What You Can Do",43,"Massachusetts","War Hero & Senator","Senator","Visionary","Inspirational","Tax cuts for growth","Space race & containment","State Control","Mixed","Controlled Reform","Balanced Approach","Community Policing","Lower","Maintain Strength","Balanced",{charisma:95,integrity:70,publicSpeaking:92,debateSkill:88,fundraising:65,popularity:90,experience:55,intelligence:85}),
  mk("Robert Collins","Silent Majority Party","Law and Order",56,"California","Vice President Turned President","Attorney","Decisive","Blunt & Direct","Wage & price controls","Detente with rivals","Local Control","Private","Strict Enforcement","Deregulate Industry","Tough on Crime","Keep Same","Maintain Strength","Balanced",{charisma:60,integrity:35,publicSpeaking:65,debateSkill:70,fundraising:55,popularity:55,experience:80,intelligence:82}),
  mk("David Cooper","Peanut Farmers Alliance","A Government as Good as Its People",52,"Georgia","Peanut Farmer & Governor","Former Governor","Steady","Calm & Measured","Energy independence","Human rights diplomacy","State Control","Mixed","Controlled Reform","Green Investment","Justice Reform Focus","Keep Same","Reduce Spending","Balanced",{charisma:55,integrity:88,publicSpeaking:50,debateSkill:58,fundraising:45,popularity:52,experience:60,intelligence:78}),
  mk("Christopher Evans","Compassionate Union Party","A Uniter, Not a Divider",54,"Texas","Governor & Businessman","Former Governor","Steady","Folksy & Relatable","Tax cuts & ownership society","Preemptive security doctrine","Local Control","Private","Strict Enforcement","Deregulate Industry","Tough on Crime","Lower","Expand Military","Small Government",{charisma:68,integrity:60,publicSpeaking:60,debateSkill:55,fundraising:80,popularity:60,experience:55,intelligence:60}),
  mk("Andrew Mitchell","New Democrat Alliance","Building a Bridge to Tomorrow",46,"Arkansas","Governor & Policy Wonk","Former Governor","Pragmatic","Folksy & Relatable","Balanced budgets","Global trade expansion","State Control","Mixed","Controlled Reform","Balanced Approach","Community Policing","Keep Same","Maintain Strength","Balanced",{charisma:90,integrity:55,publicSpeaking:88,debateSkill:85,fundraising:75,popularity:75,experience:65,intelligence:88}),
  mk("Victoria Lewis","Forward Horizon Party","For the People",59,"California","Prosecutor & Senator","Attorney","Collaborative","Inspirational","Middle-class tax credits","Alliance rebuilding","Federal Expansion","Public Option","Controlled Reform","Green Investment","Justice Reform Focus","Raise Slightly","Maintain Strength","Active Government",{charisma:78,integrity:72,publicSpeaking:80,debateSkill:82,fundraising:78,popularity:68,experience:60,intelligence:82}),
  mk("Rebecca Turner","Glass Ceiling Coalition","Stronger Together",68,"New York","Senator & Secretary of State","Attorney","Pragmatic","Intellectual & Precise","Middle-class investment","Experienced global diplomacy","State Control","Mixed","Controlled Reform","Green Investment","Community Policing","Raise Slightly","Maintain Strength","Balanced",{charisma:65,integrity:60,publicSpeaking:70,debateSkill:88,fundraising:85,popularity:60,experience:92,intelligence:90}),
  mk("Harold Whitmore","Silent Generation Party","Steady as She Goes",68,"Missouri","Farmer Turned Senator","Senator","Steady","Calm & Measured","Balanced budget focus","Firm containment policy","State Control","Private","Controlled Reform","Balanced Approach","Tough on Crime","Keep Same","Maintain Strength","Balanced",{charisma:52,integrity:85,publicSpeaking:48,debateSkill:60,fundraising:40,popularity:50,experience:88,intelligence:70}),
  mk("Franklin Osgood","Coastal Reform Party","A Fresh Wind Blowing",50,"Massachusetts","Governor & Diplomat","Former Governor","Diplomatic","Intellectual & Precise","Innovation economy","Multilateral cooperation","Federal Expansion","Public Option","Controlled Reform","Aggressive Climate Action","Community Policing","Raise Slightly","Maintain Strength","Active Government",{charisma:72,integrity:82,publicSpeaking:75,debateSkill:80,fundraising:60,popularity:62,experience:58,intelligence:90}),
  mk("Gregory Vance","Heartland Values Party","Faith, Family, Freedom",61,"Ohio","Small-Town Mayor","Former Mayor","Bold","Folksy & Relatable","Manufacturing revival","Non-interventionist","Local Control","Private","Strict Enforcement","Deregulate Industry","Tough on Crime","Lower","Maintain Strength","Small Government",{charisma:74,integrity:65,publicSpeaking:76,debateSkill:70,fundraising:58,popularity:64,experience:45,intelligence:66}),
  mk("Patricia Reyes","New Horizons Party","Lifting Every Voice",55,"New Mexico","Civil Rights Attorney","Attorney","Collaborative","Inspirational","Living-wage economy","Human rights first","Federal Expansion","Universal","Open Pathways","Aggressive Climate Action","Justice Reform Focus","Raise Significantly","Reduce Spending","Large Government",{charisma:80,integrity:88,publicSpeaking:84,debateSkill:78,fundraising:55,popularity:70,experience:50,intelligence:85}),
  mk("Douglas Kerrigan","Industrial Heartland Party","Bring the Jobs Home",63,"Michigan","Union Organizer","Union Leader","Blunt","Blunt & Direct","Protect manufacturing jobs","Fair-trade renegotiation","Local Control","Mixed","Controlled Reform","Balanced Approach","Tough on Crime","Keep Same","Maintain Strength","Balanced",{charisma:66,integrity:70,publicSpeaking:64,debateSkill:60,fundraising:50,popularity:60,experience:62,intelligence:60}),
  mk("Eleanor Vance","Suburban Alliance Party","Common Sense, Common Ground",49,"Colorado","Small Business Owner","Entrepreneur","Pragmatic","Calm & Measured","Small business tax relief","Cautious engagement","State Control","Mixed","Controlled Reform","Balanced Approach","Community Policing","Lower","Maintain Strength","Small Government",{charisma:70,integrity:76,publicSpeaking:68,debateSkill:65,fundraising:72,popularity:66,experience:40,intelligence:72}),
  mk("Marcus Delaney","Bright Future Party","Innovate. Include. Inspire.",39,"Washington","Tech Entrepreneur","CEO","Visionary","Intellectual & Precise","Innovation-driven growth","Digital-age diplomacy","Federal Expansion","Public Option","Controlled Reform","Green Investment","Justice Reform Focus","Raise Slightly","Reduce Spending","Active Government",{charisma:76,integrity:68,publicSpeaking:72,debateSkill:74,fundraising:88,popularity:65,experience:30,intelligence:94}),
  mk("Rosalind Bennett","Prairie Independence Party","Rooted in the Land",58,"Nebraska","Rancher & State Legislator","Rancher","Steady","Folksy & Relatable","Agricultural subsidies","Non-interventionist","Local Control","Private","Strict Enforcement","Balanced Approach","Tough on Crime","Lower","Maintain Strength","Small Government",{charisma:62,integrity:82,publicSpeaking:55,debateSkill:52,fundraising:35,popularity:58,experience:48,intelligence:60}),
  mk("Theodore Ashcombe","Constitutional Guard Party","Return to First Principles",66,"Texas","Constitutional Scholar & Judge","Judge","Decisive","Intellectual & Precise","Balanced-budget amendment","Sovereignty-first policy","Local Control","Private","Strict Enforcement","Deregulate Industry","Tough on Crime","Strongly Lower","Expand Military","Very Small Government",{charisma:58,integrity:90,publicSpeaking:62,debateSkill:85,fundraising:48,popularity:54,experience:70,intelligence:92})
];

function mk(name, party, slogan, age, state, experience, occupation, leadership, speech,
  economicFocus, foreignPolicyFocus, educationPosition, healthcarePosition, immigrationPosition,
  environmentPosition, crimePosition, taxPosition, militaryPosition, governmentSize, traits) {
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name, party, slogan, age, state, experience, occupation, leadership, speech,
    economicFocus, foreignPolicyFocus,
    educationPosition, healthcarePosition, immigrationPosition, environmentPosition,
    crimePosition, taxPosition, militaryPosition, governmentSize,
    traits,
    logoColor: LOGO_COLOR_PALETTE[Math.floor(Math.random() * LOGO_COLOR_PALETTE.length)],
    prebuilt: true
  };
}

/* Expose everything as a single namespace to avoid polluting globals */
window.GameData = {
  POLICY_QUESTIONS, FOCUS_FIELDS, LEADERSHIP_STYLES, SPEECH_STYLES,
  US_STATE_LIST, ELECTORAL_MAP, CAMPAIGN_EVENTS, LOGO_COLOR_PALETTE,
  PREBUILT_POLITICIANS,
  generateRandomSlogan, generateRandomName
};
