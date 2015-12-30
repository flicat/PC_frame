/*!
 * @author liyuelong1020@gmail.com
 * @date 15-9-23 上午10:32
 * @version 1.0.0
 * @description 弹窗插件
 */

define(function (require, exports) {
    // HTML 节点
    var type = '',
        popupElem = $('<div class="popup"></div>'),
        popupContentElem = $('<div class="popup-content"></div>'),
        popupCloseElem = $('<i class="icon-close">&times;</i>'),
        popupMsgElem = $('<span class="popup-msg"></span>');

    $('body').append(popupElem.append(popupContentElem.append(popupCloseElem, popupMsgElem.append(popupCloseElem))));

    // 显示/隐藏事件
    var show = function(msg, e, callback) {
        type = e;
        popupMsgElem.html(msg);
        popupElem.show().unbind('hidden');
        popupContentElem.attr('class', 'popup-content popup-' + type).css({
            'margin-left': -popupContentElem.width() / 2,
            'margin-top': -popupContentElem.height() / 2
        });
        callback && popupElem.one('hidden.' + type, callback);
    };
    var hide = function() {
        popupElem.hide().trigger('hidden.' + type);
    };

    popupElem.hide();

    // 点击隐藏
    popupElem.unbind('click').on('click', function() {
        type !== 'loading' && hide();
    });

    return {
        success: function(msg, callback) {
            show(msg, 'success', callback);
        },
        error: function(msg, callback) {
            show(msg, 'error', callback);
        },
        loading: function(act, msg) {
            if(act === 'show'){
                show(msg || '数据加载中，请稍候...', 'loading');
            } else if(act === 'hide'){
                hide();
            }
        }
    }
});