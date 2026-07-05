const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default:  'bg-slate-100  dark:bg-slate-800  text-slate-600  dark:text-slate-300',
    primary:  'bg-indigo-50  dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
    success:  'bg-green-50   dark:bg-green-950  text-green-700  dark:text-green-300',
    warning:  'bg-amber-50   dark:bg-amber-950  text-amber-700  dark:text-amber-300',
    danger:   'bg-red-50     dark:bg-red-950    text-red-700    dark:text-red-300',
    info:     'bg-cyan-50    dark:bg-cyan-950   text-cyan-700   dark:text-cyan-300',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2   py-0.5 text-xs',
    md: 'px-2.5 py-1   text-sm',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border border-transparent ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
