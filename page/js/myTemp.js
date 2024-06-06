$(function () {
    let address = new Address();
    var dataList = "";
    let init_temp = function(){
        address.ajax('', "/file/getUserAllTemp", "get", "json", "", function (res) {
            dateList = res.data;
            $(".temp-list").children().remove();
            res.data.forEach((item, index) => {
                let temp_set = "";
                switch (item.status) {
                    case "2":
                        temp_set = "<span class=\"btn-list-group\">\n" +
                            "  <a ><img src=\"/page/img/list.svg\"></a>\n" +
                            "  <span class=\"list-group btn-list-area\">\n" +
                            "    <a class=\"list-group-item list-group-item-action edit-temp\">修改模板</a>\n" +
                            "    <a class=\"list-group-item list-group-item-action issue-temp\">发布模板</a>\n" +
                            "    <a class=\"list-group-item list-group-item-action delete-temp\">删除模板</a>\n" +
                            "  </span>\n" +
                            "</span></td>";
                        break;
                    case "1":
                        temp_set = "<span class=\"btn-list-group\">\n" +
                            "  <a ><img src=\"/page/img/list.svg\"></a>\n" +
                            "  <span class=\"list-group btn-list-area\">\n" +
                            "    <a class=\"list-group-item list-group-item-action edit-temp\">修改模板</a>\n" +
                            "    <a class=\"list-group-item list-group-item-action down-temp\">取消发布</a>\n" +
                            "    <a class=\"list-group-item list-group-item-action delete-temp\">删除模板</a>\n" +
                            "  </span>\n" +
                            "</span></td>";
                        break;
                    case "0":
                    case "-2":
                        temp_set = "<span class=\"btn-list-group\">\n" +
                            "  <a ><img src=\"/page/img/list.svg\"></a>\n" +
                            "  <span class=\"list-group btn-list-area\">\n" +
                            "    <a class=\"list-group-item list-group-item-action edit-temp\">修改模板</a>\n" +
                            "    <a class=\"list-group-item list-group-item-action delete-temp\">删除模板</a>\n" +
                            "  </span>\n" +
                            "</span></td>";
                        break;
                    case "-1":
                        temp_set = "<span class=\"btn-list-group\">\n" +
                            "  <a ><img src=\"/page/img/list.svg\"></a>\n" +
                            "  <span class=\"list-group btn-list-area\">\n" +
                            "    <a class=\"list-group-item list-group-item-action edit-temp\">修改模板</a>\n" +
                            "    <a class=\"list-group-item list-group-item-action delete-temp\">删除模板</a>\n" +
                            "    <a class=\"list-group-item list-group-item-action cause-temp\">拒绝因素</a>\n" +
                            "  </span>\n" +
                            "</span></td>";
                        break;
                }
                $(".temp-list").append("<tr id='" + index + "'>\n" +
                    "                                <th>" + item.title + "</th>\n" +
                    "                                <td>" + item.watch + "</td>\n" +
                    "                                <td>" + (item.status == '1' ? '已发布' : (item.status == '0' ? '审核中' : (item.status == '2' ? '已取消发布' : (item.status == '-1' ? '审核未通过' : '等待审核')))) + temp_set + "</td>\n" +
                    "                                <td>" + item.time + "</td>\n" +
                    "                            </tr>")
            })
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

    init_temp();

    $('body').on('click', '.edit-temp', function () {
        window.open("/draw.html?" + dateList[$(this).parents("tr")[0].id].fid)
    })

    $('body').on('click', '.issue-temp', function () {
        address.ajax('', "/file/updateTempStatus/1", "post", "json", {fid: dateList[$(this).parents("tr")[0].id].fid}, function (res) {
            if(res.code==200){
                toastr.success("已发布模板");
            }else{
                toastr.error("修改失败");
            }
            init_temp();
        })
    })

    $('body').on('click', '.down-temp', function () {
        address.ajax('', "/file/updateTempStatus/0", "post", "json", {fid: dateList[$(this).parents("tr")[0].id].fid}, function (res) {
            if(res.code==200){
                toastr.success("已取消发布");
            }else{
                toastr.error("修改失败");
            }
            init_temp();
        })
    })

    $('body').on('click', '.delete-temp', function () {
        address.ajax('', "/file/updateTempStatus/-1", "post", "json", {fid: dateList[$(this).parents("tr")[0].id].fid}, function (res) {
            if(res.code==200){
                toastr.success("已删除此模板");
            }else{
                toastr.error("修改失败");
            }
            init_temp();
        })
    })

    $('body').on('click', '.cause-temp', function () {
        let cause = dateList[$(this).parents("tr")[0].id].cause;
        if(cause!=null&&cause!=""){
            $(".cause-title").html(cause);
            $('#temp-error').modal('show');
        }

    })

})