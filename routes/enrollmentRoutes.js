  // routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  createCourse,
  enrollStudent,
  unenrollStudent,
  getStudentsWithCourses,
} = require('../controllers/enrollmentController');

router.get('/courses', getAllCourses);
router.post('/courses', createCourse);
router.post('/enrollments', enrollStudent);
router.delete('/enrollments/:id', unenrollStudent);
router.get('/students-courses', getStudentsWithCourses);

module.exports = router;