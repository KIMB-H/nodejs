const http = require('http');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const db = require('./lib/db');
const topic = require('./lib/topic'); //js는 생략 가능
const author = require('./lib/author');

const app = http.createServer(function (request, response) {
    let _url = request.url;
    const queryData = url.parse(_url, true).query;
    const pathname = url.parse(_url, true).pathname;

    // console.log(url.parse(_url, true));
    // url.parse(_url, true).pathname //query string 제외한 path만을 보여준다. 

    //root로 들어왔는가 확인하기
    if (pathname === '/') {
        if (queryData.id === undefined) { //home
            topic.home(request, response);
        } else { //상세보기
            topic.page(request, response);
        }

    } else if (pathname === '/create') {
        topic.create(request, response);
    } else if (pathname === '/create_process') {
        topic.create_process(request, response);
    } else if (pathname === '/update') {
        topic.update(request, response);
    } else if (pathname === "/update_process") {
        topic.update_process(request, response);
    } else if (pathname === "/delete_process") {
        topic.delete_process(request, response);
    } else if (pathname === "/author") {
        author.home(request, response);
    } else if (pathname === "/author/create_process") {
        author.create_process(request, response);
    } else if (pathname === "/author/update") {
        author.update(request, response);
    } else if (pathname === "/author/update_process") {
        author.update_process(request, response);
    } else if (pathname === "/author/delete_process") {
        author.delete_process(request, response);
    } else {
        response.writeHead(404);
        response.end('Not Found');
    }

});
app.listen(3000);