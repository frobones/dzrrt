# Chuden Point Atlas

An interactive study site for the DZRSI Chuden Ichi (Danzan Ryu Restorative Therapy,
formerly "Module 2") program. It maps the acupoints and channels on the body and ties
each one to the kata, the Five Phases, and the course's pain and emotion material.

## Views

**Search** sits in the header on every page (press `/` to jump to it). It finds points,
channels, kata steps, muscles, bones, landmarks and joints by name, code or pinyin,
and by what they do or attach to, so "headache" finds points and "olecranon" finds
the triceps. Close spellings count too, so "gastrocnemus" still finds the muscle.
Picking a result opens it in its own tab, selected, zoomed and highlighted, in that
tab's 2D or 3D figure.

The browser's **Back** and **Forward** buttons retrace what you picked: each point,
muscle, bone, kata step, Connections walk and tab you opened is one step.

**On a phone**, the tabs sit in one row you swipe sideways. One finger scrolls the page
and two fingers move, zoom and turn the figures; on the 3D body, double-tap a spot to
center on it. A point's details slide up from the bottom of the screen.

An **Exam | Everything** switch on the Atlas, Study, Anatomy and Connections pages
narrows each one to what the written exams cover: the points the course names, and
the muscles and bones in the anatomy study guide (Handbook 4.54). It starts on Exam,
and one choice applies across the site.

- **Atlas.** Flat front and back figures with every course point plus the classical
  points that link the channels. A 3D toggle shows a body you can turn, with the
  points on the muscle surface. Atlas and Kata start in 2D and Anatomy in 3D; each tab
  remembers your choice.
  - Filter the points by channel, point type, or text ("headache" shows every headache point).
  - Switch between the primary and sinew channel layers, and watch the direction of Qi
    flow: moving dashes in 2D, arrowheads travelling along the channels in 3D.
  - Point names appear as you zoom in, or all the time with **Always show labels**.
  - Click a point for:
    - its location and how to find it
    - what the course says, with page references
    - its traditional actions and cautions
    - its classical pairings
    - a web of everything it connects to, in the same shapes and colors as Connections
- **Kata.** Steps through the 60-step kata. Each step turns the body to the working
  area, on the correct side, and highlights the channels and points under your hands.
  The three back lines of steps 1 and 3 are drawn in both 2D and 3D.
- **Body Clock.** The 24-hour channel circuit, with the channel that is active now.
- **Five Phases.** An interactive Sheng/Ko diagram with organs, source points, emotions,
  the class handout's DZRRT treatment ideas, and the full correspondence table.
- **Depth & Pain.** The "ocean" depth model of a channel, the layers of the channel
  system, the six pain types, and the Eight Principles.
- **Study.** Four quiz modes:
  - Locate: click where a point is on the body.
  - Name: identify a highlighted point.
  - Function: pick the point that matches a description.
  - Channel: pick the channel a point belongs to.

  Questions are random by default. Turn on **Every point once** to go through the
  whole pool in shuffled order, then see your score and practice the points you
  missed. **Reset score** clears the counts and the saved best streak.

- **Two Lenses.** A bridge for people trained in Western medicine:
  - ground rules on what the system does and doesn't claim
  - the habits of thought that shift between the two systems
  - an interactive "translate a complaint" exercise that asks the questions an Eastern
    practitioner asks
  - muscles mapped to the channels that run over them
  - familiar words that mean something different in TCM
- **Body Terms.** The anatomical vocabulary from the handbook's worksheets
  (Handbook 4.5-4.7):
  - the Western and Traditional Asian Medicine starting positions
  - direction pairs and body planes drawn on the figures, with the points whose
    locations use each term
  - animated movements such as flexion, abduction and rotation, with the muscles that
    produce them
  - a searchable glossary of landmarks, bony features and location words
  - **Hide definitions** turns the page into a self-test
- **Anatomy.** Bones and muscles from *Netter's Anatomy Coloring Book*, the course's
  anatomy text, cited by plate:
  - a muscle explorer that defaults to the Chuden exam list (Handbook 4.55-4.61) and
    can show all 188 muscles. Each muscle shows its origin, insertion, action and
    nerve, and the channels, points and kata steps over it
  - a 3D body you can rotate, which highlights the chosen muscle with its origin and
    insertion on the bones, and shows the ligaments. A **Peel** slider removes the
    muscles layer by layer, from the surface to the deepest, and **Hide on click** lets
    you remove single muscles that are in the way. Otherwise, click any muscle on
    the model to open it. A 2D toggle shows its line of pull on
    the flat figure instead
  - bones and joints on the 3D skeleton: pick a bone, or click one on the model, to
    light it and mark its landmarks; the palpable landmarks from Handbook 4.64 are
    marked too, and each joint can show its ligaments. A Landmarks switch hides the
    dots so you can find them yourself first. Each bone lists the muscles that
    attach to it. A 2D toggle marks the landmarks on the flat figure instead
  - the book's summary of each plate, and its clinical notes, on the muscle and bone
    cards
  - a quiz that names the muscle from its attachments, or picks its action, beside the
    3D body. When you name a muscle, the body stays blank until you ask for a hint or
    answer, then shows the muscle with its origin and insertion
  - the Atlas point panel lists the muscles under each point
- **Connections.** Everything the site links together, as one web: points, channels,
  the Five Phases, emotions, kata steps and the muscles under the points. Line style
  shows the kind of link, color the Five Phase, and shape the kind of thing: a circle
  for a point, a square for a muscle, a diamond for a kata step, a bar for a channel,
  a triangle for an emotion and a large circle for a phase. Cards, chips and the trail
  name the kind as well.
  - Explore: type a name in **Start from** to put anything at the center with
    everything linked to it, then click a neighbor to walk to it. A trail takes you
    back. Each Atlas point panel opens here too.
  - How are these connected?: pick any two things to see the shortest chains of links
    between them, such as LI4 to its channel, to Metal, to Grief.
  - Constellation: every linked thing at once, each pulled toward its Five Phase, with
    the phases in Sheng order. Pick a dot to light up what it touches.
  - Every card shows the same facts as the item's own tab, such as a muscle's
    attachments, action and nerve or a point's location and course notes, with a
    button to open it there and all its links below.
  - Picking a route step or a constellation dot shows its card beside the figure; on a
    phone the card slides up from the bottom.

## Running locally

```bash
python3 -m http.server 8765 --directory docs
```

Open <http://localhost:8765>.

## Publishing

The site is static, with no build step. To publish it with GitHub Pages, choose
**Deploy from a branch** and set the folder to `/docs`.

## Content and sources

- **Sources.** Course content is summarized from the DZRSI *Chuden Ichi Program Student
  Handbook*, the 2026 Module 2 class handouts, and the course's anatomy text,
  *Netter's Anatomy Coloring Book*. References point to handbook page
  labels (for example "Handbook 2.42").
- **Labelling.** Material from general Traditional Chinese Medicine is labelled as such.
- **Positions.** Point positions on the figures are approximate study guides.
- **Not medical advice.** This is a study aid, not medical advice.

The handbook is © DZRSI/AJJF, and the anatomy book is copyrighted by its publisher.
Neither one's text nor its images are reproduced here.

## Third-party assets

The 3D view uses three.js 0.186.1 (MIT) and Google's Draco decoder (Apache-2.0),
search uses Fuse.js 7.5.0 (Apache-2.0), and the Connections constellation uses
d3-force 3.0.0 with d3-dispatch, d3-quadtree and d3-timer (all ISC), all copied into
`docs/vendor/` with their licenses.

The site loads these fonts from Google Fonts:

- Shippori Mincho B1
- IBM Plex Sans
- IBM Plex Mono

The 3D anatomy models in `docs/models/` are derived from Z-Anatomy (CC BY-SA 4.0),
which is built on BodyParts3D (CC BY 4.0). Those model files stay under CC BY-SA 4.0;
see `docs/models/README.md` for the attribution.

Google Fonts lists all three under the SIL Open Font License 1.1. Confirm each license
and its attribution line before the repository goes public.
