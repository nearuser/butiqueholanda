const { pool } = require('../config/database');

async function getAll(req, res) {
  try {
    const soloActivas = req.path.startsWith('/admin') ? '' : 'WHERE activo = TRUE';
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(p.id) as total_productos
       FROM categorias c
       LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo = TRUE
       ${soloActivas}
       GROUP BY c.id
       ORDER BY c.orden ASC, c.nombre ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOne(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const { nombre, descripcion, orden } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

    const slug = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const imagen = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, slug, descripcion, imagen, orden) VALUES (?,?,?,?,?)',
      [nombre, slug, descripcion || null, imagen, orden || 0]
    );
    const [newRow] = await pool.query('SELECT * FROM categorias WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const { nombre, descripcion, orden, activo } = req.body;
    const [current] = await pool.query('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    if (!current.length) return res.status(404).json({ error: 'Categoría no encontrada' });

    const imagen = req.file ? `/uploads/${req.file.filename}` : current[0].imagen;
    const slug = nombre
      ? nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : current[0].slug;

    await pool.query(
      'UPDATE categorias SET nombre=?, slug=?, descripcion=?, imagen=?, orden=?, activo=? WHERE id=?',
      [
        nombre || current[0].nombre,
        slug,
        descripcion !== undefined ? descripcion : current[0].descripcion,
        imagen,
        orden !== undefined ? orden : current[0].orden,
        activo !== undefined ? activo : current[0].activo,
        req.params.id,
      ]
    );
    const [updated] = await pool.query('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    const [products] = await pool.query(
      'SELECT COUNT(*) as n FROM productos WHERE categoria_id = ?',
      [req.params.id]
    );
    if (products[0].n > 0) {
      return res.status(400).json({ error: 'No se puede eliminar una categoría con productos asignados' });
    }
    await pool.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove };
