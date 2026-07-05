import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBell } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { getDueDateStatus, formatDateTime } from '../utils/helpers';

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const { data } = await taskService.getTasks({ archived: 'false' });
        setTasks(data.tasks || []);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };
    fetch();
  }, [user]);

  const overdue = tasks.filter(t => getDueDateStatus(t.dueDate, t.status) === 'overdue');
  const today = tasks.filter(t => getDueDateStatus(t.dueDate, t.status) === 'today');

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
            <HiBell className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Notifications</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">All alerts and reminders for your tasks</p>
          </div>
        </div>

        <section className="space-y-6">
          <div>
            <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Overdue</h2>
            {overdue.length === 0 ? (
              <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-500">No overdue tasks</div>
            ) : (
              <div className="space-y-2">
                {overdue.map(t => (
                  <div key={t._id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-md shadow-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Due: {formatDateTime(t.dueDate)}</p>
                    </div>
                    <button onClick={() => navigate('/tasks')} className="text-sm text-indigo-600">View</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Due Today</h2>
            {today.length === 0 ? (
              <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-500">No tasks due today</div>
            ) : (
              <div className="space-y-2">
                {today.map(t => (
                  <div key={t._id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-md shadow-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Due: {formatDateTime(t.dueDate)}</p>
                    </div>
                    <button onClick={() => navigate('/tasks')} className="text-sm text-indigo-600">View</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotificationsPage;
