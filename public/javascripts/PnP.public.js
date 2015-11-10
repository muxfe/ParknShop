/*
 * 前台JS
 * Author: x-web
 * Date: 27/10/2015
 */
'use strict';
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
    var allSelNum = checkBoxList.length;
    if ( checkBoxList.length > 0 ) {
         $( checkBoxList ).each( function ( i ) {
             if ( true == $( this ).prop( "checked" ) ) {
                 allSelNum--;
                 ids += $( this ).prop( 'value' ) + ',';
             }
         });
         if (allSelNum === 0) {
             $("#selectAll").prop('checked', true);
         } else {
             $("#selectAll").prop('checked', false);
         }
         // 去掉结尾的','
         $( '#targetIds' ).val( ids.substring( 0, ids.length - 1 ) );
    }
}

function initDelete($scope, $http, url, msg) {
    msg = msg || 'Are you sure you want to delete the item?';

    $scope.deleteItems = function (id) {
        var targetId = id || $('#targetIds').val();
        targetId = targetId || '';

        if (!targetId) {
            alert('Please choose one item at least');
            return;
        }

        initCheckIfDo( $scope, targetId, msg, function (currentID) {
            if (currentID.indexOf(',') > 0) {
                var ida = currentID.split(',');
                for ( var i = 0; i < ida.length; i++ ) {
                    angularHttpDelete( $http, url + "/" + ida[i], function () {
                        $scope.load();
                    });
                }
            } else {
                angularHttpDelete( $http, url + "/" + currentID, function () {
                    $scope.load();
                });
            }
        });
    };

    $scope.getNewIds = function () {
        getSelectIds();
    };
}

function initPage($scope, $http, url, isPage, callback) {
    $scope.isPage = isPage;
    if (isPage) {
        $scope.limitNum = '10';
        $scope.currentPage = 1;
        $scope.totalPage = 1;
        $scope.totalItems = 0;
        $scope.limit = 10;
        $scope.pages = [];
        $scope.startNum = 1;

        $scope.selectPage = [
            { name:'10', value : '10'  },
            { name:'20', value : '20' },
            { name:'30', value : '30' }
        ];

        // 定义翻页动作
        $scope.loadPage = function ( page ) {
            $scope.currentPage = page;
            loadData($scope, $http, url, callback);
        };

        $scope.nextPage = function () {
            if ( $scope.currentPage < $scope.totalPage ) {
                $scope.currentPage++;
                loadData($scope, $http, url, callback);
            }
        };

        $scope.prevPage = function () {
            if ( $scope.currentPage > 1 ) {
                $scope.currentPage--;
                loadData($scope, $http, url, callback);
            }
        };

        $scope.changeOption = function () {
            $scope.limit = Number( $scope.limitNum );
            loadData($scope, $http, url, callback);
        };
    }
    loadData($scope, $http, url, callback);
}

function loadData($scope, $http, url, callback) {
     $( "#dataLoading" ).removeClass( "hide" );
     $scope.isPage = Boolean($scope.isPage);

     var filterStr = '',
         sortStr = '',
         pageStr = '';

     if (typeof $scope.filterData !== 'undefined') {
         for (var key in $scope.filterData) {
             filterStr += key + '=' + $scope.filterData[key] + '&';
         }
         filterStr = filterStr.substring(0, filterStr.length - 1);
     }
     if (typeof $scope.sortData !== 'undefined') {
         for (key in $scope.sortData) {
             sortStr += key + '=' + $scope.sortData[key] + '&';
         }
         sortStr = sortStr.substring(0, sortStr.length - 1);
     }

     if ($scope.isPage) {
         pageStr = 'limit=' + $scope.limit + '&currentPage=' + $scope.currentPage;
     }
     if (url.indexOf('?') < 0) {
         url += '?';
     }
     url += '&' + pageStr + '&' + filterStr + '&' + sortStr;

     $http.get(url).success(function (result) {
         if ($scope.isPage) {
             if (typeof result !== 'undefined') {
                 if (typeof result.docs !== 'undefined') {
                     $scope.data = result.docs;
                     if ( result.pageInfo ) {
                         $scope.totalItems = result.pageInfo.totalItems;
                         $scope.currentPage = result.pageInfo.currentPage;
                         $scope.limit = result.pageInfo.limit;
                         $scope.startNum = result.pageInfo.startNum;
                         //获取总页数
                         $scope.totalPage = Math.ceil( $scope.totalItems / $scope.limit );
                         //生成数字链接
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
                 } else {
                     showErrorInfo(result);
                 }
             } else {
                 showErrorInfo('get ' + url + ' error');
             }
         } else {
             if (typeof result === 'object') {
                 $scope.data = result;
             } else {
                 showErrorInfo(result);
             }
         }

         if (callback) {
             callback(result);
         }
     });
}

//angularJs https
function angularHttp( $http, method, url, data, callback ) {
    $http({
        method  : method,
        url     : url,
        data    : data,  // pass in data as strings
        type    : 'json',
        dataType: 'json'
    })
    .success(function (result) {
        // 关闭所有模态窗口
        $( '.modal' ).each(function () {
            $( this ).modal( "hide" );
        });
        if (result === 'success') {
            showSuccessInfo(result);
        } else {
            showErrorInfo(result);
        }
        if (callback) {
            callback(result);
        }
    });
}

// 语法糖
function angularHttpDelete($http, url, callback) {
    angularHttp($http, 'DELETE', url, '', callback);
}

function angularHttpPut($http, url, data, callback) {
    angularHttp($http, 'PUT', url, data, callback);
}

function angularHttpPost($http, url, data, callback) {
    angularHttp($http, 'POST', url, data, callback);
}

function showInfo(selector, info) {
    $(selector).css({ 'opacity': 1 }).text(info).closest('small').removeClass('hide');
    setTimeout(function () {
        $(selector).animate({
            'opacity': 0
        }, 1000, function () {
            $(selector).closest('small').addClass('hide');
        });
    }, 5000);
}

// 错误信息
function showErrorInfo(info) {
    showInfo('#errorInfo', info);
}

// 错误信息
function showSuccessInfo(info) {
    showInfo('#successInfo', info);
}

function confirmModal($scope, msg, callback) {
    $('#checkIfDo').on('show.bs.modal', function (event) {
        $(this).find('.modal-msg').text(msg);
    });
    $('#checkIfDo').modal('show');
    // 确认执行删除
    $scope.confirmDo = function () {
        callback();
        $('#checkIfDo').modal('hide');
    };
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
