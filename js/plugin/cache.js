/*!
 * @作者: liyuelong1020@gmail.com
 * @日期: 2014-05-19
 * @备注: 缓存方法
 *
 * setLocalData(@name, @value)       // 设置本地缓存数据 return undefined
 * getLocalData(@name)               // 获取本地缓存数据 return String
 * delLocalData(@name)               // 删除本地缓存数据 return undefined
 * setSessionData(@name, @value)     // 设置临时缓存数据 return undefined
 * getSessionData(@name)             // 获取临时缓存数据 return String
 * delSessionData(@name)             // 删除临时缓存数据 return undefined
 * addStorageEvent(@handler)         // 存储事件        return undefined
 *
 * @name   // 缓存名称(String)
 * @value  // 需要缓存的数据
 * @handler // 存储事件回调函数 (Function)
 */

define(function(require, exports, module) {
    var Public = require('public');

    var ls = window.localStorage;
    var ss = window.sessionStorage;

    var Cache = function() {
        var that = this;
        // 临时数据缓存
        var cacheData = {};
        // 设置本地缓存数据
        that.setLocalData = function(name, value) {
            var _value = (Public.isObject(value) || Public.isArray(value)) ? Public.serializeJSON(value) : String(value);
            cacheData[name] = value;
            if(ls){
                ls[name] = _value;
            } else {
                var exDate = new Date();
                exDate.setDate(exDate.getDate() + 365);
                document.cookie = name + "=" + _value + ";expires=" + exDate.toGMTString();
            }
        };
        // 获取本地缓存数据
        that.getLocalData = function(name) {
            if(cacheData[name]){
                return cacheData[name];
            } else if(ls){
                return ls[name] || null;
            } else if(document.cookie.length > 0){
                var kwsStart = document.cookie.indexOf(name + "=");
                var _value = null;
                if (kwsStart != -1){
                    kwsStart = kwsStart + name.length + 1;
                    var kwsEnd = document.cookie.indexOf(";", kwsStart);
                    if (kwsEnd == -1){
                        kwsEnd = document.cookie.length;
                    }
                    return document.cookie.substring(kwsStart, kwsEnd) || null;
                }
            }
            return '';
        };
        // 删除本地缓存数据
        that.delLocalData = function(name) {
            delete cacheData[name];
            if(ls){
                ls.removeItem(name);
            } else {
                var exDate = new Date(0);
                document.cookie = name + "=0;expires=" + exDate.toGMTString();
            }
        };
        // 设置临时缓存数据
        that.setSessionData = function(name, value) {
            var _value = Public.isString(value) ? value : (Public.isObject(value) || Public.isArray(value)) ? Public.serializeJSON(value) : '';
            cacheData[name] = value;
            if(ss){
                ss[name] = _value;
            } else {
                document.cookie = name + "=" + _value;
            }
        };
        // 获取临时缓存数据
        that.getSessionData = function(name) {
            if(cacheData[name]){
                return cacheData[name];
            } else if(ss) {
                return ss[name] || null;
            } else if(document.cookie.length > 0){
                var kwsStart = document.cookie.indexOf(name + "=");
                var _value = null;
                if (kwsStart != -1){
                    kwsStart = kwsStart + name.length + 1;
                    var kwsEnd = document.cookie.indexOf(";", kwsStart);
                    if (kwsEnd == -1){
                        kwsEnd = document.cookie.length;
                    }
                    return document.cookie.substring(kwsStart, kwsEnd) || null;
                }
            }
            return null;
        };
        // 删除临时缓存数据
        that.delSessionData = function(name) {
            delete cacheData[name];
            if(ss){
                ss.removeItem(name);
            } else {
                var exDate = new Date(0);
                document.cookie = name + "=0;expires=" + exDate.toGMTString();
            }
        };
    };
    // 存储事件
    Cache.prototype.addStorageEvent = function(handler) {
        if(ls && Public.isFunction(handler)){
            //IE注册在document上
            if(document.attachEvent && !window.opera) {
                document.attachEvent("onstorage", handler);
            }
            //其他注册在window上
            else {
                window.addEventListener("storage", handler, false);
            }
        }
    };

    return Cache;
});