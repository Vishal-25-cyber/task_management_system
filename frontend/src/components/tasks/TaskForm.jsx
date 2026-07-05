import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import { formatForDateTimeLocal } from '../../utils/helpers';

const CATEGORIES = ['Work', 'College', 'Study', 'Personal', 'Shopping', 'Others'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

const inputClass = 'w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
const errorClass = 'text-xs text-red-500 mt-1';

const TaskForm = ({ defaultValues, onSubmit, onCancel, loading }) => {
  const formValues = defaultValues ? { ...defaultValues } : null;
  if (formValues && formValues.dueDate) {
    formValues.dueDate = formatForDateTimeLocal(formValues.dueDate);
  }

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: formValues || {
      title: '',
      description: '',
      category: 'Others',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '',
    },
  });

  // Convert the datetime-local string (which has no timezone) to a proper ISO
  // string before passing to the parent, so the backend stores the exact local
  // time the user entered rather than treating it as UTC.
  const handleFormSubmit = (data) => {
    if (data.dueDate) {
      // new Date('YYYY-MM-DDTHH:mm') treats the string as LOCAL time and
      // converts to UTC correctly — exactly what we want.
      data.dueDate = new Date(data.dueDate).toISOString();
    } else {
      data.dueDate = null;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
      {/* Title */}
      <div>
        <label className={labelClass}>Title <span className="text-red-500">*</span></label>
        <input
          {...register('title', {
            required: 'Title is required',
            maxLength: { value: 200, message: 'Title too long' },
          })}
          className={inputClass}
          placeholder="Enter task title..."
        />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register('description', {
            maxLength: { value: 2000, message: 'Description too long' },
          })}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Describe the task..."
        />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      {/* Row: Category + Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select {...register('category')} className={inputClass}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <select {...register('priority')} className={inputClass}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Row: Status + Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Status</label>
          <select {...register('status')} className={inputClass}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Due Date & Time</label>
          <input
            type="datetime-local"
            {...register('dueDate')}
            className={inputClass}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1" loading={loading}>
          {defaultValues?._id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
