function Waterfall(windowWidth,address) {

    this.address=address;
    this.columnWidth = 234;
    this.columnNumber = 6;
    this.DATE = "";
    this.POINTER = 0;
    this.NODATE = false;
    this.PAGE = 2;
}

$('body').on('click', '.group', function () {
    window.open("/tempdetails.html#" + $(this)[0].id)
});
var waterdata = "";

//向容器中添加图片列
Waterfall.prototype.createColumn = function (search) {
    var container = document.getElementById('container');
    var html = '';
    that = this;
    this.address.ajax('', "/file/getPubTemplate?search=" + search, "get", "json", "", function (res) {
        if(res.data.length<=0){
            toastr.warning("暂无更多模板");
        }
        waterdata = res.data;
        that.DATE = res.data;
        let lineNum = parseInt(res.data.length / that.columnNumber);
        that.POINTER = 0;
        for (let z = 0; z <= lineNum; z++) {
            for (var i = 0; i < that.columnNumber; i++) {
                var columnHtml = '';
                if (that.POINTER > that.DATE.length - 1) {
                    break;
                }
                columnHtml += '<div id="' + that.DATE[that.POINTER].id + '" class="group">' +
                    '<div class="col-lg-12 mb-3">\n' +
                    '            <div class="card  mb-3">\n' +
                    '                <div class="card-body">\n' +
                    '   <a href="javascript:void(0)" class="picture">' +
                    '   <img loading="lazy" src="' + that.DATE[that.POINTER].img + '">' +
                    '   </a>' +
                    '<div><a>' + that.DATE[that.POINTER].title + '</a><p>' + that.DATE[that.POINTER].summary + '</p></div>' +
                    '<div></div>' +
                    '<div><img style="height: 33px;\n' +
                    '    margin: 6px 9px;\n' +
                    '    width: 33px;" src="../img/sangerbox/yjdslogo.png">' + that.DATE[that.POINTER].owner + '</div>' +

                    '                </div>\n' +
                    '            </div>\n' +
                    '        </div>' +

                    '</div>';
                that.POINTER++;
                $("#column-" + i).append(columnHtml);
                // html += '<div id="column-' + i + '" class="column">' + columnHtml + '</div>';
            }
        }
        // var width = this.columnNumber*this.columnWidth;
        container.style.cssText = 'width: 1362px; margin: 0 auto;';
        // that.clickEvent(container);
        that.DATE = res.data;
    })
};

//检测是否具有加载的条件
Waterfall.prototype.check = function () {
    var scrHeight = document.body.scrollTop || document.documentElement.scrollTop;
    var cliHeight = document.body.clientHeight || document.documentElement.clientHeight;
    //判断是否继续有数据
    console.log(this.POINTER, this.DATE.length - 1)
    if (this.POINTER > this.DATE.length - 1 || 1000 < this.POINTER || this.DATE.length - 1 < this.columnNumber) {
        this.NODATE = true;
        toastr.warning("暂无更多模板");
        return;
    } else {
        for (var i = 0; i < this.columnNumber; i++) {
            var column = document.getElementById('column-' + i);
            if (column.offsetHeight < scrHeight + cliHeight) {
                this.addImage(i);
                this.POINTER++;
                //    TODO 循环
                // this.POINTER=this.POINTER>this.DATE.length-1?0:this.POINTER;
            }
        }
    }
};
//滚动时向列中添加图片
Waterfall.prototype.addImage = function (column) {
    let chtml = '<div id="' + that.DATE[that.POINTER].id + '" class="group">' +
        '<div class="col-lg-12 mb-3">\n' +
        '            <div class="card  mb-3">\n' +
        '                <div class="card-body">\n' +
        '   <a href="javascript:void(0)" class="picture">' +
        '   <img src="' + waterdata[this.POINTER].img + '">' +
        '   </a>' +
        '<div><a>' + waterdata[this.POINTER].title + '</a><p>' + waterdata[this.POINTER].summary + '</p></div>' +
        '<div></div>' +
        '<div><img style="height: 33px;\n' +
        '    margin: 6px 9px;\n' +
        '    width: 33px;" src="../img/sangerbox/yjdslogo.png">' + waterdata[this.POINTER].owner + '</div>' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>' +
        '</div>';
    $('#column-' + column).append(chtml)
};
//滚动监听
Waterfall.prototype.scrollListener = function () {
    var that = this;
    window.onscroll = function () {
        if (!that.NODATE) {
            that.check();
        }
    }
};

//初始化
Waterfall.prototype.init = function () {
    this.createColumn("");
    this.scrollListener();
    that = this;
    $(".submit").click(function () {
        $(".column").html("");
        that.createColumn($(".search-temp").val());
    })
};

//加载页面
window.onload = function () {
    let windowWidth = document.body.clientWidth || document.documentElement.clientWidth;
    let address = new Address();
    let waterfall = new Waterfall(windowWidth,address);
    waterfall.init();
};

