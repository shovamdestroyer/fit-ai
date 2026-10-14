// public/js/app.js
// Main Application Controller, Router, Event Handlers & Lifecycle

const App = (() => {
  let activeScreen = 'welcome';
  let deferredPrompt = null;

  // Screen List
  const SCREENS = [
    'welcome', 'auth', 'onboarding', 'dashboard',
    'yoga', 'workouts', 'nutrition', 'water',
    'sathi', 'progress', 'profile'
  ];

  // Protected Screens that require authentication
  const PROTECTED_SCREENS = [
    'dashboard', 'yoga', 'workouts', 'nutrition',
    'water', 'sathi', 'progress', 'profile'
  ];

  // 1. App Initialization
  function init() {
    registerServiceWorker();
    setupEventListeners();
    setupPWAInstall();

    // Check initial route
    const hash = window.location.hash.replace('#', '') || 'welcome';
    navigateTo(hash);
  }

  // 2. Navigation & Router
  function navigateTo(screenName) {
    if (!SCREENS.includes(screenName)) {
      screenName = 'welcome';
    }

    // Auth Guard
    if (PROTECTED_SCREENS.includes(screenName) && !Auth.isAuthenticated()) {
      showToast('Please log in or try Guest Demo mode to access fitness features.', 'warning');
      screenName = 'auth';
    }

    // Check if onboarding is needed
    if (Auth.isAuthenticated() && screenName === 'dashboard') {
      const profile = Auth.loadProfile();
      if (!profile || !profile.onboardingComplete) {
        screenName = 'onboarding';
      }
    }

    activeScreen = screenName;
    window.location.hash = `#${screenName}`;

    // Hide all screens, show active
    document.querySelectorAll('.app-screen').forEach(el => {
      el.classList.remove('active');
    });

    const targetEl = document.getElementById(`screen-${screenName}`);
    if (targetEl) targetEl.classList.add('active');

    // Update Bottom Nav
    updateNavState(screenName);

    // Screen specific triggers
    onScreenEnter(screenName);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateNavState(screenName) {
    const bottomNav = document.getElementById('bottom-nav');
    if (!bottomNav) return;

    if (['welcome', 'auth', 'onboarding'].includes(screenName)) {
      bottomNav.style.display = 'none';
    } else {
      bottomNav.style.display = 'flex';
    }

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.screen === screenName) {
        item.classList.add('active');
      }
    });
  }

  function onScreenEnter(screenName) {
    switch (screenName) {
      case 'dashboard':
        Dashboard.render();
        break;
      case 'yoga':
        renderYogaPoseLibrary();
        break;
      case 'workouts':
        renderWorkoutPlans();
        renderFitnessExercisesList();
        break;
      case 'nutrition':
        renderNutritionScreen();
        break;
      case 'water':
        renderWaterScreen();
        break;
      case 'sathi':
        const pane = document.getElementById('sathi-messages');
        if (pane && pane.children.length === 0) {
          SathiChat.appendWelcomeMessage();
        }
        break;
      case 'profile':
        renderProfileScreen();
        break;
    }
  }

  // 3. Setup Global UI Event Listeners
  function setupEventListeners() {
    // Hash change handler
    window.addEventListener('hashchange', () => {
      const screen = window.location.hash.replace('#', '');
      if (screen && screen !== activeScreen) {
        navigateTo(screen);
      }
    });

    // Bottom Navigation click
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const screen = item.dataset.screen;
        if (screen) navigateTo(screen);
      });
    });

    // Quick Action chips in SATHI
    document.querySelectorAll('.sathi-action-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (query) {
          const input = document.getElementById('sathi-input-field');
          if (input) input.value = query;
          sendSathiMessage();
        }
      });
    });

    // Enter key in SATHI input
    const sathiInput = document.getElementById('sathi-input-field');
    if (sathiInput) {
      sathiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendSathiMessage();
        }
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close, .btn-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        closeAllModals();
      });
    });
  }

  // 4. SATHI Chat Actions
  function sendSathiMessage() {
    const input = document.getElementById('sathi-input-field');
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = '';
    SathiChat.sendMessage(text);
  }

  function askSathiFromAnywhere(query) {
    navigateTo('sathi');
    setTimeout(() => {
      SathiChat.sendMessage(query);
    }, 200);
  }

  // 5. Yoga Tracker Controls
  async function startLiveYogaSession(poseId) {
    const videoEl = document.getElementById('yoga-video-feed');
    const canvasEl = document.getElementById('yoga-canvas-feed');
    const statusBanner = document.getElementById('yoga-status-banner');
    const feedbackText = document.getElementById('yoga-feedback-text');
    const hudBadge = document.getElementById('yoga-hud-status');
    const timerEl = document.getElementById('yoga-hold-timer');

    if (!videoEl || !canvasEl) return;

    document.getElementById('yoga-camera-view').style.display = 'block';
    document.getElementById('yoga-library-view').style.display = 'none';

    const result = await PoseTracker.startSession(poseId, videoEl, canvasEl, (status) => {
      if (statusBanner) {
        statusBanner.className = `camera-feedback-banner ${status.status === 'correct' ? 'correct' : ''}`;
      }
      if (feedbackText) feedbackText.textContent = status.message;
      if (hudBadge) {
        hudBadge.className = `hud-badge status-${status.status === 'correct' ? 'correct' : status.status === 'needs_adjustment' ? 'adjust' : 'unknown'}`;
        hudBadge.textContent = status.status === 'correct' ? '✓ Correct Alignment' : status.status === 'needs_adjustment' ? '⚡ Adjust Form' : '⚠ Step Into Frame';
      }
      if (timerEl) {
        timerEl.textContent = status.holdSeconds ? `${status.holdSeconds}s Held` : '0s Held';
      }
    });

    if (!result.success) {
      showToast(result.error, 'error');
    }
  }

  function stopLiveYogaSession() {
    const summary = PoseTracker.stopSession();
    document.getElementById('yoga-camera-view').style.display = 'none';
    document.getElementById('yoga-library-view').style.display = 'block';

    // Show Session Summary Modal
    const summaryModal = document.getElementById('modal-session-summary');
    if (summaryModal) {
      document.getElementById('summary-pose-name').textContent = summary.poseName;
      document.getElementById('summary-duration').textContent = `${Math.floor(summary.durationSeconds / 60)}m ${summary.durationSeconds % 60}s`;
      document.getElementById('summary-calories').textContent = `${summary.caloriesBurned} kcal`;
      document.getElementById('summary-accuracy').textContent = `${summary.accuracyScore}%`;
      summaryModal.classList.add('open');
    }
  }

  function startYogaPoseByName(poseName) {
    const pose = Workouts.YOGA_POSES.find(p => p.name === poseName || p.english === poseName || p.sanskrit === poseName) || Workouts.YOGA_POSES[0];
    navigateTo('yoga');
    setTimeout(() => {
      startLiveYogaSession(pose.id);
    }, 250);
  }

  // 6. Yoga Pose Library View
  function renderYogaPoseLibrary(filterCat = 'all', searchQuery = '') {
    const container = document.getElementById('yoga-poses-grid');
    if (!container) return;

    let poses = Workouts.YOGA_POSES;
    if (filterCat !== 'all') {
      poses = poses.filter(p => p.category === filterCat);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      poses = poses.filter(p => p.english.toLowerCase().includes(q) || p.sanskrit.toLowerCase().includes(q));
    }

    let html = '';
    poses.forEach(p => {
      html += `
        <div class="pose-card" onclick="App.startLiveYogaSession('${p.id}')">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
              <span class="badge-difficulty diff-${p.difficulty}">${p.difficulty}</span>
              <span style="font-size:0.75rem; color:var(--accent-teal); text-transform:capitalize;">${p.category}</span>
            </div>
            <h4 style="font-size:1.05rem; margin-bottom:2px;">${p.english}</h4>
            <div style="font-size:0.82rem; color:var(--accent-lime); font-style:italic; margin-bottom:8px;">${p.sanskrit}</div>
            <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4; margin-bottom:12px;">${p.target}</p>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:10px;">
            <span style="font-size:0.75rem; color:var(--text-muted);">Live AI Cam</span>
            <button class="btn btn-primary btn-sm" style="padding:4px 10px; font-size:0.75rem;">Start Pose</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // 7. Workouts & 7-Day Plans View
  function renderWorkoutPlans(selectedDay = 1) {
    const container = document.getElementById('workout-plan-container');
    if (!container) return;

    const weekly = Workouts.generateWeeklyPlan();
    const plan = weekly[selectedDay - 1] || weekly[0];

    let html = `
      <div class="glass-card highlight" style="margin-bottom:18px;">
        <h3 style="font-size:1.2rem; color:var(--accent-lime); margin-bottom:4px;">${plan.title}</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">Focus: ${plan.focus}</p>
        <div style="background:rgba(0,0,0,0.3); padding:10px 14px; border-radius:var(--radius-md); font-size:0.8rem; margin-bottom:8px;">
          <strong>🔥 Warm-Up:</strong> ${plan.warmup}
        </div>
        <div style="background:rgba(0,0,0,0.3); padding:10px 14px; border-radius:var(--radius-md); font-size:0.8rem;">
          <strong>❄️ Cooldown:</strong> ${plan.cooldown}
        </div>
      </div>
      <h4 style="margin-bottom:12px; font-size:1rem;">5 Planned Daily Activities</h4>
    `;

    plan.activities.forEach((act, idx) => {
      const isDone = localStorage.getItem(`workout_act_${plan.day}_${idx}`) === 'done';
      html += `
        <div class="glass-card" style="margin-bottom:12px; border-left: 3px solid ${isDone ? 'var(--accent-lime)' : 'var(--border-subtle)'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
            <div>
              <div style="font-size:0.75rem; color:var(--accent-teal); text-transform:uppercase; font-weight:700;">Activity ${idx + 1} • ${act.type}</div>
              <h4 style="font-size:1.05rem; color:${isDone ? 'var(--accent-lime)' : 'var(--text-primary)'};">${act.name}</h4>
            </div>
            <input type="checkbox" ${isDone ? 'checked' : ''} onchange="Dashboard.toggleActivity(${plan.day}, ${idx})" style="width:20px; height:20px; accent-color:var(--accent-lime); cursor:pointer;">
          </div>
          <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:10px;">${act.instructions}</p>
          <div style="display:flex; flex-wrap:wrap; gap:12px; font-size:0.78rem; color:var(--text-muted); align-items:center;">
            <span>⏱ ${act.duration}</span>
            <span>🔄 ${act.reps}</span>
            <span>🔥 ~${act.estCal} kcal</span>
            <span>🎯 ${act.muscles}</span>
            ${act.sub ? `<span style="color:var(--accent-warning);">⚡ Alt: ${act.sub}</span>` : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderFitnessExercisesList() {
    const container = document.getElementById('fitness-exercises-grid');
    if (!container) return;

    let html = '';
    Workouts.FITNESS_EXERCISES.forEach(ex => {
      html += `
        <div class="glass-card" style="padding:16px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <h4 style="font-size:1rem;">${ex.name}</h4>
            <span class="badge-difficulty diff-${ex.difficulty}">${ex.difficulty}</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:10px;">${ex.instructions}</p>
          <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
            <span>🎯 ${ex.target}</span>
            <span>${ex.sets} Sets • ${ex.defaultReps ? ex.defaultReps + ' Reps' : ex.defaultDuration + 's'}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // 8. Nutrition Screen (Calculator, Meal Plan & Food Logger)
  function renderNutritionScreen() {
    renderCalorieCalculatorInputs();
    renderMealPlan();
    renderFoodLogger();
  }

  function renderCalorieCalculatorInputs() {
    const profile = Auth.loadProfile() || { age: 26, weight: 70, height: 175, sex: 'male', activity_level: 'moderate', fitness_goal: 'fat_loss' };
    const ageEl = document.getElementById('calc-age');
    const weightEl = document.getElementById('calc-weight');
    const heightEl = document.getElementById('calc-height');
    const sexEl = document.getElementById('calc-sex');
    const actEl = document.getElementById('calc-activity');
    const goalEl = document.getElementById('calc-goal');

    if (ageEl) ageEl.value = profile.age || 26;
    if (weightEl) weightEl.value = profile.weight || 70;
    if (heightEl) heightEl.value = profile.height || 175;
    if (sexEl) sexEl.value = profile.sex || 'male';
    if (actEl) actEl.value = profile.activity_level || 'moderate';
    if (goalEl) goalEl.value = profile.fitness_goal || 'fat_loss';

    calculateAndDisplayNutrition();
  }

  function calculateAndDisplayNutrition() {
    const age = parseInt(document.getElementById('calc-age')?.value) || 26;
    const weight = parseFloat(document.getElementById('calc-weight')?.value) || 70;
    const height = parseFloat(document.getElementById('calc-height')?.value) || 175;
    const sex = document.getElementById('calc-sex')?.value || 'male';
    const activity = document.getElementById('calc-activity')?.value || 'moderate';
    const goal = document.getElementById('calc-goal')?.value || 'fat_loss';

    const bmr = Calories.calculateBMR(weight, height, age, sex);
    const tdee = Calories.calculateTDEE(bmr, activity);
    const targets = Calories.calculateTargets(tdee, goal, sex, age);
    const macros = Calories.calculateMacros(targets.targetCalories, weight, goal);

    document.getElementById('res-bmr').textContent = `${bmr} kcal`;
    document.getElementById('res-tdee').textContent = `${tdee} kcal`;
    document.getElementById('res-target').textContent = `${targets.targetCalories} kcal`;
    document.getElementById('res-goal-desc').textContent = targets.description;

    document.getElementById('res-protein').textContent = `${macros.protein.grams}g (${macros.protein.percent}%)`;
    document.getElementById('res-carbs').textContent = `${macros.carbs.grams}g (${macros.carbs.percent}%)`;
    document.getElementById('res-fat').textContent = `${macros.fat.grams}g (${macros.fat.percent}%)`;

    // Save updated calculations
    const profile = Auth.loadProfile() || {};
    profile.age = age;
    profile.weight = weight;
    profile.height = height;
    profile.sex = sex;
    profile.activity_level = activity;
    profile.fitness_goal = goal;
    Auth.saveProfile(profile);
  }

  function renderMealPlan(dietType = 'vegetarian') {
    const container = document.getElementById('meal-plan-cards');
    if (!container) return;

    const profile = Auth.loadProfile() || { fitness_goal: 'fat_loss' };
    const targetCal = parseInt(document.getElementById('res-target')?.textContent) || 2000;
    const plan = Nutrition.generateMealPlan(targetCal, dietType, profile.fitness_goal || 'fat_loss');

    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h4 style="font-size:1.1rem; color:var(--accent-lime);">${plan.title}</h4>
        <span style="font-size:0.85rem; font-weight:700;">Daily Total: ~${plan.dailyTotal.calories} kcal • ${plan.dailyTotal.protein}g Protein</span>
      </div>
    `;

    plan.meals.forEach(m => {
      html += `
        <div class="glass-card" style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid var(--border-subtle); padding-bottom:6px;">
            <strong style="color:var(--text-primary); font-size:0.95rem;">${m.name}</strong>
            <span style="font-size:0.82rem; color:var(--accent-lime); font-weight:700;">~${m.mealCal} kcal | ${m.mealProtein}g P</span>
          </div>
          <ul style="list-style:none; padding:0; margin-bottom:8px;">
            ${m.items.map(i => `
              <li style="display:flex; justify-content:space-between; font-size:0.85rem; padding:3px 0;">
                <span>${i.item} <span style="color:var(--text-muted);">(${i.portion})</span></span>
                <span style="color:var(--text-secondary);">${i.cal} kcal</span>
              </li>
            `).join('')}
          </ul>
          <div style="font-size:0.75rem; color:var(--text-muted); background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:var(--radius-sm);">
            💡 <strong>Alt:</strong> ${m.substitutions}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderFoodLogger() {
    const select = document.getElementById('food-select-db');
    if (select && select.options.length <= 1) {
      select.innerHTML = '<option value="">-- Choose from 30+ items --</option>' +
        Nutrition.FOOD_DATABASE.map(f => `<option value="${f.id}">${f.name} (${f.serving} - ${f.calories} kcal)</option>`).join('');
    }

    const container = document.getElementById('food-log-today-list');
    if (!container) return;

    const logs = Nutrition.getDailyFoodLogs();
    if (logs.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.85rem;">No meals logged yet today. Search or select a food above!</div>`;
      return;
    }

    let html = '';
    logs.forEach(item => {
      html += `
        <div class="glass-card" style="padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:0.9rem;">${item.name}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">${item.serving} • ${item.calories} kcal (P: ${item.protein}g, C: ${item.carbs}g, F: ${item.fat}g)</div>
          </div>
          <button class="btn btn-sm" onclick="App.deleteFoodLog('${item.id}')" style="background:rgba(239, 68, 68, 0.2); color:#f87171; padding:4px 8px;">✕</button>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function addFoodLogFromSelection() {
    const select = document.getElementById('food-select-db');
    const multiplierEl = document.getElementById('food-quantity-input');
    const mealTypeEl = document.getElementById('food-mealtype-input');

    const foodId = select?.value;
    const mult = parseFloat(multiplierEl?.value) || 1;
    const mealType = mealTypeEl?.value || 'lunch';

    if (!foodId) {
      showToast('Please select a food from the database.', 'warning');
      return;
    }

    const food = Nutrition.FOOD_DATABASE.find(f => f.id === foodId);
    if (food) {
      Nutrition.addFoodLog(food, mult, mealType);
      renderFoodLogger();
      showToast(`Logged ${food.name}!`);
    }
  }

  function deleteFoodLog(id) {
    Nutrition.removeFoodLog(id);
    renderFoodLogger();
    showToast('Removed entry.');
  }

  // 9. Water Tracker Screen
  function renderWaterScreen() {
    const target = Water.getDailyTarget();
    const consumed = Water.getTodayTotal();
    const percent = Math.min(100, Math.round((consumed / target) * 100));
    const remaining = Math.max(0, target - consumed);

    const amountEl = document.getElementById('water-screen-amount');
    const targetEl = document.getElementById('water-screen-target');
    const remainEl = document.getElementById('water-screen-remain');
    const circleEl = document.getElementById('water-svg-circle');

    if (amountEl) amountEl.textContent = `${consumed} ml`;
    if (targetEl) targetEl.textContent = `${target} ml`;
    if (remainEl) remainEl.textContent = `${remaining} ml`;

    if (circleEl) {
      const circumference = 2 * Math.PI * 70; // radius = 70
      const offset = circumference - (percent / 100) * circumference;
      circleEl.style.strokeDashoffset = offset;
    }

    // Render Water Logs
    const listEl = document.getElementById('water-logs-list');
    if (listEl) {
      const logs = Water.getTodayLogs();
      if (logs.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:0.85rem;">No water entries logged yet today.</div>`;
      } else {
        listEl.innerHTML = logs.map(l => `
          <div class="glass-card" style="padding:10px 14px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:0.9rem;">+${l.amount} ml</strong>
              <span style="font-size:0.75rem; color:var(--text-secondary); margin-left:8px;">${l.time}</span>
            </div>
            <button class="btn btn-sm" onclick="App.deleteWaterLog('${l.id}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">✕</button>
          </div>
        `).join('');
      }
    }
  }

  function addWaterQuick(amount) {
    Water.addWater(amount);
    renderWaterScreen();
    showToast(`Added ${amount} ml of water! 💧`);
  }

  function addWaterCustom() {
    const input = document.getElementById('water-custom-input');
    const val = parseInt(input?.value);
    if (val && val > 0) {
      Water.addWater(val);
      if (input) input.value = '';
      renderWaterScreen();
      showToast(`Added ${val} ml! 💧`);
    }
  }

  function deleteWaterLog(id) {
    Water.removeLog(id);
    renderWaterScreen();
  }

  // 10. Profile & Settings Screen
  function renderProfileScreen() {
    const profile = Auth.loadProfile() || {};
    const user = Auth.getCurrentUser() || {};

    const nameEl = document.getElementById('prof-name');
    const emailEl = document.getElementById('prof-email');
    const goalEl = document.getElementById('prof-goal');
    const weightEl = document.getElementById('prof-weight');

    if (nameEl) nameEl.textContent = profile.name || user.name || 'Athlete';
    if (emailEl) emailEl.textContent = user.email || 'athlete@fitai.local';
    if (goalEl) goalEl.textContent = (profile.fitness_goal || 'fat_loss').replace('_', ' ').toUpperCase();
    if (weightEl) weightEl.textContent = `${profile.weight || 70} kg`;
  }

  // 11. Modal & Notification System
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
    toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✨'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // 12. PWA Registration
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('✅ FitAI ServiceWorker registered.'))
        .catch(err => console.warn('ServiceWorker registration error:', err));
    }
  }

  function setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const btn = document.getElementById('btn-pwa-install');
      if (btn) btn.style.display = 'inline-flex';
    });
  }

  function triggerPWAInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        const btn = document.getElementById('btn-pwa-install');
        if (btn) btn.style.display = 'none';
      });
    } else {
      showToast('FitAI Coach is already installed or ready in browser menu!', 'success');
    }
  }

  return {
    init,
    navigateTo,
    sendSathiMessage,
    askSathiFromAnywhere,
    startLiveYogaSession,
    stopLiveYogaSession,
    startYogaPoseByName,
    renderYogaPoseLibrary,
    renderWorkoutPlans,
    calculateAndDisplayNutrition,
    renderMealPlan,
    addFoodLogFromSelection,
    deleteFoodLog,
    addWaterQuick,
    addWaterCustom,
    deleteWaterLog,
    showToast,
    closeAllModals,
    triggerPWAInstall
  };
})();

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
