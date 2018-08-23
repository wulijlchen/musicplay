$(function(){
	//0.自定义滚动条
	$(".content_list").mCustomScrollbar();

	var $audio=$("audio");
	var player= new Player($audio) ;
	var progress;
	var voiceProgress;
	var lyric;

	//1.加载歌曲列表
	getPlayerList();
	function getPlayerList() {
		$.ajax({
			url:"./source/musiclist.json",
			dataType:"json",
			success:function(data){
				player.musicList=data;
				var $musicList=$(".content_list ul");
				$.each(data,function(index, el) {
					var $item=createMusicItem(index,el);
					$musicList.append($item);
				});
				initMusicInfo(data[0]);
				initMusicLyric(data[0]);
			},
			error:function(e){
				console.log(e);
			}
		})
		
		
	}

	//2.初始化歌曲信息
	function initMusicInfo(music){
		var $musicImage=$(".song_info_pic img");
		var $musicName=$(".song_info_name a");
		var $musicSinger=$(".song_info_singer a");
		var $musicAblum=$(".song_info_ablum a");
		var $musicProgressName=$(".music_progress_name");
		var $musicProgressTime=$(".music_progress_time");
		var $musicBg=$(".mask_bg");

		$musicImage.attr("src",music.cover);
		$musicName.text(music.name);
		$musicSinger.text(music.singer);
		$musicAblum.text(music.album);
		$musicProgressName.text(music.name+"/"+music.singer);
		$musicProgressTime.text("00:00 /"+music.time);
		$musicBg.css("background","url('"+music.cover+"')");
	}

	//3.初始化歌词信息
	function initMusicLyric(music){
		lyric = new Lyric(music.link_lrc);
		var $lyricContainer=$(".song_lyric");
		//清空上一首歌词信息
		$lyricContainer.html("");
		lyric.loadLyric(function(){
			//创建歌词列表
			// console.log(lyric.lyrics);
			$.each(lyric.lyrics,function(index,ele){
				var $item = $("<li>"+ele+"</li>");
				// console.log(ele);
				$lyricContainer.append($item);
			})
		})
	}

	//4.初始化进度条
	initProgress();
	function initProgress(){
		var $progressBar = $(".music_progress_bar");
		var $progressLine = $(".music_progress_line");
		var $progressDot = $(".music_progress_dot");

		progress = Progress($progressBar,$progressLine,$progressDot);
		progress.progressClick(function(value){
			player.musicSeekTo(value);
		});
		progress.progressMove(function(value){
			player.musicSeekTo(value);
		});


		var $voiceBar = $(".music_voice_bar");
		var $voiceLine = $(".music_voice_line");
		var $voiceDot = $(".music_voice_dot");
		voiceProgress = Progress($voiceBar,$voiceLine,$voiceDot);
		voiceProgress.progressClick(function(value){
			player.musicVoiceSeekTo(value);
		});
		voiceProgress.progressMove(function(value){
			player.musicVoiceSeekTo(value);
		})
	}

	//5.初始化监听事件
	initEvents();
	function initEvents(){
		//5.1监听歌曲的移入移出事件
		$(".content_list").delegate('.list_music', 'mouseenter', function(event) {
			//显示子菜单
			$(this).find('.list_menu').stop().fadeIn(100);
			$(this).find('.list_time a').stop().fadeIn(100);
			//隐藏时长
			$(this).find('.list_time span').stop().fadeOut(100);
		});	
		$(".content_list").delegate('.list_music', 'mouseleave', function(event) {
			//隐藏子菜单
			$(this).find('.list_menu').stop().fadeOut(100);
			$(this).find('.list_time a').stop().fadeOut(100);
			//显示时长
			$(this).find('.list_time span').stop().fadeIn(100);
		});	

		//5.2监听复选框点击事件
		$(".content_list").delegate('.list_check', 'click', function(event) {
			$(this).toggleClass('list_checked');
		});

		//5.3添加子菜单播放按钮的监听
		var $musicPlay = $(".music_play");
		$(".content_list").delegate('.list_menu_play', 'click', function(event) {
			var $item = $(this).parents(".list_music");
			//切换播放按钮
			$(this).toggleClass('list_menu_play2');
			//复原其他播放图标
			$item.siblings().find('.list_menu_play').removeClass('list_menu_play2');
			//同步播放按钮
			if($(this).hasClass('list_menu_play2')){
				//播放状态
				$musicPlay.addClass('music_play2');
				//文字高亮
				$item.find('div').css("color","#fff");
				$item.siblings().find('div').css("color","rgba(255,255,255,0.5)");
			}else{
				//不是播放状态
				$musicPlay.removeClass('.music_play2');
				//文字不高亮
				$item.find('div').css("color","rgba(255,255,255,0.5)");
			}
			//切换序号状态
			$item.find('.list_number').toggleClass("list_number2");
			$item.siblings().find('.list_number').removeClass('list_number2');

			//播放音乐
			player.playMusic($item.get(0).index,$item.get(0).music);
			//切换歌曲信息
			initMusicInfo($item.get(0).music);
			//切换歌词信息
			initMusicLyric($item.get(0).music);
		});

		//5.4控制区播放按钮点击
		$musicPlay.click(function(){
			if(player.currentIndex == -1){
				//没播放过音乐
				$(".list_music").eq(0).find('.list_menu_play').trigger('click');
			}else{
				//播放过音乐
				$(".list_music").eq(player.currentIndex).find('.list_menu_play').trigger('click');
			}
		});

		//5.5上一首点击
		$(".music_pre").click(function(){
			$(".list_music").eq(player.preIndex()).find('.list_menu_play').trigger('click');
		})
		//5.6下一首点击
		$(".music_next").eq(player.nextIndex()).find('.list_menu_play').trigger('click');

		//5.7监听删除按钮点击
		$(".content_list").delegate('.list_menu_del', 'click', function() {
			var $item = $(this).parents(".list_music");
			//判断当前音乐是否正在播放
			if($item.get(0).index == player.currentIndex){
				$(".music_next").trigger('click');
			}

			$item.remove();
			player.changeMusic($item.get(0).index);

			//重新排序
			$(".list_music").each(function(index, ele) {
				ele.index = index;
				$(ele).find('.list_number').text(index+1);
			});
		});

		//5.8监听播放进度
		player.musicTimeUpdate(function(currentTime,duration,timeStr){
			//同步时间
			$(".music_progress_time").text(timeStr);
			//同步进度条，计算播放比例
			var value = currentTime/duration*100;
			progress.setProgress(value);
			//歌词同步
			var index = lyric.currentIndex(currentTime);
			var $item = $(".song_lyric li").eq(index);
			$item.addClass('cur');
			$item.siblings().removeClass('cur');

			//歌词滚动
			if(index <= 2) return;
			$(".song_lyric").css({
				marginTop: (-index+2)*30
			});
		});

		//5.9声音按钮的点击
		$(".music_voice_icon").click(function(){
			//图标切换
			$(this).toggleClass('music_voice_icon2');
			//声音切换
			if($(this).hasClass('music_voice_icon2')){
				//没声音
				player.musicVoiceSeekTo(0);
			}else{
				//有声音
				player.musicVoiceSeekTo(1);
			}
		})
	}


	//创建一条音乐的方法
	function createMusicItem(index,music){
		var $item = $("" +
        "<li class=\"list_music\">\n" +
            "<div class=\"list_check\"><i></i></div>\n" +
            "<div class=\"list_number\">"+(index + 1)+"</div>\n" +
            "<div class=\"list_name\">"+music.name+"" +
            "     <div class=\"list_menu\">\n" +
            "          <a href=\"javascript:;\" title=\"播放\" class='list_menu_play'></a>\n" +
            "          <a href=\"javascript:;\" title=\"添加\"></a>\n" +
            "          <a href=\"javascript:;\" title=\"下载\"></a>\n" +
            "          <a href=\"javascript:;\" title=\"分享\"></a>\n" +
            "     </div>\n" +
            "</div>\n" +
            "<div class=\"list_singer\">"+music.singer+"</div>\n" +
            "<div class=\"list_time\">\n" +
            "     <span>"+music.time+"</span>\n" +
            "     <a href=\"javascript:;\" title=\"删除\" class='list_menu_del'></a>\n" +
            "</div>\n" +
        "</li>");

        $item.get(0).index=index;
        $item.get(0).music=music;
        return $item;
	}
})