# Bitácora de Proyecto — Catálogo Holanda Joyería

> Documento guía y registro de avance del proyecto. Actualizar en cada sesión de trabajo.

---

## Resumen del Proyecto

**Nombre:** Catálogo Holanda Joyería  
**Tipo:** E-commerce de joyería con panel de administración  
**Estado actual:** Fase 1 — Maqueta funcional local  
**Última actualización:** 2026-08-15

### Objetivo Principal
Construir un catálogo digital de venta de joyería que permita:
- Venta **por unidad** y **al por mayor** (mayoreo)
- Panel de administración **CRUD** completo
- Flujo de e-commerce simulado con miras a integrar pasarelas de pago reales
- Despliegue posterior en servidor con dominio propio

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 5 + TailwindCSS 3 |
| Backend | Node.js + Express 4 |
| Base de datos | MySQL 8 |
| Autenticación | JWT + bcrypt |
| Subida de imágenes | Multer (local) → S3/Cloudinary en producción |
| Pagos (futuro) | MercadoPago (LATAM/Chile) + WebPay Plus (Chile) |

---

## Arquitectura del Proyecto

```
catalogoholanda/
├── client/          # React + Vite + TailwindCSS (puerto 5173)
├── server/          # Node.js + Express API REST (puerto 3001)
├── database/        # SQL scripts
└── bitacora.md      # Este archivo
```

---

## Base de Datos — Esquema Resumen

### Tablas principales
- **categorias** — Anillos, Collares, Pulseras, Aretes, Cadenas, etc.
- **productos** — Con precio unitario Y precio mayoreo + cantidad mínima mayoreo
- **pedidos** — Cabecera del pedido con estado y tipo de venta
- **pedido_items** — Líneas de detalle del pedido
- **usuarios** — Administradores del panel

### Tipos de venta
- `unitario` — precio normal por pieza
- `mayoreo` — precio reducido cuando se compra desde `cantidad_minima_mayoreo` unidades

---

## API REST — Endpoints

### Público
```
GET  /api/categorias              — listar categorías activas
GET  /api/productos               — listar productos (filtros: cat, precio, tipo)
GET  /api/productos/:id           — detalle de producto
POST /api/pedidos                 — crear pedido
GET  /api/pedidos/:numero         — consultar pedido por número
```

### Admin (requiere JWT)
```
POST /api/auth/login              — login administrador
POST /api/auth/logout             — logout

GET    /api/admin/productos       — listar todos
POST   /api/admin/productos       — crear producto
PUT    /api/admin/productos/:id   — editar producto
DELETE /api/admin/productos/:id   — eliminar producto

GET    /api/admin/categorias      — listar todas
POST   /api/admin/categorias      — crear
PUT    /api/admin/categorias/:id  — editar
DELETE /api/admin/categorias/:id  — eliminar

GET  /api/admin/pedidos           — listar pedidos
GET  /api/admin/pedidos/:id       — detalle pedido
PUT  /api/admin/pedidos/:id       — actualizar estado
```

---

## Fases de Desarrollo

### FASE 1 — Maqueta Funcional Local ✅ EN CURSO
- [x] Estructura del proyecto
- [x] Base de datos MySQL con schema y datos de prueba
- [x] API REST (Node/Express)
- [x] Frontend React con catálogo y carrito
- [x] Panel admin CRUD
- [x] Simulación de pago (mock checkout)
- [ ] Imágenes de productos reales
- [ ] Tests básicos

### FASE 2 — Refinamiento y Contenido
- [ ] Fotografías reales de joyas
- [ ] SEO básico (meta tags, OpenGraph)
- [ ] Filtros avanzados en catálogo (material, rango precio)
- [ ] Búsqueda por nombre
- [ ] Galería de imágenes por producto (múltiples fotos)
- [ ] Variantes de producto (talla de anillo, largo de cadena)
- [ ] Wishlist / Favoritos
- [ ] Reportes en panel admin (ventas, productos más vendidos)

### FASE 3 — Producción y Pagos
- [ ] Migrar a servidor VPS (DigitalOcean, Hostinger, etc.)
- [ ] Configurar dominio y SSL (Let's Encrypt)
- [ ] Integrar **MercadoPago Checkout Pro** (Chile + LATAM)
- [ ] Integrar **WebPay Plus de Transbank** (Chile - tarjetas locales)
- [ ] Email de confirmación de pedido (Nodemailer / SendGrid)
- [ ] Subida de imágenes a la nube (Cloudinary o AWS S3)
- [ ] Variables de entorno en producción
- [ ] PM2 para proceso Node en producción
- [ ] Nginx como reverse proxy

### FASE 4 — Mejoras Avanzadas
- [ ] Sistema de descuentos y cupones
- [ ] Programa de puntos / fidelización
- [ ] Integración con WhatsApp Business API
- [ ] PWA (Progressive Web App)
- [ ] Multi-idioma (español/inglés)
- [ ] Tracking de envíos

---

## Integración de Pagos — Roadmap

### MercadoPago
- **Modalidad:** Checkout Pro (redirección) o Checkout Bricks (embebido)
- **Cobertura:** Chile, Argentina, Colombia, México, Perú
- **Credenciales:** Obtener en https://www.mercadopago.cl/developers
- **SDK:** `npm install mercadopago`
- **Webhook:** Notificación IPN en `/api/webhooks/mercadopago`

### WebPay Plus (Transbank)
- **Modalidad:** Pago con tarjetas chilenas (débito/crédito)
- **SDK:** `npm install transbank-sdk`
- **Entorno pruebas:** Credenciales de integración disponibles en Transbank
- **Webhook:** Retorno en `/api/webhooks/webpay/retorno`

### Flujo de pago actual (SIMULADO)
```
Checkout → Formulario contacto → Selección método pago → 
Pantalla "procesando" → Pedido guardado como 'pendiente' → 
Página de éxito con número de pedido
```

---

## Configuración del Entorno de Desarrollo

### Requisitos previos
- Node.js 18+
- MySQL 8.0+
- npm o pnpm

### Instalación
```bash
# 1. Crear base de datos
mysql -u root -p < database/schema.sql

# 2. Configurar variables de entorno
cp server/.env.example server/.env
# Editar server/.env con tus credenciales MySQL

# 3. Instalar dependencias
npm run install:all

# 4. Iniciar en modo desarrollo
npm run dev
```

### Acceso local
- **Catálogo:** http://localhost:5173
- **Admin:** http://localhost:5173/admin
- **API:** http://localhost:3001/api
- **Credenciales admin por defecto:** admin@holanda.cl / admin123

---

## Credenciales y Secretos

> **NUNCA subir el archivo `.env` al repositorio**

- Admin default: `admin@holanda.cl` / `admin123` (cambiar en producción)
- JWT Secret: definir en `.env`
- DB Password: definir en `.env`

---

## Registro de Sesiones

### 2026-08-15
- Inicio del proyecto
- Creación de estructura base de directorios
- Implementación completa de Fase 1:
  - Schema MySQL con datos de prueba
  - API REST con Express (productos, categorías, pedidos, auth)
  - Frontend React: Home, Catálogo, Detalle, Carrito, Checkout, Admin
  - Panel admin: login, dashboard, CRUD productos, categorías y órdenes
  - Simulación de flujo de pago

---

## Notas Técnicas

### Manejo de imágenes
- **Fase 1 (local):** Multer guarda en `server/src/uploads/`
- **Producción:** Migrar a Cloudinary con el paquete `cloudinary` y `multer-storage-cloudinary`

### CORS
- En desarrollo: permitir `http://localhost:5173`
- En producción: restringir al dominio real

### Variables de entorno por fase
| Variable | Desarrollo | Producción |
|----------|-----------|-----------|
| NODE_ENV | development | production |
| PORT | 3001 | 80/443 (nginx proxy) |
| DB_HOST | localhost | IP servidor |
| FRONTEND_URL | http://localhost:5173 | https://tudominio.cl |

---

## Decisiones de Diseño

- **Colores:** Carbón oscuro (#1C1C1E) + Dorado (#C9A84C) + Crema (#FAF7F0)
- **Tipografía:** Sistema sans-serif + serif para títulos elegantes
- **Precio mayoreo:** visible cuando el cliente selecciona modo mayoreo o cantidad >= mínimo
- **Sin login de cliente:** pedidos anónimos con email de seguimiento (simplifica Fase 1)
- **Estado del pedido:** visible con número de pedido en URL pública

---

_Mantener este documento actualizado en cada sesión de trabajo._
