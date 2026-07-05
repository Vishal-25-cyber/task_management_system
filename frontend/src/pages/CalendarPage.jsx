import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiCalendar } from 'react-icons/hi';
import { taskService } from '../services/taskService';
import { formatDate } from '../utils/helpers';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const priorityVariant = { High: 'danger', Medium: 'warning', Low: 'success' };
const statusVariant = { Pending: 'primary', 'In Progress': 'warning', Completed: 'success' };

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const from = new Date(year, month, 1).toISOString().split('T')[0];
        const to   = new Date(year, month + 1, 0).toISOString().split('T')[0];
        const { data } = await taskService.getTasks({ archived: 'false', dueDateFrom: from, dueDateTo: to });
        setTasks(data.tasks);
      } catch { toast.error('Failed to load calendar'); }
      finally { setLoading(false); }
    };
    load();
  }, [year, month]);

  const getTasksForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      return t.dueDate.split('T')[0] === dateStr;
    });
  };

  const handleDayClick = (day) => {
    const d = new Date(year, month, day);
    setSelectedDate(d);
    setSelectedTasks(getTasksForDay(day));
  };

  const navigate = (dir) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + dir);
      return d;
    });
    setSelectedDate(null);
    setSelectedTasks([]);
  };

  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  // Build calendar grid
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: daysInPrev - firstDay + 1 + i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <HiChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-[140px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <HiChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 card p-4 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              const dayTasks = cell.current ? getTasksForDay(cell.day) : [];
              const isSelected = selectedDate && cell.current &&
                selectedDate.getDate() === cell.day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

              return (
                <button
                  key={idx}
                  onClick={() => cell.current && handleDayClick(cell.day)}
                  className={`relative min-h-[72px] p-1.5 text-left border border-slate-100 dark:border-slate-800 transition-all ${
                    !cell.current ? 'opacity-30 cursor-default' :
                    isSelected ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800' :
                    'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer'
                  }`}
                >
                  <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-sm font-medium mb-1 ${
                    isToday(cell.day) && cell.current
                      ? 'bg-indigo-600 text-white'
                      : isSelected
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {cell.day}
                  </span>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t._id}
                        className={`text-xs px-1.5 py-0.5 rounded font-medium truncate ${
                          t.status === 'Completed' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' :
                          t.priority === 'High'    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' :
                                                     'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 pl-1">+{dayTasks.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Task Panel */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <HiCalendar className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'Select a date'}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {!selectedDate ? (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                Click a date to view tasks
              </motion.p>
            ) : selectedTasks.length === 0 ? (
              <motion.p key="no-tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                No tasks due on this date
              </motion.p>
            ) : (
              <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {selectedTasks.map((task) => (
                  <div key={task._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-2">{task.title}</div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={priorityVariant[task.priority]} size="xs">{task.priority}</Badge>
                      <Badge variant={statusVariant[task.status]} size="xs">{task.status}</Badge>
                      <Badge variant="default" size="xs">{task.category}</Badge>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
