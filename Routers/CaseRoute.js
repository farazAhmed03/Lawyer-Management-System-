const express = require('express');
const router = express.Router();
const auth = require('../Middleware/authMiddleware');
const upload = require('../Utils/multer');
const caseController = require('../Controllers/CaseController');

router.post('/:appointmentId', auth, upload.single('file'), caseController.createCase);
router.get('/', auth, caseController.getCases);
router.get('/:caseId', auth, caseController.getCase);
router.patch('/accept/:caseId', auth, caseController.acceptCase);
router.patch('/reject/:caseId', auth, caseController.rejectCase);
router.patch('/update-status/:caseId', auth, caseController.updateCaseStatus);

router.delete('/:caseId', auth, caseController.deleteCase);

module.exports = router;
