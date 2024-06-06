$(function () {
    const address = new Address();
    const TIME_COUNT = 60;
    const reg = /^\s*$/;
    let timeOut = TIME_COUNT;
    let disableTimer; // 定时器变量用于倒计时
    
    // 检查手机号格式
    function checkMobileFormat(mobile) {
        return /^1[03456789]\d{9}$/.test(mobile);
    }
     
    // 发送验证码
    function sendVerificationCode(mobile,ip) {
        address.ajax('', "/user/getSmsASDDAScs", "post", "json", { mobile: mobile,ip: ip}, function (res, status, request) {
            clearInterval(disableTimer);
            if (res.resp_code === 0) {
                toastr.success("验证码发送成功");
                // 发送验证码按钮禁用，并启动倒计时
                $("#sendCode").prop("disabled", true);
                let timeLeft = TIME_COUNT;
                disableTimer = setInterval(function () {
                    if (timeLeft === 0) {
                        $("#sendCode").val("发送验证码");
                        $("#sendCode").prop("disabled", false);
                        clearInterval(disableTimer);
                    } else {
                        $("#sendCode").val("发送验证码(" + (timeLeft--) + "秒)");
                    }
                }, 1000);
            } else if (res.resp_code === 1) {
                toastr.warning("浏览器发送验证码超过五次，不能发送验证码");
            } else {
                toastr.error("验证码发送失败，请稍后重试");
                $("#sendCode").val("发送验证码");
                $("#sendCode").prop("disabled", false);
            }
        });
    }

    $("#sendCode").click(function () {
        const mobile = $("#exampleInputAccounts").val();
        if (!checkMobileFormat(mobile)) {
            toastr.warning("手机号不符合规则");
            return;
        }

        const getIpAddress = () => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.ipify.org?format=json', true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        const ip = data.ip;
                        console.log('IP address:', ip);
        // 检查用户是否存在
        address.ajax('', "/user/isUser", "post", "json", { user: mobile }, function (res, status, request) {
            if (res.resp_code === 1) {
                // 用户不存在，发送验证码
                sendVerificationCode(mobile,ip);
            } else if (res.resp_code === 0) {
                // 用户已存在
                toastr.warning("用户已存在");
            }
        });
    } else {
        console.error('Failed to fetch IP address:', xhr.status);
    }
}
};
xhr.send();
};

getIpAddress();
    });

    $("#registerbtn").click(function () {
        const uname = $("#exampleInputUname").val();
        const mobile = $("#exampleInputAccounts").val();
        const password = $("#exampleInputPassword").val();
        const confirmPwd = $("#checkPassword").val();
        const code = $("#checkCode").val();

        if (reg.test(uname.trim())) {
            toastr.warning("昵称不能为空");
            return;
        } else if (!checkMobileFormat(mobile)) {
            toastr.warning("手机号不符合规则");
            return;
        } else if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/.test(password))) {
            toastr.warning("密码不符合规则");
            return;
        } else if (password !== confirmPwd) {
            toastr.warning("密码不一致");
            return;
        } else if (reg.test(code.trim())) {
            toastr.warning("验证码不能为空");
            return;
        }

        address.ajax('', "/user/register", "post", "json", { username: uname, mobile: mobile, password: password, code: code }, function (res, status, request) {
            if (res.resp_code === 0) {
                toastr.success("注册成功", function () {
                    location.href = "login.html";
                });
            } else {
                toastr.error("注册失败，请稍后重试");
            }
        });
    });
});
{/* <div id="toast-container" class="toast-top-right">
    <div class="toast toast-warning" aria-live="assertive" style="display: block;">
        <div class="toast-message">该浏览器今天发送验证码超过五次，不能发送验证码了</div></div></div> */}