;var hlh = hlh || (function(){
	function defaultIconStyles(){
		return {fa:true,'fa-2x':true};
	};
	var hlhVue = new Vue({
		el:'#hlhAPP',
		data:{
			v:'0.1.5',
			ui:0,
			hls:[],
			tags:[],
			sort:{alpha:true,asc:true},
			filters:{tags:[],text:'',selected:''}
		},
		methods:{
			setAlphaSort:function(){ this.sort.alpha = true; },
			setTimeSort:function(){ this.sort.alpha = false; },
			setAscSort:function(){ this.sort.asc = true; },
			setDescSort:function(){	this.sort.asc = false; },
			styleAlphaButton:function(){
				var oStyles = defaultIconStyles();
				if(this.sort.asc){
					oStyles['fa-sort-alpha-asc']=true;
				} else {
					oStyles['fa-sort-alpha-desc']=true;
				}
				return oStyles;
			},
			styleTimeButton:function(){
				var oStyles = defaultIconStyles();
				if(this.sort.asc){
					oStyles['fa-sort-amount-asc']=true;
				} else {
					oStyles['fa-sort-amount-desc']=true;
				}
				return oStyles;
			},
			addHl:function(oHl){
				if(_.isObject(oHl)){
					var hlh=this,tempMrk={ts:Date.now(),url:'',abbr:'',title:'',tags:''};
					_.extendOwn(tempMrk,oHl);
					tempMrk.url = (typeof(tempMrk.url) === 'string')? tempMrk.url.trim() : '';
					if(tempMrk.url !== ''){
						if(hlh.hls.length < 1){
							tempMrk.ID = 0;
						} else {
							tempMrk.ID = _.max(hlh.hls,function(hl){return hl.ID}).ID+1;
						}
						tempMrk.title = (typeof(tempMrk.title) === 'string')? tempMrk.title.trim() : '';
						if(!_.isArray(tempMrk.tags)){
							tempMrk.tags = (typeof(tempMrk.tags) === 'string')? tempMrk.tags.trim() : '';
							tempMrk.tags = tempMrk.tags.split(',');
						}
						tempMrk.tags = tempMrk.tags.sort();
						if(tempMrk.url.length < 42){
							tempMrk.abbr = tempMrk.url;
						} else {
							tempMrk.abbr = tempMrk.url.substring(0,39)+'...';
						}
						hlh.hls.push(tempMrk);
						_.each(tempMrk.tags,function(tag){hlh.addTag(tag);});
					}
				}		
			},
			addTag:function(tag){
				tag = tag || '';
				if(typeof(tag) !== 'string'){
					tag = '';
				} else {
					tag = tag.trim();
				}
				if(tag !== ''){
					var hlh = this;
					if(_.indexOf(hlh.tags,tag) < 0){
						hlh.tags.push(tag);
					}
				}
			},
			addFilterTag:function(tag){
				tag = tag || '';
				if(typeof(tag) !== 'string'){
					tag = '';
				} else {
					tag = tag.trim();
				}
				if(tag !== ''){
					var hlh = this;
					if(_.indexOf(hlh.tags,tag) > -1 && _.indexOf(hlh.filters.tags,tag) < 0){
						hlh.filters.tags.push(tag);
					} else if(_.indexOf(hlh.tags,tag) > -1){
						hlh.removeFilterTag(tag);
					}
				}				
			},
			removeFilterTag:function(tag){
				tag = tag || '';
				if(typeof(tag) !== 'string'){
					tag = '';
				} else {
					tag = tag.trim();
				}
				if(tag !== ''){
					var hlh = this;
					var tagIndex = _.indexOf(hlh.filters.tags,tag)
					if(tagIndex > -1){
						hlh.filters.tags.splice(tagIndex,1);
					}
				}
			},
			filterHLs:function(sample){
				sample = sample || false;
				if(sample !== true) sample = false;
				var hlh = this;
				if(sample){
					var arr = _.sample(hlh.hls,_.random(1,hlh.hls.length-1));
					if(!_.isArray(arr)){
						var tempArr = [];
						tempArr.push(arr);
						return tempArr;
					}
				} else {
					var arr = _.sortBy(_.filter(hlh.hls,function(link){
						var filterTags = hlh.filters.tags,
							filterText = hlh.filters.text;
						var tagMatch = (!_.isEmpty(filterTags))? _.intersection(link.tags,filterTags).length === filterTags.length : true,
							urlMatch = link.url.includes(filterText),
							titleMatch = link.title.includes(filterText);
						return tagMatch && (urlMatch || titleMatch) ;
					}),(hlh.sort.alpha)? 'title' : 'ts');
				}
				if(this.sort.asc) {
					return arr;
				} else {
					return arr.reverse();
				}
			},
			filterTags:function(){
				var hlh = this;
				return _.difference(hlh.tags,hlh.filters.tags).sort();
			},
			handleOrderOnClick:function(){
				if(this.sort.asc){
					this.setDescSort();
				} else {
					this.setAscSort();
				}
			},
			handleAlphaClick:function(){
				if(this.sort.alpha){
					this.handleOrderOnClick();
				} else {
					this.setAlphaSort();
				}
			},
			handleTimeClick:function(){
				if(this.sort.alpha){
					this.setTimeSort();
				} else {
					this.handleOrderOnClick();
				}
			}
		}
	});
	var aCredits = [
		{url:"https://nathanielwiley.github.io/",title:'Copyright 2017-2018 Nathaniel Wiley',tags:'About Hyperlink Humidor'},
		{url:"https://vuejs.org/",title:'Powered By Vue.js',tags:'About Hyperlink Humidor'},
		{url:"https://fontawesome.com/",title:'Graphics By Font Awesome',tags:'About Hyperlink Humidor'},
		{url:"https://github.com/nathanielwiley/hyperlink-humidor/",title:'GitHub Project',tags:'About Hyperlink Humidor'},
		{url:"https://www.w3schools.com/w3css/",title:'Powered By W3.CSS',tags:'About Hyperlink Humidor'},
		{url:"https://github.com/nathanielwiley/hyperlink-humidor/blob/master/LICENSE",title:"Released under the MIT License",tags:"About Hyperlink Humidor"}
	];
	_.each(aCredits,function(oHl){hlhVue.addHl(oHl);});
	if(typeof(hlhdemo) !== 'undefined') _.each(hlhdemo,function(oHl){hlhVue.addHl(oHl);});


	var hasStorage = true,data = [],filterTags=[],filterText='',$app = document.getElementById('hlhAPP');
	try{ localStorage; } catch (err) { hasStorage = false; }
	if(hasStorage && localStorage.getItem('hlhdt') === null) save();
	function save(){
		if(hasStorage){localStorage.setItem('hlhdt',JSON.stringify(data));}
		// update state?
	}
	function filterLinks(alphaSort,descSort){
		alphaSort = alphaSort || true;
		descSort = descSort || false;
		var arr= _.sortBy(_.filter(data,function(link){
			var tagMatch = (!_.isEmpty(filterTags))? !_.isEmpty(_.intersection(link.tags,filterTags)) : true,
				urlMatch = link.url.includes(filterText),
				titleMatch = link.title.includes(filterText);
			return tagMatch && (urlMatch || titleMatch) ;
		}),(alphaSort)? 'title' : 'ts');
		if(descSort) {
			return arr.reverse();
		} else {
			return arr;
		}
	}
	function redraw(sample,alphaSort,descSort){
		sample = sample || false;
		var aFiltered = (sample)? _.sample(data) : filterLinks(alphaSort,descSort),
			$markup = '<br /><br /><br /><br />',
			$rowOpen = '<div class="w3-row">',
			linkCount = 0, linkPos = 0;
		_.each(aFiltered,function(link){
			linkCount++;
			linkPos++;
			$markup += '<div class="w3-col s12 m6 l3">';
			$markup += '<div class="w3-panel w3-border w3-padding w3-margin-right">';
			$markup += '<a target="_blank" href="'+link.url+'">'+link.title+'</a></div></div>';
			if(linkCount === 4){
				linkCount = 0;
				$markup += '</div>'+$rowOpen;
			}
			if(linkPos === aFiltered.length) $markup += '</div>'+$rowOpen;
		});
		$markup += '</div>';
		return $markup;
	}
	function drawRow(aLinks){
		aLinks = aLinks || [];
	}
	function drawCol(link){

	}
	var hlhXSLT = '<stylesheet version="1.0" xmlns="http://www.w3.org/1999/XSL/Transform" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><template match="/xml_api_reply/bookmarks">[<xsl:for-each select="bookmark">{"title":"<xsl:value-of select="title"/>","url":"<xsl:value-of select="url"/>","ts":"<xsl:value-of select="timestamp"/>","id":"<xsl:value-of select="id"/>","tags":"<xsl:for-each select="labels/label"><xsl:value-of select="."/><xsl:if test="position() != last()">,</xsl:if></xsl:for-each>"}<xsl:if test="position() != last()">,</xsl:if></xsl:for-each>]</template></stylesheet>',
		$emptyMessage = '<div class="w3-display-middle w3-text-light-grey"><i class="fa fa-5x fa-bookmark"></i></div><div class="w3-display-middle"><p>No Bookmarks Loaded</p></div>',
		APP = {
		vue: function(){return hlhVue;},
		version:function(){ return '0.0.5'; },
		dump:function(){return [data,filterTags,filterText,hlhVue];},
		render:function(sample){$app.innerHTML = (data.length)?  redraw(sample) : $emptyMessage;},
		add:function(url,title,tags,ts,redraw){
			redraw = redraw || true;
			var tempMrk = {
				ts : ts || Date.now(),
				url : url || '',
				title : title || '',
				tags : tags || ''
			};
			tempMrk.url = (typeof(tempMrk.url) === 'string')? tempMrk.url.trim() : '';
			tempMrk.title = (typeof(tempMrk.title) === 'string')? tempMrk.title.trim() : '';
			tempMrk.tags = (typeof(tempMrk.tags) === 'string')? tempMrk.tags.trim() : '';
			if(tempMrk.url !== ''){
				var tempMrkIndex = _.findIndex(data, function(mrk){return mrk.url === tempMrk.url});
				var isNew = (tempMrkIndex > -1)? false : true;
				var shouldSave = false;
				tempMrk.tags = tempMrk.tags.trim().split(',');
				if(isNew){
					data.push(tempMrk);
					shouldSave = true;
				}
				for(var i in tempMrk.tags){
					var tempTag = tempMrk.tags[i];
					if(!isNew && data[tempMrkIndex].tags.indexOf(tempTag) === -1){
						data[tempMrkIndex].tags.push(tempTag);
						shouldSave = true;
					}
				}
				if(shouldSave) save();
				if(redraw) APP.render();
			}			
		},
		import:function(xmlString){
			if(!APP.parser) APP.parser = new DOMParser();
			if(!APP.processor){
				APP.processor = new XSLTProcessor();
				APP.processor.importStylesheet(APP.parser.parseFromString(hlhXSLT,"text/xml"));
			}
			try{
				var xmlDoc = APP.parser.parseFromString(xmlString,"text/xml");
				var resultNode = APP.processor.transformToFragment(xmlDoc, document);
				var aMrks = JSON.parse(resultNode.textContent);
			} catch (err){
				var aMrks = [];
			}
			for(var i in aMrks){
				APP.add(aMrks[i].url,aMrks[i].title,aMrks[i].tags,aMrks[i].ts,false);
			}
			if(aMrks.length) APP.render();
		}
	};
	if(hasStorage){
		data = JSON.parse(localStorage.getItem('hlhdt'));
	}
	// APP.render();
	return APP;
})();
