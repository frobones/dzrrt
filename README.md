# Chuden Point Atlas

An interactive study site for the DZRSI Chuden Ichi (Danzan Ryu Restorative Therapy,
formerly "Module 2") program. It maps the acupoints and channels on the body and ties
each one to the kata, the Five Phases, and the course's pain and emotion material.

## Views

- **Atlas.** A 3D body you can turn, with every course point plus the classical points
  that link the channels, sitting on the muscle surface. A 2D toggle shows the flat
  front and back figures instead, and the choice carries across the Atlas, Kata and
  Anatomy views.
  - Filter by channel, point type, or search.
  - Switch between the primary and sinew channel layers, and watch the direction of Qi
    flow.
  - Click a point for:
    - its location and how to find it
    - what the course says, with page references
    - its traditional actions and cautions
    - its classical pairings
    - a web of everything it connects to
- **Kata.** Steps through the 60-step kata. Each step turns the body to the working
  area, on the correct side, and highlights the channels and points under your hands.
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
  - a muscle explorer that defaults to the Chuden exam list (Handbook 4.54-4.61) and
    can show all 188 muscles. Each muscle shows its origin, insertion, action and
    nerve, and the channels, points and kata steps over it
  - a 3D body you can rotate, which highlights the chosen muscle with its origin and
    insertion on the bones, peels away to the deep muscles, and shows the ligaments.
    Click any muscle on the model to open it. A 2D toggle shows its line of pull on
    the flat figure instead
  - bones and joints, with the palpable landmarks from Handbook 4.6 marked on the
    figure and the muscles that attach to each bone
  - the Handbook 4.52 plate coloring checklist, saved in your browser
  - a quiz that names the muscle from its attachments, or picks its action
  - the Atlas point panel lists the muscles under each point

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

The 3D view uses three.js 0.186.1 (MIT) and Google's Draco decoder (Apache-2.0), both
copied into `docs/vendor/` with their licenses.

The site loads these fonts from Google Fonts:

- Shippori Mincho B1
- IBM Plex Sans
- IBM Plex Mono

The 3D anatomy models in `docs/models/` are derived from Z-Anatomy (CC BY-SA 4.0),
which is built on BodyParts3D (CC BY 4.0). Those model files stay under CC BY-SA 4.0;
see `docs/models/README.md` for the attribution.

Google Fonts lists all three under the SIL Open Font License 1.1. Confirm each license
and its attribution line before the repository goes public.
