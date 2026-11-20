// controllers/studentController.js
const pool = require('../db');

// CREATE student
const createStudent = async (req, res) => {
  const { name, email, age, course, department, phone } = req.body;

  if (!name || !email || age === undefined) {
    return res.status(400).json({ error: 'name, email, and age are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO students (name, email, age, course, department, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [name, email, age, course || null, department || null, phone || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// READ all students (with optional ?search= and ?department=)
const getAllStudents = async (req, res) => {
  const { search, department } = req.query;

  let query = 'SELECT * FROM students WHERE 1=1';
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`;
  }

  if (department) {
    params.push(department);
    query += ` AND department = $${params.length}`;
  }

  query += ' ORDER BY id ASC;';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ single student by ID
const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1;', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    res.status(500).json({ error: err.message });
  }
};

// UPDATE student by ID
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, age, course, department, phone } = req.body;

  try {
    const result = await pool.query(
      `UPDATE students
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           age = COALESCE($3, age),
           course = COALESCE($4, course),
           department = COALESCE($5, department),
           phone = COALESCE($6, phone)
       WHERE id = $7
       RETURNING *;`,
      [
        name ?? null,
        email ?? null,
        age ?? null,
        course ?? null,
        department ?? null,
        phone ?? null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// DELETE student by ID
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM students WHERE id = $1 RETURNING *;',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};