/*!
 * @作者: liyuelong1020@gmail.com
 * @日期: 2014-03-05
 * @备注: jQuery 文件上传插件
 *
 *  $.ajaxFileUpload({
 *      url: '',                      // 表单提交地址 url (String)
 *      formElement: '',              // 包含文件的表单 (HTMLFormElement|Selector|JQuery Object)
 *      dataType: "json",             // 请求类型 (String) 'json'|'script'|'html'|'xml'
 *      data: {},                     // 其他请求参数
 *      timeout: '',                  // 超时时间
 *      beforeSend: function() {},    // 请求触发前回调函数
 *      complete: function() {},      // 请求完成回调函数
 *      success: function() {},       // 请求成功回调函数
 *      error: function() {}          // 请求失败回调函数
 *  });
 *
 */

define(function(require, exports) {
    var Public = require('public');

    // 获取随机生成的id
    var getId = function() {
        return  'jQuery_file_upload_' + parseInt(Math.random() * 1E10) + '_' + (new Date()).getTime();
    };

    // ajax请求开始
    var ajaxStart = function(option) {
        if (option.beforeSend){
            option.beforeSend(option);
        }
        // 触发全局事件
        if (option.global && !$.active++) {
            $.event.trigger("ajaxStart");
            $.event.trigger("ajaxSend", [{}, option]);
        }
        if (option.global) {
            $.event.trigger("ajaxSend", [{}, option]);
        }
    };

    // ajax请求成功
    var ajaxSuccess = function(option, responseData) {
        // If a local callback was specified, fire it and pass it the data
        if (option.success){
            option.success(responseData);
        }
        // Process result
        if (option.complete ){
            option.complete(responseData);
        }
        // Fire the global callback
        // The request was completed
        if(option.global) {
            $.event.trigger( "ajaxSuccess", responseData);
            $.event.trigger( "ajaxComplete", [responseData, option] );
        }
        // Handle the global AJAX counter
        if (option.global && ! --$.active ){
            $.event.trigger("ajaxStop", responseData);
        }
    };

    // ajax请求失败
    var ajaxError = function(option, e) {
        if (option.error){
            option.error(e);
        }
    };

    // 创建 iframe
    var createIframe = function() {
        var iframe =  $('<iframe src="javascript:void(0);" name="'+ getId() +'" id="'+ getId() +'" style="display:none;"></iframe>');
        iframe.appendTo('body');
        return iframe;
    };

    // 创建 from
    var createForm = function(data) {
        var form =  $('<form name="'+ getId() +'" id="'+ getId() +'" style="display:none;"></form>');
        if(data) {
            for(var name in data) {
                var value = data[name];
                if(Public.isArray(value)){
                    $.each(value, function(i, item) {
                        $('<input type="hidden" name="' + name + '"/>').val(item).appendTo(form);
                    });
                } else if(Public.isObject(value)) {
                    $('<input type="hidden" name="' + name + '"/>').val(Public.serializeJSON(value)).appendTo(form);
                } else {
                    $('<input type="hidden" name="' + name + '"/>').val(value).appendTo(form);
                }
            }
        }
        form.appendTo('body');
        return form;
    };

    // 获取返回值
    var getResponseText = function(option, iframe) {
        var xml = {};
        try {
            if(iframe.contentWindow) {
                xml.responseText = iframe.contentWindow.document.body ? iframe.contentWindow.document.body.innerHTML : null;
                xml.responseXML = iframe.contentWindow.document.XMLDocument ? iframe.contentWindow.document.XMLDocument : iframe.contentWindow.document;

            } else if (iframe.contentDocument) {
                xml.responseText = iframe.contentDocument.document.body ? iframe.contentDocument.document.body.innerHTML : null;
                xml.responseXML = iframe.contentDocument.document.XMLDocument ? iframe.contentDocument.document.XMLDocument : iframe.contentDocument.document;
            }
        } catch(e) {
            ajaxError(option, e);
        }
        return xml;
    };

    // 获取返回数据类型
    var getResponseData = function(option, iframe) {
        var data = null;
        var xml = getResponseText(option, iframe);
        switch(String(option.dataType).toLowerCase()) {
            case 'script': eval('(' + xml.responseText + ')'); break;
            case 'html': data = xml.responseText; break;
            case 'xml': data = xml.responseXML; break;
            case 'json': data = $.parseJSON($('<div>').html(xml.responseText).text()); break;
            default: data = $('<div>').html(xml.responseText).text();
        }
        return data;
    };


    $.extend({
        ajaxFileUpload: function(option) {
            option = $.extend({}, $.ajaxSettings, option);

            var iframe = createIframe();
            var form = createForm(option.data);
            var responseData = null;
            var requestDone = false;     // 是否请求成功

            var uploadCallback = function(ifr) {
                requestDone = true;
                if(ifr){
                    responseData = getResponseData(option, ifr);
                    ajaxSuccess(option, responseData);
                } else {
                    ajaxError(option, e);
                }

                iframe.unbind();
                form.unbind();

                setTimeout(function() {
                    iframe.remove();
                    form.remove();
                    form = null;
                    iframe = null; //清除引用
                }, 100);
            };

            //上传完毕iframe onload事件
            iframe.load(function(){
                uploadCallback(this);
            });

            // 设置表单属性，提交请求
            $(option.formElement).each(function() {
                $.each(this.elements, function(i, input) {
                    if(input.type == 'file'){
                        $(input).after($(input).clone(true, true));
                        $(input).attr('id', getId());
                        form.append(input);
                    }
                });

                form.attr({
                    target: iframe.attr('name'),
                    enctype: 'multipart/form-data',
                    method: 'POST',
                    action: option.url
                });

                ajaxStart(option);

                if (option.timeout > 0 ) {
                    setTimeout(function(){
                        // Check to see if the request is still happening
                        if(!requestDone) {
                            uploadCallback(false);
                        }
                    }, option.timeout);
                }

                try {
                    form.submit();  //提交表单
                } catch(e) {
                    ajaxError(option, e);
                }
            });
        }
    });
});