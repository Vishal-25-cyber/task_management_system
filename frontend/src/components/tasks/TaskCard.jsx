import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiStar, HiOutlineStar, HiPencil, HiTrash, HiArchive, HiCalendar, HiClock, HiTag, HiFlag } from 'react-icons/hi';
import { HiArrowUpTray } from 'react-icons/hi2';
import Badge from '../common/Badge';
import { formatDate, getDueDateStatus, getPriorityColor, getStatusColor, getCategoryColor } from '../../utils/helpers';

const priorityVariant = { High: 'danger', Medium: 'warning', Low: 'success' };
const statusVariant = { Pending: 'primary', 'In Progress': 'warning', Completed: 'success' };

const TaskCard = ({ task, onEdit, onDelete, onArchive, onFavorite, onView }) => {
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const dueStat = getDueDateStatus(task.dueDate, task.status);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    setFavoriteLoading(true);
    try { await onFavorite(task._id); } finally { setFavoriteLoading(false); }
  };

  const dueBadgeMap = {
    overdue:  { cls: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800', label: 'Overdue' },
    today:    { cls: 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800', label: 'Due Today' },
    upcoming: { cls: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800', label: 'Due Soon' },
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -2 }}
      className="card p-5 cursor-pointer group"
      onClick={() => onView?.(task)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 flex-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {task.title}
        </h3>
        <button
          onClick={handleFavorite}
          disabled={favoriteLoading}
          className="flex-shrink-0 text-slate-400 hover:text-amber-500 transition-colors"
        >
          {task.favorite
            ? <HiStar className="h-5 w-5 text-amber-400" />
            : <HiOutlineStar className="h-5 w-5" />
          }
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant={priorityVariant[task.priority] || 'default'} size="xs">
          <HiFlag className="h-3 w-3" /> {task.priority}
        </Badge>
        <Badge variant={statusVariant[task.status] || 'default'} size="xs">
          {task.status}
        </Badge>
        <Badge variant="default" size="xs">
          <HiTag className="h-3 w-3" /> {task.category}
        </Badge>
      </div>

      {/* Due date + due badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <HiCalendar className="h-3.5 w-3.5" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
        {dueStat && dueStat !== 'normal' && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dueBadgeMap[dueStat]?.cls}`}>
            {dueBadgeMap[dueStat]?.label}
          </span>
        )}
      </div>

      {/* Actions (show on hover) */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-all"
        >
          <HiPencil className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onArchive?.(task._id); }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg transition-all"
        >
          {task.archived ? <HiArrowUpTray className="h-3.5 w-3.5" /> : <HiArchive className="h-3.5 w-3.5" />}
          {task.archived ? 'Restore' : 'Archive'}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(task._id); }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-all"
        >
          <HiTrash className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </motion.div>
  );
};

export default TaskCard;
