const { pool } = require('../config/database');

function buildSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function getAll(req, res) {
  try {
    const { categoria, destacado, busqueda, page = 1, limit = 20 } = req.query;
    const isAdmin = req.path.startsWith('/admin') || req.baseUrl.includes('admin');
    const offset = (Number(page) - 1) * Number(limit);

    let where = isAdmin ? [] : ['p.activo = TRUE'];
    const params = [];

    if (categoria) { where.push('c.slug = ?'); params.push(categoria); }
    if (destacado) { where.push('p.destacado = TRUE'); }
    if (busqueda) { where.push('p.nombre LIKE ?'); params.push(`%${busqueda}%`); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre, c.slug as categoria_slug
       FROM productos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       ${whereClause}
       ORDER BY p.destacado DESC, p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM productos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       ${whereClause}`,
      params
    );

    res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOne(req, res) {
  try {
    const field = isNaN(req.params.id) ? 'p.slug' : 'p.id';
    const [rows] = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre, c.slug as categoria_slug
       FROM productos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       WHERE ${field} = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const {
      nombre, descripcion, descripcion_corta, material, peso_gramos,
      precio_unitario, precio_mayoreo, cantidad_minima_mayoreo,
      stock, categoria_id, destacado, activo,
    } = req.body;

    if (!nombre || !precio_unitario) {
      return res.status(400).json({ error: 'Nombre y precio unitario son requeridos' });
    }

    const slug = buildSlug(nombre);
    const imagen_principal = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO productos
        (nombre, slug, descripcion, descripcion_corta, material, peso_gramos,
         precio_unitario, precio_mayoreo, cantidad_minima_mayoreo,
         stock, categoria_id, imagen_principal, destacado, activo)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        nombre, slug, descripcion || null, descripcion_corta || null,
        material || null, peso_gramos || null,
        precio_unitario, precio_mayoreo || null, cantidad_minima_mayoreo || 10,
        stock || 0, categoria_id || null, imagen_principal,
        destacado === 'true' || destacado === true ? 1 : 0,
        activo === 'false' || activo === false ? 0 : 1,
      ]
    );

    const [newRow] = await pool.query(
      'SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id WHERE p.id = ?',
      [result.insertId]
    );
    res.status(201).json(newRow[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const [current] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (!current.length) return res.status(404).json({ error: 'Producto no encontrado' });

    const c = current[0];
    const {
      nombre, descripcion, descripcion_corta, material, peso_gramos,
      precio_unitario, precio_mayoreo, cantidad_minima_mayoreo,
      stock, categoria_id, destacado, activo,
    } = req.body;

    const imagen_principal = req.file ? `/uploads/${req.file.filename}` : c.imagen_principal;
    const slug = nombre ? buildSlug(nombre) : c.slug;

    await pool.query(
      `UPDATE productos SET
        nombre=?, slug=?, descripcion=?, descripcion_corta=?, material=?, peso_gramos=?,
        precio_unitario=?, precio_mayoreo=?, cantidad_minima_mayoreo=?,
        stock=?, categoria_id=?, imagen_principal=?, destacado=?, activo=?
       WHERE id=?`,
      [
        nombre || c.nombre, slug,
        descripcion !== undefined ? descripcion : c.descripcion,
        descripcion_corta !== undefined ? descripcion_corta : c.descripcion_corta,
        material !== undefined ? material : c.material,
        peso_gramos !== undefined ? peso_gramos : c.peso_gramos,
        precio_unitario || c.precio_unitario,
        precio_mayoreo !== undefined ? precio_mayoreo : c.precio_mayoreo,
        cantidad_minima_mayoreo || c.cantidad_minima_mayoreo,
        stock !== undefined ? stock : c.stock,
        categoria_id !== undefined ? categoria_id : c.categoria_id,
        imagen_principal,
        destacado !== undefined ? (destacado === 'true' || destacado === true ? 1 : 0) : c.destacado,
        activo !== undefined ? (activo === 'false' || activo === false ? 0 : 1) : c.activo,
        req.params.id,
      ]
    );

    const [updated] = await pool.query(
      'SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id WHERE p.id = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    await pool.query('UPDATE productos SET activo = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto desactivado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove };
