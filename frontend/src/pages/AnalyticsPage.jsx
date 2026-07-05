import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
  LineElement, PointElement, Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { analyticsService } from '../services/analyticsService';
import toast from 'react-hot-toast';
import { HiChartBar, HiTrendingUp } from 'react-icons/hi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement, Filler);

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const chartBaseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { family: 'Inter', size: 12 } } },
    tooltip: { backgroundColor: '#1e293b', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' }, padding: 12, cornerRadius: 8 },
  },
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAnalytics()
      .then(({ data }) => setAnalytics(data.analytics))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 skeleton w-48 mb-8 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 h-72 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { statusDistribution, priorityDistribution, monthlyTasks, categoryDistribution, overview } = analytics;

  // Status donut
  const statusData = {
    labels: statusDistribution.map((s) => s._id),
    datasets: [{
      data: statusDistribution.map((s) => s.count),
      backgroundColor: ['#6366f1', '#f59e0b', '#10b981'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  // Priority bar
  const priorityData = {
    labels: priorityDistribution.map((p) => p._id),
    datasets: [{
      label: 'Tasks',
      data: priorityDistribution.map((p) => p.count),
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // Monthly line
  const now = new Date();
  const last12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: MONTHS_SHORT[d.getMonth()] };
  });
  const monthlyMap = {};
  monthlyTasks.forEach((m) => { monthlyMap[`${m._id.year}-${m._id.month}`] = m.count; });
  const monthlyData = {
    labels: last12.map((m) => m.label),
    datasets: [{
      label: 'Tasks Created',
      data: last12.map((m) => monthlyMap[`${m.year}-${m.month}`] || 0),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointRadius: 4,
    }],
  };

  // Category donut
  const categoryColors = ['#6366f1','#8b5cf6','#06b6d4','#ec4899','#f59e0b','#94a3b8'];
  const categoryData = {
    labels: categoryDistribution.map((c) => c._id),
    datasets: [{
      data: categoryDistribution.map((c) => c.count),
      backgroundColor: categoryColors.slice(0, categoryDistribution.length),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const barOpts = {
    ...chartBaseOpts,
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Inter' } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false }, ticks: { font: { family: 'Inter' }, stepSize: 1 } },
    },
  };

  const lineOpts = {
    ...chartBaseOpts,
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Inter' } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false }, ticks: { font: { family: 'Inter' }, stepSize: 1 } },
    },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
          <HiChartBar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your productivity insights</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tasks',   value: overview.totalTasks,       color: 'text-indigo-600 dark:text-indigo-400',  bg: 'bg-indigo-50 dark:bg-indigo-950' },
          { label: 'Completed',     value: overview.completedTasks,   color: 'text-green-600 dark:text-green-400',    bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'Completion %',  value: `${overview.completionRate}%`, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950' },
          { label: 'High Priority', value: overview.highPriorityTasks,color: 'text-red-600 dark:text-red-400',        bg: 'bg-red-50 dark:bg-red-950' },
        ].map((m) => (
          <motion.div key={m.label} whileHover={{ y: -2 }} className="card p-5">
            <div className={`text-3xl font-bold mb-1 ${m.color}`}>{m.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Donut */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Task Status</h3>
          <div className="h-56">
            <Doughnut data={statusData} options={{ ...chartBaseOpts, cutout: '65%' }} />
          </div>
        </motion.div>

        {/* Priority Bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Priority Distribution</h3>
          <div className="h-56">
            <Bar data={priorityData} options={barOpts} />
          </div>
        </motion.div>

        {/* Monthly Line */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <HiTrendingUp className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Monthly Task Creation (Last 12 Months)</h3>
          </div>
          <div className="h-64">
            <Line data={monthlyData} options={lineOpts} />
          </div>
        </motion.div>

        {/* Category Donut */}
        {categoryDistribution.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Category Distribution</h3>
            <div className="h-56">
              <Doughnut data={categoryData} options={{ ...chartBaseOpts, cutout: '65%' }} />
            </div>
          </motion.div>
        )}

        {/* Completion gauge */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6 flex flex-col items-center justify-center">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-6">Completion Rate</h3>
          <div className="relative h-40 w-40 mb-4">
            <svg viewBox="0 0 100 100" className="transform -rotate-90 h-full w-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="#6366f1" strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40 * overview.completionRate / 100} ${2 * Math.PI * 40}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold gradient-text">{overview.completionRate}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {overview.completedTasks} of {overview.totalTasks} tasks completed
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
