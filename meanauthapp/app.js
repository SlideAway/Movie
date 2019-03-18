const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const users = require('./routes/users');
const movies = require('./routes/movies');
const config = require('./config/database');
//const moviedb = require('./config/moviedb');
const https = require('https');
const fs = require('fs');

const router = express.Router();

//DB에 연결
//mongoose.Promise = global.Promise;
mongoose.connect(config.database, {
  //useMongoClient: true
  useNewUrlParser:true
});
/*mongoose.connect(moviedb.database, {
  useNewUrlParser: true
});
*/
//연결
mongoose.connection.on('connected', () => {
  console.log('Connected to Database ' + config.database);
});
/*mongoose.connection.on('connected', () => {
  console.log('Successed to connection ' + moviedb.database);
})*/
//에러처리
mongoose.connection.on('error', (err) => {
  console.log('Database error : ' + err);
});
/*
mongoose.connection.on('error', (err) => {
  console.log('MovieDB connection error');
});
*/
const app = express();
//port 번호 지정
const port = 3000;
//const port = process.env.PORT||3000;
//CORS 사용
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

//Body Parser 사용
app.use(bodyparser.json());

//Passport Middleware

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//app.use('/', routes)
app.use('/users', users);
app.use('/movies', movies);

app.get('/', (req, res) => {
  res.send('<h1>서비스 개통중...</h1><p>Hello World! Hello Web Programming Again!</p>');
}) //사용자가 요청정보를 보낼 때 사용자에게 보낼 응답정보

app.get('/products/:id', function(req, res, next) {
  res.json({
    msg: "This is CORS-enabled for all origins!"
  })
})

//start server

app.listen(port, () => { //listen에 첫번째 인스턴스는 port고 2번째 인스턴스는 ()=>와 function()이 같다 이 functuin()을 콜백하수라고 부름
  console.log("server started on port " + port);
});

/*
https.createServer({
  key:fs.readFileSync('caPrivateKey.pem'),
  cert:fs.readFileSync('caCert.pem')
}, app).listen(port, function() {
  console.log('HTTPS Server Started on port'+port);
});
*/
