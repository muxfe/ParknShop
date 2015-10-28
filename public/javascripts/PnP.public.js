/*
 * 前台JS
 * Author: x-web
 * Date: 27/10/2015
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

function initPage($scope, $http, url, isPage) {
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
            loadData($scope, $http, url);
        };

        $scope.nextPage = function () {
            if ( $scope.currentPage < $scope.totalPage ) {
                $scope.currentPage++;
                loadData($scope, $http, url);
            }
        };

        $scope.prevPage = function () {
            if ( $scope.currentPage > 1 ) {
                $scope.currentPage--;
                loadData($scope, $http, url);
            }
        };

        $scope.changeOption = function () {
            $scope.limit = Number( $scope.limitNum );
            loadData($scope, $http, url);
        };

    }
    loadData($scope, $http, url);
}

function loadData($scope, $http, url) {
     $( "#dataLoading" ).removeClass( "hide" );

     var filterStr = '',
         sortStr = '',
         pageStr = '';

     if (typeof $scope.filterData !== 'undefined') {
         for (key in $scope.filterData) {
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
     url += '?' + pageStr + '&' + filterStr + '&' + sortStr;

     $http.get(url).success(function (result) {
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
             showErrorInfo(data);
         }
     });
}

//angularJs https
function angularHttp( $http, method, url, data, callback ) {
    $http({
        method  : method,
        url     : url,
        data    : $.param(data),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
    })
    .success(function (result) {
        // 关闭所有模态窗口
        $( '.modal' ).each(function () {
            $( this ).modal( "hide" );
        });
        if (data == 'success') {
            callback(result);
        } else {
            showErrorInfo(result);
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
