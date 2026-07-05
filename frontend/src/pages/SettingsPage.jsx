import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  HiMoon, HiSun, HiLogout, HiInformationCircle, HiBell,
  HiAdjustments, HiShieldCheck, HiServer, HiSparkles, HiShieldExclamation
} from 'react-icons/hi';
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 cursor-pointer ${enabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SelectSetting = ({ label, description, value, options, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div>
      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
      {description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</div>}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Local state for interactive features
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState('Work');
  const [defaultPriority, setDefaultPriority] = useState('Medium');
  const [autoArchive, setAutoArchive] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggle2FA = () => {
    setTwoFactor(!twoFactor);
    toast.success(`Two-Factor Authentication turned ${!twoFactor ? 'ON' : 'OFF'}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your personal preferences, notifications, and application environment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (2 span) - General Preferences & System settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appearance & Style */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HiSun className="h-5 w-5 text-indigo-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Theme Preferences</h2>
            </div>
            <ToggleSetting
              label="Dark Theme"
              description="Switch between light and dark interface styles"
              enabled={isDark}
              onChange={toggleTheme}
            />
          </div>

          {/* Task Defaults */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HiAdjustments className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Task Defaults</h2>
            </div>
            <SelectSetting
              label="Default Task Category"
              description="Set default category selected during task creation"
              value={defaultCategory}
              options={[
                { label: 'Work', value: 'Work' },
                { label: 'College', value: 'College' },
                { label: 'Study', value: 'Study' },
                { label: 'Personal', value: 'Personal' },
                { label: 'Shopping', value: 'Shopping' },
                { label: 'Others', value: 'Others' }
              ]}
              onChange={(val) => {
                setDefaultCategory(val);
                toast.success(`Default category set to ${val}`);
              }}
            />
            <SelectSetting
              label="Default Priority"
              description="Default urgency level for new tasks"
              value={defaultPriority}
              options={[
                { label: 'Low', value: 'Low' },
                { label: 'Medium', value: 'Medium' },
                { label: 'High', value: 'High' }
              ]}
              onChange={(val) => {
                setDefaultPriority(val);
                toast.success(`Default priority set to ${val}`);
              }}
            />
            <ToggleSetting
              label="Auto-Archive Completed"
              description="Automatically archive completed tasks after 7 days"
              enabled={autoArchive}
              onChange={() => {
                setAutoArchive(!autoArchive);
                toast.success(`Auto-archive turned ${!autoArchive ? 'ON' : 'OFF'}`);
              }}
            />
          </div>

          {/* Notifications Preferences */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HiBell className="h-5 w-5 text-rose-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Notification Alerts</h2>
            </div>
            <ToggleSetting
              label="Email Notifications"
              description="Receive weekly summaries and overdue alerts via email"
              enabled={emailAlerts}
              onChange={() => setEmailAlerts(!emailAlerts)}
            />
            <ToggleSetting
              label="Real-time Web Push Alerts"
              description="Get instant browser notifications for task milestones"
              enabled={pushAlerts}
              onChange={() => {
                setPushAlerts(!pushAlerts);
                if (!pushAlerts) toast.success('Browser notification requests enabled!');
              }}
            />
          </div>
        </div>

        {/* Right Column (1 span) - About, Environment & Security */}
        <div className="space-y-6">
          {/* Environment Info */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HiServer className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">System Environment</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Database connection:</span>
                <span className="font-semibold text-green-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-ping" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Server Latency:</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">12ms</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Client Engine:</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">React + Vite</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HiInformationCircle className="h-5 w-5 text-indigo-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">About Product</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <HiSparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">TaskFlow Pro</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Version 1.0.0</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Production-grade SaaS Platform</div>
              </div>
            </div>
          </div>

          {/* Security Log & 2FA */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HiShieldCheck className="h-5 w-5 text-green-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Security Credentials</h2>
            </div>
            <ToggleSetting
              label="Two-Factor Auth (2FA)"
              description="Protect your account with verification codes"
              enabled={twoFactor}
              onChange={toggle2FA}
            />
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Active Login:</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">Chrome, Windows</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Last Password Change:</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">July 5, 2026</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border-red-200 dark:border-red-950/40 bg-red-50/10">
            <div className="flex items-center gap-2 mb-4 border-b border-red-100 dark:border-red-950/20 pb-2">
              <HiShieldExclamation className="h-5 w-5 text-red-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Danger Zone</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Disconnect from current device sessions by signing out from this application securely.</p>
            <Button
              variant="danger"
              icon={<HiLogout className="h-4 w-4" />}
              onClick={handleLogout}
              className="w-full"
            >
              Sign Out Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
