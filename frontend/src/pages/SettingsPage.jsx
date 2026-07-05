import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiMoon, HiSun, HiLogout, HiInformationCircle } from 'react-icons/hi';
import { HiSparkles } from 'react-icons/hi2';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const ToggleSetting = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div>
      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
      {description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</div>}
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>

      {/* Appearance */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <HiSun className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Appearance</h2>
        </div>
        <ToggleSetting
          label="Dark Mode"
          description="Switch between light and dark interface"
          enabled={isDark}
          onChange={toggleTheme}
        />
      </div>

      {/* About */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <HiInformationCircle className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">About</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <HiSparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">TaskFlow Pro</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Version 1.0.0</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Production-quality Task Management SaaS</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-red-200 dark:border-red-900">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Account</h2>
        <Button
          variant="danger"
          icon={<HiLogout className="h-4 w-4" />}
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
