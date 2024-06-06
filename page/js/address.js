var port = 9101;
function Address(){}
Address.prototype.ajax=function(base, url, type, dataType, data, callback, async = true, port = 9101, errorCallback = function() {}) {
        var ismg = true;
        var ip='',ipName='';
        if (base == '') {
            var net=this.networkInit();
            ip=net.IP;
            ipName=net.name;
            if(ip=='cloud.biovisart.com'|ip=='cloud2.biovisart.com'){
                base='http://' + (port==9101?'cloud.biovisart.com:9101':'cloud2.biovisart.com:9101');
            }else{
                base = 'http://' + ip + ":" + port;
            }
        } else {
            ismg = false;
        }
        var biovisart=this,port_url=(port==9101?'http://cloud.biovisart.com:9101':'http://cloud.biovisart.com:9101');
        biovisart.basicAjax(base + url,type, dataType, data, function(res, status, request){
            if(ismg){
                var timeStamp1 = Date.parse(new Date());//秒
                if(ipName=='IP1'){
                    sessionStorage.setItem('network_ips', JSON.stringify({'ip1': ip,'ip1_time': timeStamp1 ,'ip1_succ': 1 }));
                }else if(ipName=='IP2'){
                    sessionStorage.setItem('network_ips', JSON.stringify({ 'ip2': ip,'ip2_time': timeStamp1,'ip2_succ': 1 }));
                }
            }
            callback(res, status, request);
        }, async , function(res) {
            if (ismg) {
                if(res.status==401){
                    toastr.warning('登录超时，请先重新登录！');
                }else if(res.status==500){
                    toastr.error('服务器内部错误，请联系管理员！');
                }else if(res.status==200){
                }else if(res.status==0){
                    var net=biovisart.networkInit(true);
                    var ip='cloud.biovisart.com';
                    if(ip=='cloud.biovisart.com'|ip=='cloud2.biovisart.com'){
                        base='http://' + (port==9101?'cloud.biovisart.com:9101':'cloud2.biovisart.com:9101');
                    }else{
                        base = 'http://' + ip + ":" + port;
                    }
                    biovisart.basicAjax(base + url,type, dataType, data, callback, async , function(res1) {
                        if(res.status==0){
                        }else{
                            errorCallback(res1);
                        }
                    });
                }else{
                    toastr.error('服务器内部错误，请联系管理员！');
                }
            }
        },true,function(){
        });
}
Address.prototype.networkInit=function(init=false) {
    var network = JSON.parse(sessionStorage.getItem('network_ips'));
    var skip=10*60*1000;
    if(init){
        sessionStorage.setItem('network_ips',JSON.stringify({'ip1':null,'ip2':null}));
    }
    var ini1=true,ini2=true,timeStamp1 = Date.parse(new Date());//秒
    if(network!=null&&network.ip1 != null){
        if(timeStamp1-network.ip1_time<skip&network.ip1_succ==1) ini1=false;
    }
    if(network!=null&&network.ip2 != null){
        if(timeStamp1-network.ip2_time<skip&network.ip2_succ==1) ini2=false;
    }
    var biovisart=this;
    if (ini1){
        var sl=true;
        if(network!=null&&network.ip1 != null){
            sl=timeStamp1-network.ip1_time>skip;
        }
        if(sl){
            biovisart.basicAjax('http://cloud.biovisart.com:9101/A', 'GET', 'json', {}, function (res) {}, true , errorCallback = function () {
                var timeStamp1 = Date.parse(new Date());//秒
                sessionStorage.setItem('network_ips', JSON.stringify({  'ip1': 'cloud.biovisart.com' ,'ip1_time': timeStamp1,'ip1_succ': 0 }));
            }, true, succCallback = function () {
                var timeStamp1 = Date.parse(new Date());//秒
                sessionStorage.setItem('network_ips', JSON.stringify({  'ip1': 'cloud.biovisart.com','ip1_time': timeStamp1 , 'ip1_succ': 1 }));
            });
        }
    }
    if (ini2){
        var sl=true;
        if(network!=null&&network.ip2 != null){
            sl=timeStamp1-network.ip2_time>skip;
        }
        if(sl){
            biovisart.basicAjax('http://cloud2.biovisart.com:9101/A', 'GET', 'json', {}, function (res) {}, true , errorCallback = function () {
                var timeStamp1 = Date.parse(new Date());//秒
                sessionStorage.setItem('network_ips', JSON.stringify({  'ip2': 'cloud2.biovisart.com' ,'ip2_time': timeStamp1,'ip2_succ': 0 }));
            }, true, succCallback = function () {
                var timeStamp1 = Date.parse(new Date());//秒
                sessionStorage.setItem('network_ips', JSON.stringify({  'ip2': 'cloud2.biovisart.com','ip2_time': timeStamp1 , 'ip2_succ': 1 }));
            });
         }
    }
    var txt;
    if(!ini1) txt='华数';
    else if(!ini2) txt='电信';

    if(!ini1) return {IP:network.ip1,name:'IP1'};
    if(!ini2) return {IP:network.ip2,name:'IP2'};
    return {IP:'cloud.biovisart.com',name:'IP3'}
} 
Address.prototype.basicAjax=function(url,type, dataType, data, callback, async = true, errorCallback = function() {},beforeSend=true,succCallback=function(){}){
    $.ajax({
        url: url,
        type: type,
        dataType: dataType,
        data: data,
        async: async,
        beforeSend: function(request) {
            if(beforeSend){
                request.setRequestHeader("Authorization", localStorage.getItem("authorization"));
            }
        },
        statusCode: {
            200: function(data) {
                if(beforeSend) succCallback();
            }
        },
        success: callback,
        error: errorCallback
    });
}
Address.prototype.get_global_uri=function(port = 9101) {
    var base = '';
    var net=this.networkInit();
    var ip=net.IP;
    if(ip=='cloud.biovisart.com'|ip=='cloud2.biovisart.com'){
        base='http://' + (port==9101?'cloud.biovisart.com:9101':'cloud2.biovisart.com:9101');
    }else{
        base = 'http://' + ip + ":" + port;
    }
    return base;
}
Address.prototype.get_WebSocket_uri=function() {
    var base = '';
    var net=this.networkInit();
    if (net.name == 'IP1'){
        return 'ws://cloud.biovisart.com:15674/ws';
    }else{
        return 'ws://calculate.mysci.online:15674/ws';
    }
}
