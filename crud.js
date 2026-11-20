
async function createStudent(name, email, age, course, department, phone) {
  const query = `
    INSERT INTO students
    (name, email, age, course, department, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    name,
    email,
    age,
    course,
    department,
    phone
  ]);

  return result.rows[0];
}
