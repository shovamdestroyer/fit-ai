// public/js/dashboard.js
// Home Dashboard, Consistency Tracking & Native Canvas Analytics Charts

const Dashboard = (() => {
  // Render Dashboard Overview
  function render() {
    const profile = Auth.loadProfile() || {};
    const nameEl = document.getElementById('dash-user-name');
    if (nameEl) nameEl.textContent = profile.name || 'Athlete';

    // 1. Calorie & Macro Calculations
    const bmr = Calories.calculateBMR(profile.weight || 70, profile.height || 175, profile.age || 26, profile.sex || 'male');
    const tdee = Calories.calculateTDEE(bmr, profile.activity_level || 'moderate');
    const targetCalc = Calories.calculateTargets(tdee, profile.fitness_goal || 'fat_loss', profile.sex || 'male', profile.age || 26);
    const targetCalories = targetCalc.targetCalories;

    const nutrientTotals = Nutrition.getDailyNutrientTotals();
    const consumedCalories = nutrientTotals.calories;
    const remainingCalories = Math.max(0, targetCalories - consumedCalories);
    const calPercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

    // Update Calorie Card UI
    const targetCalEl = document.getElementById('dash-cal-target');
    const consumedCalEl = document.getElementById('dash-cal-consumed');
    const remainCalEl = document.getElementById('dash-cal-remaining');
    const calBarEl = document.getElementById('dash-cal-bar');

    if (targetCalEl) targetCalEl.textContent = targetCalories.toLocaleString();
    if (consumedCalEl) consumedCalEl.textContent = consumedCalories.toLocaleString();
    if (remainCalEl) remainCalEl.textContent = remainingCalories.toLocaleString();
    if (calBarEl) calBarEl.style.width = `${calPercent}%`;

    // Update Macros
    const macrosTarget = Calories.calculateMacros(targetCalories, profile.weight || 70, profile.fitness_goal || 'fat_loss');
    updateMacroPill('dash-macro-protein', nutrientTotals.protein, macrosTarget.protein.grams, 'g');
    updateMacroPill('dash-macro-carbs', nutrientTotals.carbs, macrosTarget.carbs.grams, 'g');
    updateMacroPill('dash-macro-fat', nutrientTotals.fat, macrosTarget.fat.grams, 'g');

    // 2. Hydration Snapshot
    const waterTarget = Water.getDailyTarget();
    const waterConsumed = Water.getTodayTotal();
    const waterPercent = Math.min(100, Math.round((waterConsumed / waterTarget) * 100));

    const waterAmountEl = document.getElementById('dash-water-amount');
    const waterTargetEl = document.getElementById('dash-water-target');
    const waterBarEl = document.getElementById('dash-water-bar');
    if (waterAmountEl) waterAmountEl.textContent = `${waterConsumed} ml`;
    if (waterTargetEl) waterTargetEl.textContent = `${waterTarget} ml`;
    if (waterBarEl) waterBarEl.style.width = `${waterPercent}%`;

    // 3. Weight Goal Snapshot
    const currentWeightEl = document.getElementById('dash-weight-current');
    const targetWeightEl = document.getElementById('dash-weight-target');
    const bmiValueEl = document.getElementById('dash-bmi-val');
    const bmiBadgeEl = document.getElementById('dash-bmi-badge');

    if (currentWeightEl) currentWeightEl.textContent = `${profile.weight || '--'} kg`;
    if (targetWeightEl) targetWeightEl.textContent = `${profile.target_weight || '--'} kg`;

    const bmiData = Calories.calculateBMI(profile.weight, profile.height);
    if (bmiData && bmiValueEl && bmiBadgeEl) {
      bmiValueEl.textContent = bmiData.bmi;
      bmiBadgeEl.textContent = bmiData.category;
      bmiBadgeEl.style.color = bmiData.color;
    }

    // 4. Today's 5 Planned Activities
    renderTodayWorkoutActivities();

    // 5. Render Canvas Analytics Charts
    renderWeightChart();
    renderConsistencyChart();
  }

  function updateMacroPill(elementId, consumed, target, unit) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
        <span style="font-weight:600; text-transform:capitalize;">${elementId.replace('dash-macro-', '')}</span>
        <span style="color:var(--text-secondary);">${consumed} / ${target}${unit}</span>
      </div>
      <div class="progress-bar-bg" style="height:6px;">
        <div class="progress-bar-fill fill-lime" style="width:${pct}%"></div>
      </div>
    `;
  }

  // Render Today's 5 Activities on Home Screen
  function renderTodayWorkoutActivities() {
    const container = document.getElementById('dash-today-activities');
    if (!container) return;

    const weeklyPlan = Workouts.generateWeeklyPlan();
    // Default to day 1 or current day of week (1..7)
    const todayIndex = new Date().getDay() || 7; // 1 = Monday ... 7 = Sunday
    const dayPlan = weeklyPlan[todayIndex - 1] || weeklyPlan[0];

    const titleEl = document.getElementById('dash-plan-title');
    if (titleEl) titleEl.textContent = dayPlan.title;

    let html = '';
    dayPlan.activities.forEach((act, idx) => {
      const isComplete = localStorage.getItem(`workout_act_${dayPlan.day}_${idx}`) === 'done';
      html += `
        <div class="glass-card" style="padding:14px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; border-left: 3px solid ${isComplete ? 'var(--accent-lime)' : 'var(--border-subtle)'};">
          <div style="display:flex; align-items:center; gap:12px;">
            <input type="checkbox" id="chk_dash_${dayPlan.day}_${idx}" ${isComplete ? 'checked' : ''} onchange="Dashboard.toggleActivity(${dayPlan.day}, ${idx})" style="width:20px; height:20px; accent-color:var(--accent-lime); cursor:pointer;">
            <div>
              <div style="font-weight:700; font-size:0.95rem; color:${isComplete ? 'var(--accent-lime)' : 'var(--text-primary)'};">${act.name}</div>
              <div style="font-size:0.78rem; color:var(--text-secondary);">${act.duration} • ${act.reps} • ~${act.estCal} kcal</div>
            </div>
          </div>
          <div>
            ${act.type === 'yoga' ? `
              <button class="btn btn-outline-lime btn-sm" onclick="App.startYogaPoseByName('${act.name}')">
                🧘 Track AI
              </button>
            ` : `
              <span class="badge-difficulty diff-${act.difficulty}">${act.difficulty}</span>
            `}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function toggleActivity(day, idx) {
    const key = `workout_act_${day}_${idx}`;
    const current = localStorage.getItem(key);
    if (current === 'done') {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, 'done');
      App.showToast('Activity completed! Great consistency! 🔥');
    }
    renderTodayWorkoutActivities();
  }

  // Native Lightweight Canvas Chart for Weight Progress
  function renderWeightChart() {
    const canvas = document.getElementById('chart-weight');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth || 320;
    const h = canvas.height = 160;

    ctx.clearRect(0, 0, w, h);

    // Mock recent 7 points + current profile weight
    const profile = Auth.loadProfile() || {};
    const curW = profile.weight || 74;
    const data = [curW + 1.8, curW + 1.4, curW + 1.1, curW + 0.9, curW + 0.6, curW + 0.2, curW];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

    const min = Math.min(...data) - 1;
    const max = Math.max(...data) + 1;
    const range = max - min;

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const y = 20 + (i * (h - 50) / 2);
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(w - 15, y);
      ctx.stroke();
    }

    // Draw Line Graph
    const points = data.map((val, i) => {
      const x = 35 + (i * ((w - 60) / (data.length - 1)));
      const y = (h - 30) - (((val - min) / range) * (h - 60));
      return { x, y, val };
    });

    // Gradient fill under curve
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(16, 231, 89, 0.3)');
    grad.addColorStop(1, 'rgba(16, 231, 89, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, h - 25);
    ctx.lineTo(points[0].x, h - 25);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#10e759';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dots and Labels
    points.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#10e759';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[idx], p.x, h - 8);
    });
  }

  // Native Lightweight Canvas Bar Chart for 7-Day Consistency
  function renderConsistencyChart() {
    const canvas = document.getElementById('chart-consistency');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth || 320;
    const h = canvas.height = 140;

    ctx.clearRect(0, 0, w, h);

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const values = [5, 4, 5, 5, 4, 5, 3]; // Exercises completed out of 5
    const barWidth = 24;
    const spacing = (w - 40) / days.length;

    days.forEach((day, i) => {
      const x = 25 + (i * spacing);
      const val = values[i];
      const maxVal = 5;
      const barHeight = (val / maxVal) * (h - 45);
      const y = (h - 25) - barHeight;

      // Bar Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(x, 15, barWidth, h - 40, 6);
      ctx.fill();

      // Bar Fill
      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, '#10e759');
      grad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 6);
      ctx.fill();

      // Label
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day, x + (barWidth / 2), h - 8);
    });
  }

  return {
    render,
    toggleActivity
  };
})();
