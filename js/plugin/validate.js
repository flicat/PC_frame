/*!
 * @Author: liyuelong1020@gmail.com
 * @日期: 2013/01/05
 * @备注: 表单验证
 * @版本： 4.0.2
 */

define(function(require, exports) {

    var lang = {
        'empty': '不能为空！',
        'email': '电子邮箱格式错误！',
        'phone': '手机号码格式错误！',
        'tell': '电话号码格式错误！',
        'number': '请输入数字！',
        'integer': '请输入整数！',
        'url': '请输入正确的网址！',
        'password': '密码格式错误，请输入6到16个字符，必须包含数字和字母！',
        'checkval': '两次输入的密码不一致！',
        'error': '格式错误！',
        'register': '该账号已经注册！',
        'verify': '验证码错误！',
        'cn': '请输入中文！',
        'len': '长度不符！',
        'minlen': '长度不够！',
        'maxlen': '长度太长！',
        'confpwd': '两次输入的密码不一致！',
        'creditcard': '信用卡格式错误！',
        'succeed': 'OK！'
    };

    /**
     * 文本格式验证正则表达式
     */
    var regex = {
        email: /^(\w)+(\W\w+)*@(\w)+(-\w+)*((\.\w+)+)$/,             // email
        phone: /^1[3|4|5|8][0-9]\d{8,8}$/,                           // 手机号码
        tell: /\d{3}-\d{8}|\d{4}-\d{7,8}/,                           // 固话
        number: /^[\-\+]?((\d+)([\.,](\d+))?|([\.,](\d+))?)$/,       // 数字
        integer: /^[\-\+]?((\d+))$/,                                 // 整数
        date: /^\d{4}\W\d{1,2}\W\d{1,2}$/,                           // 日期
        time: /^\d{1,2}:\d{1,2}$/,                                   // 时间
        cn: /[^u4e00-u9fa5]/,                                        // 中文
        plus: /^[\+]?((\d+)([\.,](\d+))?|([\.,](\d+))?)$/,           // 正数
        url: /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))+/,         // 链接
        password: /^[\w~!@#$%^&*()_+{}:"<>?\-=[\];\',.\/]{6,16}$/    // 密码
    };

    /*
     * 表单验证规则
     */
    var testRule = {
        // 验证为空
        empty: function(inputVal) {
            return !!inputVal;
        },

        // 验证重复密码
        confpwd: function(inputVal, rule, input) {
            var ele = /confpwd\((.*)\)/.exec(rule)[1];
            return !inputVal || inputVal == $(input.get(0).form).find(ele).val();
        },

        // 验证信用卡
        creditcard: function(inputVal) {
            if(!inputVal){
                return true;
            } else {
                // 取出最后一位（与luhm进行比较）
                var lastNum = inputVal.substr(inputVal.length - 1, 1);

                // 前15或18位
                var first15Num = inputVal.substr(0, inputVal.length - 1);
                var newArr = [];

                // 前15或18位倒序存进数组
                for (var i = first15Num.length - 1; i > - 1; i--) {
                    newArr.push(first15Num.substr(i, 1));
                }
                var arrJiShu = [];  // 奇数位*2的积 <9
                var arrJiShu2 = []; // 奇数位*2的积 >9

                var arrOuShu = [];  // 偶数位数组

                for (var j = 0; j < newArr.length; j++) {
                    if ((j + 1) % 2 == 1) {
                        // 奇数位
                        if (parseInt(newArr[j]) * 2 < 9) {
                            arrJiShu.push(parseInt(newArr[j]) * 2);
                        } else {
                            arrJiShu2.push(parseInt(newArr[j]) * 2);
                        }
                    } else {
                        // 偶数位
                        arrOuShu.push(newArr[j]);
                    }
                }

                var jishu_child1 = []; // 奇数位*2 >9 的分割之后的数组个位数
                var jishu_child2 = []; // 奇数位*2 >9 的分割之后的数组十位数

                for (var h = 0; h < arrJiShu2.length; h++) {
                    jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
                    jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
                }

                var sumJiShu = 0;       // 奇数位*2 < 9 的数组之和
                var sumOuShu = 0;       // 偶数位数组之和
                var sumJiShuChild1 = 0; // 奇数位*2 >9 的分割之后的数组个位数之和
                var sumJiShuChild2 = 0; // 奇数位*2 >9 的分割之后的数组十位数之和
                var sumTotal = 0;

                for (var m = 0; m < arrJiShu.length; m++) {
                    sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
                }

                for (var n = 0; n < arrOuShu.length; n++) {
                    sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
                }

                for (var p = 0; p < jishu_child1.length; p++) {
                    sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
                    sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
                }

                // 计算总和
                sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu) + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2);

                // 计算Luhm值
                var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
                var luhm = 10 - k;

                return !!(lastNum == luhm);
            }

        },

        // 文本格式验证
        textFormat: function(inputVal, rule) {

            return !inputVal || regex[rule] && regex[rule].test(inputVal);
        }
    };

    // 提示信息
    var tips = {

        getTipElem: function(inputWrap) {
            if (inputWrap.find('.help-block').size()) {
                return inputWrap.find('.help-block');
            } else {
                var span = $('<span class="help-block"></span>');
                inputWrap.append(span);
                return span;
            }
        },

        showTip: function(inputWrap, tips, tipText, isChecked) {
            if (isChecked) {
                tips.empty().hide();
                inputWrap.removeClass('has-error has-success');
            } else {
                tips.html(tipText).show();
                inputWrap.removeClass('has-success has-error').addClass('has-error');
            }
        },

        show: function(formEle, status) {
            var that = this;
            var inputWrap = formEle.parent().parent();

            var tips = that.getTipElem(inputWrap);

            switch (status) {
                case 'succeed': that.showTip(inputWrap, tips, lang.succeed, true);
                    break;
                case 'empty': that.showTip(inputWrap, tips, lang.empty, false);
                    break;
                case 'email': that.showTip(inputWrap, tips, lang.email, false);
                    break;
                case 'phone': that.showTip(inputWrap, tips, lang.phone, false);
                    break;
                case 'tell': that.showTip(inputWrap, tips, lang.tell, false);
                    break;
                case 'number': that.showTip(inputWrap, tips, lang.number, false);
                    break;
                case 'integer': that.showTip(inputWrap, tips, lang.integer, false);
                    break;
                case 'url': that.showTip(inputWrap, tips, lang.url, false);
                    break;
                case 'password': that.showTip(inputWrap, tips, lang.password, false);
                    break;
                case 'confpwd': that.showTip(inputWrap, tips, lang.confpwd, false);
                    break;
                case 'creditcard': that.showTip(inputWrap, tips, lang.creditcard, false);
                    break;
                default: that.showTip(inputWrap, tips, lang.error, false);
                    break;
            }

        },
        hide: function(formEle) {
            var inputWrap = formEle.parent().parent();
            var tips = this.getTipElem(inputWrap);
            this.showTip(inputWrap, tips, lang.succeed, true);
        }
    };
    // 删除提示信息
    var hideTips = function(formEle) {

        var inputWrap = formEle.parent().parent();

        var tips = (function() {
            if (inputWrap.find('.help-block').size()) {
                return inputWrap.find('.help-block');
            } else {
                var span = $('<span class="help-block"></span>');
                inputWrap.append(span);
                return span;
            }
        })();

        tips.empty().hide();
        inputWrap.removeClass('has-error').removeClass('has-success');
    };

    /**
     * 表单验证函数
     */
    var checkFormEle = function(formEle, noMessage) {

        var _ruleArr = formEle.attr('data-validate').split(','),   // 表单验证规则
            _val = formEle.val(),                                  // 表单值
            _checkResult = true,                  // 验证结果，默认验证是否为空
            _checkable = true;

        var checkTips = function(ele, rule) {
            if(!!noMessage){
                return true;
            } else {
                tips.show(ele, rule);
            }
        }

        formEle.each(function() {

            var type = this.type || '';
            switch(type){
                case 'radio':
                case 'checkbox': _checkResult = $('input[name="' + this.name + '"]:checked').size();
                case 'select-one':
                case 'select-mutiple': _checkable = false;
            }

        });

        if(_checkable){

            for(var i = 0, aLen = _ruleArr.length; i < aLen; i++){

                var _checkingRule = null;

                if(_ruleArr[i]){

                    var _rule = _ruleArr[i].split('|');

                    for(var r = 0, rLen = _rule.length; r < rLen; r++){

                        var _ruleItem = _rule[r];

                        if(_ruleItem){

                            _checkingRule = _ruleItem;

                            if (_ruleItem.search(/confpwd/) > -1) {
                                _checkingRule = 'confpwd';
                            }

                            var testFun = testRule[_checkingRule] || testRule.textFormat;

                            _checkResult = testFun(_val, _ruleItem, formEle);

                            if(_checkResult){
                                break;
                            }

                        }
                    }

                }

                if(!_checkResult){
                    checkTips(formEle, _checkingRule);
                    return _checkResult;
                }

            }

        }

        if(_checkResult && _checkResult != 'waiting'){
            checkTips(formEle, 'succeed');
        }

        return _checkResult;

    };

    /**
     * 表单验证
     */
    $.fn.formCheck = function() {

        var inputEleArr = $(this).find('[data-validate]:visible'),       // 表单需要验证的元素集合
            checkResult = true;                                  // 验证结果

        inputEleArr.filter(':enabled').each(function() {

            var _self = $(this);

            if(checkResult) {                                    // 如果没有验证失败则继续给checkResult赋值，直到验证失败
                checkResult = checkFormEle(_self);
                if(!checkResult){
                    _self.focus();                            // 如果验证失败则把焦点移动到该节点
                }
            }

        });

        return checkResult;

    };

    // 检测表单是否通过验证
    $.fn.isCheck = function(showResult) {

        var form = $(this);

        var inputEleArr = (function() {
                if(!arguments.callee.input_ele){
                    arguments.callee.input_ele = form.find('[data-validate]:visible');
                }
                return arguments.callee.input_ele;
            })(),
            checkResult = true;                                  // 验证结果

        inputEleArr.filter(':enabled').each(function() {

            var _self = $(this);

            if(checkResult) {                                    // 如果没有验证失败则继续给checkResult赋值，直到验证失败
                checkResult = showResult ? checkFormEle(_self) : checkFormEle(_self, true);
                if(!checkResult && showResult){
                    _self.focus();                            // 如果验证失败则把焦点移动到该节点
                }
            }

        });

        return checkResult;

    };

    /**
     * 给表单元素绑定验证
     */
    $.fn.bindCheck = function(checkBtn, checkEvent, sessecCall, errorCall) {

        var _form = $(this),
            inputEleArr = _form.find('[data-validate]:visible');     // 表单需要验证的元素集合

        inputEleArr.filter(':enabled').each(function() {

            var _self = this;
            var _type = this.type;                                       // 表单类型
            var _event = 'blur.validate';                                // 默认绑定blur事件

            if(_type == 'select-one' || _type == 'select-mutiple'){      // 如果是下拉菜单则绑定change事件
                _event = 'change.validate';
            }

            $(_self).unbind(_event).bind(_event, function() {     // 绑定验证事件
                checkFormEle($(_self));                              // 表单验证函数
            });

            tips.hide($(_self));
        });

        if(checkBtn){

            checkEvent = checkEvent || 'click.check_form';
            sessecCall = sessecCall || function(){};
            errorCall = errorCall || function(){};

            $(checkBtn).unbind(checkEvent).bind(checkEvent, function(e) {

                e.preventDefault();

                var isCheck = _form.formCheck();

                if(isCheck){
                    sessecCall();
                } else {
                    errorCall();
                }

            });

        }

    };

});
