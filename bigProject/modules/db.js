//封装增删改查方法
//DAO层的封装，封装了跟数据库相关的常用操作
var MongoClient=require('mongodb').MongoClient;
//1.建立数据连接
function _connectDB(callback){//加_表示是内部变量,外部调用不了
    var url='mongodb://localhost:27017/web1703';
    MongoClient.connect(url,function(err,db){
        if(err){
            //console.log('连接出错');
            callback(err,null);
        }
        callback(null,db);
        //console.log("success");
    });
}
//_connectDB(function(err,db){
//    console.log(db);
//});
//2.定义插入方法
exports.insertOne=function(collectionName,json,callback){
//    建立连接
    _connectDB(function (err,db){
        db.collection(collectionName).insertOne(json,function(err,result){
            callback(err,result);
        });
        db.close();
    })
};
/*3.修改方法*/
/*update({'name':'ze'},{$set:{'name':'li'}})*/
exports.updateMany=function(collectionName,json1,json2,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).updateMany(
            json1,json2,{'multi':true},function(err,result){
                callback(err,result);
                db.close();
            }
        )
    })
};
/*删除方法*/
/*remove({'name':'insert'})*/
exports.deleteMany=function(collectionName,json,callback){
    _connectDB(function(err,db){
      db.collection(collectionName).deleteMany(
          json,function(err,result){
              callback(err,result);
              db.close();
          }
      )
    });
};
/*查询*/
/*db.student.find({'age':30}))*/
/*exports.find=function(collectionName,json,callback){/!*只能查询所有*!/
    _connectDB(function(err,db){
        var all=db.collection(collectionName).find(json);
        var allResults=[];
    //    将all对象转成数组
        all.toArray(function(err,docs){
            if(err){
                callback(err,null);
                db.close();
            }
            allResults=docs;
            callback(null,allResults);
            db.close();
        })
    })
};*/
/*假设一共有17条数据，每页显示3/pageSize条，现在只希望查询第3/page页的数据 按照时间排序
 db.student.find({'age':30}).skip(pageSize*(page-1)).limit(pageSize).sort({'time':-1})*/
exports.find=function(collectionName,json,c,d){
    /*先判断用户调用时传入了几个参数
      如果是3个参数，分别代表(集合名称 查询参数 回调函数)*/
    if(arguments.length==3){
        var callback=c;
        var skipnum=0;
        var limitnum=0;
        var sort={}; 
    //
    }else if(arguments.length==4){
        /*如果是4个参数 分别代表(集合名称 查询参数 分页配置=>{每页显示几条，当前第几页} 回调函数)*/
        var callback=d;
        var args=c;//{'pageSize':3,'page':3,'sort':{'age':-1}}
    //    计算出需要跳过多少条数据
        var skipnum=args.pageSize*(args.page-1)||0;
    //    查询几条数据
        var limitnum=args.pageSize||0;
    //    排序方式
        var sort=args.sort||{};
    }
    _connectDB(function(err,db){
        var all=db.collection(collectionName).find(json).skip(skipnum).limit(limitnum).sort(sort);
        var allResults=[];
        //    将all对象转成数组
        all.toArray(function(err,docs){
            if(err){
                callback(err,null);
                db.close();
            }
            allResults=docs;
            callback(null,allResults);
            db.close();
        })
    })
};

/*定义查询总记录数方法,拿出总记录数*/
exports.findAllCount=function(collectionName,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).count({}).then(function(count){
            callback(count);
            db.close();
        })
    })
};