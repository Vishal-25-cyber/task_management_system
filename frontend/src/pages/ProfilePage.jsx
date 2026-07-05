import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  HiUser, HiMail, HiCalendar, HiPencil, HiLockClosed, HiUpload,
  HiLocationMarker, HiPhone, HiOfficeBuilding, HiFire,
  HiLightningBolt, HiFolderOpen, HiShieldCheck
} from 'react-icons/hi';
import { HiTrophy } from 'react-icons/hi2';
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

  const profileForm = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      title: user?.title || '',
      department: user?.department || '',
      bio: user?.bio || '',
      location: user?.location || '',
      phone: user?.phone || ''
    }
  });
  const passwordForm = useForm();

  // Metrics for achievements
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const favoriteTasks = tasks.filter(t => t.favorite).length;
  const uniqueCategories = useMemo(() => new Set(tasks.map(t => t.category)).size, [tasks]);

  // Gamified Badges calculation
  const badges = [
    {
      id: 'first_strike',
      title: 'First Strike',
      desc: 'Complete your first task',
      unlocked: completedTasks >= 1,
      icon: HiLightningBolt,
      color: 'from-amber-400 to-orange-500',
      progress: Math.min(completedTasks, 1),
      target: 1
    },
    {
      id: 'task_master',
      title: 'Task Conqueror',
      desc: 'Complete 10 tasks successfully',
      unlocked: completedTasks >= 10,
      icon: HiTrophy,
      color: 'from-yellow-400 to-amber-600',
      progress: Math.min(completedTasks, 10),
      target: 10
    },
    {
      id: 'star_collector',
      title: 'Star Collector',
      desc: 'Favorite 5 important tasks',
      unlocked: favoriteTasks >= 5,
      icon: HiFire,
      color: 'from-pink-500 to-rose-600',
      progress: Math.min(favoriteTasks, 5),
      target: 5
    },
    {
      id: 'organized_champion',
      title: 'Organized Guru',
      desc: 'Classify tasks in 3+ categories',
      unlocked: uniqueCategories >= 3,
      icon: HiFolderOpen,
      color: 'from-indigo-500 to-purple-600',
      progress: Math.min(uniqueCategories, 3),
      target: 3
    }
  ];

  // Simulated 28-day completion heatmap
  const heatmapDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      // Count tasks completed on this date (simulate/mock using due date / updated date)
      const count = tasks.filter(t => {
        if (t.status !== 'Completed' || !t.updatedAt) return false;
        return t.updatedAt.split('T')[0] === dateString;
      }).length;

      days.push({
        date: d,
        count,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return days;
  }, [tasks]);

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
          title: user?.title || '',
          department: user?.department || '',
          bio: user?.bio || '',
          location: user?.location || '',
          phone: user?.phone || '',
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
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your personal directory card, achievements, security credentials and stats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2 span) - Main profile and activity maps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main User Card */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
              {/* Avatar Upload */}
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

              {/* Bio & Details Display */}
              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{user?.name}</h2>
                  {user?.title && (
                    <span className="inline-flex self-center sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/30">
                      {user.title}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email}</p>
                {user?.bio ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 italic bg-slate-50/50 dark:bg-slate-800/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{user.bio}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">No bio description set yet.</p>
                )}

                <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  {user?.department && (
                    <div className="flex items-center gap-1">
                      <HiOfficeBuilding className="h-4 w-4 text-slate-400" />
                      <span>{user.department}</span>
                    </div>
                  )}
                  {user?.location && (
                    <div className="flex items-center gap-1">
                      <HiLocationMarker className="h-4 w-4 text-slate-400" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user?.phone && (
                    <div className="flex items-center gap-1">
                      <HiPhone className="h-4 w-4 text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <HiCalendar className="h-4 w-4 text-slate-400" />
                    <span>Joined {formatDate(user?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit / View Form */}
            {editMode ? (
              <motion.form
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}><HiUser className="inline h-4 w-4 mr-1 text-slate-400" />Name</label>
                    <input {...profileForm.register('name', { required: 'Required' })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}><HiMail className="inline h-4 w-4 mr-1 text-slate-400" />Email</label>
                    <input type="email" {...profileForm.register('email', { required: 'Required' })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input {...profileForm.register('title')} className={inputClass} placeholder="e.g. Lead Designer" />
                  </div>
                  <div>
                    <label className={labelClass}>Department</label>
                    <input {...profileForm.register('department')} className={inputClass} placeholder="e.g. Operations" />
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input {...profileForm.register('location')} className={inputClass} placeholder="e.g. London, UK" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input {...profileForm.register('phone')} className={inputClass} placeholder="e.g. +44 7911 123456" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Short Biography</label>
                  <textarea {...profileForm.register('bio')} className={`${inputClass} h-20 resize-none`} placeholder="Write a short description about yourself..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setEditMode(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" variant="primary" loading={profileLoading} className="flex-1">Save Profile</Button>
                </div>
              </motion.form>
            ) : (
              <Button icon={<HiPencil className="h-4 w-4" />} variant="outline" onClick={() => setEditMode(true)}>
                Edit Profile Cards
              </Button>
            )}
          </div>

          {/* Activity Heatmap Grid */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Activity Contribution Tracker</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Task completions log across the last 28 days.</p>
            
            <div className="flex flex-wrap items-center gap-1.5">
              {heatmapDays.map((day, idx) => {
                let colorClass = 'bg-slate-100 dark:bg-slate-800'; // 0
                if (day.count === 1) colorClass = 'bg-indigo-300 dark:bg-indigo-900/60';
                if (day.count === 2) colorClass = 'bg-indigo-400 dark:bg-indigo-700/80';
                if (day.count >= 3) colorClass = 'bg-indigo-600 dark:bg-indigo-500';

                return (
                  <div
                    key={idx}
                    title={`${day.count} task(s) completed on ${day.label}`}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${colorClass} ${day.count > 0 ? 'text-white' : 'text-slate-400 dark:text-slate-500'} cursor-help transition-all hover:scale-110`}
                  >
                    {day.count > 0 ? day.count : ''}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              <span>28 days ago</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <span className="h-3.5 w-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/10" />
                <span className="h-3.5 w-3.5 rounded bg-indigo-300 dark:bg-indigo-900/60" />
                <span className="h-3.5 w-3.5 rounded bg-indigo-400 dark:bg-indigo-700/80" />
                <span className="h-3.5 w-3.5 rounded bg-indigo-600 dark:bg-indigo-500" />
                <span>More</span>
              </div>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Right column (1 span) - Gamified Trophies & Credentials */}
        <div className="space-y-6">
          {/* Trophies Case / Badges */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
              <HiTrophy className="h-5 w-5 text-yellow-500" />
              Achievements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Earn badges by being active and completing tasks.</p>

            <div className="space-y-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex gap-3.5 p-3 rounded-xl border transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-r from-slate-50/50 to-indigo-50/20 dark:from-slate-800/10 dark:to-indigo-950/10 border-indigo-200/40 dark:border-indigo-500/10'
                      : 'bg-slate-50/20 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800/50 opacity-60'
                  }`}
                >
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${badge.unlocked ? badge.color : 'from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800'} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                    <badge.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{badge.title}</span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{badge.unlocked ? 'Unlocked' : `${badge.progress}/${badge.target}`}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{badge.desc}</p>
                    
                    {!badge.unlocked && (
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${(badge.progress / badge.target) * 100}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
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
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input
                  type="password"
                  {...passwordForm.register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input
                  type="password"
                  {...passwordForm.register('confirmPassword', { required: 'Required' })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" variant="primary" loading={passwordLoading} className="w-full">
                Update Password
              </Button>
            </form>
          </div>

          {/* Session Security */}
          <div className="card p-6 border-slate-200/50 dark:border-slate-800/50 bg-slate-50/10">
            <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <HiShieldCheck className="h-4.5 w-4.5 text-green-500" />
              Active Session Status
            </h3>
            <div className="space-y-2 text-[10px] text-slate-500">
              <div className="flex justify-between">
                <span>Platform:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Windows (Web browser)</span>
              </div>
              <div className="flex justify-between">
                <span>Session State:</span>
                <span className="font-semibold text-green-500">Active (Secure JWT)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
