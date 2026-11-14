/*
 * Theory tables used by the Five Phases, Depth and pain panels.
 * Facts are summarized from the handbook and class handouts; references are inline.
 */
window.Atlas = window.Atlas || {};

/* Five Phases correspondences (Handbook 3.40 and 3.92). */
Atlas.PHASES = {
  order: ["wood", "fire", "earth", "metal", "water"],
  ref: "Handbook 3.37-3.40, 3.91-3.92",
  rows: [
    ["Season", "Spring", "Summer", "Late summer", "Autumn", "Winter"],
    ["Direction", "East", "South", "Center", "West", "North"],
    ["Climate", "Wind", "Heat", "Damp", "Dryness", "Cold"],
    ["Color", "Green", "Red", "Yellow", "White", "Black"],
    ["Taste", "Sour", "Bitter", "Sweet", "Pungent", "Salty"],
    ["Smell", "Rancid", "Burnt", "Fragrant", "Pungent", "Putrid"],
    ["Sound", "Shouting", "Laughing", "Singing", "Weeping", "Groaning"],
    ["Emotion", "Anger", "Joy", "Pensiveness", "Grief", "Fear"],
    ["Sense organ", "Eyes", "Tongue", "Mouth", "Nose", "Ears"],
    ["Tissue", "Tendons", "Vessels", "Flesh / muscles", "Skin", "Bones"],
    ["Fluid", "Tears", "Sweat", "Saliva", "Mucus", "Urine / synovial"],
    ["Spirit", "Hun", "Shen", "Yi", "Po", "Zhi"],
    ["Development", "Birth", "Growth", "Change", "Harvest", "Storing"],
  ],
  organs: {
    wood: { yin: "LV", yang: "GB" },
    fire: { yin: "HT", yang: "SI", yin2: "PC", yang2: "SJ" },
    earth: { yin: "SP", yang: "ST" },
    metal: { yin: "LU", yang: "LI" },
    water: { yin: "KD", yang: "UB" },
  },
  /* Personality types, summarized (Handbook 3.94-3.95). */
  types: {
    wood: "Bold and decisive, does well under pressure, a critical thinker. Out of balance: obstinate, aggressive, driven to over-direct.",
    fire: "Warm, generous, affectionate and intuitive. Out of balance: over-excited, flushed, unrealistic expectations.",
    earth: "The reliable friend or mother figure; social, supportive, always serving. Out of balance: worry, obsessing over detail, overprotective.",
    metal: "Philosopher or sage; self-disciplined, logical, holds lofty ideals. Out of balance: dogmatic, rigid, thinks but never acts.",
    water: "Tough, self-possessed and independent, with deep reserves and steady will. Out of balance: rigid, suspicious, fearful.",
  },
  /* Emotions and the handout's DZRRT treatment ideas. */
  emotions: {
    wood: { e: "Anger", effect: "Makes Qi rise (3.55). Liver Qi stagnates easily, causing stagnation pain and Heat; stress acts the same way.",
      tx: "Encourage Liver Qi to move outward, the way the kata moves out toward the limbs.", zone: "Top of the shoulders", pts: ["LV3", "GB21"] },
    fire: { e: "Joy", effect: "Slows the Qi (3.55). Over-excited joy, manic laughter, or chasing joy unsettles the Heart.",
      tx: "Settle the Shen: move the body from agitation to a more Yin, relaxed state, so the mind relaxes too.", zone: "The ears", pts: ["YINTANG", "KD1", "HT7"] },
    earth: { e: "Pensiveness", effect: "Knots the Qi (3.55). The constant grinding of thoughts.",
      tx: "Bring the focus inward into the abdomen and hara, with deep breathing during the kata.", zone: "The abdomen", pts: ["CV6", "CV12", "ST25"] },
    metal: { e: "Grief", effect: "Sadness dissolves the Qi (3.55). Grief lodges in the chest.",
      tx: "Start calm and Yin, then slowly increase stimulation so the client leaves invigorated.", zone: "Pectorals and scalp", pts: ["LU1", "CV17", "GV20"] },
    water: { e: "Fear", effect: "Makes Qi descend (3.55). The Kidney sinew channel runs up the spine, so fear shows in posture: shrinking, hunching.",
      tx: "Strengthen the spine.", zone: "Line 1 of the back (Hua Tuo Jia Ji)", pts: ["HTJJ", "KD1"] },
  },
  extraEmotions: [
    { e: "Worry", organ: "Lungs and Spleen", effect: "Knots the Qi" },
    { e: "Shock / fright", organ: "Heart (and Kidney, per the handout)", effect: "Scatters the Qi" },
  ],
};

/* Six types of pain (Types of Pain handout; Handbook 3.49, 3.97). */
Atlas.PAIN = [
  { k: "Qi", feel: "Dull, achy, sore", worse: "Activity; worse at the end of an active day", better: "Rest", col: "yang",
    tx: "Start superficial (Yang) and go deeper as tolerated (Yin). Move slowly toward a Yin state." },
  { k: "Blood", feel: "Sharp, stabbing, fixed, stiff", worse: "Inactivity; first thing in the morning", better: "Gentle activity", col: "yin",
    tx: "Start slow with firm pressure (Yin), then slowly more vigorous (Yang). Once moving, a rolling boulder carries itself." },
  { k: "Hot", feel: "Warm to touch, red", worse: "Heat", better: "Cold", col: "yang",
    tx: "Cool, and restore Yin fluids. Acute heat is often unwise to work; topicals may help." },
  { k: "Cold", feel: "Cold to touch, sharp or achy, fixed, stiff, contracting", worse: "Cold", better: "Heat", col: "yin",
    tx: "Warm and move the stagnation together." },
  { k: "Damp", feel: "Heavy, foggy, sluggish; swelling", worse: "Wet, humid or rainy weather", better: "", col: "yin",
    tx: "Move Fluids, Qi and Blood deeply over time. Damp is the pain most likely to become chronic." },
  { k: "Wind", feel: "Moves around, comes and goes", worse: "Windy weather", better: "", col: "yang",
    tx: "Move the Qi, especially the Wei Qi. Wind can carry the other pathogens." },
];

/* Deficient vs excess by pressure (Types of Pain handout; Handbook 3.48). */
Atlas.PRESSURE = {
  def: "Feels better with pressure. Massage directly, then look nearby and on the opposite side for the excess and move it.",
  exc: "Feels worse with pressure. Massage around it first (above, below, proximal, distal), then treat locally if the client allows.",
};

/* Layers of the channel system (Handbook 3.26; Meridian Theory part 1 slides). */
Atlas.LAYERS = [
  { k: "Cutaneous regions", lvl: "Wei", note: "The most superficial layer. Qi and Blood nourish the skin.", ref: "3.29" },
  { k: "Sinew (myofascial) channels", lvl: "Wei", note: "What DZRRT massages directly. No points; flow from the digits to the trunk; bind the joints.", ref: "3.27-3.29" },
  { k: "Luo (connecting) channels", lvl: "Wei", note: "Branch off horizontally, link Yin-Yang pairs, can be seen, hold excess emotion and pathogens.", ref: "3.30" },
  { k: "Primary channels", lvl: "Ying", note: "The 12 organ channels. Reached at the acupoints; carry Ying Qi in a 24-hour circuit.", ref: "3.31-3.32" },
  { k: "Divergent channels", lvl: "Wei and Yuan", note: "Branch from the primary channels through the major joints to the organs; divert pathogens away from them.", ref: "3.33" },
  { k: "Extraordinary vessels", lvl: "Yuan", note: "Deep reservoirs of Jing and Yuan Qi; only Du and Ren have their own points.", ref: "3.34-3.36" },
];

/* Depth model by zone: hands/feet shallow, elbows/knees deepen, trunk deepest, face/chest junction rises (Meridian Theory part 1). */
Atlas.ZONES = {
  d: { name: "Hands and feet", depth: 1 },
  l: { name: "Forearm and lower leg", depth: 2.3 },
  j: { name: "Elbow and knee", depth: 3.4 },
  p: { name: "Upper arm and thigh", depth: 4.2 },
  t: { name: "Trunk", depth: 4.6 },
  n: { name: "Neck", depth: 2.6 },
  h: { name: "Head and face", depth: 1.6 },
};

/* The Eight Principles as a quick reference (Handbook 3.48). */
Atlas.EIGHT = [
  ["Yin", "Yang", "Worse with inactivity, at night; swollen, heavy", "Worse with activity, during the day"],
  ["Interior", "Exterior", "Chronic, deep, on the torso", "Acute, superficial, on the limbs"],
  ["Cold", "Hot", "Cold to touch, relieved by heat", "Hot to touch, relieved by cold"],
  ["Deficient", "Excess", "Better with pressure", "Worse with pressure"],
];
