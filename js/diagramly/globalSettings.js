var authorization = localStorage.getItem("authorization");
let auth=sessionStorage.getItem("authorization")
if (authorization == null || authorization == "" || localStorage.getItem("uname") == null || localStorage.getItem("uname") == "") {
    window.location.replace("http://" + location.host + "/login.html")
}
$.ajaxSetup({
    // beforeSend:function(xhr) {
    //     xhr.setRequestHeader("Authorization", authorization)
    // },
    //设置ajax请求结束后的执行动作
    complete:
        function (XMLHttpRequest, textStatus) {
            if (XMLHttpRequest.getResponseHeader('Authorization') != null && XMLHttpRequest.getResponseHeader('Authorization') != "") {
                localStorage.setItem("authorization", XMLHttpRequest.getResponseHeader('Authorization'));
            }
            if (XMLHttpRequest.status == 400 || XMLHttpRequest.status == 401) {
                console.warn("登录超时")
                window.location.replace("http://"+location.host+"/login.html")
            }
        }

});