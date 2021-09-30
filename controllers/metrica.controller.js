const createLabels = (time) => {
	let labels = 12;
	let months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'нояб', 'дек'];
	let date = new Date();
	let dateParams = {
		month: date.getMonth() === 0 ? 11 : date.getMonth(),
		year: date.getFullYear(),
	};
	switch (time) {
		case '3year': {
			labels *= 3;
			let result = [];
			for (let i = 0; i < 3; i++){
				for (let j = 0; j < months.length; j++){
					if (months[j] + ' ' + (dateParams.year - 2 + i) === months[dateParams.month] + ' ' + dateParams.year) {
						return result.slice(dateParams.month - 1);
					}
					result.push(months[j] + ' ' + (dateParams.year - 2 + i));
				}
			}
			return months.slice(dateParams.month - labels, dateParams.month).map(el => el + ' ' + dateParams.year);
		}
		case '6month': {
			labels = 6;
			return months.slice(dateParams.month - labels, dateParams.month).map(el => el + ' ' + dateParams.year);
		}
		case '3month': {
			labels = 3;
			return months.slice(dateParams.month - 3, dateParams.month).map(el => el + ' ' + dateParams.year);
		}
		default: {
			if (dateParams.month === 11) {
				return months.map(el => el + ' ' + dateParams.year);
			} else {
				return [...months.slice(dateParams.month - 1, 12).map(el => el + ' ' + (dateParams.year - 1)), ...months.slice(0, dateParams.month).map(el => el + ' ' + dateParams.year)];
			}
		}
	}
}

const createData = (labels) => {
	let result = [];
	for (let i = 0; i < labels; i++) {
		result.push(Math.floor(Math.random() * 1000 * Math.random() * 100));
	}
	return result;
}

const createDefault = (time) => {
	const labels = createLabels(time);
	return {
		labels,
		datasets: [
			{
				data: createData(labels.length),
				label: "vk.com",
				borderColor: "#3e95cd",
				fill: false,
				hidden: false,
			},
			{
				data: createData(labels.length),
				label: "google.com",
				borderColor: "#8e5ea2",
				fill: false,
				hidden: false,
			},
			{
				data: createData(labels.length),
				label: "yandex.ru",
				borderColor: "#3cba9f",
				fill: false,
				hidden: false,
			},
			{
				data: createData(labels.length),
				label: "github.com",
				borderColor: "#e8c3b9",
				fill: false,
				hidden: false,
			},
			{
				data: createData(labels.length),
				label: "gitlab.com",
				borderColor: "#c45850",
				fill: false,
				hidden: false,
			}
		]
	}
}

class MetricaController {
	async search(req, res, next) {
		let { query } = req;
		if (query.value) {
			let labels = createLabels(query.time);
			res.json({
				data: createData(labels.length),
				label: query.value,
				borderColor: 'gray',
				fill: false,
				hidden: false,
			})
		} else {
			res.json(createDefault(query.time));
		}
	}
	updateTime(req, res, next) {
		let { body } = req;
		const labels = createLabels(body.time);
		let result = [];
		for (let i = 0; i < body.names.length; i++) {
			result.push({
				data: createData(labels.length),
				label: body.names[i].label,
				borderColor: body.names[i].color,
				fill: false,
				hidden: false,
			})
		}
		res.json({
			labels,
			datasets: result
		})

	}
}

module.exports = new MetricaController();
