"""
Map the site's muscles (docs/js/data/anatomy-muscles.js) to Z-Anatomy model parts.

    python3 tools/anatomy/map_muscles.py <models_dir>

Reads <models_dir>/muscles.json and attach.json, written by export_models.py, and
writes <models_dir>/muscle-map.json and layers.json (the superficial muscle parts):

    {"<muscle id>": {"parts": [...node names], "o": [...origin surfaces], "i": [...insertion surfaces]}}

Names are matched after normalizing ("Gluteus maximus muscle" -> "gluteus maximus").
Muscles the model splits into heads or parts, or names differently, are listed in
ALIASES. Unmatched muscles are reported and left out of the map.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "docs/js/data/anatomy-muscles.js"

# Our name -> the Z-Anatomy structure names that make it up.
ALIASES: dict[str, list[str]] = {
    "Frontalis (epicranius)": ["Frontalis muscle"],
    "Occipitalis (epicranius)": ["Occipitalis muscle"],
    "Orbicularis oculi": ["Orbital part of orbicularis oculi", "Palpebral part of orbicularis oculi"],
    "Buccinator": ["Bucinator"],
    "Zygomaticus major and minor": ["Zygomaticus major muscle", "Zygomaticus minor muscle"],
    "Masseter": ["Superficial part of masseter", "Deep part of masseter", "Masseter"],
    "Lateral pterygoid": ["Superior head of lateral pterygoid muscle", "Inferior head of lateral pterygoid muscle"],
    "Digastric": [
        "Anterior belly of digastric muscle",
        "Posterior belly of digastric muscle",
        "Intermediate tendon of digastric muscle",
    ],
    "Rectus capitis anterior": ["Rectus anterior capitis muscle"],
    "Rectus capitis lateralis": ["Rectus lateralis capitis muscle"],
    "Rectus capitis posterior major": ["Rectus posterior major capitis muscle"],
    "Rectus capitis posterior minor": ["Rectus posterior minor capitis muscle"],
    "Obliquus capitis superior": ["Obliquus superior capitis muscle"],
    "Obliquus capitis inferior": ["Obliquus inferior capitis muscle"],
    "Anterior scalene": ["Scalenus anterior muscle"],
    "Middle scalene": ["Scalenus medius muscle"],
    "Posterior scalene": ["Scalenus posterior muscle"],
    "Splenius cervicis": ["Splenius colli muscle"],
    "Iliocostalis": ["Iliocostalis colli muscle", "Iliocostalis thoracis muscle", "Iliocostalis lumborum muscle"],
    "Longissimus": ["Longissimus capitis muscle", "Longissimus colli muscle", "Longissimus thoracis muscle"],
    "Spinalis": ["Spinalis capitis muscle", "Spinalis colli muscle", "Spinalis thoracis muscle"],
    "Semispinalis": ["Semispinalis colli muscle", "Semispinalis thoracis muscle", "Semispinalis capitis muscle"],
    "Multifidi": ["Multifidus colli muscle", "Multifidus thoracis muscle", "Multifidus lumborum muscle"],
    "Trapezius": [
        "Descending part of trapezius muscle",
        "Transverse part of trapezius muscle",
        "Ascending part of trapezius muscle",
        "Trapezius muscle",
    ],
    "Deltoid": [
        "Clavicular part of deltoid muscle",
        "Acromial part of deltoid muscle",
        "Scapular spinal part of deltoid muscle",
        "Deltoid muscle",
    ],
    "Pectoralis major": [
        "Clavicular head of pectoralis major muscle",
        "Sternocostal head of pectoralis major muscle",
        "(Abdominal part of pectoralis major muscle)",
        "Pectoralis major muscle",
    ],
    "Biceps brachii": ["Long head of biceps brachii", "Short head of biceps brachii", "Biceps brachii muscle"],
    "Triceps brachii": [
        "Long head of triceps brachii",
        "Lateral head of triceps brachii",
        "Medial head of triceps brachii",
        "Triceps brachii muscle",
    ],
    "Pronator teres": ["Superficial head of pronator teres", "Deep head of pronator teres", "Pronator teres muscle"],
    "Flexor carpi ulnaris": [
        "Humeral head of flexor carpi ulnaris",
        "Ulnar head of flexor carpi ulnaris",
        "Flexor carpi ulnaris",
    ],
    "Flexor digitorum superficialis": [
        "Humero-ulnar head of flexor digitorum superficialis",
        "Radial head of flexor digitorum superficialis",
        "Flexor digitorum superficialis",
    ],
    "Extensor carpi ulnaris": [
        "Humeral head of extensor carpi ulnaris",
        "Ulnar head of extensor carpi ulnaris",
        "Extensor carpi ulnaris",
    ],
    "Flexor pollicis brevis": ["Superficial head of flexor pollicis brevis", "Deep head of flexor pollicis brevis"],
    "Adductor pollicis": [
        "Oblique head of adductor pollicis",
        "Transverse head of adductor pollicis",
        "Adductor pollicis",
    ],
    "Abductor digiti minimi (hand)": ["Abductor digiti minimi of hand"],
    "Flexor digiti minimi brevis (hand)": ["Flexor digiti minimi of hand"],
    "Opponens digiti minimi": ["Opponens digiti minimi muscle of hand"],
    "Lumbricals 1 and 2 (hand)": ["Lumbrical muscles of hand"],
    "Lumbricals 3 and 4 (hand)": ["Lumbrical muscles of hand"],
    "Dorsal interossei (hand)": ["Dorsal interossei muscles of hand"],
    "Palmar interossei (hand)": ["Palmar interossei muscles"],
    "Biceps femoris, long head": ["Long head of biceps femoris", "Biceps femoris muscle"],
    "Biceps femoris, short head": ["Short head of biceps femoris", "Biceps femoris muscle"],
    "Gastrocnemius": ["Lateral head of gastrocnemius", "Medial head of gastrocnemius", "Gastrocnemius muscle"],
    "Fibularis (peroneus) tertius": ["Fibularis tertius muscle"],
    "Fibularis (peroneus) longus": ["Fibularis longus muscle"],
    "Fibularis (peroneus) brevis": ["Fibularis brevis muscle"],
    "Abductor digiti minimi (foot)": ["Abductor digiti minimi of foot"],
    "Flexor digiti minimi brevis (foot)": ["Flexor digiti minimi of foot"],
    "Flexor hallucis brevis": [
        "Lateral head of flexor hallucis brevis",
        "Medial head of flexor hallucis brevis",
        "Flexor hallucis brevis",
    ],
    "Adductor hallucis": [
        "Oblique head of adductor hallucis",
        "Transverse head of adductor hallucis",
        "Adductor hallucis",
    ],
    "Lumbricals (foot)": ["Lumbrical muscles of foot"],
    "Plantar interossei (foot)": ["Plantar interossei muscles"],
    "Dorsal interossei (foot)": ["Dorsal interossei muscles of foot"],
    "Levatores costarum": ["Levatores breves costarum", "Levatores longi costarum"],
    "Levator ani": ["Iliococcygeus muscle", "Pubococcygeus muscle", "Pubo-analis muscle", "Levator ani"],
    "Coccygeus (ischiococcygeus)": ["Coccygeus muscle"],
    "Arytenoid (transverse and oblique)": [
        "Transverse arytenoid muscle",
        "Ary-epiglottic part of oblique arytenoid muscle",
        "Oblique arytenoid muscle",
    ],
    "Cricothyroid": ["Straight part of cricothyroid muscle", "Oblique part of cricothyroid muscle"],
    "Erector spinae": ["Erector spinae"],
    "External intercostals": ["External intercostal muscles"],
    "Internal intercostals": ["Internal intercostal muscles"],
    "Innermost intercostals": ["Innermost intercostal muscles"],
    "Gemellus superior": ["Superior gemellus muscle"],
    "Gemellus inferior": ["Inferior gemellus muscle"],
}

# Attachments the model records once for a whole group, as (group structure, which end).
_QUADS = [("Quadriceps femoris muscle", "insertion"), ("Patellar ligament", "insertion")]
_FLEXORS = [("Common flexor tendon", "origin")]
_EXTENSORS = [("Common extensor tendon", "origin")]
GROUP_ATTACH: dict[str, list[tuple[str, str]]] = {
    "Gastrocnemius": [("Triceps surae muscle", "insertion")],
    "Soleus": [("Triceps surae muscle", "insertion")],
    "Rectus femoris": _QUADS,
    "Vastus lateralis": _QUADS,
    "Vastus medialis": _QUADS,
    "Vastus intermedius": _QUADS,
    "Iliocostalis": [("Erector spinae", "origin")],
    "Longissimus": [("Erector spinae", "origin")],
    "Spinalis": [("Erector spinae", "origin")],
    "Pronator teres": _FLEXORS,
    "Flexor carpi radialis": _FLEXORS,
    "Palmaris longus": _FLEXORS,
    "Flexor carpi ulnaris": _FLEXORS,
    "Flexor digitorum superficialis": _FLEXORS,
    "Extensor carpi radialis brevis": _EXTENSORS,
    "Extensor digitorum": _EXTENSORS,
    "Extensor digiti minimi": _EXTENSORS,
    "Extensor carpi ulnaris": _EXTENSORS,
}


def norm(name: str) -> str:
    """Lowercase, drop brackets and the words 'muscle'/'muscles'."""
    n = name.lower().replace("(", "").replace(")", "")
    return re.sub(r"\s+", " ", re.sub(r"\bmuscles?\b", "", n)).strip()


def stem(node: str) -> str:
    """Strip the side suffix from a node name (.l, .r, .j, .ol, .e2r, ...)."""
    return re.sub(r"\.(?:[lrj]|[oe]\d*[lr])$", "", node)


def load_ours() -> list[dict]:
    """Read the muscle records, one JSON object per line inside Atlas.MUSCLES."""
    rows = []
    for line in DATA.read_text().splitlines():
        line = line.strip().rstrip(",")
        if line.startswith('{"id"'):
            rows.append(json.loads(line))
    return rows


def main() -> None:
    """Build muscle-map.json and print what could not be matched."""
    models = Path(sys.argv[1])
    parts = [r["name"] for r in json.loads((models / "muscles.json").read_text())]
    attach = json.loads((models / "attach.json").read_text())
    by_stem: dict[str, list[str]] = {}
    for p in parts:
        by_stem.setdefault(norm(stem(p)), []).append(p)
    att_by_stem: dict[str, list[dict]] = {}
    for a in attach:
        att_by_stem.setdefault(norm(stem(a["name"])), []).append(a)

    out, missing, no_attach = {}, [], []
    for m in load_ours():
        keys = [norm(k) for k in ALIASES.get(m["n"], [m["n"]])]
        if m["n"] not in ALIASES:
            keys = [norm(re.sub(r"\s*\(.*?\)", "", m["n"]))]
        found = sorted({p for k in keys for p in by_stem.get(k, [])})
        att = [a for k in keys for a in att_by_stem.get(k, [])]
        for group, kind in GROUP_ATTACH.get(m["n"], []):
            att += [a for a in att_by_stem.get(norm(group), []) if a["kind"] == kind]
        if not found and not att:
            missing.append(m["n"])
            continue
        if not att:
            no_attach.append(m["n"])
        out[m["id"]] = {
            "parts": found,
            "o": sorted({a["name"] for a in att if a["kind"] == "origin"}),
            "i": sorted({a["name"] for a in att if a["kind"] == "insertion"}),
        }
    (models / "muscle-map.json").write_text(json.dumps(out, separators=(",", ":")))
    # The viewer's "superficial only" layer: parts Z-Anatomy files under Superficial muscles.
    records = json.loads((models / "muscles.json").read_text())
    superficial = sorted(r["name"] for r in records if r.get("superficial"))
    (models / "layers.json").write_text(json.dumps({"superficial": superficial}, separators=(",", ":")))
    exam = {m["id"] for m in load_ours() if m.get("exam")}
    print(f"mapped {len(out)} of {len(load_ours())}; exam mapped {len(exam & out.keys())} of {len(exam)}")
    print(f"no 3D part: {len(missing)}: {missing}")
    print(f"no attachment surfaces: {len(no_attach)}: {no_attach}")
    print(f"exam without parts: {[i for i in exam if i in out and not out[i]['parts']]}")


main()
