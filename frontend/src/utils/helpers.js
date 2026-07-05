import { format, isToday, isPast, isFuture, differenceInDays, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'No due date';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM dd, yyyy');
  } catch { return 'Invalid date'; }
};

export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM dd, yyyy HH:mm');
  } catch { return ''; }
};

export const getDueDateStatus = (dueDate, status) => {
  if (!dueDate || status === 'Completed') return null;
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : new Date(dueDate);
  const now = new Date();

  if (due < now) return 'overdue';
  if (isToday(due)) return 'today';
  
  // Calculate difference in calendar days
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dueStart = new Date(due);
  dueStart.setHours(0, 0, 0, 0);
  
  const diff = differenceInDays(dueStart, todayStart);
  if (diff <= 3 && diff >= 0) return 'upcoming';
  return 'normal';
};

export const getDueDateLabel = (dueDate, status) => {
  if (!dueDate) return null;
  const s = getDueDateStatus(dueDate, status);
  if (!s || s === 'normal') return null;
  const labels = { overdue: 'Overdue', today: 'Due Today', upcoming: 'Due Soon' };
  return labels[s];
};

export const formatForDateTimeLocal = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, "yyyy-MM-dd'T'HH:mm");
  } catch { return ''; }
};

export const getPriorityColor = (priority) => {
  const map = {
    High:   'text-red-500   bg-red-50   dark:bg-red-950   dark:text-red-400   border-red-200   dark:border-red-800',
    Medium: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Low:    'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800',
  };
  return map[priority] || map.Medium;
};

export const getStatusColor = (status) => {
  const map = {
    'Pending':     'text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    'In Progress': 'text-amber-600  bg-amber-50  dark:bg-amber-950  dark:text-amber-400  border-amber-200  dark:border-amber-800',
    'Completed':   'text-green-600  bg-green-50  dark:bg-green-950  dark:text-green-400  border-green-200  dark:border-green-800',
  };
  return map[status] || map.Pending;
};

export const getCategoryColor = (category) => {
  const map = {
    Work:     'text-blue-600   bg-blue-50   dark:bg-blue-950   dark:text-blue-400',
    College:  'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400',
    Study:    'text-cyan-600   bg-cyan-50   dark:bg-cyan-950   dark:text-cyan-400',
    Personal: 'text-pink-600   bg-pink-50   dark:bg-pink-950   dark:text-pink-400',
    Shopping: 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400',
    Others:   'text-slate-600  bg-slate-50  dark:bg-slate-800  dark:text-slate-400',
  };
  return map[category] || map.Others;
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
};

export const timeAgo = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return format(d, 'MMM dd');
};
