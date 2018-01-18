;var brkmrks = brkmrks || (function(){
	var hasStorage = true,data = [],filterTags=[],filterText='';
	try{ localStorage; } catch (err) { hasStorage = false; }
	function save(){
		if(hasStorage){localStorage.setItem('brkmrksdt',JSON.stringify(data));}
		// update state?
	}
	if(hasStorage && localStorage.getItem('brkmrksdt') === null) save();
	var brkmrksXSLT = '<stylesheet version="1.0" xmlns="http://www.w3.org/1999/XSL/Transform" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><template match="/xml_api_reply/bookmarks">[<xsl:for-each select="bookmark">{"title":"<xsl:value-of select="title"/>","url":"<xsl:value-of select="url"/>","ts":"<xsl:value-of select="timestamp"/>","id":"<xsl:value-of select="id"/>","tags":"<xsl:for-each select="labels/label"><xsl:value-of select="."/><xsl:if test="position() != last()">,</xsl:if></xsl:for-each>"}<xsl:if test="position() != last()">,</xsl:if></xsl:for-each>]</template></stylesheet>';
	var APP = {
		version:function(){ return '0.0.0'; },
		dump:function(){return [data,filterTags,filterText];},
		add:function(url,title,tags,ts){
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
				var aMrks = [];
			}
			for(var i in aMrks){
				APP.add(aMrks[i].url,aMrks[i].title,aMrks[i].tags,aMrks[i].ts);
			}
		}
	};
	if(hasStorage){
		data = JSON.parse(localStorage.getItem('brkmrksdt'));
	}
	return APP;
})();