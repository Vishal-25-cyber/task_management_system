import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome, HiClipboardList, HiViewBoards, HiCalendar, HiChartBar,
  HiStar, HiArchive, HiUser, HiCog, HiLogout, HiMenu, HiX,
  HiMoon, HiSun, HiBell, HiSearch, HiChevronRight,
} from 'react-icons/hi';
import { HiSparkles } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { taskService } from '../services/taskService';
import { getDueDateStatus, formatDateTime } from '../utils/helpers';

const NAV_ITEMS = [
  { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
  { path: '/tasks', icon: HiClipboardList, label: 'Tasks' },
  { path: '/kanban', icon: HiViewBoards, label: 'Kanban Board' },
  { path: '/calendar', icon: HiCalendar, label: 'Calendar' },
  { path: '/analytics', icon: HiChartBar, label: 'Analytics' },
  { path: '/favorites', icon: HiStar, label: 'Favorites' },
  { path: '/archived', icon: HiArchive, label: 'Archived' },
];

const BOTTOM_ITEMS = [
  { path: '/profile', icon: HiUser, label: 'Profile' },
];

const SidebarLink = ({ item, collapsed }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      `flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative border ${isActive
        ? 'bg-gradient-to-r from-indigo-500/80 to-purple-600/80 dark:from-indigo-600/75 dark:to-purple-700/75 text-white shadow-glow border-indigo-400/20 dark:border-indigo-500/20'
        : 'text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border-transparent hover:border-slate-200/30 dark:hover:border-slate-700/10'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110`} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {isActive && (
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
        )}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {item.label}
          </div>
        )}
      </>
    )}
  </NavLink>
);

// Standalone clock — isolated so its 1-second tick never re-renders DashboardLayout
const LiveClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');
  const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="ml-auto flex items-center gap-3"
    >
      <span className="hidden md:block text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
        {date}
      </span>
      <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-slate-700" />
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-bold tabular-nums tracking-tight text-slate-800 dark:text-slate-100">
          {hh}:{mm}
        </span>
        <span className="text-xs font-semibold tabular-nums text-slate-400 dark:text-slate-500 ml-0.5">
          :{ss}
        </span>
      </div>
    </motion.div>
  );
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { updateFilters } = useTaskContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationTasks, setNotificationTasks] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotificationTasks = async () => {
    if (!user) return;
    try {
      const { data } = await taskService.getTasks({ archived: 'false' });
      setNotificationTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch notification tasks', err);
    }
  };

  useEffect(() => {
    fetchNotificationTasks();
    const interval = setInterval(fetchNotificationTasks, 60000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#notification-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    updateFilters({ search: val });
  };

  const isTasksPage = location.pathname === '/tasks';
  const isDashboardPage = location.pathname === '/dashboard';

  const overdueAlerts = notificationTasks.filter(t => getDueDateStatus(t.dueDate, t.status) === 'overdue');
  const dueTodayAlerts = notificationTasks.filter(t => getDueDateStatus(t.dueDate, t.status) === 'today');
  const totalAlertsCount = overdueAlerts.length + dueTodayAlerts.length;

  const SidebarContent = ({ collapsed = false }) => (
    <div className="flex flex-col h-full relative z-10">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 mb-2">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 via-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-glow-sm relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 22h20L12 2z" />
            <path d="M12 17l-3-3h6l-3 3z" />
          </svg>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-indigo-200 text-base tracking-wide leading-tight font-sans">TaskHub</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-3 border-t border-slate-200/20 dark:border-slate-800/30" />

      {/* Bottom items */}
      <div className="px-3 pb-3 space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} collapsed={collapsed} />
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-all group"
        >
          <HiLogout className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 bg-[url('/bg-light.png')] dark:bg-[url('/bg-dark.png')] bg-cover bg-center overflow-hidden transition-all duration-500">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 76 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-white/15 dark:bg-slate-950/20 backdrop-blur-2xl border border-white/20 dark:border-white/10 m-4 rounded-2xl shadow-2xl flex-shrink-0 relative group/sidebar"
      >
        {/* Glowing background accent circles to blend with wallpaper */}
        <div className="absolute -top-12 -left-12 h-36 w-36 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 h-40 w-40 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <SidebarContent collapsed={sidebarCollapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed((p) => !p)}
          className="absolute top-6 -right-3 h-6 w-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-md transition-all z-10 cursor-pointer"
        >
          <motion.div animate={{ rotate: sidebarCollapsed ? 0 : 180 }}>
            <HiChevronRight className="h-3.5 w-3.5" />
          </motion.div>
        </button>
      </motion.aside>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 bg-white/20 dark:bg-slate-950/30 backdrop-blur-2xl border-r border-white/20 dark:border-white/10 z-50 lg:hidden relative overflow-hidden"
            >
              {/* Glowing background accent circles to blend with wallpaper */}
              <div className="absolute -top-12 -left-12 h-32 w-32 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 h-36 w-36 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden my-4 mx-4 lg:ml-0 lg:mr-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-xl">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200/35 dark:border-slate-800/35 flex items-center gap-4 px-4 lg:px-6 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <HiMenu className="h-5 w-5" />
          </button>

          {/* Search — Tasks page only */}
          {isTasksPage && (
            <div className="flex-1 max-w-md relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>
          )}

          {/* Live clock — right side, all pages except Dashboard and Tasks */}
          {!isDashboardPage && !isTasksPage && <LiveClock />}

          {/* Right-side icons — Dashboard only */}
          {isDashboardPage && (
            <div className="flex items-center gap-2 ml-auto">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                {isDark ? <HiSun className="h-5 w-5" /> : <HiMoon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <div id="notification-container" className="relative">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors relative cursor-pointer"
                >
                  <HiBell className="h-5 w-5" />
                  {totalAlertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                      {totalAlertsCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-200/55 dark:border-slate-800/55 flex justify-between items-center">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Notifications</span>
                        {totalAlertsCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-medium">
                            {totalAlertsCount} Alert{totalAlertsCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto p-2 divide-y divide-slate-100/50 dark:divide-slate-800/50">
                        {totalAlertsCount === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                            🎉 No pending alerts! All tasks are on schedule.
                          </div>
                        ) : (
                          <>
                            {overdueAlerts.map((task) => (
                              <div
                                key={task._id}
                                onClick={() => {
                                  setShowNotifications(false);
                                  navigate('/tasks');
                                }}
                                className="p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-red-500 mt-0.5">🔴</span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
                                    <p className="text-[10px] text-red-500 mt-0.5">Overdue: {formatDateTime(task.dueDate)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {dueTodayAlerts.map((task) => (
                              <div
                                key={task._id}
                                onClick={() => {
                                  setShowNotifications(false);
                                  navigate('/tasks');
                                }}
                                className="p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5">🟠</span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
                                    <p className="text-[10px] text-orange-500 mt-0.5">Due Today: {formatDateTime(task.dueDate)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <Avatar name={user?.name} url={user?.avatar} size="sm" />
              </button>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
