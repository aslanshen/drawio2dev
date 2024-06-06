$(function () {
    let address = new Address();
    let tempId = window.location.href.split("#")[1];
    let det_data = "";

    address.ajax('', "/file/getPubTemp/"+tempId, "get", "json", "",function(res){
        if(res.data==null){
            $(".temp-det").hide();
            $(".container-fluid").show();
            toastr.warning("未找到数据");
        }else{
            det_data=res.data;
            $(".temp-img").attr("src",res.data.img)
            $(".temp-owner").text(res.data.owner)
            $(".temp-sum").text(res.data.summary)
            $(".temp-title").text(res.data.title)
            $(".temp-time").text(resolvingDate(res.data.time))
            $(".temp-look").append(res.data.watch)
        }
    })
    function com_init(){
        address.ajax('', "/file/getComment/"+tempId, "get", "json", "",function (res) {
            $(".temp-comment ").html(" <div class=\"d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 mb-4 mw-100 navbar-search\">\n" +
                "                                <div class=\"input-group\">\n" +
                "                                    <input type=\"text\" class=\"form-control bg-light border-0 small write-comment\"\n" +
                "                                           placeholder=\"请自觉遵守互联网相关的政策法规,严禁发布色情、暴力、反动的言论\"\n" +
                "                                           aria-label=\"Search\" aria-describedby=\"basic-addon2\" maxlength=\"100\">\n" +
                "                                    <div class=\"input-group-append\">\n" +
                "                                        <button class=\"btn btn-primary submit-comment\" type=\"button\">\n" +
                "                                            评论\n" +
                "                                        </button>\n" +
                "                                    </div>\n" +
                "                                </div>\n" +
                "                            </div>");
            if(res.data.length==0){
                $(".temp-comment").append("  <hr>\n" +
                    "                            <div>\n" +
                    "                                <div style=\"margin-left: 46%;\">\n" +
                    "                                    <img class=\"img-profile rounded-circle\" src=\"../page/img/icon_sofa.svg\" >\n" +
                    "                                    <p class=\"mb-1 text-center\">暂无评论</p>\n" +
                    "                                </div>\n" +
                    "                            </div>");
                return;
            }
            for(let i of res.data){
                $(".temp-comment").append(" <hr>\n" +
                    "                            <div>\n" +
                    "                                <img class=\"img-profile rounded-circle\"  style=\"border-radius: 0px !important;\" src=\"img/sangerbox/yjdslogo.png\"/>            <div>\n" +
                    "                                    <p class=\"mb-1\">"+i.name+" : "+i.comment+"</p>\n" +
                    "                                    <p class=\"mb-1 small\">"+resolvingDate(i.time)+"</p>\n" +
                    "                                </div>\n" +
                    "                            </div>");
            }
        })
    }
    com_init();

    $("body").on("click",".submit-comment",function () {
        let reg = /^\s*$/g;
        if(reg.test($(".write-comment").val()))return;
        address.ajax('', "/file/commentTemp", "post", "json", {tempId:det_data.id,userName:localStorage.getItem("uname"),comment:$(".write-comment").val()},function (res) {
            com_init();
            $(".write-comment").val("")
        })
    })

    $(".btn-use").click(function(){
        address.ajax('', "/file/useTemplate", "post", "json", {id:tempId,userName:localStorage.getItem("uname")},function(res){
            if(res.code==200){
                window.location.href="http://"+location.host+"/draw.html?"+res.data;
            }else{
                toastr.warning(res.msg)
            }

        })
    })
    
})