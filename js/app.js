var host = "http://localhost:8545";

function setAdaptionHeight(className,proportion)
{
	var BgWidth = h("."+className).width();
	h("."+className).css({'height':BgWidth/proportion+'px'});
}


/**
 * 判断是否为数字
 */
function isNumber(val)
{
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if(regPos.test(val) || regNeg.test(val)){
        return true;
    }else{
        return false;
    }
}

/**
 ** 加法函数，用来得到精确的加法结果
 ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
 ** 调用：accAdd(arg1,arg2)
 ** 返回值：arg1加上arg2的精确结果
 **/
function accAdd(arg1, arg2) {
    var r1, r2, m, c;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    c = Math.abs(r1 - r2);
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
        var cm = Math.pow(10, c);
        if (r1 > r2) {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", "")) * cm;
        } else {
            arg1 = Number(arg1.toString().replace(".", "")) * cm;
            arg2 = Number(arg2.toString().replace(".", ""));
        }
    } else {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m;
}

/**
 * rpc
 */

function rpc(method,params,callback,name)
{
    var id = Math.round(Math.random()*100);

    var data ={"jsonrpc": "2.0","method": method, "params": params,"id":id};
    mui.ajax(host,{
        contentType: 'application/json',
        data:data,
        dataType:'json',//服务器返回json格式数据
        type:'post',//HTTP请求类型
        timeout:10000,//超时时间设置为10秒；
        async: false,
        success:function(data){

            if(method=="personal_newAccount"){
                var wallet_name = localStorage.getItem("wallet_name");

                if(wallet_name==null){
                    var wallet_name = {};
                    wallet_name[data.result] = name;
                }else{
                    wallet_name = JSON.parse(wallet_name);
                    wallet_name[data.result] = name;
                }
                var str = JSON.stringify(wallet_name);
                localStorage.setItem("wallet_name",str);

            }
            if(typeof  callback === "function")
            {
                callback(data);
            }

        },
        error:function(xhr,type,errorThrown){
            mui.toast('请打开pc节点，或者下载安装。');
        }
    })
}

/**
 * 获取地址
 */
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r != null) return unescape(r[2]);
    return null;
}

//时间戳转换
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()) + ':';
    var s = date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds();
    return Y+M+D+h+m+s;
}


//获取get参数
function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

function getUrlAttr() {
    var obj = window.location.href;
    var index = obj.lastIndexOf("#");
    var last = obj.lastIndexOf("?");
    if(last > 0)
    {
        var str = obj.substring(index+1,last);
    }else{
        var str = obj.substring(index+1,obj.length);
    }
    return str;
}

//更新pwa
function update_sw(sw_version) {
    mui.ajax("/js/sw.json?v=" + Math.random(), {
        dataType: 'json',//服务器返回json格式数据
        type: 'get',//HTTP请求类型
        timeout:10000,
        success: function (cmd) {
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                    navigator.serviceWorker.register('/js/sw.js', {scope: '/js/'})
                        .then(function (reg) {
                            //手动更新 Service Worker
                            if (localStorage.getItem('sw_version') !== sw_version) {
                                reg.update().then(function () {
                                    localStorage.setItem('sw_version', sw_version)
                                });
                            }
                        })
                        .catch(function (err) {
                        });
                });
                navigator.serviceWorker &&  navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage(cmd);
            }
        }
    });
}

//判断是否是数字
function isNumbers(v) {
    var re = /^[0-9]+.?[0-9]*$/;
    if(!re.test(v))
    {
        return true;
    }else{
        return false;
    }
}

//过滤空格
function trim(str){
    return str.replace(/^(\s|\u00A0)+/,'').replace(/(\s|\u00A0)+$/,'');
}

//点击显示高级选项
function showHeightOptions()
{
    var button_id = document.getElementById("height-option");
    var sty = button_id.style.display;
    if(sty == 'none')
    {
        button_id.style.display = "block";
    }else{
        button_id.style.display = "none";
    }
}