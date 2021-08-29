const Router = require('express').Router;
const userController = require('../controllers/user.controller');
const router = new Router();
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/valid-login', userController.validLogin);
router.post('/find-user', userController.findUser);
router.post('/send-verify', userController.sendSms);
router.post('/check-code', userController.login);
router.post('/logout', userController.logout);
router.get('/refresh', userController.refresh);
router.post('/update-avatar', authMiddleware, userController.updateAvatar);

module.exports = router
