const express = require('express');
const router = express.Router();
const template = require('../lib/template');
const member = require('../lib/member');

router.get('/', (request, response) => {
    console.log(request.session);
    const title = 'Welcome';
    const description = 'Hello, Node.js';
    const list = template.list(request.list);
    const html = template.HTML(title, list, `
                <div>
                    <h2>${title}</h2>
                    ${description}
                </div>
            `, `<a href="/topic/create">create</a>`, member.statusUI(request, response));
    response.send(html);
});

module.exports = router;