# Chuden Point Atlas

An interactive study site for the DZRSI Chuden Ichi (Danzan Ryu Restorative Therapy,
formerly "Module 2") program. It maps the acupoints and channels on the body and ties
each one to the kata, the Five Phases, and the course's pain and emotion material.

## Views

- **Atlas.** Front and back body figures with every course point plus the classical
  points that link the channels.
  - Filter by channel, point type, or search.
  - Switch between the primary and sinew channel layers, and watch the direction of Qi
    flow.
  - Click a point for:
    - its location and how to find it
    - what the course says, with page references
    - its traditional actions and cautions
    - its classical pairings
    - a web of everything it connects to
- **Kata.** Steps through the 60-step kata. Each step zooms to the working area and
  highlights the channels and points under your hands.
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
  Handbook* and the 2026 Module 2 class handouts. References point to handbook page
  labels (for example "Handbook 2.42").
- **Labelling.** Material from general Traditional Chinese Medicine is labelled as such.
- **Positions.** Point positions on the figures are approximate study guides.
- **Not medical advice.** This is a study aid, not medical advice.

The handbook is © DZRSI/AJJF, and its text is not reproduced here.

## Third-party assets

The site loads these fonts from Google Fonts:

- Shippori Mincho B1
- IBM Plex Sans
- IBM Plex Mono

Google Fonts lists all three under the SIL Open Font License 1.1. Confirm each license
and its attribution line before the repository goes public.
