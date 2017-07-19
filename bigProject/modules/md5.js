//md5二次加密 工具
var crypto=require('crypto');
//定义MD5加密函数
function _md5(pwd){
    var md5=crypto.createHash('md5');
    var password=md5.update(pwd).digest('base64');
    return password;
}
//暴露整个js
module.exports=function(pwd){
    return _md5(_md5(pwd).substr(3,3)+_md5('nn'));
};