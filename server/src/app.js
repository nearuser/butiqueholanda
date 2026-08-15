require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categorias', require('./routes/categories'));
app.use('/api/productos', require('./routes/products'));
app.use('/api/pedidos', require('./routes/orders'));

// Dashboard stats (admin)
const auth = require('./middleware/auth');
const { pool } = require('./config/database');
app.get('/api/admin/stats', auth, async (req, res) => {
  try {
    const [[{ total_productos }]] = await pool.query('SELECT COUNT(*) as total_productos FROM productos WHERE activo = TRUE');
    const [[{ total_pedidos }]] = await pool.query('SELECT COUNT(*) as total_pedidos FROM pedidos');
    const [[{ pedidos_pendientes }]] = await pool.query("SELECT COUNT(*) as pedidos_pendientes FROM pedidos WHERE estado = 'pendiente'");
    const [[{ ingresos_total }]] = await pool.query("SELECT COALESCE(SUM(total),0) as ingresos_total FROM pedidos WHERE estado != 'cancelado'");
    const [pedidos_recientes] = await pool.query('SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 5');
    res.json({ total_productos, total_pedidos, pedidos_pendientes, ingresos_total, pedidos_recientes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

// En producción: servir el frontend estático y manejar rutas SPA
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Holanda corriendo en http://localhost:${PORT}`);
  });
});
