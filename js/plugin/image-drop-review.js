/*!
 * @作者: liyuelong1020@gmail.com
 * @日期: 2014-03-05
 * @备注: 图片拖放与预览
 */

define(function(require, exports) {

    var template = require('template');
    var popup = require('popup');
    var isIE = !!window.ActiveXObject;

    /**
     * 文件管理
     */
    var FileDictionary = function(form) {
        var that = this;
        var dropFiles = {};
        var inputFiles = {};

        // 上传文件
        var updateFile = function(files) {
            if (form) {
                form.find('span.js-img-upload-tip').show();
                form.find('img.js-img-review').hide();
            }
            if(that.updateUrl){
                $.each(files, function(i, file) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', that.updateUrl, true);
                    xhr.onload = function() {
                        if (((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) && xhr.readyState == 4) {
                            var data = null;
                            try {
                                data = $.parseJSON(xhr.responseText);
                            } catch (e) {
                                data = xhr.responseText;
                                console.error(e.description);
                            } finally {
                                that.updateSuccess(data);
                            }
                        }
                    };
                    xhr.send(file);
                });
            }
        };
        // 判断是否是图片
        var isImage = function(file) {
            if(isIE){
                return /jpg|jpeg|png|gif|bmp/ig.test(file.name)
            } else {
                return /image/ig.test(file.type);
            }
        };
        // 文件上传url
        that.updateUrl = '';
        // 文件上传成功回调函数
        that.updateSuccess = function() {};
        // 文件添加事件回调函数
        that.onAddFile = function() {};
        // 文件删除事件回调函数
        that.onDelFile = function() {};
        // input 表单文件
        that.addInputFile = function(files) {
            inputFiles = {};
            dropFiles = {};
            $.each(files, function(i, file) {
                if(isImage(file)){
                    inputFiles[file.name] = file;
                }
            });
            that.onAddFile(inputFiles);
        };
        // 拖放上传文件
        that.addDropFile = function(files) {
            inputFiles = {};
            dropFiles = {};
            $.each(files, function(i, file) {
                if(isImage(file)){
                    dropFiles[file.name] = file;
                }
            });
            that.onAddFile(dropFiles);
        };
        // 删除文件
        that.deleteFile = function(fileName) {
            if(fileName){
                if(dropFiles[fileName]){
                    delete dropFiles[fileName];
                } else if(inputFiles[fileName]){
                    delete inputFiles[fileName];
                }
            } else {
                inputFiles = {};
                dropFiles = {};
            }
            that.onDelFile();
        };
        // 上传拖放文件
        that.sendDropFile = function() {
            var files = [];
            $.each(dropFiles, function(i, file) {
                files.push(file);
            });
            dropFiles = {};
            updateFile(files);
        };
        // 上传所有文件
        that.sendAllFile = function() {
            var files = [];
            $.each(dropFiles, function(i, file) {
                files.push(file);
            });
            $.each(inputFiles, function(i, file) {
                files.push(file);
            });
            updateFile(files);
            inputFiles = {};
            dropFiles = {};
        };
        // IE上传文件
        that.IESendFile = function(form) {
            require.async('ajaxfileupload', function() {
                $.ajaxFileUpload({
                    async: true,
                    url: that.updateUrl,
                    type: 'POST',
                    data: null,
                    formElement: form,
                    dataType: 'JSON',
                    success: function (data){
                        that.updateSuccess(data);
                    },
                    error: function (){
                        console.error('error!');
                    }
                });
            });
            inputFiles = {};
            dropFiles = {};
        };
    };

    /**
     * 图片拖放及预览
     */
    var ImageReview = function(fileInput, fileDictionary, tmpl) {
        var that = this;
        that.tmpl = tmpl || '';
        that.template = null;
        that.fileDictionary = fileDictionary;
        that.fileInput = fileInput;
        that.init();
    };
    ImageReview.prototype = {
        constructor: ImageReview,
        // 获取预览模版
        getReviewTmpl: function() {
            var that = this;
            if(that.tmpl){
                that.template = $('#' + that.tmpl).html();
            } else {
                that.template = '<div class="js-add-img-review">' +
                    '<img class="js-img-review" src="<%= src %>" style="display:<%= src?"inline-block":"none" %>;max-width: 100%; max-height: 100%;">' +
                    '<% if(src){ %>' +
                    '<span class="js-del-img-review">&times;</span>' +
                    '<% } %>' +
                    '</div>';
            }
        },

        // 更新图片预览节点
        updateReview: function(src) {
            var that = this;
            var target = that.target;
            target.html(template.compile(that.template)({src: src}));
            if(src){
                target.addClass('fileinput-exists');
                // 创建IE预览图片
                if(isIE){
                    that.IEUpdateReview({
                        width: target.width() + 'px',
                        height: target.height() + 'px',
                        img: target.find('.js-img-review'),
                        src: src
                    });
                }
            } else {
                target.removeClass('fileinput-exists');
            }
        },

        // 创建IE预览图片
        IEUpdateReview: function(param) {
            if(!-[1,] && !window.XMLHttpRequest){
                param.img.attr('src', param.src);
            } else {
                param.img.each(function() {
                    this.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==';
                    this.style.width = param.width;
                    this.style.height = param.height;
                    this.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod = scale)";
                    this.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = param.src;
                });
            }
        },

        // 获取图片url
        getImageUrl: function(file) {
            var that = this;
            if(isIE && /jpg|jpeg|png|gif|bmp/ig.test(file.name)){
                that.updateReview(file.name);
            } else if(/image/ig.test(file.type)) {
                if (window.createObjectURL) {                           // basic
                    that.updateReview(window.createObjectURL(file));
                } else if (window.URL && window.URL.createObjectURL) {                                // mozilla(firefox)
                    that.updateReview(window.URL.createObjectURL(file));
                } else if (window.webkitURL && window.webkitURL.createObjectURL) {                          // webkit or chrome
                    that.updateReview(window.webkitURL.createObjectURL(file));
                } else {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        that.updateReview(e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            }
        },

        // 初始化图片预览节点
        init: function() {
            var that = this;

            // 取消默认拖放事件
            var ignoreFrog = function(e) {
                e.stopPropagation();
                e.preventDefault();
            };

            // 获取拖放数据
            var drop = function(e) {
                e.stopPropagation();
                e.preventDefault();
                var files = e.dataTransfer.files;
                if(files && files.length){
                    that.fileInput.val('').attr('data-file', '');
                    that.fileDictionary.addDropFile(files);
                }
            };

            that.getReviewTmpl();
            that.target = $('<div class="fileinput"></div>');
            that.fileInput.hide().after(that.target);
            that.updateReview('');

            // 绑定拖放事件
            that.target.each(function() {
                this.ondragenter = ignoreFrog;
                this.ondragover = ignoreFrog;
                this.ondrop = drop;

                // 绑定点击添加图片事件
                $(this).unbind('click').on('click.get_file', '.js-add-img-review', function() {
                    that.fileInput.trigger('click');
                }).on('click.del_file', '.js-del-img-review', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    that.fileDictionary.deleteFile();
                });
            });

        }
    };


    $.fn.imageDropReview = function(option) {
        /**
         * option
         *      reviewtmpl: 模版
         *      dropup: 是否即时上传
         *      sendurl: 图片上传url
         */
        return $(this).filter('input[type="file"]').each(function() {
            // 避免重复绑定
            if(this.image_review_ready){
                return true;
            } else {
                this.image_review_ready = true;
            }

            var fileInput = $(this);
            var form = $(this.form);
            var fileDictionary = new FileDictionary(form);
            var imageReview = new ImageReview(fileInput, fileDictionary, option.reviewtmpl);

            // 文件上传url
            fileDictionary.updateUrl = option.sendurl || form.attr('action');
            // 文件上传成功回调函数
            fileDictionary.updateSuccess = function(data) {
                if(data.status >= 0){
                    // 触发文件上传成功事件
                    fileInput.trigger('upload_file', data);
                } else {
                    popup.error(data.info);
                    $('.js-img-upload-tip').text(data.info);
                }
            };

            if(option.dropup){
                // 文件即时上传
                fileDictionary.onAddFile = function(files) {
                    $.each(files, function(i, file) {
                        imageReview.getImageUrl(file);
                        fileInput.attr('data-file', file.name).trigger('add_file', imageReview.target);
                    });
                    if(!isIE){
                        fileDictionary.sendAllFile();
                    } else {
                        fileDictionary.IESendFile(form);
                    }
                }
            } else {
                // 文件即时上传
                fileDictionary.onAddFile = function(files) {
                    $.each(files, function(i, file) {
                        imageReview.getImageUrl(file);
                        fileInput.attr('data-file', file.name).trigger('add_file', imageReview.target);
                    });
                };
                // 表单提交上传文件
                form.submit(function() {
                    fileDictionary.sendDropFile();
                    return true;
                });
            }

            // 文件删除事件回调函数
            fileDictionary.onDelFile = function() {
                imageReview.updateReview('');
                fileInput.val('').attr('data-file', '').trigger('del_file', imageReview.target);
            };

            // 图片预览初始化完毕
            fileInput.trigger('review_init', {
                imageReview: imageReview,
                fileDictionary: fileDictionary
            });

            fileInput.each(function() {
                // 获取默认值图片
                var definedFile = fileInput.attr('value');
                if(definedFile){
                    var filename = /([^\\/:*?"|<>]+\.\w+)$/g.exec(definedFile);
                    if(filename && filename.length){
                        imageReview.updateReview(definedFile);
                        fileInput.attr('data-file', filename[0] || '').trigger('add_file', imageReview.target);
                    }
                }
                // 表单选择文件
                fileInput.unbind('change.getfile').bind('change.getfile', function() {
                    if(this.files){
                        fileDictionary.addInputFile(this.files);
                    } else {
                        var file = {};
                        file.name = this.value;
                        fileDictionary.addInputFile([file]);
                    }
                });
            });

        });

    };
});