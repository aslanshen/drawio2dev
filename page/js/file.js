$(function () {
    var address = new Address();
    $(".myFile").children("div").eq(0).show();
    $(".myFile").children("div").eq(1).hide();
    $(".myFile").children("div").eq(2).hide();
    // console.log(document.domain);
    var fileData = "";
    try{
        document.domain='biovisart.com'
        if(window.parent.location.href.indexOf("test2.sangerbox.com")>=0){
            console.log(window.parent.location.href.indexOf("test2.sangerbox.com"));
            document.getElementsByTagName("nav")[0].remove();
        }else{
            $("body>div").attr("style","margin-top:100px!important");
            $("#wrapper").attr("style","margin-top:0px!important;border-top:1px solid rgba(8 8 8 / 15%) ;");
            document.domain='test2.biovisart.com';
        }
    }catch(e){
        // console.log("出错了")
        $("body>div").attr("style","margin-top:60px!important");
    }


    function change(limit) {
        if (limit == 0) {
            return "--";
        }
        var size = "";
        if (limit < 0.1 * 1024) {                            //小于0.1KB，则转化成B
            size = limit.toFixed(2) + "KB"
        } else if (limit < 0.1 * 1024 * 1024) {            //小于0.1MB，则转化成KB
            size = (limit / 1024).toFixed(2) + "MB"
        } else {        //小于0.1GB，则转化成MB
            size = (limit / (1024 * 1024)).toFixed(2) + "GB"
        }
        var sizeStr = size + "";                        //转成字符串
        var index = sizeStr.indexOf(".");                    //获取小数点处的索引
        var dou = sizeStr.substr(index + 1, 2)            //获取小数点后两位的值
        if (dou == "00") {                                //判断后两位是否为00，如果是则删除00
            return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
        }
        return size;
    }

    function getBreadCrumbs(param) {
        console.log(param);
        if ($(param)[0].children.length == 1) {
            return "/";
        } else {
            return $(param)[0].children[$(param)[0].children.length - 1].children[0].id;
        }
    }

    function init(frontPath = '/') {
        var requestData = {
            frontPath: frontPath
        };
        address.ajax('', "/file/viewBvaFileList", "post", "json", requestData, function (res) {
            var html = "";
            let j = 0;
            fileData = res.datas.datas;
            for (var i of fileData) {
                var dir = "";
                if (i.fileType === 'dir') {
                    dir = "<span class=\"btn-list-group\">\n" +
                        "  <a ><img src=\"/page/img/list.svg\"></a>\n" +
                        "  <span class=\"list-group btn-list-area\">\n" +
                        "    <a class=\"list-group-item list-group-item-action btn_file\">重命名</a>\n" +
                        "    <a class=\"list-group-item list-group-item-action move_file\">移动</a>\n" +
                        "    <a class=\"list-group-item list-group-item-action delete\">删除</a>\n" +
                        "  </span>\n" +
                        "</span>";
                } else{
                    dir = "<span class=\"btn-list-group\">\n" +
                        "  <a ><img src=\"/page/img/list.svg\"></a>\n" +
                        "  <span class=\"list-group btn-list-area\">\n" +
                        "    <a class=\"list-group-item list-group-item-action examine\">浏览</a>\n" +
                        "    <a class=\"list-group-item list-group-item-action btn_file\">重命名</a>\n" +
                        "    <a class=\"list-group-item list-group-item-action cooperate\">协作</a>\n" +
                        "    <a class=\"list-group-item list-group-item-action move_file\">移动</a>\n" +
                        "    <a class=\"list-group-item list-group-item-action delete\">删除</a>\n" +
                        "  </span>\n" +
                        "</span>";
                }
    
                var img = i.fileType === "dir" ? "../../img/sangerbox/dir.png" : "../../img/sangerbox/file.png";
                html += " <div class='box' style='width:190px;margin-top: 10px;' id='" + j++ + "'>\n" +
                    "  <div class='examine'><img src='" + img + "'><br/>" + i.fileName + "</div>\n" +
                    "   <div style=' display: flex;gap:10px;'>\n" +
                    "  <div>" + i.updateTime + "</div>\n" +
                    "  <div>" + dir + "</div>\n" +
                    "</div>\n" +
                    "</div>";
            }
    
            $(".allTable").children("tbody").html(html);
            // $("div").hover(
            //     function () {
            //         $(this).find('.btn-list-group').css("display", "inline");
            //     },
            //     function () {
            //         $(this).find('.btn-list-group').css("display", "none");
            //     }
            // );
        });
    }
    

    init();
    var recFile = "";

    function initRec(frontPath) {
        address.ajax('', "/file/getUserBvaFileRecovery", "get", "json", {
            "frontPath":frontPath
        }, function (res) {
            var html = "";
            var j = 0;
            recFile = res.datas;
            for (var i of recFile) {
                var img = i.fileType === "dir" ? "../../img/sangerbox/dir.png" : "../../img/sangerbox/file.png";
                html += " <tr id='" + j++ + "'>\n" +
                    "                <td class=''><img src='" + img + "'>&nbsp;" + i.fileName + "\n" +
                    "                <span class=\"btn-list-group\">\n" +
                    "  <a ><img src=\"/page/img/list.svg\"></a>\n" +
                    "  <span class=\"list-group btn-list-area\">\n" +
                    "    <a class=\"list-group-item list-group-item-action reduction\">还原</a>\n" +
                    "    <a class=\"list-group-item list-group-item-action delRecovery\">删除</a>\n" +
                    "  </span>\n" +
                    "              </span></td>  <td>" + i.delTime +
                    "</span></td>" +
                    "            </tr>";
            }

            $(".recTable").children("tbody").html(html);
            $("tr").hover(
                function () {
                    $(this).find('.btn-list-group').css("display", "inline");
                },
                function () {
                    $(this).find('.btn-list-group').css("display", "none");
                }
            )
        })
    }

    function initCoop(frontPath) {
        var requestData = {
            frontPath: frontPath
        };
        address.ajax('', "/file/getUserCooperate", "post", "json", requestData, function (res) {
            var html = "";
            fileData = res.data;
            let j = 0;
            let op = "/" == frontPath ? "    <a class=\"list-group-item list-group-item-action examineCoop\">浏览</a>\n" +
                "    <a class=\"list-group-item list-group-item-action exitCoop\">退出协作</a>\n" : "    <a class=\"list-group-item list-group-item-action examineCoop\">浏览</a>\n";
            for (var i of fileData) {
                var img = i.fileType === "dir" ? "../../img/sangerbox/dir.png" : "../../img/sangerbox/file.png";
                html += " <div style='width:190px;margin-top: 10px;' id='" + j++ + "'>\n" +
                    "                <div class='examineCoop'><img src='" + img + "'><br/>" + i.fileName + "\n" +
                    "                </div>\n" + 
                    "<div style=' display: flex;gap:10px;'>\n" +
                    "<div>" + i.updateTime + "</div>\n" +
                    "<div><span class=\"btn-list-group\">\n" +
                    "  <a ><img src=\"/page/img/list.svg\"></a>\n" +
                    "  <span class=\"list-group btn-list-area\">\n" +
                    op +
                    "  </span>\n" +
                    "              </span></div>\n" + 
                    "</div>\n" +
                    "            </div>";
                    
            }

            $(".coopTable").children("tbody").html(html);
            // $("tr").hover(
            //     function () {
            //         $(this).find('.btn-list-group').css("display", "inline");
            //     },
            //     function () {
            //         $(this).find('.btn-list-group').css("display", "none");
            //     }
            // )
        })
    }

    var isDir;
    let newIsDir;

    function ShowCreateModal(title, call, name, url, isDir) {
        $("#createFileTitle").text(title);
        $("#createFileCall").text(call);
        $("#createFileCall").text(call);
        $("#fileName").val(name);
        $("#fileUrl").val(url);
        $('#createFileMModal').modal('show');
           // 创建一个新变量，避免修改传入的参数

    if (isDir === true) {
        newIsDir = 1;
    } else if (isDir === false) {
        newIsDir = 0;
    }
    // 返回新变量
    return newIsDir;
}
$("#createFileSureBut").off("click").on("click", function () {
    var title = $("#fileName").val().trim();
    var reg = new RegExp('[\\s\\\\/:\\*\\?\\\"<>\\|]');
    if (reg.test(title)) {
        toastr.error("不能包含【\\/:*?\"<>|】非法字符");
        return;
    }

    if ($("#createFileTitle").text() == "重命名") {
        address.ajax('', "/file/renameBvaFile", "post", "json", {
            "md5": $("#fileUrl").val(),
            "newtitle": title,
        }, function (res) {
            if (res.resp_code == 200) {
                toastr.success('重命名成功');
            } else {
                toastr.error('重命名失败');
            }
            init(getBreadCrumbs(".breadcrumb"));
        });
    } else {
        var requestData = {
            userName: localStorage.getItem("uname"),
            dir: $("#fileUrl").val(),
            fileName: title,
            isDir: newIsDir
        };
        console.log(requestData.isDir);
        address.ajax('', "/file/createBvaFile", "post", "json",requestData,
            function (res) {
                if ($("#createFileTitle").text() == "新建文件夹") {
                    if (res.resp_code == 200) {
                        toastr.success('创建文件夹成功');
                        $(".myFile").children("div").eq(0).show();
                        $(".myFile").children("div").eq(1).hide();
                        $(".myFile").children("div").eq(2).hide();
                        $(".font-weight-bold").removeClass("font-weight-bold");
                        $(".list-group").children("li").eq(0).attr("class", "list-group-item change-checked font-weight-bold");
                        init(getBreadCrumbs(".breadcrumb"));
                    } else if (res.resp_code == 500) {
                        toastr.warning('该文件夹已经存在，请重新命名');
                    }
                } else if ($("#createFileTitle").text() == "新建生物图") {
                    if (res.resp_code == 200) {
                        toastr.success('创建文件成功');
                        $(".myFile").children("div").eq(0).show();
                        $(".myFile").children("div").eq(1).hide();
                        $(".myFile").children("div").eq(2).hide();
                        $(".font-weight-bold").removeClass("font-weight-bold");
                        $(".list-group").children("li").eq(0).attr("class", "list-group-item change-checked font-weight-bold");
                        init(getBreadCrumbs(".breadcrumb"));
                    } else if (res.resp_code == 500) {
                        toastr.warning('该文件已经存在，请重新命名');
                    }
                }
            });
    }
    $("#createFileMModal").modal("hide");
});

    $('body').on('click', '.btn_file', function () {
        if ($(this).text() == "重命名") {
            let data = fileData[$(this).parents(".box")[0].id];
            isDir = data.isDir;
            ShowCreateModal("重命名", "文件名", data.fileName, data.md5,isDir);
        } else if ($(this).text() == "新建文件夹") {
            isDir = true
            ShowCreateModal("新建文件夹", "文件名", "", getBreadCrumbs(".breadcrumb"),isDir);
        } else if ($(this).text() == "新建生物图") {
            isDir = false
            ShowCreateModal("新建生物图", "文件名", "", getBreadCrumbs(".breadcrumb"),isDir); 
        }
    });
    
    $("#coopSureBut").click(function () {
        if ($("#coopName").val() == localStorage.getItem('mobile')) {
            toastr.error("不可添加自己");
            return;
        }
        var reg = /^\s*$/g;
        if (reg.test($("#coopName").val())) {
            return;
        }
        address.ajax('', "/file/addCooperate", "post", "json", {
            md5: fileData[$("#coopId").val()].md5,
            phone: $("#coopName").val()
        }, function (res) {
            if (res.code == 200) {
                $(".coopTeam").children("tbody").append("  <tr>\n" +
                    "            <td id='" + res.data + "'>U_" + $("#coopName").val().substr(7) + "</td>\n" +
                    "                            <td></td>\n" +
                    "          <td>协作者<span>&times;&nbsp;&nbsp;</span></td>\n" +
                    "</tr>")
                $("#coopName").val("")
                toastr.success(res.msg);
            } else {
                toastr.error(res.msg)
            }


        })
    })

    $('body').on('click', '.move_file', function () {
        let data = fileData[$(this).parents("tr")[0].id];
        $("#clickUrl").val(data.frontPath);
        $("#coopId").val(data.md5);
        $('#moveFileModal').modal('show');
        $(".move-folder").children().remove();
        address.ajax('', "/file/getBvaFolderList", "get", "json", "", function (res) {
            res.datas.forEach((item, index) => {
                let moveListHtml = "<option value='" + item.frontPath + "'>" + item.frontPath + "</option>";
                $(".move-folder").append(moveListHtml)
            })
        })
    })
    $("#moveFileSureBut").click(() => {
        let data = fileData[$(this).parents("tr")[0]];
        console.log(data);
        let value = $('.move-folder option:selected').text();
        address.ajax('', "/file/moveBvaFile", "post", "json", {
            fromPath: $("#clickUrl").val(),
            toPath: value,
            fromMd5: $("#coopId").val()
        }, function (res) {
            if(res.resp_code==200) toastr.success("移动成功")
            else toastr.error("移动失败");
            init(getBreadCrumbs(".breadcrumb"));
            $("#moveFileModal").modal("hide");
        })

    })
    $('body').on('click', '.cooperate', function () {
        $("#coopId").val($(this).parents("tr")[0].id);
        $("#coopName").val("")
        address.ajax('', "/file/getCoopTeam", "post", "json", {md5: fileData[$(this).parents("tr")[0].id].md5}, function (res) {
            let coopHtml = "  <tr>\n" +
                "            <td>" + localStorage.getItem("uname") + "</td>\n" +
                "                            <td>  </td>\n" +
                "          <td>归属者</td>\n" +
                "</tr>";
            for (var u of res.data) {
                coopHtml += "  <tr>\n" +
                    "                            <td id='" + u.worker + "'>" + u.user + "</td>\n" +
                    "                            <td></td>\n" +
                    "                            <td>协作者<span>&times;&nbsp;&nbsp;</span></td>\n" +
                    "                        </tr>"
            }
            $(".coopTeam").children("tbody").html(coopHtml);

        })
        $('#coopModal').modal('show');
    })
    $('body').on('click', '.coopTeam>tbody>tr span', function () {
        let that = $(this).parents("tr");
        address.ajax('', "/file/exitCooperate", "post", "json", {
            "fidMd5": fileData[$(this).parents("tr")[0].id].md5,
            "coopTeam": that.children("td")[0].id
        }, function (res) {
            if (res.code == 200) {
                that.remove();
                toastr.success(res.msg);
            } else {
                toastr.error(res.msg)
            }
        })
    })

    $('body').on('click', '.delete', function () {
        let data = fileData[$(this).parents(".box")[0].id];
        address.ajax('', "/file/delBvaFile", "post", "json", 
        {"md5": data.md5}, function (res) {
            if (res.resp_code == 200) {
                toastr.success('删除成功');
            } else {
                toastr.error('删除失败');
            }
            init(getBreadCrumbs(".breadcrumb"));
        })
    });

    $('body').on('click', '.allFile', function () {
        if ($(this)[0].innerText.indexOf("全部文件") == 0) {
            $(".breadcrumb").html("<li class=\"breadcrumb-item active allFile\" aria-current=\"page\">全部文件></li>")
            init();
        } else {
            $(".breadcrumb3").html("<li class=\"breadcrumb-item active allFile\" aria-current=\"page\">共同协作></li>")
            initCoop("/");
        }

    })

    $('body').on('click', '.otherFile', function () {
        var otherHtml = $(this)[0].innerHTML;
        var allHtml = $(this).parents("ol")[0].innerHTML;
        if ($(this).parents("ol")[0].innerText.indexOf("全部文件>") == 0) {
            $(".breadcrumb").html(allHtml.substr(0, allHtml.indexOf(otherHtml)) + otherHtml)
            init($(this)[0].children[0].id);
        } else {
            $(".breadcrumb3").html(allHtml.substr(0, allHtml.indexOf(otherHtml)) + otherHtml)
            initCoop($(this)[0].children[0].id);
        }
    })

    $('body').on('click', '.examine', function () {
        if (fileData[$(this).parents("div")[0].id].fileType === 'dir') {
            init(fileData[$(this).parents("div")[0].id].frontPath);
            $(".breadcrumb").append("<li class=\"breadcrumb-item otherFile\"><a id='" + fileData[$(this).parents("div")[0].id].frontPath + "' href=\"#\">" + fileData[$(this).parents("div")[0].id].fileName + "</a></li>")
        } else if (fileData[$(this).parents("div")[0].id].fileType === 'drawio') {
            window.open("/draw.html?" + fileData[$(this).parents("div")[0].id].md5)
        }
    });
    $('body').on('click', '.examineCoop', function () {
        if (fileData[$(this).parents("tr")[0].id].fileType === 'dir') {
            initCoop(fileData[$(this).parents("tr")[0].id].frontPath);
            $(".breadcrumb3").append("<li class=\"breadcrumb-item otherFile\"><a id='" + fileData[$(this).parents("tr")[0].id].frontPath + "' href=\"#\">" + fileData[$(this).parents("tr")[0].id].fileName + "</a></li>")
        } else if (fileData[$(this).parents("tr")[0].id].fileType === 'drawio') {
            window.open("/draw.html?" + fileData[$(this).parents("tr")[0].id].md5)
        }
    });

    $('body').on('click', '.reduction', function () {
        address.ajax('', "/file/reductionBvaFile", "post", "json", {"md5": recFile[$(this).parents("tr")[0].id].md5}, function (res) {
            if (res.resp_code == 200) {
                toastr.success('还原成功');
            } else {
                toastr.error('还原失败');
            }
            initRec();
        })
    });

    $('body').on('click', '.delRecovery', function () {
        let data = recFile[$(this).parents("tr")[0].id];
        address.ajax('', "/file/delBvaFileRecovery", "post", "json", 
        {"md5": data.md5}, function (res) {
            if (res.resp_code == 200) {
                toastr.success('删除成功');
            } else {
                toastr.error('删除失败');
            }
            initRec();
        })
    });


    $('body').on('click', '.exitCoop', function () {
        address.ajax('', "/file/exitCooperate", "post", "json", {
            "fidMd5": fileData[$(this).parents("tr")[0].id].md5,
            "coopTeam": localStorage.getItem('mobile')
        }, function (res) {
            if (res.code == 200) {
                toastr.success(res.msg);
            } else {
                toastr.error(res.msg);
            }
            initCoop(getBreadCrumbs(".breadcrumb3"));
        })
    })

    $('body').on('click', '.static.template', function () {
        let temp = fileData[$(this).parents("tr")[0].id]
        $(".temp-img").attr("src", "page/img/up.svg");
        $("#tempSum").val("")
        $("#tempFileId").val(temp.fileId)
        // $.post("/getFileData",{file_path:temp.url},function(res){
        //     var cancer = document.createElement("canvas");
        //     cancer.setAttribute('width', "192");
        //     cancer.setAttribute('width', "212");
        //     var data = cancer.toDataURL('image/png');
        //     console.log("data=-=-",data)
        //     data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANQAAACWCAYAAACmTqZ/AAAAAXNSR0IArs4c6QAAA2ZJREFUeF7t0zERAAAIAzHq3zQmfgwCOuT4nSNAIBNYtmSIAIETlCcgEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUAUH5AQKhgKBCTFMEBOUHCIQCggoxTREQlB8gEAoIKsQ0RUBQfoBAKCCoENMUgQewbwCXvCnIxgAAAABJRU5ErkJggg=="
        //
        //     $(".cancer_img").attr("src",data);
        // })
        $("#tempTitle").val(temp.name);
        $("#tempUrl").val(temp.url);
        $("#tempModal").modal('show');
    })
    $('#tempSureBut').click(function () {
        var reg = /^\s*$/g;
        if (reg.test($("#tempTitle").val())) {
            toastr.error("标题不可为空");
            return;
        }
        if ($(".temp-img")[0].src.indexOf("page/img/up.svg") > 0) {
            toastr.error("请上传图片");
            return;
        }
        address.ajax('', "/file/publishTemplate", "post", "json", {
            name:localStorage.getItem("uname"),
            title: $("#tempTitle").val(),
            img: $(".temp-img")[0].src,
            frontPath: $("#tempUrl").val(),
            summary: $("#tempSum").val(),
            fileMd5: $("#tempFileId").val()
        }, function (res) {
            if (res.code == 200) {
                toastr.success(res.msg);
            } else {
                toastr.error(res.msg);
            }
            $("#tempModal").modal("hide");
        })
    })

    $(".change-checked").click(function () {
        $(".font-weight-bold").removeClass("font-weight-bold");
        $(this).attr("class", "list-group-item change-checked font-weight-bold");
        if ($(this).text().indexOf("我的文件") > 0) {
            $(".myFile").children("div").eq(0).show();
            $(".myFile").children("div").eq(1).hide();
            $(".myFile").children("div").eq(2).hide();
            init(getBreadCrumbs(".breadcrumb"));
        } else if ($(this).text().indexOf("回收站") > 0) {
            $(".myFile").children("div").eq(0).hide();
            $(".myFile").children("div").eq(1).show();
            $(".myFile").children("div").eq(2).hide();
            initRec();
        } else {
            $(".myFile").children("div").eq(0).hide();
            $(".myFile").children("div").eq(2).show();
            $(".myFile").children("div").eq(1).hide();
            initCoop(getBreadCrumbs(".breadcrumb3"));
        }
    })
})

function imgChange(img) {
    // 生成一个文件读取的对象
    const reader = new FileReader();
    reader.onload = function (ev) {
        $(".temp-img").attr("src", ev.target.result);
    }
    //发起异步读取文件请求，读取结果为data:url的字符串形式，
    reader.readAsDataURL(img.files[0]);
}
