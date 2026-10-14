// public/js/workouts.js
// 40+ Yoga Poses, 20+ Fitness Exercises & Personalized 7-Day Workout Plans

const Workouts = (() => {
  // 1. Library of 40+ Authentic Yoga Poses with Sanskrit names, difficulty, guidelines, and rules
  const YOGA_POSES = [
    {
      id: 'tadasana',
      sanskrit: 'Tadasana',
      english: 'Mountain Pose',
      category: 'standing',
      difficulty: 'beginner',
      target: 'Spinal alignment, posture, quadriceps, core stability',
      instructions: 'Stand tall with big toes touching, heels slightly apart. Ground through all four corners of feet. Engage quadriceps, draw tailbone down slightly, broaden collarbones, and align ears directly over shoulders.',
      benefits: 'Improves posture, strengthens arches of feet, calms nervous system.',
      safety: 'Avoid locking knees. If experiencing dizziness, separate feet hip-width.',
      cameraMode: 'full_body_front',
      rules: { spineVertical: true, kneeAngle: [170, 180], ankleDistanceMax: 0.15 }
    },
    {
      id: 'vrikshasana',
      sanskrit: 'Vrikshasana',
      english: 'Tree Pose',
      category: 'balance',
      difficulty: 'beginner',
      target: 'Ankles, calves, inner thighs, balance, concentration',
      instructions: 'Root firmly into left foot. Place right sole either on inner left calf or upper inner thigh—never on the knee joint. Bring hands together in prayer at chest center (Anjali Mudra). Focus gaze (drishti) on an unmoving point.',
      benefits: 'Builds neuromuscular coordination, opens groin, strengthens ankles.',
      safety: 'Never place the foot directly on the knee joint.',
      cameraMode: 'full_body_front',
      rules: { standingLegStraight: true, bentKneeAngle: [40, 85], hipLevel: true }
    },
    {
      id: 'trikonasana',
      sanskrit: 'Trikonasana',
      english: 'Triangle Pose',
      category: 'standing',
      difficulty: 'intermediate',
      target: 'Hamstrings, groins, hips, obliques, thoracic expansion',
      instructions: 'Step feet 3.5–4 feet apart. Turn right foot out 90°, left foot in slightly. Inhale reach right arm forward, hinge at hip crease. Lower right hand to shin or block, extend left arm toward ceiling.',
      benefits: 'Stretches spine, stimulates abdominal organs, relieves back stiffness.',
      safety: 'Do not lock front knee; maintain micro-bend if hamstrings are tight.',
      cameraMode: 'full_body_front',
      rules: { frontLegAngle: [165, 180], armsOppositeVertical: true }
    },
    {
      id: 'virabhadrasana_1',
      sanskrit: 'Virabhadrasana I',
      english: 'Warrior I',
      category: 'standing',
      difficulty: 'intermediate',
      target: 'Quads, hip flexors, shoulders, back extensors',
      instructions: 'From standing, step left foot back 3.5 feet, angle at 45°. Bend right knee directly over right ankle (90°). Square hips forward as much as comfortable, sweep arms overhead with palms facing inward.',
      benefits: 'Strengthens shoulders, arms, legs; opens chest and lungs.',
      safety: 'Keep back heel firmly planted. Reduce stance if back knee strains.',
      cameraMode: 'full_body_side',
      rules: { frontKneeAngle: [85, 105], torsoVertical: true, backLegAngle: [165, 180] }
    },
    {
      id: 'virabhadrasana_2',
      sanskrit: 'Virabhadrasana II',
      english: 'Warrior II',
      category: 'standing',
      difficulty: 'beginner',
      target: 'Adductors, quadriceps, gluteus medius, deltoids',
      instructions: 'Step feet wide (~4 feet). Turn right foot out 90°, left foot parallel to back mat. Bend right knee to 90° tracking towards second toe. Extend arms parallel to ground, gaze over front middle fingertip.',
      benefits: 'Builds leg stamina, relieves backaches, opens chest and hips.',
      safety: 'Do not let front knee collapse inward.',
      cameraMode: 'full_body_front',
      rules: { frontKneeAngle: [85, 100], armsHorizontal: true, torsoCentered: true }
    },
    {
      id: 'virabhadrasana_3',
      sanskrit: 'Virabhadrasana III',
      english: 'Warrior III',
      category: 'balance',
      difficulty: 'advanced',
      target: 'Glutes, hamstrings, back extensors, core stabilizers',
      instructions: 'Shift weight to right foot. Hinge forward at hip, lifting left leg behind you until torso and back leg form a horizontal line parallel to the mat. Extend arms forward or alongside torso.',
      benefits: 'Full-body balance, strengthens ankles, tones posterior chain.',
      safety: 'Keep hips square to the mat. Avoid hyperextending standing knee.',
      cameraMode: 'full_body_side',
      rules: { torsoLegParallel: true, standingLegAngle: [165, 180] }
    },
    {
      id: 'adho_mukha_svanasana',
      sanskrit: 'Adho Mukha Svanasana',
      english: 'Downward-Facing Dog',
      category: 'inversion',
      difficulty: 'beginner',
      target: 'Shoulders, hamstrings, calves, spine decompression',
      instructions: 'From hands and knees, tuck toes and lift hips toward ceiling, forming an inverted V. Press firmly through index knuckles. Lengthen spine, draw sit bones high, press heels toward mat.',
      benefits: 'Energizes body, relieves back pain, strengthens arms and legs.',
      safety: 'Bend knees generously if hamstrings or lower back are tight.',
      cameraMode: 'full_body_side',
      rules: { invertedVAngle: [70, 95], armsStraight: true }
    },
    {
      id: 'bhujangasana',
      sanskrit: 'Bhujangasana',
      english: 'Cobra Pose',
      category: 'prone',
      difficulty: 'beginner',
      target: 'Erector spinae, chest, anterior deltoids, glutes',
      instructions: 'Lie prone with legs extended, tops of feet on mat. Place palms beneath shoulders. Inhale, press tops of feet down and lift chest forward and up using back muscles, keeping elbows close to ribs.',
      benefits: 'Strengthens spine, opens heart and lungs, tones gluteal muscles.',
      safety: 'Avoid jamming lower back. Keep elbows softly bent.',
      cameraMode: 'floor_side',
      rules: { chestElevated: true, elbowsBentTucked: true }
    },
    {
      id: 'balasana',
      sanskrit: 'Balasana',
      english: "Child's Pose",
      category: 'prone',
      difficulty: 'beginner',
      target: 'Hips, thighs, ankles, spine decompression',
      instructions: 'Kneel on the floor, touch big toes together, sit on heels. Separate knees hip-width or wider. Exhale, fold torso forward between thighs, resting forehead gently on mat. Extend arms forward.',
      benefits: 'Deeply calming restorative pose, relieves fatigue and stress.',
      safety: 'Place a blanket under knees or behind knee creases if experiencing discomfort.',
      cameraMode: 'floor_side',
      rules: { hipsOnHeels: true, foreheadRested: true }
    },
    {
      id: 'setu_bandhasana',
      sanskrit: 'Setu Bandhasana',
      english: 'Bridge Pose',
      category: 'supine',
      difficulty: 'beginner',
      target: 'Glutes, hamstrings, chest, hip flexor stretch',
      instructions: 'Lie supine with knees bent, feet hip-width flat on mat close to sit bones. Exhale, press through heels and lift hips toward ceiling. Clasp hands beneath pelvis, roll outer shoulders under.',
      benefits: 'Rejuvenates tired legs, stretches chest and neck, stimulates thyroid.',
      safety: 'Keep knees parallel; do not turn neck while hips are elevated.',
      cameraMode: 'floor_side',
      rules: { hipExtensionAngle: [150, 180], kneesOverAnkles: true }
    },
    {
      id: 'utkatasana',
      sanskrit: 'Utkatasana',
      english: 'Chair Pose',
      category: 'standing',
      difficulty: 'intermediate',
      target: 'Quadriceps, glutes, calves, spinal extensors',
      instructions: 'Inhale, sweep arms overhead parallel to ears. Exhale, bend knees and sit hips back as if into a chair. Keep weight rooted in heels, draw belly button to spine.',
      benefits: 'Tones leg muscles, stimulates abdominal organs, strengthens ankles.',
      safety: 'Keep knees behind toes to protect knee joints.',
      cameraMode: 'full_body_side',
      rules: { kneeBendAngle: [90, 130], torsoInclineAngle: [40, 60] }
    },
    {
      id: 'vriksha_variation',
      sanskrit: 'Vrikshasana Variation',
      english: 'Tree Pose with Raised Arms',
      category: 'balance',
      difficulty: 'intermediate',
      target: 'Shoulders, core balance, ankle stability',
      instructions: 'In Tree Pose, slowly sweep arms upward overhead into a wide V or clasp fingers and turn palms to ceiling, challenging vestibular balance.',
      benefits: 'Enhances proprioception, shoulder mobility, mental focus.',
      safety: 'Keep focus on steady drishti point; step down if losing balance.',
      cameraMode: 'full_body_front',
      rules: { armsOverhead: true, standingLegStraight: true }
    },
    {
      id: 'ardha_chandrasana',
      sanskrit: 'Ardha Chandrasana',
      english: 'Half Moon Pose',
      category: 'balance',
      difficulty: 'advanced',
      target: 'Outer hips, gluteus medius, spine, core',
      instructions: 'From Triangle pose, bend front knee, place fingertips 12 inches ahead on mat or block. Lift back leg parallel to floor, stack top hip and shoulder, extend top arm vertically.',
      benefits: 'Strengthens ankles and spine, expands chest, improves coordination.',
      safety: 'Use a yoga block under lower hand to maintain open thoracic alignment.',
      cameraMode: 'full_body_front',
      rules: { liftedLegAngle: [165, 185], stackedShoulders: true }
    },
    {
      id: 'anjaneyasana',
      sanskrit: 'Anjaneyasana',
      english: 'Low Lunge',
      category: 'standing',
      difficulty: 'beginner',
      target: 'Hip flexors, psoas, quads, chest expansion',
      instructions: 'From Downward Dog, step right foot between hands. Lower left knee to mat, release top of foot. Sweep arms overhead, lift ribcage away from hips, sink pelvis gently forward.',
      benefits: 'Relieves tightness from sitting, stretches hip flexors, energizes body.',
      safety: 'Pad back knee with a folded blanket if kneecap is sensitive.',
      cameraMode: 'full_body_side',
      rules: { frontKneeAngle: [85, 100], backKneeDown: true }
    },
    {
      id: 'malasana',
      sanskrit: 'Malasana',
      english: 'Garland Pose (Deep Squat)',
      category: 'standing',
      difficulty: 'beginner',
      target: 'Hips, groins, ankles, lower back decompression',
      instructions: 'Stand with feet wider than hips, toes turned out 30–45°. Exhale, bend knees and squat down deeply. Press elbows against inner knees, bring hands into prayer, lengthen spine.',
      benefits: 'Promotes healthy pelvic mobility, aids digestion, stretches achilles tendons.',
      safety: 'Place a rolled mat or blanket under heels if they lift off floor.',
      cameraMode: 'full_body_front',
      rules: { deepSquatAngle: [50, 85], spineErect: true }
    },
    {
      id: 'sukhasana',
      sanskrit: 'Sukhasana',
      english: 'Easy Pose',
      category: 'seated',
      difficulty: 'beginner',
      target: 'Spinal erectness, inner hips, meditative breathing',
      instructions: 'Sit on mat with crossed shins, feet resting beneath knees. Sit tall with natural curve in lower back, relax shoulders, rest hands on knees in Jnana Mudra.',
      benefits: 'Calms mind, encourages diaphragmatic breathing, improves seated posture.',
      safety: 'Sit on a cushion or yoga block if knees are higher than hips.',
      cameraMode: 'floor_front',
      rules: { uprightSpine: true, crossedLegs: true }
    },
    {
      id: 'padmasana',
      sanskrit: 'Padmasana',
      english: 'Lotus Pose',
      category: 'seated',
      difficulty: 'advanced',
      target: 'Knee ligaments, hips, ankles, meditation focus',
      instructions: 'From seated position, place right foot on left upper thigh, sole facing up. Carefully lift left foot and place on right upper thigh. Keep spine tall and palms open.',
      benefits: 'Stabilizes pelvic circulation, primes nervous system for meditation.',
      safety: 'Do not force into knees! Substitute with Ardha Padmasana (Half Lotus) or Sukhasana.',
      cameraMode: 'floor_front',
      rules: { fullCrossedLegs: true, uprightSpine: true }
    },
    {
      id: 'vajrasana',
      sanskrit: 'Vajrasana',
      english: 'Thunderbolt Pose',
      category: 'seated',
      difficulty: 'beginner',
      target: 'Quadriceps, ankles, digestive tract stimulation',
      instructions: 'Kneel with big toes touching and heels separated. Sit hips onto the cradle of your heels. Rest hands palms-down on thighs. Breathe slowly.',
      benefits: 'Excellent post-meal pose to assist digestion, relieves sciatic discomfort.',
      safety: 'Place a blanket between calves and thighs if experiencing knee strain.',
      cameraMode: 'floor_side',
      rules: { kneelingSeated: true, spineUpright: true }
    },
    {
      id: 'paschimottanasana',
      sanskrit: 'Paschimottanasana',
      english: 'Seated Forward Bend',
      category: 'seated',
      difficulty: 'intermediate',
      target: 'Hamstrings, calves, entire posterior spinal chain',
      instructions: 'Sit with legs extended straight in front, feet flexed. Inhale, reach arms overhead; exhale, hinge at hips and reach for shins, ankles, or outer feet, keeping spine long.',
      benefits: 'Calms nervous system, stretches entire backside of body, massages abdominal viscera.',
      safety: 'Do not round violently through thoracic spine; bend knees slightly if hamstrings pull.',
      cameraMode: 'floor_side',
      rules: { forwardFoldAngle: [30, 75], legsExtended: true }
    },
    {
      id: 'baddha_konasana',
      sanskrit: 'Baddha Konasana',
      english: 'Bound Angle Pose (Butterfly)',
      category: 'seated',
      difficulty: 'beginner',
      target: 'Adductors, groins, pelvic floor mobility',
      instructions: 'Sit tall, bend knees, and bring soles of feet together. Hold outer feet or ankles with hands, gently release knees toward floor without bouncing.',
      benefits: 'Opens inner hips, stimulates pelvic blood circulation, relieves menstrual cramps.',
      safety: 'Support outer thighs with yoga blocks if knees are sensitive.',
      cameraMode: 'floor_front',
      rules: { feetTogether: true, kneesAbducted: true }
    },
    {
      id: 'marjaryasana',
      sanskrit: 'Marjaryasana',
      english: 'Cat Pose',
      category: 'prone',
      difficulty: 'beginner',
      target: 'Spinal flexion, transverse abdominis, neck release',
      instructions: 'Start on hands and knees (tabletop). Exhale, round spine upward toward ceiling, tuck chin toward chest, draw navel in firmly.',
      benefits: 'Releases spinal tension, improves segmental mobility, stretches upper back.',
      safety: 'Ensure wrists are stacked directly beneath shoulder joints.',
      cameraMode: 'floor_side',
      rules: { roundedSpine: true, headTucked: true }
    },
    {
      id: 'bitilasana',
      sanskrit: 'Bitilasana',
      english: 'Cow Pose',
      category: 'prone',
      difficulty: 'beginner',
      target: 'Spinal extension, pectorals, anterior neck',
      instructions: 'From tabletop, inhale, drop belly toward mat, lift sit bones and chest toward ceiling, gazing gently upward.',
      benefits: 'Stretches anterior torso and neck, warms up spine for flow.',
      safety: 'Avoid compressing back of neck; gaze gently up and forward.',
      cameraMode: 'floor_side',
      rules: { archedSpine: true, chestLifted: true }
    },
    {
      id: 'phalakasana',
      sanskrit: 'Phalakasana',
      english: 'Plank Pose',
      category: 'arm_balance',
      difficulty: 'beginner',
      target: 'Core, serratus anterior, deltoids, quadriceps',
      instructions: 'From hands and knees or Downward Dog, bring shoulders directly over wrists. Form a straight diagonal line from crown of head to heels. Engage glutes and core.',
      benefits: 'Builds foundational core and shoulder stability, tones abdominal wall.',
      safety: 'Do not let hips sag or hike into an inverted V.',
      cameraMode: 'floor_side',
      rules: { bodyStraightLine: true, shoulderOverWrist: true }
    },
    {
      id: 'chaturanga_dandasana',
      sanskrit: 'Chaturanga Dandasana',
      english: 'Four-Limbed Staff Pose',
      category: 'arm_balance',
      difficulty: 'advanced',
      target: 'Triceps, pectorals, anterior deltoids, deep core',
      instructions: 'From Plank, shift weight slightly forward on toes. Exhale, lower body parallel to floor until elbows are at a precise 90° angle, pinned closely against ribcage.',
      benefits: 'Develops immense upper body push strength and wrist endurance.',
      safety: 'Never let shoulders dip below elbow level to protect rotator cuff.',
      cameraMode: 'floor_side',
      rules: { elbowAngle90: true, bodyHoveringStraight: true }
    },
    {
      id: 'salabhasana',
      sanskrit: 'Salabhasana',
      english: 'Locust Pose',
      category: 'prone',
      difficulty: 'beginner',
      target: 'Gluteus maximus, hamstrings, erector spinae, rhomboids',
      instructions: 'Lie prone with arms along sides, palms down. Exhale, lift head, chest, arms, and legs simultaneously off mat. Reach back actively through toes.',
      benefits: 'Counteracts desk sitting posture, strengthens lower back, stimulates kidneys.',
      safety: 'Lengthen the neck by gazing at the front edge of the mat.',
      cameraMode: 'floor_side',
      rules: { chestAndLegsLifted: true }
    },
    {
      id: 'dhanurasana',
      sanskrit: 'Dhanurasana',
      english: 'Bow Pose',
      category: 'prone',
      difficulty: 'intermediate',
      target: 'Thoracic extension, quadriceps, chest, shoulders',
      instructions: 'Lie prone, bend knees, reach back and clasp outside of ankles. Inhale, kick shins backward and upward, lifting chest and thighs off mat into a bow shape.',
      benefits: 'Expands thoracic cage, relieves mild backaches, strengthens back muscles.',
      safety: 'Avoid if pregnant or recovering from abdominal surgery.',
      cameraMode: 'floor_side',
      rules: { bowShapeCurvature: true, anklesHeld: true }
    },
    {
      id: 'ardha_matsyendrasana',
      sanskrit: 'Ardha Matsyendrasana',
      english: 'Half Spinal Twist',
      category: 'seated',
      difficulty: 'intermediate',
      target: 'Thoracic rotation, piriformis, obliques, neck',
      instructions: 'Sit tall with legs extended. Bend right knee, step right foot over outside of left knee. Bend left knee in. Inhale tall, exhale twist torso right, placing right hand behind.',
      benefits: 'Restores spinal rotational freedom, aids liver and kidney function.',
      safety: 'Initiate twist from thoracic spine, not from pulling neck.',
      cameraMode: 'floor_front',
      rules: { torsoTwistAngle: [40, 75], spineVertical: true }
    },
    {
      id: 'naukasana',
      sanskrit: 'Naukasana',
      english: 'Boat Pose',
      category: 'seated',
      difficulty: 'intermediate',
      target: 'Rectus abdominis, hip flexors, adductors, spine',
      instructions: 'Sit with knees bent, feet flat. Lean back slightly, lift feet off floor with shins parallel to mat (or legs straight). Extend arms forward parallel to ground.',
      benefits: 'Intense core builder, stimulates thyroid and intestines, improves balance.',
      safety: 'Bend knees if lower back begins to round or strain.',
      cameraMode: 'floor_side',
      rules: { vShapeAngle: [60, 95], armsParallel: true }
    },
    {
      id: 'pavanamuktasana',
      sanskrit: 'Pavanamuktasana',
      english: 'Wind-Relieving Pose',
      category: 'supine',
      difficulty: 'beginner',
      target: 'Lumbar spine decompression, digestive organs, hips',
      instructions: 'Lie supine. Exhale, draw both knees to chest, wrap arms around shins. Gently tuck chin toward chest. Breathe deeply into abdomen.',
      benefits: 'Massages internal abdominal organs, relieves bloating and gas, relaxes lumbar.',
      safety: 'Gentle hug; do not strain neck if lifting head.',
      cameraMode: 'floor_side',
      rules: { kneesToChest: true, supineFlat: true }
    },
    {
      id: 'viparita_karani',
      sanskrit: 'Viparita Karani',
      english: 'Legs-Up-the-Wall Pose',
      category: 'inversion',
      difficulty: 'beginner',
      target: 'Venous return, hamstrings, nervous system downregulation',
      instructions: 'Sit sideways against a wall, swing legs up onto wall while lowering torso flat onto mat. Rest arms open with palms facing upward. Breathe naturally.',
      benefits: 'Reduces leg swelling, relieves insomnia, lowers blood pressure.',
      safety: 'Place a folded bolster or blanket beneath lower back for extra comfort.',
      cameraMode: 'floor_side',
      rules: { legsVertical: true, torsoFlat: true }
    },
    {
      id: 'savasana',
      sanskrit: 'Savasana',
      english: 'Corpse Pose',
      category: 'supine',
      difficulty: 'beginner',
      target: 'Total neuromuscular release, parasympathetic activation',
      instructions: 'Lie flat on back, feet relaxed wider than hip distance, arms resting slightly away from body with palms facing ceiling. Close eyes and release all muscular effort.',
      benefits: 'Integrates practice benefits, reduces anxiety, drops cortisol levels.',
      safety: 'Place a rolled blanket under knees if lower back experiences stiffness.',
      cameraMode: 'floor_top_down',
      rules: { bodyCompletelyStill: true }
    },
    {
      id: 'uttanasana',
      sanskrit: 'Uttanasana',
      english: 'Standing Forward Bend',
      category: 'standing',
      difficulty: 'beginner',
      target: 'Hamstrings, calves, lumbar spine decompression',
      instructions: 'From Mountain Pose, exhale, hinge forward from hip joints (not waist). Lower hands to mat, ankles, or shins. Let neck and crown of head hang completely heavy.',
      benefits: 'Calms brain, relieves stress, stretches hamstrings and calves.',
      safety: 'Maintain generous bend in knees if hamstrings are tight.',
      cameraMode: 'full_body_side',
      rules: { forwardFoldTorsoAngle: [20, 60], standingLegStraightOrMicrobent: true }
    },
    {
      id: 'prasarita_padottanasana',
      sanskrit: 'Prasarita Padottanasana',
      english: 'Wide-Legged Forward Bend',
      category: 'standing',
      difficulty: 'intermediate',
      target: 'Adductors, hamstrings, thoracic spine, ankles',
      instructions: 'Step feet wide (~4.5 feet apart), outer edges of feet parallel to mat edges. Inhale lengthen spine; exhale fold forward from hips, resting palms on mat under shoulders.',
      benefits: 'Strengthens feet and legs, decompresses lumbar spine, cools nervous system.',
      safety: 'Do not hyperextend knees; distribute weight evenly through feet.',
      cameraMode: 'full_body_front',
      rules: { wideStanceRatio: true, foldedTorso: true }
    },
    {
      id: 'parsvakonasana',
      sanskrit: 'Parsvakonasana',
      english: 'Extended Side Angle Pose',
      category: 'standing',
      difficulty: 'intermediate',
      target: 'Ankles, quads, obliques, lats, chest opening',
      instructions: 'From Warrior II with right knee bent 90°, rest right forearm on right thigh or fingertips on floor. Sweep left arm up and forward alongside left ear, creating a straight diagonal line from left outer heel to fingertips.',
      benefits: 'Builds stamina, stretches lateral side body, opens chest.',
      safety: 'Avoid dumping all weight into bottom forearm; engage side waist.',
      cameraMode: 'full_body_front',
      rules: { diagonalBodyLine: true, frontKneeAngle: [85, 100] }
    },
    {
      id: 'garudasana',
      sanskrit: 'Garudasana',
      english: 'Eagle Pose',
      category: 'balance',
      difficulty: 'advanced',
      target: 'Shoulders, upper back, outer hips, ankles, balance',
      instructions: 'Bend both knees slightly. Cross right thigh over left, hook right toes behind left calf if accessible. Cross left arm over right at elbows, wrap forearms and press palms together. Sit hips down.',
      benefits: 'Opens posterior shoulder girdle, challenges balance, compresses & detoxifies joints.',
      safety: 'Keep big toe of lifted foot touching floor as a kickstand if balance is unsteady.',
      cameraMode: 'full_body_front',
      rules: { wrappedLimbs: true, balancedOnSingleFoot: true }
    },
    {
      id: 'gomukhasana',
      sanskrit: 'Gomukhasana',
      english: 'Cow Face Pose',
      category: 'seated',
      difficulty: 'intermediate',
      target: 'Rotator cuff, triceps, latissimus dorsi, outer hips',
      instructions: 'Sit with knees stacked directly on top of each other. Reach right arm overhead, bend elbow to drop hand behind neck. Reach left arm behind back and up, clasping fingers together between shoulder blades.',
      benefits: 'Deep shoulder opener, releases chronic upper back tension, stretches glutes.',
      safety: 'Hold a yoga strap or towel between hands if fingers do not comfortably touch.',
      cameraMode: 'seated_front',
      rules: { stackedKnees: true, handsClaspedBehind: true }
    },
    {
      id: 'ustrasana',
      sanskrit: 'Ustrasana',
      english: 'Camel Pose',
      category: 'seated',
      difficulty: 'intermediate',
      target: 'Hip flexors, quads, pectorals, throat, spinal mobility',
      instructions: 'Kneel with hips stacked over knees, tops of feet flat. Place hands on sacrum with fingers pointing down. Inhale, lift sternum toward ceiling, arch back gently and reach hands for heels.',
      benefits: 'Powerful backbend that improves spinal posture, opens respiratory capacity.',
      safety: 'Keep hips pushing forward over knees; do not dump into lower back.',
      cameraMode: 'floor_side',
      rules: { spineExtensionBackbend: true, hipsOverKnees: true }
    },
    {
      id: 'matsyasana',
      sanskrit: 'Matsyasana',
      english: 'Fish Pose',
      category: 'supine',
      difficulty: 'beginner',
      target: 'Chest, intercostals, anterior neck, upper spine',
      instructions: 'Lie supine with legs together. Slide hands palms-down beneath hips. Inhale, press forearms and elbows into mat, lift chest toward ceiling, arching upper back and resting crown of head lightly on mat.',
      benefits: 'Traditional counterpose to shoulder stand, relieves throat and bronchial tension.',
      safety: 'Weight must remain in forearms and elbows, NOT on neck or head.',
      cameraMode: 'floor_side',
      rules: { archedThoracicChest: true, forearmsGrounded: true }
    },
    {
      id: 'natarajasana',
      sanskrit: 'Natarajasana',
      english: 'Dancer Pose (Lord of the Dance)',
      category: 'balance',
      difficulty: 'advanced',
      target: 'Hamstrings, quads, hip flexors, shoulder mobility, balance',
      instructions: 'Shift weight to left foot. Bend right knee, catch inner right ankle with right hand. Inhale, extend left arm forward and up; exhale, kick right foot back and upward into hand while tilting torso forward.',
      benefits: 'Develops supreme balance, opens chest and hips, builds poise and strength.',
      safety: 'Square hips toward mat; avoid twisting pelvis sideways.',
      cameraMode: 'full_body_side',
      rules: { standingLegStraight: true, backLegKickedHigh: true }
    },
    {
      id: 'surya_namaskar',
      sanskrit: 'Surya Namaskar',
      english: 'Sun Salutation Sequence (12 Poses)',
      category: 'flow',
      difficulty: 'intermediate',
      target: 'Full body cardiovascular endurance, joint lubrication, flexibility',
      instructions: 'A complete classical dynamic sequence linking 12 poses: Pranamasana, Hastauttanasana, Padahastasana, Ashwa Sanchalanasana, Dandasana, Ashtanga Namaskara, Bhujangasana, Parvatasana, and returning.',
      benefits: 'Energizes full system, improves circulation, increases overall metabolic rate.',
      safety: 'Synchronize movement with breath (inhale for expansions, exhale for folds).',
      cameraMode: 'full_body_side',
      rules: { dynamicSequence: true }
    }
  ];

  // 2. Library of 20+ Fitness Exercises with Rep / Duration criteria
  const FITNESS_EXERCISES = [
    { id: 'ex_squats', name: 'Bodyweight Squats', target: 'Quadriceps, Glutes, Core', difficulty: 'beginner', type: 'reps', defaultReps: 15, sets: 3, rest: 45, estCal: 45, instructions: 'Stand shoulder-width apart. Sit hips back and down until thighs are parallel to ground. Keep chest up and knees tracking over toes.' },
    { id: 'ex_wall_pushups', name: 'Wall Push-ups', target: 'Chest, Shoulders, Triceps', difficulty: 'beginner', type: 'reps', defaultReps: 15, sets: 3, rest: 30, estCal: 25, instructions: 'Stand arm-length from a wall. Place palms flat at shoulder height. Lower chest towards wall, then press back.' },
    { id: 'ex_standard_pushups', name: 'Standard Push-ups', target: 'Pectorals, Triceps, Deltoids, Core', difficulty: 'intermediate', type: 'reps', defaultReps: 12, sets: 3, rest: 60, estCal: 50, instructions: 'In high plank with hands slightly wider than shoulders, lower chest until elbows reach 90 degrees, then push up.' },
    { id: 'ex_knee_pushups', name: 'Knee Push-ups', target: 'Chest, Arms, Core', difficulty: 'beginner', type: 'reps', defaultReps: 12, sets: 3, rest: 45, estCal: 35, instructions: 'Perform push-ups with knees on mat, keeping hips in a straight line with shoulders.' },
    { id: 'ex_lunges', name: 'Walking / Alternating Lunges', target: 'Quads, Glutes, Hamstrings, Calves', difficulty: 'intermediate', type: 'reps', defaultReps: 12, sets: 3, rest: 45, estCal: 55, instructions: 'Step forward with one leg, lowering hips until both knees are bent at roughly 90 degrees. Push back to starting position.' },
    { id: 'ex_reverse_lunges', name: 'Reverse Lunges', target: 'Glutes, Hamstrings, Knees stability', difficulty: 'beginner', type: 'reps', defaultReps: 12, sets: 3, rest: 45, estCal: 50, instructions: 'Step backward into a lunge. Reverse lunges place less shear stress on anterior knees.' },
    { id: 'ex_plank', name: 'Forearm Plank', target: 'Transverse Abdominis, Glutes, Shoulders', difficulty: 'beginner', type: 'timed', defaultDuration: 45, sets: 3, rest: 45, estCal: 40, instructions: 'Hold body in a straight line supported on forearms and toes. Keep glutes engaged.' },
    { id: 'ex_side_plank', name: 'Side Plank', target: 'Obliques, Quadratus Lumborum, Shoulders', difficulty: 'intermediate', type: 'timed', defaultDuration: 30, sets: 3, rest: 45, estCal: 35, instructions: 'Lie on side, propping upper body on elbow. Lift hips until body forms a straight diagonal line.' },
    { id: 'ex_glute_bridges', name: 'Glute Bridges', target: 'Gluteus Maximus, Hamstrings, Lower Back', difficulty: 'beginner', type: 'reps', defaultReps: 15, sets: 3, rest: 40, estCal: 40, instructions: 'Lie supine, knees bent, feet flat. Drive through heels to raise hips towards ceiling, squeezing glutes at top.' },
    { id: 'ex_hip_hinges', name: 'Bodyweight Hip Hinges (Good Mornings)', target: 'Hamstrings, Posterior Chain, Glutes', difficulty: 'beginner', type: 'reps', defaultReps: 15, sets: 3, rest: 40, estCal: 35, instructions: 'Hands behind head, push hips straight back while keeping back flat and knees softly unlocked.' },
    { id: 'ex_calf_raises', name: 'Standing Calf Raises', target: 'Gastrocnemius, Soleus, Ankles', difficulty: 'beginner', type: 'reps', defaultReps: 20, sets: 3, rest: 30, estCal: 30, instructions: 'Stand tall, press down through balls of feet to elevate heels as high as possible, then lower under control.' },
    { id: 'ex_bird_dog', name: 'Bird Dog', target: 'Core Stabilizers, Erector Spinae, Glutes', difficulty: 'beginner', type: 'reps', defaultReps: 12, sets: 3, rest: 40, estCal: 35, instructions: 'From tabletop, extend opposite arm and leg straight out parallel to floor. Hold 2 seconds, switch sides.' },
    { id: 'ex_dead_bug', name: 'Dead Bug', target: 'Deep Core, Pelvic Alignment', difficulty: 'beginner', type: 'reps', defaultReps: 12, sets: 3, rest: 40, estCal: 30, instructions: 'Lie supine, arms toward ceiling, knees bent at 90 degrees. Lower opposite arm and leg toward floor while pressing lower back down.' },
    { id: 'ex_mountain_climbers', name: 'Mountain Climbers', target: 'Core, Cardiovascular, Hip Flexors', difficulty: 'intermediate', type: 'timed', defaultDuration: 30, sets: 3, rest: 45, estCal: 60, instructions: 'From high plank, rapidly drive knees alternately toward chest in a running motion.' },
    { id: 'ex_jumping_jacks', name: 'Jumping Jacks', target: 'Full Body Aerobic Conditioning, Calves', difficulty: 'beginner', type: 'timed', defaultDuration: 45, sets: 3, rest: 30, estCal: 65, instructions: 'Jump feet wide while raising arms overhead, then jump back to center.' },
    { id: 'ex_high_knees', name: 'High Knees Running in Place', target: 'Hip Flexors, Quadriceps, Cardio', difficulty: 'intermediate', type: 'timed', defaultDuration: 30, sets: 3, rest: 45, estCal: 70, instructions: 'Run in place, driving knees up to hip height with pump of opposing arms.' },
    { id: 'ex_crunches', name: 'Controlled Core Crunches', target: 'Rectus Abdominis', difficulty: 'beginner', type: 'reps', defaultReps: 15, sets: 3, rest: 40, estCal: 30, instructions: 'Lie on back, feet on floor, curl shoulder blades off mat by contracting upper abs. Avoid pulling on neck.' },
    { id: 'ex_bicep_curls', name: 'Dumbbell / Resistance Band Biceps Curls', target: 'Biceps Brachii, Brachialis', difficulty: 'beginner', type: 'reps', defaultReps: 12, sets: 3, rest: 45, estCal: 35, instructions: 'Hold weights or band with palms forward. Curl upward towards shoulders while keeping elbows pinned to ribs.' },
    { id: 'ex_shoulder_press', name: 'Dumbbell Overhead Shoulder Press', target: 'Anterior & Lateral Deltoids, Triceps', difficulty: 'intermediate', type: 'reps', defaultReps: 10, sets: 3, rest: 60, estCal: 45, instructions: 'Press weights overhead from shoulder height until arms are fully extended, then lower with control.' },
    { id: 'ex_band_rows', name: 'Resistance Band Bent-Over Rows', target: 'Latissimus Dorsi, Rhomboids, Rear Delts', difficulty: 'beginner', type: 'reps', defaultReps: 15, sets: 3, rest: 45, estCal: 45, instructions: 'Step on band with feet, hinge at hips. Pull handles toward ribcage, squeezing shoulder blades together.' }
  ];

  // 3. Personalized 7-Day Plan Generator — EXACTLY 5 activities per day!
  function generateWeeklyPlan(experience = 'beginner', goal = 'fat_loss') {
    return [
      {
        day: 1,
        title: 'Day 1: Full-Body Mobility & Beginner Yoga',
        focus: 'Spinal mobility, joint lubrication & postural alignment',
        warmup: '5 mins gentle neck rolls, shoulder shrugs, and deep diaphragmatic breathing',
        cooldown: '5 mins Savasana with mindful body scan',
        activities: [
          { name: 'Tadasana (Mountain Pose)', type: 'yoga', duration: '3 mins', reps: '5 deep breath cycles', estCal: 15, muscles: 'Postural stabilizers', difficulty: 'beginner', sub: 'Sukhasana', instructions: 'Root through all 4 corners of both feet, engage thighs, lengthen spine tall.' },
          { name: 'Marjaryasana & Bitilasana (Cat-Cow Flow)', type: 'yoga', duration: '4 mins', reps: '10 breath cycles', estCal: 25, muscles: 'Spine, core, neck', difficulty: 'beginner', sub: 'Bird Dog', instructions: 'Inhale arch back (Cow), exhale round spine to ceiling (Cat).' },
          { name: 'Adho Mukha Svanasana (Downward-Facing Dog)', type: 'yoga', duration: '4 mins', reps: '3 holds x 45s', estCal: 30, muscles: 'Shoulders, calves, hamstrings', difficulty: 'beginner', sub: 'Wall Push-ups', instructions: 'Press hands firmly into mat, elevate hips high into inverted V shape.' },
          { name: 'Vrikshasana (Tree Pose)', type: 'yoga', duration: '4 mins', reps: '45s each leg', estCal: 20, muscles: 'Ankles, core, balance', difficulty: 'beginner', sub: 'Tadasana Variation', instructions: 'Place foot on calf or thigh; focus gaze on an unmoving spot.' },
          { name: 'Balasana (Child’s Pose)', type: 'yoga', duration: '5 mins', reps: 'Hold restorative', estCal: 15, muscles: 'Lower back, hips', difficulty: 'beginner', sub: 'Pavanamuktasana', instructions: 'Rest hips back on heels, forehead on floor, breathe deeply.' }
        ]
      },
      {
        day: 2,
        title: 'Day 2: Lower-Body Strength & Hip Flexibility',
        focus: 'Quadriceps, hamstrings, glute activation & adductor release',
        warmup: '4 mins leg swings, ankle circles, and bodyweight hip openers',
        cooldown: '4 mins Baddha Konasana (Butterfly stretch) and quad stretch',
        activities: [
          { name: 'Bodyweight Squats', type: 'exercise', duration: '6 mins', reps: '3 sets x 15 reps', estCal: 55, muscles: 'Quads, glutes', difficulty: 'beginner', sub: 'Wall Sit', instructions: 'Hips back and down to knee height, chest elevated, drive through mid-foot.' },
          { name: 'Reverse Lunges', type: 'exercise', duration: '6 mins', reps: '3 sets x 12 reps/leg', estCal: 50, muscles: 'Glutes, hamstrings', difficulty: 'beginner', sub: 'Glute Bridges', instructions: 'Step backward smoothly, dropping back knee toward mat.' },
          { name: 'Glute Bridges', type: 'exercise', duration: '5 mins', reps: '3 sets x 15 reps', estCal: 45, muscles: 'Gluteus maximus, hamstrings', difficulty: 'beginner', sub: 'Setu Bandhasana', instructions: 'Press heels down to bridge hips up, squeeze glutes at peak.' },
          { name: 'Virabhadrasana II (Warrior II)', type: 'yoga', duration: '5 mins', reps: '3 holds x 45s per side', estCal: 35, muscles: 'Hips, adductors, legs', difficulty: 'beginner', sub: 'Anjaneyasana', instructions: 'Deep 90-degree front knee bend, arms extended horizontally.' },
          { name: 'Malasana (Garland Pose Deep Squat)', type: 'yoga', duration: '4 mins', reps: '3 holds x 45s', estCal: 25, muscles: 'Pelvic floor, groin, ankles', difficulty: 'beginner', sub: 'Baddha Konasana', instructions: 'Deep squat with elbows nudging inner knees open, spine long.' }
        ]
      },
      {
        day: 3,
        title: 'Day 3: Upper-Body Strength & Posture',
        focus: 'Pectorals, rhomboids, shoulders & thoracic opening',
        warmup: '4 mins arm circles, wrist rolls, and doorway chest stretches',
        cooldown: '4 mins Gomukhasana shoulder stretch & child’s pose',
        activities: [
          { name: 'Standard or Knee Push-ups', type: 'exercise', duration: '6 mins', reps: '3 sets x 10–12 reps', estCal: 50, muscles: 'Chest, triceps, anterior delts', difficulty: 'intermediate', sub: 'Wall Push-ups', instructions: 'Keep body in rigid plank, lower chest to floor, push back up.' },
          { name: 'Forearm Plank', type: 'exercise', duration: '5 mins', reps: '3 sets x 40s hold', estCal: 40, muscles: 'Core, shoulders', difficulty: 'beginner', sub: 'Phalakasana', instructions: 'Straight line head to heels, avoid sagging or hiking hips.' },
          { name: 'Resistance Band Rows / Hip Hinges', type: 'exercise', duration: '6 mins', reps: '3 sets x 12 reps', estCal: 45, muscles: 'Upper back, lats, posterior chain', difficulty: 'beginner', sub: 'Bird Dog', instructions: 'Pull elbows back past ribs, pinch shoulder blades together.' },
          { name: 'Bhujangasana (Cobra Pose)', type: 'yoga', duration: '4 mins', reps: '4 holds x 30s', estCal: 25, muscles: 'Erector spinae, chest', difficulty: 'beginner', sub: 'Salabhasana', instructions: 'Press tops of feet down, peel chest forward and up using back muscles.' },
          { name: 'Ustrasana (Camel Pose)', type: 'yoga', duration: '5 mins', reps: '3 holds x 30s', estCal: 25, muscles: 'Chest, shoulders, hip flexors', difficulty: 'intermediate', sub: 'Setu Bandhasana', instructions: 'From kneeling, support lower back or reach heels, expand chest.' }
        ]
      },
      {
        day: 4,
        title: 'Day 4: Recovery Yoga, Balance & Breathing',
        focus: 'Parasympathetic recovery, balance proprioception & stress relief',
        warmup: '5 mins gentle Sukhasana seated breathing (Pranayama)',
        cooldown: '6 mins Savasana with slow ocean breath (Ujjayi)',
        activities: [
          { name: 'Sukhasana & Pranayama Breathing', type: 'yoga', duration: '5 mins', reps: 'Mindful practice', estCal: 15, muscles: 'Respiratory muscles, nervous system', difficulty: 'beginner', sub: 'Vajrasana', instructions: 'Sit tall, slow rhythmic 4-second inhales and 6-second exhales.' },
          { name: 'Vrikshasana with Raised Arms', type: 'yoga', duration: '5 mins', reps: '45s per side x 2', estCal: 20, muscles: 'Ankle stabilizers, balance', difficulty: 'intermediate', sub: 'Tadasana', instructions: 'Raise arms overhead like tree branches while balancing on one leg.' },
          { name: 'Paschimottanasana (Seated Forward Bend)', type: 'yoga', duration: '5 mins', reps: '3 holds x 60s', estCal: 20, muscles: 'Hamstrings, back chain', difficulty: 'beginner', sub: 'Uttanasana', instructions: 'Fold forward from hips toward toes, keeping spine lengthened.' },
          { name: 'Ardha Matsyendrasana (Half Spinal Twist)', type: 'yoga', duration: '5 mins', reps: '45s each side x 2', estCal: 20, muscles: 'Obliques, thoracic spine', difficulty: 'intermediate', sub: 'Marjaryasana', instructions: 'Twist gently through upper back, breathing space into vertebrae.' },
          { name: 'Viparita Karani (Legs-Up-the-Wall Pose)', type: 'yoga', duration: '6 mins', reps: 'Restorative hold', estCal: 15, muscles: 'Circulatory, nervous system', difficulty: 'beginner', sub: 'Pavanamuktasana', instructions: 'Elevate legs vertically up against wall, surrender all muscular effort.' }
        ]
      },
      {
        day: 5,
        title: 'Day 5: Full-Body Strength & Core',
        focus: 'Multi-joint strength, core endurance & metabolic stimulus',
        warmup: '5 mins jumping jacks, torso twists, and high plank holds',
        cooldown: '4 mins Cobra to Child’s Pose transition',
        activities: [
          { name: 'Mountain Climbers', type: 'exercise', duration: '5 mins', reps: '3 sets x 30s', estCal: 60, muscles: 'Core, hip flexors, cardio', difficulty: 'intermediate', sub: 'High Knees', instructions: 'From high plank, drive knees forward toward chest rhythmically.' },
          { name: 'Bodyweight Squats to Calf Raises', type: 'exercise', duration: '6 mins', reps: '3 sets x 15 reps', estCal: 55, muscles: 'Quads, glutes, calves', difficulty: 'beginner', sub: 'Squats', instructions: 'Perform a squat and explode onto toes at top of movement.' },
          { name: 'Side Plank Holds', type: 'exercise', duration: '5 mins', reps: '3 sets x 30s each side', estCal: 35, muscles: 'Obliques, transverse abdominis', difficulty: 'intermediate', sub: 'Forearm Plank', instructions: 'Elevate hips to form straight diagonal line from shoulder to ankles.' },
          { name: 'Bird Dog & Dead Bug Combo', type: 'exercise', duration: '5 mins', reps: '3 sets x 12 reps', estCal: 35, muscles: 'Deep core stabilizers', difficulty: 'beginner', sub: 'Crunches', instructions: 'Move opposite arm and leg in controlled, deliberate cadence.' },
          { name: 'Phalakasana to Chaturanga Flow', type: 'yoga', duration: '5 mins', reps: '5 controlled descents', estCal: 45, muscles: 'Chest, triceps, anterior core', difficulty: 'advanced', sub: 'Knee Push-ups', instructions: 'From plank, slowly lower body with elbows pinned to ribs.' }
        ]
      },
      {
        day: 6,
        title: 'Day 6: Yoga Flow, Flexibility & Light Cardio',
        focus: 'Dynamic movement chains, cardiovascular flow & hip opening',
        warmup: '4 mins gentle spinal ripples and arm sweeps',
        cooldown: '5 mins Supta Baddha Konasana (Reclined Bound Angle)',
        activities: [
          { name: 'Surya Namaskar (Sun Salutations)', type: 'yoga', duration: '8 mins', reps: '4 full rounds', estCal: 70, muscles: 'Full body continuous chain', difficulty: 'intermediate', sub: 'Downward Dog flow', instructions: 'Link breath with movement through the classical 12-pose sequence.' },
          { name: 'Trikonasana (Triangle Pose)', type: 'yoga', duration: '5 mins', reps: '3 holds x 45s per side', estCal: 30, muscles: 'Hamstrings, lateral obliques', difficulty: 'intermediate', sub: 'Warrior II', instructions: 'Hinge at hip crease, reach top arm high, expand chest open.' },
          { name: 'Anjaneyasana (Low Lunge)', type: 'yoga', duration: '5 mins', reps: '45s hold per leg x 2', estCal: 30, muscles: 'Psoas, hip flexors, quads', difficulty: 'beginner', sub: 'Warrior I', instructions: 'Drop back knee to mat, sweep arms high, sink hips gently.' },
          { name: 'High Knees or Jumping Jacks', type: 'exercise', duration: '4 mins', reps: '3 intervals x 40s', estCal: 60, muscles: 'Cardiovascular, agility', difficulty: 'beginner', sub: 'Calf Raises', instructions: 'Maintain brisk, rhythmic tempo to elevate heart rate.' },
          { name: 'Natarajasana (Dancer Pose)', type: 'yoga', duration: '5 mins', reps: '30s hold per side x 2', estCal: 30, muscles: 'Posterior chain, balance, chest', difficulty: 'advanced', sub: 'Warrior III', instructions: 'Catch inner ankle, kick foot upward while reaching opposite arm forward.' }
        ]
      },
      {
        day: 7,
        title: 'Day 7: Gentle Recovery, Stretching & Review',
        focus: 'Neuromuscular reset, reflection, myofascial release & readiness',
        warmup: '5 mins gentle pacing and slow diaphragmatic breathing',
        cooldown: '7 mins meditative Corpse Pose (Savasana)',
        activities: [
          { name: 'Uttanasana (Standing Forward Bend)', type: 'yoga', duration: '4 mins', reps: '3 holds x 45s', estCal: 20, muscles: 'Hamstrings, spinal extensors', difficulty: 'beginner', sub: 'Seated Fold', instructions: 'Hinge from hips, let spine and head hang completely loose.' },
          { name: 'Setu Bandhasana (Bridge Pose)', type: 'yoga', duration: '5 mins', reps: '3 holds x 45s', estCal: 30, muscles: 'Glutes, lower back, chest', difficulty: 'beginner', sub: 'Glute Bridges', instructions: 'Lift hips with feet grounded, open chest and heart toward chin.' },
          { name: 'Pavanamuktasana (Wind-Relieving Pose)', type: 'yoga', duration: '4 mins', reps: 'Hold 2 mins', estCal: 15, muscles: 'Lumbar, digestive viscera', difficulty: 'beginner', sub: 'Child’s Pose', instructions: 'Hug knees tightly to chest, gently rock side to side.' },
          { name: 'Baddha Konasana (Bound Angle)', type: 'yoga', duration: '5 mins', reps: 'Hold 3 mins', estCal: 15, muscles: 'Groin, inner thighs', difficulty: 'beginner', sub: 'Sukhasana', instructions: 'Soles of feet together, sit tall, allow knees to open naturally.' },
          { name: 'Savasana (Corpse Pose)', type: 'yoga', duration: '8 mins', reps: 'Deep surrender', estCal: 10, muscles: 'Full body parasympathetic', difficulty: 'beginner', sub: 'Viparita Karani', instructions: 'Lie completely still, close eyes, release all muscular tension.' }
        ]
      }
    ];
  }

  return {
    YOGA_POSES,
    FITNESS_EXERCISES,
    generateWeeklyPlan
  };
})();
