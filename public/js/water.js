// public/js/water.js
// Daily Hydration Tracker with Animated Ring, Log History & Reminders

const Water = (() => {
  const WATER_LOGS_KEY = 'fitai_water_logs';
  const TARGET_KEY = 'fitai_water_target';

  function getDailyTarget() {
    const saved = localStorage.getItem(TARGET_KEY);
    if (saved) return parseInt(saved);

    const profile = Auth.loadProfile();
    if (profile && profile.weight) {
      // 35ml per kg baseline, adjusted for activity
      const baseline = Math.round(profile.weight * 35);
      return Math.max(2000, Math.min(4500, baseline));
    }
    return 2800; // Default 2.8 Liters
  }

  function setDailyTarget(targetMl) {
    if (targetMl && targetMl > 500) {
      localStorage.setItem(TARGET_KEY, targetMl.toString());
    }
  }

  function getTodayLogs(dateStr = new Date().toISOString().split('T')[0]) {
    try {
      const all = JSON.parse(localStorage.getItem(WATER_LOGS_KEY) || '[]');
      return all.filter(l => l.date === dateStr);
    } catch (e) {
      return [];
    }
  }

  function getTodayTotal(dateStr = new Date().toISOString().split('T')[0]) {
    const logs = getTodayLogs(dateStr);
    return logs.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  function addWater(amountMl) {
    const amount = parseInt(amountMl);
    if (isNaN(amount) || amount <= 0) return null;

    const today = new Date().toISOString().split('T')[0];
    const logItem = {
      id: 'water_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      date: today,
      amount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const all = JSON.parse(localStorage.getItem(WATER_LOGS_KEY) || '[]');
    all.unshift(logItem);
    localStorage.setItem(WATER_LOGS_KEY, JSON.stringify(all));

    // Async server sync
    const token = Auth.getAuthToken();
    if (token) {
      fetch('/api/profile/water-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount_ml: amount })
      }).catch(e => console.warn('Water log sync pending offline:', e));
    }

    return logItem;
  }

  function removeLog(id) {
    const all = JSON.parse(localStorage.getItem(WATER_LOGS_KEY) || '[]');
    const filtered = all.filter(l => l.id !== id);
    localStorage.setItem(WATER_LOGS_KEY, JSON.stringify(filtered));
  }

  // Request browser notification permission for water reminders
  async function requestReminderPermission() {
    if (!('Notification' in window)) {
      return { supported: false, status: 'unsupported' };
    }
    const perm = await Notification.requestPermission();
    return { supported: true, status: perm };
  }

  function scheduleHydrationReminder() {
    if ('Notification' in window && Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification('💧 Hydration Check — FitAI Coach', {
          body: 'Time to drink a glass of water (250 ml) to maintain your metabolic rate and focus!',
          icon: '/assets/icons/icon-192.png'
        });
      }, 7200000); // 2 hours
    }
  }

  return {
    getDailyTarget,
    setDailyTarget,
    getTodayLogs,
    getTodayTotal,
    addWater,
    removeLog,
    requestReminderPermission,
    scheduleHydrationReminder
  };
})();
