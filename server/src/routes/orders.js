const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Públicas
router.post('/', ctrl.createOrder);
router.get('/seguimiento/:numero', ctrl.getByNumber);

// Admin
router.get('/admin', auth, ctrl.adminGetAll);
router.get('/admin/:id', auth, ctrl.adminGetOne);
router.put('/admin/:id/estado', auth, ctrl.adminUpdateStatus);

module.exports = router;
