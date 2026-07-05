import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiClock, HiTrendingUp, HiCheckCircle } from 'react-icons/hi';
import { taskService } from '../services/taskService';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { formatDate, getDueDateStatus } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'Pending', label: 'Pending', icon: HiClock, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-600', variant: 'primary' },
  { id: 'In Progress', label: 'In Progress', icon: HiTrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', variant: 'warning' },
  { id: 'Completed', label: 'Completed', icon: HiCheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500', variant: 'success' },
];

const priorityDot = { High: 'bg-red-500', Medium: 'bg-amber-400', Low: 'bg-green-500' };

const KanbanPage = () => {
  const [tasks, setTasks] = useState({ Pending: [], 'In Progress': [], Completed: [] });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('Pending');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await taskService.getTasks({ archived: 'false' });
      const grouped = { Pending: [], 'In Progress': [], Completed: [] };
      data.tasks.forEach((t) => {
        if (grouped[t.status]) grouped[t.status].push(t);
      });
      setTasks(grouped);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;

    // Optimistic update
    setTasks((prev) => {
      const srcTasks = [...prev[srcCol]];
      const dstTasks = srcCol === dstCol ? srcTasks : [...prev[dstCol]];
      const [moved] = srcTasks.splice(source.index, 1);
      moved.status = dstCol;
      dstTasks.splice(destination.index, 0, moved);

      return {
        ...prev,
        [srcCol]: srcTasks,
        ...(srcCol !== dstCol ? { [dstCol]: dstTasks } : {}),
      };
    });

    // Persist to DB
    try {
      await taskService.updateTask(draggableId, { status: dstCol });
      if (srcCol !== dstCol) toast.success(`Moved to ${dstCol}`);
    } catch {
      toast.error('Failed to update task status');
      loadTasks(); // revert
    }
  };

  const handleCreate = async (data) => {
    setCreateLoading(true);
    try {
      await taskService.createTask({ ...data, status: defaultStatus });
      toast.success('✅ Task created!');
      setShowCreate(false);
      loadTasks();
    } catch { toast.error('Failed to create task'); }
    finally { setCreateLoading(false); }
  };

  const totalCount = Object.values(tasks).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kanban Board</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{totalCount} tasks across {Object.keys(tasks).length} columns</p>
        </div>
        <Button icon={<HiPlus className="h-4 w-4" />} onClick={() => { setDefaultStatus('Pending'); setShowCreate(true); }}>
          Add Task
        </Button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-5 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex-shrink-0 w-80 flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <col.icon className={`h-5 w-5 ${col.color}`} />
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{col.label}</h2>
                  <Badge variant={col.variant} size="xs">{tasks[col.id]?.length || 0}</Badge>
                </div>
                <button
                  onClick={() => { setDefaultStatus(col.id); setShowCreate(true); }}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
                >
                  <HiPlus className="h-4 w-4" />
                </button>
              </div>

              {/* Droppable */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-xl p-3 min-h-[300px] transition-colors ${snapshot.isDraggingOver
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-2 border-dashed border-indigo-300 dark:border-indigo-700'
                        : 'bg-slate-100/60 dark:bg-slate-800/30 border-2 border-transparent'
                      }`}
                  >
                    <div className="space-y-3">
                      {loading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="skeleton h-24 rounded-xl" />
                        ))
                      ) : tasks[col.id]?.map((task, index) => {
                        const dueStat = getDueDateStatus(task.dueDate, task.status);
                        return (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snap) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 transition-all ${snap.isDragging ? 'shadow-xl rotate-1 scale-102 opacity-90' : 'shadow-card hover:shadow-card-md'
                                  }`}
                              >
                                {/* Priority dot + title */}
                                <div className="flex items-start gap-2 mb-2">
                                  <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} />
                                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 flex-1">
                                    {task.title}
                                  </h3>
                                </div>

                                {task.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 ml-4">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between ml-4">
                                  <Badge variant="default" size="xs">{task.category}</Badge>
                                  <div className="flex items-center gap-1">
                                    {task.dueDate && (
                                      <span className={`text-xs ${dueStat === 'overdue' ? 'text-red-500' :
                                          dueStat === 'today' ? 'text-orange-500' :
                                            dueStat === 'upcoming' ? 'text-yellow-500' :
                                              'text-slate-500 dark:text-slate-400'
                                        }`}>
                                        {formatDate(task.dueDate)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    </div>
                    {provided.placeholder}

                    {/* Empty column state */}
                    {!loading && tasks[col.id]?.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <col.icon className="h-8 w-8 mb-2 opacity-30" />
                        <p className="text-xs">No tasks here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Task to Board">
        <TaskForm
          defaultValues={{ status: defaultStatus }}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={createLoading}
        />
      </Modal>
    </div>
  );
};

export default KanbanPage;
