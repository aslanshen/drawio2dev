document.writeln('<div class="swiper mySwiper">');
document.writeln('    <div class="swiper-wrapper">');
document.writeln('    </div>');
document.writeln('    </div>');

function Waterfall(windowWidth,address) {
    this.address=address;
    this.columnWidth = 234;
    this.columnNumber = 6;
    this.DATE = "";
    this.POINTER = 0;
    this.NODATE = false;
    this.PAGE = 2;
    this.slides = [];
}

$('body').on('click', '.group', function () {
    window.open("/tempdetails.html#" + $(this)[0].id)
});

var waterdata = "";

//向容器中添加图片列
Waterfall.prototype.createColumn = function (search) {
    var swiperWrapper = document.querySelector('.swiper-wrapper');
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
                columnHtml +=
                '<div class="swiper-slide">' +
                '<div id="' + that.DATE[that.POINTER].id + '" class="group">' +
                '<div class="col-lg-12 mb-3">' +
                '            <div class="card  mb-3">' +
                '                <div class="card-body" style=" margin: auto;border: 1px solid #333; border-radius: 5px;">' +
                '   <a href="javascript:void(0)" class="picture">' +
                '   <img style="width: 200px;" loading="lazy" src="' + that.DATE[that.POINTER].img + '">' +
                '   </a>' +
                '<div></div>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '</div>' +
                '</div>' +
                '<div class="swiper-slide">' +
                '<div id="' + that.DATE[that.POINTER].id + '" class="group">' +
                '<div class="col-lg-12 mb-3">' +
                '            <div class="card  mb-3">' +
                '                <div class="card-body" style=" margin: auto;border: 1px solid #333; border-radius: 5px;">' +
                '   <a href="javascript:void(0)" class="picture">' +
                '   <img style="width: 200px;" loading="lazy" src="' + that.DATE[that.POINTER].img + '">' +
                '   </a>' +
                '<div></div>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '</div>' +
                    '</div>';
                that.POINTER++;
                $(".swiper-wrapper").append(columnHtml);
            }
        }
        swiperWrapper.style.cssText = 'width: 100%;';
        that.DATE = res.data;

        var swiper = new Swiper('.mySwiper', {
            loop: true,
            speed: 3500,
            slidesPerView: 4,
            autoplay: {
                delay: 0,
            },
        });
    })
};


// //检测是否具有加载的条件
// Waterfall.prototype.check = function () {
//     var scrHeight = document.body.scrollTop || document.documentElement.scrollTop;
//     var cliHeight = document.body.clientHeight || document.documentElement.clientHeight;
//     //判断是否继续有数据
//     if (this.POINTER > this.DATE.length - 1 || 1000 < this.POINTER || this.DATE.length - 1 < this.columnNumber) {
//         this.NODATE = true;
//         toastr.warning("暂无更多模板");
//         return;
//     } else {
//         for (var i = 0; i < this.columnNumber; i++) {
//             var column = document.getElementById('column-' + i);
//             if (column.offsetHeight < scrHeight + cliHeight) {
//                 this.addImage(i);
//                 this.POINTER++;
//             }
//         }
//     }
// };
// //滚动时向列中添加图片
// Waterfall.prototype.addImage = function (column) {
//     let chtml = '<div id="' + that.DATE[that.POINTER].id + '" class="group">' +
//         '<div class="col-lg-12 mb-3">\n' +
//         '            <div class="card  mb-3">\n' +
//         '                <div class="card-body">\n' +
//         '   <a href="javascript:javascript:void(0)" class="picture">' +
//         '   <img src="' + waterdata[this.POINTER].img + '">' +
//         '   </a>' +
//         '<div><a>' + waterdata[this.POINTER].title + '</a><p>' + waterdata[this.POINTER].summary + '</p></div>' +
//         '<div></div>' +
//         '<div><img style="height: 33px;\n' +
//         '    margin: 6px 9px;\n' +
//         '    width: 33px;" src="../img/sangerbox/yjdslogo.png">' + waterdata[this.POINTER].owner + '</div>' +
//         '                </div>\n' +
//         '            </div>\n' +
//         '        </div>' +
//         '</div>';
//     $('#column-' + column).append(chtml)
// };
// //滚动监听
// Waterfall.prototype.scrollListener = function () {
//     var that = this;
//     window.onscroll = function () {
//         if (!that.NODATE) {
//             that.check();
//         }
//     }
// };

//初始化
Waterfall.prototype.init = function () {
    this.createColumn("");
    // this.scrollListener();
    that = this;
    // $(".submit").click(function () {
    //     $(".column").html("");
    //     that.createColumn($(".search-temp").val());
    // })
};

//加载页面
window.onload = function () {
    let windowWidth = document.body.clientWidth || document.documentElement.clientWidth;
    let address = new Address();
    let waterfall = new Waterfall(windowWidth,address);
    waterfall.init();
};
