$(function () {
    const address = new Address();
    const TIME_COUNT = 60;
    const reg = /^\s*$/;
    let timeOut = TIME_COUNT;

    $("#sendCode").click(function () {
        const mobile = $("#exampleInputAccounts").val();

        // 检查是否有未填写的字段或格式不正确
        if (!(/^1[03456789]\d{9}$/.test(mobile))) {
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

                        // 发送验证码的 AJAX 请求，附带IP地址参数
                        address.ajax('', "/user/getSmsASDDAScs", "post", "json", { mobile: mobile, ip: ip }, function (res, status, request) {
                            if (res.resp_code === 0) {
                                toastr.success("验证码发送成功");
                                // 发送验证码按钮禁用，并启动倒计时
                                $("#sendCode").prop("disabled", true);
                                const disSend = setInterval(function () {
                                    if (timeOut === 0) {
                                        $("#sendCode").val("发送验证码");
                                        $("#sendCode").prop("disabled", false);
                                        timeOut = TIME_COUNT;
                                        clearInterval(disSend);
                                    } else {
                                        $("#sendCode").val("发送验证码(" + (timeOut--) + "秒)");
                                    }
                                }, 1000);
                            } else if (res.resp_code === 1) {
                                toastr.warning("浏览器发送验证码超过五次，不能发送验证码");
                            } else {
                                toastr.error("验证码发送失败，请稍后重试");
                                clearInterval(disSend);
                                $("#sendCode").val("发送验证码");
                                $("#sendCode").prop("disabled", false);
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
        const mobile = $("#exampleInputAccounts").val();
        const password = $("#exampleInputPassword").val();
        const confirmPwd = $("#checkPassword").val();
        const code = $("#checkCode").val();

        // 检查是否有未填写的字段或格式不正确
        if (!(/^1[03456789]\d{9}$/.test(mobile))) {
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

        // 执行注册的 AJAX 请求
        address.ajax('', "/resetPassword", "post", "json", { mobile: mobile, password: password, code: code }, function (res, status, request) {
            if (res.resp_code === 0) {
                toastr.success("修改成功", function () {
                    location.href = "login.html";
                });
            } else {
                toastr.error("修改失败，请稍后重试");
            }
        });
    });
});
