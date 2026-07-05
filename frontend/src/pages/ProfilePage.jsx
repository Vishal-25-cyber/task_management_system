import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiUser, HiMail, HiCalendar, HiPencil, HiLockClosed, HiUpload,
  HiSun, HiInformationCircle, HiLogout, HiBell, HiSparkles
} from 'react-icons/hi';
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
  const [emailLoading, setEmailLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Image Crop states
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);

  // Canvas drawing effect for circular crop area
  useEffect(() => {
    if (!selectedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = canvas.width; // 240px

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const imgWidth = selectedImage.width;
    const imgHeight = selectedImage.height;

    // Scale to cover canvas circle
    const ratio = Math.max(size / imgWidth, size / imgHeight);
    const width = imgWidth * ratio * scale;
    const height = imgHeight * ratio * scale;

    // Manual dragging offsets centered on canvas
    const x = (size - width) / 2 + position.x;
    const y = (size - height) / 2 + position.y;

    ctx.save();
    
    // Draw outer dark overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(0, 0, size, size);

    // Circular crop cutout
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Reset composite operation to draw the image inside
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(selectedImage, x, y, width, height);

    ctx.restore();

    // Draw circular guideline border
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [selectedImage, scale, position]);

  // Dragging event handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Notifications toggles state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');

  const profileForm = useForm({ defaultValues: { name: user?.name, email: user?.email } });
  const passwordForm = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setSelectedImage(img);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setShowCropModal(true);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    // Reset file input value so same file can be selected again
    e.target.value = null;
  };

  const handleSaveCrop = async () => {
    if (!canvasRef.current) return;
    
    // Create an offscreen canvas to output only the circular cropped region cleanly without overlays
    const size = 240;
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const oCtx = offscreen.getContext('2d');

    const imgWidth = selectedImage.width;
    const imgHeight = selectedImage.height;
    const ratio = Math.max(size / imgWidth, size / imgHeight);
    const width = imgWidth * ratio * scale;
    const height = imgHeight * ratio * scale;
    const x = (size - width) / 2 + position.x;
    const y = (size - height) / 2 + position.y;

    oCtx.save();
    oCtx.beginPath();
    oCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    oCtx.clip();
    oCtx.drawImage(selectedImage, x, y, width, height);
    oCtx.restore();

    const base64String = offscreen.toDataURL('image/jpeg', 0.92);

    try {
      setProfileLoading(true);
      const res = await authService.updateProfile({
        name: user?.name,
        email: user?.email,
        avatar: base64String
      });
      updateUser(res.data.user);
      toast.success('📸 Profile picture updated successfully!');
      setShowCropModal(false);
      setSelectedImage(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update avatar');
    } finally {
      setProfileLoading(false);
    }
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

  const handleSendTestEmail = async () => {
    setEmailLoading(true);
    setEmailPreviewUrl('');
    try {
      const { data } = await authService.sendTestEmail();
      toast.success('✉️ Test notification email sent!');
      if (data.previewUrl) {
        setEmailPreviewUrl(data.previewUrl);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your personal credentials, workspace preferences, and mail notification channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (2 span) - Main profile and settings config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details Card */}
          <div className="card p-6">
            <div className="flex items-center gap-5 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
              {/* Avatar Upload */}
              <div className="relative group cursor-pointer h-20 w-20 rounded-full shadow-md overflow-hidden flex-shrink-0 border-2 border-indigo-500/20">
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
                Edit Account Info
              </Button>
            )}
          </div>

          {/* Mail Notifications Preferences Card */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HiBell className="h-5 w-5 text-indigo-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Email Notification Channels</h2>
            </div>
            <ToggleSetting
              label="Email Summary & Digests"
              description="Receive weekly summaries, statistics, and pending task alerts"
              enabled={emailAlerts}
              onChange={() => setEmailAlerts(!emailAlerts)}
            />
            <ToggleSetting
              label="Task Reminders"
              description="Receive instant alerts before scheduled deadlines expire"
              enabled={systemAlerts}
              onChange={() => setSystemAlerts(!systemAlerts)}
            />

            {/* Test Email Button */}
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Test SMTP Integration</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Send a test notification to check your SMTP server status.</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendTestEmail}
                  loading={emailLoading}
                >
                  Send Test Email
                </Button>
              </div>
              {emailPreviewUrl && (
                <div className="mt-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between gap-2">
                  <span>✉️ Email generated successfully. Open local HTML preview:</span>
                  <a href={emailPreviewUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-indigo-800">
                    Open Preview
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Appearance & Themes settings */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HiSun className="h-5 w-5 text-indigo-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Appearance</h2>
            </div>
            <ToggleSetting
              label="Dark Theme"
              description="Switch between light and dark interface styles"
              enabled={isDark}
              onChange={toggleTheme}
            />
          </div>
        </div>

        {/* Right Column (1 span) - Change Password, About & Danger Zone */}
        <div className="space-y-6">
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

          {/* Danger Zone */}
          <div className="card p-6 border-red-200 dark:border-red-950/40 bg-red-50/10">
            <div className="flex items-center gap-2 mb-4 border-b border-red-100 dark:border-red-950/20 pb-2">
              <HiLogout className="h-5 w-5 text-red-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Security</h2>
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

      {/* Crop Modal */}
      <AnimatePresence>
        {showCropModal && selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Crop Profile Picture</h3>
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setSelectedImage(null);
                  }}
                  className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6 max-w-xs">
                  Drag the image to position it inside the circle guide, and use the zoom slider below to adjust.
                </p>

                {/* Cropping Area Canvas */}
                <div className="relative h-[240px] w-[240px] rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-inner flex items-center justify-center cursor-move select-none touch-none">
                  <canvas
                    ref={canvasRef}
                    width={240}
                    height={240}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    className="w-full h-full select-none"
                  />
                </div>

                {/* Zoom Control Slider */}
                <div className="w-full mt-8 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Zoom Out</span>
                    <span>Zoom In ({Math.round(scale * 100)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCropModal(false);
                    setSelectedImage(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveCrop}
                  loading={profileLoading}
                  className="flex-1"
                >
                  Crop & Save
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
