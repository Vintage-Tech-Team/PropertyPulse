const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/', contactController.createContactMessage);
router.get('/', contactController.getAllContactMessages);
router.get('/:id', contactController.getContactMessageById);
router.put('/:id', contactController.updateContactMessage);
router.delete('/:id', contactController.deleteContactMessage);

module.exports = router;
