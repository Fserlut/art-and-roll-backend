require('dotenv').config()
const cookieParser = require('cookie-parser')
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error.middleware');

const PORT = process.env.PORT || 5000;
const app = express()

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(cors({
	credentials: true,
	origin: ['http://localhost:8080', 'http://localhost', 'capacitor://localhost', 'capacitor://localhost:8100', 'http://localhost:8100', 'http://localhost:8100']
}));
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
	try {
		// await mongoose.connect('mongodb+srv://admin:admin@cluster0.d4rpi.mongodb.net/art&roll?retryWrites=true&w=majority', {
		// 	useNewUrlParser: true,
		// 	useUnifiedTopology: true,
		// 	useCreateIndex: true,
		// })
		app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
	} catch (e) {
		console.log(e);
	}
}

start()
