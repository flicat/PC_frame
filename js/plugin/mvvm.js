/*!
 * @作者: flicat.li@wintour.cn
 * @日期: 2014-06-08
 * @备注: Global MVVM 框架
 *
 * 绑定监听：
 *     new MVVM(控件区域, {a, 123, b: {c: 456}, d: function() {}});
 *
 * 声明控制区域
 *      vm-controller="my-label";
 * 绑定操作：
 *      绑定html赋值：vm-html="a";
 *      绑定表单赋值：vm-value="b.c"; 注意：表单赋值具有双向绑定，修改表单值的同时也会修改数据
 *      绑定属性赋值：vm-attr-class="b.c";
 *      绑定css属性赋值：vm-css-display="a ? 'none': 'block'";
 *      绑定事件：vm-on-click="d()";
 */

define(function(require, exports) {
    var Public = require('public');
    var template = require('template');

    // 静态分析模板变量
    var KEYWORDS =
        // 关键字
        'break,case,catch,continue,debugger,default,delete,do,else,false'
        + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
        + ',throw,true,try,typeof,var,void,while,with'

            // 保留字
        + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
        + ',final,float,goto,implements,import,int,interface,long,native'
        + ',package,private,protected,public,short,static,super,synchronized'
        + ',throws,transient,volatile'

            // ECMA 5 - use strict
        + ',arguments,let,yield'

        + ',undefined';

    var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
    var SPLIT_RE = /[^\w$]+/g;
    var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
    var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
    var BOUNDARY_RE = /^,+|,+$/g;
    var SPLIT2_RE = /^$|,+/;

    var getVariable = function(str) {
        return str.replace(REMOVE_RE, '').replace(SPLIT_RE, ',').replace(KEYWORDS_RE, '').replace(NUMBER_RE, '').replace(BOUNDARY_RE, '').split(SPLIT2_RE);
    };

    // 预编译对象取值方法
    var compile_get = function(value) {
        var code = '';


        var variable = getVariable(value);

        $.each(variable || [], function(i, key) {
            code += 'var ' + key + ' = $VM_data.' + key + ';';
        });

        code += 'return function() { return ' + value + ';}';

        try{
            return new Function('$VM_data', code);
        } catch(e) {
            console.error(e);
        }
    };

    // 预编译对象赋值方法
    var compile_set = function(value) {
        try{
            return new Function('$VM_data', '$VM_value', '$VM_data.' + value + '=$VM_value');
        } catch(e) {
            console.error(e);
        }
    };

    // HTML 控件对象
    var VMHtml = function(data, elem, name, value) {
        this.data = data;
        this.elem = $(elem);
        this.tmpl = this.elem.find('script').html() || '';
        this.tmplRender = this.tmpl && template.compile(this.tmpl);
        this.oldValue = null;
        this.getData = compile_get(value);
        this.update();
    };
    VMHtml.prototype.update = function(name, value, oldValue, path) {
        var that = this;
        var data = that.data;
        var newValue;

        try {
            newValue = that.getData(data)();
        } catch(e) {
            console.error(e);
        }

        if(that.oldValue !== newValue){
            that.oldValue = newValue;
            if(that.tmpl){
                that.elem.html(that.tmplRender(data)).trigger('vm_update_html', newValue);
            } else {
                that.elem.html(String(newValue)).trigger('vm_update_html', newValue);
            }
        }
    };

    // 表单控件对象
    var VMForm = function(data, elem, name, value) {
        this.data = data;
        this.elem = $(elem);
        this.type = elem.type || undefined;
        this.oldValue = null;
        this.getData = compile_get(value);
        this.setData = compile_set(value);
        this.isModify = false;      // 防止循环赋值
        this.isFlag = true;         // 防止循环赋值,单选/复选组只遍历第一个
        this.init();
        this.update();
    };
    VMForm.prototype.init = function() {
        var that = this;
        var data = that.data;
        var elem = that.elem;
        var type = that.type;
        var name = elem.attr('name');

        var inputGroup;
        var setValue;

        var event_name = '';

        switch(type) {
            case 'select-one':
            case 'select-multiple': event_name = 'change.duplex'; break;
            case undefined:
            case 'submit':
            case 'reset':
            case 'button': break;
            case 'radio':
            case 'checkbox': event_name = 'click.duplex'; break;
            default: event_name = 'change.duplex';
        }

        // 表单元素双向绑定
        if(/^(radio|checkbox)$/.test(type)){
            if(name && type == 'radio'){
                // 如果是单选框组
                inputGroup = $('input[name="' + name + '"]');
                elem.off('.duplex').on(event_name, function() {
                    var val = inputGroup.filter(':checked').val();
                    that.isModify = true;
                    that.setData(data, val);
                });
                that.isFlag = (inputGroup[0] == elem.get(0));

                // 赋值方法
                setValue = function(newValue) {
                    inputGroup.each(function() {
                        this.checked = (this.value == newValue);
                        $(this).triggerHandler('vm_change');
                    });
                };
            } else if(name && type == 'checkbox'){
                // 如果是复选框组
                inputGroup = $('input[name="' + name + '"]');
                elem.off('.duplex').on(event_name, function() {
                    var val = [];
                    inputGroup.filter(':checked').each(function() {
                        val.push(this.value);
                    });
                    that.isModify = true;
                    that.setData(data, val);
                });
                that.isFlag = (inputGroup[0] == elem.get(0));

                // 赋值方法
                setValue = function(newValue) {
                    inputGroup.each(function() {
                        if(Public.isArray(newValue)){
                            this.checked = ($.inArray(this.value, newValue) > -1);
                        } else {
                            this.checked = (this.value == newValue);
                        }
                        $(this).triggerHandler('vm_change');
                    });
                };
            } else {
                // 单独的单选/复选
                elem.off('.duplex').on(event_name, function() {
                    var val = elem.prop('checked') ? elem.val() : '';
                    that.isModify = true;
                    that.setData(data, val);
                });

                // 赋值方法
                setValue = function(newValue) {
                    elem.prop('checked', (newValue == elem.val())).triggerHandler('vm_change');
                };
            }
        } else {
            // 文本框/下拉菜单
            event_name && elem.off('.duplex').on(event_name, function() {
                var val = elem.val();
                that.isModify = true;
                that.setData(data, val);
            });

            // 赋值方法
            setValue = function(newValue) {
                elem.val(String(newValue)).triggerHandler('vm_change');
            };
        }

        // update 方法
        that.update = function(name, value, oldValue, path) {
            var newValue;

            if(!that.isModify && that.isFlag){

                try {
                    newValue = that.getData(data)();
                } catch(e) {
                    console.error(e);
                }

                if((typeof newValue !== 'object' && that.oldValue !== newValue) || (Public.isArray(newValue) && that.oldValue !== String(newValue))){
                    that.oldValue = Public.isArray(newValue) ? String(newValue) : newValue;
                    setValue(newValue);
                }
            } else {
                that.isModify = false;
            }
        };
    };

    // CSS控件对象
    var VMCss = function(data, elem, name, value) {
        this.data = data;
        this.elem = $(elem);
        this.prop = name.replace('vm-css-', '');
        this.oldValue = null;
        this.getData = compile_get(value);
        this.update();
    };
    VMCss.prototype.update = function(name, value, oldValue, path) {
        var that = this;
        var data = that.data;
        var newValue;

        try {
            newValue = that.getData(data)();
        } catch(e) {
            console.error(e);
        }

        if(that.oldValue !== newValue){
            that.oldValue = newValue;
            that.elem.css(that.prop, String(newValue));
        }
    };

    // 属性控件对象
    var VMAttr = function(data, elem, name, value) {
        this.data = data;
        this.elem = $(elem);
        this.prop = name.replace('vm-attr-', '');
        this.oldValue = null;
        this.getData = compile_get(value);
        this.update();
    };
    VMAttr.prototype.update = function(name, value, oldValue, path) {
        var that = this;
        var data = that.data;
        var newValue;

        try {
            newValue = that.getData(data)();
        } catch(e) {
            console.error(e);
        }

        if(that.oldValue !== newValue){
            that.oldValue = newValue;
            that.elem.attr(that.prop, newValue);
        }
    };

    // 事件控件对象
    var VMEvent = function(data, elem, name, value) {
        this.data = data;
        this.elem = $(elem);
        this.event = name.replace('vm-on-', '') + '.vm_event';
        this.handler = null;
        this.getData = compile_get(value);
        this.update();
    };
    VMEvent.prototype.update = function(name, value, oldValue, path) {
        var that = this,
            data = that.data,
            handler;

        try {
            handler = that.getData(data);
        } catch(e) {
            console.error(e);
        }

        if(that.handler !== handler){
            that.handler = handler;

            try {
                that.elem.off(that.event).on(that.event, handler);
            } catch(e) {
                console.error(e);
            }
        }
    };

    // 对象监听方法 Observe.js
    var Observe = function (target, arr, callback) {
        if(!target.$observer)target.$observer=this;
        var $observer=target.$observer;
        var eventPropArr=[];
        if (Public.isArray(target)) {
            if (target.length === 0) {
                target.$observeProps = {};
                target.$observeProps.$observerPath = "#";
            }
            $observer.mock(target);

        }
        for (var prop in target) {
            if (target.hasOwnProperty(prop)) {
                if (callback) {
                    if (Public.isArray(arr) && $.inArray(prop, arr)) {
                        eventPropArr.push(prop);
                        $observer.watch(target, prop);
                    } else if (Public.isString(arr) && prop == arr) {
                        eventPropArr.push(prop);
                        $observer.watch(target, prop);
                    }
                } else{
                    eventPropArr.push(prop);
                    $observer.watch(target, prop);
                }
            }
        }
        $observer.target = target;
        if(!$observer.propertyChangedHandler)$observer.propertyChangedHandler=[];
        var propChanged=callback ? callback : arr;
        $observer.propertyChangedHandler.push({ all: !callback, propChanged: propChanged, eventPropArr: eventPropArr });
    };
    Observe.prototype = {
        "_getRootName": function(prop,path){
            if(path==="#"){
                return prop;
            }
            return path.split("-")[1];
        },
        "onPropertyChanged": function (prop, value,oldValue,target,path) {
            if(value!== oldValue && this.propertyChangedHandler){
                var rootName=this._getRootName(prop,path);
                for(var i=0,len=this.propertyChangedHandler.length;i<len;i++){
                    var handler=this.propertyChangedHandler[i];
                    if(handler.all||$.inArray(rootName, handler.eventPropArr)||rootName.indexOf("Array-")===0){
                        handler.propChanged.call(this.target, prop, value, oldValue, path);
                    }
                }
            }
            if (prop.indexOf("Array-") !== 0 && typeof value === "object") {
                this.watch(target,prop, target.$observeProps.$observerPath);
            }
        },
        "mock": function (target) {
            var self = this;
            ["concat", "every", "filter", "forEach", "indexOf", "join",
                "lastIndexOf", "map", "pop", "push",
                "reduce", "reduceRight", "reverse",
                "shift", "slice", "some", "sort", "splice", "unshift",
                "toLocaleString","toString","size"].forEach(function (item) {
                    target[item] = function () {
                        var old =  Array.prototype.slice.call(this,0);
                        var result = Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));
                        if (new RegExp("\\b" + item + "\\b").test(["concat", "pop", "push", "reverse", "shift", "sort", "splice", "unshift","size"].join(","))) {
                            for (var cprop in this) {
                                if (this.hasOwnProperty(cprop)  && !Public.isFunction(this[cprop])) {
                                    self.watch(this, cprop, this.$observeProps.$observerPath);
                                }
                            }
                            //todo
                            self.onPropertyChanged("Array-"+item, this, old,this, this.$observeProps.$observerPath);
                        }
                        return result;
                    };
                });
        },
        "watch": function (target, prop, path) {
            if (prop === "$observeProps"||prop === "$observer") return;
            if (Public.isFunction(target[prop])) return;
            if (!target.$observeProps) target.$observeProps = {};
            if(path !== undefined){
                target.$observeProps.$observerPath = path;
            }else{
                target.$observeProps.$observerPath = "#";
            }
            var self = this;
            var currentValue = target.$observeProps[prop] = target[prop];
            Object.defineProperty(target, prop, {
                get: function () {
                    return this.$observeProps[prop];
                },
                set: function (value) {
                    var old = this.$observeProps[prop];
                    this.$observeProps[prop] = value;
                    self.onPropertyChanged(prop, value, old, this, target.$observeProps.$observerPath);
                }
            });
            if (typeof currentValue == "object") {
                if (Public.isArray(currentValue)) {
                    this.mock(currentValue);
                    if (currentValue.length === 0) {
                        if (!currentValue.$observeProps) currentValue.$observeProps = {};
                        if (path !== undefined) {
                            currentValue.$observeProps.$observerPath = path;
                        } else {
                            currentValue.$observeProps.$observerPath = "#";
                        }
                    }
                }
                for (var cprop in currentValue) {
                    if (currentValue.hasOwnProperty(cprop)) {
                        this.watch(currentValue, cprop, target.$observeProps.$observerPath+"-"+prop);
                    }
                }
            }
        }
    };

    // MVVM 控件对象
    var MVVM = function(name, data) {
        this.name = name;        // 控件名称
        this.data = data;        // 控件数据
        this.onObserve = null;   // 对象修改触发事件
        this.element = $('[vm-controller="' + name + '"]');     // 控件父节点
        this.controllers = {};   // 控件节点数组
        this.init(name, data);
    };
    MVVM.prototype = {
        constructor: MVVM,

        // 更新视图
        accessor: function(name, value, oldValue, path) {
            var that = this;
            clearTimeout(that.timer);

            that.timer = setTimeout(function() {
                $.each(that.controllers, function(i, controller) {
                    // 调用所有控件的 update 方法
                    controller.update(name, value, oldValue, path);
                });
                // 更新事件
                Public.isFunction(that.onObserve) && that.onObserve();
            }, 50);
        },

        // 设置/封装data，绑定 set/get 事件
        factory: function(data) {
            var that = this;
            return new Observe(data, function (name, value, oldValue, path) {
                that.accessor(name, value, oldValue, path);
            });
        },

        // 查找所有 vm 控件
        scanNode: function() {
            var that = this;
            var controllers = that.controllers;

            var scanAttr = function(elem) {
                if(!elem.__global_scan_stamp__ && String(elem.nodeName).toLowerCase() !== 'script'){
                    elem.__global_scan_stamp__ = 'vm_' + Date.now() + '_' + Math.ceil(Math.random() * 1E6);

                    // 已扫描的属性列表
                    var attrList = [];

                    // 已扫描的控件
                    var vmList = [];

                    // 是否需要继续扫描
                    var isInRange = true;
                    $.each(elem.attributes || [], function(i, attr) {
                        var attr_name = $.trim(attr.name || '');
                        var scanStamp = 'attr_' + Date.now() + '_' + Math.ceil(Math.random() * 1E6);
                        var attr_type = attr_name.match(/^vm-(\w+)/);

                        if(attr_type && attr_type.length && attr_type[1]){
                            if(attr_type[1] == 'controller'){
                                isInRange = false;
                            } else {
                                switch(attr_type[1]) {
                                    // html控件
                                    case 'html': controllers[scanStamp] = new VMHtml(that.data, elem, attr_name, attr.value);  break;
                                    // 表单控件
                                    case 'value': controllers[scanStamp] = new VMForm(that.data, elem, attr_name, attr.value); break;
                                    // 样式控件
                                    case 'css': controllers[scanStamp] = new VMCss(that.data, elem, attr_name, attr.value); break;
                                    // 属性控件
                                    case 'attr': controllers[scanStamp] = new VMAttr(that.data, elem, attr_name, attr.value); break;
                                    // 事件控件
                                    case 'on': controllers[scanStamp] = new VMEvent(that.data, elem, attr_name, attr.value); break;
                                }
                                attrList.push(attr_name);
                                vmList.push(scanStamp);
                            }
                        }
                    });

                    // 遍历扫描子节点
                    var vmChildren = [];
                    if(isInRange){
                        $(elem).children().each(function() {
                            vmChildren = vmChildren.concat(scanAttr(this));
                        });
                    }

                    // 删除已扫描的属性
                    if(attrList.length) {
                        $(elem).removeAttr(attrList.join(' '));
                        // 子节点是否有VM控件
                        elem.__vm_children__ = vmChildren.concat();
                    }

                    return vmList.concat(vmChildren);
                } else {
                    return [];
                }
            };

            // 查找节点下所有控件
            that.element.each(function() {
                $(this).children().each(function() {
                    scanAttr(this);
                });
            });

            // 绑定HTML更改事件
            that.element.off('vm_update_html.vm').on('vm_update_html.vm', function(e) {
                e.preventDefault();
                e.stopPropagation();

                var elem = e.target;
                var vmChildren = elem.__vm_children__;
                setTimeout(function() {
                    // 删除不存在的节点
                    if(vmChildren && vmChildren.length){
                        $.each(vmChildren, function(i, key) {
                            delete controllers[key];
                        });
                    } else {
                        vmChildren = elem.__vm_children__ = [];
                    }

                    // 重新遍历子节点
                    $(elem).children().each(function() {
                        vmChildren = vmChildren.concat(scanAttr(this));
                    });
                    elem.__vm_children__ = vmChildren;
                }, 50);
            });
        },

        // 绑定控件及托管区域
        init: function() {
            var that = this;
            that.scanNode();                // 绑定事件与监听
            that.factory(that.data);                 // 绑定 set/get 事件
        }
    };

    return MVVM;
});