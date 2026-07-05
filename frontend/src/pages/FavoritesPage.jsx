import { useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import SkeletonCard from '../components/common/SkeletonCard';
import { HiStar, HiPlus } from 'react-icons/hi';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const FavoritesPage = () => {
  const { tasks, loading, updateFilters, updateTask, deleteTask, toggleArchive, toggleFavorite, fetchTasks } = useTaskContext();
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    updateFilters({ favorite: 'true', archived: 'false' });
    return () => updateFilters({ favorite: '', archived: 'false' });
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

  const handleFavorite = async (id) => {
    const { data } = await toggleFavorite(id);
    toast.success(data.message);
  };

  const handleArchive = async (id) => {
    const { data } = await toggleArchive(id);
    toast.success(data.message);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
            <HiStar className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Favorites</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{tasks.length} starred task{tasks.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard count={3} />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={HiStar}
          title="No favorites yet"
          description="Star tasks to add them to your favorites for quick access."
          action={<Button onClick={() => navigate('/tasks')}>Browse Tasks</Button>}
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
                onArchive={handleArchive}
                onFavorite={handleFavorite}
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
        title="Delete Task"
        message="This will permanently delete the task."
      />
    </div>
  );
};

export default FavoritesPage;
