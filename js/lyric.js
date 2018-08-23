(function (window) {
	function Lyric(path){
		return new Lyric.prototype.init(path);
	}
	Lyric.prototype = {
		constructor:Lyric,
		init:function(path){
			this.path = path;
		},
		times:[],
		lyrics:[],
		index:-1,
		loadLyric:function (callBack) {
			var $this = this;
			$.ajax({
				url:$this.path,
				dataType:"text",
				success:function(data){
					$this.parseLyric(data);
					callBack();
				},
				error:function (e) {
					console.log(e);
				}
			})
		},
		parseLyric:function(data){
			var $this = this;
			//清空上一曲歌词信息
			$this.times = [];
			$this.lyrics = [];
			var array = data.split("\n");
			var timeReg = /\[(\d*:\d*\.\d*)\]/
			$.each(array,function(index,ele){
				var lrc = ele.split("]")[1];
				if(lrc.length == 1){
					return true;
				}
				$this.lyrics.push(lrc);

				//处理时间
				var res = timeReg.exec(ele);
				// console.log(res);
				if(res == null) return true;
				var timeStr = res[1];
				// console.log(timeStr);
				var res2 = timeStr.split(":");
				var min = parseInt(res2[0])*60;
				var sec = parseFloat(res2[1]);
				var time = parseFloat(Number(min+sec).toFixed(2));
				$this.times.push(time);
			});
		},
		currentIndex:function (currentTime) {
			if(currentTime >= this.times[0]){
				this.index++;
				this.times.shift();
			}
			return this.index;
		}
	}
	Lyric.prototype.init.prototype=Lyric.prototype;
	window.Lyric = Lyric;
})(window);