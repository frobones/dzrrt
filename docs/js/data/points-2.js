/*
 * Point data, part 2: Urinary Bladder, Kidney, Pericardium, San Jiao, Gall Bladder,
 * Liver, Ren, Du, and extra points. Field meanings are documented in points-1.js.
 */
window.Atlas = window.Atlas || {};

/* ---------- Urinary Bladder (Leg Tai Yang, Water) ---------- */
Atlas.P("UB1", { py: "Jīngmíng", hz: "睛明", en: "Bright Eyes", ch: "UB", v: "front", dx: 5, y: 60, z: "h",
  cats: [], loc: "Just above the inner corner of the eye.", find: "Gently press toward the nose at the inner corner of the eye.",
  fx: ["First point of the Bladder channel; meeting point with Yin and Yang Qiao", "Eye conditions"], caut: "Very close to the eye. Light touch only.",
  course: [{ t: "Kata step 59, eyes. Never rest fingertips on the eyelids of a client with contacts.", ref: "Handbook 2.47, 2.7" }], rel: ["UB2", "ST1"] });

Atlas.P("UB2", { py: "Cuánzhú", hz: "攒竹", en: "Gathered Bamboo", ch: "UB", v: "front", dx: 6, y: 52, z: "h",
  cats: [], loc: "Inner end of the eyebrow, in the notch.", find: "Feel for the small notch where the eyebrow starts.",
  fx: ["Frontal headache, eye strain, sinus congestion"],
  course: [{ t: "Kata step 52, forehead strokes, starts here.", ref: "Handbook 2.46" }], rel: ["YINTANG", "SJ23"] });

Atlas.P("UB10", { py: "Tiānzhù", hz: "天柱", en: "Celestial Pillar", ch: "UB", v: "back", dx: 7, y: 106, z: "n",
  cats: [], loc: "Back of the neck, 1.3 cun lateral to the midline at the hairline, on the outer edge of the trapezius.",
  find: "On the thick neck muscle just below the skull, a little closer to the midline than GB 20.",
  fx: ["Occipital headache, stiff neck"], course: [{ t: "Kata step 2A works the sub-occipitals here.", ref: "Handbook 2.35" }], rel: ["GB20", "GV16"] });

Atlas.P("UB11", { py: "Dàzhù", hz: "大杼", en: "Great Shuttle", ch: "UB", v: "back", dx: 10, y: 134, z: "t",
  cats: ["influential"], loc: "1.5 cun lateral to the lower border of T1.", find: "Below the prominent C7, go down one vertebra and out two finger-widths.",
  fx: ["Influential point of bone", "Neck and upper back stiffness"], rel: ["GB39", "UB12"] });

Atlas.P("UB12", { py: "Fēngmén", hz: "风门", en: "Wind Gate", ch: "UB", v: "back", dx: 10, y: 145, z: "t",
  cats: [], loc: "1.5 cun lateral to the lower border of T2.", find: "Two finger-widths out from the spine, at the level of T2.",
  fx: ["Gate where Wind enters: early colds, stiff upper back"],
  course: [{ t: "Wind is the leading cause of disease and enters through the space between skin and muscle when Wei Qi is weak.", ref: "Handbook 3.50-3.51; Pathogens handout" }], rel: ["GB20", "UB13", "GV14"] });

const shu = (id, py, hz, en, organ, vert, y, mu, extra) => Atlas.P(id, Object.assign({
  py, hz, en, ch: "UB", v: "back", dx: 10, y, z: "t", cats: ["shu", "kata"],
  loc: `1.5 cun lateral to the lower border of ${vert}, on the inner Bladder line.`,
  find: `Two finger-widths out from the spine at ${vert}, on the ridge of the erector spinae.`,
  fx: [`Back-Shu point of the ${organ}`, `Regulates and tonifies the ${organ}; tenderness here reflects the ${organ}`],
  course: [{ t: "Kata Line 2 traces the inner Bladder line and its Shu points, from eyebrow to sacrum.", ref: "Handbook 2.35-2.36; Meridian part 2 slide 2" },
           { t: "Shu points on the back are palpated to read the Zang-Fu organs.", ref: "Handbook 3.61" }],
  combos: mu ? [{ w: mu, n: "Shu-Mu pair", t: `The ${organ}'s back-Shu with its front-Mu: reaches the organ from both the Yang (back) and Yin (front) sides.` }] : [],
}, extra || {}));

shu("UB13", "Fèishū", "肺俞", "Lung Shu", "Lung", "T3", 156, "LU1", { rel: ["UB42", "UB12"] });
shu("UB14", "Juéyīnshū", "厥阴俞", "Jue Yin Shu", "Pericardium", "T4", 167, "CV17", { rel: ["UB43"] });
shu("UB15", "Xīnshū", "心俞", "Heart Shu", "Heart", "T5", 178, "CV14", { rel: ["UB44", "HT7"] });
shu("UB17", "Géshū", "膈俞", "Diaphragm Shu", "Diaphragm", "T7", 200, null, {
  cats: ["shu", "influential", "kata"], fx: ["Influential point of Blood", "Moves and nourishes the Blood; hiccups"],
  combos: [{ w: "SP10", n: "Blood points", t: "Both act on the Blood." }], rel: ["UB18", "UB20"] });
shu("UB18", "Gānshū", "肝俞", "Liver Shu", "Liver", "T9", 222, "LV14", { rel: ["UB47", "LV3"] });
shu("UB19", "Dǎnshū", "胆俞", "Gall Bladder Shu", "Gall Bladder", "T10", 233, "GB24", { rel: ["UB18"] });
shu("UB20", "Píshū", "脾俞", "Spleen Shu", "Spleen", "T11", 244, "LV13", { rel: ["UB49", "ST36"] });
shu("UB21", "Wèishū", "胃俞", "Stomach Shu", "Stomach", "T12", 255, "CV12", { rel: ["UB20", "ST36"] });
shu("UB22", "Sānjiāoshū", "三焦俞", "San Jiao Shu", "San Jiao", "L1", 266, null, { rel: ["SJ5"] });
shu("UB23", "Shènshū", "肾俞", "Kidney Shu", "Kidney", "L2", 278, "GB25", {
  course: [{ t: "Kata Line 2 passes here. Deficient Premier Fire shows as a cold low back; the handbook suggests Tiger Balm or heat on the lumbar area.", ref: "Handbook 2.35-2.36, 3.96" }],
  rel: ["GV4", "UB52", "KD3"] });
shu("UB25", "Dàchángshū", "大肠俞", "Large Intestine Shu", "Large Intestine", "L4", 302, "ST25", { rel: ["UB23"] });
shu("UB27", "Xiǎochángshū", "小肠俞", "Small Intestine Shu", "Small Intestine", "S1", 326, "CV4", { rel: ["UB28"] });
shu("UB28", "Pángguāngshū", "膀胱俞", "Bladder Shu", "Bladder", "S2", 338, "CV3", { rel: ["UB27"] });

const spirit = (id, py, hz, en, spiritName, organ, vert, y, shuId) => Atlas.P(id, {
  py, hz, en, ch: "UB", v: "back", dx: 22, y, z: "t", cats: ["spirit", "kata"],
  loc: `3 cun lateral to the lower border of ${vert}, on the outer Bladder line, level with ${shuId}.`,
  find: `Four finger-widths out from the spine at ${vert}, near the inner edge of the scapula or the lateral erectors.`,
  fx: [`Named for the ${spiritName}, the spirit housed by the ${organ}`, `Treats the emotional side of ${organ} imbalance`],
  course: [{ t: `The ${organ} houses the ${spiritName} (Five Spirits).`, ref: "Handbook 3.93, 3.41-3.43" },
           { t: "Kata Line 3 traces the outer Bladder line from eyebrow to sacrum.", ref: "Handbook 2.35" }],
  combos: [{ w: shuId, n: "Body and spirit", t: `The inner-line Shu point treats the ${organ} itself; this outer-line point treats its spirit.` }],
  rel: ["UB42", "UB44", "UB47", "UB49", "UB52"].filter((x) => x !== id),
});
spirit("UB42", "Pòhù", "魄户", "Po Door", "Po (corporeal soul)", "Lung", "T3", 156, "UB13");
spirit("UB44", "Shéntáng", "神堂", "Shen Hall", "Shen (spirit)", "Heart", "T5", 178, "UB15");
spirit("UB47", "Húnmén", "魂门", "Hun Gate", "Hun (ethereal soul)", "Liver", "T9", 222, "UB18");
spirit("UB49", "Yìshè", "意舍", "Yi Abode", "Yi (intention)", "Spleen", "T11", 244, "UB20");
spirit("UB52", "Zhìshì", "志室", "Zhi Chamber", "Zhi (will)", "Kidney", "L2", 278, "UB23");

Atlas.P("UB43", { py: "Gāohuāngshū", hz: "膏肓俞", en: "Vital Region Shu", ch: "UB", v: "back", dx: 22, y: 167, z: "t",
  cats: [], loc: "3 cun lateral to the lower border of T4, at the inner edge of the scapula.", find: "Let the arm hang forward so the scapula moves out; the point is at its inner border at T4.",
  fx: ["Deep, chronic deficiency of Qi, Blood, Yin and Yang", "Exhaustion, chronic cough"],
  course: [{ t: "The rhomboids lie here (kata steps 3-5 on the thoracic area).", ref: "Handbook 2.36-2.37, 4.55" }], rel: ["UB14", "ST36"] });

Atlas.P("UB40", { py: "Wěizhōng", hz: "委中", en: "Bend Middle", ch: "UB", v: "back", dx: 25, y: 480, z: "j",
  cats: ["sea", "command"], loc: "Center of the crease behind the knee.", find: "Midpoint of the popliteal crease, between the tendons.",
  fx: ["He-Sea point of the Bladder", "Command point of the low back", "Clears Heat from the Blood"],
  course: [{ t: "Kata step 19 ends at the popliteal area after the hamstrings.", ref: "Handbook 2.39" }],
  caut: "Popliteal artery and vein. Avoid deep pressure, especially with varicose veins or a suspected clot (Handbook 2.11, 2.19).",
  rel: ["UB23", "UB57", "GB30"] });

Atlas.P("UB57", { py: "Chéngshān", hz: "承山", en: "Support Mountain", ch: "UB", v: "back", dx: 25, y: 540, z: "l",
  cats: [], loc: "Back of the calf, at the point of the inverted V where the two heads of gastrocnemius meet the Achilles tendon.",
  find: "Point the toes; a V-shaped hollow appears mid-calf.", fx: ["Calf cramps, sciatica, hemorrhoids (traditional)"],
  course: [{ t: "Kata step 20 works gastrocnemius along the Kidney, Bladder (lighter pressure) and Gall Bladder lines.", ref: "Handbook 2.40; Meridian part 2 slide 2" }], rel: ["UB40", "UB60"] });

Atlas.P("UB60", { py: "Kūnlún", hz: "昆仑", en: "Kunlun Mountains", ch: "UB", v: "back", dx: 34, y: 594, z: "d",
  cats: [], loc: "Between the tip of the outer ankle bone and the Achilles tendon.", find: "In the hollow behind the outer ankle bone.",
  fx: ["Back and neck pain, headache, ankle pain"], caut: "Classically contraindicated in pregnancy.",
  course: [{ t: "Kata steps 21-22 work the Achilles tendon and calcaneus; step 42 works the malleoli.", ref: "Handbook 2.40, 2.45" }], rel: ["KD3", "UB62"] });

Atlas.P("UB62", { py: "Shēnmài", hz: "申脉", en: "Extending Vessel", ch: "UB", v: "back", dx: 35, y: 602, z: "d",
  cats: ["confluent"], loc: "In the hollow directly below the tip of the outer ankle bone.", find: "Slide straight down off the outer ankle bone.",
  fx: ["Opens the Yang Qiao Mai (paired with SI3)", "Insomnia, back pain"],
  combos: [{ w: "SI3", n: "Du Mai opening pair", t: "Spine, neck and back." }, { w: "KD6", n: "Yin and Yang Qiao", t: "Balances sleep and waking." }], rel: ["UB60"] });

Atlas.P("UB67", { py: "Zhìyīn", hz: "至阴", en: "Reaching Yin", ch: "UB", v: "back", dx: 34, y: 622, z: "d",
  cats: ["well"], loc: "Little toe, outer corner of the nail.", find: "Outer corner of the little toenail.",
  fx: ["Jing-Well point: Bladder Qi passes to the Kidney (Yang reaching Yin)", "Traditionally used to turn a breech baby"],
  caut: "Avoid in pregnancy except under trained care.", rel: ["KD1"] });

/* ---------- Kidney (Leg Shao Yin, Water) ---------- */
Atlas.P("KD1", { py: "Yǒngquán", hz: "涌泉", en: "Bubbling Spring", ch: "KD", v: "back", dx: 20, y: 618, z: "d",
  cats: ["longlife", "kata", "handout", "well"],
  loc: "Sole of the foot, in the hollow about one third of the way from the base of the 2nd toe to the heel, when the toes curl.",
  find: "Curl the toes; the point is in the hollow that forms just behind the ball of the foot.",
  fx: ["Jing-Well point and the only point on the sole", "Descends excess from the head; calms the mind; grounds", "Revives consciousness (traditional)"],
  course: [{ t: "Long Life point. Kata step 24 (foot point), with the client prone.", ref: "Handbook 2.40" },
           { t: "One of the four Long Life points in the homework drawing assignment.", ref: "Handbook 3.8" },
           { t: "Joy (Fire, Heart): settle the Shen. Useful points are Yintang and Kidney 1.", ref: "Pathogens and Emotions handout" },
           { t: "Fear (Water, Kidney): strengthen the spine. Kidney 1 is a point we already use.", ref: "Pathogens and Emotions handout" }],
  caut: "Long Life point: never pressed for a pregnant client (Handbook 2.7, 2.33).",
  combos: [{ w: "YINTANG", n: "Head and feet", t: "Draws agitation down from the head to the feet (handout, Joy)." },
           { w: "HTJJ", n: "Fear and the spine", t: "Both appear in the handout's Fear and Water treatment." }],
  rel: ["KD3", "LI4", "SI11", "ST36", "GB20"] });

Atlas.P("KD3", { py: "Tàixī", hz: "太溪", en: "Great Stream", ch: "KD", v: "front", dx: 10, y: 594, z: "d",
  also: [{ v: "back", dx: 16, y: 594 }],
  cats: ["source"], loc: "Between the tip of the inner ankle bone and the Achilles tendon.", find: "In the hollow behind the inner ankle bone, opposite UB 60.",
  fx: ["Source point of the Kidney", "Tonifies Kidney Yin and Yang; low back pain, tinnitus"],
  course: [{ t: "The Kidney stores Jing, the root of the Three Treasures.", ref: "Handbook 3.21, 3.42" }, { t: "Kata step 42 works the medial and lateral malleoli.", ref: "Handbook 2.45" }],
  rel: ["UB60", "UB23", "SP6"] });

Atlas.P("KD6", { py: "Zhàohǎi", hz: "照海", en: "Shining Sea", ch: "KD", v: "front", dx: 10, y: 603, z: "d",
  cats: ["confluent"], loc: "1 cun below the tip of the inner ankle bone.", find: "Slide straight down off the inner ankle bone into the hollow.",
  fx: ["Opens the Yin Qiao Mai (paired with LU7)", "Dry throat, insomnia, nourishes Yin"],
  combos: [{ w: "LU7", n: "Ren Mai opening pair", t: "Throat, chest and lungs." }, { w: "UB62", n: "Yin and Yang Qiao", t: "Balances sleep and waking." }], rel: ["KD3"] });

Atlas.P("KD27", { py: "Shūfǔ", hz: "俞府", en: "Shu Mansion", ch: "KD", v: "front", dx: 10, y: 146, z: "t",
  cats: [], loc: "Below the collarbone, 2 cun lateral to the midline.", find: "In the hollow under the inner end of the collarbone.",
  fx: ["Last point of the Kidney channel", "Cough, wheezing; helps the Kidney receive Qi"], rel: ["LU1", "CV22"] });

/* ---------- Pericardium (Arm Jue Yin, Fire) ---------- */
Atlas.P("PC3", { py: "Qūzé", hz: "曲泽", en: "Marsh at the Crook", ch: "PC", v: "front", dx: 64, y: 268, z: "j",
  cats: ["sea"], loc: "Elbow crease, on the little-finger side of the biceps tendon.", find: "Just inside the biceps tendon at the crease.",
  fx: ["He-Sea point of the Pericardium", "Clears heat; nausea"], rel: ["LU5", "HT3"] });

Atlas.P("PC6", { py: "Nèiguān", hz: "内关", en: "Inner Pass", ch: "PC", v: "front", dx: 78, y: 333, z: "l",
  cats: ["luo", "confluent", "command"], loc: "2 cun above the wrist crease, between the two central forearm tendons.",
  find: "Three finger-widths above the wrist crease, between the tendons. Make a fist to show them.",
  fx: ["Luo point: connects to the San Jiao", "Opens the Yin Wei Mai", "Command point of the chest", "Nausea, chest tightness, anxiety"],
  course: [{ t: "Kata step 10 works the palmar forearm.", ref: "Handbook 2.38" }],
  combos: [{ w: "SP4", n: "Chong Mai opening pair", t: "Heart, chest and stomach." }, { w: "ST36", n: "Settle the stomach", t: "Nausea." }, { w: "SJ5", n: "Inner and outer pass", t: "The two points sit opposite each other through the forearm." }],
  rel: ["PC7", "HT7", "CV17"] });

Atlas.P("PC7", { py: "Dàlíng", hz: "大陵", en: "Great Mound", ch: "PC", v: "front", dx: 78, y: 355, z: "d",
  cats: ["source"], loc: "Center of the wrist crease, between the two central tendons.", find: "Middle of the wrist crease.",
  fx: ["Source point of the Pericardium", "Calms the mind; wrist pain"], caut: "Over the carpal tunnel. Avoid areas that increase carpal tunnel symptoms (Handbook 2.11).", rel: ["PC6", "HT7"] });

Atlas.P("PC8", { py: "Láogōng", hz: "劳宫", en: "Palace of Toil", ch: "PC", v: "front", dx: 79, y: 385, z: "d",
  cats: [], loc: "Center of the palm, where the tip of the middle finger touches when a fist is made.", find: "Make a loose fist; the middle fingertip lands on it.",
  fx: ["Clears Heart fire", "In Qigong, the palm center through which the practitioner's Qi is projected"],
  course: [{ t: "Kata step 11 works the palm. The handbook asks the practitioner to use intention and projection and keep breathing slowly.", ref: "Handbook 2.38, 2.5" }], rel: ["KD1", "PC7"] });

/* ---------- San Jiao (Arm Shao Yang, Fire) ---------- */
Atlas.P("SJ4", { py: "Yángchí", hz: "阳池", en: "Yang Pool", ch: "SJ", v: "back", dx: 78, y: 356, z: "d",
  cats: ["source"], loc: "Back of the wrist crease, in the hollow on the little-finger side of the extensor tendons.", find: "Bend the wrist back; the hollow in the middle of the back of the wrist.",
  fx: ["Source point of the San Jiao: spreads Yuan Qi"], course: [{ t: "The San Jiao mobilizes Original Qi.", ref: "Handbook 3.44" }], rel: ["SJ5", "PC7"] });

Atlas.P("SJ5", { py: "Wàiguān", hz: "外关", en: "Outer Pass", ch: "SJ", v: "back", dx: 78, y: 333, z: "l",
  cats: ["luo", "confluent"], loc: "2 cun above the back of the wrist crease, between the radius and ulna.", find: "Opposite PC 6 on the back of the forearm.",
  fx: ["Luo point: connects to the Pericardium", "Opens the Yang Wei Mai", "Releases the exterior: Wind-Heat, one-sided headache"],
  combos: [{ w: "GB41", n: "Dai Mai opening pair", t: "Sides of the body, hips, one-sided headache." }, { w: "PC6", n: "Inner and outer pass", t: "Opposite each other through the forearm." }], rel: ["SJ4", "UB22"] });

Atlas.P("SJ14", { py: "Jiānliáo", hz: "肩髎", en: "Shoulder Crevice", ch: "SJ", v: "back", dx: 54, y: 146, z: "p",
  cats: [], loc: "Back of the shoulder, in the hollow behind and below the acromion when the arm is raised.", find: "The back of the two shoulder hollows (LI 15 is the front one).",
  fx: ["Shoulder pain, frozen shoulder"], caut: "Frozen shoulder: never force the joint (Handbook 2.13).", rel: ["LI15", "SI9"] });

Atlas.P("SJ17", { py: "Yìfēng", hz: "翳风", en: "Wind Screen", ch: "SJ", v: "back", dx: 26, y: 82, z: "h",
  also: [{ v: "front", dx: 29, y: 76 }],
  cats: [], loc: "Behind the earlobe, between the mastoid process and the angle of the jaw.", find: "Fold the earlobe back; the point is in the hollow it covers.",
  fx: ["Expels Wind: ear problems, facial paralysis, jaw pain"], course: [{ t: "The mastoid process is on the palpable bony landmarks list.", ref: "Handbook 4.64" }], rel: ["SI19", "GB20"] });

Atlas.P("SJ23", { py: "Sīzhúkōng", hz: "丝竹空", en: "Silk Bamboo Hollow", ch: "SJ", v: "front", dx: 22, y: 52, z: "h",
  cats: [], loc: "Outer end of the eyebrow, in the hollow.", find: "Follow the eyebrow to its outer tip.",
  fx: ["Last point of the San Jiao", "One-sided headache, eye problems"], course: [{ t: "Kata step 52 strokes the forehead toward this area.", ref: "Handbook 2.46" }], rel: ["UB2", "TAIYANG", "GB1"] });

/* ---------- Gall Bladder (Leg Shao Yang, Wood) ---------- */
Atlas.P("GB1", { py: "Tóngzǐliáo", hz: "瞳子髎", en: "Pupil Crevice", ch: "GB", v: "front", dx: 20, y: 60, z: "h",
  cats: [], loc: "0.5 cun outside the outer corner of the eye.", find: "In the small hollow on the bone beside the outer eye corner.",
  fx: ["First point of the Gall Bladder", "Eye problems, temporal headache"], rel: ["TAIYANG", "SJ23"] });

Atlas.P("GB14", { py: "Yángbái", hz: "阳白", en: "Yang White", ch: "GB", v: "front", dx: 10, y: 44, z: "h",
  cats: [], loc: "On the forehead, 1 cun above the middle of the eyebrow, directly above the pupil.", find: "One thumb-width above the eyebrow, in line with the pupil.",
  fx: ["Frontal headache, eye problems"], course: [{ t: "Kata step 52, forehead strokes.", ref: "Handbook 2.46" }], rel: ["UB2", "ST8"] });

Atlas.P("GB20", { py: "Fēngchí", hz: "风池", en: "Wind Pool", ch: "GB", v: "back", dx: 12, y: 100, z: "n",
  cats: ["longlife", "kata", "handout"],
  loc: "Below the base of the skull, in the hollow between the upper attachments of the sternocleidomastoid and trapezius.",
  find: "Slide your thumbs up the back of the neck until they stop under the skull, then out into the hollows either side.",
  fx: ["Expels Wind (internal and external)", "Headache, stiff neck, dizziness, eye problems", "Meeting point with the Yang Wei Mai"],
  course: [{ t: "Long Life point. Kata step 2 (neck, prone) and step 58 (supine finish).", ref: "Handbook 2.35, 2.47" },
           { t: "Treats headache, neck pain, congestion, acute Wind invasion, insomnia and vertigo.", ref: "Meridian part 2 slide 9" },
           { t: "Wind often combines with Heat or Cold and moves from place to place. Moving the Wei Qi helps expel it.", ref: "Handbook 3.51; Types of Pain handout" }],
  caut: "Long Life point: never pressed for a pregnant client (Handbook 2.7, 2.33).",
  combos: [{ w: "LI4", n: "Wind headache pair", t: "Expels Wind; head and neck pain." }, { w: "GV16", n: "Wind gates of the neck", t: "The 'Wind' points across the base of the skull." }],
  rel: ["UB10", "GB21", "SJ17", "UB12"] });

Atlas.P("GB21", { py: "Jiānjǐng", hz: "肩井", en: "Shoulder Well", ch: "GB", v: "back", dx: 30, y: 132, z: "n",
  also: [{ v: "front", dx: 30, y: 134 }],
  cats: ["kata", "handout"], loc: "Top of the shoulder, midway between C7 and the acromion, at the highest point of the trapezius.",
  find: "Pinch the top of the shoulder halfway out; the point is in the thickest part of the muscle.",
  fx: ["Descends Qi; neck and shoulder tension", "Traditionally promotes labor"],
  course: [{ t: "Kata step 5 works the upper trapezius in three arcs around the scapula, and step 2C lifts it.", ref: "Handbook 2.35, 2.37" },
           { t: "Anger (Wood, Liver): Liver Qi stagnates easily. Focus on the top of the shoulders.", ref: "Pathogens and Emotions handout" }],
  caut: "Classically contraindicated in pregnancy. Avoid strong downward pressure.",
  combos: [{ w: "LV3", n: "Anger and stress", t: "The handout's Wood treatment: the point (LV3) and the zone (top of the shoulders)." }],
  rel: ["GB20", "SI11", "LI15"] });

Atlas.P("GB24", { py: "Rìyuè", hz: "日月", en: "Sun and Moon", ch: "GB", v: "front", dx: 30, y: 236, z: "t",
  cats: ["mu"], loc: "Directly below the nipple, in the 7th intercostal space.", find: "One rib space below LV 14.",
  fx: ["Front-Mu point of the Gall Bladder", "Rib-side pain, indecision"],
  combos: [{ w: "UB19", n: "Shu-Mu pair", t: "Gall Bladder back-Shu with its front-Mu." }], rel: ["LV14"] });

Atlas.P("GB25", { py: "Jīngmén", hz: "京门", en: "Capital Gate", ch: "GB", v: "back", dx: 44, y: 268, z: "t",
  cats: ["mu"], loc: "Side of the waist, at the free end of the 12th rib.", find: "Follow the lowest rib around to its tip at the side of the back.",
  fx: ["Front-Mu point of the Kidney", "Low back and flank pain, water metabolism"],
  combos: [{ w: "UB23", n: "Shu-Mu pair", t: "Kidney back-Shu with its front-Mu." }], rel: ["LV13"] });

Atlas.P("GB26", { py: "Dàimài", hz: "带脉", en: "Girdling Vessel", ch: "GB", v: "front", dx: 44, y: 296, z: "t",
  cats: [], loc: "Side of the waist, directly below the tip of the 11th rib, level with the navel.", find: "Straight down from LV 13 to navel height.",
  fx: ["Meeting point with the Dai Mai (Belt Channel)", "Waist pain, menstrual problems"],
  course: [{ t: "The Dai Mai, the 'Belt Channel', is the only horizontal vessel and holds the vertical channels.", ref: "Handbook 3.35" }], rel: ["GB41", "GB29"] });

Atlas.P("GB29", { py: "Jūliáo", hz: "居髎", en: "Squatting Crevice", alt: "Ju Liao", ch: "GB", v: "front", dx: 43, y: 345, z: "t",
  cats: ["kata"], loc: "Side of the hip, midway between the ASIS and the top of the greater trochanter.", find: "Halfway between the front point of the hip bone and the bony bump at the side of the hip.",
  fx: ["Hip pain, lateral thigh pain"],
  course: [{ t: "Kata step 16 (gluteal muscles, prone) names 'Ju Liao - Dai Channel'. The handbook ties it to the Dai (Belt) channel.", ref: "Handbook 2.39" },
           { t: "The Gall Bladder channel covers the ITB and TFL.", ref: "Meridian part 2 slide 4" }],
  rel: ["GB30", "GB26", "GB31"] });

Atlas.P("GB30", { py: "Huántiào", hz: "环跳", en: "Jumping Circle", ch: "GB", v: "back", dx: 36, y: 362, z: "t",
  cats: ["kata"], loc: "Buttock, one third of the way from the greater trochanter to the base of the sacrum.", find: "Lie on the side; it is where the heel touches the buttock when the leg swings back.",
  fx: ["Meeting point with the Bladder channel", "Sciatica, hip pain, leg weakness"],
  course: [{ t: "Kata step 17 (sciatic area) names Huantiao. Piriformis is felt in the gluteal kata.", ref: "Handbook 2.39, 4.25" },
           { t: "Sciatica: avoid areas that increase symptoms.", ref: "Handbook 2.17" }],
  combos: [{ w: "GB34", n: "Leg channel pair", t: "Hip and leg pain along the Gall Bladder line." }, { w: "UB40", n: "Sciatica", t: "Bladder and Gall Bladder lines down the back and side of the leg." }],
  rel: ["GB29", "UB40"] });

Atlas.P("GB31", { py: "Fēngshì", hz: "风市", en: "Wind Market", ch: "GB", v: "front", dx: 43, y: 420, z: "p",
  cats: [], loc: "Outer thigh, where the tip of the middle finger touches when standing with arms at the sides.", find: "Stand with arms relaxed; the middle fingertip lands on the IT band.",
  fx: ["Expels Wind: itching, numbness of the leg"], course: [{ t: "On the IT band, which the Gall Bladder channel covers.", ref: "Meridian part 2 slide 4" }], rel: ["GB30", "GB34"] });

Atlas.P("GB34", { py: "Yánglíngquán", hz: "阳陵泉", en: "Yang Mound Spring", ch: "GB", v: "front", dx: 37, y: 498, z: "j",
  cats: ["sea", "influential"], loc: "Below the outer knee, in the hollow in front of and below the head of the fibula.", find: "Find the bony knob below the outer knee; the point is just in front of and below it.",
  fx: ["He-Sea point of the Gall Bladder", "Influential point of the sinews (tendons)", "Muscle cramps, spasms, stiffness"],
  course: [{ t: "The Liver controls the sinews and Gall Bladder disharmony affects them. Myofascial channel diseases are strains, cramps, spasms and atrophy.", ref: "Handbook 3.27, 3.43, 3.45" }],
  combos: [{ w: "LV3", n: "Smooth the sinews", t: "Wood pair for tension and cramping." }], rel: ["GB30", "ST36"] });

Atlas.P("GB37", { py: "Guāngmíng", hz: "光明", en: "Bright Light", ch: "GB", v: "front", dx: 36, y: 555, z: "l",
  cats: ["luo"], loc: "5 cun above the tip of the outer ankle bone, in front of the fibula.", find: "A hand-width above the outer ankle bone.",
  fx: ["Luo point: connects to the Liver", "Eye problems (the Liver opens into the eyes)"], rel: ["LV3"] });

Atlas.P("GB39", { py: "Xuánzhōng", hz: "悬钟", en: "Suspended Bell", ch: "GB", v: "front", dx: 35, y: 574, z: "l",
  cats: ["influential"], loc: "3 cun above the tip of the outer ankle bone, in front of the fibula.", find: "Four finger-widths above the outer ankle bone.",
  fx: ["Influential point of marrow", "Neck stiffness, leg pain"], course: [{ t: "The Kidney produces marrow and fills the brain.", ref: "Handbook 3.42" }], rel: ["UB11", "SP6"] });

Atlas.P("GB40", { py: "Qiūxū", hz: "丘墟", en: "Wilderness Mound", ch: "GB", v: "front", dx: 35, y: 600, z: "d",
  cats: ["source"], loc: "In front of and below the outer ankle bone.", find: "In the hollow at the front of the outer ankle.",
  fx: ["Source point of the Gall Bladder", "Ankle sprain, rib-side pain"], caut: "Sprains: avoid the site for 6 weeks unless trained (Handbook 2.18).", rel: ["LV3", "GB41"] });

Atlas.P("GB41", { py: "Zúlínqì", hz: "足临泣", en: "Foot Governor of Tears", ch: "GB", v: "front", dx: 30, y: 612, z: "d",
  cats: ["confluent"], loc: "Top of the foot, in the hollow where the 4th and 5th metatarsals meet.", find: "Slide back from the web of the 4th and 5th toes until you stop.",
  fx: ["Opens the Dai Mai (paired with SJ5)", "One-sided headache, hip pain"],
  combos: [{ w: "SJ5", n: "Dai Mai opening pair", t: "Sides of the body and hips." }], rel: ["GB40", "GB26"] });

/* ---------- Liver (Leg Jue Yin, Wood) ---------- */
Atlas.P("LV1", { py: "Dàdūn", hz: "大敦", en: "Great Pile", ch: "LV", v: "front", dx: 13, y: 621, z: "d",
  cats: ["well"], loc: "Big toe, outer corner of the nail.", find: "Outer corner of the big toenail (SP 1 is the inner corner).",
  fx: ["Jing-Well point: the Liver channel begins here"], rel: ["SP1", "LV2"] });

Atlas.P("LV2", { py: "Xíngjiān", hz: "行间", en: "Moving Between", ch: "LV", v: "front", dx: 15, y: 617, z: "d",
  cats: ["kata"], loc: "Top of the foot, at the edge of the web between the 1st and 2nd toes.", find: "End of the web between the big toe and the second toe.",
  fx: ["Fire point of the Wood channel: clears Liver fire", "Red eyes, irritability, headache"],
  course: [{ t: "Kata step 43 (between metatarsals). The handbook prints the English as 'Gushing Spring'; the usual translation of Xing Jian is 'Moving Between'.", ref: "Handbook 2.45" }],
  rel: ["LV3", "ST44"] });

Atlas.P("LV3", { py: "Tàichōng", hz: "太冲", en: "Great Surge", ch: "LV", v: "front", dx: 16, y: 609, z: "d",
  cats: ["handout", "source"], loc: "Top of the foot, in the hollow where the 1st and 2nd metatarsals meet.", find: "Slide your finger up from the web of the big toe until it stops at the junction of the bones.",
  fx: ["Source point of the Liver", "Smooths Liver Qi: stress, irritability, headache, tension", "Calms internal Wind"],
  course: [{ t: "Anger affects the Liver. Encourage Liver Qi to move outward as the kata does toward the limbs. A useful point is Liver 3.", ref: "Pathogens and Emotions handout (Anger - Wood - Liver)" },
           { t: "Kata step 43 works between the metatarsals here.", ref: "Handbook 2.45" }],
  combos: [{ w: "LI4", n: "Four Gates", t: "Moves Qi and Blood through the whole body; calms and relieves pain." },
           { w: "GB21", n: "Anger and stress", t: "The handout's Wood point and zone." }, { w: "GB34", n: "Smooth the sinews", t: "Wood pair." }],
  rel: ["LV2", "LV14", "UB18", "GB40", "SP6"] });

Atlas.P("LV8", { py: "Qūquán", hz: "曲泉", en: "Spring at the Crook", ch: "LV", v: "front", dx: 15, y: 482, z: "j",
  cats: ["sea"], loc: "Inner end of the knee crease, with the knee bent.", find: "Bend the knee; the point is at the inner end of the crease.",
  fx: ["He-Sea point of the Liver", "Nourishes Liver Blood; knee pain"], rel: ["SP9", "LV3"] });

Atlas.P("LV13", { py: "Zhāngmén", hz: "章门", en: "Completion Gate", ch: "LV", v: "front", dx: 44, y: 272, z: "t",
  cats: ["mu", "influential"], loc: "Side of the abdomen, at the free end of the 11th rib.", find: "Bend the elbow to your side; the elbow tip lands near it.",
  fx: ["Front-Mu point of the Spleen", "Influential point of the Zang (Yin) organs", "Harmonizes Liver and Spleen; bloating"],
  combos: [{ w: "UB20", n: "Shu-Mu pair", t: "Spleen back-Shu with its front-Mu." }], rel: ["LV14", "GB25"] });

Atlas.P("LV14", { py: "Qīmén", hz: "期门", en: "Cycle Gate", ch: "LV", v: "front", dx: 30, y: 222, z: "t",
  cats: ["mu"], loc: "Directly below the nipple, in the 6th intercostal space.", find: "Two rib spaces below the nipple.",
  fx: ["Front-Mu point of the Liver; the last point on the 12-channel circuit", "Rib-side pain, emotional constraint"],
  course: [{ t: "Qi passes from the Liver (1-3am) back to the Lung (3-5am), completing the circuit.", ref: "Handbook 3.31-3.32" }],
  combos: [{ w: "UB18", n: "Shu-Mu pair", t: "Liver back-Shu with its front-Mu." }], rel: ["LU1", "GB24", "LV3"] });

/* ---------- Ren Mai (Conception Vessel) ---------- */
const ren = (id, py, hz, en, y, cats, loc, find, fx, extra) =>
  Atlas.P(id, Object.assign({ py, hz, en, ch: "REN", v: "front", dx: 0, y, z: "t", cats, loc, find, fx }, extra || {}));

ren("CV3", "Zhōngjí", "中极", "Central Pole", 350, ["mu"], "Midline, 4 cun below the navel, 1 cun above the pubic bone.", "One thumb-width above the top of the pubic bone.",
  ["Front-Mu point of the Bladder", "Urinary problems"], { combos: [{ w: "UB28", n: "Shu-Mu pair", t: "Bladder back-Shu with its front-Mu." }], caut: "Abdominal points are avoided in pregnancy (Handbook 2.33)." });
ren("CV4", "Guānyuán", "关元", "Gate of Origin", 336, ["mu"], "Midline, 3 cun below the navel.", "Four finger-widths below the navel.",
  ["Front-Mu point of the Small Intestine", "Tonifies Yuan Qi, Kidney and Jing; lower dan tian"],
  { course: [{ t: "The lower Dan Tian is one of the three centers.", ref: "Handbook 3.25" }], combos: [{ w: "UB27", n: "Shu-Mu pair", t: "Small Intestine back-Shu with its front-Mu." }], caut: "Abdominal points are avoided in pregnancy (Handbook 2.33).", rel: ["CV6", "GV4"] });
ren("CV6", "Qìhǎi", "气海", "Sea of Qi", 315, [], "Midline, 1.5 cun below the navel.", "Two finger-widths below the navel.",
  ["Tonifies and moves Qi; the 'hara' center", "Fatigue, weakness"],
  { course: [{ t: "Centering in the hara is one of the practices that sustain the bodyworker. Rumination is treated by bringing the focus into the abdomen and hara.", ref: "Handbook 2.4; Pathogens handout" }], caut: "Abdominal points are avoided in pregnancy (Handbook 2.33).", rel: ["CV4", "CV8"] });
ren("CV8", "Shénquè", "神阙", "Spirit Gate Tower", 300, ["kata"], "Center of the navel.", "The navel itself.",
  ["Warms and restores Yang (traditionally treated with moxa, never needled)"],
  { course: [{ t: "Kata step 37: abdominal point 1 is the umbilicus, followed by the four quadrants, the hara points, and the clockwise perimeter.", ref: "Handbook 2.43" },
             { t: "Moxibustion warms and tonifies, and is used in Bu (deficient) conditions.", ref: "Handbook 3.100" }],
    caut: "No abdominal work for aortic aneurysm, hernia, gastric ulcer or pregnancy (Handbook 2.9, 2.14, 2.19, 2.33).", rel: ["CV6", "ST25", "CV12"] });
ren("CV12", "Zhōngwǎn", "中脘", "Middle Cavity", 262, ["mu", "influential"], "Midline, 4 cun above the navel, halfway to the base of the sternum.", "Halfway between the navel and the bottom of the breastbone.",
  ["Front-Mu point of the Stomach", "Influential point of the Fu (Yang) organs", "Harmonizes the middle burner; digestion"],
  { course: [{ t: "The middle burner is the 'foam' or maceration chamber.", ref: "Handbook 3.44" }], combos: [{ w: "UB21", n: "Shu-Mu pair", t: "Stomach back-Shu with its front-Mu." }, { w: "ST36", n: "Digestive triad", t: "With ST25." }],
    caut: "No central or upper abdominal pressure with a gastric ulcer (Handbook 2.19).", rel: ["ST25", "CV8"] });
ren("CV14", "Jùquè", "巨阙", "Great Palace", 236, ["mu"], "Midline, 6 cun above the navel, just below the base of the sternum.", "Just below the tip of the breastbone.",
  ["Front-Mu point of the Heart", "Calms the Shen; palpitations"], { combos: [{ w: "UB15", n: "Shu-Mu pair", t: "Heart back-Shu with its front-Mu." }], caut: "Over the xiphoid. Use gentle pressure.", rel: ["CV17"] });
ren("CV17", "Dànzhōng", "膻中", "Chest Center", 200, ["mu", "influential"], "Midline of the sternum, level with the 4th intercostal space (between the nipples on a man).", "Center of the breastbone, between the nipples.",
  ["Front-Mu point of the Pericardium", "Influential point of Qi", "Sea of Qi (upper); chest tightness, grief"],
  { course: [{ t: "Gathering Qi (Zong Qi) forms in the chest from food Qi and air Qi.", ref: "Handbook 3.14" }, { t: "Grief and sorrow lodge in the chest.", ref: "Pathogens and Emotions handout" }],
    combos: [{ w: "UB14", n: "Shu-Mu pair", t: "Pericardium back-Shu with its front-Mu." }, { w: "PC6", n: "Open the chest", t: "Chest tightness." }], rel: ["LU1", "CV14"] });
ren("CV22", "Tiāntū", "天突", "Heavenly Prominence", 126, [], "In the notch at the top of the sternum.", "The hollow at the base of the throat.",
  ["Descends Lung Qi: cough, throat"], { z: "n", caut: "Press only lightly backward, never down into the throat.", rel: ["CV17", "ST9"] });
ren("CV24", "Chéngjiāng", "承浆", "Container of Fluids", 96, [], "In the hollow in the center of the chin crease.", "The dip below the lower lip.",
  ["Last point of the Ren Mai; meets the Du Mai inside the mouth", "Facial paralysis, drooling"], { z: "h", course: [{ t: "Kata step 54 works the mandible.", ref: "Handbook 2.47" }], rel: ["GV26"] });

/* ---------- Du Mai (Governing Vessel) ---------- */
const du = (id, py, hz, en, y, cats, loc, find, fx, extra) =>
  Atlas.P(id, Object.assign({ py, hz, en, ch: "DU", v: "back", dx: 0, y, z: "t", cats, loc, find, fx }, extra || {}));

du("GV4", "Mìngmén", "命门", "Gate of Life", 278, ["handbook"], "Midline of the low back, below the spinous process of L2.", "Level with the bottom of the ribs, between the Kidney Shu points.",
  ["Strengthens Kidney Yang and the Life Gate Fire", "Cold low back, fatigue, cold limbs"],
  { course: [{ t: "Ming Men, the Vital Gate or Life Gate Fire, manifests Kidney Yang and is created from Yuan Qi.", ref: "Handbook 3.13, 3.42, 3.86" },
             { t: "Life Gate and Premier Fire: circulating Qi and Blood through massage and Qigong improves the Life Gate Fire. Deficient fire shows as a cold low back; warm the lumbar area.", ref: "Handbook 3.96" }],
    rel: ["UB23", "UB52", "CV4"] });
du("GV14", "Dàzhuī", "大椎", "Great Vertebra", 128, [], "Midline, below the spinous process of C7.", "Below the most prominent bump at the base of the neck.",
  ["Meeting point of all the Yang channels", "Clears Heat, releases the exterior: fever, colds, stiff neck"],
  { z: "n", course: [{ t: "Kata step 14 works the intervertebral spaces from T1 to T5 just below here.", ref: "Handbook 2.38" }], rel: ["UB12", "SI3", "GV16"] });
du("GV16", "Fēngfǔ", "风府", "Wind Palace", 100, [], "Midline, just below the external occipital protuberance.", "In the hollow at the center of the skull base.",
  ["Expels Wind: occipital headache, stiff neck, dizziness"],
  { z: "n", course: [{ t: "The external occipital protuberance is a palpable bony landmark. Kata step 2A works the sub-occipitals.", ref: "Handbook 4.64, 2.35" }], combos: [{ w: "GB20", n: "Wind gates of the neck", t: "The Wind points along the base of the skull." }], rel: ["UB10", "GV20"] });
du("GV20", "Bǎihuì", "百会", "Hundred Meetings", 24, [], "Top of the head, on the midline, where a line joining the tops of the ears crosses it.", "Run fingers up from the ear tips to the crown.",
  ["Meeting point of all the Yang; lifts Qi", "Calms the Shen; prolapse, dizziness"],
  { z: "h", also: [{ v: "front", dx: 0, y: 22 }], course: [{ t: "Kata step 60 finishes with 30 seconds of scalp work. The handout calls the scalp massage very invigorating.", ref: "Handbook 2.47; Pathogens handout" }], rel: ["YINTANG", "GV16"] });
du("GV26", "Shuǐgōu", "水沟", "Water Trough", 82, ["handbook"], "Upper lip, one third of the way down from the nose to the lip.", "In the groove under the nose.",
  ["Main revival point for fainting and loss of consciousness"],
  { v: "front", z: "h", alt: "Renzhong", course: [{ t: "Kappo, the Japanese resuscitation arts that Okazaki studied, used revival techniques. He revived a lightning-strike victim with Kappo.", ref: "Handbook 3.47, 6.6" }], rel: ["CV24", "KD1"] });

/* ---------- Extra points ---------- */
Atlas.P("YINTANG", { code: "Yintang", py: "Yìntáng", hz: "印堂", en: "Hall of Impression", ch: null, v: "front", dx: 0, y: 52, z: "h",
  cats: ["extra", "handout"], loc: "Midway between the inner ends of the eyebrows.", find: "The point between the eyebrows.",
  fx: ["Calms the Shen: anxiety, insomnia", "Frontal headache, nasal congestion"],
  course: [{ t: "Joy (Fire, Heart): settle the Shen by moving the body from an agitated state to a more Yin state. Useful points are Yintang and Kidney 1.", ref: "Pathogens and Emotions handout" },
           { t: "Kata step 52 starts the forehead strokes near here.", ref: "Handbook 2.46" }],
  combos: [{ w: "KD1", n: "Head and feet", t: "The handout's pair for over-excited Joy." }, { w: "HT7", n: "Settle the Shen", t: "Classical calming pair." }],
  rel: ["UB2", "GV20", "TAIYANG"] });

Atlas.P("TAIYANG", { code: "Taiyang", py: "Tàiyáng", hz: "太阳", en: "Greater Yang", ch: null, v: "front", dx: 26, y: 56, z: "h",
  cats: ["extra", "kata"], loc: "Temple, in the hollow about one finger-width behind the midpoint between the outer end of the eyebrow and the outer corner of the eye.", find: "The soft hollow at the temple.",
  fx: ["Temporal and one-sided headache, eye strain"], course: [{ t: "Kata step 56 (temples) names Taiyang, 'Greater Yang'.", ref: "Handbook 2.47" }], rel: ["GB1", "SJ23", "ST8"] });

Atlas.P("BITONG", { code: "Bitong", py: "Bítōng", hz: "鼻通", en: "Penetrating the Nose", ch: null, v: "front", dx: 6, y: 70, z: "h",
  cats: ["extra", "kata"], loc: "Side of the nose, at the top of the nasolabial groove where the nasal bone meets the cartilage.", find: "Slide up the side of the nose from LI 20 to where bone becomes cartilage.",
  fx: ["Opens the nose: congestion, sinus pain"], course: [{ t: "Kata step 53 (nose strokes) names Bitong, 'Penetrating the Nose'.", ref: "Handbook 2.46" }], rel: ["LI20", "UB2"] });

Atlas.P("HTJJ", { code: "HTJJ", py: "Huátuó Jiājǐ", hz: "华佗夹脊", en: "Hua Tuo's Paravertebral Points", alt: "Huato Jiaji", ch: null, v: "back", dx: 4, y: 211, z: "t",
  cats: ["extra", "kata", "handout"], loc: "A column of points 0.5 cun either side of the spine, beside each spinous process from T1 to L5 (shown here at T8).", find: "Thumb-width out from the spinous processes, in the groove of the deep spinal muscles.",
  fx: ["Each segment treats the organs and area at its level", "Back pain, spinal stiffness"],
  course: [{ t: "Kata Line 1 traces these points, not the Urinary Bladder channel.", ref: "Handbook 2.35; Meridian part 2 slide 3" },
           { t: "Fear (Water, Kidney): fear shows in posture, such as shrinking or hunching. Strengthen the spine; the most useful zone is Line 1 of the back.", ref: "Pathogens and Emotions handout" },
           { t: "Line 1 ends with the olecranon at the iliosacral notch.", ref: "Handbook 2.36" }],
  combos: [{ w: "KD1", n: "Fear and the spine", t: "Both appear in the handout's Water treatment." }],
  rel: ["UB13", "UB23", "GV4"] });
