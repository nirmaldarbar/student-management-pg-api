// controllers/enrollmentController.js
const pool = require('../db');

// GET all courses
const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY id ASC;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE a course
const createCourse = async (req, res) => {
  const { course_name, instructor, credits } = req.body;
  if (!course_name) {
    return res.status(400).json({ error: 'course_name is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO courses (course_name, instructor, credits)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [course_name, instructor || null, credits ?? 4]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ENROLL student in a course
const enrollStudent = async (req, res) => {
  const { student_id, course_id } = req.body;
  if (!student_id || !course_id) {
    return res.status(400).json({ error: 'student_id and course_id are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO enrollments (student_id, course_id)
       VALUES ($1, $2)
       RETURNING *;`,
      [student_id, course_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Student is already enrolled in this course' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ error: 'Invalid student_id or course_id' });
    }
    res.status(500).json({ error: err.message });
  }
};

// UNENROLL / DELETE enrollment by ID
const unenrollStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM enrollments WHERE id = $1 RETURNING *;',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    res.json({ message: 'Enrollment removed', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// VIEW students with enrolled courses (LEFT JOIN)
const getStudentsWithCourses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id AS student_id,
        s.name,
        s.email,
        s.department,
        c.id AS course_id,
        c.course_name,
        c.instructor,
        e.enrolled_at
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN courses c ON e.course_id = c.id
      ORDER BY s.id ASC, c.id ASC;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllCourses,
  createCourse,
  enrollStudent,
  unenrollStudent,
  getStudentsWithCourses,
};