const userService = require('../service/user.service');
const UserModel = require('../models/user.model');
const fetch = require('node-fetch');
const { URL } = require('url');
const UserDto = require('../dtos/user.dtos');
const tokenService = require('../service/token.service');
const ApiError = require("../exceptions/api-error");
const SMS_AERO_API_KEY = 'KnjQmXzDddmDxgeqpcZ7D2PrpT';

const createCode = () => {
	let code = [];
	for (let i = 0; i < 4; i++) {
		code.push(Math.ceil(Math.random() * (9 - 0) + 0));
	}
	return (code.join(''));
}

class UserController {
	async updateAvatar(req, res, next) {
		const { base64, login } = req.body;
		try {
			let data = await userService.updateAvatar(base64, login);
			res.json({ data });
		} catch (e) {
			next(e);
		}
	}

	async findUser(req, res) {
		let { phone } = req.body;
		const user = await UserModel.findOne({phone});
		res.json({isActive: !!user});
	}

	async validLogin(req, res) {
		let { login } = req.body;
		const user = await UserModel.findOne({login});
		res.json({isClosed: !!user});
	}

	async sendSms(req, res, next) {
		const { phone, login, name, findSpheres, mySpheres, type } = req.body;
		const acceptCode = {
			type,
			value: createCode(),
			created: new Date().toISOString(),
			expered: 300,
		}
		try {
			let user = await UserModel.findOne({phone});
			console.log(acceptCode);
			if (!user) {
				console.log('Создаем юзера')
				user = await UserModel.create({phone, login, findSpheres, mySpheres, smsCodes: [acceptCode], name});
				let users = await UserModel.find({});
				const users_msg = `Зарегистрирован новый юзер, общее колличество юзеров: ${users.length}`;
				const tg_msg_users = await fetch(new URL(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_API_KEY}/sendMessage?chat_id=-571922064&parse_mode=html&text=${users_msg}`));
			} else {
				await user.updateOne({ $push: { smsCodes: acceptCode}});
			}
			const smsText = 'Ваш код подтверждения: ' + acceptCode.value;
			const MSG_FOR_TG = `Код подтверждения для юзера ${phone}: ${acceptCode.value}`;
			const tg_msg = await fetch(new URL(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_API_KEY}/sendMessage?chat_id=-515788632&parse_mode=html&text=${MSG_FOR_TG}`));
			let smsAero = await fetch(new URL(`https://zakharovvilya@yandex.ru:${SMS_AERO_API_KEY}@gate.smsaero.ru/v2/sms/testsend?number=${phone.substr(1)}&text=${smsText}&sign=BIZNES`).href, {
				method: 'GET',
				headers: {
					'content-type': 'application/json'
				}
			});
			let dataAero = await smsAero.json();
			if (dataAero.success) {
				console.log('Смс успешно отправлено');
			} else {
				return next(ApiError.BadRequest('Ошибка при отправке смс'))
			}
			res.json({success: dataAero.success, userId: user._id});
		} catch (e) {
			next(e);
		}
	}

	async login(req, res, next) {
		try {
			const {code, phone} = req.body;
			let userData = await userService.login(phone, code);
			res.cookie('refreshToken', userData.data.tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			res.status(userData.status).json(userData);
		} catch (e) {
			next(e);
		}
	}

	async logout(req, res, next) {
		try {
			const {refreshToken} = req.cookies;
			const token = await userService.logout(refreshToken);
			res.clearCookie('refreshToken');
			return res.json(token);
		} catch (e) {
			next(e);
		}
	}

	async refresh(req, res, next) {
		try {
			const { refreshToken } = req.body;
			const userData = await userService.refresh(refreshToken);
			console.log('userData = ', userData);
			res.cookie('refreshToken', userData.tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}
}


module.exports = new UserController();
