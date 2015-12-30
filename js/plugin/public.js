/*!
 * @作者: liyuelong1020@gmail.com
 * @日期: 2014-05-19
 * @备注: 公共方法
 */

define(function(require, exports) {

    var toString = Object.prototype.toString;
    var lang = {
        weekFormatFull: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        weekFormat: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    };

    return {
        // 判断是否为空对象
        isEmpty: function(obj) {
            if(obj && toString.call(obj) === "[object Object]"){
                for(var i in obj){
                    if(obj.hasOwnProperty(i)){
                        return false;
                    }
                }
            }
            return true;
        },
        // 判断是否是对象
        isObject: function (obj) {
            return toString.call(obj) === "[object Object]"
        },
        // 判断是否是字符串
        isString: function (obj) {
            return toString.call(obj) === "[object String]"
        },
        // 判断是否是数字
        isNumber: function (obj) {
            return toString.call(obj) === "[object Number]"
        },
        // 判断是否是日期
        isDate: function (obj) {
            return toString.call(obj) === "[object Date]"
        },
        // 判断是否是数组
        isArray: function (obj) {
            return toString.call(obj) === "[object Array]"
        },
        // 判断是否是boolean值
        isBoolean: function (obj) {
            return toString.call(obj) === "[object Boolean]"
        },
        // 判断是否是函数
        isFunction: function (obj) {
            return toString.call(obj) === "[object Function]"
        },
        // 数组去重
        unique: function(array) {
            var i = 0, tmp = {}, that = array.slice(0);
            array.length = 0;
            for( ; i < that.length; i++){
                if(!(that[i] in tmp)){
                    array[array.length] = that[i];
                    tmp[that[i]]=true;
                }
            }
            return array;
        },
        // 根据传入参数返回当前日期的前几天或后几天
        plusDate: function(n, format, isStamp) {
            var Public = this;
            var uom = new Date();
            uom.setDate(uom.getDate() + n);
            return Public.getDateString(uom, format, isStamp);
        },
        // 从字符串中获取日期对象
        getDateFromString: function(date) {
            var Public = this;
            if (date && (Public.isString(date) || Public.isNumber(date))) {

                var dataStr = date.toString().match(/\d{4}\W\d{1,2}\W\d{1,2}/g) || '';
                var _date;

                if(dataStr.length){

                    var _dataStr = dataStr[0].match(/\d{1,}/g);
                    _date = new Date(Number(_dataStr[0]), Number(_dataStr[1] - 1), Number(_dataStr[2]));
                    //_date.setHours(0,0,0,0);
                    return _date;

                } else {
                    _date = new Date();
                    _date.setTime(Number(date));
                    //_date.setHours(0,0,0,0);
                    return _date;
                }

            } else if (date && Public.isDate(date)) {
                //date.setHours(0,0,0,0);
                return date;
            } else {
                return null;
            }

        },
        // 获取特定格式日期字符串
        getDateString: function(date , format , isStamp) {
            var Public = this;
            var dTemp = Public.getDateFromString(date);

            if(arguments.length == 2){
                !Public.isString(format) ? isStamp = format : null;
            }
            format = Public.isString(format) ? format : 'Y-M-D w';

            if(dTemp){

                if(!!isStamp){
                    return Math.floor(dTemp.getTime() / 1000);
                } else {

                    var year = String(dTemp.getFullYear());                // 年
                    var mon = Number(dTemp.getMonth()) + 1;                // 月
                    var date = Number(dTemp.getDate());                    // 日
                    var day = lang.weekFormatFull[dTemp.getDay()];         // 星期
                    var dayMin = lang.weekFormat[dTemp.getDay()];          // 星期缩写

                    var hours = dTemp.getHours();                          // 时
                    var minutes = dTemp.getMinutes();                      // 分
                    var seconds = dTemp.getSeconds();                      // 秒

                    return format
                        .replace(/y+/g, year.substr(2, 2))
                        .replace(/m+/g, mon)
                        .replace(/d+/g, date)
                        .replace(/w+/g, dayMin)
                        .replace(/Y+/g, year)
                        .replace(/M+/g, mon < 10 ? '0' + mon: mon)
                        .replace(/D+/g, date < 10 ? '0' + date: date)
                        .replace(/H+/ig, hours < 10 ? '0' + hours: hours)
                        .replace(/I+/ig, minutes < 10 ? '0' + minutes: minutes)
                        .replace(/S+/ig, seconds < 10 ? '0' + seconds: seconds)
                }

            } else {
                return '';
            }
        },
        // 获取一个月的天数
        getMonthDays: function(yy, mm) {
            yy = Number(yy), mm = Number(mm);
            var getCheckYear = function(yy) {
                if (yy % 4 !== 0) {
                    return false;
                }
                if (yy % 100 === 0 && yy % 400 !== 0) {
                    return false;
                }
                return true;
            };

            if (getCheckYear(yy) && mm === 2) {
                return 29;
            }

            if (!getCheckYear(yy) && mm === 2) {
                return 28;
            }

            if (mm === 4 || mm === 6 || mm === 9 || mm === 11) {
                return 30;
            }

            return 31;
        },
        // 获取日期相差天数
        getDaysNum: function (time1 , time2){

            var Public = this;
            var _times1 = Public.getDateFromString(time1);
            var _times2 = Public.getDateFromString(time2);

            if(_times1 && _times2){
                _times1.setHours(0,0,0,0);
                _times2.setHours(0,0,0,0);
                return parseInt((_times2.getTime() - _times1.getTime()) / 8.64E7);
            } else {
                return 0;
            }

        },
        // 获取表单数据
        getFormData: function(selector) {
            var Public = this;
            var form = '[object HTMLFormElement]' == Object.prototype.toString.call(selector) ? selector :
                typeof selector == 'string' ? document.getElementById(selector) : null;
            var formVal = {};
            var parts = [];

            if(form){
                for (var i = form.elements.length; i--;) {
                    var fields = form.elements[i];
                    if(!fields.disabled){
                        switch (fields.type) {
                            case 'select-one':
                            case 'select-multiple':
                                for (var k = 0, opLen = fields.options.length; k < opLen; k++) {
                                    var option = fields.options[k];
                                    if (option.selected) {
                                        var hasValue = option.hasAttribute ? option.hasAttribute('value') : option.attributes['value'].specified;
                                        var optionVal = hasValue ? option.value : option.text;
                                        parts.push({
                                            type: fields.type,
                                            name: fields.name || '',
                                            value: optionVal || ''
                                        });
                                    }
                                }
                                break;
                            case undefined:
                            case 'submit':
                            case 'reset':
                            case 'button': break;
                            case 'radio':
                            case 'checkbox':
                                if (!fields.checked) {
                                    break;
                                }
                            default : parts.push({
                                type: fields.type,
                                name: fields.name || '',
                                value: fields.value || ''
                            });
                        }
                    }
                }

                for (var j = parts.length; j--;) {
                    var name = parts[j].name;

                    if(name){

                        var value = (function(val) {
                            if (val.length < 12 && val.search(/\d{4}\W\d{1,2}\W\d{1,2}/i) > -1) {
                                val = Public.getDateString(val, 'Y-M-D');
                            }
                            return val;
                        })(parts[j].value);

                        if (formVal[name] === undefined) {
                            if(/^checkbox|select\-multiple$/ig.test(parts[j].type)){
                                formVal[name] = [];
                                formVal[name].push(value);
                            } else {
                                formVal[name] = value;
                            }
                        } else if (Public.isString(formVal[name])) {
                            formVal[name] = [formVal[name]];
                            formVal[name].push(value);
                        } else if (Public.isArray(formVal[name])) {
                            formVal[name].push(value);
                        }

                    }
                }

                return formVal;
            } else {
                return null;
            }
        },
        // 根据参数名获取URL中参数值，URL中没有该参数则返回null
        getSearchParam: function(name, url) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
            var r = (url || location.search.substr(1)).match(reg);
            if (r !== null) {
                return decodeURI(r[2]);
            }
            return '';
        },
        // 将查询字符串转换成json对象
        parerSearchString: function(paramStr) {
            var param = {};
            var searchParam = (paramStr || '').split('&');
            $.each(searchParam, function(i, str) {
                var index = str.indexOf('=');
                if(index > -1){
                    var name = str.substr(0, index);
                    var value = str.substr(index + 1);
                    name && value && (param[name] = value);
                }
            });
            return param;
        },
        // 将字符串转换成json对象
        parseJSON: function(data) {
            if(data && toString.call(data) === "[object String]"){
                if ( window.JSON && window.JSON.parse ) {
                    try{
                        return window.JSON.parse(data);
                    } catch(e) {
                        return null;
                    }

                }
                if ( data === null ) {
                    return data;
                }
                if (typeof data === "string") {
                    if (data) {
                        if (/^[\],:{}\s]*$/.test( data.replace(/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, "@" )
                            .replace(/"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g, "]" )
                            .replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {
                            return (new Function("return " + data))();
                        }
                    }
                }
            } else {
                return null;
            }
        },
        // 将json对象转换成字符串
        serializeJSON: function(object) {
            if(object && (toString.call(object) === "[object Object]" || toString.call(object) === "[object Array]")){
                if(window.JSON && window.JSON.stringify){
                    try{
                        return window.JSON.stringify(object);
                    } catch(e) {
                        return null;
                    }
                } else {
                    var sA = [];
                    (function(o) {
                        var isObject = true;
                        if (o instanceof Array) {
                            isObject = false;
                        } else if (typeof o != 'object') {
                            if (typeof o == 'string') {
                                sA.push('"' + o + '"');
                            } else {
                                sA.push(o);
                            }
                            return;
                        }
                        sA.push(isObject ? '{' : '[');
                        for (var i in o) {
                            if (o.hasOwnProperty(i) && i != 'prototype') {
                                if (isObject) {
                                    sA.push('"' + i + '":');
                                }
                                arguments.callee(o[i]);
                                sA.push(',');
                            }
                        }
                        sA.push(isObject ? '}' : ']');
                    })(object);

                    return sA.slice(0).join('')
                        .replace(/,\}/g, '}')
                        .replace(/,\]/g, ']');
                }
            } else {
                return '';
            }
        }
    };
});