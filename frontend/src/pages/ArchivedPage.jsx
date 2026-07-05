import { useEffect, useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import TaskCard from '../components/tasks/TaskCard';
import Modal from '../components/common/Modal';
import TaskForm from '../components/tasks/TaskForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import SkeletonCard from '../components/common/SkeletonCard';
import { HiArchive } from 'react-icons/hi';
import { HiArrowUpTray } from 'react-icons/hi2';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ArchivedPage = () => {
  const { tasks, loading, updateFilters, updateTask, deleteTask, toggleArchive, toggleFavorite } = useTaskContext();
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    updateFilters({ archived: 'true', favorite: '' });
    return () => updateFilters({ archived: 'false' });
  }, []);

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await updateTask(editTask._id, data);
      toast.success('Task updated!');
      setEditTask(null);
    } catch { toast.error('Failed to update'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteTask(deleteId);
      toast.success('Task deleted');
      setDeleteId(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const handleRestore = async (id) => {
    try {
      const { data } = await toggleArchive(id);
      toast.success('✅ Task restored!');
    } catch { toast.error('Failed to restore'); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <HiArchive className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Archived</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{tasks.length} archived task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard count={3} />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={HiArchive}
          title="No archived tasks"
          description="Tasks you archive will appear here. You can restore them at any time."
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={setEditTask}
                onDelete={setDeleteId}
                onArchive={handleRestore}
                onFavorite={(id) => toggleFavorite(id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && <TaskForm defaultValues={editTask} onSubmit={handleUpdate} onCancel={() => setEditTask(null)} loading={formLoading} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Archived Task"
        message="This will permanently delete the task."
      />
    </div>
  );
};

export default ArchivedPage;
