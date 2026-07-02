import { db } from './db';

const PPL_TEMPLATES = [
  {
    name: 'Push Day',
    order: 0,
    exercises: [
      { name: 'Bench Press', targetSets: 4, targetReps: '8-12' },
      { name: 'Overhead Press', targetSets: 3, targetReps: '8-12' },
      { name: 'Incline DB Press', targetSets: 3, targetReps: '10-12' },
      { name: 'Lateral Raises', targetSets: 3, targetReps: '12-15' },
      { name: 'Tricep Pushdown', targetSets: 3, targetReps: '12-15' },
    ],
  },
  {
    name: 'Pull Day',
    order: 1,
    exercises: [
      { name: 'Deadlift', targetSets: 4, targetReps: '5-8' },
      { name: 'Barbell Row', targetSets: 4, targetReps: '8-12' },
      { name: 'Lat Pulldown', targetSets: 3, targetReps: '10-12' },
      { name: 'Face Pulls', targetSets: 3, targetReps: '15-20' },
      { name: 'Barbell Curl', targetSets: 3, targetReps: '10-12' },
    ],
  },
  {
    name: 'Legs Day',
    order: 2,
    exercises: [
      { name: 'Squat', targetSets: 4, targetReps: '6-10' },
      { name: 'Romanian Deadlift', targetSets: 3, targetReps: '8-12' },
      { name: 'Leg Press', targetSets: 3, targetReps: '10-12' },
      { name: 'Leg Curl', targetSets: 3, targetReps: '12-15' },
      { name: 'Calf Raises', targetSets: 4, targetReps: '12-15' },
    ],
  },
];

const DEFAULT_BUDGETS = [
  { category: 'ALL', monthlyLimit: 2000 },
  { category: 'Food', monthlyLimit: 400 },
  { category: 'Groceries', monthlyLimit: 300 },
  { category: 'Rent', monthlyLimit: 1200 },
  { category: 'Transport', monthlyLimit: 150 },
  { category: 'Fitness', monthlyLimit: 80 },
  { category: 'Fun', monthlyLimit: 150 },
  { category: 'Other', monthlyLimit: 100 },
];

export async function seedIfNeeded() {
  const seeded = await db.settings.get('seeded');
  if (seeded?.value === 'true') return;

  await db.budgets.bulkAdd(DEFAULT_BUDGETS);
  await db.workoutTemplates.bulkAdd(PPL_TEMPLATES);
  await db.settings.put({ key: 'seeded', value: 'true' });
  await db.settings.put({ key: 'weeklyWorkoutGoal', value: '4' });
  await db.settings.put({ key: 'weeklyBudget', value: '250' });
  await db.settings.put({ key: 'currency', value: 'CAD' });
}