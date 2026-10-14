// public/js/calories.js
// Deterministic, clinically validated Calorie, BMR, TDEE, Macro & BMI Calculator

const Calories = (() => {
  // Activity Level Multipliers
  const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,        // Desk job, little/no exercise
    light: 1.375,          // Light exercise 1-3 days/week
    moderate: 1.55,        // Moderate exercise 3-5 days/week
    very_active: 1.725,    // Intense exercise 6-7 days/week
    extra_active: 1.9      // Heavy manual labor or twice-a-day training
  };

  // 1. Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
  function calculateBMR(weightKg, heightCm, age, sex = 'male') {
    if (!weightKg || !heightCm || !age) return 0;
    const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    
    if (sex === 'male') {
      return Math.round(base + 5);
    } else if (sex === 'female') {
      return Math.round(base - 161);
    } else {
      // Neutral / Prefer not to say: Arithmetic midpoint
      return Math.round(base - 78);
    }
  }

  // 2. Calculate Total Daily Energy Expenditure (TDEE)
  function calculateTDEE(bmr, activityLevel = 'moderate') {
    const mult = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
    return Math.round(bmr * mult);
  }

  // 3. Calculate Target Calories & Safeguards based on Fitness Goal
  function calculateTargets(tdee, goal = 'fat_loss', sex = 'male', age = 25) {
    let targetCalories = tdee;
    let deficitOrSurplus = 0;
    let description = 'Maintenance calorie balance to sustain body composition and energy levels.';

    // Safeguard thresholds (ACSM / Dietetic Guidelines)
    const minCalories = (sex === 'female') ? 1200 : 1500;

    switch (goal) {
      case 'fat_loss':
        deficitOrSurplus = -450; // Conservative, sustainable deficit (~0.4 - 0.5 kg fat loss/week)
        targetCalories = Math.max(minCalories, tdee + deficitOrSurplus);
        description = `Targeting a moderate, sustainable caloric deficit of ~450 kcal/day for progressive fat loss while preserving lean tissue.`;
        break;
      case 'muscle_gain':
        deficitOrSurplus = +300; // Modest hypercaloric surplus for lean hypertrophic growth
        targetCalories = tdee + deficitOrSurplus;
        description = `Targeting a lean caloric surplus of ~300 kcal/day to facilitate muscle protein synthesis with minimal fat accumulation.`;
        break;
      case 'flexibility':
      case 'yoga':
      case 'general_fitness':
      case 'maintenance':
      default:
        deficitOrSurplus = 0;
        targetCalories = tdee;
        description = `Maintaining steady energy equilibrium for cellular repair, endurance, and yoga mobility.`;
        break;
    }

    const isMinor = age < 18;
    const advisory = isMinor
      ? 'Advisory: For individuals under 18, caloric restriction is not recommended without specialized pediatric or registered sports dietitian guidance.'
      : null;

    return {
      tdee,
      targetCalories,
      deficitOrSurplus,
      description,
      advisory
    };
  }

  // 4. Calculate Optimal Macronutrient Grams
  function calculateMacros(targetCalories, weightKg, goal = 'fat_loss') {
    if (!targetCalories || !weightKg) return { protein: 0, carbs: 0, fat: 0 };

    let proteinGramsPerKg = 1.8; // Standard sports nutrition guideline
    let fatPercentage = 0.25;    // 25% of energy from healthy fats

    if (goal === 'muscle_gain') {
      proteinGramsPerKg = 2.0;
      fatPercentage = 0.25;
    } else if (goal === 'fat_loss') {
      proteinGramsPerKg = 2.0;   // Higher protein for satiety and muscle sparing during deficit
      fatPercentage = 0.25;
    } else {
      proteinGramsPerKg = 1.6;
      fatPercentage = 0.28;
    }

    const proteinGrams = Math.round(weightKg * proteinGramsPerKg);
    const proteinCalories = proteinGrams * 4;

    const fatCalories = targetCalories * fatPercentage;
    const fatGrams = Math.round(fatCalories / 9);

    const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
    const carbsGrams = Math.round(remainingCalories / 4);

    return {
      protein: {
        grams: proteinGrams,
        calories: proteinCalories,
        percent: Math.round((proteinCalories / targetCalories) * 100)
      },
      fat: {
        grams: fatGrams,
        calories: Math.round(fatCalories),
        percent: Math.round((fatCalories / targetCalories) * 100)
      },
      carbs: {
        grams: carbsGrams,
        calories: Math.round(remainingCalories),
        percent: Math.round((remainingCalories / targetCalories) * 100)
      }
    };
  }

  // 5. Calculate Body Mass Index (BMI)
  function calculateBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

    let category = 'Normal weight';
    let color = '#10e759';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = '#38bdf8';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      category = 'Normal weight';
      color = '#10e759';
    } else if (bmi >= 25 && bmi <= 29.9) {
      category = 'Overweight';
      color = '#f59e0b';
    } else {
      category = 'Obesity range';
      color = '#ef4444';
    }

    return {
      bmi,
      category,
      color,
      note: 'BMI is an epidemiological population indicator. Athletic individuals with high muscle mass may present elevated BMI without elevated body fat.'
    };
  }

  // Unit Converters
  function lbsToKg(lbs) { return parseFloat((lbs * 0.453592).toFixed(1)); }
  function kgToLbs(kg) { return parseFloat((kg * 2.20462).toFixed(1)); }
  function feetInchesToCm(feet, inches) { return Math.round((feet * 30.48) + (inches * 2.54)); }
  function cmToFeetInches(cm) {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  }

  return {
    calculateBMR,
    calculateTDEE,
    calculateTargets,
    calculateMacros,
    calculateBMI,
    lbsToKg,
    kgToLbs,
    feetInchesToCm,
    cmToFeetInches
  };
})();
