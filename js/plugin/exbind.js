/*!
 * @作者: liyuelong1020@gmail.com
 * @日期: 2014-05-28
 * @备注: 框架
 */

define(function(require, exports) {

    /**
     * 控制器对象
     */
    var Controller = function(element, param, act) {
        this.element = element;     // DOM节点
        this.param = param;         // 参数
        this.act = act;             // 控件名
        this.lock = {};             // 锁定流程
        this.events = {};
    };
    Controller.prototype = {
        constructor: Controller,

        // 执行方法
        execute: function(eventName) {
            var that = this;
            var methods = that.events[eventName];
            var element = that.element;
            var flag = 0;

            // 按控件定义顺序获取控件方法
            var getMethod = function() {
                var method = null;
                while(!method && flag < that.act.length) {
                    method = methods[that.act[flag++]];
                }
                if(eventName == 'load' && method){
                    delete methods[that.act[flag - 1]];
                }
                return method;
            };

            // 执行控件方法链
            var method = getMethod();
            var execute = function() {
                var isStop = false;
                that.lock[eventName] = true;

                while(method && !isStop){
                    try{
                        method.handler.call(that.element, {
                            param: that.param,
                            stop: function(lock) {
                                isStop = true;
                                that.lock[eventName] = !!lock;
                            },
                            next: function() {
                                if(isStop){
                                    isStop = false;
                                    execute();
                                    that.lock[eventName] = false;
                                }
                            }
                        });
                    } catch(e) {
                        console.error(e);
                    }
                    method = getMethod();
                }

                !isStop && (that.lock[eventName] = !!method);
            };

            // 如果节点是表单则获取表单值
            if(element.val()){
                that.param.param = {};
                that.param.param[element.attr('name')] = element.val();
            }

            // 执行方法链
            method && !that.lock[eventName] && execute();
        },

        // 初始化事件处理
        initAct: function(method) {
            var that = this;
            var element = that.element;
            // 绑定交互事件
            if($.inArray(method.name, that.act) > -1){
                if(!that.events[method.event]){
                    var eventName = element.is('select') && method.event != 'load' ? 'change' : method.event;
                    that.events[method.event] = {};
                    element.unbind(eventName + '.data-act').bind(eventName + '.data-act', function(e) {
                        if(!(e.eventPhase == 3 && $(e.target).attr('data-act'))){
                            that.execute(method.event);
                        }
                    });
                }
                // 保存控件方法
                that.events[method.event][method.name] = method;
                // 触发初始化控件方法
                method.event == 'load' && element.triggerHandler('load.data-act');
            }
        }
    };

    /**
     * 框架对象
     */
    var WebFrame = function() {
        this.methods = {};          // 方法
        this.controllers = {};      // 控件
        this.langTab = [];          // 多语言切换选项卡
        this.init();
    };
    WebFrame.prototype = {
        constructor: WebFrame,

        // 获取事件名称数组
        getAct: function(str) {
            return String(str || '').split(',');
        },

        // 获取参数
        getParam: function(str) {
            var param = {};
            var paramArr = String(str || '').split('&');
            $.each(paramArr, function(i, item) {
                var index = item.indexOf('=', 0);
                if(index > 0){
                    var name = item.substring(0, index).toLowerCase();
                    param[name] = item.substring(index + 1, item.length);
                }
            });
            return param;
        },

        // 注册事件
        registerAct: function(name, event, handler) {
            var that = this;
            var method = {
                name:name,                  // 控件名称
                event: event,               // 控件触发事件
                handler: handler            // 控件方法
            };
            that.methods[name + '_' + event] = method;

            // 将事件注册到控件
            $.each(that.controllers, function(i, controller) {
                controller.initAct(method);
            });
        },

        // 注册控件
        registerController: function(element, params, acts) {
            var that = this;
            var sid = (new Date()).getTime() + '_' + parseInt(Math.random() * 1E8);
            var controller = new Controller(element, params, acts);
            element.attr('data-sid', sid);
            that.controllers[sid] = controller;

            // 给控件注册所有事件
            $.each(that.methods, function(i, method) {
                controller.initAct(method);
            });
        },

        // 触发指定节点控件
        triggerAct: function(sid, name, event) {
            var that = this;
            var method = that.methods[name + '_' + event];
            var controller = that.controllers[sid];

            if(method && controller && !controller.lock[event]){
                method.handler.call(controller.element, {
                    param: controller.param,
                    stop: function() {},
                    next: function() {}
                });
            }
        },

        // bootstrap 多语言切换选项卡
        initLangTab: function() {
            var that = this;
            $.each(that.langTab, function(i, toggle) {
                var target = $(toggle.attr('href'));
                var ul = toggle.parents('ul');
                if(target.size()){
                    toggle.removeClass('fn-hidden').click(function() {
                        $(this).tab('show')
                    });
                    target.is(':visible') && toggle.tab('show');
                    ul.removeClass('fn-hidden');
                } else {
                    toggle.addClass('fn-hidden');
                    if(ul.find('[data-toggle="tab"]:visible').size() < 2){
                        ul.addClass('fn-hidden');
                    }
                }
            });
        },

        // 初始化 frame
        initToggleEffects: function(toggle, type) {
            var that = this;
            switch(type) {
                case 'modal': toggle.modal('hide'); break;
                case 'dropdown': toggle.dropdown(); break;
                case 'tab': that.langTab.push(toggle); break;
                case 'tooltip': toggle.tooltip('hide'); break;
                case 'popover': toggle.popover('hide'); break;
                case 'alert': toggle.alert('hide'); break;
            }
        },

        // 初始化 bootstrap 框架特效
        initWebFrame: function(element) {
            var that = this;
            var sid = element.attr('data-sid');

            if(!sid || !that.controllers[sid]){
                var params = that.getParam(element.attr('data-param'));
                var acts = that.getAct(element.attr('data-act'));
                that.registerController(element, params, acts);
                element.removeAttr('data-param');
            }
        },

        // 查找页面控件
        initController: function(element) {
            var that = this;
            element = element || 'body';

            $(element).each(function() {
                var ele = $(this);

                if(ele.is('[data-act]')){
                    that.initWebFrame(ele);
                }
                if(ele.is('[data-toggle]')){
                    that.initToggleEffects(ele, ele.attr('data-toggle'));
                }

                // 绑定所有控件
                ele.find('[data-act], [data-toggle], form').each(function() {
                    var node = $(this);
                    node.attr('data-act') && that.initWebFrame(node);

                    // 初始化框架特效
                    node.attr('data-toggle') && that.initToggleEffects(node, node.attr('data-toggle'));
                });

            });

            // 初始化 bootstrap 多语言切换选项卡
            that.initLangTab();
        },

        init: function() {
            var that = this;
            var timer = null;
            var elements = [];
            that.initController();

            $('body').unbind('dom_node_inserted.frame').on('dom_node_inserted.frame', function(e, ele) {
                $(ele).children().each(function() {
                    that.initController(this);
                });
            });
        }
    };

    var Frame = new WebFrame();

    // 初始化控件
    $.fn.WebInit = function() {
        return $(this).each(function() {
            Frame.initController($(this));
        });
    };

    // js 手动注册控件
    $.fn.define = function(params, acts) {
        return $(this).each(function() {
            var element = $(this);
            Frame.registerController(element, params, acts);
        });
    };

    // 触发节点控件
    $.fn.act = function(name, event) {
        return $(this).each(function() {
            var sid = $(this).attr('data-sid');
            sid && Frame.triggerAct(sid, name, event);
        });
    };

    // 自定义控件
    $.extend({
        register: function(name, type, handler) {
            Frame.registerAct(name, type, handler);
        }
    });

    return Frame;
});