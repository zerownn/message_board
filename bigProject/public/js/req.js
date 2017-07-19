jQuery(function($){
    // Create variables (in this scope) to hold the API and image size
    var jcrop_api,
        boundx,
        boundy,
    // Grab some information about the preview pane
        $preview = $('#preview-pane'),
        $pcnt = $('#preview-pane .preview-container'),
        $pimg = $('#preview-pane .preview-container img'),

        xsize = $pcnt.width(),
        ysize = $pcnt.height();

    $('#target').Jcrop({
        onChange: updatePreview,
        onSelect: updatePreview,
        aspectRatio: xsize / ysize
    },function(){
        // Use the API to get the real image size
        var bounds = this.getBounds();
        boundx = bounds[0];
        boundy = bounds[1];
        // Store the API in the jcrop_api variable
        jcrop_api = this;

        // Move the preview into the jcrop container for css positioning
        $preview.appendTo(jcrop_api.ui.holder);
    });
    //更新效果视图
    function updatePreview(c)
    {
        if (parseInt(c.w) > 0)
        {
            var rx = xsize / c.w;
            var ry = ysize / c.h;
            var width=Math.round(rx * boundx);
            var height=Math.round(ry * boundy);
            var marginLeft= Math.round(rx * c.x);
            var marginTop = Math.round(ry * c.y);
            // $("h1").html(width+" "+height+" "+marginLeft+" "+marginTop);
            $pimg.css({
                width: width + 'px',
                height: height + 'px',
                marginLeft: '-' +marginLeft + 'px',
                marginTop: '-' + marginTop+ 'px'
            });
        }
    }
});
//点击剪裁按钮后的效果
$("#cut").on("click",function(){
    //1.获取截取的节点的宽高横纵坐标
    var width=parseInt($(".jcrop-holder>div:first-child").css("width"));
    var height =parseInt($(".jcrop-holder>div:first-child").css("height"));
    var left =parseInt($(".jcrop-holder>div:first-child").css("left"));
    var top =parseInt($(".jcrop-holder>div:first-child").css("top"));
    //2.发送截取请求,传入四个参数
    $.ajax({
        url:"/doCut",
        data:{
            "width":width,
            "height":height,
            "left":left,
            "top":top
        },
        success:function(result){
            if(result == "1"){
                window.location = "/";
            }
        }
    })
});

/*首页开始加载*/
$(".pagination li:first").addClass("active");
var currPage=1;//页面初始化显示第一页
getDataByPage(currPage);
function getDataByPage(page){//第一页的数据
    $.ajax({
        url:'/findByPage',
        data:{"page":page},
        success:function(data){//接受到当前分页的数据
            //找到模板节点
            var complied = _.template($("#formwork").html());
            $("#hide").html("");//清空原先内容
            (function item(i){//根据用户名查找用户信息
                $.ajax({
                    url:'/findByUsername',
                    cache:false,//缓存
                    data:{'use':data[i].use},
                    success:function(content){
                        var str=complied(
                            {'name':data[i].use,'message':data[i].message,'time':data[i].time,'avatar':content}
                        );
                        $('#hide').append(str);
                        item(i+1);
                    }
                });
            })(0)
        }
    });
}
//给页面节点添加事件
$(".pagination li").on("click",function(){
    //点击时 获取当前页码  根据页码查询数据
    currPage=parseInt($(this).attr("data-page"));
    //根据页码查询数据
    getDataByPage(currPage);
    $(this).addClass("active").siblings().removeClass("active");
});

