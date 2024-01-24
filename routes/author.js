const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const template = require('../lib/template');
const sanitizeHtml = require('sanitize-html');
const qs = require('querystring');

router.post('/create_process', (request, response) => {
    const post = request.body;
    console.log(post);
    db.query(
        `INSERT INTO author (name, profile) VALUES (?,?);`,
        [post.name, post.profile], (error, result) => {
            if (error) throw error;
            response.redirect('/author');
        });
});

router.get('/update/:authorId', (request, response) => {
    db.query(`SELECT * FROM author`, (error2, authors) => {
        db.query(`SELECT * FROM author WHERE id=?`, [request.params.authorId], (error3, author) => {
            // console.log(author);
            const title = 'author';
            const list = template.list(request.list);
            const html = template.HTML(title, list, `
                            ${template.authorTable(authors)}
                            <form action="/author/update_process" method="post">
                                <p>
                                    <input type="hidden" name="id" value="${author[0].id}">
                                </p>
                                <p>
                                    <input type="text" name="name" value="${sanitizeHtml(author[0].name)}">
                                </p>
                                <p>
                                    <textarea name="profile">${sanitizeHtml(author[0].profile)}</textarea>
                                </p>
                                <p>
                                    <input type="submit" value="update">
                                </p>
                            </form>
                    `, ``);
            response.send(html);
        });
    });
});

router.post('/update_process', (request, response) => {
    const post = request.body;

    db.query(`UPDATE author SET name=?, profile=? WHERE id=?`, [post.name, post.profile, post.id], (error, result) => {
        response.redirect('/author');
    });

});

router.post('/delete_process', (request, response) => {
    const post = request.body;
    const id = post.id;

    db.query(`DELETE FROM author WHERE id=?`, [post.id], (error, result) => {
        if (error) throw error;
        response.redirect('/author');
    });
});

router.get('/', (request, response) => {
    db.query(`SELECT * FROM author`, (error2, authors) => {
        const title = 'author';
        const list = template.list(request.list);
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
        response.send(html);
    });
});

module.exports = router;