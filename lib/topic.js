const db = require('./db');
const url = require('url');
const template = require('./template');
const qs = require('querystring');

exports.home = function (request, response) {
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
}


exports.page = function (request, response) {
    let _url = request.url;
    const queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) throw error;

        //글 작성자에 대한 정보도 나타내기 위해 JOIN을 한다. 
        //다만 join을 할 때는 두 table 모두 id가 있기 때문에 어떤 table의 id인지를 WHERE 절에서 명확히 표현해야 한다. 
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], (error2, topic) => {
            //?를 하고 그 다음에 대입할 값을 [](배열)에 담아서 그 다음에 적으면 치환될 때 공격 의도 가능성 있는 코드는 세탁해준다. 
            if (error2) throw error2;

            const title = topic[0].title;
            const description = topic[0].description;
            const list = template.list(topics);
            const html = template.HTML(title, list, `
                    <div>
                        <h2>${title}</h2>
                        ${description}
                        <p>by ${topic[0].name}</p>
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

exports.create = function (request, response) {
    db.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) { console.log(error); }
        db.query(`SELECT * FROM author`, (error2, authors) => {

            const title = 'CREATE';
            const list = template.list(topics); //콤보박스는 select 태그에서 사용할 수 ㅣㅇㅆ다. 
            //select 태그의 name을 주면 전송 데이터의 이름이 된다. 
            const html = template.HTML(title, list, `
            <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                ${template.authorSelect(authors)}
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
                `, `<a href="/create">create</a>`);
            response.writeHead(200);
            response.end(html);
        });

    });
}

exports.create_process = function (request, response) {
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
            [post.title, post.description, post.author], (error, result) => { //post.author는 select tag의 name을 author로 지었기 때문에 author로 접근하는 것이다. 
                if (error) throw error;
                response.writeHead(302, { Location: `/?id=${result.insertId}` });
                response.end();
            });
    });
}

exports.update = function (request, response) {
    let _url = request.url;
    const queryData = url.parse(_url, true).query;

    db.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) throw error;
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (error2, topic) => {
            if (error2) throw error2;
            db.query(`SELECT * FROM author`, (error2, authors) => {
                const list = template.list(topics); //author의 현재 값 반영하기
                const html = template.HTML(topic[0].title, list, `
                <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                <p>
                    <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                </p>
                <p>
                    ${template.authorSelect(authors, topic[0].author_id)}
                </p>
                <p>
                    <input type="submit">
                </p>
                </form>
            `, `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);
                response.writeHead(200);
                response.end(html);
            });


        });
    });
}

exports.update_process = function (request, response) {
    let body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        let post = qs.parse(body);

        db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`, [post.title, post.description, post.author, post.id], (error, result) => {
            response.writeHead(302, { Location: `/?id=${post.id}` });
            response.end();
        });
        console.log(post);
    });
}

exports.delete_process = function (request, response) {
    let body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        let post = qs.parse(body);
        const id = post.id;

        db.query(`DELETE FROM topic WHERE id=?`, [post.id], (error, result) => {
            if (error) throw error;
            response.writeHead(302, { Location: `/` });
            response.end();
        });
        console.log(post);
    });
}