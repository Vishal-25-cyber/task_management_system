import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center relative overflow-hidden px-12">
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-60 w-60 bg-purple-600/20 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow">
              <HiSparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            TaskFlow <span className="gradient-text">Pro</span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-md">
            The modern task management platform designed for teams and individuals who want to work smarter.
          </p>

          {/* Feature bullets */}
          {[
            '✦ Kanban boards with drag & drop',
            '✦ Analytics and productivity insights',
            '✦ Smart due date reminders',
            '✦ Dark mode support',
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="text-left text-slate-300 text-sm py-1.5"
            >
              {f}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
              <HiSparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TaskFlow Pro</span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
