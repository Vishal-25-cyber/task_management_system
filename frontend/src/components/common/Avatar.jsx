import { getInitials } from '../../utils/helpers';

const COLORS = [
  'from-indigo-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-orange-600',
  'from-green-500 to-teal-600',
  'from-violet-500 to-fuchsia-600',
];

const getColor = (name) => {
  const idx = (name?.charCodeAt(0) || 0) % COLORS.length;
  return COLORS[idx];
};

const Avatar = ({ name, size = 'md', className = '' }) => {
  const sizes = {
    xs:  'h-6  w-6  text-xs',
    sm:  'h-8  w-8  text-sm',
    md:  'h-10 w-10 text-sm',
    lg:  'h-12 w-12 text-base',
    xl:  'h-16 w-16 text-xl',
    '2xl':'h-20 w-20 text-2xl',
  };

  return (
    <div
      className={`flex-shrink-0 ${sizes[size]} rounded-full bg-gradient-to-br ${getColor(name)} flex items-center justify-center text-white font-bold shadow-sm ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
