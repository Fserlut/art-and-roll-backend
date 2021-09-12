class ArtsController {
	async getTotal(req, res, next) {
		try {
			const {userId} = req.body;
			// let userData = await userService.login(phone, code);
			// res.status(userData.status).json(userData);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new ArtsController();
