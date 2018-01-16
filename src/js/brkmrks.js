;var brkmrks = brkmrks || (function(){
	var hasStorage = true,data = {tags:[],links:[],index:{}};
	try{ localStorage; } catch (err) { hasStorage = false; }
	function save(){if(hasStorage){localStorage.setItem('brkmrksdt',JSON.stringify(data));}}
	if(hasStorage && localStorage.getItem('brkmrksdt') === null) save();
	var brkmrksXSLT = '<stylesheet version="1.0" xmlns="http://www.w3.org/1999/XSL/Transform" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><template match="/xml_api_reply/bookmarks">[<xsl:for-each select="bookmark">{"title":"<xsl:value-of select="title"/>","url":"<xsl:value-of select="url"/>","ts":"<xsl:value-of select="timestamp"/>","id":"<xsl:value-of select="id"/>","tags":"<xsl:for-each select="labels/label"><xsl:value-of select="."/><xsl:if test="position() != last()">,</xsl:if></xsl:for-each>"}<xsl:if test="position() != last()">,</xsl:if></xsl:for-each>]</template></stylesheet>';
	var APP = {
		add:function(url,title,tags,ts){
			var tempMrk = {
				ts : ts || Date.now(),
				url : url || '',
				title : title || '',
				tags : tags || ''
			};
			if(tempMrk.url !== ''){
				var isNew = (data.index.hasOwnProperty(tempMrk.url))? false : true;
				var shouldSave = false;
				if(isNew){
					data.index[tempMrk.url] = data.links.length;
					data.links.push(tempMrk);
					shouldSave = true;
				}
				tempMrk.tags = (typeof(tempMrk.tags) === 'string')? tempMrk.tags.split(',') : [];
				for(var i in tempMrk.tags){
					var tempTag = tempMrk.tags[i];
					if(data.tags.indexOf(tempTag) === -1){
						data.tags.push(tempTag);
						shouldSave = true;
					}
					if(!isNew && data.links[data.index[tempMrk.url]].tags.indexOf(tempTag) === -1){
						data.links[data.index[tempMrk.url]].tags.push(tempTag);
						shouldSave = true;
					}
				}
				if(shouldSave) save();
			}			
		},
		import:function(xmlString){
			if(!APP.parser) APP.parser = new DOMParser();
			if(!APP.processor){
				APP.processor = new XSLTProcessor();
				APP.processor.importStylesheet(APP.parser.parseFromString(brkmrksXSLT,"text/xml"));
			}
			try{
				var xmlDoc = APP.parser.parseFromString(xmlString,"text/xml");
				var resultNode = APP.processor.transformToFragment(xmlDoc, document);
				var aMrks = JSON.parse(resultNode.textContent);
			} catch (err){
				console.log(err);
				var aMrks = [];
			}
			console.log(aMrks);
			for(var i in aMrks){
				APP.add(aMrks[i].url,aMrks[i].title,aMrks[i].tags,aMrks[i].ts);
			}
		},
		dump:function(){return data;}
	};
	if(hasStorage){
		data = JSON.parse(localStorage.getItem('brkmrksdt'));
	}
	return APP;
})();