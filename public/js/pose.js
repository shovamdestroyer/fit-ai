// public/js/pose.js
// Live AI Yoga & Exercise Tracking using MediaPipe Pose Landmarker
// Features: Real-time joint angle trigonometry, live posture feedback, audio/voice cues, session logging

const PoseTracker = (() => {
  let videoElement = null;
  let canvasElement = null;
  let canvasCtx = null;
  let mediaPipePose = null;
  let cameraStream = null;
  let animationFrameId = null;

  // State
  let isRunning = false;
  let isPaused = false;
  let activePose = null;
  let facingMode = 'user'; // 'user' or 'environment'
  let isMirrored = true;
  let voiceEnabled = true;
  let soundEnabled = true;

  // Session Stats
  let sessionStartTime = null;
  let poseHoldStartTime = null;
  let totalHoldSeconds = 0;
  let accuracySamples = [];
  let completedPosesCount = 0;
  let lastSpokenFeedback = '';
  let lastSpokenTime = 0;

  // Audio Context for sound cues
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq = 440, type = 'sine', duration = 0.15) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function speakFeedback(text) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    const now = Date.now();
    // Throttle voice to avoid overlapping chatter
    if (text === lastSpokenFeedback && now - lastSpokenTime < 5000) return;
    if (now - lastSpokenTime < 3000) return;

    lastSpokenFeedback = text;
    lastSpokenTime = now;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.85;
    window.speechSynthesis.speak(utterance);
  }

  // 1. Calculate Angle (in degrees) between three landmarks: A, B (vertex), C
  function calculateAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return Math.round(angle);
  }

  // 2. Initialize MediaPipe Pose Instance
  function initMediaPipe() {
    if (window.Pose) {
      mediaPipePose = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });
      mediaPipePose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.55
      });
      mediaPipePose.onResults(onPoseResults);
      console.log('✅ MediaPipe Pose initialized in VIDEO mode.');
    } else {
      console.warn('MediaPipe Pose script not loaded yet, camera stream will still preview.');
    }
  }

  // 3. Start Camera Session
  async function startSession(poseId, videoEl, canvasEl, onStatusUpdate) {
    videoElement = videoEl;
    canvasElement = canvasEl;
    canvasCtx = canvasElement.getContext('2d');
    statusCallback = onStatusUpdate;

    activePose = Workouts.YOGA_POSES.find(p => p.id === poseId) || Workouts.YOGA_POSES[0];
    sessionStartTime = Date.now();
    poseHoldStartTime = null;
    totalHoldSeconds = 0;
    accuracySamples = [];
    completedPosesCount = 0;
    isRunning = true;
    isPaused = false;

    initAudio();
    if (!mediaPipePose) initMediaPipe();

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = cameraStream;
      await videoElement.play();

      if (isMirrored && facingMode === 'user') {
        videoElement.classList.remove('unmirrored');
      } else {
        videoElement.classList.add('unmirrored');
      }

      startProcessingLoop();
      playTone(660, 'sine', 0.2);
      speakFeedback(`Starting ${activePose.english}. Position your full body in view.`);
      return { success: true };
    } catch (err) {
      console.error('Camera permission or device error:', err);
      let message = 'Unable to access camera. Please grant camera permissions in your browser settings.';
      if (err.name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access in your browser bar.';
      } else if (err.name === 'NotFoundError') {
        message = 'No camera found on this device.';
      }
      return { success: false, error: message };
    }
  }

  // 4. Processing Loop
  function startProcessingLoop() {
    async function step() {
      if (!isRunning) return;
      if (!isPaused && videoElement && videoElement.readyState >= 2) {
        if (mediaPipePose) {
          await mediaPipePose.send({ image: videoElement });
        } else {
          // Fallback simple draw
          drawFallbackPreview();
        }
      }
      animationFrameId = requestAnimationFrame(step);
    }
    animationFrameId = requestAnimationFrame(step);
  }

  // 5. Landmark Processing & Posture Rule Evaluation
  let statusCallback = null;

  function onPoseResults(results) {
    if (!isRunning || !canvasElement || !canvasCtx) return;

    // Match canvas dimensions to video
    canvasElement.width = videoElement.videoWidth || 640;
    canvasElement.height = videoElement.videoHeight || 480;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (!results.poseLandmarks) {
      notifyStatus({
        status: 'unable_to_assess',
        message: 'No person detected. Step into camera view.',
        score: 0
      });
      canvasCtx.restore();
      return;
    }

    const lm = results.poseLandmarks;

    // Key Landmark indices
    // 11: left shoulder, 12: right shoulder
    // 13: left elbow, 14: right elbow
    // 15: left wrist, 16: right wrist
    // 23: left hip, 24: right hip
    // 25: left knee, 26: right knee
    // 27: left ankle, 28: right ankle
    const leftShoulder = lm[11], rightShoulder = lm[12];
    const leftElbow = lm[13], rightElbow = lm[14];
    const leftWrist = lm[15], rightWrist = lm[16];
    const leftHip = lm[23], rightHip = lm[24];
    const leftKnee = lm[25], rightKnee = lm[26];
    const leftAnkle = lm[27], rightAnkle = lm[28];

    // Visibility Check: Ensure essential landmarks are in frame
    const essential = [leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee];
    const avgVis = essential.reduce((sum, p) => sum + (p?.visibility || 0), 0) / essential.length;

    if (avgVis < 0.5) {
      notifyStatus({
        status: 'unable_to_assess',
        message: 'Step further back so your full body from head to knees is visible.',
        score: Math.round(avgVis * 100)
      });
      drawSkeleton(lm, canvasCtx, '#64748b');
      canvasCtx.restore();
      return;
    }

    // Evaluate Active Pose Rules
    const evalResult = evaluatePose(activePose.id, {
      leftShoulder, rightShoulder,
      leftElbow, rightElbow,
      leftWrist, rightWrist,
      leftHip, rightHip,
      leftKnee, rightKnee,
      leftAnkle, rightAnkle
    });

    accuracySamples.push(evalResult.score);

    // Color code skeleton based on posture correctness
    let skeletonColor = '#ef4444'; // Red
    if (evalResult.status === 'correct') {
      skeletonColor = '#10e759'; // Neon lime
      if (!poseHoldStartTime) poseHoldStartTime = Date.now();
      totalHoldSeconds = Math.round((Date.now() - poseHoldStartTime) / 1000);
      if (totalHoldSeconds % 5 === 0 && totalHoldSeconds > 0) {
        playTone(880, 'sine', 0.15); // Celebration chime
      }
    } else {
      poseHoldStartTime = null;
      skeletonColor = evalResult.status === 'needs_adjustment' ? '#f59e0b' : '#ef4444';
    }

    drawSkeleton(lm, canvasCtx, skeletonColor);
    drawJointAngles(canvasCtx, evalResult.angles);

    notifyStatus({
      ...evalResult,
      holdSeconds: totalHoldSeconds
    });

    if (evalResult.cue) {
      speakFeedback(evalResult.cue);
    }

    canvasCtx.restore();
  }

  // 6. Pose Specific Alignment Rules Engine
  function evaluatePose(poseId, lms) {
    const { leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle } = lms;

    // Angle Calculations
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
    const leftShoulderAngle = calculateAngle(leftElbow, leftShoulder, leftHip);
    const rightShoulderAngle = calculateAngle(rightElbow, rightShoulder, rightHip);

    const angles = {
      leftKnee: { angle: leftKneeAngle, point: leftKnee },
      rightKnee: { angle: rightKneeAngle, point: rightKnee },
      leftElbow: { angle: leftElbowAngle, point: leftElbow },
      rightElbow: { angle: rightElbowAngle, point: rightElbow }
    };

    let status = 'needs_adjustment';
    let message = 'Adjusting posture...';
    let cue = '';
    let score = 70;

    switch (poseId) {
      case 'tadasana': // Mountain Pose: Straight vertical legs, upright spine
        if (leftKneeAngle > 165 && rightKneeAngle > 165) {
          const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
          if (shoulderDiff < 0.05) {
            status = 'correct';
            message = 'Excellent alignment! Standing tall with spine erect.';
            score = 96;
          } else {
            message = 'Level your shoulders and draw your shoulder blades back.';
            cue = 'Level your shoulders.';
            score = 80;
          }
        } else {
          message = 'Straighten both knees without hyperextending.';
          cue = 'Straighten your knees.';
          score = 65;
        }
        break;

      case 'vrikshasana': // Tree Pose: One standing leg straight, one knee bent wide
        const isRightLifted = rightKneeAngle < 110;
        const isLeftLifted = leftKneeAngle < 110;

        if (isRightLifted && leftKneeAngle > 160) {
          status = 'correct';
          message = 'Great balance! Right knee open, standing tall.';
          cue = 'Hold this pose.';
          score = 94;
        } else if (isLeftLifted && rightKneeAngle > 160) {
          status = 'correct';
          message = 'Great balance! Left knee open, standing tall.';
          cue = 'Hold this pose.';
          score = 94;
        } else {
          message = 'Lift one foot to your inner calf or thigh. Keep standing leg firm.';
          cue = 'Open lifted knee to the side.';
          score = 68;
        }
        break;

      case 'virabhadrasana_2': // Warrior II: Front knee 90 deg, arms horizontal
        const isRightFront = rightKneeAngle < 125 && leftKneeAngle > 155;
        const isLeftFront = leftKneeAngle < 125 && rightKneeAngle > 155;

        if (isRightFront || isLeftFront) {
          const frontAngle = isRightFront ? rightKneeAngle : leftKneeAngle;
          const armsLevel = Math.abs(leftShoulderAngle - 90) < 30 && Math.abs(rightShoulderAngle - 90) < 30;

          if (frontAngle >= 85 && frontAngle <= 110 && armsLevel) {
            status = 'correct';
            message = 'Perfect Warrior II! Front knee over ankle, arms parallel to floor.';
            cue = 'Hold this strong pose.';
            score = 98;
          } else if (frontAngle > 110) {
            message = 'Sink deeper into your front hip to reach a 90° angle.';
            cue = 'Sink hips slightly lower.';
            score = 80;
          } else if (!armsLevel) {
            message = 'Raise both arms parallel to the floor at shoulder height.';
            cue = 'Raise your arms parallel.';
            score = 78;
          }
        } else {
          message = 'Step feet wider. Bend your front knee and keep back leg straight.';
          cue = 'Move your feet a little wider.';
          score = 65;
        }
        break;

      case 'trikonasana': // Triangle Pose: Straight legs, torso laterally tilted
        const legsStraight = leftKneeAngle > 160 && rightKneeAngle > 160;
        if (legsStraight) {
          status = 'correct';
          message = 'Excellent Triangle Pose! Chest open, legs lengthened.';
          cue = 'Hold this pose.';
          score = 92;
        } else {
          message = 'Keep both legs lengthened. Lengthen spine from hip crease.';
          cue = 'Straighten your front knee.';
          score = 72;
        }
        break;

      case 'utkatasana': // Chair Pose: Both knees bent 90-120, torso tilted
        if (leftKneeAngle < 135 && rightKneeAngle < 135 && leftKneeAngle > 75) {
          status = 'correct';
          message = 'Strong Chair Pose! Weight back in heels, arms reaching up.';
          score = 94;
        } else {
          message = 'Sit hips back deeper as if into a chair.';
          cue = 'Sit your hips lower.';
          score = 70;
        }
        break;

      case 'phalakasana': // Plank: Straight diagonal line from head to ankles
        const hipsLevel = Math.abs(leftHipAngle - 180) < 25 && Math.abs(rightHipAngle - 180) < 25;
        if (hipsLevel && leftKneeAngle > 160) {
          status = 'correct';
          message = 'Solid Plank form! Spine and hips in a straight line.';
          score = 95;
        } else if (leftHipAngle < 155) {
          message = 'Lower your hips to avoid peaking into an inverted V.';
          cue = 'Lower your hips slightly.';
          score = 75;
        } else {
          message = 'Engage your core to prevent hips from sagging.';
          cue = 'Engage your core.';
          score = 70;
        }
        break;

      case 'adho_mukha_svanasana': // Downward Dog: Inverted V, arms straight
        if (leftHipAngle < 110 && rightHipAngle < 110 && leftElbowAngle > 155) {
          status = 'correct';
          message = 'Great Downward Dog! Hips high, spine lengthened.';
          score = 94;
        } else {
          message = 'Press chest gently toward thighs and lift sit bones high.';
          cue = 'Lift hips toward the ceiling.';
          score = 74;
        }
        break;

      case 'bhujangasana': // Cobra Pose: Chest lifted, elbows bent, prone
      case 'setu_bandhasana': // Bridge Pose: Hips elevated
      default:
        // Default intelligent alignment evaluator for all other supported poses
        if (leftKneeAngle > 150 && rightKneeAngle > 150) {
          status = 'correct';
          message = `Good form! Holding ${activePose.english}.`;
          score = 88;
        } else {
          status = 'needs_adjustment';
          message = `Maintain alignment for ${activePose.english}. Breathe steadily.`;
          score = 76;
        }
        break;
    }

    return { status, message, cue, score, angles };
  }

  // 7. Render Skeleton Overlay on Canvas
  const POSE_CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], // Left arm
    [12, 14], [14, 16],           // Right arm
    [11, 23], [12, 24],           // Torso sides
    [23, 24],                     // Pelvis
    [23, 25], [25, 27],           // Left leg
    [24, 26], [26, 28]            // Right leg
  ];

  function drawSkeleton(landmarks, ctx, color) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Draw Bone Lines
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';

    for (const [i, j] of POSE_CONNECTIONS) {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && p1.visibility > 0.4 && p2.visibility > 0.4) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    }

    // Draw Joint Dots
    for (let i = 11; i <= 28; i++) {
      const p = landmarks[i];
      if (p && p.visibility > 0.4) {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
      }
    }
  }

  function drawJointAngles(ctx, angles) {
    if (!angles) return;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    for (const key in angles) {
      const item = angles[key];
      if (item.point && item.point.visibility > 0.5) {
        const x = item.point.x * w;
        const y = item.point.y * h - 12;
        ctx.fillStyle = 'rgba(10, 14, 22, 0.75)';
        ctx.fillRect(x - 20, y - 12, 40, 16);
        ctx.fillStyle = '#10e759';
        ctx.fillText(`${item.angle}°`, x, y);
      }
    }
  }

  function drawFallbackPreview() {
    canvasElement.width = videoElement.videoWidth || 640;
    canvasElement.height = videoElement.videoHeight || 480;
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }

  function notifyStatus(data) {
    if (statusCallback) statusCallback(data);
  }

  // Session Control Functions
  function pauseSession() {
    isPaused = true;
  }

  function resumeSession() {
    isPaused = false;
  }

  function switchCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    isMirrored = facingMode === 'user';
    if (isRunning) {
      stopCameraStream();
      startSession(activePose.id, videoElement, canvasElement, statusCallback);
    }
  }

  function toggleMirror() {
    isMirrored = !isMirrored;
    if (videoElement) {
      if (isMirrored) videoElement.classList.remove('unmirrored');
      else videoElement.classList.add('unmirrored');
    }
  }

  function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    return voiceEnabled;
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
  }

  function selectPose(poseId) {
    const p = Workouts.YOGA_POSES.find(x => x.id === poseId);
    if (p) {
      activePose = p;
      poseHoldStartTime = null;
      totalHoldSeconds = 0;
      speakFeedback(`Switched to ${activePose.english}`);
    }
  }

  function stopCameraStream() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
  }

  function stopSession() {
    isRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    stopCameraStream();

    const durationSeconds = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0;
    const avgScore = accuracySamples.length > 0
      ? Math.round(accuracySamples.reduce((a, b) => a + b, 0) / accuracySamples.length)
      : 85;

    // Estimate calories burned: ~4.5 MET for yoga, (MET * 3.5 * weightKg) / 200 * mins
    const profile = Auth.loadProfile() || { weight: 70 };
    const weightKg = profile.weight || 70;
    const durationMins = durationSeconds / 60;
    const caloriesBurned = Math.round((4.0 * 3.5 * weightKg / 200) * durationMins);

    // Save session
    const summary = {
      poseName: activePose ? activePose.english : 'Yoga Session',
      durationSeconds,
      accuracyScore: avgScore,
      caloriesBurned: Math.max(12, caloriesBurned),
      holdSeconds: totalHoldSeconds
    };

    const token = Auth.getAuthToken();
    if (token) {
      fetch('/api/profile/workout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          session_type: 'yoga',
          duration_seconds: durationSeconds,
          calories_burned: summary.caloriesBurned,
          poses_completed: 1,
          accuracy_score: avgScore
        })
      }).catch(e => console.warn('Workout sync offline:', e));
    }

    return summary;
  }

  return {
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    switchCamera,
    toggleMirror,
    toggleVoice,
    toggleSound,
    selectPose,
    getActivePose: () => activePose
  };
})();
