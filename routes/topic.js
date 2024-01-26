const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const template = require('../lib/template');
const member = require('../lib/member');

const sanitizeHtml = require('sanitize-html');

router.get('/create', (request, response) => {
    if (!member.isOwner(request, response)) {
        response.redirect('/');
        return false;
    }
    db.query(`SELECT * FROM author`, (error2, authors) => {
        const title = 'CREATE';
        const list = template.list(request.list); //콤보박스는 select 태그에서 사용할 수 있다. 
        //select 태그의 name을 주면 전송 데이터의 이름이 된다. 
        const html = template.HTML(title, list, `
                <form action="/topic/create_process" method="post">
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
                    `, `<a href="/topic/create">create</a>`, member.statusUI(request, response));
        response.send(html);
    });
});


router.post('/create_process', (request, response) => {
    if (!member.isOwner(request, response)) {
        response.redirect('/');
        return false;
    }
    const post = request.body;
    db.query(
        `INSERT INTO topic (title, description, created, author_id) VALUES (?,?,NOW(),?);`,
        [post.title, post.description, post.author], (error, result) => { //post.author는 select tag의 name을 author로 지었기 때문에 author로 접근하는 것이다. 
            if (error) throw error;
            response.redirect(`/topic/${result.insertId}`);
        });
});

router.get('/update/:pageId', (request, response) => {
    if (!member.isOwner(request, response)) {
        response.redirect('/');
        return false;
    }
    db.query(`SELECT * FROM topic WHERE id=?`, [request.params.pageId], (error2, topic) => {
        if (error2) {
            next(error2);
            //throw error2;
        }
        else {
            db.query(`SELECT * FROM author`, (error2, authors) => {
                const sanitizedTitle = sanitizeHtml(topic[0].title);
                const sanitizedDescription = sanitizeHtml(topic[0].description);
                const list = template.list(request.list); //author의 현재 값 반영하기
                const html = template.HTML(sanitizedTitle, list, `
                        <form action="/topic/update_process" method="post">
                        <input type="hidden" name="id" value="${topic[0].id}">
                        <p><input type="text" name="title" placeholder="title" value="${sanitizedTitle}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${sanitizedDescription}</textarea>
                        </p>
                        <p>
                            ${template.authorSelect(authors, topic[0].author_id)}
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                        </form>
                    `, `<a href="/topic/create">create</a> <a href="/topic/update/${topic[0].id}">update</a>`, member.statusUI(request, response));
                response.send(html);
            });
        }
    });
});

router.post('/update_process', (request, response) => {
    if (!member.isOwner(request, response)) {
        response.redirect('/');
        return false;
    }
    const post = request.body;
    db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`, [post.title, post.description, post.author, post.id], (error, result) => {
        response.redirect(`/topic/${post.id}`);
    });
});

router.post('/delete_process', (request, response) => {
    if (!member.isOwner(request, response)) {
        response.redirect('/');
        return false;
    }
    const post = request.body;

    db.query(`DELETE FROM topic WHERE id=?`, [post.id], (error, result) => {
        if (error) throw error;
        response.redirect('/');
    });
});


router.get('/:pageId', (request, response, next) => {
    db.query(`SELECT topic.id,title,description,created,author_id,name,profile FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?;`, [request.params.pageId], (error2, topic) => {
        try {
            const sanitizedTitle = sanitizeHtml(topic[0].title);
            const sanitizedDescription = sanitizeHtml(topic[0].description);
            const sanitizedName = sanitizeHtml(topic[0].name);
            const topicId = topic[0].id;
            const list = template.list(request.list);
            const html = template.HTML(sanitizedTitle, list, `
                        <div>
                            <h2>${sanitizedTitle}</h2>
                            ${sanitizedDescription}
                            <p>by ${sanitizedName}</p>
                        </div>
                    `, `<a href="/topic/create">create</a>
                    <a href="/topic/update/${topicId}">update</a>
                    <form action="/topic/delete_process" method="post">
                        <input type="hidden" name="id" value="${topicId}">
                        <input type="submit" value="delete">
                    </form>`, member.statusUI(request, response));
            response.send(html);
        } catch {
            next(error2);
        }
    });
});

module.exports = router;