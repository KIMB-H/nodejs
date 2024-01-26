const express = require('express');
const app = express();
const db = require('./lib/db');
const bodyParser = require('body-parser');
const compression = require('compression');
const topicRouter = require('./routes/topic');
const indexRouter = require('./routes/index');
const authorRouter = require('./routes/author');
const memberRouter = require('./routes/member');
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
// const MySQLStore = require('express-mysql-session')(session);
app.use(helmet());

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get('*', function (request, response, next) { //get 방식으로 들어오는 경우에만 실행
    db.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) { console.log(error); }
        request.list = topics;
        next(); //그 다음에 호출되어야 할 미들웨어 호출
    });
});

app.use(session({
    secure: true,
    HttpOnly: true,
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));

app.use('/topic', topicRouter); // /topic으로 들어오는 경로에 topicRouter라는 미들웨어를 적용하겠다. 
app.use('/', indexRouter);
app.use('/author', authorRouter);
app.use('/member', memberRouter);
//rout, routing 이용자가 접속한 경로에 따라 다른 응답 대응

app.use((req, res, next) => {
    res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) { //error 핸들링 위한 미들웨어
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(3000, () => {
    console.log('Listening 3000 with express!!!');
});
