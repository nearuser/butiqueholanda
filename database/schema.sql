-- ============================================================
-- Catálogo Holanda Joyería — Schema SQLite
-- ============================================================

CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  imagen TEXT,
  orden INTEGER DEFAULT 0,
  activo INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  descripcion_corta TEXT,
  material TEXT,
  peso_gramos REAL,
  precio_unitario REAL NOT NULL,
  precio_mayoreo REAL,
  cantidad_minima_mayoreo INTEGER DEFAULT 10,
  stock INTEGER DEFAULT 0,
  categoria_id INTEGER,
  imagen_principal TEXT,
  imagenes TEXT,
  destacado INTEGER DEFAULT 0,
  activo INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_pedido TEXT NOT NULL UNIQUE,
  cliente_nombre TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_telefono TEXT,
  cliente_direccion TEXT,
  cliente_ciudad TEXT,
  cliente_pais TEXT DEFAULT 'Chile',
  tipo_venta TEXT DEFAULT 'unitario' CHECK(tipo_venta IN ('unitario','mayoreo')),
  subtotal REAL NOT NULL,
  descuento REAL DEFAULT 0.00,
  envio REAL DEFAULT 0.00,
  total REAL NOT NULL,
  estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente','confirmado','en_proceso','enviado','entregado','cancelado')),
  metodo_pago TEXT,
  referencia_pago TEXT,
  notas TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pedido_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL,
  producto_id INTEGER,
  nombre_producto TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario REAL NOT NULL,
  tipo_precio TEXT DEFAULT 'unitario' CHECK(tipo_precio IN ('unitario','mayoreo')),
  subtotal REAL NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  rol TEXT DEFAULT 'admin' CHECK(rol IN ('admin','vendedor')),
  activo INTEGER DEFAULT 1,
  ultimo_login TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Triggers para auto-actualizar updated_at
CREATE TRIGGER IF NOT EXISTS trg_productos_updated_at
AFTER UPDATE ON productos WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE productos SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_pedidos_updated_at
AFTER UPDATE ON pedidos WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE pedidos SET updated_at = datetime('now') WHERE id = NEW.id;
END;
