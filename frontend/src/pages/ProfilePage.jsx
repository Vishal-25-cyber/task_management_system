import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  HiUser, HiMail, HiCalendar, HiPencil, HiLockClosed, HiUpload,
  HiClipboardList, HiCheckCircle, HiRefresh, HiClock, HiStar
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useTaskContext } from '../context/TaskContext';
import { authService } from '../services/authService';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

const inputClass = 'w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
const errorClass = 'text-xs text-red-500 mt-1';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { tasks } = useTaskContext();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const profileForm = useForm({ defaultValues: { name: user?.name, email: user?.email } });
  const passwordForm = useForm();

  // Stats calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const favoriteTasks = tasks.filter(t => t.favorite).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account information, security, and statistics</p>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: HiClipboardList, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
          { label: 'Completed', value: completedTasks, icon: HiCheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'In Progress', value: inProgressTasks, icon: HiRefresh, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Pending', value: pendingTasks, icon: HiClock, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
          { label: 'Starred', value: favoriteTasks, icon: HiStar, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
        ].map((stat, i) => (
          <div key={i} className="card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{stat.value}</h3>
            </div>
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: User Info Card & Productivity Meter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
              {/* Avatar upload wrapper */}
              <div className="relative group cursor-pointer h-24 w-24 rounded-full shadow-md overflow-hidden flex-shrink-0 border-2 border-indigo-500/20">
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

              <div className="text-center sm:text-left flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{user?.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-2">
                  <HiCalendar className="h-4 w-4" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}><HiUser className="inline h-4 w-4 mr-1 text-slate-400" />Name</label>
                    <input
                      {...profileForm.register('name', { required: 'Name required', minLength: { value: 2, message: 'Too short' } })}
                      className={inputClass}
                    />
                    {profileForm.formState.errors.name && <p className={errorClass}>{profileForm.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}><HiMail className="inline h-4 w-4 mr-1 text-slate-400" />Email</label>
                    <input
                      type="email"
                      {...profileForm.register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                      className={inputClass}
                    />
                    {profileForm.formState.errors.email && <p className={errorClass}>{profileForm.formState.errors.email.message}</p>}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
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

          {/* Productivity Meter */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Task Completion Insights</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Radial Completion Ring */}
              <div className="relative h-28 w-28 flex items-center justify-center flex-shrink-0">
                <svg className="h-full w-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-slate-200 dark:stroke-slate-800 fill-none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-indigo-600 fill-none transition-all duration-500"
                    strokeWidth="10"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * completionRate) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{completionRate}%</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Done</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Keep up the great work!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You have completed <strong className="text-slate-800 dark:text-slate-200">{completedTasks}</strong> tasks out of <strong className="text-slate-800 dark:text-slate-200">{totalTasks}</strong> total tasks assigned to you. Focus on completing your pending tasks to bump this completion rate.
                </p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Password security */}
        <div className="space-y-6">
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
              <Button type="submit" variant="primary" loading={passwordLoading} className="w-full">
                Update Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
