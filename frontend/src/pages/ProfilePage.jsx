import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiCalendar, HiPencil, HiLockClosed, HiUpload, HiSun, HiInformationCircle, HiLogout } from 'react-icons/hi';
import { HiSparkles } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

const inputClass = 'w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
const errorClass = 'text-xs text-red-500 mt-1';

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

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const profileForm = useForm({ defaultValues: { name: user?.name, email: user?.email } });
  const passwordForm = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        setProfileLoading(true);
        const res = await authService.updateProfile({
          name: user?.name,
          email: user?.email,
          avatar: base64String
        });
        updateUser(res.data.user);
        toast.success('📸 Profile picture updated!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update avatar');
      } finally {
        setProfileLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    try {
      const res = await authService.updateProfile({
        ...data,
        avatar: user?.avatar
      });
      updateUser(res.data.user);
      toast.success('✅ Profile updated!');
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('✅ Password changed!');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Profile & Settings</h1>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
          {/* Avatar Upload */}
          <div className="relative group cursor-pointer h-20 w-20 rounded-full shadow-md overflow-hidden flex-shrink-0">
            <Avatar name={user?.name} url={user?.avatar} size="2xl" />
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
              <HiUpload className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
              <HiCalendar className="h-3.5 w-3.5" />
              <span>Member since {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {editMode ? (
          <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-4"
          >
            <div>
              <label className={labelClass}><HiUser className="inline h-4 w-4 mr-1" />Name</label>
              <input
                {...profileForm.register('name', { required: 'Name required', minLength: { value: 2, message: 'Too short' } })}
                className={inputClass}
              />
              {profileForm.formState.errors.name && <p className={errorClass}>{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}><HiMail className="inline h-4 w-4 mr-1" />Email</label>
              <input
                type="email"
                {...profileForm.register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                className={inputClass}
              />
              {profileForm.formState.errors.email && <p className={errorClass}>{profileForm.formState.errors.email.message}</p>}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setEditMode(false)} className="flex-1">Cancel</Button>
              <Button type="submit" variant="primary" loading={profileLoading} className="flex-1">Save Changes</Button>
            </div>
          </motion.form>
        ) : (
          <Button icon={<HiPencil className="h-4 w-4" />} variant="outline" onClick={() => setEditMode(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {/* Appearance Settings */}
      <div className="card p-6">
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

      {/* Change Password */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <HiLockClosed className="h-5 w-5 text-slate-400" />
          Change Password
        </h3>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              {...passwordForm.register('currentPassword', { required: 'Required' })}
              className={inputClass}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              {...passwordForm.register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
              className={inputClass}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              {...passwordForm.register('confirmPassword', { required: 'Required' })}
              className={inputClass}
              placeholder="Confirm new password"
            />
          </div>
          <Button type="submit" variant="primary" loading={passwordLoading}>
            Update Password
          </Button>
        </form>
      </div>

      {/* About */}
      <div className="card p-6">
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

export default ProfilePage;
