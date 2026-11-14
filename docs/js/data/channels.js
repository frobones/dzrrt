/*
 * Channel data: the 12 primary channels plus Du and Ren.
 *
 * Paths are drawn on a 300 x 640 figure. Each path vertex is [dx, y], where dx is
 * the distance from the midline (bilateral channels are mirrored). Vertices run in
 * the direction the primary channel flows (Handbook 3.31-3.32), so animating
 * along the path shows that flow. Sinew (myofascial) flow always runs from the
 * digits toward the trunk (Handbook 3.27-3.28); `sinewReverse` marks channels
 * whose primary flow runs the other way.
 */
window.Atlas = window.Atlas || {};

Atlas.ELEMENTS = {
  wood:  { name: "Wood",  hz: "木", color: "--wood" },
  fire:  { name: "Fire",  hz: "火", color: "--fire" },
  earth: { name: "Earth", hz: "土", color: "--earth" },
  metal: { name: "Metal", hz: "金", color: "--metal" },
  water: { name: "Water", hz: "水", color: "--water" },
};

Atlas.CHANNELS = {
  LU: {
    name: "Lung", hz: "肺", yy: "yin", limb: "Arm", div: "Tai Yin", el: "metal",
    pair: "LI", time: [3, 5], sinewStart: "Thumb", sinewEnd: "Chest",
    surface: "Anterior arm, radial (thumb) side",
    sinewReverse: true,
    organ: "Governs Qi and respiration; disperses and descends Qi; controls skin and hair; opens into the nose; houses the Po.",
    ref: "Handbook 3.29, 3.31-3.32, 3.42",
    paths: { front: [[44,155],[50,176],[56,205],[63,240],[70,268],[76,300],[83,336],[85,356],[87,380],[89,404]] },
  },
  LI: {
    name: "Large Intestine", hz: "大肠", yy: "yang", limb: "Arm", div: "Yang Ming", el: "metal",
    pair: "LU", time: [5, 7], sinewStart: "Index finger", sinewEnd: "Forehead",
    surface: "Posterior arm, radial side, over the shoulder to the face",
    organ: "Separates pure from turbid, forms stool, reabsorbs fluids.",
    ref: "Handbook 3.29, 3.31-3.32, 3.45",
    paths: {
      back: [[84,408],[83,374],[80,355],[77,320],[75,266],[66,220],[58,170],[56,142],[40,128]],
      front: [[40,130],[30,118],[20,102],[12,88],[7,76]],
    },
  },
  ST: {
    name: "Stomach", hz: "胃", yy: "yang", limb: "Leg", div: "Yang Ming", el: "earth",
    pair: "SP", time: [7, 9], sinewStart: "2nd and 3rd toes", sinewEnd: "Cheek",
    surface: "Face, front of the trunk, anterolateral leg",
    sinewReverse: true,
    organ: "Rots and ripens food; sends Qi downward; origin of fluids.",
    ref: "Handbook 3.29, 3.31-3.32, 3.45",
    paths: { front: [[24,34],[26,70],[12,64],[9,88],[25,92],[12,116],[16,140],[32,170],[32,200],[26,240],[18,270],[18,300],[18,345],[26,368],[31,410],[32,462],[31,485],[30,506],[33,545],[28,580],[24,598],[24,606],[22,620]] },
  },
  SP: {
    name: "Spleen", hz: "脾", yy: "yin", limb: "Leg", div: "Tai Yin", el: "earth",
    pair: "ST", time: [9, 11], sinewStart: "Big toe", sinewEnd: "Genitalia",
    surface: "Medial foot, medial leg, lateral abdomen and chest",
    organ: "Governs transformation and transport; holds Blood in the vessels; raises Qi; controls muscles and limbs; houses the Yi.",
    ref: "Handbook 3.29, 3.31-3.32, 3.42",
    paths: { front: [[10,620],[10,612],[10,606],[12,594],[14,566],[14,530],[13,494],[16,458],[22,420],[27,378],[32,340],[34,300],[38,262],[46,236],[48,228]] },
  },
  HT: {
    name: "Heart", hz: "心", yy: "yin", limb: "Arm", div: "Shao Yin", el: "fire",
    pair: "SI", time: [11, 13], sinewStart: "Little finger", sinewEnd: "Chest",
    surface: "Anterior arm, ulnar (little finger) side",
    sinewReverse: true,
    organ: "Governs Blood and the vessels; houses the Shen; opens into the tongue; shows in the complexion.",
    ref: "Handbook 3.29, 3.31-3.32, 3.41",
    paths: { front: [[46,186],[50,215],[55,245],[58,270],[64,310],[70,344],[70,355],[72,380],[73,404]] },
  },
  SI: {
    name: "Small Intestine", hz: "小肠", yy: "yang", limb: "Arm", div: "Tai Yang", el: "fire",
    pair: "HT", time: [13, 15], sinewStart: "Little finger", sinewEnd: "Forehead",
    surface: "Posterior arm, ulnar side, around the scapula to the ear",
    organ: "Receives and transforms; separates pure from turbid.",
    ref: "Handbook 3.29, 3.31-3.32, 3.43",
    paths: {
      back: [[72,405],[71,384],[71,366],[64,310],[58,268],[52,222],[44,178],[30,182],[30,160],[22,140],[16,124]],
      front: [[22,112],[25,94],[27,64]],
    },
  },
  UB: {
    name: "Urinary Bladder", hz: "膀胱", yy: "yang", limb: "Leg", div: "Tai Yang", el: "water",
    pair: "KD", time: [15, 17], sinewStart: "Little toe", sinewEnd: "Cheek",
    surface: "Inner eye, over the head, two lines down the back, back of the leg",
    sinewReverse: true,
    organ: "Stores and excretes urine; removes water by Qi transformation.",
    ref: "Handbook 3.29, 3.31-3.32, 3.45",
    paths: {
      front: [[5,60],[6,52],[6,36],[6,22]],
      back: [[6,22],[6,60],[7,106],[10,134],[10,200],[10,278],[10,338],[16,362],[22,410],[25,480],[25,540],[30,575],[34,594],[35,602],[34,622]],
      back2: [[18,126],[22,156],[22,244],[22,290],[30,340],[32,400],[28,470],[25,480]],
    },
  },
  KD: {
    name: "Kidney", hz: "肾", yy: "yin", limb: "Leg", div: "Shao Yin", el: "water",
    pair: "UB", time: [17, 19], sinewStart: "Sole of the foot", sinewEnd: "Genitalia",
    surface: "Sole, medial ankle, medial leg, close to the midline of the trunk",
    organ: "Stores Jing; foundation of Yin and Yang; Ming Men; governs water, bones, marrow; receives Qi; houses the Zhi.",
    ref: "Handbook 3.29, 3.31-3.32, 3.42",
    paths: {
      back: [[20,618],[16,594]],
      front: [[10,594],[10,602],[13,566],[13,520],[15,480],[19,440],[22,400],[8,360],[4,336],[4,300],[5,262],[10,236],[10,200],[10,146]],
    },
  },
  PC: {
    name: "Pericardium", hz: "心包", yy: "yin", limb: "Arm", div: "Jue Yin", el: "fire",
    pair: "SJ", time: [19, 21], sinewStart: "Middle finger", sinewEnd: "Chest",
    surface: "Anterior arm, center line",
    sinewReverse: true,
    organ: "Protects the Heart; shares most Heart functions; calms or stimulates the mind.",
    ref: "Handbook 3.29, 3.31-3.32, 3.41",
    paths: { front: [[36,200],[44,194],[50,218],[57,245],[64,268],[71,300],[78,333],[78,355],[79,385],[80,408]] },
  },
  SJ: {
    name: "San Jiao", hz: "三焦", yy: "yang", limb: "Arm", div: "Shao Yang", el: "fire",
    pair: "PC", time: [21, 23], sinewStart: "Ring finger", sinewEnd: "Forehead",
    surface: "Posterior arm, center line, over the shoulder, around the ear",
    alias: "Triple Burner / Triple Warmer",
    organ: "System of body cavities; moves Yuan Qi; controls the water passages (upper mist, middle foam, lower ditch).",
    ref: "Handbook 3.29, 3.31-3.32, 3.44",
    paths: {
      back: [[78,408],[78,382],[78,356],[78,333],[72,300],[68,266],[60,220],[54,145],[40,130],[26,100],[26,82]],
      front: [[29,70],[29,58],[22,52]],
    },
  },
  GB: {
    name: "Gall Bladder", hz: "胆", yy: "yang", limb: "Leg", div: "Shao Yang", el: "wood",
    pair: "LV", time: [23, 1], sinewStart: "4th toe", sinewEnd: "Cheek",
    surface: "Side of the head, side of the trunk, lateral leg",
    sinewReverse: true,
    organ: "Stores and excretes bile; governs judgement and decisiveness.",
    ref: "Handbook 3.29, 3.31-3.32, 3.45",
    paths: {
      front: [[20,60],[28,62],[30,48],[22,32],[10,44],[24,38]],
      back: [[24,40],[16,80],[12,100],[30,132],[44,236],[44,270],[38,330],[36,362]],
      front2: [[44,236],[30,236],[44,272],[44,296],[43,345],[44,380],[43,420],[40,460],[37,498],[36,555],[35,574],[35,600],[30,612],[28,620]],
    },
  },
  LV: {
    name: "Liver", hz: "肝", yy: "yin", limb: "Leg", div: "Jue Yin", el: "wood",
    pair: "GB", time: [1, 3], sinewStart: "Big toe", sinewEnd: "Genitalia",
    surface: "Top of the foot, medial leg, groin, side of the ribs",
    organ: "Stores Blood; ensures the smooth flow of Qi; controls the sinews; opens into the eyes; houses the Hun.",
    ref: "Handbook 3.29, 3.31-3.32, 3.43",
    paths: { front: [[13,621],[15,617],[16,610],[11,598],[14,560],[14,520],[15,482],[18,440],[20,400],[14,370],[30,330],[44,272],[30,222]] },
  },
  REN: {
    name: "Ren Mai", hz: "任脉", yy: "yin", limb: "Trunk", div: "Extraordinary", el: null,
    alias: "Conception Vessel, Sea of Yin", time: null,
    surface: "Anterior midline, pubis to chin",
    organ: "Sea of Yin; associated with conception; one of only two extraordinary vessels with its own points.",
    ref: "Handbook 3.34-3.36",
    paths: { front: [[0,362],[0,300],[0,200],[0,126],[0,96]] },
  },
  DU: {
    name: "Du Mai", hz: "督脉", yy: "yang", limb: "Trunk", div: "Extraordinary", el: null,
    alias: "Governing Vessel, Sea of Yang", time: null,
    surface: "Posterior midline, coccyx over the head to the upper lip",
    organ: "Sea of Yang; governs the spine and brain; one of only two extraordinary vessels with its own points.",
    ref: "Handbook 3.34-3.36",
    paths: { back: [[0,365],[0,278],[0,128],[0,100],[0,24]], front: [[0,22],[0,52],[0,82]] },
  },
};

/* Horary (24-hour) order, starting with LU at 3am (Handbook 3.31-3.32). */
Atlas.HORARY = ["LU", "LI", "ST", "SP", "HT", "SI", "UB", "KD", "PC", "SJ", "GB", "LV"];

/* Point categories: label, short explanation, and whether it is course material. */
Atlas.CATEGORIES = {
  longlife:   { label: "Long Life point", course: true, tip: "The DZRRT Long Life points (Handbook 2.35-2.47, 3.8). Never pressed during pregnancy (2.7, 2.33)." },
  kata:       { label: "In the kata", course: true, tip: "Named in the 60-step DZRRT kata (Handbook 2.35-2.47)." },
  handout:    { label: "Class handout", course: true, tip: "Used in the 2026 Module 2 class handouts and slides." },
  handbook:   { label: "Handbook", course: true, tip: "Named elsewhere in the handbook." },
  source:     { label: "Source (Yuan)", tip: "Where the channel's Original Qi surfaces (Handbook 3.13, glossary 3.86)." },
  luo:        { label: "Luo (connecting)", tip: "Where the Luo vessel branches to the paired channel (Handbook 3.30)." },
  shu:        { label: "Back-Shu", tip: "Back point linked directly to an organ; palpated on the back (Handbook 3.61)." },
  mu:         { label: "Front-Mu", tip: "Front point where an organ's Qi gathers; palpated on the trunk (Handbook 3.61)." },
  command:    { label: "Command point", tip: "One of the classical command points that treat a whole region." },
  confluent:  { label: "Confluent point", tip: "Opens one of the eight extraordinary vessels." },
  influential:{ label: "Influential point", tip: "Gathering point for a tissue or substance (Qi, Blood, bone, marrow...)." },
  well:       { label: "Jing-Well", tip: "First or last point at the tip of a digit, where channel Qi is most shallow." },
  sea:        { label: "He-Sea", tip: "At the elbow or knee, where channel Qi dives deep toward the organ." },
  spirit:     { label: "Spirit point", tip: "Outer Bladder line point named for one of the Five Spirits (Handbook 3.93)." },
  extra:      { label: "Extra point", tip: "Not on one of the 14 channels." },
};
