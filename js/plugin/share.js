/*!
 * @author liyuelong1020@gmail.com
 * @date 15-11-11 下午3:37
 * @version 1.0.0
 * @description description 
 */

define(function (require, exports) {

    return {
        // 分享新浪微博
        shareSinaWb: function(config) {      // 描述文字，分享链接，分享图片
            // 新浪微博分享链接
            var linkStr = "http://v.t.sina.com.cn/share/share.php?";
            // 微博分享参数
            var paramStr = [];

            // 分享至微博
            config.description && paramStr.push("title=" + encodeURIComponent(config.description));
            config.url && paramStr.push("url=" + encodeURIComponent(config.url));
            config.img && paramStr.push("pic=" + encodeURIComponent(config.img));

            window.open(linkStr + paramStr.join('&'));
        },

        // 分享腾讯微博
        shareTXWb: function(config) {      // 描述文字，分享链接，分享图片
            // 腾讯微博分享链接
            var linkStr = "http://share.v.t.qq.com/index.php?c=share&a=index&";
            // 微博分享参数
            var paramStr = [];

            // 分享至微博
            config.description && paramStr.push("title=" + encodeURIComponent(config.description));
            config.url && paramStr.push("url=" + encodeURIComponent(config.url));
            config.img && paramStr.push("pic=" + encodeURIComponent(config.img));

            window.open(linkStr + paramStr.join('&'));
        },

        // 分享到人人网
        shareRenren: function(config) {      // 描述文字，分享链接，分享图片
            // 人人网分享链接
            var linkStr = 'http://widget.renren.com/dialog/share?';
            // 分享参数
            var paramStr = [];

            // 分享至人人网
            config.description && paramStr.push("title=" + encodeURIComponent(config.description));
            config.url && paramStr.push("srcUrl=" + encodeURIComponent(config.url) + "&resourceUrl=" + encodeURIComponent(config.url));
            config.img && paramStr.push("pic=" + encodeURIComponent(config.img));

            window.open(linkStr + paramStr.join('&'));
        }
    };
});