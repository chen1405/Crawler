/*
* @Author: chenfl
* @Date:   2017-12-07 15:16:10
* @Last Modified by:   chenfl
* @Last Modified time: 2017-12-07 17:49:20
*/
var http = require('http');
var fs = require('fs');
//var path = require('path');
var cheerio = require('cheerio');
//var url = 'http://dushu.xiaomi.com/#page=main&tab=0';
var miData=[];

fs.readFile(__dirname+'/mi.html',{encoding:'utf8'},function(err,data){
	if(err){
		console.error(err);
		return;
	}

	var Data=filterData(data);

	fs.writeFile(__dirname + '/data.json', Data, function (err) {
	   if(err) {
	    console.error(err);
	    return;
	    } else {
	       console.log('写入成功');
	    }
	});

	
});

function filterData(html){
	var $ =cheerio.load(html);
	var channelGroups = $('.channel-group');
	var channelH5s= $('.channel-h5');
	var listMore= $('#list-more .book-h5');

	channelGroups.each(function(item){
		channelGroup = $(this);
		var channelGTitle= channelGroup.find('.channel-group__title').text();
		var channelGroupData={
			channelGTitle:channelGTitle,
			books:[]
		}

		var channelGroupsLiUbooks = channelGroup.find('.book-table .u-book');
		channelGroupsLiUbooks.each(function(item){
			channelGroupsUbook = $(this);
			var cover=channelGroupsUbook.find('.book-cover');
			var bookId=cover.attr('data-id');
			var title = channelGroupsUbook.find('.title').text();
			var src = channelGroupsUbook.find('img').attr('src');
			src=src.replace(/!s$/,""); 
			channelGroupData.books.push({
				title:title,
				src:src,
				bookId:bookId
			});
		});
		miData.push(channelGroupData);	
	});

	//channel-h5
	channelH5s.each(function(item){
		channelH5 = $(this);
		var channelH5Title= channelH5.find('.channel-h5__title').contents().filter(function (index, content) {
				return content.nodeType === 3;
			}).text().trim();
		var channelH5Data={
			channelH5Title:channelH5Title,
			books:[]
		}
		channelH5Uls = channelH5.find('.list-h5 ');
		channelH5Uls.each(function(){
			var group=[];
			var channelH5Books=$(this).find('.book-h5');
			channelH5Books.each(function(item){
				var channelH5Book=$(this);
				var author = channelH5Book.find('.author').text();
				var bookId = channelH5Book.prop('data-href');
				
				bookId=bookId.split('&')[1];
				bookId=bookId.split('=')[1];
				var noImg= channelH5Book.find('.book-h5_no-img__title').text();
				if(noImg){

					//只获取当前元素的文本，不包括子元素文本
					var title = channelH5Book.find('.book-h5_no-img__title').contents().filter(function (index, content) {
					    return content.nodeType === 3;
					}).text().trim();
					
					group.push({
						title: title,
						author:author,
						bookId:bookId
					});

				}else{
					var finish = channelH5Book.find('.book-h5__finish').text();
					var title = channelH5Book.find(' .book-h5__title').text();
					var summary = channelH5Book.find('.book-h5__summary').text();
					var src = channelH5Book.find('img').attr('src');
					var tags=channelH5Book.find('.book-h5__tag');
					var arr=[];
					
					tags.each(function(item){
						var tag=$(this).text().trim();
						arr.push(tag);
					})

					group.push({
						finish: finish,
						title: title,
						author:author,
						summary: summary,
						src:src,
						bookId:bookId,
						tags:arr
					});
				}
				
			})
			channelH5Data.books.push(group);
		});
		miData.push(channelH5Data);
	});
	var listMoreLiData={
			channelH5Title:'更多',
			books:[]
		};
	listMore.each(function(item){
	    var listMoreLi=$(this);
		var author = listMoreLi.find('.author').text();
		var finish = listMoreLi.find('.book-h5__finish').text();
		var title = listMoreLi.find(' .book-h5__title').text();
		var summary = listMoreLi.find('.book-h5__summary').text();
		var src = listMoreLi.find('img').attr('src');
	
		var tags=listMoreLi.find('.book-h5__tag');
		var arr=[];
		tags.each(function(item){
			var tag=$(this).text().trim();
			arr.push(tag);
		})
		listMoreLiData.books.push({
			finish: finish,
			title: title,
			author:author,
			summary: summary,
			src:src,
			tags:arr
		});
	})
	miData.push(listMoreLiData);
	//console.log(miData);
	var str=JSON.stringify(miData);
	return str;
}