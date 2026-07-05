const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { addComment, updateComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const commentValidation = [
  body('comment').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 1000 }).withMessage('Comment too long'),
];

router.use(protect);

router.post('/:taskId', commentValidation, addComment);
router.put('/:commentId', commentValidation, updateComment);
router.delete('/:commentId', deleteComment);

module.exports = router;
