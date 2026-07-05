import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiViewGrid, HiViewList, HiTable, HiFilter, HiSortAscending, HiRefresh } from 'react-icons/hi';
import { HiAdjustmentsHorizontal } from 'react-icons/hi2';
import { useTaskContext } from '../context/TaskContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskTable from '../components/tasks/TaskTable';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import SkeletonCard from '../components/common/SkeletonCard';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';
import { HiClipboardList } from 'react-icons/hi';
import { taskService } from '../services/taskService';

const CATEGORIES = ['', 'Work', 'College', 'Study', 'Personal', 'Shopping', 'Others'];
const PRIORITIES = ['', 'Low', 'Medium', 'High'];
const STATUSES = ['', 'Pending', 'In Progress', 'Completed'];
const SORTS = [
  { value: 'createdAt|desc', label: 'Newest First' },
  { value: 'createdAt|asc',  label: 'Oldest First' },
  { value: 'priority|desc',  label: 'Priority' },
  { value: 'deadline|asc',   label: 'Deadline' },
  { value: 'title|asc',      label: 'Alphabetical' },
];

const selectClass = 'text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all';

const TasksPage = () => {
  const { tasks, loading, filters, createTask, updateTask, deleteTask, toggleArchive, toggleFavorite, updateFilters, fetchTasks } = useTaskContext();
  const [view, setView] = useState('card');
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await createTask(data);
      toast.success('✅ Task created!');
      setShowCreate(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await updateTask(editTask._id, data);
      toast.success('✅ Task updated!');
      setEditTask(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteTask(deleteId);
      toast.success('🗑️ Task deleted');
      setDeleteId(null);
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleArchive = async (id) => {
    try {
      const { data } = await toggleArchive(id);
      toast.success(data.message);
    } catch (err) {
      toast.error('Failed to archive task');
    }
  };

  const handleFavorite = async (id) => {
    try {
      const { data } = await toggleFavorite(id);
      toast.success(data.message);
    } catch (err) {
      toast.error('Failed to update favorite');
    }
  };

  const handleSortChange = (val) => {
    const [sortBy, order] = val.split('|');
    updateFilters({ sortBy, order });
  };

  const activeFilterCount = [filters.status, filters.priority, filters.category].filter(Boolean).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchTasks()} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <HiRefresh className="h-5 w-5" />
          </button>
          <Button icon={<HiPlus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
            New Task
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <HiAdjustmentsHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && <Badge variant="primary" size="xs">{activeFilterCount}</Badge>}
          </div>

          <select className={selectClass} value={filters.status || ''} onChange={(e) => updateFilters({ status: e.target.value })}>
            <option value="">All Status</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s}>{s}</option>)}
          </select>

          <select className={selectClass} value={filters.priority || ''} onChange={(e) => updateFilters({ priority: e.target.value })}>
            <option value="">All Priority</option>
            {PRIORITIES.filter(Boolean).map((p) => <option key={p}>{p}</option>)}
          </select>

          <select className={selectClass} value={filters.category || ''} onChange={(e) => updateFilters({ category: e.target.value })}>
            <option value="">All Category</option>
            {CATEGORIES.filter(Boolean).map((c) => <option key={c}>{c}</option>)}
          </select>

          <select className={selectClass} value={`${filters.sortBy}|${filters.order}`} onChange={(e) => handleSortChange(e.target.value)}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={() => updateFilters({ status: '', priority: '', category: '' })}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Clear filters
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 ml-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {[
              { v: 'card',  Icon: HiViewGrid },
              { v: 'table', Icon: HiTable },
            ].map(({ v, Icon }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-1.5 rounded-lg transition-all ${view === v ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard count={6} />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={HiClipboardList}
          title="No tasks found"
          description="Create your first task or adjust your filters."
          action={<Button icon={<HiPlus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Create Task</Button>}
        />
      ) : view === 'card' ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={setEditTask}
                onDelete={setDeleteId}
                onArchive={handleArchive}
                onFavorite={handleFavorite}
                onView={setSelectedTask}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <TaskTable
          tasks={tasks}
          onEdit={setEditTask}
          onDelete={setDeleteId}
          onArchive={handleArchive}
          onFavorite={handleFavorite}
          onView={setSelectedTask}
        />
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Task">
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={formLoading} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && (
          <TaskForm
            defaultValues={editTask}
            onSubmit={handleUpdate}
            onCancel={() => setEditTask(null)}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Task"
        message="This task and all its comments will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default TasksPage;
