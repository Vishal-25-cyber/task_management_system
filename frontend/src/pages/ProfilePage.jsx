import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiCalendar, HiPencil, HiLockClosed, HiCheck } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
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
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const profileForm = useForm({ defaultValues: { name: user?.name, email: user?.email } });
  const passwordForm = useForm();

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    try {
      const res = await authService.updateProfile(data);
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
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Profile</h1>

      {/* Avatar + info */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <Avatar name={user?.name} size="2xl" />
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
    </div>
  );
};

export default ProfilePage;
