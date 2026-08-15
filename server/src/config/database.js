const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../../catalogoholanda.db');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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
`);

// Seed initial data only if empty
const { n } = db.prepare("SELECT COUNT(*) as n FROM categorias").get();
if (n === 0) {
  db.exec(`
    INSERT INTO categorias (nombre, slug, descripcion, imagen, orden) VALUES
    ('Anillos',  'anillos',  'Anillos de oro, plata y fantasía para toda ocasión', '/uploads/cat-anillos.jpg',  1),
    ('Collares', 'collares', 'Collares y cadenas de diversos materiales y estilos',  '/uploads/cat-collares.jpg', 2),
    ('Pulseras', 'pulseras', 'Pulseras finas, gruesas, de dije y de tendencia',      '/uploads/cat-pulseras.jpg', 3),
    ('Aretes',   'aretes',   'Aretes para todos los estilos: argollas, colgantes y botón', '/uploads/cat-aretes.jpg', 4),
    ('Cadenas',  'cadenas',  'Cadenas de oro y plata en distintos calibres y largos', '/uploads/cat-cadenas.jpg',  5),
    ('Dijes',    'dijes',    'Dijes y colgantes para personalizar tus cadenas',       '/uploads/cat-dijes.jpg',    6);

    INSERT INTO productos (nombre, slug, descripcion_corta, descripcion, material, peso_gramos, precio_unitario, precio_mayoreo, cantidad_minima_mayoreo, stock, categoria_id, imagen_principal, destacado) VALUES
    ('Anillo Solitario Oro 18K','anillo-solitario-oro-18k','Anillo clásico solitario en oro amarillo 18 quilates con zirconia AAA.','Elegante anillo solitario confeccionado en oro amarillo 18K. Cuenta con una zirconia AAA de 6mm de diámetro, con acabado brillante. Disponible en tallas 6 a 10. Ideal para compromiso o uso diario.','Oro 18K + Zirconia AAA',3.5,89990,65000,5,50,1,'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',1),
    ('Anillo Banda Plata 950','anillo-banda-plata-950','Anillo tipo banda en plata 950 con acabado pulido y mate.','Anillo banda de diseño minimalista en plata 950. Combinación de acabado pulido exterior y mate interior. Grosor 4mm. Disponible en tallas 6 a 12.','Plata 950',5.2,24990,18000,10,120,1,'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',0),
    ('Anillo Corazón Gold Filled','anillo-corazon-gold-filled','Anillo corazón bañado en oro 18K, resistente al agua.','Anillo con diseño de corazón en base de acero quirúrgico con baño de oro 18K de alta durabilidad. Resistente al agua y al sudor. Ideal para uso diario.','Gold Filled / Acero Quirúrgico',2.8,14990,9500,12,200,1,'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',0),
    ('Collar Choker Perla Cultivada','collar-choker-perla-cultivada','Choker de perlas cultivadas naturales con cierre en plata.','Elegante choker de perlas cultivadas de 7-8mm, ensartadas en hilo de nylon resistente con cierre en plata 925. Largo ajustable 36-40cm. Perfecto para ocasiones especiales.','Perla Cultivada + Plata 925',12.0,59990,42000,6,40,2,'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',1),
    ('Collar Cadena Veneciana Oro','collar-cadena-veneciana-oro','Cadena veneciana en oro 10K, largo 45cm.','Cadena veneciana confeccionada en oro 10K, calibre 1.2mm, largo 45cm con cierre de langosta. Diseño clásico y versátil. Puede usarse sola o con dije.','Oro 10K',4.1,119990,88000,4,30,2,'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',1),
    ('Collar Lariat Plata con Ópalo','collar-lariat-plata-opalo','Collar tipo lariat en plata con ópalo natural australiano.','Collar lariat artesanal en plata 925 con un ópalo natural australiano como remate. Largo total 70cm. Cada pieza es única debido a las variaciones naturales del ópalo.','Plata 925 + Ópalo Natural',8.5,79990,58000,5,25,2,'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',0),
    ('Pulsera Esclava Oro 18K','pulsera-esclava-oro-18k','Pulsera esclava rígida en oro amarillo 18K, ancho 5mm.','Pulsera esclava (bangle) rígida confeccionada en oro amarillo 18K. Ancho 5mm, superficie pulida. Con bisagra y cierre de seguridad. Disponible en tallas S (16cm), M (17cm) y L (18cm).','Oro 18K',9.8,149990,115000,3,20,3,'https://images.unsplash.com/photo-1573408301185-9519f94815b6?w=600&q=80',1),
    ('Pulsera Dije Trébol Plata','pulsera-dije-trebol-plata','Pulsera en plata 925 con dije trébol de cuatro hojas.','Pulsera en cadena fina de plata 925 con dije de trébol de cuatro hojas, símbolo de buena suerte. Cierre de langosta. Largo ajustable 16-19cm.','Plata 925',4.2,29990,21000,10,80,3,'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',0),
    ('Aretes Argolla Lisa Oro 14K','aretes-argolla-lisa-oro-14k','Argollas clásicas lisas en oro 14K, diámetro 25mm.','Argollas clásicas en oro amarillo 14K. Diámetro 25mm, grosor 2mm. Superficie pulida con brillo espejo. Cierre de bisagra con tuerca de seguridad.','Oro 14K',3.6,74990,56000,6,45,4,'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',1),
    ('Aretes Colgante Lágrima Zirconia','aretes-colgante-lagrima-zirconia','Aretes colgantes en forma de lágrima con zirconia pavé.','Aretes colgantes de diseño elegante en plata 925 con baño de rodio. Forma de lágrima cubierta con zirconia blanca en pavé. Largo total 4cm. Cierre paloma.','Plata 925 + Zirconia',5.1,39990,28500,8,60,4,'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80',0),
    ('Cadena Cartier Oro 18K 50cm','cadena-cartier-oro-18k-50cm','Cadena estilo cartier en oro 18K, calibre 2mm, largo 50cm.','Cadena estilo cartier (eslabón rectangular) en oro amarillo 18K. Calibre 2mm, largo 50cm. Con cierre de langosta y argolla extra para ajustar a 45cm. Resistente y elegante.','Oro 18K',8.3,189990,145000,3,15,5,'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',1),
    ('Cadena Rolo Plata 925 60cm','cadena-rolo-plata-925-60cm','Cadena rolo (eslabón redondo) en plata 925, calibre 3mm, 60cm.','Cadena tipo rolo en plata 925, eslabón circular calibre 3mm, largo 60cm. Perfecta para usar con dijes pesados. Cierre de langosta robusto.','Plata 925',18.5,34990,25000,10,90,5,'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',0),
    ('Dije Cruz Latina Oro 10K','dije-cruz-latina-oro-10k','Dije cruz latina en oro 10K con acabado diamantado.','Dije de cruz latina en oro amarillo 10K con acabado diamantado en los bordes. Medidas: 2.5cm x 1.5cm. Incluye argolla para pasar cadena de hasta 3mm.','Oro 10K',2.1,44990,32000,8,55,6,'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',0),
    ('Dije Letra Inicial Plata','dije-letra-inicial-plata','Dije letra inicial en plata 925 con acabado brillante, 2cm.','Personaliza tu cadena con tu inicial favorita. Dije letra en plata 925 con acabado espejo. Altura 2cm. Disponible en todas las letras del abecedario.','Plata 925',1.8,19990,13500,15,150,6,'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',0);

    INSERT INTO usuarios (nombre, email, password, rol) VALUES
    ('Administrador Holanda','admin@holanda.cl','$2a$10$K04Qqib2oc/yOKrGcUgyouWCbsBSSAGf5plGRiQ2QI9WilIDotdWC','admin');
  `);
}

function execQuery(sql, params = []) {
  const upper = sql.trim().toUpperCase();
  const isSelect = upper.startsWith('SELECT') || upper.startsWith('WITH') || upper.startsWith('PRAGMA');
  const stmt = db.prepare(sql);
  if (isSelect) {
    return [stmt.all(...params)];
  }
  const result = stmt.run(...params);
  return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }];
}

const pool = {
  query: async (sql, params = []) => execQuery(sql, params),

  getConnection: async () => {
    let inTx = false;
    return {
      beginTransaction: async () => { db.exec('BEGIN'); inTx = true; },
      commit:           async () => { db.exec('COMMIT'); inTx = false; },
      rollback:         async () => { try { db.exec('ROLLBACK'); } catch (_) {} inTx = false; },
      release:          ()       => { if (inTx) { try { db.exec('ROLLBACK'); } catch (_) {} } },
      query:            async (sql, params = []) => execQuery(sql, params),
    };
  },
};

async function testConnection() {
  try {
    db.prepare('SELECT 1').get();
    console.log('✅ SQLite listo:', DB_PATH);
  } catch (err) {
    console.error('❌ Error SQLite:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection, db };
