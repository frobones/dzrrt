/*
 * Point data, part 1: Lung, Large Intestine, Stomach, Spleen, Heart, Small Intestine.
 *
 * Fields:
 *   py/hz/en  pinyin, Chinese characters, English name
 *   ch        channel id from channels.js
 *   v, dx, y  view ("front" | "back") and position (dx from midline; mirrored if bilateral)
 *   also      extra views where the point is also visible
 *   z         zone for the depth model: d distal, l lower arm/leg, j elbow/knee,
 *             p upper arm/thigh, t trunk, n neck, h head/face
 *   cats      category keys from Atlas.CATEGORIES
 *   loc/find  location, and a palpation tip
 *   fx        traditional actions (general TCM knowledge, outside the course material)
 *   course    what the course material says, with a reference
 *   caut      cautions
 *   combos    classical pairings: { w: other point, n: name, t: why }
 *   rel       other related point ids
 */
window.Atlas = window.Atlas || {};
Atlas.POINTS = Atlas.POINTS || {};
Atlas.P = function (id, d) { d.id = id; if (d.bilateral === undefined) d.bilateral = d.dx !== 0; Atlas.POINTS[id] = d; };

/* ---------- Lung (Arm Tai Yin, Metal) ---------- */
Atlas.P("LU1", { py: "Zhōngfǔ", hz: "中府", en: "Central Treasury", ch: "LU", v: "front", dx: 44, y: 155, z: "t",
  cats: ["mu", "handout"],
  loc: "Upper lateral chest, in the 1st intercostal space, about 6 cun from the midline, just below the hollow under the outer end of the collarbone.",
  find: "Find the hollow below the collarbone near the shoulder, then slide one rib space down.",
  fx: ["Front-Mu point of the Lung", "Descends and disperses Lung Qi", "Cough, wheezing, fullness in the chest"],
  course: [{ t: "Grief lodges in the chest. Work the pectorals, including Lung 1, starting calm and building stimulation so the client leaves invigorated.", ref: "Pathogens and Emotions handout (Grief - Metal - Lung)" },
           { t: "Kata step 27 works the subclavicular fossa while the client takes a deep breath, right beside this point.", ref: "Handbook 2.41" }],
  combos: [{ w: "UB13", n: "Shu-Mu pair", t: "Lung back-Shu with Lung front-Mu: treats the Lung from front and back together." }],
  rel: ["LU7", "LU9", "CV17"] });

Atlas.P("LU5", { py: "Chǐzé", hz: "尺泽", en: "Cubit Marsh", ch: "LU", v: "front", dx: 70, y: 268, z: "j",
  cats: ["sea"],
  loc: "Elbow crease, on the thumb side of the biceps tendon.",
  find: "Bend the elbow slightly; the point is in the hollow just outside the firm biceps tendon.",
  fx: ["He-Sea point of the Lung (Water point)", "Clears Lung heat, descends Lung Qi", "Cough with phlegm, elbow pain"],
  course: [{ t: "Kata step 29 strokes the biceps along the Heart, Pericardium and Lung channels, passing over this point.", ref: "Handbook 2.41" }],
  rel: ["LU1", "LI11"] });

Atlas.P("LU7", { py: "Lièquē", hz: "列缺", en: "Broken Sequence", ch: "LU", v: "front", dx: 84, y: 336, z: "l",
  cats: ["luo", "command", "confluent"],
  loc: "On the radial edge of the forearm, 1.5 cun above the wrist crease, in the groove above the styloid process of the radius.",
  find: "Interlock your thumbs and index fingers; the tip of your index finger rests on it.",
  fx: ["Luo point: connects to the Large Intestine channel", "Command point of the head and back of the neck", "Opens the Ren Mai (paired with KD6)", "Releases the exterior, expels Wind: stiff neck, headache, cough"],
  course: [{ t: "Lies on the palmar forearm worked in kata step 10.", ref: "Handbook 2.38" }],
  combos: [{ w: "LI4", n: "Host and guest", t: "Lung Luo with Large Intestine Source: both paired channels at once, for Wind invasion and headache." },
           { w: "KD6", n: "Ren Mai opening pair", t: "Confluent points of Ren Mai and Yin Qiao Mai: throat, chest and lung conditions." }],
  rel: ["LU9", "GB20"] });

Atlas.P("LU9", { py: "Tàiyuān", hz: "太渊", en: "Supreme Abyss", ch: "LU", v: "front", dx: 85, y: 356, z: "d",
  cats: ["source", "influential"],
  loc: "Wrist crease, on the thumb side, beside the radial pulse.",
  find: "Feel for the radial pulse at the wrist crease; the point is right on it, in the hollow next to the tendon.",
  fx: ["Source point of the Lung", "Influential point of the vessels", "Tonifies Lung Qi and Yin: weak voice, chronic cough"],
  course: [{ t: "This is where the radial pulse is read during palpation, one of the Four Examinations.", ref: "Handbook 3.61" }],
  rel: ["LU7", "HT7", "PC7"] });

Atlas.P("LU11", { py: "Shàoshāng", hz: "少商", en: "Lesser Shang", ch: "LU", v: "front", dx: 89, y: 404, z: "d",
  cats: ["well"],
  loc: "Thumb, on the radial side, about 0.1 cun from the corner of the nail.",
  find: "Outer corner of the thumbnail.",
  fx: ["Jing-Well point: where the Lung channel ends and passes Qi to the Large Intestine", "Sore throat, loss of consciousness"],
  course: [{ t: "Sealing off the fingertips (kata step 36) finishes each digit, including this channel end.", ref: "Handbook 2.42" }],
  rel: ["LI1"] });

/* ---------- Large Intestine (Arm Yang Ming, Metal) ---------- */
Atlas.P("LI1", { py: "Shāngyáng", hz: "商阳", en: "Shang Yang", ch: "LI", v: "back", dx: 84, y: 408, z: "d",
  cats: ["well"],
  loc: "Index finger, on the radial side, about 0.1 cun from the corner of the nail.",
  find: "Thumb-side corner of the index fingernail.",
  fx: ["Jing-Well point: receives Qi from Lung 11", "Sore throat, fever"],
  rel: ["LU11", "LI4"] });

Atlas.P("LI4", { py: "Hégǔ", hz: "合谷", en: "Joining Valley", alt: "Hoku", ch: "LI", v: "back", dx: 83, y: 374, z: "d",
  also: [{ v: "front", dx: 86, y: 376 }],
  cats: ["longlife", "kata", "handout", "source", "command"],
  loc: "Back of the hand, between the thumb and index finger, at the midpoint of the 2nd metacarpal on the thumb side.",
  find: "Squeeze the thumb against the index finger; the point is at the top of the muscle mound, close to the 2nd metacarpal.",
  fx: ["Source point of the Large Intestine", "Command point of the face and mouth", "Releases the exterior, expels Wind", "Stops pain: headache, toothache, facial pain"],
  course: [{ t: "Long Life point. Kata step 32 (thenar space) presses it on each hand.", ref: "Handbook 2.42" },
           { t: "One of the four Long Life points in the homework drawing assignment, with SI 11, ST 36 and KD 1.", ref: "Handbook 3.8" },
           { t: "A point in the 'shallows': used for facial pain and sinus congestion, far from the area it treats.", ref: "Meridian Theory part 1 slides" },
           { t: "Treats headache, head and neck pain, congestion, acute Wind invasion, and delayed labor.", ref: "Meridian part 2 slide 8" }],
  caut: "Strongly contraindicated in pregnancy (traditionally said to promote labor). Never pressed for a pregnant client, like all Long Life points (Handbook 2.7, 2.33).",
  combos: [{ w: "LV3", n: "Four Gates", t: "LI4 and LV3 on both sides: moves Qi and Blood through the whole body, calms, and relieves pain." },
           { w: "LU7", n: "Host and guest", t: "Source and Luo of the paired Metal channels." },
           { w: "GB20", n: "Wind headache pair", t: "Both expel Wind and treat headache and neck pain (Meridian part 2 slides 8-9)." },
           { w: "ST36", n: "Shallows and depths", t: "The slides' two examples: LI4 shallow (face), ST36 deep (digestion)." }],
  rel: ["LI11", "LI20", "SI11", "KD1"] });

Atlas.P("LI10", { py: "Shǒusānlǐ", hz: "手三里", en: "Arm Three Miles", ch: "LI", v: "back", dx: 76, y: 292, z: "l",
  cats: [],
  loc: "Forearm, 2 cun below LI 11 on the line toward LI 5 (wrist).",
  find: "Usually a tender spot in the brachioradialis muscle, three finger-widths below the elbow crease.",
  fx: ["Arm counterpart of Stomach 36: tonifies Qi", "Elbow and forearm pain, tennis elbow"],
  course: [{ t: "Brachioradialis lies here; it is on the Chuden muscle chart.", ref: "Handbook 4.58-4.59" }],
  rel: ["LI11", "ST36"] });

Atlas.P("LI11", { py: "Qūchí", hz: "曲池", en: "Pool at the Crook", ch: "LI", v: "back", dx: 75, y: 266, z: "j",
  also: [{ v: "front", dx: 76, y: 268 }],
  cats: ["kata", "sea"],
  loc: "Outer end of the elbow crease, with the elbow bent, midway between the crease end and the lateral epicondyle.",
  find: "Bend the elbow to 90 degrees; the point is at the end of the crease on the thumb side.",
  fx: ["He-Sea point of the Large Intestine", "Clears Heat from the whole body: fever, rashes, itching", "Elbow and arm pain"],
  course: [{ t: "Kata step 30, the elbow point, pressed with the client supine. The handbook names it but does not mark it as a Long Life point.", ref: "Handbook 2.41" }],
  combos: [{ w: "SP10", n: "Clear heat from the Blood", t: "Classical pairing for itching skin and rashes." }],
  rel: ["LI4", "LI10", "LI15"] });

Atlas.P("LI15", { py: "Jiānyú", hz: "肩髃", en: "Shoulder Bone", ch: "LI", v: "back", dx: 56, y: 142, z: "p",
  also: [{ v: "front", dx: 56, y: 142 }],
  cats: [],
  loc: "Front of the shoulder, in the hollow below the acromion when the arm is raised.",
  find: "Lift the arm sideways; two hollows appear at the shoulder. This is the front one.",
  fx: ["Shoulder pain and stiffness, restricted raising of the arm"],
  course: [{ t: "Kata step 8 and step 28 work the shoulder joint here. Do not over-abduct or over-rotate.", ref: "Handbook 2.37, 2.41" }],
  rel: ["SJ14", "SI9"] });

Atlas.P("LI20", { py: "Yíngxiāng", hz: "迎香", en: "Welcome Fragrance", ch: "LI", v: "front", dx: 8, y: 76, z: "h",
  cats: [],
  loc: "Beside the nostril, in the groove between the nose and the cheek.",
  find: "Slide a finger from the side of the nostril into the smile line.",
  fx: ["Last point of the Large Intestine: crosses to the opposite side and passes Qi to the Stomach", "Opens the nose: congestion, loss of smell"],
  course: [{ t: "Kata step 53, nose strokes, works this area along with Bitong.", ref: "Handbook 2.46" }],
  rel: ["BITONG", "ST1"] });

/* ---------- Stomach (Leg Yang Ming, Earth) ---------- */
Atlas.P("ST1", { py: "Chéngqì", hz: "承泣", en: "Container of Tears", ch: "ST", v: "front", dx: 12, y: 64, z: "h",
  cats: [],
  loc: "Directly below the pupil, between the eyeball and the lower rim of the eye socket.",
  find: "Look straight ahead; the point is on the bony rim directly under the pupil.",
  fx: ["First point of the Stomach channel", "Eye conditions, tearing"],
  course: [{ t: "Kata step 59 works the eyes. Use cupped hands, not fingertips, if the client wears contact lenses.", ref: "Handbook 2.47, 2.7" }],
  rel: ["LI20", "UB1"] });

Atlas.P("ST4", { py: "Dìcāng", hz: "地仓", en: "Earth Granary", ch: "ST", v: "front", dx: 9, y: 88, z: "h",
  cats: [], loc: "Beside the corner of the mouth.", find: "Directly below the pupil, level with the corner of the mouth.",
  fx: ["Facial paralysis, drooling"], rel: ["ST6"] });

Atlas.P("ST6", { py: "Jiáchē", hz: "颊车", en: "Jaw Bone", ch: "ST", v: "front", dx: 25, y: 92, z: "h",
  cats: [], loc: "On the masseter, one finger-width in front of and above the angle of the jaw.",
  find: "Clench the teeth; the point is at the top of the bulging muscle.",
  fx: ["Jaw pain, toothache, TMJ tension"],
  course: [{ t: "Kata steps 54-55 work the mandible and masseter here. The masseter appears in the anatomy worksheets.", ref: "Handbook 2.47, 4.23" }],
  rel: ["ST7", "ST4"] });

Atlas.P("ST7", { py: "Xiàguān", hz: "下关", en: "Below the Joint", ch: "ST", v: "front", dx: 26, y: 70, z: "h",
  cats: [], loc: "In front of the ear, in the hollow below the cheekbone arch, which closes when the mouth opens.",
  find: "Open and close the jaw; feel the condyle move under your finger.",
  fx: ["TMJ pain, toothache, ear problems"], course: [{ t: "The TMJ is plate 2-4 in the anatomy coloring assignments.", ref: "Handbook 4.5" }], rel: ["ST6", "SI19"] });

Atlas.P("ST8", { py: "Tóuwéi", hz: "头维", en: "Head Corner", ch: "ST", v: "front", dx: 24, y: 34, z: "h",
  cats: [], loc: "At the corner of the forehead, 0.5 cun inside the hairline.",
  find: "Where the hairline turns the corner at the temple.",
  fx: ["Frontal and one-sided headache, dizziness"], course: [{ t: "The forehead strokes in kata step 52 pass this area.", ref: "Handbook 2.46" }], rel: ["TAIYANG", "GB14"] });

Atlas.P("ST9", { py: "Rényíng", hz: "人迎", en: "Man's Prognosis", ch: "ST", v: "front", dx: 12, y: 116, z: "n",
  cats: ["handbook"],
  loc: "Side of the neck, level with the Adam's apple, on the front edge of the sternocleidomastoid, over the carotid artery.",
  find: "Over the carotid pulse. Look but do not press.",
  fx: ["Sore throat, blood pressure (traditional)"],
  course: [{ t: "The handbook's contraindications say no anterior neck work and no neck stretch for atherosclerosis. Unexplained dizziness or tinnitus also means no rubbing of the front of the neck.", ref: "Handbook 2.7, 2.10" }],
  caut: "Over the carotid artery and sinus. Never press firmly. Respect the handbook's anterior-neck cautions.",
  rel: ["CV22"] });

Atlas.P("ST25", { py: "Tiānshū", hz: "天枢", en: "Heavenly Pivot", ch: "ST", v: "front", dx: 18, y: 300, z: "t",
  cats: ["mu"],
  loc: "2 cun lateral to the navel.",
  find: "Three finger-widths out from the navel, at the edge of the rectus abdominis.",
  fx: ["Front-Mu point of the Large Intestine", "Regulates the intestines: constipation, diarrhea, bloating"],
  course: [{ t: "Kata step 37 works the abdomen with the seven abdominal points and the clockwise perimeter, which passes here.", ref: "Handbook 2.43" },
           { t: "Rumination affects the Spleen and Stomach. Bring the focus into the abdomen and hara with deep breathing.", ref: "Pathogens and Emotions handout" }],
  caut: "No abdominal work for aortic aneurysm, hernia, gastric ulcer, or pregnancy (Handbook 2.9, 2.14, 2.19, 2.33).",
  combos: [{ w: "UB25", n: "Shu-Mu pair", t: "Large Intestine back-Shu with its front-Mu." },
           { w: "CV12", n: "Digestive triad", t: "With ST36: the classical trio for the middle burner." }],
  rel: ["CV8", "ST36"] });

Atlas.P("ST34", { py: "Liángqiū", hz: "梁丘", en: "Beam Mound", ch: "ST", v: "front", dx: 32, y: 462, z: "p",
  cats: [], loc: "2 cun above the upper outer corner of the kneecap.",
  find: "Tense the thigh; it sits in the hollow in the vastus lateralis.",
  fx: ["Xi-Cleft point of the Stomach: acute stomach pain", "Knee pain and swelling"],
  course: [{ t: "Kata step 38 works the quadriceps along the Liver, Spleen and Stomach lines.", ref: "Handbook 2.44" }], rel: ["ST35", "ST36"] });

Atlas.P("ST35", { py: "Dúbí", hz: "犊鼻", en: "Calf's Nose", ch: "ST", v: "front", dx: 31, y: 485, z: "j",
  cats: ["kata"], loc: "Just below the kneecap, in the hollow outside the patellar ligament (the outer 'eye' of the knee).",
  find: "Bend the knee; the two hollows either side of the ligament are the knee eyes. This is the outer one.",
  fx: ["Knee pain, swelling and stiffness"],
  course: [{ t: "Kata step 39 presses four points around the patella; the knee eyes are two of them.", ref: "Handbook 2.44" }], rel: ["ST36", "ST34"] });

Atlas.P("ST36", { py: "Zúsānlǐ", hz: "足三里", en: "Leg Three Miles", ch: "ST", v: "front", dx: 30, y: 506, z: "l",
  cats: ["longlife", "kata", "handout", "sea", "command"],
  loc: "3 cun below the outer knee eye (ST 35), one finger-width outside the front crest of the tibia, on tibialis anterior.",
  find: "Four finger-widths below the kneecap, then one finger-width out from the shin bone. Flex the foot and feel the muscle tighten.",
  fx: ["He-Sea point of the Stomach (Earth point on an Earth channel)", "Command point of the abdomen", "Tonifies Qi and Blood for the whole body", "Strengthens the Spleen and Stomach; makes Qi from food"],
  course: [{ t: "Long Life point. Kata step 40 (lower leg point) presses it with the client supine.", ref: "Handbook 2.44" },
           { t: "One of the four Long Life points in the homework drawing assignment.", ref: "Handbook 3.8" },
           { t: "A point in the 'depths': used for digestive disorders and making Qi from food. Stimulating the depths moves a current across the whole channel.", ref: "Meridian Theory part 1 slides" },
           { t: "Supports the Qi of the whole body, supports the Stomach and Spleen, alleviates pain.", ref: "Meridian part 2 slide 7" }],
  caut: "Long Life point: never pressed for a pregnant client (Handbook 2.7, 2.33).",
  combos: [{ w: "SP6", n: "Qi and Blood", t: "Earth's Yang and Yin channels together: tonifies Qi and Blood, the core of food therapy theory." },
           { w: "PC6", n: "Settle the stomach", t: "Nausea and stomach pain." },
           { w: "LI4", n: "Shallows and depths", t: "The two examples in the Meridian Theory ocean model." }],
  rel: ["ST25", "CV12", "LI10", "UB20", "UB21"] });

Atlas.P("ST40", { py: "Fēnglóng", hz: "丰隆", en: "Abundant Bulge", ch: "ST", v: "front", dx: 33, y: 545, z: "l",
  cats: ["luo"], loc: "Midway between the knee and the ankle, two finger-widths outside the tibia crest.",
  find: "Halfway down the shin, a little further out than ST 36.",
  fx: ["Luo point: connects to the Spleen channel", "The classical point for resolving Phlegm and Damp"],
  course: [{ t: "Damp pain is heavy and sluggish and is the most likely to become chronic (Types of Pain handout). This is the classical Damp point.", ref: "Types of Pain handout; Handbook 3.53" }],
  rel: ["SP3", "SP9"] });

Atlas.P("ST41", { py: "Jiěxī", hz: "解溪", en: "Stream Divide", ch: "ST", v: "front", dx: 24, y: 598, z: "d",
  cats: [], loc: "Front of the ankle crease, between the two big tendons.", find: "Lift the toes; the point is between the tendons at the ankle crease.",
  fx: ["Ankle pain, foot drop"], course: [{ t: "Kata step 47 rotates the ankle through this joint.", ref: "Handbook 2.45" }], rel: ["ST42"] });

Atlas.P("ST42", { py: "Chōngyáng", hz: "冲阳", en: "Rushing Yang", ch: "ST", v: "front", dx: 24, y: 606, z: "d",
  cats: ["source"], loc: "Highest point of the top of the foot, where the dorsalis pedis pulse is felt.",
  find: "Feel for the pulse on top of the foot.", fx: ["Source point of the Stomach"], rel: ["ST36", "SP3"] });

Atlas.P("ST44", { py: "Nèitíng", hz: "内庭", en: "Inner Courtyard", ch: "ST", v: "front", dx: 22, y: 616, z: "d",
  cats: [], loc: "Web between the 2nd and 3rd toes.", find: "At the end of the web between the second and third toes.",
  fx: ["Clears Stomach heat: toothache, frontal headache, bleeding gums"],
  course: [{ t: "Kata steps 43-44 work between the metatarsals and the toes.", ref: "Handbook 2.45" }], rel: ["ST42", "LV2"] });

/* ---------- Spleen (Leg Tai Yin, Earth) ---------- */
Atlas.P("SP1", { py: "Yǐnbái", hz: "隐白", en: "Hidden White", ch: "SP", v: "front", dx: 10, y: 621, z: "d",
  cats: ["well"], loc: "Big toe, inner corner of the nail.", find: "Medial corner of the big toenail.",
  fx: ["Jing-Well point: the Spleen channel begins here", "Stops bleeding (Spleen holds the Blood)"],
  course: [{ t: "Kata step 46 seals off the toes.", ref: "Handbook 2.45" }], rel: ["LV1", "SP3"] });

Atlas.P("SP3", { py: "Tàibái", hz: "太白", en: "Supreme White", ch: "SP", v: "front", dx: 10, y: 612, z: "d",
  cats: ["source"], loc: "Inner edge of the foot, just behind the ball of the big toe (1st metatarsal head).",
  find: "Slide along the inner foot from the big toe; the point is in the hollow just past the knuckle.",
  fx: ["Source point of the Spleen (Earth point on an Earth channel)", "Tonifies the Spleen, resolves Damp"], rel: ["SP4", "ST42"] });

Atlas.P("SP4", { py: "Gōngsūn", hz: "公孙", en: "Grandfather Grandson", ch: "SP", v: "front", dx: 10, y: 606, z: "d",
  cats: ["luo", "confluent"], loc: "Inner edge of the foot, in the hollow below the base of the 1st metatarsal.",
  find: "Slide back from SP 3 until the finger drops into a hollow at the base of the bone.",
  fx: ["Luo point: connects to the Stomach channel", "Opens the Chong Mai (paired with PC6)", "Stomach pain, bloating"],
  combos: [{ w: "PC6", n: "Chong Mai opening pair", t: "Confluent points of the Chong and Yin Wei vessels: heart, chest and stomach." }],
  rel: ["SP3", "ST40"] });

Atlas.P("SP6", { py: "Sānyīnjiāo", hz: "三阴交", en: "Three Yin Intersection", ch: "SP", v: "front", dx: 14, y: 566, z: "l",
  cats: [], loc: "3 cun above the tip of the inner ankle bone, just behind the tibia.",
  find: "Four finger-widths above the inner ankle bone, against the back edge of the shin bone. Usually tender.",
  fx: ["Meeting point of the three leg Yin channels: Spleen, Liver, Kidney", "Tonifies Spleen, Blood and Yin", "Gynecological and urinary conditions, insomnia"],
  course: [{ t: "Kata step 41 works the lower leg lines with the client supine. The slides note that the Spleen and Liver channels both run here.", ref: "Handbook 2.44; Meridian part 2 slide 6" }],
  caut: "Classically contraindicated in pregnancy. The handbook forbids all sustained-pressure points in pregnancy (2.33).",
  combos: [{ w: "ST36", n: "Qi and Blood", t: "The Earth pair: tonifies Qi and Blood." }],
  rel: ["LV3", "KD3", "SP9", "SP10"] });

Atlas.P("SP9", { py: "Yīnlíngquán", hz: "阴陵泉", en: "Yin Mound Spring", ch: "SP", v: "front", dx: 13, y: 494, z: "j",
  cats: ["sea"], loc: "Below the inner knee, in the hollow under the medial condyle of the tibia.",
  find: "Run your thumb up the inner edge of the shin until it stops under the knee.",
  fx: ["He-Sea point of the Spleen", "Resolves Damp: swelling, edema, heaviness"],
  course: [{ t: "Damp is heavy, sticky, descending, and causes edema and heaviness.", ref: "Handbook 3.53; Pathogens handout" }],
  caut: "New or unexplained edema needs a provider's evaluation before bodywork (Handbook 2.12).",
  rel: ["ST40", "SP6"] });

Atlas.P("SP10", { py: "Xuèhǎi", hz: "血海", en: "Sea of Blood", ch: "SP", v: "front", dx: 16, y: 458, z: "p",
  cats: [], loc: "2 cun above the upper inner corner of the kneecap, on the bulge of vastus medialis.",
  find: "Cup the client's kneecap with your palm; your thumb lands on it.",
  fx: ["Cools and moves the Blood", "Skin rashes, itching, menstrual problems"],
  course: [{ t: "Blood stagnation pain is sharp, stabbing and fixed, and worse with inactivity.", ref: "Handbook 3.19, 3.49; Types of Pain handout" }],
  combos: [{ w: "LI11", n: "Clear heat from the Blood", t: "Itching and rashes." }, { w: "UB17", n: "Blood points", t: "With the influential point of Blood." }],
  rel: ["SP6", "UB17"] });

Atlas.P("SP21", { py: "Dàbāo", hz: "大包", en: "Great Embrace", ch: "SP", v: "front", dx: 48, y: 228, z: "t",
  cats: ["luo", "handbook"], loc: "Side of the chest, on the mid-axillary line, in the 6th intercostal space.",
  find: "Straight down from the armpit, about level with the lower edge of the pectorals.",
  fx: ["The Great Luo of the Spleen: Qi and Blood to the whole body's network vessels", "Generalized aches and weakness"],
  course: [{ t: "The Luo chart lists the 'Great Luo' of the Spleen as a 15th Luo vessel.", ref: "Handbook 3.30, 3.62" }],
  rel: ["SP4", "LU1"] });

/* ---------- Heart (Arm Shao Yin, Fire) ---------- */
Atlas.P("HT1", { py: "Jíquán", hz: "极泉", en: "Summit Spring", ch: "HT", v: "front", dx: 46, y: 186, z: "t",
  cats: [], loc: "Center of the armpit, beside the axillary artery.", find: "Raise the arm; the point is at the deepest center of the armpit.",
  fx: ["First point of the Heart channel", "Chest oppression, arm numbness"], caut: "Neurovascular bundle. Use gentle pressure only.", rel: ["HT3", "PC3"] });

Atlas.P("HT3", { py: "Shàohǎi", hz: "少海", en: "Lesser Sea", ch: "HT", v: "front", dx: 58, y: 270, z: "j",
  cats: ["sea"], loc: "Inner end of the elbow crease, with the elbow bent, in front of the medial epicondyle.",
  find: "Bend the elbow fully; the point is at the end of the crease on the little-finger side.",
  fx: ["He-Sea point of the Heart", "Calms the Shen; elbow pain, numbness"], rel: ["HT7", "SI8"] });

Atlas.P("HT5", { py: "Tōnglǐ", hz: "通里", en: "Connecting Li", ch: "HT", v: "front", dx: 70, y: 344, z: "l",
  cats: ["luo"], loc: "1 cun above the wrist crease, on the radial side of the flexor carpi ulnaris tendon.",
  find: "One finger-width above HT 7.", fx: ["Luo point: connects to the Small Intestine", "Sudden loss of voice, palpitations"], rel: ["HT7"] });

Atlas.P("HT7", { py: "Shénmén", hz: "神门", en: "Spirit Gate", ch: "HT", v: "front", dx: 70, y: 355, z: "d",
  cats: ["source"], loc: "Wrist crease on the little-finger side, in the hollow on the thumb side of the flexor carpi ulnaris tendon.",
  find: "Follow the little-finger tendon to the wrist crease; the point is in the hollow just inside it.",
  fx: ["Source point of the Heart", "The main point to calm the Shen: anxiety, insomnia, palpitations"],
  course: [{ t: "The Heart houses the Shen. Shen disharmony shows as insomnia, dull eyes, and a scattered mind.", ref: "Handbook 3.22, 3.41" },
           { t: "For Joy (Fire, Heart) the handout's principle is to settle the Shen.", ref: "Pathogens and Emotions handout" }],
  combos: [{ w: "YINTANG", n: "Settle the Shen", t: "Classical calming pair." }, { w: "PC6", n: "Calm the heart", t: "Anxiety and palpitations." }],
  rel: ["HT5", "UB15", "UB44"] });

Atlas.P("HT9", { py: "Shàochōng", hz: "少冲", en: "Lesser Rushing", ch: "HT", v: "front", dx: 73, y: 404, z: "d",
  cats: ["well"], loc: "Little finger, radial corner of the nail.", find: "Inside corner of the little fingernail.",
  fx: ["Jing-Well point: Heart Qi passes to the Small Intestine", "Revives consciousness (traditional)"], rel: ["SI3"] });

/* ---------- Small Intestine (Arm Tai Yang, Fire) ---------- */
Atlas.P("SI3", { py: "Hòuxī", hz: "后溪", en: "Back Stream", ch: "SI", v: "back", dx: 71, y: 384, z: "d",
  cats: ["confluent"], loc: "Outer edge of the hand, just behind the knuckle of the little finger, at the end of the crease when a fist is made.",
  find: "Make a loose fist; the point is at the end of the palm crease on the little-finger side.",
  fx: ["Opens the Du Mai (paired with UB62)", "Stiff neck, back pain, occipital headache"],
  combos: [{ w: "UB62", n: "Du Mai opening pair", t: "Confluent points of the Du and Yang Qiao vessels: spine, neck and back." }],
  rel: ["SI4", "GV14"] });

Atlas.P("SI4", { py: "Wàngǔ", hz: "腕骨", en: "Wrist Bone", ch: "SI", v: "back", dx: 71, y: 366, z: "d",
  cats: ["source"], loc: "Outer edge of the hand, in the hollow between the 5th metacarpal and the wrist bones.",
  find: "Slide up the outer edge of the hand from SI 3 until the finger drops into a hollow.", fx: ["Source point of the Small Intestine"], rel: ["SI3", "HT7"] });

Atlas.P("SI8", { py: "Xiǎohǎi", hz: "小海", en: "Small Sea", ch: "SI", v: "back", dx: 58, y: 268, z: "j",
  cats: ["sea"], loc: "Back of the elbow, between the olecranon and the medial epicondyle, over the ulnar nerve.",
  find: "The 'funny bone' groove.", fx: ["He-Sea point of the Small Intestine", "Elbow pain"], caut: "Ulnar nerve. Avoid sustained pressure.",
  course: [{ t: "Kata step 9 works the triceps along the Small Intestine, Triple Burner and Large Intestine channels.", ref: "Handbook 2.38" }], rel: ["HT3"] });

Atlas.P("SI9", { py: "Jiānzhēn", hz: "肩贞", en: "True Shoulder", ch: "SI", v: "back", dx: 44, y: 178, z: "p",
  cats: [], loc: "Back of the shoulder, 1 cun above the end of the rear armpit fold.", find: "Arm at the side; one thumb-width above the back armpit crease.",
  fx: ["Shoulder and scapula pain"], course: [{ t: "Teres major and minor lie here; both are on the muscle charts.", ref: "Handbook 4.57" }], rel: ["SI11", "LI15"] });

Atlas.P("SI11", { py: "Tiānzōng", hz: "天宗", en: "Heavenly Gathering", alt: "Celestial Gathering", ch: "SI", v: "back", dx: 30, y: 182, z: "t",
  cats: ["longlife", "kata"],
  loc: "Center of the shoulder blade, in the infraspinous fossa, about one third of the way from the spine of the scapula to its lower tip.",
  find: "Find the middle of the shoulder blade below its spine; press into the infraspinatus. It is usually tender and often refers sensation down the arm.",
  fx: ["Shoulder blade pain, inability to raise the arm", "Traditionally used for breast pain and lactation"],
  course: [{ t: "Long Life point. Kata step 6 (infraspinatus point) with the client prone.", ref: "Handbook 2.37" },
           { t: "One of the four Long Life points in the homework drawing assignment.", ref: "Handbook 3.8" },
           { t: "Infraspinatus is palpated near SI 11 in the anatomy worksheets.", ref: "Handbook 4.26" },
           { t: "The Small Intestine channel covers the posterior shoulder and the ulnar arm.", ref: "Meridian part 2 slide 5" }],
  caut: "Long Life point: never pressed for a pregnant client (Handbook 2.7, 2.33).",
  rel: ["SI9", "GB21", "LI4", "ST36", "KD1"] });

Atlas.P("SI19", { py: "Tīnggōng", hz: "听宫", en: "Palace of Hearing", ch: "SI", v: "front", dx: 27, y: 64, z: "h",
  cats: [], loc: "In front of the ear, in the hollow that opens when the mouth opens.", find: "Open the mouth; the hollow in front of the ear flap.",
  fx: ["Last point of the Small Intestine", "Tinnitus, deafness, ear pain"],
  course: [{ t: "Kata step 57 works the ears. Unexplained tinnitus needs referral (Handbook 2.7, 2.18).", ref: "Handbook 2.47" },
           { t: "For Joy (Fire, Heart) the handout suggests focusing on the ears.", ref: "Pathogens and Emotions handout" }],
  rel: ["SJ17", "ST7"] });
