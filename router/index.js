const Router = require('express').Router;
const userController = require('../controllers/user.controller');
const router = new Router();
// const {body} = require('express-validator');
// const authMiddleware = require('../middlewares/auth-middleware');

router.post('/find-user', userController.findUser);
router.post('/create', userController.create);
router.post('/send-verify', userController.sendSms);
router.post('/check-code', userController.login);
// router.get('/activate/:link', userController.activate);
// router.get('/refresh', userController.refresh);
// router.get('/users', authMiddleware, userController.getUsers);

module.exports = router