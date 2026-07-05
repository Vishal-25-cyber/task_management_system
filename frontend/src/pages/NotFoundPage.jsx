import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHome } from 'react-icons/hi';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="text-9xl font-black gradient-text mb-4">404</div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Page Not Found</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
      >
        <HiHome className="h-5 w-5" />
        Back to Dashboard
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
