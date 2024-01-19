const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const path = require('path');
const template = require('./lib/template.js');
const sanitizeHtml = require('sanitize-html');
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'opentutorials'
});
db.connect();

const app = http.createServer(function (request, response) {
    let _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathname = url.parse(_url, true).pathname;

    // console.log(url.parse(_url, true));
    // url.parse(_url, true).pathname //query string 제외한 path만을 보여준다. 

    //root로 들어왔는가 확인하기
    if (pathname === '/') {
        if (queryData.id === undefined) { //home
            db.query(`SELECT * FROM topic`, (error, topics) => {
                if (error) { console.log(error); }
                const title = 'Welcome';
                const description = 'Hello, Node.js';
                const list = template.list(topics);
                const html = template.HTML(title, list, `
                        <div>
                            <h2>${title}</h2>
                            ${description}
                        </div>
                    `, `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(html);
            });
        } else { //상세보기
            /*fs.readdir('./data', (err, files) => {
                let filteredId = path.parse(queryData.id).base; //파일명 부분만으로 걸러냄
                fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
                    let title = queryData.id;
                    const sanitizedTitle = sanitizeHtml(title);
                    const sanitizedDescription = sanitizeHtml(description);
                    const list = template.list(files);
                    const html = template.HTML(sanitizedTitle, list, `
                    <div>
                        <h2>${sanitizedTitle}</h2>
                        ${sanitizedDescription}
                    </div>
                `, `<a href="/create">create</a>
                    <a href="/update?id=${sanitizedTitle}">update</a>
                    <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete">
                    </form>`);
                    response.writeHead(200);
                    response.end(html);
                });
            });*/

            db.query(`SELECT * FROM topic`, (error, topics) => {
                if (error) throw error;
                db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (error2, topic) => {
                    //?를 하고 그 다음에 대입할 값을 [](배열)에 담아서 그 다음에 적으면 치환될 때 공격 의도 가능성 있는 코드는 세탁해준다. 
                    if (error2) throw error2;

                    const title = topic[0].title;
                    const description = topic[0].description;
                    const list = template.list(topics);
                    const html = template.HTML(title, list, `
                            <div>
                                <h2>${title}</h2>
                                ${description}
                            </div>
                        `, `<a href="/create">create</a>
                        <a href="/update?id=${queryData.id}">update</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${queryData.id}">
                            <input type="submit" value="delete">
                        </form>`);
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }

    } else if (pathname === '/create') {
        db.query(`SELECT * FROM topic`, (error, topics) => {
            if (error) { console.log(error); }
            const title = 'CREATE';
            const list = template.list(topics);
            const html = template.HTML(title, list, `
            <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
                `, `<a href="/create">create</a>`);
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create_process') {
        let body = '';
        request.on('data', function (data) {
            body = body + data; //callback 실행될 때마다 data를 추가

            // if (body.length > 1e6) {
            //     //용량이 너무 크면 접속 차단
            //     request.connection.destroy();
            // }
        }); //웹 브라우저가 post로 데이터 전송하는 것을 대비하기 위해 조각조각을 수신할 때마다 콜백함수를 호출한다. data를 인자를 통해 수신한 데이터를 받음
        request.on('end', function () { //더 이상 들어올 정보가 없으면 이 콜백 함수 호출
            let post = qs.parse(body); //post 데이터의 post 정보가 들어있다. 

            db.query(
                `INSERT INTO topic (title, description, created, author_id) VALUES (?,?,NOW(),?);`,
                [post.title, post.description, 1], (error, result) => {
                    if (error) throw error;
                    response.writeHead(302, { Location: `/?id=${result.insertId}` });
                    response.end();
                });
        });
    } else if (pathname === '/update') {
        fs.readdir('./data', (err, files) => {
            let filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
                let title = queryData.id;
                const list = template.list(files);
                const html = template.HTML(title, list, `
                <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                <p>
                    <textarea name="description" placeholder="description">${description}</textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
                </form>
            `, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === "/update_process") {
        let body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            let post = qs.parse(body);
            const id = post.id;
            const title = post.title;
            const description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, (err) => {
                if (err) throw err;
                fs.writeFile(`data/${title}`, description, 'utf-8', (err) => {
                    if (err) throw err;
                    response.writeHead(302, { Location: `/?id=${title}` });
                    response.end();
                });
            });
            console.log(post);
        });
    } else if (pathname === "/delete_process") {
        let body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            let post = qs.parse(body);
            const id = post.id;
            let filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, (err) => {
                response.writeHead(302, { Location: `/` });
                response.end();
            });
            console.log(post);
        });
    } else {
        response.writeHead(404);
        response.end('Not Found');
    }

});
app.listen(3000);