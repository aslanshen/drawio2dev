$(function () {
    var obj = new WxLogin({
        self_redirect: true,
        //应用唯一标识
        id: "login_container",
        appid: "wx214d2ccc7c0b3d3b",
        //应用授权作用域，拥有多个作用域用逗号（,）分隔，网页应用目前仅填写snsapi_login
        scope: "snsapi_login",
        //请使用urlEncode对链接进行处理
        redirect_uri: "http%3a%2f%2fsangerbox.com%2fwxLoginMxg",
        //用于保持请求和回调的状态，授权请求后原样带回给第三方。
        // 该参数可用于防止csrf攻击（跨站请求伪造攻击），建议第三方带上该参数，
        // 可设置为简单的随机数加session进行校验
        state: "STATE",
        style: "black",
        //自定义样式链接
        href: "data:text/css;base64,LmltcG93ZXJCb3ggLnRpdGxlIHsKICBkaXNwbGF5OiBub25lOwp9Ci5pbXBvd2VyQm94IC5xcmNvZGV7CiAgYm9yZGVyOiBub25lOwp9Cg=="
    });
});