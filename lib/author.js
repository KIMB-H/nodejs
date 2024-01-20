const db = require('./db');
const template = require('./template.js');
const qs = require('querystring');
const url = require('url');

exports.home = function (request, response) {
    db.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) { console.log(error); }
        db.query(`SELECT * FROM author`, (error2, authors) => {
            const title = 'author';
            const list = template.list(topics);
            const html = template.HTML(title, list, `
                        ${template.authorTable(authors)}
                        <form action="/author/create_process" method="post">
                            <p>
                                <input type="text" name="name" placeholder="name">
                            </p>
                            <p>
                                <textarea name="profile" placeholder="profile"></textarea>
                            </p>
                            <p>
                                <input type="submit" value="create">
                            </p>
                        </form>
                `, ``);
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create_process = function (request, response) {
    let body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        let post = qs.parse(body);

        db.query(
            `INSERT INTO author (name, profile) VALUES (?,?);`,
            [post.name, post.profile], (error, result) => {
                if (error) throw error;
                response.writeHead(302, { Location: `/author` });
                response.end();
            });
    });
}

exports.update = function (request, response) {

    db.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) { console.log(error); }
        db.query(`SELECT * FROM author`, (error2, authors) => {
            let _url = request.url;
            const queryData = url.parse(_url, true).query;
            db.query(`SELECT * FROM author WHERE id=?`, [queryData.id], (error3, author) => {
                // console.log(author);
                const title = 'author';
                const list = template.list(topics);
                const html = template.HTML(title, list, `
                            ${template.authorTable(authors)}
                            <form action="/author/update_process" method="post">
                                <p>
                                    <input type="hidden" name="id" value="${author[0].id}">
                                </p>
                                <p>
                                    <input type="text" name="name" value="${author[0].name}">
                                </p>
                                <p>
                                    <textarea name="profile">${author[0].profile}</textarea>
                                </p>
                                <p>
                                    <input type="submit" value="update">
                                </p>
                            </form>
                    `, ``);
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

        db.query(`UPDATE author SET name=?, profile=? WHERE id=?`, [post.name, post.profile, post.id], (error, result) => {
            response.writeHead(302, { Location: `/author` });
            response.end();
        });
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

        db.query(`DELETE FROM author WHERE id=?`, [post.id], (error, result) => {
            if (error) throw error;
            response.writeHead(302, { Location: `/author` });
            response.end();
        });
    });
}