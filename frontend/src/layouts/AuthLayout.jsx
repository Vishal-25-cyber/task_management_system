import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/auth-bg.png')" }}
    >
      {/* Premium dark gradient mask and blur overlay for extreme readability */}
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[3px] pointer-events-none" />

      {/* Modern ambient glowing orbs in corners */}
      <div className="absolute -top-32 -left-32 h-[350px] w-[350px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-[350px] w-[350px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Central Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-slate-950/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
      >
        {/* Glowing top line accent */}
        <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-indigo-500 to-violet-600" />

        <div className="p-8">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-glow mb-4 hover:scale-105 transition-transform duration-300">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 22h20L12 2z" />
                <path d="M12 17l-3-3h6l-3 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">
              Task<span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-indigo-400">Hub</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Sleek workspaces to orchestrate tasks, coordinate deadlines, and visualize productivity.
            </p>
          </div>

          {/* Child Routes (Login / Register forms) */}
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
