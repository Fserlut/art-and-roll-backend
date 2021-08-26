const UserModel = require('../models/user.model');
const tokenService = require('../service/token.service');
const UserDto = require('../dtos/user.dtos');

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

        const user = await UserModel.create({email, password: hashPassword, activationLink})
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user); // id, email, isActivated
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.isActivated = true;
        await user.save();
    }

    async login(phone, code) {
        const user = await UserModel.findOne({phone});
        let candidateCode = user.smsCodes.filter(codeBD => codeBD.value === code)[0];
        if (!candidateCode) {
            return {status: 400, data: {error: {message: 'Неверный код подтверждения'}}};
        } else {
            const created = new Date(candidateCode.created);
            const experedDate = new Date(new Date(candidateCode.created).setSeconds(new Date(candidateCode.created).getSeconds() + candidateCode.expered));
            let isAccepted = experedDate >= new Date();
            if (isAccepted) {
                const userDto = new UserDto(user);
                const tokens = tokenService.generateTokens({...userDto});
                return {status: 200, data: {success: true, message: 'Успешно', tokens, user: userDto}}
            }
            return {status: 423, data: {error: {message: 'Срок действия кода истек', success: false}}}
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
        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }
}

module.exports = new UserService();
