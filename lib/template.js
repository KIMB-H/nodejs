const sanitizeHtml = require('sanitize-html');

module.exports = {
    HTML: function (title, list, body, control, authStatuseUI = `<a href="/member/login">login</a>`) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>
                This is My ${title}.
            </title>
        </head>
        <body>
            ${authStatuseUI}
            <div id="topBanner">
                <h1><a href="/">Portfolio</a></h1>
                <div id="topButton">
                    <input type="button" value="login" onclick="alert('hi');">
                    <input type="button" value="night" onclick="
                        nightDayHandler(this);
                    ">
                </div>
            </div>
            <a href="/author">author</a>
            <div id="grid">
                ${list}
                ${control}
                ${body}
            </div>
        </body>
        </html>
        `;
    },
    list: function (topics) {
        let list = '<ul>';
        topics.forEach(topic => {
            if (topic !== 'index') {
                list = list + `<li><a href="/topic/${topic.id}">${sanitizeHtml(topic.title)}</a></li>`;
            }
        });
        list = list + '</ul>';
        return list;
    },
    authorSelect: function (authors, author_id) {
        let tag = '';
        authors.forEach(author => {
            let selected = '';
            if (author.id === author_id) {
                selected = ' selected';
            }
            tag += `<option value="${author.id}"${selected}>${sanitizeHtml(author.name)}</option>`;
        });
        return `
            <select name="author">
                ${tag}
            </select>`;
    },
    authorTable: function (authors) {
        let tag = `
        <table>
        <tr>
            <th>name</th><th>profile</th><th>update</th><th>delete</th>
        </tr>`;

        authors.forEach(author => {
            tag += `
            <tr>
                <td>${sanitizeHtml(author.name)}</td>
                <td>${sanitizeHtml(author.profile)}</td>
                <td><a href="/author/update/${author.id}">update</a></td>
                <td>
                    <form action="/author/delete_process" method="post">
                        <input type="hidden" name="id" value="${author.id}">
                        <input type="submit" value="delete">
                    </form>
                </td>
            </tr>
            `;
        });
        tag += `</table>`;
        return tag;
    }
}
