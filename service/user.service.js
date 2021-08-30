const UserModel = require('../models/user.model');
const tokenService = require('../service/token.service');
const UserDto = require('../dtos/user.dtos');
const ApiError = require("../exceptions/api-error");
const helpers = require("../helpers/index");
const EasyYandexS3 = require("easy-yandex-s3");

class UserService {
	async updateAvatar(base64, login) {
		let user = await UserModel.findOne({login});
		if (!user) {
			throw ApiError.BadRequest('Не удалось найти пользователя с таким Логином');
		}
		const s3 = await new EasyYandexS3({
			auth: {
				accessKeyId: process.env.YA_CLOUD_STORAGE_ID_KEY,
				secretAccessKey: process.env.YA_CLOUD_STORAGE_SECRET_KEY,
			},
			Bucket: "art-and-roll-backet",
			debug: true,
		});
		try {
			const buffer = helpers.toBuffer(helpers._base64ToArrayBuffer(base64));
			let removed = await s3.Remove(`${user._id}/avatar`);
			console.log('removed = ', removed);
			if (!removed) {
				throw ApiError.BadRequest('Ошибка при загрузке фотографии');
			}
			const upload = await s3.Upload({
				buffer,
				name: `${new Date().toLocaleString()}_avatar.jpeg`,
			}, `${user._id}/avatar/`);
			const avatarUrl = upload.Location;
			await UserModel.updateOne({login}, {$set: {avatar: avatarUrl}});
			user = await UserModel.findOne({login});
			let userDto = new UserDto(user);
			return ({ success: true, user: userDto });
		} catch (e) {
			throw ApiError.BadRequest('Ошибка при загрузке фотографии');
		}
	}

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
				await UserModel.updateOne({phone}, {$pull: {smsCodes: {...candidateCode}}});
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
		if (!refreshToken) {
			throw ApiError.UnauthorizedError();
		}
		const userData = tokenService.validateRefreshToken(refreshToken);
		const tokenFromDb = await tokenService.findToken(refreshToken);
		if (!userData || !tokenFromDb) {
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
