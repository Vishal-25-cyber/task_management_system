import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiClipboardList, HiClock, HiTrendingUp, HiCheckCircle,
  HiExclamationCircle, HiCalendar, HiSparkles, HiPlus,
  HiFire, HiArrowRight,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useTaskContext } from '../context/TaskContext';
import { analyticsService } from '../services/analyticsService';
import { taskService } from '../services/taskService';
import Modal from '../components/common/Modal';
import TaskForm from '../components/tasks/TaskForm';
import Button from '../components/common/Button';
import { formatDate, getDueDateStatus } from '../utils/helpers';
import { SkeletonStat } from '../components/common/SkeletonCard';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, bgColor, trend }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="card p-5"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`h-11 w-11 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">{value}</div>
    <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
  </motion.div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { createTask, fetchTasks } = useTaskContext();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [dueTodayTasks, setDueTodayTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [highPriorityTask, setHighPriorityTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const [analyticsRes, recentRes, dueTodayRes, overdueRes] = await Promise.all([
        analyticsService.getAnalytics(),
        taskService.getTasks({ sortBy: 'createdAt', order: 'desc', archived: 'false' }),
        taskService.getTasks({
          archived: 'false',
          dueDateFrom: new Date().toISOString(),
          dueDateTo: endOfToday.toISOString(),
        }),
        taskService.getTasks({
          archived: 'false',
          dueDateTo: new Date().toISOString(),
        }),
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setRecentTasks(recentRes.data.tasks.slice(0, 5));
      setDueTodayTasks(dueTodayRes.data.tasks.filter(t => t.status !== 'Completed').slice(0, 5));
      setOverdueTasks(overdueRes.data.tasks.filter(t => t.status !== 'Completed').slice(0, 3));

      // Calculate highest priority task
      const allTasks = recentRes.data.tasks || [];
      const highTasks = allTasks.filter(t => t.priority === 'High' && t.status !== 'Completed');
      const sortedHigh = highTasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setHighPriorityTask(sortedHigh[0] || null);
    } catch (err) {
      console.error('Dashboard load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Smart due date reminders via toast
  useEffect(() => {
    if (!analytics?.overview) return;
    const { overdueCount, dueTodayCount } = analytics.overview;
    if (overdueCount > 0) toast.error(`🔴 You have ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''}!`, { id: 'overdue', duration: 5000 });
    if (dueTodayCount > 0) toast(`🟠 ${dueTodayCount} task${dueTodayCount > 1 ? 's' : ''} due today`, { id: 'today', duration: 4000 });
  }, [analytics]);

  const handleCreateTask = async (data) => {
    setCreateLoading(true);
    try {
      await createTask(data);
      toast.success('✅ Task created successfully!');
      setShowCreateModal(false);
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setCreateLoading(false);
    }
  };

  const ov = analytics?.overview;
  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = ov ? [
    { icon: HiClipboardList, label: 'Active Tasks', value: ov.totalTasks - ov.completedTasks, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-950' },
    { icon: HiTrendingUp, label: 'In Progress', value: ov.inProgressTasks, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950' },
    { icon: HiExclamationCircle, label: 'Overdue', value: ov.overdueCount, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950' },
    { icon: HiCheckCircle, label: 'Completed', value: ov.completedTasks, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-950' },
  ] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button
          icon={<HiPlus className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          New Task
        </Button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <SkeletonStat count={4} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Progress */}
              {ov && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Overall Progress</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{ov.completionRate}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ov.completionRate}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    <span>{ov.completedTasks} completed</span>
                    <span>{ov.totalTasks - ov.completedTasks} remaining</span>
                  </div>
                </div>
              )}

              {/* Focus: Top Priority Task */}
              {highPriorityTask && (
                <div className="card p-5 bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 dark:from-red-950/20 dark:to-orange-950/5 dark:border-red-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-red-500 text-white shadow-sm flex-shrink-0 animate-pulse">
                      <HiFire className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Top Priority Task</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
                    {highPriorityTask.title}
                  </h3>
                  {highPriorityTask.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {highPriorityTask.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-red-500/10 dark:border-red-900/20">
                    <span>Due: {highPriorityTask.dueDate ? formatDate(highPriorityTask.dueDate) : 'No due date'}</span>
                    <button
                      onClick={() => navigate('/tasks')}
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5"
                    >
                      Focus Now <HiArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Tasks */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-800 dark:text-slate-200">Recent Tasks</h2>
                  <button onClick={() => navigate('/tasks')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    View all <HiArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {recentTasks.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No tasks yet. Create one!</p>
                  ) : recentTasks.map((task) => {
                    const dueStat = getDueDateStatus(task.dueDate, task.status);
                    return (
                      <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => navigate('/tasks')}>
                        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${task.status === 'Completed' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{task.title}</span>
                        {dueStat && dueStat !== 'normal' && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${dueStat === 'overdue' ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400' :
                              dueStat === 'today' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400' :
                                'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400'
                            }`}>
                            {dueStat === 'overdue' ? 'Overdue' : dueStat === 'today' ? 'Today' : 'Soon'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar Section */}
            <div className="space-y-6">

              {/* Quick Actions */}
              <div className="card p-5">
                <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Create New Task', onClick: () => setShowCreateModal(true), icon: HiPlus, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400' },
                    { label: 'View Calendar', onClick: () => navigate('/calendar'), icon: HiCalendar, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400' },
                    { label: 'Open Kanban', onClick: () => navigate('/kanban'), icon: HiClipboardList, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400' },
                    { label: 'Analytics', onClick: () => navigate('/analytics'), icon: HiTrendingUp, color: 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400' },
                  ].map((a) => (
                    <button key={a.label} onClick={a.onClick} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                      <div className={`h-8 w-8 rounded-lg ${a.color.split(' ').slice(1).join(' ')} flex items-center justify-center flex-shrink-0`}>
                        <a.icon className={`h-4 w-4 ${a.color.split(' ')[0]}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{a.label}</span>
                      <HiArrowRight className="h-4 w-4 text-slate-300 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadlines & Alerts */}
              <div className="card p-5">
                <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <HiCalendar className="h-5 w-5 text-indigo-500" />
                  Deadlines & Alerts
                </h2>
                {overdueTasks.length === 0 && dueTodayTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">🎉 All caught up! No deadlines.</p>
                ) : (
                  <div className="space-y-3">
                    {overdueTasks.map((t) => (
                      <div key={t._id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 dark:bg-red-950/20 dark:border-red-900/30 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="h-1.5 w-1.5 bg-red-500 rounded-full flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{t.title}</span>
                        </div>
                        <span className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full flex-shrink-0">Overdue</span>
                      </div>
                    ))}
                    {dueTodayTasks.map((t) => (
                      <div key={t._id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10 dark:bg-orange-950/20 dark:border-orange-900/30 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="h-1.5 w-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{t.title}</span>
                        </div>
                        <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full flex-shrink-0">Today</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Task">
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
          loading={createLoading}
        />
      </Modal>
    </div>
  );
};

export default DashboardPage;
