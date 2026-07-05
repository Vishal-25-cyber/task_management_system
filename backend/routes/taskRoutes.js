const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleArchive,
  toggleFavorite,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title too long'),
  body('category')
    .optional()
    .isIn(['Work', 'College', 'Study', 'Personal', 'Shopping', 'Others'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Invalid status'),
];

router.use(protect);

router.get('/', getTasks);
router.post('/', taskValidation, createTask);
router.get('/:id', getTask);
router.put('/:id', taskValidation, updateTask);
router.delete('/:id', deleteTask);
router.patch('/archive/:id', toggleArchive);
router.patch('/favorite/:id', toggleFavorite);

module.exports = router;
