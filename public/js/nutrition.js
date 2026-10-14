// public/js/nutrition.js
// Verified Nutrition Database, Personalized Meal Plans & Food Logger

const Nutrition = (() => {
  const FOOD_LOGS_KEY = 'fitai_food_logs';

  // 1. Curated Food Composition Database
  const FOOD_DATABASE = [
    // Indian Breads & Grains
    { id: 'roti_wheat', name: 'Whole Wheat Roti (Phulka)', serving: '1 medium (35g raw)', calories: 85, protein: 2.8, carbs: 17.0, fat: 0.8, fiber: 2.5, category: 'grains', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'rice_white', name: 'Cooked White Rice', serving: '1 katori / cup (150g)', calories: 195, protein: 4.0, carbs: 43.0, fat: 0.5, fiber: 0.6, category: 'grains', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'rice_brown', name: 'Cooked Brown Rice', serving: '1 katori / cup (150g)', calories: 165, protein: 3.8, carbs: 35.0, fat: 1.4, fiber: 2.8, category: 'grains', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'oats_cooked', name: 'Rolled Oats Porridge (in water)', serving: '1 bowl (40g dry)', calories: 150, protein: 5.5, carbs: 27.0, fat: 2.5, fiber: 4.0, category: 'grains', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'poha_veg', name: 'Vegetable Poha with peanuts', serving: '1 plate (150g)', calories: 230, protein: 5.0, carbs: 36.0, fat: 7.5, fiber: 3.0, category: 'grains', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'idli_sambar', name: 'Steamed Idli (2 pcs) with Sambar', serving: '2 idlis + 1 bowl sambar', calories: 210, protein: 7.2, carbs: 40.0, fat: 2.2, fiber: 4.5, category: 'grains', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'dosa_plain', name: 'Plain Crisp Dosa with Sambar', serving: '1 medium dosa (80g)', calories: 170, protein: 4.5, carbs: 30.0, fat: 4.0, fiber: 2.0, category: 'grains', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },

    // Dals & Legumes
    { id: 'dal_moong', name: 'Moong Dal (Yellow Lentil Tadka)', serving: '1 bowl (150g cooked)', calories: 135, protein: 8.5, carbs: 20.0, fat: 2.5, fiber: 4.5, category: 'legumes', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'dal_toor', name: 'Toor Dal Tadka', serving: '1 bowl (150g cooked)', calories: 150, protein: 8.0, carbs: 22.0, fat: 3.5, fiber: 4.0, category: 'legumes', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'chana_boiled', name: 'Boiled Chickpeas (Kabuli Chana)', serving: '1 bowl (150g cooked)', calories: 240, protein: 13.0, carbs: 40.0, fat: 3.8, fiber: 10.0, category: 'legumes', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'rajma_masala', name: 'Rajma Masala (Red Kidney Beans)', serving: '1 bowl (150g cooked)', calories: 215, protein: 11.5, carbs: 34.0, fat: 3.5, fiber: 9.0, category: 'legumes', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'soya_chunks', name: 'Soya Chunks Curry', serving: '1 bowl (50g dry cooked)', calories: 175, protein: 26.0, carbs: 14.0, fat: 0.5, fiber: 6.5, category: 'legumes', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },

    // Dairy & Plant Proteins
    { id: 'paneer_lowfat', name: 'Low-Fat Paneer / Cottage Cheese', serving: '100g raw/grilled', calories: 170, protein: 19.0, carbs: 3.5, fat: 9.0, fiber: 0, category: 'dairy', diet: ['vegetarian', 'eggetarian', 'non_vegetarian'] },
    { id: 'paneer_regular', name: 'Regular Fresh Paneer', serving: '100g', calories: 265, protein: 18.0, carbs: 4.0, fat: 20.0, fiber: 0, category: 'dairy', diet: ['vegetarian', 'eggetarian', 'non_vegetarian'] },
    { id: 'tofu_firm', name: 'Firm Tofu (Soya Paneer)', serving: '100g pan-seared', calories: 95, protein: 12.0, carbs: 2.5, fat: 4.5, fiber: 1.5, category: 'plant_protein', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'curd_dahi', name: 'Homemade Curd (Dahi) from toned milk', serving: '1 cup / bowl (150g)', calories: 90, protein: 5.5, carbs: 6.5, fat: 4.5, fiber: 0, category: 'dairy', diet: ['vegetarian', 'eggetarian', 'non_vegetarian'] },
    { id: 'milk_toned', name: 'Toned Cow Milk (Warm/Cold)', serving: '1 glass (200ml)', calories: 120, protein: 6.4, carbs: 9.5, fat: 6.0, fiber: 0, category: 'dairy', diet: ['vegetarian', 'eggetarian', 'non_vegetarian'] },

    // Eggs & Poultry & Fish
    { id: 'egg_boiled_whole', name: 'Whole Boiled Egg', serving: '1 large egg (50g)', calories: 74, protein: 6.3, carbs: 0.4, fat: 5.0, fiber: 0, category: 'eggs', diet: ['eggetarian', 'non_vegetarian'] },
    { id: 'egg_white', name: 'Boiled Egg White', serving: '2 egg whites (66g)', calories: 34, protein: 7.2, carbs: 0.4, fat: 0.2, fiber: 0, category: 'eggs', diet: ['eggetarian', 'non_vegetarian'] },
    { id: 'chicken_breast', name: 'Grilled Chicken Breast', serving: '150g cooked', calories: 245, protein: 46.0, carbs: 0.0, fat: 5.2, fiber: 0, category: 'meat', diet: ['non_vegetarian'] },
    { id: 'fish_grilled', name: 'Tawa Grilled Fish (Rohu / Pomfret)', serving: '150g fillet', calories: 180, protein: 32.0, carbs: 0.0, fat: 5.5, fiber: 0, category: 'meat', diet: ['non_vegetarian'] },

    // Vegetables & Salads
    { id: 'mixed_veg_sabzi', name: 'Homestyle Mixed Veg Sabzi (light oil)', serving: '1 bowl (150g)', calories: 95, protein: 2.5, carbs: 12.0, fat: 4.0, fiber: 4.2, category: 'vegetables', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'palak_spinach', name: 'Sautéed Garlic Palak (Spinach)', serving: '1 bowl (150g)', calories: 60, protein: 3.5, carbs: 5.0, fat: 3.0, fiber: 3.5, category: 'vegetables', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'salad_cucumber_tomato', name: 'Green Salad (Cucumber, Tomato, Onion, Lemon)', serving: '1 medium plate (150g)', calories: 35, protein: 1.2, carbs: 7.0, fat: 0.3, fiber: 2.8, category: 'vegetables', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },

    // Fruits & Healthy Snacks
    { id: 'banana', name: 'Fresh Banana', serving: '1 medium (118g)', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3, fiber: 3.1, category: 'fruits', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'apple', name: 'Red Apple with skin', serving: '1 medium (150g)', calories: 80, protein: 0.5, carbs: 21.0, fat: 0.3, fiber: 4.0, category: 'fruits', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'papaya', name: 'Fresh Diced Papaya', serving: '1 cup (145g)', calories: 55, protein: 0.9, carbs: 14.0, fat: 0.3, fiber: 2.5, category: 'fruits', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'almonds_soaked', name: 'Raw / Soaked Almonds', serving: '8-10 kernels (12g)', calories: 70, protein: 2.5, carbs: 2.5, fat: 6.0, fiber: 1.5, category: 'nuts', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'roasted_makhana', name: 'Roasted Fox Nuts (Makhana) with pinch salt', serving: '1 bowl (30g)', calories: 105, protein: 3.0, carbs: 20.0, fat: 1.0, fiber: 2.2, category: 'snacks', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] },
    { id: 'roasted_chana_snack', name: 'Roasted Black Chana (with peel)', serving: '1 small bowl (30g)', calories: 110, protein: 6.0, carbs: 17.0, fat: 1.8, fiber: 5.0, category: 'snacks', diet: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'] }
  ];

  // 2. Personalized Meal Plan Generator
  function generateMealPlan(targetCalories = 2000, dietType = 'vegetarian', goal = 'fat_loss') {
    const isVeg = dietType === 'vegetarian';
    const isVegan = dietType === 'vegan';
    const isNonVeg = dietType === 'non_vegetarian';
    const isEgg = dietType === 'eggetarian';

    const proteinSourceLunch = isVegan
      ? { name: '120g Pan-Seared Firm Tofu', cal: 115, p: 14, c: 3, f: 5 }
      : isNonVeg
      ? { name: '150g Grilled Chicken Breast', cal: 245, p: 46, c: 0, f: 5 }
      : isEgg
      ? { name: '2 Whole Boiled Eggs + 2 Egg Whites', cal: 182, p: 20, c: 1, f: 10 }
      : { name: '100g Low-Fat Paneer Bhurji', cal: 170, p: 19, c: 3.5, f: 9 };

    const proteinSourceDinner = isVegan
      ? { name: '1 Bowl Soya Chunks Curry (50g dry)', cal: 175, p: 26, c: 14, f: 0.5 }
      : isNonVeg
      ? { name: '150g Tawa Grilled Fish Fillet', cal: 180, p: 32, c: 0, f: 5.5 }
      : { name: '1 Bowl Moong Dal Tadka (150g)', cal: 135, p: 8.5, c: 20, f: 2.5 };

    const snackProtein = isVegan
      ? { name: 'Roasted Black Chana (30g)', cal: 110, p: 6, c: 17, f: 1.8 }
      : isNonVeg || isEgg
      ? { name: '2 Boiled Egg Whites', cal: 34, p: 7.2, c: 0.4, f: 0.2 }
      : { name: '1 Cup Fresh Dahi / Curd', cal: 90, p: 5.5, c: 6.5, f: 4.5 };

    const plan = {
      title: `${dietType.replace('_', ' ').toUpperCase()} Plan — ${goal.replace('_', ' ').toUpperCase()}`,
      targetCalories,
      meals: [
        {
          name: 'Breakfast (8:30 AM)',
          items: [
            { item: isVegan ? 'Vegetable Poha with peanuts (1 plate)' : 'Rolled Oats Porridge with 1 glass milk & chia seeds', portion: '1 bowl', cal: 260, p: 9, c: 42, f: 6 },
            { item: 'Soaked Almonds & Walnuts', portion: '8 kernels', cal: 70, p: 2.5, c: 2.5, f: 6 }
          ],
          substitutions: 'Substitute with 2 Besan Chillas or 2 Idlis with Sambar.'
        },
        {
          name: 'Mid-Morning Snack (11:30 AM)',
          items: [
            { item: 'Fresh Fruit (Apple or Papaya)', portion: '1 cup (150g)', cal: 80, p: 0.8, c: 20, f: 0.3 },
            { item: 'Green Tea or Warm Lemon Water', portion: '1 cup', cal: 2, p: 0, c: 0.5, f: 0 }
          ],
          substitutions: '1 glass fresh coconut water or seasonal orange.'
        },
        {
          name: 'Lunch (1:30 PM)',
          items: [
            { item: 'Whole Wheat Phulkas / Rotis', portion: '2 rotis', cal: 170, p: 5.6, c: 34, f: 1.6 },
            { item: proteinSourceLunch.name, portion: '1 serving', cal: proteinSourceLunch.cal, p: proteinSourceLunch.p, c: proteinSourceLunch.c, f: proteinSourceLunch.f },
            { item: 'Homestyle Dal or Rajma', portion: '1 bowl (150g)', cal: 140, p: 8.5, c: 22, f: 2.5 },
            { item: 'Cucumber & Tomato Salad with Lemon', portion: '1 plate', cal: 35, p: 1.2, c: 7, f: 0.3 }
          ],
          substitutions: 'Swap 2 rotis with 1 cup cooked brown rice.'
        },
        {
          name: 'Evening Snack (5:00 PM)',
          items: [
            { item: snackProtein.name, portion: '1 serving', cal: snackProtein.cal, p: snackProtein.p, c: snackProtein.c, f: snackProtein.f },
            { item: 'Roasted Fox Nuts (Makhana)', portion: '1 small bowl (20g)', cal: 70, p: 2, c: 14, f: 0.7 }
          ],
          substitutions: 'Sprouted moong salad with diced onion, tomato, and chaat masala.'
        },
        {
          name: 'Dinner (8:00 PM)',
          items: [
            { item: 'Whole Wheat Phulkas', portion: '2 rotis (or 1 cup quinoa/brown rice)', cal: 170, p: 5.6, c: 34, f: 1.6 },
            { item: proteinSourceDinner.name, portion: '1 bowl', cal: proteinSourceDinner.cal, p: proteinSourceDinner.p, c: proteinSourceDinner.c, f: proteinSourceDinner.f },
            { item: 'Stir-Fried Seasonal Sabzi (Bhindi/Gobi/Palak)', portion: '1 bowl (150g)', cal: 95, p: 2.5, c: 12, f: 4 }
          ],
          substitutions: 'For fat loss, substitute one roti with a warm bowl of vegetable soup.'
        }
      ]
    };

    // Calculate totals
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
    plan.meals.forEach(m => {
      m.mealCal = m.items.reduce((sum, i) => sum + i.cal, 0);
      m.mealProtein = m.items.reduce((sum, i) => sum + i.p, 0);
      totalCal += m.mealCal;
      totalP += m.mealProtein;
    });

    plan.dailyTotal = {
      calories: Math.round(totalCal),
      protein: Math.round(totalP),
      carbs: Math.round(totalCal * 0.45 / 4),
      fat: Math.round(totalCal * 0.25 / 9)
    };

    return plan;
  }

  // 3. Daily Food Log Operations
  function getDailyFoodLogs(dateStr = new Date().toISOString().split('T')[0]) {
    try {
      const all = JSON.parse(localStorage.getItem(FOOD_LOGS_KEY) || '[]');
      return all.filter(item => item.date === dateStr);
    } catch (e) {
      return [];
    }
  }

  function addFoodLog(item, multiplier = 1, mealType = 'lunch') {
    const today = new Date().toISOString().split('T')[0];
    const logItem = {
      id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      date: today,
      mealType,
      name: item.name,
      serving: `${multiplier}x ${item.serving}`,
      calories: Math.round(item.calories * multiplier),
      protein: parseFloat((item.protein * multiplier).toFixed(1)),
      carbs: parseFloat((item.carbs * multiplier).toFixed(1)),
      fat: parseFloat((item.fat * multiplier).toFixed(1)),
      fiber: parseFloat(((item.fiber || 0) * multiplier).toFixed(1)),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const all = JSON.parse(localStorage.getItem(FOOD_LOGS_KEY) || '[]');
    all.unshift(logItem);
    localStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(all));

    // Async server sync
    const token = Auth.getAuthToken();
    if (token) {
      fetch('/api/profile/food-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          food_name: logItem.name,
          serving_size: logItem.serving,
          meal_type: logItem.mealType,
          calories: logItem.calories,
          protein: logItem.protein,
          carbs: logItem.carbs,
          fat: logItem.fat,
          fiber: logItem.fiber
        })
      }).catch(e => console.warn('Food log offline sync pending:', e));
    }

    return logItem;
  }

  function removeFoodLog(id) {
    const all = JSON.parse(localStorage.getItem(FOOD_LOGS_KEY) || '[]');
    const filtered = all.filter(item => item.id !== id);
    localStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(filtered));
  }

  function getDailyNutrientTotals(dateStr = new Date().toISOString().split('T')[0]) {
    const logs = getDailyFoodLogs(dateStr);
    return logs.reduce((acc, cur) => {
      acc.calories += cur.calories || 0;
      acc.protein += cur.protein || 0;
      acc.carbs += cur.carbs || 0;
      acc.fat += cur.fat || 0;
      acc.fiber += cur.fiber || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }

  return {
    FOOD_DATABASE,
    generateMealPlan,
    getDailyFoodLogs,
    addFoodLog,
    removeFoodLog,
    getDailyNutrientTotals
  };
})();
