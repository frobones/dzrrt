"""
Place the Anatomy tab's bones, landmarks and joints on the 3D model.

Run inside Blender (5.x) on the Z-Anatomy file, scripts in the .blend disabled:

    node tools/anatomy/dump_2d.mjs > temp/proj/input.json
    blender -b --disable-autoexec temp/zanatomy/x/Z-Anatomy/Startup.blend \
        --python tools/anatomy/anatomy_3d.py -- temp/proj/input.json docs/js/data/anatomy-3d.js

How it works: Z-Anatomy labels bony features with a two-vertex leader line (object
"<feature>.j") whose bone end marks the feature. A landmark that names such a
feature takes that spot. A landmark that spans whole bones (a run of vertebrae, a
set of ribs) lights those bones instead. The few left over are lifted from the 2D
figure with project_2d.py's thin-plate spline, cast onto the bones only. Soft
tissue the model lacks (fascia, aponeuroses, retinacula) gets no 3D position.

Bones and joints map to the model's pieces by the hand-written tables below. Every
landmark, bone and joint in the site data must have an entry, and every piece named
must exist in the exported layers, or the script stops.

Paired structures are written for the client's left (".l", +x); the viewer swaps to
".r" and mirrors x for the right side. Output coordinates are glTF's (y up, metres).
"""

import json
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
from export_models import select  # importable once the line above puts this folder on the path
from project_2d import CX, TPS, cast, gl, pairs

ORD = [
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
    "Sixth",
    "Seventh",
    "Eighth",
    "Ninth",
    "Tenth",
    "Eleventh",
    "Twelfth",
]


def ribs(a: int, b: int) -> list[str]:
    return [f"{ORD[i - 1]} rib.l" for i in range(a, b + 1)]


def cartilages(a: int, b: int) -> list[str]:
    return [f"Costal cartilage of {ORD[i - 1].lower()} rib.l" for i in range(a, b + 1)]


def vertebrae(region: str, a: int, b: int) -> list[str]:
    names = {1: "Atlas (C1)", 2: "Axis (C2)"} if region == "C" else {}
    return [names.get(i, f"Vertebra {region}{i}") for i in range(a, b + 1)]


def phalanges(part: str, digits: range, limb: str) -> list[str]:
    return [f"{p} phalanx of {ORD[d - 1].lower()} finger of {limb}.l" for d in digits for p in part.split("+")]


CARPALS = [
    f"{b} bone.l"
    for b in ("Scaphoid", "Lunate", "Triquetrum", "Pisiform", "Trapezium", "Trapezoid", "Capitate", "Hamate")
]
METACARPALS = [f"{ORD[i]} metacarpal bone.l" for i in range(5)]
METATARSALS = [f"{ORD[i]} metatarsal bone.l" for i in range(5)]
CUNEIFORMS = [f"{k} cuneiform bone.l" for k in ("Medial", "Intermediate", "Lateral")]
HAND_PHALANGES = phalanges("Proximal+Distal", range(1, 6), "hand") + phalanges("Middle", range(2, 6), "hand")
FOOT_PHALANGES = phalanges("Proximal+Distal", range(1, 6), "foot") + phalanges("Middle", range(2, 6), "foot")

# Landmark id -> ("label", Z-Anatomy feature) | ("parts", [pieces]) | ("tps", view) | None (not in the model).
LANDMARKS = {
    "eop": ("label", "External occipital protuberance"),
    "nuchal": ("label", "Superior nuchal line"),
    "mastoid": ("label", "Mastoid process"),
    "tempfossa": ("label", "Squamous part of temporal bone"),
    "zyg": ("tps", "front"),
    "ramus": ("tps", "front"),
    "mandible": ("label", "Body of mandible"),
    "hyoid": ("parts", ["Hyoid bone"]),
    "nuchlig": ("parts", ["Nuchal ligament"]),
    "c_tp_up": ("parts", vertebrae("C", 1, 4)),
    "c_tp": ("parts", vertebrae("C", 2, 7)),
    "c2": ("parts", ["Axis (C2)"]),
    "c7": ("parts", ["Vertebra C7"]),
    "t_sp_up": ("parts", vertebrae("T", 1, 5)),
    "t_sp_low": ("parts", vertebrae("T", 6, 12)),
    "l_sp": ("parts", vertebrae("L", 1, 5)),
    "t_tp": ("parts", vertebrae("T", 1, 12)),
    "l_tp": ("parts", vertebrae("L", 1, 5)),
    "l_body": ("parts", ["Vertebra T12", *vertebrae("L", 1, 5)]),
    "sacrum": ("label", "Dorsal surface of sacrum"),
    "coccyx": ("parts", ["Coccyx"]),
    "tlf": None,
    "manubrium": ("parts", ["Manubrium of sternum"]),
    "sternum": ("parts", ["Body of sternum"]),
    "xiphoid": ("parts", ["Xiphoid process"]),
    "clav_med": ("label", "Sternal end"),
    "clav_lat": ("label", "Acromial end"),
    "rib1": ("parts", ribs(1, 2) + cartilages(1, 2)),
    "ribs_up_post": ("parts", ribs(2, 5)),
    "ribs_low_post": ("parts", ribs(9, 12)),
    "rib12": ("parts", ribs(12, 12)),
    "ribs3_5": ("parts", ribs(3, 5) + cartilages(3, 5)),
    "ribs_lat": ("parts", ribs(1, 8)),
    "ribs5_12": ("parts", ribs(5, 12)),
    "costal": ("parts", cartilages(5, 7)),
    "costal_low": ("parts", cartilages(7, 10)),
    "linea_alba": None,
    "pubic_crest": ("label", "Pubic crest"),
    "pubic_tub": ("label", "Pubic tubercle"),
    "pubis_body": ("label", "Body of pubis"),
    "inguinal": None,
    "iliac_crest": ("label", "Iliac crest"),
    "asis": ("label", "Anterior superior iliac spine"),
    "aiis": ("label", "Anterior inferior iliac spine"),
    "psis": ("label", "Posterior superior iliac spine"),
    "iliac_fossa": ("label", "Iliac fossa"),
    "ilium_out": ("label", "Gluteal surface of ilium"),
    "isch_tub": ("label", "Ischial tuberosity"),
    "gr_troch": ("label", "Greater trochanter"),
    "less_troch": ("label", "Lesser trochanter"),
    "intertroch": ("label", "Intertrochanteric line"),
    "glut_tub": ("label", "Gluteal tuberosity"),
    "linea_aspera": ("label", "Linea aspera"),
    "femur_ant": ("label", "Body of femur"),
    "add_tub": ("label", "Adductor tubercle"),
    "fem_cond_lat": ("label", "Lateral condyle of femur"),
    "fem_cond_med": ("label", "Medial condyle of femur"),
    "itt": None,
    "patella": ("parts", ["Patella.l"]),
    "tib_tub": ("label", "Tibial tuberosity"),
    "pes": ("label", "Medial surface of tibia"),
    "tib_cond_med": ("label", "Medial condyle of tibia"),
    "tib_cond_lat": ("label", "Lateral condyle of tibia"),
    "fib_head": ("label", "Head of fibula"),
    "tibia_lat": ("label", "Lateral surface of tibia"),
    "tibia_post": ("label", "Soleal line"),
    "fibula_lat": ("label", "Lateral surface of fibula"),
    "fibula_low": ("tps", "front"),
    "med_mall": ("label", "Medial malleolus"),
    "lat_mall": ("label", "Lateral malleolus"),
    "calcaneus": ("parts", ["Calcaneus.l"]),
    "navicular": ("label", "Tuberosity of navicular bone"),
    "cuneiform1": ("parts", ["Medial cuneiform bone.l", "First metatarsal bone.l"]),
    "mt5": ("parts", ["Fifth metatarsal bone.l"]),
    "toes": ("parts", phalanges("Proximal+Middle+Distal", range(2, 6), "foot")),
    "hallux": ("parts", phalanges("Proximal+Distal", range(1, 2), "foot")),
    "acromion": ("label", "Acromion"),
    "scap_spine": ("label", "Spine of scapula"),
    "supra_fossa": ("label", "Supraspinous fossa"),
    "infra_fossa": ("label", "Infraspinous fossa"),
    "scap_med": ("label", "Medial border of scapula"),
    "scap_sup": ("label", "Superior angle of scapula"),
    "scap_inf": ("label", "Inferior angle of scapula"),
    "scap_lat": ("label", "Lateral border of scapula"),
    "subscap": ("label", "Subscapular fossa"),
    "coracoid": ("label", "Coracoid process"),
    "supraglenoid": ("label", "Supraglenoid tubercle"),
    "infraglenoid": ("label", "Infraglenoid tubercle"),
    "gr_tub": ("label", "Greater tubercle"),
    "less_tub": ("label", "Lesser tubercle"),
    "groove": ("label", "Intertubercular sulcus"),
    "delt_tub": ("label", "Deltoid tuberosity"),
    "humerus_post": ("label", "Posterior surface of humerus"),
    "humerus_med": ("label", "Medial border of humerus"),
    "humerus_ant": ("tps", "front"),
    "lat_supracond": ("label", "Lateral supracondylar ridge"),
    "med_epi": ("label", "Medial epicondyle of humerus"),
    "lat_epi": ("label", "Lateral epicondyle of humerus"),
    "olecranon": ("label", "Olecranon"),
    "coronoid_u": ("label", "Coronoid process of ulna"),
    "radial_tub": ("label", "Radial tuberosity"),
    "radius_mid": ("label", "Pronator tuberosity"),
    "radius_ant": ("label", "Anterior surface of radius"),
    "radius_dist": ("label", "Radial styloid process"),
    "ulna_post": ("label", "Posterior border of ulna"),
    "ulna_ant": ("label", "Anterior border of ulna"),
    "ulna_dist": ("tps", "front"),
    "ulnar_styloid": ("label", "Ulnar styloid process"),
    "pisiform": ("parts", ["Pisiform bone.l", "Hamate bone.l"]),
    "retinaculum": None,
    "mc1": ("parts", METACARPALS[:1]),
    "mc2": ("parts", METACARPALS[1:3]),
    "mc5": ("parts", METACARPALS[4:]),
    "palm": None,
    "phal_mid": ("parts", phalanges("Middle", range(2, 6), "hand")),
    "phal_dist": ("parts", phalanges("Distal", range(2, 6), "hand")),
    "thumb_prox": ("parts", phalanges("Proximal", range(1, 2), "hand")),
    "thumb_dist": ("parts", phalanges("Distal", range(1, 2), "hand")),
}

# Landmarks that span whole bones and are seen from behind; the rest are framed from the front.
BACK = {
    "nuchlig",
    "c_tp_up",
    "c_tp",
    "c2",
    "c7",
    "t_sp_up",
    "t_sp_low",
    "l_sp",
    "t_tp",
    "l_tp",
    "ribs_up_post",
    "ribs_low_post",
    "rib12",
    "coccyx",
}

# Bone name (Atlas.BONES) -> model pieces. The model's hip bone is one piece, so ilium, ischium and pubis share it.
BONES = {
    "Frontal": ["Frontal bone", "Sinus of frontal bone"],
    "Parietal": ["Parietal bone.l"],
    "Sphenoid": ["Sphenoid bone", "Sinus of sphenoid bone"],
    "Temporal": ["Temporal bone.l"],
    "Occipital": ["Occipital bone"],
    "Ethmoid": ["Ethmoid bone", *(f"{k} cells of ethmoid bone.l" for k in ("Anterior", "Middle", "Posterior"))],
    "Nasal": ["Nasal bone.l"],
    "Lacrimal": ["Lacrimal bone.l"],
    "Zygomatic": ["Zygomatic bone.l"],
    "Maxilla": ["Maxilla.l"],
    "Inferior nasal concha": ["Inferior nasal concha bone.l"],
    "Vomer": ["Vomer"],
    "Palatine": ["Palatine bone.l"],
    "Mandible": ["Mandible"],
    "Atlas (C1)": ["Atlas (C1)"],
    "Axis (C2)": ["Axis (C2)"],
    "Cervical vertebrae (C3–C7)": vertebrae("C", 3, 7),
    "Thoracic vertebrae (T1–T12)": vertebrae("T", 1, 12),
    "Lumbar vertebrae (L1–L5)": vertebrae("L", 1, 5),
    "Sacrum": ["Sacrum"],
    "Coccyx": ["Coccyx"],
    "Sternum": ["Manubrium of sternum", "Body of sternum", "Xiphoid process"],
    "Ribs (12 pairs)": ribs(1, 12) + cartilages(1, 10),
    "Clavicle": ["Clavicle.l"],
    "Scapula": ["Scapula.l"],
    "Humerus": ["Humerus.l"],
    "Radius": ["Radius.l"],
    "Ulna": ["Ulna.l"],
    **{
        b: [f"{b} bone.l"]
        for b in ("Scaphoid", "Lunate", "Triquetrum", "Pisiform", "Trapezium", "Trapezoid", "Capitate", "Hamate")
    },
    "Metacarpals (1–5)": METACARPALS,
    "Phalanges of the hand": HAND_PHALANGES,
    "Sesamoid bones of the hand": [],
    "Coxal (hip) bone": ["Hip bone.l"],
    "Ilium": ["Hip bone.l"],
    "Ischium": ["Hip bone.l"],
    "Pubis": ["Hip bone.l"],
    "Femur": ["Femur.l"],
    "Patella": ["Patella.l"],
    "Tibia": ["Tibia.l"],
    "Fibula": ["Fibula.l"],
    "Talus": ["Talus.l"],
    "Calcaneus": ["Calcaneus.l"],
    "Navicular": ["Navicular bone.l"],
    "Cuboid": ["Cuboid bone.l"],
    "Cuneiforms (medial, intermediate, lateral)": CUNEIFORMS,
    "Metatarsals (1–5)": METATARSALS,
    "Phalanges of the foot": FOOT_PHALANGES,
    "Sesamoid bones of the foot": ["Sesamoid bones of foot.l"],
}

# Joint name (Atlas.JOINTS) -> (bones it joins, its ligaments and other structures in the joints layer).
JOINTS = {
    "Cranial sutures": (["Frontal bone", "Parietal bone.l", "Sphenoid bone", "Temporal bone.l", "Occipital bone"], []),
    "Temporomandibular joint (TMJ)": (
        ["Mandible", "Temporal bone.l"],
        [
            "Articular capsule of temporomandibular joint.l",
            "Articular disc of temporomandibular joint.l",
            "Lateral temporomandibular ligament.l",
            "Stylomandibular ligament.l",
            "Sphenomandibular ligament.l",
        ],
    ),
    "Atlanto-occipital joint": (["Occipital bone", "Atlas (C1)"], []),
    "Atlanto-axial joint": (["Atlas (C1)", "Axis (C2)"], []),
    "Zygapophysial (facet) joints": (
        vertebrae("L", 1, 5),
        ["Ligamenta flava", "Interspinous ligaments", "Supraspinous ligament", "Intertransverse ligaments.l"],
    ),
    "Intervertebral joints (vertebral bodies)": (
        vertebrae("L", 1, 5),
        [f"Intervertebral disc L{i}-L{i + 1}" for i in range(1, 5)]
        + ["Anterior longitudinal ligament", "Posterior longitudinal ligament"],
    ),
    "Lumbosacral joint": (["Vertebra L5", "Sacrum"], ["Intervertebral disc L5-S1", "Iliolumbar ligament.l"]),
    "Sacrococcygeal joint": (["Sacrum", "Coccyx"], ["Sacrococcygeal symphysis"]),
    "Costovertebral joint (head of rib)": (
        ["Sixth rib.l", "Vertebra T5", "Vertebra T6"],
        ["Radiate ligament of head of rib.l", "Intra-articular ligament of head of rib", "Costotransverse ligament.l"],
    ),
    "Sternoclavicular joint": (
        ["Clavicle.l", "Manubrium of sternum"],
        [
            "Articular capsule of sternoclavicular joint.l",
            "Articular disc of sternoclavicular joint.l",
            "Anterior sternoclavicular ligament.l",
            "Posterior sternoclavicular ligament.l",
            "Interclavicular ligament.l",
            "Costoclavicular ligament.l",
        ],
    ),
    "First sternocostal joint": (["First rib.l", *cartilages(1, 1), "Manubrium of sternum"], []),
    "Sternocostal joints (ribs 2–7)": (cartilages(2, 7) + ["Manubrium of sternum", "Body of sternum"], []),
    "Costochondral joints": (ribs(4, 6) + cartilages(4, 6), []),
    "Interchondral joints": (cartilages(6, 9), []),
    "Manubriosternal joint": (["Manubrium of sternum", "Body of sternum"], []),
    "Acromioclavicular joint": (
        ["Scapula.l", "Clavicle.l"],
        [
            "Articular capsule of acromioclavicular joint.l",
            "Articular disc of acromioclavicular joint.l",
            "Acromioclavicular ligament.l",
            "Conoid ligament.l",
            "Trapezoid ligament.l",
        ],
    ),
    "Glenohumeral (shoulder) joint": (
        ["Humerus.l", "Scapula.l"],
        [
            "Articular capsule of glenohumeral joint.l",
            "Coracohumeral ligament.l",
            "Superior glenohumeral ligament.l",
            "Middle glenohumeral ligament.l",
            "Inferior glenohumeral ligament.l",
            "Transverse humeral ligament.l",
            "Glenoid labrum.l",
            "Coraco-acromial ligament.l",
        ],
    ),
    "Humero-ulnar joint (elbow)": (
        ["Humerus.l", "Ulna.l"],
        ["Articular capsule of elbow joint.l", "Ulnar collateral ligament.l"],
    ),
    "Humeroradial joint (elbow)": (
        ["Humerus.l", "Radius.l"],
        ["Articular capsule of elbow joint.l", "Radial collateral ligament.l"],
    ),
    "Proximal radio-ulnar joint": (["Radius.l", "Ulna.l"], ["Annular ligament of radius.l", "Quadrate ligament.l"]),
    "Radio-ulnar interosseous membrane": (
        ["Radius.l", "Ulna.l"],
        ["Interosseous membrane of forearm.l", "Oblique cord.l"],
    ),
    "Radiocarpal (wrist) joint": (
        ["Radius.l", "Ulna.l", "Scaphoid bone.l", "Lunate bone.l", "Triquetrum bone.l"],
        [
            "Articular capsule of radiocarpal joint.l",
            "Dorsal radiocarpal ligament.l",
            "Radioscaphocapitate ligament.l",
            "Radiocapitate ligament.l",
            "Radial collateral ligament of wrist joint.l",
            "Ulnar collateral ligament of wrist joint.l",
        ],
    ),
    "Distal radio-ulnar joint": (
        ["Radius.l", "Ulna.l"],
        [
            "Palmar radio-ulnar ligament.l",
            "Dorsal radio-ulnar ligament.l",
            "Articular disc of distal radio-ulnar joint.l",
        ],
    ),
    "Intercarpal joints": (
        CARPALS,
        [
            "Dorsal intercarpal ligaments.l",
            "Scapholunate interosseous ligament.l",
            "Lunotriquetral interosseous ligament.l",
            "Pisotriquetral ligament.l",
            "Palmar lunotriquetral ligament.l",
        ],
    ),
    "Midcarpal joint": (
        CARPALS,
        [
            "Radiate carpal ligament.l",
            "Scaphocapitate ligament.l",
            "Triquetrocapitate ligament.l",
            "Triquetrohamate ligament.l",
            "Dorsal scaphotriquetral ligament.l",
            "Palmar scaphotriquetral ligament.l",
        ],
    ),
    "Carpometacarpal joints (digits 2–5)": (
        METACARPALS[1:] + ["Trapezoid bone.l", "Capitate bone.l", "Hamate bone.l"],
        ["Dorsal carpometacarpal ligaments.l", "Palmar carpometacarpal ligaments.l", "Pisometacarpal ligament.l"],
    ),
    "Carpometacarpal joint of the thumb": (["Trapezium bone.l", METACARPALS[0]], []),
    "Metacarpophalangeal (MCP) joints": (
        METACARPALS + phalanges("Proximal", range(1, 6), "hand"),
        [
            "Articular capsules of metacarpophalangeal joints.l",
            "Collateral metacarpophalangeal ligaments.l",
            "Deep transverse metacarpal ligament.l",
        ],
    ),
    "Interphalangeal joints of the hand (PIP, DIP)": (
        HAND_PHALANGES,
        [
            "Articular capsules of proximal interphalangeal joints.l",
            "Articular capsules of distal interphalangeal joints.l",
            "Collateral interphalangeal ligaments of hand.l",
            "Palmar interphalangeal ligaments.l",
        ],
    ),
    "Sacro-iliac joint": (
        ["Sacrum", "Hip bone.l"],
        [
            "Anterior sacro-iliac ligament.l",
            "Posterior sacro-iliac ligament.l",
            "Interosseous sacro-iliac ligament.l",
            "Sacrotuberous ligament.l",
            "Sacrospinous ligament.l",
        ],
    ),
    "Pubic symphysis": (
        ["Hip bone.l", "Hip bone.r"],
        ["Pubic symphysis", "Interpubic disc", "Superior pubic ligament", "Inferior pubic ligament"],
    ),
    "Hip joint": (
        ["Femur.l", "Hip bone.l"],
        [
            "Articular capsule of hip joint.l",
            "Descending part of iliofemoral ligament.l",
            "Transverse part of iliofemoral ligament.l",
            "Pubofemoral ligament.l",
            "Ischiofemoral ligament.l",
            "Acetabular labrum.l",
            "Transverse acetabular ligament.l",
            "Ligament of head of femur.l",
            "Zona orbicularis.l",
        ],
    ),
    "Knee (tibiofemoral) joint": (
        ["Femur.l", "Tibia.l", "Fibula.l"],
        [
            "Articular capsule of knee joint.l",
            "Superficial part of tibial collateral ligament.l",
            "Deep part of tibial collateral ligament.l",
            "Fibular collateral ligament.l",
            "Arcuate popliteal ligament.l",
            "Oblique popliteal ligament.l",
            "Medial meniscus.l",
            "Lateral meniscus.l",
            "Anterior cruciate ligament.l",
            "Posterior cruciate ligament.l",
            "Transverse ligament of knee.l",
        ],
    ),
    "Patellofemoral joint": (["Patella.l", "Femur.l"], ["Meniscopatellar ligament.l", "Infrapatellar fat pad.l"]),
    "Distal tibiofibular joint": (
        ["Tibia.l", "Fibula.l"],
        ["Anterior tibiofibular ligament.l", "Posterior tibiofibular ligament.l", "Transverse tibiofibular ligament.l"],
    ),
    "Talocrural (ankle) joint": (
        ["Tibia.l", "Fibula.l", "Talus.l"],
        [
            "Anterior talofibular ligament.l",
            "Posterior talofibular ligament.l",
            "Calcaneofibular ligament.l",
            "Tibionavicular ligament.l",
            "Tibiocalcaneal ligament.l",
            "Posterior tibiotalar ligament.l",
        ],
    ),
    "Talocalcaneal (subtalar) joint": (
        ["Talus.l", "Calcaneus.l"],
        [
            "Talocalcaneal interosseous ligament.l",
            "Lateral talocalcaneal ligament.l",
            "Medial talocalcaneal ligament.l",
            "Posterior talocalcaneal ligament.l",
            "Anterior talocalcaneal ligament.l",
        ],
    ),
    "Talocalcaneonavicular joint": (
        ["Talus.l", "Calcaneus.l", "Navicular bone.l"],
        ["Plantar calcaneonavicular ligament.l", "Talonavicular ligament.l", "Calcaneonavicular ligament.l"],
    ),
    "Calcaneocuboid joint": (
        ["Calcaneus.l", "Cuboid bone.l"],
        [
            "Dorsal calcaneocuboid ligament.l",
            "Plantar calcaneocuboid ligament.l",
            "Long plantar ligament.l",
            "Calcaneocuboid ligament.l",
        ],
    ),
    "Tarsometatarsal joints": (
        CUNEIFORMS + ["Cuboid bone.l"] + METATARSALS,
        [
            "Dorsal tarsometatarsal ligaments.l",
            "Plantar tarsometatarsal ligaments.l",
            "Cuneometatarsal interosseous ligaments.l",
        ],
    ),
    "Intermetatarsal joints": (
        METATARSALS,
        [
            "Dorsal metatarsal ligaments.l",
            "Plantar metatarsal ligaments.l",
            "Metatarsal interosseous ligaments.l",
            "Deep transverse metatarsal ligament.l",
        ],
    ),
    "Metatarsophalangeal (MTP) joints": (
        METATARSALS + phalanges("Proximal", range(1, 6), "foot"),
        [
            "Articular capsules of metatarsophalangeal joints.l",
            "Collateral metatarsophalangeal ligaments.l",
            "Plantar metatarsophalangeal ligaments.l",
        ],
    ),
    "Interphalangeal joints of the foot": (
        FOOT_PHALANGES,
        [
            "Articular capsules of proximal interphalangeal joints of foot.l",
            "Articular capsules of distal interphalangeal joints of foot.l",
            "Articular capsule of interphalangeal joint of great toe.l",
            "Collateral interphalangeal ligaments of foot.l",
            "Plantar interphalangeal ligaments.l",
        ],
    ),
}


def bvh_of(objects: list) -> BVHTree:
    """One nearest-point tree over the given meshes, in world space."""
    co, faces = [], []
    for o in objects:
        base = len(co)
        co.extend(o.matrix_world @ v.co for v in o.data.vertices)
        faces.extend([base + i for i in p.vertices] for p in o.data.polygons)
    return BVHTree.FromPolygons(co, faces)


def mirror(v: Vector) -> Vector:
    return Vector((-v.x, v.y, v.z))


def anchor(label: str, bones: BVHTree) -> list[float]:
    """The bone end of a feature's leader line, on the client's left, with an outward normal."""
    o = bpy.data.objects.get(label + ".j")
    if o is None or len(o.data.vertices) != 2:
        raise SystemExit(f"No leader line for {label!r}")
    ends = [o.matrix_world @ v.co for v in o.data.vertices]
    near = [bones.find_nearest(e) for e in ends]
    k = 0 if near[0][3] <= near[1][3] else 1
    hit, normal = near[k][0], near[k][1]
    if hit.x < -0.01:  # labels sit on one side; the site places landmarks on the client's left
        hit, normal = mirror(hit), mirror(normal)
    # Most lines touch the bone; a few skull and foot lines stop up to 3 cm short, so the spot snaps to the surface.
    if near[k][3] > 0.035:
        raise SystemExit(f"Leader line for {label!r} ends {near[k][3]:.3f} m from any bone")
    return gl(hit) + [round(c, 3) for c in gl(normal)]


def main() -> None:
    """Place every landmark, map every bone and joint, and write the site data file."""
    args = sys.argv[sys.argv.index("--") + 1 :]
    data = json.loads(Path(args[0]).read_text())
    bone_objs = [o for o, _ in select("bones")]
    pieces = {o.name for o in bone_objs} | {o.name for o, _ in select("joints")}
    bones = bvh_of(bone_objs)

    def check(names: list[str], where: str) -> list[str]:
        missing = [n for n in names if n not in pieces]
        if missing:
            raise SystemExit(f"{where}: no model piece named {missing}")
        return names

    stray = BACK - {k for k, v in LANDMARKS.items() if v and v[0] == "parts"}
    if stray:
        raise SystemExit(f"BACK names landmarks that don't light whole bones: {sorted(stray)}")
    for kind, have, want in (
        ("landmark", LANDMARKS, [x["id"] for x in data["landmarks"]]),
        ("bone", BONES, data["bones"]),
        ("joint", JOINTS, data["joints"]),
    ):
        gaps = sorted(set(want) ^ set(have))
        if gaps:
            raise SystemExit(f"{kind} tables and site data disagree on: {gaps}")

    tps = {v: TPS(*pairs(v)) for v in ("front", "back")}
    lm = {}
    for x in data["landmarks"]:
        spec = LANDMARKS[x["id"]]
        if spec is None:
            lm[x["id"]] = None
        elif spec[0] == "label":
            lm[x["id"]] = {"p": anchor(spec[1], bones)}
        elif spec[0] == "parts":
            lm[x["id"]] = {"parts": check(spec[1], x["id"]), "v": "back" if x["id"] in BACK else "front"}
        else:
            # Front figure: the client's left is on the viewer's right.
            view = spec[1]
            x2d = CX + x["dx"] if view == "front" else CX - x["dx"]
            hit = cast(bones, view, tps[view](np.array([x2d, x["y"]]))[0])
            if hit is None:
                raise SystemExit(f"{x['id']}: the 2D position misses the bones")
            lm[x["id"]] = {"p": gl(hit[0]) + [round(c, 3) for c in gl(hit[1])]}

    out_bones = {name: check(names, name) for name, names in BONES.items()}
    out_joints = {name: {"bones": check(b, name), "parts": check(p, name)} for name, (b, p) in JOINTS.items()}

    Path(args[1]).write_text(
        "/*\n * Where the Anatomy tab's landmarks, bones and joints are on the 3D model, generated by\n"
        " * tools/anatomy/anatomy_3d.py. Coordinates are glTF (y up, metres), matching docs/models.\n"
        ' * Paired structures are given for the client\'s left (".l", +x); mirror for the right.\n'
        " * LM3D: landmark id -> {p: [x, y, z, nx, ny, nz]} (a spot on the bone), {parts: [pieces]}\n"
        " *   (whole bones or ligaments to light), or null (soft tissue not in the model).\n"
        " * BONE3D: bone name -> pieces. JOINT3D: joint name -> {bones, parts: ligaments and discs}.\n */\n"
        "window.Atlas = window.Atlas || {};\n"
        f"Atlas.LM3D = {json.dumps(lm, separators=(',', ':'))};\n"
        f"Atlas.BONE3D = {json.dumps(out_bones, separators=(',', ':'))};\n"
        f"Atlas.JOINT3D = {json.dumps(out_joints, separators=(',', ':'))};\n"
    )
    kinds = [
        ("spots", lambda v: v and "p" in v),
        ("lit bones", lambda v: v and "parts" in v),
        ("not in model", lambda v: v is None),
    ]
    print(
        "PLACED",
        ", ".join(f"{sum(1 for v in lm.values() if f(v))} {k}" for k, f in kinds),
        f"; {len(out_bones)} bones, {len(out_joints)} joints",
    )


if __name__ == "__main__":
    main()
