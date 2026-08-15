const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Públicas
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Admin
router.post('/admin', auth, upload.single('imagen'), ctrl.create);
router.put('/admin/:id', auth, upload.single('imagen'), ctrl.update);
router.delete('/admin/:id', auth, ctrl.remove);

module.exports = router;
