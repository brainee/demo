window.onerror = function(sMessage, sUrl, sLine) {
    var str = "";
    str += " 错误信息:" + sMessage + "\n";
    str += " 错误地址:" + sUrl + "\n";
    str += " 错误行数:" + sLine + "\n";
    str += "<=========调用堆栈=========>\n";
    var func = window.onerror.caller;
    var index = 0;
    while (func != null) {
        //str += "第" + index + "个函数：" + func + "\n";
        //str += "第" + index + "个函数：参数表："
        //for(var i=0;i<func.arguments.count;i++)
        //str += func.arguments[i] + ",";
        //}
        str += func;
        str += "\n===================\n";
        func = func.caller;
        index++;
    }
    alert(str);
    return true;
};
var require = { urlArgs: Date.now() };