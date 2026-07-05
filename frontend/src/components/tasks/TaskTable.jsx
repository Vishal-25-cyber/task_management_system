import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar, HiOutlineStar, HiPencil, HiTrash, HiArchive, HiCalendar, HiChevronUp, HiChevronDown } from 'react-icons/hi';
import { HiArrowUpTray } from 'react-icons/hi2';
import Badge from '../common/Badge';
import { formatDate, getDueDateStatus } from '../../utils/helpers';

const priorityVariant = { High: 'danger', Medium: 'warning', Low: 'success' };
const statusVariant = { Pending: 'primary', 'In Progress': 'warning', Completed: 'success' };

const TaskTable = ({ tasks, onEdit, onDelete, onArchive, onFavorite, onView }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <HiChevronUp className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />;
    return sortDir === 'asc'
      ? <HiChevronUp className="h-3.5 w-3.5 text-indigo-500" />
      : <HiChevronDown className="h-3.5 w-3.5 text-indigo-500" />;
  };

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none';

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className={thClass} onClick={() => handleSort('title')}>
              <div className="flex items-center gap-1">Title <SortIcon field="title" /></div>
            </th>
            <th className={`${thClass} hidden md:table-cell`}>Category</th>
            <th className={`${thClass} hidden sm:table-cell`} onClick={() => handleSort('priority')}>
              <div className="flex items-center gap-1">Priority <SortIcon field="priority" /></div>
            </th>
            <th className={thClass} onClick={() => handleSort('status')}>
              <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
            </th>
            <th className={`${thClass} hidden lg:table-cell`} onClick={() => handleSort('dueDate')}>
              <div className="flex items-center gap-1">Due Date <SortIcon field="dueDate" /></div>
            </th>
            <th className={thClass}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence>
            {tasks.map((task) => {
              const dueStat = getDueDateStatus(task.dueDate, task.status);
              return (
                <motion.tr
                  key={task._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => onView?.(task)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onFavorite?.(task._id); }}
                        className="text-slate-300 hover:text-amber-400 transition-colors flex-shrink-0"
                      >
                        {task.favorite ? <HiStar className="h-4 w-4 text-amber-400" /> : <HiOutlineStar className="h-4 w-4" />}
                      </button>
                      <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1 max-w-xs">
                        {task.title}
                      </span>
                      {dueStat && dueStat !== 'normal' && (
                        <span className={`hidden xl:inline-flex text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          dueStat === 'overdue' ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400' :
                          dueStat === 'today' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400' :
                          'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400'
                        }`}>
                          {dueStat === 'overdue' ? 'Overdue' : dueStat === 'today' ? 'Today' : 'Soon'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="default" size="xs">{task.category}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant={priorityVariant[task.priority]} size="xs">{task.priority}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[task.status]} size="xs">{task.status}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <HiCalendar className="h-3.5 w-3.5" />
                      {formatDate(task.dueDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => onEdit?.(task)} className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-400 hover:text-indigo-600 transition-all">
                        <HiPencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => onArchive?.(task._id)} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-400 hover:text-amber-600 transition-all">
                        {task.archived ? <HiArrowUpTray className="h-4 w-4" /> : <HiArchive className="h-4 w-4" />}
                      </button>
                      <button onClick={() => onDelete?.(task._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 transition-all">
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default memo(TaskTable);
