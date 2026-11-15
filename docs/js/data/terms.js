/*
 * Body Terms: the Western anatomical vocabulary the handbook asks students to know.
 *
 * The term lists come from the Shoden worksheets reprinted in the Chuden handbook:
 * terms of relationship and movements (Handbook 4.7), bony features (4.5) and
 * palpable landmarks (4.6). The handbook leaves the definitions blank for the
 * student to fill in, so every definition here is general knowledge.
 *
 * `plain` lists the everyday words this atlas uses in its point locations for the
 * same idea, and `re` finds them, so each term can show the points it describes.
 * `pts` adds points that sit on a landmark but don't name it in their text.
 */
window.Atlas = window.Atlas || {};

Atlas.TERMS = {
  positions: [
    {
      t: "Western anatomical position",
      d: "Standing upright and facing forward, arms at the sides, palms facing forward, feet together. Every direction word is measured from this pose, whatever position the body is actually in.",
      ref: "Handbook 4.5 names it; the description is general knowledge",
      gen: true,
    },
    {
      t: "T.A.M. anatomical position",
      d: "Traditional Asian Medicine raises the hands above the head. In this pose the yin channels all flow upward, from yin earth toward yang heaven, and the yang channels all flow downward.",
      ref: "Handbook 3.30; drawn for homework in 3.7",
    },
  ],

  /* Paired terms of relationship (Handbook 4.7). `draw` picks the overlay in the view. */
  directions: [
    {
      id: "si", a: "Superior", aAlt: "cranial", b: "Inferior", bAlt: "caudal", draw: "si", plain: "above · below",
      da: "Toward the head, or higher up.", db: "Toward the feet, or lower down.",
      ex: "SP10 sits above the kneecap and ST36 below it: SP10 is superior to ST36.",
      re: /\b(above|below|superior|inferior|upper|lower)\b/i, ref: "Handbook 4.7",
    },
    {
      id: "ap", a: "Anterior", aAlt: "ventral", b: "Posterior", bAlt: "dorsal", draw: "ap", plain: "front · back",
      da: "Toward the front of the body.", db: "Toward the back of the body.",
      ex: "The Ren vessel runs up the anterior midline and the Du vessel up the posterior midline.",
      re: /\b(front|back of|anterior|posterior|rear)\b/i, ch: ["REN", "DU"], ref: "Handbook 4.7",
    },
    {
      id: "ml", a: "Medial", b: "Lateral", draw: "ml", plain: "inner · outer",
      da: "Toward the midline of the body.", db: "Away from the midline, toward the side.",
      ex: "The Spleen and Liver channels run up the medial lower leg; the Stomach and Gall Bladder channels run down its lateral side.",
      tcm: "In general TCM the yin channels run on the medial (inner) surface of the limbs and the yang channels on the lateral and posterior surfaces.",
      re: /\b(medial|lateral|inner|outer|inside|outside)\b/i, ch: ["SP", "LV", "ST", "GB"], ref: "Handbook 4.7",
    },
    {
      id: "pd", a: "Proximal", b: "Distal", draw: "pd", plain: "nearer the trunk · farther from it",
      da: "On a limb, closer to where it attaches to the trunk.", db: "On a limb, farther from the trunk, toward the fingers or toes.",
      ex: "The elbow is proximal to the wrist. The Jing-Well points at the fingertips and toes are the most distal points on their channels; the He-Sea points at the elbow and knee are the most proximal of the five transport points.",
      cats: ["well", "sea"], ref: "Handbook 4.7",
    },
    {
      id: "sd", a: "Superficial", b: "Deep", draw: "sd", plain: "near the surface · far below it",
      da: "Toward the surface of the body.", db: "Farther below the surface.",
      ex: "Skin is superficial to muscle and muscle is superficial to bone. The Depth & Pain page shows how deep each channel layer sits.",
      re: /\b(superficial|deep|deeply)\b/i, ref: "Handbook 4.7",
    },
    {
      id: "ru", a: "Radial", b: "Ulnar", draw: "ru", plain: "thumb side · little-finger side",
      da: "On the forearm and hand, the thumb side.", db: "On the forearm and hand, the little-finger side.",
      ex: "The Lung channel runs along the radial side of the forearm to the thumb; the Heart channel runs along the ulnar side to the little finger.",
      re: /\b(radial|ulnar|thumb side|little.finger)/i, ch: ["LU", "HT"],
    },
    {
      id: "pp", a: "Palmar · Plantar", b: "Dorsal (hand and foot)", draw: "pp", plain: "palm, sole · back of the hand, top of the foot",
      da: "Palmar is the palm of the hand; plantar is the sole of the foot.", db: "Dorsal is the back of the hand or the top of the foot.",
      ex: "PC8 is in the palm and KD1 is on the sole. LI4 is on the back of the hand and LV3 on the top of the foot.",
      re: /\b(palm|palmar|sole|plantar|back of the hand|top of the foot|dorsum|dorsal)\b/i,
    },
    {
      id: "mid", a: "Midline", b: "Bilateral", draw: "mid", plain: "midline · on both sides",
      da: "The vertical center line that divides the body into left and right.", db: "Found on both sides of the body. Every point on the 12 primary channels is bilateral; Ren and Du points sit on the midline.",
      ex: "CV17 on the front and GV14 on the back are midline points. LI4 is bilateral, so there is one on each hand.",
      re: /\bmidline\b/i, ch: ["REN", "DU"],
    },
  ],

  planes: [
    { id: "sag", t: "Sagittal plane", d: "A vertical plane that divides the body into left and right parts. The midsagittal plane runs exactly down the midline.", ex: "Flexion and extension happen in this plane." },
    { id: "fro", t: "Frontal (coronal) plane", d: "A vertical plane that divides the body into front and back parts. The figures on this site are drawn in it.", ex: "Abduction and adduction happen in this plane." },
    { id: "tra", t: "Transverse plane", d: "A horizontal plane that divides the body into upper and lower parts.", ex: "Rotation happens in this plane." },
  ],

  /*
   * Movements. The first five pairs are on the Handbook 4.7 worksheet; the rest
   * appear in the handbook's muscle charts. Muscles are from the chart on
   * Handbook 4.46-4.48 unless `musGen` marks them as general knowledge.
   */
  moves: [
    {
      id: "flex", demo: "elbow", view: "Side view, facing right",
      a: { t: "Flexion", st: "a", d: "Bending a joint so the angle between the two parts gets smaller." },
      b: { t: "Extension", st: "b", d: "Straightening a joint so the angle gets larger." },
      mus: "Flexion: biceps brachii and brachialis at the elbow; deltoid and pectoralis major at the shoulder; the hamstrings at the knee. Extension: latissimus dorsi at the shoulder; the hamstrings at the hip.",
      kata: [37], ref: "Handbook 4.7",
    },
    {
      id: "abd", demo: "shoulder", view: "Front view",
      a: { t: "Abduction", st: "a", d: "Moving a limb away from the midline." },
      b: { t: "Adduction", st: "b", d: "Moving a limb back toward, or across, the midline." },
      mus: "Abduction: deltoid and supraspinatus at the shoulder; gluteus medius at the hip. Adduction: pectoralis major, latissimus dorsi and teres major at the shoulder; the adductor group at the hip.",
      kata: [8], ref: "Handbook 4.7",
    },
    {
      id: "rot", demo: "rotate", view: "From above, elbow bent, front of the body at the bottom",
      a: { t: "Lateral (external) rotation", st: "a", d: "Turning a limb around its long axis so its front faces away from the midline." },
      b: { t: "Medial (internal) rotation", st: "b", d: "Turning a limb around its long axis so its front faces toward the midline." },
      mus: "Lateral rotation: teres minor at the shoulder. Medial rotation: teres major and latissimus dorsi at the shoulder; gluteus medius, the adductors and the hamstrings at the hip.",
      kata: [8, 15], ref: "Handbook 4.7",
    },
    {
      id: "dorsi", demo: "ankle", view: "Side view, toes to the right",
      a: { t: "Dorsiflexion", st: "a", d: "Bending the ankle so the toes lift toward the shin." },
      b: { t: "Plantarflexion", st: "b", d: "Pointing the foot and toes down, away from the shin." },
      mus: "Dorsiflexion: tibialis anterior. Plantarflexion: soleus and fibularis (peroneus) longus.",
      kata: [], ref: "Handbook 4.7",
    },
    {
      id: "pro", demo: "forearm", view: "Front view of the forearm and hand",
      a: { t: "Supination", st: "a", d: "Turning the forearm so the palm faces forward, or up. The palm faces forward in anatomical position." },
      b: { t: "Pronation", st: "b", d: "Turning the forearm so the palm faces backward, or down." },
      mus: "Supination: biceps brachii (Handbook 4.46-4.48) and supinator. Pronation: pronator teres and pronator quadratus. Handbook 4.27 asks you to name these four.",
      musGen: true, kata: [], ref: "Handbook 4.27",
    },
    {
      id: "inv", demo: "foot", view: "Front view of a foot, midline to the right",
      a: { t: "Inversion", st: "a", d: "Tilting the foot so the sole turns inward, toward the other foot." },
      b: { t: "Eversion", st: "b", d: "Tilting the foot so the sole turns outward, away from the other foot." },
      mus: "Inversion: tibialis anterior and soleus. Eversion: fibularis (peroneus) longus.",
      kata: [], ref: "Handbook 4.46-4.48",
    },
    {
      id: "elev", demo: "shrug", view: "Front view",
      a: { t: "Elevation", st: "a", d: "Lifting a part upward, as in shrugging the shoulders." },
      b: { t: "Depression", st: "b", d: "Lowering a part, as in dropping the shoulders." },
      mus: "Elevation: upper trapezius and levator scapulae. Depression: lower trapezius.",
      musGen: true, kata: [], ref: "General knowledge",
    },
    {
      id: "prot", demo: "scapula", view: "From above, front of the body at the bottom",
      a: { t: "Protraction", st: "a", d: "Moving a part forward, as in rounding the shoulders so the shoulder blades slide apart." },
      b: { t: "Retraction", st: "b", d: "Moving a part backward, as in squeezing the shoulder blades together." },
      mus: "Protraction: serratus anterior. Retraction: rhomboids and middle trapezius.",
      musGen: true, kata: [], ref: "General knowledge",
    },
    {
      id: "lat", demo: "trunk", view: "Front view",
      a: { t: "Lateral flexion to the right", st: "a", d: "Bending the trunk or neck sideways, here toward the client's right." },
      b: { t: "Lateral flexion to the left", st: "b", d: "The same movement toward the client's left." },
      mus: "Quadratus lumborum and the obliques bend the trunk to their own side.",
      musGen: true, kata: [], ref: "General knowledge",
    },
    {
      id: "circ", demo: "circle", view: "Front view",
      a: { t: "Circumduction", st: "spin", d: "Moving a limb so its end traces a circle, combining flexion, abduction, extension and adduction. Rotating the ankle in the kata is circumduction." },
      mus: "Every muscle around the joint works in turn.",
      musGen: true, kata: [47], ref: "General knowledge",
    },
  ],

  /* Glossary. `cat` groups the entries; `src` says where the handbook asks for the term. */
  cats: {
    land: "Landmarks you palpate",
    bone: "Bony features",
    soft: "Soft tissue",
    place: "Places in point locations",
    pos: "Client positions",
    meas: "Measurement",
  },
  glossary: [
    { t: "Acromion", cat: "land", d: "The flat outer tip of the shoulder blade that forms the point of the shoulder.", re: /acromion/i, src: "Handbook 4.6" },
    { t: "Spine of the scapula", cat: "land", d: "The ridge across the back of the shoulder blade, running from the acromion toward the spine.", re: /spine of the scapula|scapular spine/i, pts: ["SI11"], src: "Handbook 4.6" },
    { t: "Infraspinous fossa", cat: "land", d: "The broad hollow on the shoulder blade below its spine, filled by the infraspinatus muscle.", pts: ["SI11"], src: "Handbook 4.6" },
    { t: "Medial and lateral epicondyles", cat: "land", d: "The bony knobs on the inner and outer sides of the elbow, at the lower end of the humerus.", re: /epicondyle/i, src: "Handbook 4.6" },
    { t: "Olecranon", cat: "land", d: "The point of the elbow, the upper end of the ulna.", re: /olecranon/i, src: "Handbook 4.6" },
    { t: "Ulnar styloid process", cat: "land", d: "The small bony point on the little-finger side of the wrist. The radial styloid is its partner on the thumb side.", re: /ulnar styloid|styloid process of the ulna/i, src: "Handbook 4.6" },
    { t: "Iliac crest", cat: "land", d: "The curved upper rim of the hip bone, felt at the waist.", re: /iliac crest/i, src: "Handbook 4.6" },
    { t: "ASIS", alt: "anterior superior iliac spine", cat: "land", d: "The bony point at the front end of the iliac crest, at the front of the hip.", re: /\bASIS\b/, src: "Handbook 4.6" },
    { t: "PSIS", alt: "posterior superior iliac spine", cat: "land", d: "The bony point at the back end of the iliac crest, often marked by a dimple above the buttock.", re: /\bPSIS\b/, src: "Handbook 4.6" },
    { t: "Greater trochanter", cat: "land", d: "The large bony knob on the outer side of the upper thigh bone, felt at the side of the hip.", re: /trochanter/i, src: "Handbook 4.6" },
    { t: "Ischial tuberosity", cat: "land", d: "The \"sit bone\" at the bottom of the pelvis, where the hamstrings attach.", re: /ischial/i, src: "Handbook 4.6" },
    { t: "Tibial tuberosity", cat: "land", d: "The bump at the top of the shin bone, just below the kneecap, where the patellar ligament attaches.", re: /tibial tuberosity/i, pts: ["ST36"], src: "Handbook 4.6" },
    { t: "Medial and lateral malleoli", alt: "ankle bones", cat: "land", d: "The inner ankle bone (end of the tibia) and outer ankle bone (end of the fibula).", re: /malleol|ankle bone/i, src: "Handbook 4.6" },
    { t: "External occipital protuberance", cat: "land", d: "The bump at the center of the back of the skull.", re: /occipital protuberance/i, src: "Handbook 4.6" },
    { t: "Mastoid process", cat: "land", d: "The bony bump behind the ear.", re: /\bmastoid/i, src: "Handbook 4.6" },

    { t: "Process", cat: "bone", d: "Any projection or outgrowth of bone.", re: /process\b/i, src: "Handbook 4.5" },
    { t: "Spinous process", cat: "bone", d: "The bony point at the back of each vertebra, the bumps you feel down the spine.", re: /\bspinous/i, src: "Handbook 4.5 (process)" },
    { t: "Condyle", cat: "bone", d: "A rounded knob at the end of a bone where it meets another bone in a joint.", re: /\bcondyle/i, src: "Handbook 4.5" },
    { t: "Epicondyle", cat: "bone", d: "A smaller bump on or just above a condyle, where muscles and ligaments attach.", re: /epicondyle/i, src: "Handbook 4.5" },
    { t: "Crest", cat: "bone", d: "A prominent ridge of bone.", re: /\bcrest\b/i, src: "Handbook 4.5" },
    { t: "Spine", cat: "bone", d: "As a bony feature: a sharp, slender projection. (Also the common name for the vertebral column.)", src: "Handbook 4.5" },
    { t: "Styloid", cat: "bone", d: "A slender, pointed projection, like a pen tip.", re: /styloid/i, src: "Handbook 4.5" },
    { t: "Tuberosity", cat: "bone", d: "A large, roughened bump where a muscle or tendon attaches.", re: /tuberosity/i, src: "Handbook 4.5" },
    { t: "Trochlea", cat: "bone", d: "A pulley-shaped surface that another bone glides in, as at the elbow.", src: "Handbook 4.5" },
    { t: "Fossa", cat: "bone", d: "A shallow hollow or depression in a bone.", re: /fossa/i, src: "Handbook 4.5" },
    { t: "Foramen", cat: "bone", d: "A hole through a bone that nerves or vessels pass through.", re: /foram/i, src: "Handbook 4.5" },
    { t: "Canal", cat: "bone", d: "A tunnel-like passage through a bone.", src: "Handbook 4.5" },
    { t: "Sinus", cat: "bone", d: "An air-filled cavity in a bone, as in the skull around the nose. (Also a channel for venous blood in the heart and brain.)", src: "Handbook 4.5" },

    { t: "Tendon", cat: "soft", d: "A tough cord that attaches muscle to bone.", re: /tendon/i, src: "Handbook 4.5" },
    { t: "Ligament", cat: "soft", d: "A tough band that attaches bone to bone across a joint.", re: /ligament/i, src: "Handbook 4.5" },
    { t: "Fibrocartilage", cat: "soft", d: "Dense, tough cartilage that absorbs shock, as in the discs between vertebrae and the knee menisci.", src: "Handbook 4.5" },
    { t: "Origin", cat: "soft", d: "The end of a muscle that stays fixed when it contracts, usually the proximal end.", src: "Handbook 4.5" },
    { t: "Insertion", cat: "soft", d: "The end of a muscle that moves when it contracts, usually the distal end.", src: "Handbook 4.5" },

    { t: "Crease", cat: "place", d: "A skin fold over a joint, such as the wrist, elbow or knee. Many points are measured from one.", re: /crease/i },
    { t: "Cubital crease", alt: "elbow crease", cat: "place", d: "The crease at the front of the elbow.", re: /cubital|elbow crease/i },
    { t: "Popliteal crease", alt: "crease behind the knee", cat: "place", d: "The crease at the back of the knee.", re: /popliteal|crease behind the knee|knee crease/i },
    { t: "Axilla", alt: "armpit", cat: "place", d: "The armpit.", re: /axilla|armpit/i },
    { t: "Intercostal space", cat: "place", d: "The gap between two neighboring ribs.", re: /intercostal/i },
    { t: "Web", cat: "place", d: "The fold of skin between two fingers or toes.", re: /\bweb\b/i },
    { t: "Umbilicus", alt: "navel", cat: "place", d: "The navel. Several abdominal points are measured from it.", re: /umbilic|navel/i },
    { t: "Sternum", alt: "breastbone", cat: "place", d: "The breastbone, at the front center of the chest.", re: /\bstern(um|al)|breastbone/i },
    { t: "Clavicle", alt: "collarbone", cat: "place", d: "The collarbone.", re: /clavic|collarbone/i },
    { t: "Scapula", alt: "shoulder blade", cat: "place", d: "The shoulder blade.", re: /scapul|shoulder blade/i },
    { t: "Patella", alt: "kneecap", cat: "place", d: "The kneecap.", re: /patell|kneecap/i },
    { t: "Tibia", alt: "shin bone", cat: "place", d: "The shin bone, on the inner side of the lower leg.", re: /tibia|\bshin\b/i },
    { t: "Fibula", cat: "place", d: "The thin bone on the outer side of the lower leg.", re: /fibula/i },
    { t: "Metacarpals · metatarsals", cat: "place", d: "The long bones of the hand and of the foot, between the wrist or ankle and the digits.", re: /metacarp|metatars/i },
    { t: "Vertebra (C, T, L)", cat: "place", d: "One bone of the spine. C1-C7 are cervical (neck), T1-T12 thoracic (ribs), L1-L5 lumbar (low back). Back points are located by the vertebra beside them.", re: /\b[CTL]\d{1,2}\b|vertebra/ },

    { t: "Supine", cat: "pos", d: "Lying face up. In the kata walkthrough, steps on the front figure are done supine." },
    { t: "Prone", cat: "pos", d: "Lying face down. Steps on the back figure are done prone." },
    { t: "Side-lying", cat: "pos", d: "Lying on one side, often with a pillow between the knees." },

    { t: "Cun", alt: "body inch", cat: "meas", d: "The proportional inch of general TCM, scaled to each client's own body: about the width of the thumb at the knuckle, and four fingers together are about 3 cun. Most point locations in this atlas use it.", re: /\bcun\b/i, tcm: true },
  ],
};
