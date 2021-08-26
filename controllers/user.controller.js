// const ApiError = require('../exceptions/api-error');
const userService = require('../service/user.service');
const UserModel = require('../models/user.model');
const fetch = require('node-fetch');
const { URL } = require('url');
const UserDto = require('../dtos/user.dtos');
const tokenService = require('../service/token.service');
const SMS_AERO_API_KEY = 'KnjQmXzDddmDxgeqpcZ7D2PrpT';

const createCode = () => {
	let code = [];
	for (let i = 0; i < 4; i++) {
		code.push(Math.ceil(Math.random() * (9 - 0) + 0));
	}
	return (code.join(''));
}

class UserController {
	async findUser(req, res) {
		let { phone } = req.body;
		const user = await UserModel.findOne({phone});
		res.json({isActive: !!user});
	}

	async create(req, res) {

	}

	async sendSms(req, res) {
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
			} else {
				await user.updateOne({ $push: { smsCodes: acceptCode}});
			}
			const smsText = 'Ваш код подтверждения: ' + acceptCode.value;
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
				console.log('Ошибка при отправке смс');
			}
			res.json({success: dataAero.success, userId: user._id});
		} catch (e) {
			console.log(e);
			res.json({})
		}
	}

	async registration(req, res, next) {
		try {
			let { phone } = req.body;
			const userData = await userService.registration(email, password);
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}

	async login(req, res) {
		try {
			const {code, phone} = req.body;
			let userData = await userService.login(phone, code);
			res.status(userData.status).json(userData);
		} catch (e) {
			console.log(e);
			res.status(500).json({error: {message: 'Ошибка на сервере'}});
		}
	}
}


module.exports = new UserController();