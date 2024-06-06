$(function(){
    let address = new Address();

    $(".btn-submit").click(function(){
        let mobile = $("#exampleInputAccounts").val();
        let password = $("#exampleInputPassword").val();
   
        if (!(/^1[03456789]\d{9}$/.test(mobile))) {
            toastr.warning("手机号不符合规则");
            return;
        }else if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/.test(password))) {
            toastr.warning("密码不符合规则");
            return;
        }
        address.ajax('', "/user/pwdLogin", "post", "json", {
            mobile: mobile,
            password: password
        }, function (res, status, request) {
            if (res.datas != null) {
                localStorage.setItem('mobile', res.datas.mobile);
                localStorage.setItem("uname", res.datas.username);
                localStorage.setItem("isvip", res.datas.isVip);
                localStorage.setItem("authorization", request.getResponseHeader('authorization'));
            }
            if (res.resp_code == 0) {
                toastr.success("登录成功");
                setTimeout(function(){
                    location.href = "/myFile.html";
                }, 800);
            } else if (res.resp_code == 1){
                toastr.warning("密码错误")
            }else {
                toastr.error("登录错误")
            }
        })
    })
})
