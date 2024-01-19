module.exports = {
    HTML: function (title, list, body, control) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>
                This is My ${title}.
            </title>
            <link rel="stylesheet" href="style.css">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
            <script src="colors.js"></script>
        </head>
        <body>
            <div id="topBanner">
                <h1><a href="/">Portfolio</a></h1>
                <div id="topButton">
                    <input type="button" value="login" onclick="alert('hi');">
                    <input type="button" value="night" onclick="
                        nightDayHandler(this);
                    ">
                </div>
            </div>
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
                list = list + `<li><a href="/?id=${topic.id}">${topic.title}</a></li>`;
            }
        });
        list = list + '</ul>';
        return list;
    }
}
