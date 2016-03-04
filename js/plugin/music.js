/*!
 * @author liyuelong1020@gmail.com
 * @date 2015-10-28
 * @version 2.0.0
 * @description 音乐插件
 */

define(function (require, exports) {

    if(typeof Audio === 'undefined'){
        return function(){
            this.isPlay = false;
            this.play =  function() {};
            this.pause =  function() {};
            this.stop =  function() {};
            this.onPlay =  function() {};
            this.onStop =  function() {};
        };
    }

    // 新建图标
    var initMusicIcon = function() {
        var icon = document.createElement('i');
        icon.className = 'icon-music';
        document.body.appendChild(icon);
        return icon;
    };

    var Music = function(src, loop, autoPlay) {
        this.isPlay = false;
        this.autoPlay = !!autoPlay;

        // 页面背景音乐
        this.audio = new Audio(src);
        this.audio.loop = !!loop;
        this.audio.autoplay = false;

        // 音乐播放图标
        this.icon = initMusicIcon();

        this.init();
    };
    Music.prototype = {
        constructor: Music,
        play: function() {
            this.isPlay = true;
            this.audio.play();
        },
        pause: function() {
            this.isPlay = false;
            this.audio.pause();
        },
        stop: function() {
            this.isPlay = false;
            this.audio.pause();
            this.audio.previousTime = 0;
            this.audio.currentTime  = 0;
        },
        // 修改播放图标
        setPlayState: function() {
            this.icon.className = 'icon-music icon-music-animation';
            this.onPlay();
        },
        // 修改播放图标
        setStopState: function() {
            this.icon.className = 'icon-music';
            this.onStop();
        },
        onPlay: function() {},
        onStop: function() {},

        init: function() {
            var that = this;

            that.audio.addEventListener('playing', function() {
                that.setPlayState();
            }, false);      // 开始播放事件
            that.audio.addEventListener('ended', function() {
                that.setStopState();
            }, false);        // 结束播放事件
            that.audio.addEventListener('pause', function() {
                that.setStopState();
            }, false);        // 暂停事件

            if(that.autoPlay){
                that.play();
            }

            // 点击播放/暂停音乐
            that.icon.addEventListener('touchend', function(e) {
                e.stopPropagation();
                e.preventDefault();

                if(that.isPlay){
                    that.stop();
                } else {
                    that.play();
                }
            }, false);

        }
    };

    return Music;
});