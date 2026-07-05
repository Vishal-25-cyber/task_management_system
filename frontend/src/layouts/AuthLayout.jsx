import { Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex relative overflow-hidden">
      {/* Mesh gradients for modern background depth */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center relative overflow-hidden px-12 border-r border-white/5">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 text-center max-w-md w-full"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-glow relative overflow-hidden">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 22h20L12 2z" />
                <path d="M12 17l-3-3h6l-3 3z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-wide">
            Task<span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-indigo-400">Hub</span>
          </h1>
          <p className="text-base text-slate-400 mb-10">
            A premium workspaces platform designed to help teams orchestrate tasks, analyze workflow metrics, and stay synchronized.
          </p>

          {/* Feature bullets */}
          <div className="space-y-3 bg-white/5 border border-white/5 p-5 rounded-2xl backdrop-blur-lg text-left shadow-card">
            {[
              '✦ Agile Kanban boards with drag & drop',
              '✦ Dynamic analytics & productivity insights',
              '✦ Automated email reminders on overdue tasks',
              '✦ Modern dark/light theme switching support',
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-slate-300 text-sm flex items-center gap-2 font-medium"
              >
                {f}
              </motion.div>
            ))}
          </div>

          {/* Floating Workspace Previews */}
          <div className="mt-12 relative h-48 w-full flex justify-center items-center select-none pointer-events-none">
            {/* Glassmorphic Kanban Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 bg-white/[0.03] dark:bg-slate-900/[0.2] backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl w-48 text-left"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded">Work</span>
                <span className="h-2 w-2 rounded-full bg-rose-500" />
              </div>
              <h4 className="text-xs font-semibold text-white truncate">Launch TaskHub 🚀</h4>
              <p className="text-[10px] text-slate-400 mt-1">Implement premium UI...</p>
              <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-400">
                <span>Today</span>
                <span className="font-semibold text-slate-300">High</span>
              </div>
            </motion.div>

            {/* Glassmorphic Progress Card */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-0 bg-white/[0.03] dark:bg-slate-900/[0.2] backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl w-48 text-left"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">Analytics</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <h4 className="text-xs font-semibold text-white truncate">Productivity Rate</h4>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-400 to-indigo-500 h-full w-[84%]" />
                </div>
                <span className="text-[9px] font-bold text-emerald-400">84%</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-6 z-10">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-glow-sm">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 22h20L12 2z" />
                <path d="M12 17l-3-3h6l-3 3z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">
              Task<span className="text-indigo-400">Hub</span>
            </span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
