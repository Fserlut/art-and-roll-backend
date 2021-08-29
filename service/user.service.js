const UserModel = require('../models/user.model');
const tokenService = require('../service/token.service');
const UserDto = require('../dtos/user.dtos');
const ApiError = require("../exceptions/api-error");

class UserService {

	async login(phone, code) {
		const user = await UserModel.findOne({phone});
		let candidateCode = user.smsCodes.filter(codeBD => codeBD.value === code)[0];
		if (!candidateCode) {
			throw ApiError.BadRequest('Неверный код подтверждения')
		} else {
			const created = new Date(candidateCode.created);
			const experedDate = new Date(new Date(candidateCode.created).setSeconds(new Date(candidateCode.created).getSeconds() + candidateCode.expered));
			let isAccepted = experedDate >= new Date();
			if (isAccepted) {
				const userDto = new UserDto(user);
				const tokens = tokenService.generateTokens({...userDto});
				await tokenService.saveToken(userDto.id, tokens.refreshToken);
				return {status: 200, data: {success: true, message: 'Успешно', tokens, user: userDto}}
			}
			throw ApiError.BadRequest(`Срок действия кода истек`)
		}
	}

	async logout(refreshToken) {
		const token = await tokenService.removeToken(refreshToken);
		return token;
	}

	async refresh(refreshToken) {
		console.log('refreshToken = ', refreshToken);
		if (!refreshToken) {
			throw ApiError.UnauthorizedError();
		}
		const userData = tokenService.validateRefreshToken(refreshToken);
		const tokenFromDb = await tokenService.findToken(refreshToken);
		console.log();
		if (!userData || !tokenFromDb) {
			console.log('!userData || !tokenFromDb');
			throw ApiError.UnauthorizedError();
		}
		const user = await UserModel.findById(userData.id);
		const userDto = new UserDto(user);
		const tokens = tokenService.generateTokens({...userDto});

		await tokenService.saveToken(userDto.id, tokens.refreshToken);
		return {tokens, user: userDto}
	}

	async getAllUsers() {
		const users = await UserModel.find();
		return users;
	}
}

module.exports = new UserService();
