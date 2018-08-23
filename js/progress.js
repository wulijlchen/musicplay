(function(window){
	function Progress($progressBar,$progressLine,$progressDot){
		return new Progress.prototype.init($progressBar,$progressLine,$progressDot);
	}
	Progress.prototype = {
		constructor:Progress,
		init:function($progressBar,$progressLine,$progressDot){
			this.$progressBar = $progressBar;
			this.$progressLine = $progressLine;
			this.$progressDot = $progressDot;
		},
		isMove:false,
		progressClick:function(callBack){
			var $this = this; //此时的this是progress
			//监听背景的点击
			this.$progressBar.click(function(event){
				var normalLeft = $(this).offset().left;
				var eventLeft = event.pageX;
				$this.$progressLine.css("width",eventLeft-normalLeft);
				$this.$progressDot.css("left",eventLeft-normalLeft);
				//进度条比例
				var value = (eventLeft-normalLeft)/$(this).width();
				callBack(value);
			});
		},
		progressMove:function(callBack){
			var $this = this;
			//背景距离窗口的距离
			var normalLeft = this.$progressBar.offset().left;
			var barWidth = this.$progressBar.width();
			var eventLeft;
			//监听鼠标的按下事件
			this.$progressBar.mousedown(function () {
				$this.isMove = true;
				//监听鼠标移动事件
				$(document).mousemove(function(event){
					//获取点击位置距离窗口的位置
					eventLeft = event.pageX;
					var offset = eventLeft - normalLeft;
					if(offset >= 0 && offset <= barWidth){
						//设置前景宽度
						$this.$progressLine.css("width",offset);
						$this.$progressLine.css("left",offset);
					}
				});
			});
			//监听鼠标抬起事件
			$(document).mouseup(function(){
				$(document).off("mousemove");
				$this.isMove = false;
				//进度条比例
				var value = (eventLeft-normalLeft)/barWidth;
				callBack(value);
			});
		},
		setProgress:function (value) {
			if(this.isMove) return;
			if(value <0 || value>100) return;
			this.$progressLine.css({
				width:value+"%"
			});
			this.$progressDot.css({
				left:value+"%"
			});
		}
	}
	Progress.prototype.init.prototype = Progress.prototype;
	window.Progress = Progress;
})(window);