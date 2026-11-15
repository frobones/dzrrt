# AGENTS.md

Guidance for AI agents working with this Danzan Ryu Restorative Therapy (DZRRT) study
collection. The user is studying the DZRSI Chuden Ichi program (formerly "Module 2"),
whose Asian Medicine material draws on Traditional Chinese Medicine (TCM). Typical
work here is exam prep, quizzes, explaining concepts, and connecting the kata to
channel theory.

## Repository contents

The repository has two parts:

- **`source/`** holds the original course documents. Treat it as read-only: never edit,
  rename, or overwrite the originals. It is gitignored because the handbook is
  copyrighted. Never commit it or force-add it.
- **`docs/`** holds the Chuden Point Atlas, a static study site meant for GitHub Pages.
  See [Study site](#study-site) below.

| File | What it is | How to read it |
| --- | --- | --- |
| `CHUDEN ICHI-full.pdf` | The DZRSI *Chuden Ichi Program Student Handbook*: 298 pages in six sections. This is the primary source. | Text layer is good: `pdftotext -layout -f N -l N` |
| `Asian Med 2026 Meridian Theory.pdf` | Class slides, Meridian Theory part 1. Covers the ocean/depth analogy, channel depth layers, and the "shallows vs depths" points LI 4 and ST 36. | **Image only, no text layer.** Render with `pdftoppm -r 70 -png` and view the images. |
| `Asian Med 2026 Mod 2 Meridian pt 2 (1).pptx` | Class slides, Meridian Theory part 2. Covers the sinew channels and which kata lines they cover, plus points ST 36, LI 4 and GB 20. | Unzip it and read the `<a:t>` runs in `ppt/slides/slideN.xml`. The speaker notes are empty. |
| `Asian Med Mod 2 Pathogens and Emotions (1).pdf` | Instructor handout on the six external pathogens and the seven emotions. Asks "How would you treat X with DZRRT?" and gives treatment zones and points. | Text layer OK |
| `Asian Med Mod 2 Types of Pain PDF.pdf` | Instructor handout "Pathophysiology of Pain", by a DZRSI Program Instructor. Covers the six pain types and the Eight Entities applied to pain. | Text layer OK |
| `Anatomy Coloring Book.pdf` | *Netter's Anatomy Coloring Book*, the course's anatomy text (Handbook 4.54). 387 pages in 11 chapters; each plate is a text page followed by a figure page. Chapter 2 (skeletal, plates 2-1 to 2-20) is PDF pages 33–74 and chapter 3 (muscular, 3-1 to 3-32) is pages 77–143: plate 2-n starts on PDF page 31 + 2n, and plate 3-n on 75 + 2n. | Text layer OK. Origin/insertion tables interleave their columns, so rebuild rows with care. |

The last slide of the Meridian Theory PDF duplicates slide 1 of the pptx.

### Class notes

The user's own class notes for the whole course live in a Google Doc, outside the
repository:
<https://docs.google.com/document/d/1SzE8p9yyB3TD_9jtz062XGyj4WhP6vXHhOm2V-oUgHA/edit?usp=sharing>

- Check them for class techniques, terms and abbreviations that the handbook and
  handouts don't use.
- Read them as plain text by fetching the document's `/export?format=txt` URL. The
  response redirects to a `googleusercontent.com` export host.
- They are informal and may abbreviate or paraphrase what was said in class. Treat
  them as a record of what was taught, not as an authority that overrides the handbook.

## Handbook map

Each footer carries a **handbook page label** such as `3.30` (section.page).
**Always cite by that label**, for example "Handbook 3.30". The PDF page is the
label's page number plus a fixed offset for its section:

| Section | Labels | PDF pages | Offset | Contents |
| --- | --- | --- | --- | --- |
| 0 Contents | 0.2–0.8 | 2–8 | — | Master table of contents |
| 1 Program Catalog | 1.1–1.14 | 9–22 | +8 | Hours, prerequisites, textbooks, exams and grading, attendance, conduct |
| 2 DZRRT Applications | 2.1–2.60 | 23–82 | +22 | Client care, contraindications, skin conditions, pregnancy, **the 60-step Kata (2.35–2.47)**, Seifukujitsu arts (2.49–2.60) |
| 3 Asian Medicine & DZRRT | 3.1–3.102 | 83–184 | +82 | TCM theory (3.9–3.63), channel diagrams, glossary (3.83–3.87), Chuden Ichi additions (3.89–3.101) |
| 4 Anatomy & Physiology | 4.1–4.80 | 185–264 | +184 | Netter plate assignments, worksheets, muscle charts, bony landmarks, physiology |
| 5 Standards of Practice | 5.1–5.22 | 265–286 | +264 | Esoteric principles, Code of Ethics, legal, hygiene, boundaries, client forms |
| 6 AJJF & DZRSI History | 6.1–6.12 | 287–298 | +286 | AJJF and DZRSI founding, Professor Okazaki, bodywork history in China, Japan and the West |

### Chuden Ichi vs carried-over Shoden material

Most of the handbook is reprinted from the earlier Shoden (Module 1) handbook. Its
footers still read "Shoden Program Student Handbook" on 186 of 298 pages. The
Chuden Ichi-specific content is:

- **Section 2.** The intro and goals (2.2–2.3) and the Seifukujitsu arts #1–22 and #50
  (2.49–2.60). Items marked `*` in the 2.2 table of contents are Shoden reprints.
- **Section 3.** The Chuden Ichi additions (3.89–3.101):
  - Five Phases cosmological table
  - Bu and Xie (tonify/sedate)
  - Five Spirits
  - Personality and Elements
  - Life Gate and Premier Fire
  - Pain types
  - Tien Qi, Yuan Qi and Jing
  - Jinshang (three injury stages)
  - Moxibustion
  - Food therapy
- **Section 4.** 4.51–4.80. This includes the Chuden muscle chart, which lists origin,
  insertion and action, and the filled-in bony landmarks list.

When a question is about Chuden Ichi specifically, weight these parts. Treat the
Shoden material as assumed prior knowledge.

### Study guides (what is examinable)

| Exam | Study guide |
| --- | --- |
| Exam rules (catalog) | 1.10–1.11. Kata minimum is 80%. Written exams need an average of at least 75%, with no single exam below 70%. |
| Chuden Ichi kata/Seifukujitsu | 2.2. Assessed through the course; selected arts are graded pass/fail. |
| Asian Medicine | 3.4–3.7, plus the homework at 3.8 |
| Anatomy | 4.54 for Chuden. 4.4 is the Shoden guide. The exam muscle list (4.55–4.61) gives each muscle's Netter plate; the coloring assignments are at 4.53 and the palpable landmarks at 4.64. |
| Standards of Practice | 5.4 |
| History | 6.3 |

The following are marked **not on the exam**:
- Conditions and contraindications (2.9–2.19)
- Skin conditions (2.20–2.31)
- Physiology (4.75 onward)
- Nervous system review (4.72–4.74)
- Lymphatic overview (4.70)

### Pages without usable text

- **Image only:**
  - Channel diagrams, 3.64–3.81
  - Five Phases diagram, 3.38
  - Tongue figure, 3.59
  - Pulse figure, 3.61
  - Skin-condition photos, 2.21–2.31 (captions only)
- **Blank:** 1.14, 2.34, 3.17, 3.88, 4.50.
- **Garbled tables:** Read these from the rendered page image, not the text layer.
  - Chuden muscle chart, 4.55–4.61. Columns interleave and footers split rows.
  - Shoden muscle chart, 4.47–4.49
  - Extraordinary vessel chart, 3.36
  - Nervous system tables, 4.72–4.73
- **Worksheet pages (4.6–4.46, 4.62–4.71):** these are blank fill-in forms. They are
  not an answer key.

## Cross-reference: kata ↔ channels ↔ points

This table ties the kata (2.35–2.47) to the class slides. Use it to answer "what does
this kata step affect" questions.

| Kata | Channel / point (source) |
| --- | --- |
| Back Line 1 (steps 1, 3) | Hua Tuo Jia Ji points (HTJJ), **not** the Urinary Bladder (UB) channel. Sources: 2.35, Mod 2 pt 2 slide 3. Also the "fear/Kidney" treatment zone (Pathogens handout). |
| Back Lines 2–3, hamstrings, gastrocnemius | UB channel medial and lateral, with Shu points (2.35; slide 2) |
| Step 2 / 58 | GB 20 Feng Chi, "Wind Pool". A Long Life point. |
| Step 6 | SI 11 Tian Zong. A Long Life point. |
| Step 24 | KD 1 Yong Quan, "Bubbling Spring". A Long Life point. |
| Step 32 | LI 4 Hegu/Hoku, "Joining Valley". A Long Life point and a "shallows" point (Meridian Theory pt 1). |
| Step 40 | ST 36 Zu San Li, "Leg Three Miles". A Long Life point and a "depths" point. |
| Step 30 / 43 | LI 11 Qu Chi; LV 2 Xing Jian. Named, but not Long Life points. |
| Lateral hip/thigh (steps 16–19) | GB channel over the ITB and TFL (slide 4) |
| Supine medial lower leg (step 41) | Liver and Spleen channels (slide 6) |
| Posterior shoulder, ulnar arm | SI channel (slide 5) |

- **Long Life points:** the 3.8 homework lists four: LI 4, SI 11, ST 36, KD 1. The kata
  also marks GB 20 as one.
- **Pregnancy:** none of the Long Life points are pressed in pregnancy (2.7, 2.33).
- **DZRRT and channels:** DZRRT mainly works the **myofascial (sinew) channels**, which
  run from the digits toward the trunk. The primary channels are reached only at
  points (3.58; slides).

## Conventions

- **Terminology.** Use the handbook's terms. Note a common synonym once when it helps.
  - "Five Phases", not "Five Elements". The handbook explains the change at 3.91.
  - "Myofascial (sinew) channels", "Primary channels", "Zang/Fu"
  - "Bu/Xie" for tonify/sedate
  - "Long Life points"
  - "Universal Precautions"
  - "client", not "patient"
- **Channel abbreviations vary between sources.** Normalize answers to: LU, LI, ST, SP,
  HT, SI, UB, KD, PC, SJ (San Jiao/Triple Burner), GB, LV, Du, Ren. Variants you will
  meet:
  - KD vs K
  - PC vs P
  - SJ vs TB
  - LV vs LR
  - UB vs BL
  - "Hoku" for Hegu
  - "Huato Jiaji" for Hua Tuo Jia Ji
- **Program naming.** "Chuden Ichi" is the current name. "Chuden I" and "Module 2" are
  former names, and "Chuden Ni" is the next level.
- **Source tiers.** Answer from the handbook first. Then use the 2026 class handouts,
  which are instructor elaborations and generally agree with the handbook. Then use the
  user's [class notes](#class-notes). Use general TCM knowledge last, and **label it as
  outside the course material**. Exam answers
  should match the handbook's wording and lists, even where standard TCM texts differ.
- **The anatomy text.** *Netter's Anatomy Coloring Book* is the course's assigned anatomy book, so it sits
  with the handbook as a course source. Cite it by plate, for example "Netter plate 3-9".
- **Citing.** Cite every substantive claim with a handbook label, a handout filename,
  or "class notes" with the notes' heading.
  If the corpus doesn't cover something, say so rather than filling the gap.
- **Pain material spans three sources, and they complement each other:**
  - Handbook 3.48–3.49: the Eight Principles pain table
  - Handbook 3.97: six pain types
  - *Types of Pain* handout: the treatment approach for each type

  Merge them when asked about pain, and attribute each part to its source.

## Known errata and inconsistencies in the sources

Report these as written, flag the conflict, and don't silently "fix" them in exam
answers.

### Section 1 (Catalog)
- **Seifukujitsu art ranges conflict.**
  - 1.5 says Chuden Ichi covers #1–26 + #50.
  - 2.51 says #1–22 + #50.
  - The handbook contains #1–22 + #50.
- **Written exam count conflicts.** 1.10–1.11 refer to "five final written exams" but
  then list three.
- **Attendance text is Shoden wording.** It says "150 hours", but Chuden Ichi is 120
  hours (1.12 vs 1.1).
- **Standards of Practice hours conflict.** 5.3 says 10 hours, the Shoden catalog
  (1.6) says 6, and the Chuden catalog (1.7) says 2.

### Section 2 (Applications)
- **Psoriasis.** 2.10 says it may be worked with a cover. 2.24 says do not touch.
- **Pregnancy pressure.** 2.7 says medium to light, 2.17 says "moderate", and 2.33 says
  no deep pressure.
- **Herpes.** 2.15 says it is OK without visible lesions. 2.30 says it may still be
  contagious.

### Section 3 (Asian Medicine)
- **Study guide 3.6 lists "Heart" among the emotions.** The chart at 3.55 shows this
  should be **Shock**.
- **Mislabeled figure.** 3.36 "Figure 12: Luo Channel Chart" is actually the
  Extraordinary vessel chart.
- **Luo list mismatch.** The 3.62 list has "Arm Shao **Yin** – Triple Burner"; 3.30 has
  Arm Shao **Yang**.
- **Qiao/Wei mix-up.** The 3.63 list names "Yang/Yin **Wei** Mai – Stepping"; these
  should be **Qiao** Mai (see 3.35).

### Section 4 (Anatomy)
- **Tables of contents and study-guide page references are stale.** For example, the
  study guides say "pages 23–31" and "pages 8–13" for the muscles. Locate content by
  topic, not by the TOC.
- **Shoden and Chuden muscle charts disagree** on several attachments, including the
  rhomboids, splenius, pectoralis minor and serratus posterior inferior. For Chuden
  questions, use the Chuden chart (4.55–4.61) and note the discrepancy.

### Section 6 (History)
- **Dates conflict with standard history.** These are noted from outside knowledge.
  - Taisho is given as "1912–1989"; it was actually 1912–1926.
  - Sakoku overlaps Edo.

### Netter's Anatomy Coloring Book

These were checked against the PDF's text. The site data uses the corrected value and
says what the book prints.

- **2-3.** The abducent nerve is labelled "(IV)". It is cranial nerve VI.
- **2-8, 2-10.** The text says 16 muscles attach to the scapula, but the 2-10 table
  counts 17.
- **2-13.** "Most commonly fractured carpal" sits on the lunate row. It is the scaphoid.
- **2-14.** The "Distal Radiocarpal (pivot) Joint" row describes the distal radio-ulnar
  joint. The radial collateral ligament is run to the scaphoid and triquetrum; it
  attaches to the scaphoid, and the triquetrum is on the ulnar side.
- **2-15.** The sacrococcygeal disc is placed between S5 and "C1". It is Co1.
- **3-22.** Extensor pollicis brevis is said to extend the proximal phalanx at the
  carpometacarpal joint. The proximal phalanx moves at the MCP joint.
- **3-26.** Semitendinosus nerve roots are printed as L2-S2. The other hamstrings, and
  standard anatomy, give L5-S2.
- **3-31.** Abductor hallucis acts at the "metacarpophalangeal" joint; in the foot that
  is the metatarsophalangeal joint. The plantar interossei are said to adduct digits
  2-4, but they attach to and adduct toes 3-5.

These were checked and are **not** errors:

- **3-23.** Lumbricals 3 and 4 arising from the "medial three" flexor digitorum
  profundus tendons. Each lumbrical takes the sides of two neighboring tendons.
- **3-1.** Frontalis given as running from the forehead skin to the epicranial
  aponeurosis. Texts differ on which end they call the origin.

### Spelling variants
These appear as printed in the source:
- "Seigotsu" (usually Seikotsu)
- "Seifukujutsu" (2.3)
- "Sehukujitsu" (2.50)

## Boundaries

- **Copyright.** The handbook is © DZRSI/AJJF and may not be reproduced without written
  consent (1.2).
  - Summarize, paraphrase and quiz from it freely for the user's own study.
  - Never commit, publish or share extracted full text, page images or long verbatim
    passages.
  - Keep extracted text in the session scratchpad or a gitignored `temp/`, not in the
    repository.
  - The name "Danzan Ryu Restorative Therapy" is reserved for DZRSI-approved
    practitioners.
- **Not medical advice.** This is educational material for a bodywork program.
  - Do not diagnose, prescribe, or present TCM or Seifukujitsu claims as established
    medical fact.
  - The Seifukujitsu "Classical Descriptions" (2.51–2.59) include outdated or unsafe
    claims, such as laxatives and gendered causes of illness. The DZRSI keeps them only
    as heritage. Always pair them with the handbook's "Exposition" notes and its
    medical-referral guidance.
  - When a question touches a real client, surface the handbook's contraindications
    (2.9–2.33) and its "when in doubt, check it out" referral rule.
- **Scope of practice.** Graduates may practice on family and friends unless the state
  disallows it (1.6–1.7). Do not imply licensure. Local regulations govern (5.8).
- **Real names.** Quiz and example material may name the historical figures the
  handbook covers. For example clients, case studies and forms, use made-up
  placeholders, never real people.

## License exception: share-alike anatomy models

The BRS standard allows only permissive licenses. For this project the owner approved
one exception, because the site is a free, personal study tool that is never sold.

- **Allowed:** 3D anatomy models under CC BY-SA, namely Z-Anatomy (CC BY-SA 4.0), which
  is built on BodyParts3D. BodyParts3D itself is CC BY 4.0 since its license page was
  updated on 2025-02-27, even though its OBJ file headers still carry the older CC BY-SA
  2.1 Japan notice.
- **Why:** BodyParts3D alone lacks six exam muscles (latissimus dorsi, rectus abdominis,
  internal oblique, transversus abdominis, quadratus lumborum, multifidi) and every knee
  ligament. Z-Anatomy has all of them.
- **Obligations:**
  - Credit both sources on the site.
  - Keep any model files derived from them under CC BY-SA 4.0, and say so where they
    are published.
  - Never sell the site or its models.
- **Still excluded:** the parts of Z-Anatomy under non-commercial licenses: the inner
  ear (CC BY-NC-SA) and the kidney (CC BY-NC). Do not export them.
- **Scope:** this exception covers anatomy model data only. Code dependencies still need
  permissive licenses.

## Working tips

- To find a topic, grep the per-page text and map the page back with the offsets above.
  For example:

  ```bash
  for i in $(seq 1 298); do pdftotext -layout -f $i -l $i "source/CHUDEN ICHI-full.pdf" - | grep -q -i "bu and xie" && echo $i; done
  ```

- The handbook's master table of contents (0.2–0.7) is reliable for Sections 1–3, 5
  and 6. It is not reliable for Section 4.
- For quizzes, draw items from the study guides and match their scope. For example,
  the Asian Medicine exam expects you to trace 14 channels including Du and Ren, and to
  reproduce the Sheng/Ko diagram.

## Study site

`docs/` is the Chuden Point Atlas: plain HTML, CSS and JavaScript with no build step and
no dependencies. GitHub Pages can serve it directly from the `docs/` folder of the
default branch.

### Running it locally

The pages load several script files, so serve the folder over HTTP rather than opening
`index.html` directly:

```bash
python3 -m http.server 8765 --directory docs
```

Then open `http://localhost:8765`. `.claude/launch.json` defines the same server as
`atlas` for the desktop app's preview pane.

### Layout

| Path | Contents |
| --- | --- |
| `docs/index.html` | Page shell, tab navigation, script order |
| `docs/css/style.css` | All styles. Colors are tokens on `:root`, with dark mode overrides |
| `docs/js/data/channels.js` | Channels, their drawn paths, horary times, and point categories |
| `docs/js/data/points-1.js`, `points-2.js` | The points. The field list is documented at the top of `points-1.js` |
| `docs/js/data/kata.js` | The 60 kata steps, the zoom regions, and the three kata back lines |
| `docs/js/data/theory.js` | Five Phases, emotions, pain types, channel layers, depth zones |
| `docs/js/data/lenses.js` | Two Lenses content: ground rules, frame shifts, complaints, muscle map, terms |
| `docs/js/data/anatomy-muscles.js` | The 188 chapter 3 muscles: attachments, action, nerve, exam flag, and origin/insertion landmarks for the figure |
| `docs/js/data/anatomy-bones.js` | Figure landmarks, the chapter 2 bones and joints, and plate summaries with their clinical notes |
| `docs/js/data/terms.js` | Body Terms content: positions, directions, planes, movements, glossary (Handbook 4.5-4.7) |
| `docs/js/body.js` | The body figure: silhouette, channels, points, zoom and pan |
| `docs/js/app.js` | Routing, the Atlas view, and the point detail panel |
| `docs/js/views.js` | Kata, Body Clock, Five Phases, and Depth views |
| `docs/js/study.js` | The quiz modes |
| `docs/js/lenses.js` | The Two Lenses view |
| `docs/js/anatomy.js` | The Anatomy view: muscle explorer, bones and joints, and muscle quiz |
| `docs/models/` | 3D bones, muscles, joints and attachment surfaces (CC BY-SA 4.0, see its README) and the muscle-to-model map |
| `tools/anatomy/` | Scripts that build the 3D data from the Z-Anatomy file: `export_models.py` and `map_muscles.py` make `docs/models/`; `dump_2d.mjs` and `project_2d.py` make `body-3d.js`; `anatomy_3d.py` makes `anatomy-3d.js` |
| `docs/js/viewer3d.js` | The 3D viewer (an ES module, loaded on demand): muscles, bones, joints, attachments, points and channels |
| `docs/js/figure3d.js` | Loads the viewer, wraps it in the 2D figure's methods (`Atlas.Figure3D`), and holds the shared 2D/3D choice |
| `docs/js/data/body-3d.js` | Generated 3D positions for the points, channel paths, kata regions and kata back lines |
| `docs/js/data/anatomy-3d.js` | Generated: where each Anatomy landmark sits on the 3D bones, and which model pieces make up each bone and joint |
| `docs/js/data/anatomy-layers.js` | Hand-written: each muscle's layer (0 surface to 3 deepest) for the Peel slider; the book's order where its groups name layers, general anatomy elsewhere |
| `docs/vendor/three-0.186.1/` | three.js 0.186.1 (MIT) with its glTF and Draco loaders, orbit controls, and the Draco decoder (Apache-2.0) |
| `docs/js/search.js` | The header search: builds an index of points, channels, kata steps, muscles, bones, landmarks and joints, and opens a result through `Atlas.go` |
| `docs/vendor/fuse-7.5.0/` | Fuse.js 7.5.0 (Apache-2.0), the basic build, for typo-tolerant name matching in search |
| `docs/js/terms.js` | The Body Terms view and its movement diagrams |

Scripts are classic (not ES modules) and share one global, `window.Atlas`. Load order
in `index.html` matters: data first, then `body.js`, then the views.

The one exception is the 3D viewer, `viewer3d.js`, an ES module that `anatomy.js` loads
with `import()` the first time the 3D view opens. The import map in `index.html` points
`three` at the vendored copy. **3D rendering uses three.js only**; upgrade it by
replacing the versioned `docs/vendor/three-<version>/` folder and the import map.
`search.js` likewise imports Fuse.js on first use; **fuzzy matching uses Fuse.js only**.

Deep links open one thing in its tab: `#p-<point>`, `#ch-<channel>`, `#kata-<step>`,
`#m-<muscle>`, `#bone-<name>`, `#lm-<landmark>` and `#joint-<name>` (names URL-encoded).
`Atlas.go(view, arg)` builds them; search uses the same calls.

The Atlas, Study and Anatomy pages carry an Exam | Everything switch
(`Atlas.scopeSwitch()`); the choice is site-wide (`Atlas.examOnly()`, event
`scopechange`) and defaults to Exam. A page that adds exam-scoped content should use it.

The Atlas, Kata and Anatomy views offer a 3D/2D toggle, and each tab remembers its own
choice (`Atlas.dim(tab)`). Atlas and Kata start in 2D, Anatomy in 3D. Other figures
(Body Clock, Five Phases, Study, Two Lenses, Body Terms) stay 2D.

**When point, channel or kata line positions change in 2D, regenerate the 3D positions:**

```bash
node tools/anatomy/dump_2d.mjs > temp/proj/input.json
blender -b --disable-autoexec temp/zanatomy/x/Z-Anatomy/Startup.blend \
  --python tools/anatomy/project_2d.py -- temp/proj/input.json docs/js/data/body-3d.js temp/proj/check
```

The optional last argument writes front and back check renders; look at them before
committing. The projection warps the 2D figure onto the 3D body with about twenty
shared landmarks, so 3D positions are as approximate as the 2D ones.

**When the anatomy landmarks, bones or joints change, regenerate their 3D data:**

```bash
node tools/anatomy/dump_2d.mjs > temp/proj/input.json
blender -b --disable-autoexec temp/zanatomy/x/Z-Anatomy/Startup.blend \
  --python tools/anatomy/anatomy_3d.py -- temp/proj/input.json docs/js/data/anatomy-3d.js
```

Each landmark, bone and joint needs an entry in the script's tables, which map it to
Z-Anatomy's labeled feature or to model pieces; the script stops on a missing entry or
an unknown piece name. Landmarks that use a labeled feature sit where the model puts
it, not where the 2D figure does.

### Content rules for the site

The site will be public, so these rules apply to everything added to it:

- **Course facts.** Anything from the course goes in a point's `course` list or a
  view's text, written in your own words and carrying a `ref`. A ref is a handbook label
  or a handout name. Never paste handbook text.
- **General TCM.** Facts from general TCM knowledge go in `fx`, which the UI labels
  "general TCM". Do not put them in `course`.
- **Point positions.** Coordinates are on a 300 × 640 figure, given as `dx` from the
  midline plus `y`, and are approximate. Check a new point against its neighbours in
  the browser.
- **Channel paths.** Path vertices run in the direction of primary Qi flow. Set
  `sinewReverse` when the sinew flow runs the other way.
- **Validate references.** After a data change, check that every `rel`, `combos.w`,
  kata `pts` entry, and emotion point names an existing point.
- **No source files on the site.** Keep `source/` out of the published site.
