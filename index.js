require('dotenv').config()
const cookieParser = require('cookie-parser')
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error.middleware');
const http = require('http');
const https = require('https');


const PORT = process.env.PORT || 8000;
const app = express()
const fs = require('fs');

const privateKey = fs.readFileSync('sslcert/server.key');
const certificate = fs.readFileSync('sslcert/server.crt');

const credentials = {key: privateKey, cert: certificate};

const server = https.createServer(credentials, app);

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(cors({
	credentials: true,
	origin: ['http://localhost', 'capacitor://localhost', 'capacitor://localhost:8100', 'http://localhost:8100', 'http://localhost:8100']
}));
app.use('/api', router);
app.use(errorMiddleware);

app.get('/', (req, res) => {
	console.log('new request');
	res.send('<h1>Скоро тут что-то появится, а пока только это<br><img src="https://i.pinimg.com/736x/c0/4f/12/c04f12db21b2c2c9ad233344596becc0.jpg"></h1>');
})

const start = async () => {
	try {
		await mongoose.connect('mongodb+srv://admin:admin@cluster0.d4rpi.mongodb.net/art&roll?retryWrites=true&w=majority', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		})
		const httpServer = http.createServer(app);
		const httpsServer = https.createServer(credentials, app);

		httpServer.listen(80, () => console.log('http server started on PORT = 8080'));
		httpsServer.listen(443, () => console.log('https server started on PORT = 8443'));
	} catch (e) {
		console.log(e);
	}
}

start()
