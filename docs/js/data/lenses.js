/*
 * Content for the Two Lenses view: helping someone trained in Western medicine
 * see the body the way the course's Asian Medicine material does.
 *
 * Every item carries `ref` when it comes from the course. Items with `gen: true`
 * draw on general Western or TCM knowledge that the course does not state, and the
 * UI labels them as such.
 */
window.Atlas = window.Atlas || {};

Atlas.LENSES = {};

/* Ground rules: what the system does and does not claim. */
Atlas.LENSES.rules = [
  { t: "Two maps of one body.",
    d: "Western anatomy maps structures you can dissect and measure. The channel system maps how function, sensation and feeling move through the body. You need both maps. The course teaches anatomy and physiology alongside Asian Medicine for that reason.",
    ref: "Handbook 1.6-1.7, Section 4" },
  { t: "Qi is a working model, not a lab finding.",
    d: "The handbook itself says Qi cannot be measured or identified by modern science. Treat channels and Qi as a practical way of reading and touching the body, not as a rival claim about anatomy.",
    ref: "Handbook 3.12" },
  { t: "A pattern is not a diagnosis.",
    d: "A DZRRT bodyworker must not diagnose disease or prescribe medication. Recognizing a pattern, such as cold, excess or stagnant, tells you how to shape the session. It does not tell the client what is wrong with them.",
    ref: "Handbook 5.8" },
  { t: "When in doubt, check it out.",
    d: "The contraindications are written in Western medical terms, and the DZRSI does not offer DZRRT as a substitute for medical opinion. When something does not fit, refer the client to their medical provider.",
    ref: "Handbook 2.9" },
];

/* Frame shifts: the habits of thought that change. */
Atlas.LENSES.shifts = [
  { k: "Structure → function",
    w: "An organ is a structure with a location, such as the spleen under the left ribs that filters blood.",
    e: "An 'organ' names a set of functions. The Spleen transforms food into Qi and Blood, holds Blood in the vessels, and governs the muscles and limbs. The handbook says the organ is not the actual organ but the function related to the name.",
    why: "Read every organ name as a verb, not a noun, and most of the confusion goes away.",
    ref: "Handbook 3.37, 3.42", wGen: true },
  { k: "Disease name → pattern",
    w: "Find the condition and name it: lumbar strain, tension headache, gastritis.",
    e: "Describe the pattern instead. Is it Yin or Yang, interior or exterior, cold or hot, deficient or excess? The Eight Principles organize what you observe into the nature of the condition.",
    why: "Two clients with the same Western label can need opposite sessions.",
    ref: "Handbook 3.48-3.49", wGen: true },
  { k: "Same label, different person",
    w: "Two people with low back strain get the same treatment plan.",
    e: "One person's back is worst at the end of a busy day and eases with rest: Qi pain. The other is stiff and stabbing first thing in the morning and loosens with movement: Blood pain. The first needs you to start light and go deeper; the second needs firm, slow pressure that builds.",
    why: "The questions you ask matter more than the name of the problem.",
    ref: "Types of Pain handout; Handbook 3.97", wGen: true },
  { k: "Isolated parts → one system",
    w: "Specialties divide the body: the mind goes to one doctor, the stomach to another.",
    e: "Everything is connected. Each emotion affects an organ (anger the Liver, worry the Spleen, grief the Lungs, fear the Kidneys). The Five Phases describe how each organ nourishes and restrains the others.",
    why: "A client's stress, digestion and shoulder pain may be one story, not three.",
    ref: "Handbook 3.37-3.40, 3.55", wGen: true },
  { k: "Measure → observe and ask",
    w: "Tests and imaging decide what is wrong.",
    e: "The Four Examinations: looking, listening and smelling, asking, and palpating. They look at the face, tongue, voice, pulse, and how the client describes their pain and life.",
    why: "Your hands and your questions are the assessment tools in DZRRT.",
    ref: "Handbook 3.59-3.61", wGen: true },
  { k: "Tissue damage → lack of flow",
    w: "Pain signals tissue damage or irritated nerves.",
    e: "'Where there is flow, there is no pain; where there is no flow, there is pain.' Pain means Qi, Blood or fluids have stopped moving, from excess or from deficiency. The handout compares healthy flow to a river.",
    why: "The goal of a session becomes restoring movement, not just loosening a muscle.",
    ref: "Handbook 3.16; Types of Pain handout", wGen: true },
  { k: "Treat the spot → treat the channel",
    w: "Work where it hurts.",
    e: "A point far from the problem can reach it through the channel. LI 4 on the hand is used for facial pain and sinus congestion; ST 36 below the knee for digestion. Excess pain is often worked around and above and below before it is touched directly.",
    why: "Look along the whole line, not only at the sore spot.",
    ref: "Meridian Theory part 1; Types of Pain handout" },
  { k: "Structure and function, together",
    w: "Anatomy studies structure; physiology studies function.",
    e: "Yin and Blood are the structure: tissues, hydration, the body's substance. Yang and Qi are the function: movement, warmth, activity. A stiff, dehydrated tendon is a Yin problem; a worn-out, achy muscle after a long day is a Yang problem.",
    why: "This is the most direct bridge between the two systems.",
    ref: "Types of Pain handout; Handbook 3.10-3.11" },
  { k: "Toward the heart → with the channels",
    w: "Swedish massage strokes from the limbs toward the heart to help venous and lymph return.",
    e: "Lomi Lomi works away from the heart. DZRRT moves with the channels, head to toe and medial to lateral, to smooth the channels and move the Qi. The handout adds that moving outward toward the limbs helps stuck Liver Qi.",
    why: "Stroke direction carries intention, not only mechanics.",
    ref: "Handbook 3.57-3.58; Pathogens and Emotions handout" },
];

/* Words that look familiar but mean something else. */
Atlas.LENSES.terms = [
  { t: "Spleen", w: "A lymphoid organ that filters blood and supports immunity.", e: "The center of digestion: transforms food into Qi and Blood, keeps Blood in the vessels, governs the muscles and limbs, houses the Yi (intention).", ref: "3.42" },
  { t: "Heart", w: "A muscular pump.", e: "Governs Blood and the vessels, and houses the Shen, the mind and spirit. Joy and shock affect it.", ref: "3.41, 3.55" },
  { t: "Kidney", w: "Filters blood and makes urine.", e: "Stores Jing (essence), governs growth, reproduction, bones and marrow, opens into the ears, houses the Zhi (will). Fear affects it.", ref: "3.42, 3.55" },
  { t: "Liver", w: "Metabolizes nutrients and drugs, and makes bile.", e: "Stores Blood and keeps Qi flowing smoothly. Controls the sinews, opens into the eyes. Anger and stress make its Qi stagnate.", ref: "3.43; Pathogens handout" },
  { t: "Lung", w: "Gas exchange.", e: "Also governs Qi, spreads protective Wei Qi to the skin, and holds grief.", ref: "3.42, 3.55" },
  { t: "Blood", w: "The fluid in the vessels: cells, plasma, measured by lab tests.", e: "A dense, nourishing form of Qi that moistens the body and anchors the mind. 'Blood deficiency' describes a pattern (restlessness, poor sleep), not a blood test result.", ref: "3.18-3.19" },
  { t: "Qi", w: "No direct equivalent.", e: "Vital energy: 'matter on the verge of becoming energy.' It transforms, protects, holds, moves and warms.", ref: "3.12-3.13" },
  { t: "Channel / meridian", w: "Sounds like a nerve or a blood vessel. It is neither.", e: "A pathway that carries Qi and Blood and links the surface to the organs. The sinew channels follow real groups of muscles and tendons, which is the layer DZRRT works directly.", ref: "3.26-3.27; Meridian slides" },
  { t: "Wind", w: "Weather.", e: "A pathogen whose signs come and go and move around: wandering pain, sudden onset, colds. It can carry other pathogens.", ref: "3.51; Types of Pain handout" },
  { t: "Heat", w: "Temperature.", e: "A pattern: red, warm to the touch, worse with heat, better with cold. Close to what Western medicine calls inflammation.", ref: "3.52; Pathogens handout" },
  { t: "Damp", w: "Humidity.", e: "Heaviness, swelling, foggy or sluggish feelings, worse in wet weather. Hard to clear and likely to become chronic.", ref: "3.53; Types of Pain handout" },
  { t: "Deficient / excess", w: "A lab value below or above normal.", e: "Too little or too much Qi, Blood or fluid in one place. You find it by pressure: deficient feels better with pressure, excess feels worse.", ref: "3.48; Types of Pain handout" },
];

/* Muscles mapped to the channels that run over them. */
Atlas.LENSES.muscles = [
  { m: "Erector spinae", v: "back", r: [95, 120, 110, 240], ch: ["UB"], pts: ["UB15", "UB23", "HTJJ"], d: "The Bladder channel runs down the back in two lines over the erector spinae. Kata Line 1, next to the spine, is the Hua Tuo Jia Ji points, not the Bladder channel.", ref: "Meridian slides 2-3; Handbook 2.35" },
  { m: "Hamstrings", v: "back", r: [95, 360, 110, 140], ch: ["UB", "KD", "GB"], pts: ["UB40"], d: "Kata step 19 works the hamstrings along the Kidney, Bladder and Gall Bladder channels, ending at the back of the knee.", ref: "Handbook 2.39; Meridian slide 2" },
  { m: "Gastrocnemius", v: "back", r: [95, 480, 110, 130], ch: ["UB", "KD", "GB"], pts: ["UB57"], d: "The Bladder channel runs down the middle of the calf. Kata step 20 uses lighter pressure on that line.", ref: "Handbook 2.40; Meridian slide 2" },
  { m: "IT band and TFL", v: "front", r: [170, 320, 110, 200], ch: ["GB"], pts: ["GB29", "GB31", "GB34"], d: "The Gall Bladder channel runs down the side of the body and covers the IT band and tensor fasciae latae.", ref: "Meridian slide 4" },
  { m: "Gluteals and piriformis", v: "back", r: [95, 320, 110, 90], ch: ["GB", "UB"], pts: ["GB30"], d: "Kata steps 16-17 work the gluteals and the sciatic area at Huantiao (GB 30). Piriformis is felt in the gluteal kata.", ref: "Handbook 2.39, 4.25" },
  { m: "Infraspinatus", v: "back", r: [95, 140, 110, 90], ch: ["SI"], pts: ["SI11"], d: "The Small Intestine channel covers the back of the shoulder. Long Life point SI 11 sits in the infraspinatus.", ref: "Meridian slide 5; Handbook 4.26" },
  { m: "Upper trapezius", v: "back", r: [95, 100, 110, 70], ch: ["GB"], pts: ["GB21", "GB20"], d: "GB 21 sits at the top of the trapezius; GB 20 sits between the trapezius and SCM attachments below the skull. The handout's zone for anger and stress is the top of the shoulders.", ref: "Meridian slide 9; Pathogens handout" },
  { m: "Pectoralis major", v: "front", r: [95, 130, 110, 100], ch: ["LU", "KD"], pts: ["LU1"], d: "Grief lodges in the chest. The handout works the pectorals, including LU 1.", ref: "Pathogens and Emotions handout" },
  { m: "Biceps brachii", v: "front", r: [150, 160, 120, 140], ch: ["HT", "PC", "LU"], pts: ["LU5", "PC3", "HT3"], d: "Kata step 29 works the biceps along the Heart, Pericardium and Lung channels.", ref: "Handbook 2.41" },
  { m: "Triceps", v: "back", r: [30, 160, 120, 140], ch: ["SI", "SJ", "LI"], pts: ["SI8", "LI11"], d: "Kata step 9 works the triceps along the Small Intestine, Triple Burner and Large Intestine channels.", ref: "Handbook 2.38" },
  { m: "Quadriceps", v: "front", r: [160, 340, 110, 160], ch: ["LV", "SP", "ST"], pts: ["ST34", "SP10"], d: "Kata step 38 works the quadriceps along the Liver, Spleen and Stomach channels.", ref: "Handbook 2.44" },
  { m: "Tibialis anterior", v: "front", r: [160, 470, 110, 140], ch: ["ST"], pts: ["ST36", "ST40"], d: "Long Life point ST 36 sits on tibialis anterior, below and outside the knee.", ref: "Meridian slide 7; Handbook 2.44" },
  { m: "Medial lower leg", v: "front", r: [150, 470, 90, 140], ch: ["LV", "SP"], pts: ["SP6", "SP9"], d: "The Liver and Spleen channels both run up the inside of the lower leg from the big toe, so supine work there affects both.", ref: "Meridian slide 6" },
  { m: "Masseter", v: "front", r: [110, 40, 80, 80], ch: ["ST"], pts: ["ST6", "ST7"], d: "Kata step 55 works the masseter, which the Stomach channel crosses.", ref: "Handbook 2.47, 4.23" },
];

/*
 * Translate a complaint. Each complaint has a Western view, the questions the Eastern
 * lens asks, the kata and points that address it, and when to refer.
 * Answer tags feed the pattern summary built in lenses.js.
 */
const painQs = [
  { q: "When is it worst?", a: [
    { l: "At the end of an active day; rest helps", tag: "qi" },
    { l: "First thing in the morning or after sitting; moving helps", tag: "blood" },
    { l: "No clear pattern", tag: null }] },
  { q: "What do heat and cold do?", a: [
    { l: "Heat or a warm pad feels better", tag: "cold" },
    { l: "It feels warm or red; cold feels better", tag: "hot" },
    { l: "Neither changes it", tag: null }] },
  { q: "What does firm pressure do?", a: [
    { l: "Feels good, eases it", tag: "def" },
    { l: "Makes it worse", tag: "exc" },
    { l: "Not sure", tag: null }] },
  { q: "How does it feel and move?", a: [
    { l: "It moves around or comes and goes", tag: "wind" },
    { l: "Heavy, swollen or sluggish; worse in damp weather", tag: "damp" },
    { l: "Stays in one place", tag: null }] },
  { q: "How long has it been there?", a: [
    { l: "Started recently", tag: "acute" },
    { l: "Months or longer", tag: "chronic" }] },
];

Atlas.LENSES.complaints = [
  { id: "headache", name: "Tension headache", v: "back", r: [70, 0, 160, 200],
    west: "Tight muscles in the neck, shoulders and scalp: upper trapezius, sternocleidomastoid, splenius and the suboccipitals. Often linked to posture and stress.", westRef: "Muscle chart, Handbook 4.55", westGen: true,
    qs: painQs,
    east: "Headaches are often read through Wind (sudden, shifting, with colds) or stuck Liver Qi from stress and anger rising to the head. The neck points that expel Wind sit right over the tight Western muscles.",
    eastRef: "Handbook 3.51; Pathogens handout; Meridian slide 9",
    kata: [2, 49, 51, 56, 58], pts: ["GB20", "LI4", "TAIYANG", "YINTANG", "GB21", "LV3"],
    refer: ["Unexplained dizziness or new tinnitus: refer to their medical provider, and skip anterior neck work and neck stretches (2.7, 2.12, 2.18).", "Treating headache and migraine specifically is for trained practitioners; general DZRRT as tolerated is fine (2.13).", "Atherosclerosis: no neck stretch and no anterior neck work (2.10)."] },
  { id: "back", name: "Low back pain", v: "back", r: [70, 220, 160, 180],
    west: "Strain of the erector spinae and quadratus lumborum, irritated joints, or a disc pressing on a nerve root.", westRef: "Muscle chart, Handbook 4.55-4.57; disc injury, 2.12", westGen: true,
    qs: painQs,
    east: "The low back is the home of the Kidneys and the Life Gate (Ming Men). A cold, achy low back can mean deficient Premier Fire; fear and poor posture show along the spine. The Bladder channel and the Hua Tuo Jia Ji points run right over the Western muscles.",
    eastRef: "Handbook 3.42, 3.96; Pathogens handout",
    kata: [1, 3, 15, 26], pts: ["UB23", "GV4", "HTJJ", "UB40", "UB52"],
    refer: ["Pain radiating into the legs, numbness, or unusual weakness: refer to a specialist (2.7).", "Disc injury: avoid deep pressure anywhere that produces radiating pain (2.12).", "Sciatica: avoid areas that increase the symptoms (2.17)."] },
  { id: "shoulder", name: "Stiff shoulder", v: "back", r: [20, 90, 160, 170],
    west: "Tight upper trapezius and levator scapulae, or irritated rotator cuff muscles: supraspinatus, infraspinatus, teres minor and subscapularis.", westRef: "Muscle chart, Handbook 4.57-4.58", westGen: true,
    qs: painQs,
    east: "Three channels cross the shoulder: Small Intestine over the back of the shoulder blade, Large Intestine and San Jiao over the joint, Gall Bladder over the top. Stress and anger make Liver Qi stagnate, and the handout points to the top of the shoulders.",
    eastRef: "Meridian slide 5; Pathogens handout",
    kata: [5, 6, 8, 28], pts: ["GB21", "SI11", "LI15", "SJ14", "SI9"],
    refer: ["Frozen shoulder: never force the joint (2.13).", "Rotator cuff syndrome: do not force the joint; use deep pressure with caution (2.17).", "Shoulder joint work: do not over-abduct or over-rotate (2.37)."] },
  { id: "stress", name: "Stress and poor sleep", v: "front", r: [80, 0, 140, 240],
    west: "A stress response driven by the sympathetic nervous system. Relaxation shifts the body toward parasympathetic 'rest and digest'.", westRef: "Handbook 4.72-4.73 (review material)", westGen: true,
    qs: [
      { q: "Which feeling is strongest?", a: [
        { l: "Frustration, irritability, anger", tag: "wood" },
        { l: "Over-excited, restless, can't settle", tag: "fire" },
        { l: "Worry, overthinking, going over and over things", tag: "earth" },
        { l: "Sadness, grief, loss", tag: "metal" },
        { l: "Fear, insecurity, shrinking", tag: "water" }] },
      { q: "How is the energy?", a: [
        { l: "Wired: tense, pushing, can't stop", tag: "exc" },
        { l: "Drained: tired but can't rest", tag: "def" }] },
    ],
    east: "Sleep belongs to the Shen, which the Heart houses and Blood anchors at night. Each emotion strains a different organ, so the strongest feeling points to where to focus.",
    eastRef: "Handbook 3.18, 3.22, 3.55; Pathogens handout",
    kata: [52, 56, 57, 60], pts: ["YINTANG", "KD1", "HT7", "GV20"],
    refer: ["Treating insomnia specifically is for trained practitioners (2.15).", "Sudden unexplained fatigue: do not accept the client; refer them (2.13)."] },
  { id: "digest", name: "Upset stomach", v: "front", r: [70, 180, 160, 200],
    west: "The stomach and intestines: digestion, absorption, and the gut's sensitivity to stress.", westRef: "Organ plates 8-1, 8-9, 8-10; Handbook 4.71", westGen: true,
    qs: [
      { q: "What does warmth on the belly do?", a: [
        { l: "Feels better", tag: "cold" },
        { l: "Feels worse, or there is burning", tag: "hot" },
        { l: "No difference", tag: null }] },
      { q: "What does gentle pressure on the belly do?", a: [
        { l: "Feels good", tag: "def" },
        { l: "Feels worse, bloated or full", tag: "exc" }] },
      { q: "Is there heaviness or a foggy feeling?", a: [
        { l: "Yes, heavy and sluggish", tag: "damp" },
        { l: "No", tag: null }] },
      { q: "Is the mind busy?", a: [
        { l: "Yes, lots of worry or overthinking", tag: "earth" },
        { l: "No", tag: null }] },
    ],
    east: "Digestion belongs to the Spleen and Stomach, the Earth phase. Overthinking 'knots' the Spleen's Qi; Damp clogs it. ST 36 is the classic point for building Qi from food.",
    eastRef: "Handbook 3.42, 3.53, 3.55; Meridian slides",
    kata: [37, 40], pts: ["ST36", "CV12", "ST25", "PC6", "SP6"],
    refer: ["Skip the abdomen for gastric ulcer, hernia, abdominal aortic aneurysm, or pregnancy (2.9, 2.14, 2.19, 2.33).", "Fever: no bodywork (2.13)."] },
];

/* What each answer tag means and how the session changes (Types of Pain handout; Handbook 3.48-3.55). */
Atlas.LENSES.tags = {
  qi: { k: "Qi pain (Yang)", d: "Start superficially and go deeper as tolerated. Move slowly toward a calmer, more Yin state." },
  blood: { k: "Blood pain (Yin)", d: "Start slow with firm pressure, then get more vigorous as tolerated. A little movement goes a long way." },
  cold: { k: "Cold", d: "Warm the area and move the stagnation together. Warming topicals or heat may help." },
  hot: { k: "Heat", d: "Cool rather than stimulate. Acute heat may be unwise to work directly; topicals can help." },
  def: { k: "Deficient", d: "Work the area directly, then look nearby and on the other side for excess to move." },
  exc: { k: "Excess", d: "Work around it first, above and below, then treat locally only as the client allows." },
  wind: { k: "Wind", d: "Move the Qi, especially the surface Wei Qi. Don't confuse it with compensation pain that also moves." },
  damp: { k: "Damp", d: "Move fluids, Qi and Blood deeply over several sessions; Damp settles in and becomes chronic." },
  acute: { k: "Exterior / acute", d: "Superficial and recent. Respect the handbook's cautions for recent injury (2.9)." },
  chronic: { k: "Interior / chronic", d: "Deeper and longer-standing. Expect to work over time." },
  wood: { k: "Wood: anger and the Liver", d: "Help Liver Qi move outward, as the kata does toward the limbs. Focus on the top of the shoulders; LV 3." },
  fire: { k: "Fire: joy and the Heart", d: "Settle the Shen by moving the body toward calm. Focus on the ears; Yintang and KD 1." },
  earth: { k: "Earth: worry and the Spleen", d: "Bring the focus into the abdomen and hara with deep breathing." },
  metal: { k: "Metal: grief and the Lungs", d: "Start calm and build stimulation so the client leaves invigorated. Pectorals, LU 1, scalp." },
  water: { k: "Water: fear and the Kidneys", d: "Strengthen the spine. Work Line 1 of the back; KD 1." },
};
