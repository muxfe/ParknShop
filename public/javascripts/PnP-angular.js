/*
 * 后台数据脚本
 * Date: 10/10/2015
 */

$( function ( ) {
    // 全选
   $( ':checkbox' ).prop( 'checked', false );

   $( '#targetIds' ).val( '' );

   $( '#selectAll' ).click( function ( ) {
       if ( $( this ).prop( 'checked' ) ) {
           $( '.datalist > td > input[name=listItem]' ).prop( 'checked', true );
       } else {
           $( '.datalist > td > input[name=listItem]' ).prop( 'checked', false );
       }
       getSelectIds();
   });

});

// 获取选中的条目ID
function getSelectIds(){
    var checkBoxList = $( ".datalist td input[name='listItem']:checkbox" );
    var ids = '';
    if ( checkBoxList.length > 0 ) {
        $( checkBoxList ).each( function ( i ) {
            if ( true == $( this ).prop( "checked" ) ) {
                ids += $( this ).prop( 'value' ) + ',';
            }
        });
        // 去掉结尾的','
        $( '#targetIds' ).val( ids.substring( 0, ids.length - 1 ) );
    }
}

//字符串转换函数
//adminUser=true&adminGroup=true 转json对象
function changeDataTOJson ( obj ) {
    var oldVal = obj.toString();
    var cg1 = oldVal.replace( /=/g, "':" );
    var changeObj = "{'" + cg1.replace( /&/g, ",'" ) + "}";
    return eval( "(" + changeObj + ")" );
}

//获取指定类别ID对应的名称
function getCateNameById( result, id ) {

    for ( var i = 0; i < result.length; i++ ) {

        if ( result[i]._id === id ) {
            return result[i].name;
        }

    }
    return "Please choose a category";
}


function getCateNameByAlias ( result, name ) {

    for ( var i = 0; i < result.length; i++ ) {

        if ( result[i].name === name ) {
            return result[i].name;
        }
    }
    return "Please choose a category";
}

//初始化分页
function initPagination ( $scope, $http, currentPage, searchKey ) {

    $( "#dataLoading" ).removeClass( "hide" );
    $scope.selectPage = [
        { name:'10', value : '10'  },
        { name:'20', value : '20' },
        { name:'30', value : '30' }
    ];

    $scope.limitNum = '10';
    $scope.currentPage = 1;
    $scope.totalPage = 1;
    $scope.totalItems = 0;
    $scope.limit = 10;
    $scope.pages = [];
    $scope.startNum = 1;
    $scope.keywords = searchKey;
    getPageInfos( $scope, $http, "/admin/api/v1/" + currentPage );
}


// 翻页组件
function getPageInfos( $scope, $http, url ) {

    // 定义翻页动作
    $scope.loadPage = function ( page ) {
        $scope.currentPage = page;
        getPageInfos( $scope, $http, url );
    };

    $scope.nextPage = function () {
        if ( $scope.currentPage < $scope.totalPage ) {
            $scope.currentPage++;
            getPageInfos( $scope, $http, url );
        }
    };

    $scope.prevPage = function () {
        if ( $scope.currentPage > 1 ) {
            $scope.currentPage--;
            getPageInfos( $scope, $http, url );
        }
    };

    $scope.changeOption = function(){

        $scope.limit = Number( $scope.limitNum );
        getPageInfos( $scope, $http, url );
    };

    $http.get( url + "?limit=" + $scope.limit + "&currentPage=" + $scope.currentPage + "&searchKey=" + $scope.keywords )
        .success( function ( result ) {
            // console.log("getData success!");
            $scope.data = result.docs;
            if ( result.pageInfo ) {
                $scope.totalItems = result.pageInfo.totalItems;
                $scope.currentPage = result.pageInfo.currentPage;
                $scope.limit = result.pageInfo.limit;
                $scope.startNum = result.pageInfo.startNum;
                //获取总页数
                $scope.totalPage = Math.ceil( $scope.totalItems / $scope.limit );
                //生成数字链接
                var pageNum =  Number( $scope.currentPage );
                if ( $scope.currentPage > 1 && $scope.currentPage < $scope.totalPage ) {
                    $scope.pages = [
                        $scope.currentPage - 1,
                        $scope.currentPage,
                        $scope.currentPage + 1
                    ];
                } else if ( $scope.currentPage == 1 && $scope.totalPage == 1 ) {
                    $scope.pages = [
                        $scope.currentPage
                    ];
                } else if ( $scope.currentPage == 1 && $scope.totalPage > 1 ) {
                    $scope.pages = [
                        $scope.currentPage,
                        $scope.currentPage + 1
                    ];
                } else if ( $scope.currentPage == $scope.totalPage && $scope.totalPage > 1 ) {
                    $scope.pages = [
                        $scope.currentPage - 1,
                        $scope.currentPage
                    ];
                }
            } else {
                console.error("get pagination info failed.")
            }

            $("#dataLoading").addClass("hide");
        });
}

//新增广告中的图片信息模型
function getImgInfo( imgUrl, link, width, height, target, details ) {
    var html = "";
    var listId = "imgInfo_" + Math.round( Math.random() * 100 );
    var scale = width + "*" + height;
    html += "<div class='alert alert-info fade in' id='" + listId + "'>";
    html += "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
    html += "<div class='col-sm-3'>";
    html += "<img src='" + imgUrl + "' alt='' class='img-thumbnail'/><br/><br/>";
    // html += "<button class='btn btn-primary btn-xs hide'><span class='fa fa-fw fa-edit' aria-hidden='true'></span></button>";
    html += "<a href='#' role='button' class='btn btn-primary hide' data-whatever='" + imgUrl + "' data-toggle='modal' data-target='#addNewAdImg'><span class='fa fa-fw fa-edit' aria-hidden='true'></span></a>"
    html += "</div>";
    html += "<div class='col-sm-8'><div class='form-group'>";
    html += "<label class='col-sm-4 control-label'>图片链接</label>";
    html += "<div class='col-sm-8'><p class='form-control-static'>" + link + "(" + target + ")" + "</p></div>";
    html += "<label class='col-sm-4 control-label'>图片宽高</label>";
    html += "<div class='col-sm-8'><p class='form-control-static'>" + scale + "</p></div>";
    html += "<label class='col-sm-4 control-label'>图片详情</label>";
    html += "<div class='col-sm-8'><p class='form-control-static'>" + details + "</p></div>";
    html += "</div></div>";
    html += "<div class='clearfix'></div>";
    html += "</div>";

    return html;
}


//angularJs https Post方法封装
function angularHttp( $http, isValid, method, url, formData, callback ) {
    if ( isValid ) {
        $http({
            method  : method,
            url     : url,
            data    : $.param(formData),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
        })
        .success( function ( data ) {
                // 关闭所有模态窗口
                $( '.modal' ).each( function ( i ) {
                    $( this ).modal( "hide" );
                });
                if ( data == 'success' ) {
                    callback( data );
                }else{
                    showErrorInfo( data );
                }
        });
    } else {
        console.error("parameters is invalid.");
    }
}

// 主要针对删除操作
function angularHttpDelete( $http, url, callback ) {
    $http.delete( url ).success( function ( result ) {
        $( '.modal' ).each( function ( i ) {
            $( this ).modal( "hide" );
        });
        if ( result === 'success' ) {
            callback( result );
        } else {
            showErrorInfo( result );
        }
    });
}

// 错误信息
function showErrorInfo( info ) {
    $( '#error-info' ).removeClass( 'hide' ).css( 'opacity', 1 ).html( "<i class='icon fa fa-warning'></i>&nbsp" + info );
    setTimeout( function () {
        $( '#error-info' ).animate({
            'opacity': 0
        }, 1000, function () {
            $('#error-info').addClass('hide');
        });
    }, 5000);
}

// 提示用户操作窗口
function initCheckIfDo( $scope, targetId, msg, callback ){
    $( '#checkIfDo' ).on( 'show.bs.modal', function ( event ) {
        if ( targetId ) {
            $scope.targetID = targetId;
        }
        $( this ).find( '.modal-msg' ).text( msg );
    }).on( 'hide.bs.modal', function ( event ) {
        $scope.targetID = "";
    });
    $( '#checkIfDo' ).modal( 'show' );
    // 确认执行删除
    $scope.confirmDo = function (currentID) {
        callback( currentID );
        $( '#checkIfDo' ).modal( 'hide' );
    };
}


// 初始化删除操作
function initDelOption( $scope, $http, currentPage, searchKey, info ) {
    // 单条记录删除
    $scope.delOneItem = function ( id ) {
        initCheckIfDo( $scope, id, info, function ( currentID ) {
            angularHttpDelete( $http, "/admin/api/v1/" + currentPage + "/" + currentID, function ( ) {
                initPagination( $scope, $http, currentPage, searchKey );
            });
        });
    };

    $scope.getNewIds = function(){
        getSelectIds();
    };

    // 批量删除
    $scope.batchDel = function ( ) {
        var targetIds = $( '#targetIds' ).val();
        if ( targetIds && targetIds.split(',').length > 0 ) {
            initCheckIfDo( $scope, $('#targetIds').val(), info, function ( currentID ) {
                var ida = currentID.split(',');
                for ( var i = 0; i < ida.length; i++ ) {
                    angularHttpDelete( $http, "/admin/api/v1/" + currentPage + "/" + ida[i], function ( ) {
                        initPagination( $scope, $http, currentPage, searchKey );
                    });
                }
            });
        } else {
            alert('Please choose one at least.');
        }
    }

}


// 初始化上传图片按钮
function initUploadFyBtn( id, callback ) {
    $("#" + id).uploadify({
        //指定swf文件
        'swf': '/plugins/uploadify/uploadify.swf',
        //后台处理的页面
        'uploader': '/system/upload?type=images&key=plugTopImg',
        //按钮显示的文字
        'buttonText': '上传图片',
        //显示的高度和宽度，默认 height 30；width 120
        //'height': 15,
        //'width': 80,
        //上传文件的类型  默认为所有文件    'All Files'  ;  '*.*'
        //在浏览窗口底部的文件类型下拉菜单中显示的文本
        'fileTypeDesc': 'Image Files',
        //允许上传的文件后缀
        'fileTypeExts': '*.gif; *.jpg; *.png',
        //发送给后台的其他参数通过formData指定
        // 'formData': { 'type': 'images', 'key': 'ctTopImg' },
        //上传文件页面中，你想要用来作为文件队列的元素的id, 默认为false  自动生成,  不带#
        //'queueID': 'fileQueue',
        //选择文件后自动上传
        'auto': true,
        //设置为true将允许多文件上传
        'multi': true,
        //上传成功
        'onUploadSuccess' : function(file, data, response) {
            alert('上传成功')
            callback(data);
        },
        'onComplete': function(event, queueID, fileObj, response, data) {//当单个文件上传完成后触发
            //event:事件对象(the event object)
            //ID:该文件在文件队列中的唯一表示
            //fileObj:选中文件的对象，他包含的属性列表
            //response:服务器端返回的Response文本，我这里返回的是处理过的文件名称
            //data：文件队列详细信息和文件上传的一般数据
            alert("文件:" + fileObj.name + " 上传成功！");
        },
        //上传错误
        'onUploadError' : function(file, errorCode, errorMsg, errorString) {
            alert('The file ' + file.name + ' could not be uploaded: ' + errorString);
        },
        'onError': function(event, queueID, fileObj) {//当单个文件上传出错时触发
            alert("文件:" + fileObj.name + " 上传失败！");
        }
    });
}

//普通下拉菜单
function iniNormalTree( $http, treeObjId, url, listId, currentId, onClick ) {

    $http.get( url ).success( function ( result ) {

        if ( currentId ) {
            if ( url.indexOf( 'contentTemps' ) > 0 ) {
                $( "#" + listId ).html( getCateNameByAlias( result, currentId ) );
            } else {
                $( "#" + listId ).html( getCateNameById( result, currentId ) );
            }
        }
        var arrTree = changeToTreeJson( result );
        var setting = {
            view: {
                dblClickExpand: false,
                selectedMulti: false
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                beforeClick: beforeClick,
                onClick: onClick
            }
        };

        function beforeClick( treeId, treeNode ) {
            var check = ( treeNode && !treeNode.isParent );
            if ( !check ) alert( "Cannot select the top category." );
            return check;
        }

        $.fn.zTree.init( $( "#" + treeObjId ), setting, arrTree );
    })
}
