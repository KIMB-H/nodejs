const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const template = require('../lib/template');
const sanitizeHtml = require('sanitize-html');

router.get('/login', (request, response) => {
    db.query(`SELECT * FROM author`, (error2, authors) => {
        const title = 'Login';
        const list = template.list(request.list); //콤보박스는 select 태그에서 사용할 수 있다. 
        //select 태그의 name을 주면 전송 데이터의 이름이 된다. 
        const html = template.HTML(title, list, `
                <form action="/member/login_process" method="post">
                <p><input type="text" name="email" placeholder="email"></p>
                <p><input type="password" name="pwd" placeholder="password"></p>
                <p>
                    <input type="submit" value="login">
                </p>
            </form>
                    `, ``);
        response.send(html);
    });
});

router.post('/login_process', (request, response) => {
    const post = request.body;
    db.query(
        `SELECT * FROM member_table WHERE email=? and pwd=?;`,
        [post.email, post.pwd], (error, result) => { //post.author는 select tag의 name을 author로 지었기 때문에 author로 접근하는 것이다. 
            if (error) throw error;
            if (result.length === 0) {
                response.send('WHO?');
            }
            else {
                request.session.is_logined = true;
                request.session.nickname = result[0].nickname;
                //로그인 했는지 알 수 있는 정보, 페이지에 접근할 때마다 필요한 정보 (예, 닉네임)를 세션에 저장

                request.session.save(() => {
                    response.redirect(`/`);
                });

            }
        });
});

router.get('/logout', (request, response) => {
    //session destroy 세션 삭제, 세션 삭제 끝나면 호출되는 콜백
    request.session.destroy((err) => {
        response.redirect('/'); //session이 사라지고 is_logined와 nickname 값은 없는 새로운 session이 생성된다.
    });
});


module.exports = router;