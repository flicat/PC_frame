/*!
 * @作者: liyuelong1020@gmail.com
 * @日期: 2014/02/19
 * @备注: 日历对象生成方法
 * @param year int|array
 * @param month int|array
 * @return object|array
 */
define(function(require, exports) {

    var Public = require('public');

    // 日期对象
    var Days = function(year, month, date) {
        var nowDate = new Date();
        nowDate.setHours(0,0,0,0);

        if(arguments.length == 1 && Public.isDate(arguments[0])){
            this.stamp = arguments[0];
        } else {
            this.stamp = new Date(year, month - 1, date);      // 日期对象
        }

        this.stamp.setHours(0,0,0,0);

        this.year = this.stamp.getFullYear();              // 年
        this.month = this.stamp.getMonth() + 1;            // 月
        this.date = this.stamp.getDate();                  // 日
        this.day = this.stamp.getDay();                    // 星期
        this.outdate = this.stamp.getTime() - nowDate.getTime() < 0;     // 是否是过去时间
        this.isToday = !!(this.stamp.getTime() == nowDate.getTime());    // 是否是今天
    };
    Days.prototype = {
        constructor: Days,
        // 上一天
        prevDay: function() {
            return new Days(this.year, this.month, this.date - 1);
        },
        // 下一天
        nextDay: function() {
            return new Days(this.year, this.month, this.date + 1);
        },
        // 返回日期字符
        toString: function(format) {
            var that = this;
            format = Public.isString(format) ? format : 'Y-M-D';
            return format
                .replace(/y+/g, String(that.year).substr(2, 2))
                .replace(/m+/g, that.month)
                .replace(/d+/g, that.date)
                .replace(/Y+/g, that.year)
                .replace(/M+/g, that.month < 10 ? '0' + that.month: that.month)
                .replace(/D+/g, that.date < 10 ? '0' + that.date: that.date);
        }
    };

    // 月份对象
    var Months = function(year, month) {
        // 默认为当前日期
        var date = new Date();
        date.setDate(1);
        Number(year) && date.setFullYear(year);
        date.setMonth(month - 1);

        this.month = date.getMonth() + 1;                               // 月份
        this.year = date.getFullYear();                                 // 月份
        this.daysNum = Public.getMonthDays(this.year, this.month);      // 月天数
        this.date = [];                                                 // 日期数组

        for(var i = 1; i <= this.daysNum; i++){
            var day = new Days(this.year, this.month, i);
            this.date.push(day);
            if(day.isToday){
                this.today = day;
            }
        }
    };
    Months.prototype = {
        constructor: Months,
        // 按周返回月份日期 参数：设置每星期的第一天为星期几 0 - 6
        getWeek: function(startDay) {
            var week = [];                       // 星期数组
            var weekItem = [];                   // 每星期数组
            var date = this.date;                // 该月日期数组
            // 默认星期天为每周第一天
            startDay = Number(startDay) ? (startDay < 0 || startDay > 6) ? 0 : startDay : 0;
            week.push(weekItem);
            // 填补上一月日期
            if(date[0].day != startDay){
                var addLength = startDay < date[0].day ? date[0].day - startDay : 7 - startDay + date[0].day;
                var addDate = date[0];
                while(addLength) {
                    addDate = addDate.prevDay();
                    weekItem.unshift(addDate);
                    addLength--;
                }
            }
            // 将日期分组至每周
            for(var i = 0; i < date.length; i++){
                weekItem.push(date[i]);
                if(weekItem.length == 7 && i + 1 != date.length){
                    weekItem = [];
                    week.push(weekItem);
                } else if(i + 1 == date.length){
                    // 填补下一月日期
                    addLength = 7 - weekItem.length;
                    addDate = date[i];
                    while(addLength) {
                        addDate = addDate.nextDay();
                        weekItem.push(addDate);
                        addLength--;
                    }
                }
            }
            return week;
        },
        // 上一月
        prevMonth: function() {
            return new Months(this.year, this.month - 1);
        },
        // 下一月
        nextMonth: function() {
            return new Months(this.year, this.month + 1);
        }
    };

    return {
        // 获取日历对象
        getDate: function(year, month) {
            var monthObj = [];

            // 默认为当前月份
            month = Public.isArray(month) ? month : !isNaN(Number(month)) ? [month] : [(new Date()).getMonth() + 1];

            for(var i = 0; i < month.length; i++){
                monthObj.push(new Months(year, month[i]));
            }

            return monthObj;
        },
        // 获取日期范围
        getDateRange: function(start, end) {
            var rangeArr = [];
            var startDate = Public.getDateFromString(start);
            var endDate = Public.getDateFromString(end);
            if(Public.isDate(startDate) && Public.isDate(endDate) && startDate <= endDate){
                var startDay = new Days(startDate);
                var endDay = new Days(endDate);
                while(startDay.toString() != endDay.toString()) {
                    rangeArr.push(startDay);
                    startDay = startDay.nextDay();
                }
                rangeArr.push(endDay);
            }
            return rangeArr;
        }
    }
});