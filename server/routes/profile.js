// server/routes/profile.js
// Profile, Nutrition, Water, and Workout synchronization endpoints
const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/auth');

// In-memory persistent cache for sessions/demo users (synced to disk or Supabase if configured)
const store = {
  profiles: {},
  foodLogs: {},
  waterLogs: {},
  workoutPlans: {},
  workoutSessions: {},
  weightHistory: {}
};

// GET /api/profile
router.get('/', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const profile = store.profiles[userId] || {
    id: userId,
    name: req.user.name || 'Athlete',
    email: req.user.email,
    age: 26,
    sex: 'male',
    height: 175,
    weight: 70,
    target_weight: 68,
    unit_preference: 'metric',
    fitness_goal: 'fat_loss',
    activity_level: 'moderate',
    yoga_experience: 'intermediate',
    workout_experience: 'intermediate',
    dietary_preference: 'vegetarian',
    allergies: [],
    equipment: ['bodyweight', 'yoga_mat'],
    daily_duration: 30,
    health_limitations: ''
  };
  res.json({ profile });
});

// POST /api/profile
router.post('/', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  store.profiles[userId] = {
    ...(store.profiles[userId] || {}),
    ...data,
    id: userId,
    updated_at: new Date().toISOString()
  };
  res.json({ success: true, profile: store.profiles[userId] });
});

// GET /api/profile/today-stats
router.get('/today-stats', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  const userFoods = (store.foodLogs[userId] || []).filter(item => item.date === today);
  const userWater = (store.waterLogs[userId] || []).filter(item => item.date === today);
  const userSessions = (store.workoutSessions[userId] || []).filter(item => item.date === today);

  const totalCalories = userFoods.reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
  const totalProtein = userFoods.reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
  const totalCarbs = userFoods.reduce((acc, f) => acc + (Number(f.carbs) || 0), 0);
  const totalFat = userFoods.reduce((acc, f) => acc + (Number(f.fat) || 0), 0);

  const totalWater = userWater.reduce((acc, w) => acc + (Number(w.amount_ml) || 0), 0);

  res.json({
    date: today,
    caloriesConsumed: Math.round(totalCalories),
    proteinConsumed: Math.round(totalProtein),
    carbsConsumed: Math.round(totalCarbs),
    fatConsumed: Math.round(totalFat),
    waterConsumed: totalWater,
    workoutsCompleted: userSessions.length,
    foodLogs: userFoods,
    waterLogs: userWater
  });
});

// POST /api/profile/food-log
router.post('/food-log', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const { food_name, serving_size, meal_type, calories, protein, carbs, fat, fiber } = req.body;

  if (!food_name || !calories) {
    return res.status(400).json({ error: 'Food name and calories are required.' });
  }

  if (!store.foodLogs[userId]) store.foodLogs[userId] = [];

  const entry = {
    id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    user_id: userId,
    date: new Date().toISOString().split('T')[0],
    food_name,
    serving_size: serving_size || '1 serving',
    meal_type: meal_type || 'lunch',
    calories: Number(calories),
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
    fiber: Number(fiber) || 0,
    created_at: new Date().toISOString()
  };

  store.foodLogs[userId].unshift(entry);
  res.json({ success: true, entry });
});

// POST /api/profile/water-log
router.post('/water-log', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const { amount_ml } = req.body;

  if (!amount_ml || Number(amount_ml) <= 0) {
    return res.status(400).json({ error: 'Valid amount in ml is required.' });
  }

  if (!store.waterLogs[userId]) store.waterLogs[userId] = [];

  const entry = {
    id: 'water_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    user_id: userId,
    date: new Date().toISOString().split('T')[0],
    amount_ml: Number(amount_ml),
    created_at: new Date().toISOString()
  };

  store.waterLogs[userId].unshift(entry);
  res.json({ success: true, entry });
});

// POST /api/profile/workout-session
router.post('/workout-session', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const { session_type, duration_seconds, calories_burned, poses_completed, accuracy_score, exercises_data } = req.body;

  if (!store.workoutSessions[userId]) store.workoutSessions[userId] = [];

  const session = {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    user_id: userId,
    date: new Date().toISOString().split('T')[0],
    session_type: session_type || 'yoga',
    duration_seconds: Number(duration_seconds) || 0,
    calories_burned: Number(calories_burned) || 0,
    poses_completed: Number(poses_completed) || 0,
    accuracy_score: Number(accuracy_score) || 0,
    exercises_data: exercises_data || [],
    created_at: new Date().toISOString()
  };

  store.workoutSessions[userId].unshift(session);
  res.json({ success: true, session });
});

module.exports = router;
