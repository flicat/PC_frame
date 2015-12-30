/*!
 * @author liyuelong1020@gmail.com
 * @date 15-9-17 下午3:24
 * @version 1.0.0
 * @description 框架
 */

define(function (require, exports) {
    var MVVM = require('mvvm');
    var exbind = require('exbind');

    /* exbind 控件注册
     ***************************************************************/
    var result = $('#result');

    $.register('my_load', 'load', function(e) {
        $(this).html('加载事件触发');
        result.val(result.val() + 'my_load: ' +
        JSON.stringify(e.param) +
        '\n----------------------------------------------------------------\n');
    });

    $.register('my_click', 'click', function(e) {
        $(this).html('点击事件触发');
        result.val(result.val() + 'my_click: ' +
        JSON.stringify(e.param) +
        '\n----------------------------------------------------------------\n');
    });

    $.register('my_test', 'click', function(e) {
        $(this).html('点击事件触发');
        result.val(result.val() + 'my_test: ' +
        JSON.stringify(e.param) +
        '\n----------------------------------------------------------------\n');
    });

    $.register('clear', 'click', function(e) {
        result.val('');
    });


    /* MVVM 控件绑定
    *********************************************************************/
    var data = {
        title: '',
        colors: []
    };
    new MVVM('my_mvvm', data);

});