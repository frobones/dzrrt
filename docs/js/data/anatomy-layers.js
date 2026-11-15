/*
 * Muscle layers for peeling the 3D body: 0 surface, 1 second, 2 third, 3 deepest.
 *
 * Where Netter's groups name a layer, the order follows the book: the back runs superficial,
 * intermediate, deep (splenius, erector spinae) to transversospinal; the forearm superficial,
 * intermediate, deep; the leg superficial and deep posterior; the sole plantar layers 1 to 4.
 * A muscle the book puts in a layer but that lies under another of that layer (the rhomboids
 * under trapezius) sits one deeper, so peeling uncovers it. Everywhere else the layer is
 * general anatomy, not course material. One number per muscle is approximate: a muscle can be
 * deep in one place and on the surface in another.
 */
window.Atlas = window.Atlas || {};

Atlas.MUSCLE_LAYERS = {
  /* Head and face */
  "frontalis-epicranius": 0, "occipitalis-epicranius": 0, "nasalis": 0, "orbicularis-oris": 0, "levator-labii-superioris": 0,
  "mentalis": 0, "depressor-anguli-oris": 0, "risorius": 0, "zygomaticus-major-and-minor": 0, "orbicularis-oculi": 0,
  "buccinator": 1, "levator-palpebrae-superioris": 1,
  "superior-rectus": 2, "inferior-rectus": 2, "medial-rectus": 2, "lateral-rectus": 2, "superior-oblique": 2, "inferior-oblique": 2,
  "masseter": 0, "temporalis": 0, "lateral-pterygoid": 2, "medial-pterygoid": 2,
  /* Neck */
  "platysma": 0, "sternocleidomastoid": 1, "digastric": 1, "stylohyoid": 1, "mylohyoid": 2,
  "sternohyoid": 1, "omohyoid": 1, "sternothyroid": 2, "thyrohyoid": 2,
  "anterior-scalene": 2, "middle-scalene": 2, "posterior-scalene": 2,
  "longus-colli": 3, "longus-capitis": 3, "rectus-capitis-anterior": 3, "rectus-capitis-lateralis": 3,
  /* Tongue, palate, pharynx and larynx lie inside the neck */
  "genioglossus": 3, "hyoglossus": 3, "styloglossus": 3, "palatoglossus": 3,
  "levator-veli-palatini": 3, "tensor-veli-palatini": 3, "palatopharyngeus": 3, "musculus-uvulae": 3,
  "superior-pharyngeal-constrictor": 3, "middle-pharyngeal-constrictor": 3, "inferior-pharyngeal-constrictor": 3,
  "salpingopharyngeus": 3, "stylopharyngeus": 3,
  "posterior-crico-arytenoid": 3, "arytenoid-transverse-and-oblique": 3, "cricothyroid": 3,
  /* Back, in the book's order */
  "trapezius": 0, "latissimus-dorsi": 0,
  "levator-scapulae": 1, "rhomboid-minor": 1, "rhomboid-major": 1, "serratus-posterior-superior": 1, "serratus-posterior-inferior": 1,
  "splenius-capitis": 2, "splenius-cervicis": 2, "iliocostalis": 2, "longissimus": 2, "spinalis": 2,
  "semispinalis": 3, "multifidi": 3, "rotatores": 3,
  "rectus-capitis-posterior-major": 3, "rectus-capitis-posterior-minor": 3, "obliquus-capitis-superior": 3, "obliquus-capitis-inferior": 3,
  /* Thorax and abdomen */
  "external-intercostals": 1, "internal-intercostals": 2, "innermost-intercostals": 3,
  "transversus-thoracis": 3, "subcostales": 3, "levatores-costarum": 3,
  "external-abdominal-oblique": 0, "rectus-abdominis": 0, "internal-abdominal-oblique": 1, "transversus-abdominis": 2,
  "psoas-minor": 3, "quadratus-lumborum": 3, "diaphragm": 3,
  /* Hip, pelvis and perineum */
  "gluteus-maximus": 0, "tensor-fasciae-latae": 0, "gluteus-medius": 1, "gluteus-minimus": 2,
  "piriformis": 2, "obturator-internus": 2, "gemellus-superior": 2, "gemellus-inferior": 2, "quadratus-femoris": 2,
  "obturator-externus": 3, "psoas-major": 2, "iliacus": 2,
  "levator-ani": 3, "coccygeus-ischiococcygeus": 3,
  "ischiocavernosus": 1, "bulbospongiosus-bulbocavernosus": 1, "superficial-transverse-perineal": 1, "external-anal-sphincter": 1,
  "external-urethral-sphincter-male": 2, "urethral-sphincter-and-compressor-urethrae-female": 2,
  /* Shoulder and arm */
  "deltoid": 0, "pectoralis-major": 0,
  "supraspinatus": 1, "infraspinatus": 1, "teres-minor": 1, "teres-major": 1, "pectoralis-minor": 1, "serratus-anterior": 1,
  "subclavius": 2, "subscapularis": 2,
  "biceps-brachii": 0, "triceps-brachii": 0, "anconeus": 0, "brachialis": 1, "coracobrachialis": 1,
  /* Forearm, in the book's superficial, intermediate and deep groups */
  "pronator-teres": 0, "flexor-carpi-radialis": 0, "palmaris-longus": 0, "flexor-carpi-ulnaris": 0,
  "flexor-digitorum-superficialis": 1, "flexor-digitorum-profundus": 2, "flexor-pollicis-longus": 2, "pronator-quadratus": 3,
  "brachioradialis": 0, "extensor-carpi-radialis-longus": 0, "extensor-carpi-radialis-brevis": 0, "extensor-digitorum": 0,
  "extensor-digiti-minimi": 0, "extensor-carpi-ulnaris": 0,
  "supinator": 1, "abductor-pollicis-longus": 1, "extensor-pollicis-brevis": 1, "extensor-pollicis-longus": 1, "extensor-indicis": 1,
  /* Hand */
  "abductor-pollicis-brevis": 0, "flexor-pollicis-brevis": 0, "opponens-pollicis": 1, "adductor-pollicis": 2,
  "abductor-digiti-minimi-hand": 0, "flexor-digiti-minimi-brevis-hand": 0, "opponens-digiti-minimi": 1,
  "lumbricals-1-and-2-hand": 1, "lumbricals-3-and-4-hand": 1, "dorsal-interossei-hand": 2, "palmar-interossei-hand": 3,
  /* Thigh */
  "sartorius": 0, "rectus-femoris": 0, "vastus-lateralis": 0, "vastus-medialis": 0, "vastus-intermedius": 1,
  "gracilis": 0, "adductor-longus": 0, "pectineus": 0, "adductor-brevis": 1, "adductor-magnus": 2,
  "semitendinosus": 0, "biceps-femoris-long-head": 0, "semimembranosus": 1, "biceps-femoris-short-head": 1,
  /* Leg, with the book's superficial and deep posterior groups */
  "tibialis-anterior": 0, "extensor-digitorum-longus": 0, "extensor-hallucis-longus": 1, "fibularis-peroneus-tertius": 1,
  "fibularis-peroneus-longus": 0, "fibularis-peroneus-brevis": 1,
  "gastrocnemius": 0, "plantaris": 1, "soleus": 1,
  "popliteus": 2, "flexor-hallucis-longus": 2, "flexor-digitorum-longus": 2, "tibialis-posterior": 3,
  /* Sole, the book's plantar layers 1 to 4 */
  "abductor-hallucis": 0, "flexor-digitorum-brevis": 0, "abductor-digiti-minimi-foot": 0,
  "quadratus-plantae": 1, "lumbricals-foot": 1,
  "flexor-hallucis-brevis": 2, "adductor-hallucis": 2, "flexor-digiti-minimi-brevis-foot": 2,
  "plantar-interossei-foot": 3, "dorsal-interossei-foot": 3,
};
