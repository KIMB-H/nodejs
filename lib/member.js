module.exports = {
    isOwner: function (request, response) {
        if (request.session.is_logined) { //login에 성공
            return true;
        } else { //로그인에 실패
            return false;
        }
    },
    statusUI(request, response) {
        let authStatusUI = '<a href="/member/login">login</a>';
        if (this.isOwner(request, response)) {
            authStatusUI = `${request.session.nickname} | <a href="/member/logout">logout</a>`;
        }
        return authStatusUI;
    }
}
//모듈은 이름이 기본적으로 있