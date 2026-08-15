const { pool } = require('../config/database');

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `HOL-${ts}-${rand}`;
}

async function createOrder(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { cliente, items, tipo_venta = 'unitario', metodo_pago = 'simulado', notas } = req.body;

    if (!cliente?.nombre || !cliente?.email || !items?.length) {
      return res.status(400).json({ error: 'Datos de cliente e ítems requeridos' });
    }

    let subtotal = 0;
    const itemsData = [];

    for (const item of items) {
      const [rows] = await conn.query(
        'SELECT * FROM productos WHERE id = ? AND activo = TRUE',
        [item.producto_id]
      );
      if (!rows.length) {
        await conn.rollback();
        return res.status(400).json({ error: `Producto ${item.producto_id} no encontrado` });
      }
      const prod = rows[0];
      const usaMayoreo =
        tipo_venta === 'mayoreo' &&
        prod.precio_mayoreo &&
        item.cantidad >= prod.cantidad_minima_mayoreo;

      const precio = usaMayoreo ? parseFloat(prod.precio_mayoreo) : parseFloat(prod.precio_unitario);
      const sub = precio * item.cantidad;
      subtotal += sub;

      itemsData.push({
        producto_id: prod.id,
        nombre_producto: prod.nombre,
        cantidad: item.cantidad,
        precio_unitario: precio,
        tipo_precio: usaMayoreo ? 'mayoreo' : 'unitario',
        subtotal: sub,
      });
    }

    const total = subtotal;
    const numero_pedido = generateOrderNumber();

    const [result] = await conn.query(
      `INSERT INTO pedidos
        (numero_pedido, cliente_nombre, cliente_email, cliente_telefono,
         cliente_direccion, cliente_ciudad, tipo_venta, subtotal, total,
         estado, metodo_pago, notas)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        numero_pedido, cliente.nombre, cliente.email,
        cliente.telefono || null, cliente.direccion || null,
        cliente.ciudad || null, tipo_venta, subtotal, total,
        'pendiente', metodo_pago, notas || null,
      ]
    );

    const pedidoId = result.insertId;
    for (const it of itemsData) {
      await conn.query(
        'INSERT INTO pedido_items (pedido_id, producto_id, nombre_producto, cantidad, precio_unitario, tipo_precio, subtotal) VALUES (?,?,?,?,?,?,?)',
        [pedidoId, it.producto_id, it.nombre_producto, it.cantidad, it.precio_unitario, it.tipo_precio, it.subtotal]
      );
    }

    await conn.commit();
    res.status(201).json({ numero_pedido, pedido_id: pedidoId, total, items: itemsData });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

async function getByNumber(req, res) {
  try {
    const [pedidos] = await pool.query(
      'SELECT * FROM pedidos WHERE numero_pedido = ?',
      [req.params.numero]
    );
    if (!pedidos.length) return res.status(404).json({ error: 'Pedido no encontrado' });

    const [items] = await pool.query(
      'SELECT * FROM pedido_items WHERE pedido_id = ?',
      [pedidos[0].id]
    );
    res.json({ ...pedidos[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function adminGetAll(req, res) {
  try {
    const { estado, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    let where = '';
    if (estado) { where = 'WHERE estado = ?'; params.push(estado); }

    const [rows] = await pool.query(
      `SELECT * FROM pedidos ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM pedidos ${where}`,
      params
    );
    res.json({ data: rows, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function adminGetOne(req, res) {
  try {
    const [pedidos] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
    if (!pedidos.length) return res.status(404).json({ error: 'Pedido no encontrado' });

    const [items] = await pool.query(
      `SELECT pi.*, p.imagen_principal FROM pedido_items pi
       LEFT JOIN productos p ON p.id = pi.producto_id
       WHERE pi.pedido_id = ?`,
      [req.params.id]
    );
    res.json({ ...pedidos[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function adminUpdateStatus(req, res) {
  try {
    const { estado, notas } = req.body;
    const estadosValidos = ['pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    await pool.query(
      'UPDATE pedidos SET estado = ?, notas = IFNULL(?, notas) WHERE id = ?',
      [estado, notas || null, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createOrder, getByNumber, adminGetAll, adminGetOne, adminUpdateStatus };
