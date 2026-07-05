import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    sortBy: 'createdAt',
    order: 'desc',
    archived: 'false',
    favorite: '',
  });

  const fetchTasks = useCallback(async (customFilters = {}) => {
    if (!user) return;
    setLoading(true);
    try {
      const params = { ...filters, ...customFilters };
      // Remove empty string params
      Object.keys(params).forEach((k) => {
        if (params[k] === '') delete params[k];
      });
      const { data } = await taskService.getTasks(params);
      setTasks(data.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const createTask = useCallback(async (taskData) => {
    const { data } = await taskService.createTask(taskData);
    setTasks((prev) => [data.task, ...prev]);
    return data;
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    const { data } = await taskService.updateTask(id, taskData);
    setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
    return data;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const toggleArchive = useCallback(async (id) => {
    const { data } = await taskService.toggleArchive(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    return data;
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const { data } = await taskService.toggleFavorite(id);
    setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
    return data;
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Fetch tasks on filters change
  useEffect(() => {
    if (user) fetchTasks();
  }, [user, filters]);

  return (
    <TaskContext.Provider value={{
      tasks, loading, filters,
      fetchTasks, createTask, updateTask, deleteTask,
      toggleArchive, toggleFavorite, updateFilters,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
};
