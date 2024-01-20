//실무에서는 다음과 같이 template를 만들어 중요한 정보는 지운 상태로 올리고 사용할 때 파일을 복붙하여 이용한다. 
const mysql = require('mysql');
const db = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});
db.connect();
module.exports = db;