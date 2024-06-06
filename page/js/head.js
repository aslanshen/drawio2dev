document.writeln('<nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow site-header" style="border-bottom:1px solid rgba(8 8 8 / 15%) ;">');
document.writeln('    <div class="container d-flex flex-column flex-md-row justify-content-between">');
document.writeln('    <a class="py-2" href="/" aria-label="Product"><div style="width: 160px; text-align: center; font-size: 30px; background: linear-gradient(135deg, #007bff, #00bfff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 650;">BioVisArt</div>');
document.writeln('    </a>');
document.writeln('    <a class="py-2 d-none d-md-inline-block" href="/myFile.html">文件</a>');
document.writeln('    <a class="py-2 d-none d-md-inline-block" href="/template.html">模板</a>');
document.writeln('    <a class="py-2 d-none d-md-inline-block" href="/page/doc/faq.html">介绍</a>');
document.writeln('    </div>');
document.writeln('    <ul class="navbar-nav ml-auto head-mode">');
document.writeln('</ul>');
document.writeln('</nav>');
function resolvingDate(date) {
    let d = new Date(date);
    let month = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
    let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
    let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    let min = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
    let sec = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
    let times = d.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + sec;
    return times
}
$(function () {
    let address = new Address();
    var network = JSON.parse(sessionStorage.getItem('network_ips'));
    var ip; 
    if (network.ip1) {
        if (network.ip1.includes('cloud.biovisart')) {
            ip = network.ip1.replace('cloud.biovisart', '华数').replace('.com', '');
        } else if (network.ip1.includes('cloud2.biovisart')) {
            ip = network.ip1.replace('cloud2.biovisart', '电信').replace('.com', '');
        }
    } else if (network.ip2) {
        if (network.ip2.includes('cloud.biovisart')) {
            ip = network.ip2.replace('cloud.biovisart', '华数').replace('.com', '');
        } else if (network.ip2.includes('cloud2.biovisart')) {
            ip = network.ip2.replace('cloud2.biovisart', '电信').replace('.com', '');
        }
    }
     
    if (localStorage.getItem("uname") == null || localStorage.getItem("uname") == "") {
        $(".head-mode").append(" <li class=\"nav-item dropdown no-arrow\">\n" +
            "                            <a class=\"nav-link dropdown-toggle\" href=\"/login.html\" role=\"button\">\n" +
            "                                <span class=\"mr-2 d-none d-lg-inline text-gray-600 small\"><button type=\"button\" class=\"btn btn-dark btn-sm\" style='margin-top: -3px;'>登录</button></span>\n" +
            "                            </a>\n" +
            "                        </li>")
    } else {
        address.ajax('', "/file/getAllNotific", "get", "json", "", function (res) {
            let notHtml = "";
            let not_img = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-chat-dots\" viewBox=\"0 0 16 16\">\n" +
                "  <path d=\"M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z\"></path>\n" +
                "  <path d=\"m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z\"></path>\n" +
                "</svg>";
            for (let i of res.data) {
                notHtml += "                                <a class=\"dropdown-item d-flex align-items-center notific\" href=\"#\">\n" +
                    "                                    <div class=\"mr-3\">\n" +
                    "                                        <div class=\"icon-circle bg-primary\">\n" +
                    "                                            <i class=\"fas text-white\">" + not_img + "</i>\n" +
                    "                                        </div>\n" +
                    "                                    </div>\n" +
                    "                                    <div>\n" +
                    "                                        <div class=\"small text-gray-500\">" + resolvingDate(i.time) + "</div>\n" +
                    "                                        <span class=\"\">" + i.msg + "</span>\n" +
                    "                                    </div><div class='del_not' id='" + i.id + "'><span aria-hidden=\"true\">&times;</span></div>\n" +

                    "                                </a>\n";
            }
            let headhtml = " <li class=\"nav-item dropdown no-arrow d-sm-none\">\n" +
                "                            <!-- 下拉列表 - 消息 -->\n" +
                "                            <div class=\"dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in\"\n" +
                "                                aria-labelledby=\"searchDropdown\">\n" +
                "                                <form class=\"form-inline mr-auto w-100 navbar-search\">\n" +
                "                                    <div class=\"input-group\">\n" +
                "                                        <input type=\"text\" class=\"form-control bg-light border-0 small\"\n" +
                "                                            placeholder=\"Search for...\" aria-label=\"Search\"\n" +
                "                                            aria-describedby=\"basic-addon2\">\n" +
                "                                        <div class=\"input-group-append\">\n" +
                "                                            <button class=\"btn btn-primary\" type=\"button\">\n" +
                "                                                <i class=\"fas fa-search fa-sm\"></i>\n" +
                "                                            </button>\n" +
                "                                        </div>\n" +
                "                                    </div>\n" +
                "                                </form>\n" +
                "                            </div>\n" +
                "                        </li>\n" +
                "                        <li class=\"nav-item dropdown no-arrow mx-1\">\n" +
                "                            <a class=\"nav-link dropdown-toggle\" href=\"#\" id=\"networkSelcted_TXT\" role=\"button\"\n" +
                "                                data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n" +
                "                                <i class=\"fas fa-globe fa-fw\"></i>\n" +
                "                            </a>\n" +
                "                                    <dl class=\"dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in\" style=\"left: -60px;width: 100px !important;border-radius: 0;text-align: center;\">\n" +
                "                                         <dd><a id=\"networkSelcted_TXT\">当前线路：<span id=\"networkStatus\">\n" + ip +
                "                                              </span></a></dd>\n" +
                "                                    </dl>\n" +
                "                        </li>\n" +
                "                        <li class=\"nav-item dropdown no-arrow mx-1\">\n" +
                "                            <a class=\"nav-link dropdown-toggle\" href=\"#\" id=\"alertsDropdown\" role=\"button\"\n" +
                "                                data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n" +
                "                                <i class=\"fas fa-bell fa-fw\"></i>\n" +
                "                                <!-- 计数器 - 警报 -->\n" +
                "                                <span class=\"badge badge-danger badge-counter not_num\">" + (res.data.length == 0 ? "" : +res.data.length) + "</span>\n" +
                "                            </a>\n" +
                "                            <!-- 下拉列表 - 警报 -->\n" +
                "                            <div class=\"dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in\"\n" +
                "                                aria-labelledby=\"alertsDropdown\">\n" +
                "                                <h6 class=\"dropdown-header\">\n" +
                "                                    通知中心\n" +
                "                                </h6>\n" + notHtml +
                "                                <a class=\"dropdown-item text-center small text-gray-500 all_not_read\" href=\"#\">全部已读</a>\n" +
                "                            </div>\n" +
                "                        </li>\n" +
                "\n" +
                "                        <!-- Nav Item - Messages -->\n" +
                "                            <!-- Dropdown - Messages -->\n" +
                "\n" +
                "                        <div class=\"topbar-divider d-none d-sm-block\"></div>";
            $(".head-mode").append(headhtml +
                " <li class=\"nav-item dropdown no-arrow\">\n" +
                "                            <a class=\"nav-link dropdown-toggle\" href=\"#\" id=\"userDropdown\" role=\"button\"\n" +
                "                                data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n" +
                "                                <span class=\"mr-2 d-none d-lg-inline text-gray-600 small\">" + localStorage.getItem("uname") + "</span>\n" +
                "                                <img class=\"img-profile rounded-circle\"\n" +
                "                                    src=\"../../img/sangerbox/yjdslogo.png\">\n" +
                "                            </a>\n" +
                "                            <!-- Dropdown - User Information -->\n" +
                "                            <div class=\"dropdown-menu dropdown-menu-right shadow animated--grow-in\"\n" +
                "                                aria-labelledby=\"userDropdown\">\n" +
                "                                <a class=\"dropdown-item\" href=\"/myFile.html\">\n" +
                "                                    <i class=\"fas fa-user fa-sm fa-fw mr-2 text-gray-400\"></i>\n" +
                "                                    我的文件\n" +
                "                                </a>\n" +
                "                                <a class=\"dropdown-item\" href=\"/myTemp.html\">\n" +
                "                                    <i class=\"fas fa-list fa-sm fa-fw mr-2 text-gray-400\"></i>\n" +
                "                                    我的模板\n" +
                "                                </a>\n" +
                "                                <a class=\"dropdown-item\" href=\"/lx.html\">\n" +
                "                                    <i class=\"fas fa-cogs fa-sm fa-fw mr-2 text-gray-400\"></i>\n" +
                "                                    我的介绍\n" +
                "                                </a>\n" +
                "                                <div class=\"dropdown-divider\"></div>\n" +
                "                                <a class=\"dropdown-item\" href=\"#\" onclick='clearLacal()'>\n" +
                "                                    <i class=\"fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400\"></i>\n" +
                "                                    退出登录\n" +
                "                                </a>\n" +
                "                            </div>\n" +
                "                        </li>")
            $(".notific").hover(function () {
                $(this).children("div").eq(2).show();
            }, function () {
                $(this).children("div").eq(2).hide();
            });
        })
    }
    function readNotific(id) {
        let num = parseInt($(".not_num").text()) - 1;
        num <= 0 || id == null ? $(".not_num").text("") : $(".not_num").text(num);
        address.ajax('', "/file/readAllNot", "post", "json",{id: id}, function () {

        })
    }
    $("body").on("click", ".del_not", function () {
        $(this).parents("a").remove();
        readNotific($(this)[0].id)
    })
    $("body").on("click", ".all_not_read", function () {
        let object = $(this).parents("div");
        object.children("a").remove();
        object.append("<a class=\"dropdown-item text-center small text-gray-500 all_not_read\" href=\"#\">全部已读</a>")
        readNotific()
    })
})
function clearLacal() {
    localStorage.clear();
    location.reload();
}