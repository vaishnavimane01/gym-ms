import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { toast } from '../../components/Toast';
import {
  Dumbbell,
  Utensils,
  Flame,
  Award,
  Sparkles,
  Droplet,
  Heart,
  CheckCircle2,
  Calendar,
  MessageSquare
} from 'lucide-react';

export default function WorkoutDiet() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workout'); // 'workout' | 'diet'

  useEffect(() => {
    async function loadPlan() {
      try {
        setLoading(true);
        const res = await api.get('/workout-diet/my-plan');
        setPlan(res.data);
      } catch (err) {
        toast('Failed to load personalized workout & diet plan', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, []);

  if (loading) {
    return <Spinner className="py-20" size="lg" />;
  }

  // Fallback default routine if no custom plan has been assigned yet
  const defaultWorkoutSchedule = [
    {
      day: 'Day 1: Chest & Triceps (Push Focus)',
      exercises: [
        { name: 'Incline Dumbbell Bench Press', sets: '4 sets × 8-10 reps', rest: '90s' },
        { name: 'Flat Barbell Bench Press', sets: '3 sets × 10 reps', rest: '90s' },
        { name: 'Cable Chest Flyes', sets: '4 sets × 12-15 reps', rest: '60s' },
        { name: 'Tricep Rope Pushdowns', sets: '4 sets × 12 reps', rest: '60s' },
        { name: 'Overhead Dumbbell Tricep Extension', sets: '3 sets × 12 reps', rest: '60s' },
      ],
    },
    {
      day: 'Day 2: Back & Biceps (Pull Focus)',
      exercises: [
        { name: 'Conventional Barbell Deadlift', sets: '4 sets × 6 reps', rest: '120s' },
        { name: 'Wide-Grip Lat Pulldown', sets: '4 sets × 10 reps', rest: '90s' },
        { name: 'Seated Cable Row', sets: '3 sets × 12 reps', rest: '60s' },
        { name: 'Incline Dumbbell Bicep Curls', sets: '4 sets × 10 reps', rest: '60s' },
        { name: 'EZ-Bar Preacher Curls', sets: '3 sets × 12 reps', rest: '60s' },
      ],
    },
    {
      day: 'Day 3: Legs & Core Power',
      exercises: [
        { name: 'Barbell Back Squats', sets: '4 sets × 8 reps', rest: '120s' },
        { name: 'Romanian Dumbbell Deadlifts', sets: '3 sets × 10 reps', rest: '90s' },
        { name: 'Leg Press Machine', sets: '4 sets × 12 reps', rest: '90s' },
        { name: 'Standing Calf Raises', sets: '4 sets × 15 reps', rest: '45s' },
        { name: 'Hanging Knee Raises', sets: '4 sets × 15 reps', rest: '45s' },
      ],
    },
    {
      day: 'Day 4: Active Recovery & Cardio Mobility',
      exercises: [
        { name: 'Incline Treadmill Walk', sets: '30 mins at 12% incline', rest: 'Continuous' },
        { name: 'Foam Rolling (Hamstrings, Quads, Lats)', sets: '15 mins', rest: 'N/A' },
        { name: 'Dynamic Hip & Shoulder Mobility', sets: '15 mins', rest: 'N/A' },
      ],
    },
  ];

  const defaultDietSchedule = [
    {
      meal: 'Meal 1: Breakfast Energizer (08:00 AM)',
      calories: '650 kcal',
      items: [
        '4 Whole eggs (scrambled or boiled) with spinach',
        '80g Rolled Oats with unsweetened almond milk',
        'Handful of fresh blueberries & 10 crushed almonds',
      ],
    },
    {
      meal: 'Meal 2: Post-Workout Anabolic Window (11:30 AM)',
      calories: '450 kcal',
      items: [
        '1 Scoop Whey Protein Isolate in cold water',
        '1 Ripe banana + 2 rice cakes with 1 tbsp peanut butter',
      ],
    },
    {
      meal: 'Meal 3: Power Lunch (02:00 PM)',
      calories: '700 kcal',
      items: [
        '200g Grilled Herb Chicken Breast or Paneer',
        '150g Steamed Brown Rice or Quinoa',
        '1 Cup Steamed Broccoli & Zucchini with lemon dressing',
      ],
    },
    {
      meal: 'Meal 4: Dinner & Recovery (08:00 PM)',
      calories: '600 kcal',
      items: [
        '180g Grilled Salmon / Tofu Stir-fry',
        '1 Baked Sweet Potato with pinch of sea salt',
        'Large mixed green salad with virgin olive oil drizzle',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          Certified Trainer Prescription
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          {plan?.title || '4-Day Hypertrophy & Nutrition Regiment'}
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Goal: <strong className="text-white">{plan?.target_goal || 'Muscle Hypertrophy & Core Conditioning'}</strong>
        </p>

        {/* Nutritional Target Pill */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Target: <strong>{plan?.calorie_target || 2400} kcal/day</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
            <Droplet className="w-4 h-4 text-blue-400" />
            <span>Hydration: <strong>3.5L Water</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'workout'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Weekly Workout Split
        </button>
        <button
          onClick={() => setActiveTab('diet')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'diet'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Utensils className="w-4 h-4" />
          Daily Nutrition & Macros
        </button>
      </div>

      {/* WORKOUT TAB */}
      {activeTab === 'workout' && (
        <div className="space-y-4">
          {defaultWorkoutSchedule.map((block, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">{block.day}</h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {block.exercises.length} Movements
                </span>
              </div>

              <div className="space-y-2">
                {block.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-900 block">{ex.name}</span>
                      <span className="text-slate-500 text-[11px]">Rest: {ex.rest}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {ex.sets}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIET TAB */}
      {activeTab === 'diet' && (
        <div className="space-y-4">
          {defaultDietSchedule.map((mealBlock, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">{mealBlock.meal}</h3>
                <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
                  {mealBlock.calories}
                </span>
              </div>

              <ul className="space-y-1.5">
                {mealBlock.items.map((it, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Coach's Advice Callout */}
          <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-3xl flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-emerald-950 uppercase">Coach's Recovery Guidance</h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                "{plan?.coach_advice || 'Hydration is crucial for electrolyte conductivity. Maintain at least 8 hours of deep sleep to maximize muscle protein synthesis and recovery.'}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
