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

function barChart(selector, dataset) {
    var _width = jQuery("#income-barChart").width(),
        _height = jQuery(window).height() * 0.26,
        _padding = { top: 10, right: 40, bottom: 20, left: 50 },
        _color_hash = {
            0: ["Sale", "#2ca02c"],
            1: ["Ad", "#1f77b4"]
        },
        _data = dataset || [];

    if (!d3) {
        console.log("D3 is not supported.");
        return;
    }
    if (_data.length === 0) {
        console.log("Dataset is empty.");
        return;
    }
    var stack = d3.layout.stack();
    stack(_data);
    var xScale = d3.time.scale()
        .domain([getDate(_data[0][_data[0].length - 1]._id), getDate(_data[0][0]._id)])
        .rangeRound([0, _width - _padding.left - _padding.right]);

    var yScale = d3.scale.linear()
        .domain([0,
            d3.max(_data, function (d) {
                return d3.max(d, function (d) {
                    d.y = d.totalPrice;
                    return d.y0 + d.y;
                })
            })
        ])
        .range([ _height - _padding.bottom - _padding.top, 0 ]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(d3.time.days, 1);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(10);

    var colors = d3.scale.category10();

    var svg = d3.select(selector)
        .append("svg")
        .attr("width", _width)
        .attr("height", _height);

    var groups = svg.selectAll("g")
        .data(_data)
        .enter()
        .append("g")
        .attr("class", "rgroups")
        .attr("transform", "translate(" + _padding.left + "," + _padding.bottom + ")")
        .style("fill", function (d, i) {
            return _color_hash[_data.indexOf(d)][1];
        });

    var rects = groups.selectAll("rect")
        .data(function (d) { return d; })
        .enter()
        .append("rect")
        .attr("width", 2)
        .style("fill-opacity", 1e-6);

    rects.transition()
        .duration(function (d, i) {
            return 500 * i;
        })
        .ease("linear")
        .attr("x", function (d) {
            return xScale(getDate(d._id));
        })
        .attr("y", function (d) {
            return yScale(d.y) - ( _padding.bottom - _padding.top );//- (-yScale(d.y0) - yScale(d.y) + (_height - _padding.top - _padding.bottom) * 2);
        })
        .attr("height", function (d) {
            return -yScale(d.y) + (_height - _padding.top - _padding.bottom);
        })
        .attr("width", 15)
        .style("fill-opacity", 1);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(50, " + (_height - _padding.bottom) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + _padding.left + "," + _padding.top + ")")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 5)
        .attr("x", 0 - (_height / 2))
        .attr("dy", "1em")
        .text("Total");

    function getDate(_id) {
        return new Date(_id.year, _id.month - 1, _id.day);
    }
}

function renderPie(selector, content, options) {
    var size = {
            width: $(selector).width(),
            height: $(selector).height()
        },
        options = options || { };

    $.extend(size, options);
    new d3pie(selector, {
        size: {
            "canvasWidth": size.width,
            "canvasHeight": size.height,
            "pieInnerRadius": "1%",
            "pieOuterRadius": "100%"
        },
        data: {
            "sortOrder": "value-asc",
            "content": content
        },
        tooltips: {
            "enabled": true,
            "type": "placeholder",
            "fontColor": "#efefef",
            "string": "{label}: {value}, {percentage}%"
        },
        misc: {
            "colors": {
                "segmentStroke": "#fff"
            }
        },
        effects: {
            "pullOutSegmentOnClick": {
                "effect": "linear",
                "speed": 400,
                "size": 8
            }
        },
        labels: {
            "outer": {
                "pieDistance": 10
            },
            "mainLabel": {
                "fontSize": 16
            },
            "percentage": {
                "fontSize": 14,
                "decimalPlaces": 0
            },
            "value": {
                "color": "#cccc43",
                "fontSize": 14
            },
            "lines": {
                "enabled": true,
                "color": "#aaa"
            },
            "truncation": {
                "enabled": true
            }
        }
    });
}
