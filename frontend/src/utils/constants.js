/** Render: set VITE_API_URL to API origin only (e.g. https://gym-api.onrender.com); `/api` is appended. Local dev: unset → Vite proxy `/api`. */
const viteApiOrigin = import.meta.env.VITE_API_URL;
export const API_BASE_URL = viteApiOrigin
  ? `${String(viteApiOrigin).replace(/\/+$/, '')}/api`
  : '/api';

export const ROLES = {
  ADMIN: 'Admin',
  DEVELOPER: 'Developer',
  MEMBER: 'Member',
};

export const MEMBER_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
};

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

export const SESSION_STATUS = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'NoShow',
};

export const FITNESS_GOALS = [
  'Lose Weight',
  'Build Muscle',
  'Improve Fitness',
  'Increase Strength',
  'Improve Flexibility',
  'General Health',
  'Athletic Performance',
];

/** API / DB’de saklanan İngilizce değer → i18n anahtarı (`fitnessGoals.*`) */
export const FITNESS_GOAL_I18N_KEY = {
  'Lose Weight': 'fitnessGoals.loseWeight',
  'Build Muscle': 'fitnessGoals.buildMuscle',
  'Improve Fitness': 'fitnessGoals.improveFitness',
  'Increase Strength': 'fitnessGoals.increaseStrength',
  'Improve Flexibility': 'fitnessGoals.improveFlexibility',
  'General Health': 'fitnessGoals.generalHealth',
  'Athletic Performance': 'fitnessGoals.athleticPerformance',
};

/** Üyelik hedefini mevcut dilde gösterir; bilinmeyen veya boşsa `—` / orijinal metin. */
export function translateFitnessGoal(t, goal) {
  if (goal == null || goal === '') return '—';
  const key = FITNESS_GOAL_I18N_KEY[goal];
  return key ? t(key) : goal;
}

export const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Online'];

/** API / DB’de saklanan İngilizce değer → i18n anahtarı (`paymentMethods.*`) */
export const PAYMENT_METHOD_I18N_KEY = {
  Cash: 'paymentMethods.cash',
  Card: 'paymentMethods.card',
  'Bank Transfer': 'paymentMethods.bankTransfer',
  Online: 'paymentMethods.online',
};

/** Ödeme yöntemini mevcut dilde gösterir; bilinmeyen değerde orijinal metin. */
export function translatePaymentMethod(t, method) {
  if (method == null || method === '') return '—';
  const key = PAYMENT_METHOD_I18N_KEY[method];
  return key ? t(key) : method;
}
export const EXPENSE_CATEGORIES = ['Rent', 'Equipment', 'Utilities', 'Staff', 'Marketing', 'Maintenance', 'Other'];
export const PRODUCT_CATEGORIES = ['Supplements', 'Food', 'Beverages', 'Equipment', 'Apparel', 'Other'];
