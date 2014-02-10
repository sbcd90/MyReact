MyReact = {};
MyReact.DOM = {};
MyReact.components = {};
MyReact.componentNames = [];
MyReact.domNodes = [];
MyReact.body = {};
MyReact.html;
MyReact.model;

MyReact.createClass = function(componentId, domNodes){
	var returnDOMxml = domNodes.render;
	var componentName = componentId;
	MyReact.components[componentName] = returnDOMxml;
	MyReact.components[componentName].componentWillMount = domNodes.componentWillMount;
	MyReact.components[componentName].setState = function(data, key){
		var children = MyReact.DOM[key].children;
		
		for(var count=0;count<children.length;count++){
			var dataNode = MyReact.DOM[children[count]];
			datatype = "data:" + componentName;
			if(typeof dataNode[datatype]!="undefined")
				dataNode[datatype] = data;
			MyReact.components[componentName].setState(data,children[count]);
		}
	};
	MyReact.componentNames.push(componentName);
	MyReact.domNodes.push(domNodes);
};

MyReact.renderComponent = function(componentName, htmlDOMele, data){
	MyReact.initialDOMcreate();
	var key = htmlDOMele;
	var children = MyReact.DOM[key].children;
	if(typeof MyReact.components[componentName]=="undefined")
		console.log("Error - Component is not defined");
	else{
		var parser = new DOMParser();
    	var xmlDoc=parser.parseFromString(MyReact.components[componentName](),"text/xml");
    	var childNodes = xmlDoc.childNodes;
    	for(var count=0;count<childNodes.length;count++){
    		var nodeName = childNodes[count].nodeName.toLowerCase();
    		var childkey = childNodes[count].attributes["key"].value;
    		var custom = nodeName.substring(0,6);
    		if(custom=="custom"){
    			var data = childNodes[count].attributes["data"].value;
    			var childComponentName = nodeName.substring(7,nodeName.length);
    			if(data!=null)
    				MyReact.componentToDOMconversion(key, childComponentName,data);
    			else
    				MyReact.componentToDOMconversion(key, childComponentName,null);
    		}
    		else{

    			MyReact.DOM[childkey] = {
    				type : nodeName,
    				parent : key,
    				children : [],
    				attributes : []
    			};
    			var enterattr = MyReact.DOM[childkey].attributes;
    			for(countattr=0;countattr<childNodes[count].attributes.length;countattr++){
    				var attrkey = childNodes[count].attributes[countattr].nodeName;
    				var attrvalue = childNodes[count].attributes[countattr].value;
    				enterattr.push({"key" : attrkey, "value" : attrvalue});
    			}
    			var node = MyReact.DOM[childkey];
    			var dataNode = "data:" + componentName;
    			node[dataNode] = data;
    			children.push(childkey);
    			MyReact.recurseXMLDOM(childNodes[count], data, componentName);
    		}

    	}
	}
	MyReact.html = "";
	document.body.innerHTML = "";
	MyReact.renderActualDOM(MyReact.body.key);
	document.body.innerHTML = MyReact.html;
};

MyReact.initialDOMcreate = function(){
	var body = document.body;
	if(typeof document.body.id!="undefined"){
		var id = document.body.id;
		MyReact.body.key = id;
		MyReact.DOM[id] = {
			type : "body",
			children : []
		};
	}
	else{
		var id = "content";
		MyReact.body.key = id;
		MyReact.DOM[id] = {
			type : "body",
			children : []
		}; 
	}
	MyReact.recurseThroughDOM(body);
};

MyReact.recurseThroughDOM = function(htmlDOMele){
	var childNodes = htmlDOMele.childNodes;

	if(childNodes.length==0)
		return;
	else{
		for(var count=0;count<childNodes.length;count++){
			var type = childNodes[count].nodeName.toLowerCase();
			if((type!="#text")&&(type!="script")){
				var key = childNodes[count].id;
				var parentid = htmlDOMele.id;
				MyReact.DOM[key] = {
					type : type,
					parent : parentid, 
					children : [],
					attributes : []
				};
				var enterattr = MyReact.DOM[key].attributes;
    			for(countattr=0;countattr<childNodes[count].attributes.length;countattr++){
    				var attrkey = childNodes[count].attributes[countattr].nodeName;
    				var attrvalue = childNodes[count].attributes[countattr].value;
    				enterattr.push({"key" : attrkey, "value" : attrvalue});
    			}
				var children = MyReact.DOM[parentid].children;
				children.push(key);
				MyReact.recurseThroughDOM(childNodes[count]);
			}
		}
	}
};

MyReact.recurseXMLDOM = function(xmlDOMele, data, childComponent){
	var childNodes = xmlDOMele.childNodes;

	if(childNodes.length==0)
		return;
	else{
		for(var count=0;count<childNodes.length;count++){
			var type = childNodes[count].nodeName.toLowerCase();
			var custom = type.substring(0,6);
			if(type=="#text"){
				var value = childNodes[count].nodeValue;
				var parentid = xmlDOMele.attributes["key"].value;
				MyReact.DOM[parentid].content = value;
			}
    		else if(custom=="custom"){
    			var childComponentName = type.substring(7,type.length);
    			var parentid = xmlDOMele.attributes["key"].value;
    			MyReact.componentToDOMconversion(parentid, childComponentName, data);
    		}
			else if((type!="parsererror")&&(type!="script")){
				var key = childNodes[count].attributes["key"].value;
				var parentid = xmlDOMele.attributes["key"].value;
				MyReact.DOM[key] = {
					type : type,
					parent : parentid, 
					children : [],
					attributes : []
				};
				var enterattr = MyReact.DOM[key].attributes;
    			for(countattr=0;countattr<childNodes[count].attributes.length;countattr++){
    				var attrkey = childNodes[count].attributes[countattr].nodeName;
    				var attrvalue = childNodes[count].attributes[countattr].value;
    				enterattr.push({"key" : attrkey, "value" : attrvalue});
    			}
				var node = MyReact.DOM[key];
    			var dataNode = "data:" + childComponent;
    			node[dataNode] = data;
				var children = MyReact.DOM[parentid].children;
				children.push(key);
				MyReact.recurseXMLDOM(childNodes[count], data);
			}
		}
	}
};

MyReact.componentToDOMconversion = function(key, componentName, data)
{
	if(typeof MyReact.components[componentName]=="undefined")
		console.log("Error - Component is not defined");
	else{
		var parser = new DOMParser();
    	var xmlDoc=parser.parseFromString(MyReact.components[componentName](),"text/xml");
    	var childNodes = xmlDoc.childNodes;
    	var children = MyReact.DOM[key].children;
    	for(var count=0;count<childNodes.length;count++){
    		var nodeName = childNodes[count].nodeName;
    		var childkey = childNodes[count].attributes["key"].value;
    		var custom = nodeName.substring(0,6);
    		if(custom=="custom"){
    			var data = childNodes[count].attributes["data"].value;
    			var childComponentName = nodeName.substring(7,nodeName.length);
    			if(data!=null)
    				MyReact.componentToDOMconversion(key, childComponentName, data);
    			else
    				MyReact.componentToDOMconversion(key, childComponentName, null);
    		}
    		else{
    			MyReact.DOM[childkey] = {
    				type : nodeName,
    				parent : key,
    				children : [],
    				attributes : []
    			};
    			var enterattr = MyReact.DOM[childkey].attributes;
    			for(countattr=0;countattr<childNodes[count].attributes.length;countattr++){
    				var attrkey = childNodes[count].attributes[countattr].nodeName;
    				var attrvalue = childNodes[count].attributes[countattr].value;
    				enterattr.push({"key" : attrkey, "value" : attrvalue});
    			}
    			var node = MyReact.DOM[childkey];
    			var dataNode = "data:" + componentName;
    			node[dataNode] = data;
    			children.push(childkey);
    			MyReact.recurseXMLDOM(childNodes[count], data, componentName);
    		}

    	}
	}
};

MyReact.renderActualDOM = function(key){
	for(var count=0;count<MyReact.componentNames.length;count++){
		if(typeof MyReact.components[MyReact.componentNames[count]].componentWillMount!="undefined")
			MyReact.components[MyReact.componentNames[count]].componentWillMount();
	}

	var xmlDOMele = MyReact.DOM[key];
	var attrstring = "";
	if(typeof xmlDOMele.attributes!="undefined"){
		for(var count=0;count<xmlDOMele.attributes.length;count++){
			if(xmlDOMele.attributes[count].key!="key"){
				if((xmlDOMele.attributes[count].value[0]=="{")&&(xmlDOMele.attributes[count].value[xmlDOMele.attributes[count].value.length-1]=="}")){
					var attrvalue = xmlDOMele.attributes[count].value.substring(1,xmlDOMele.attributes[count].value.length-1);

					for(var find=0;find<MyReact.domNodes.length;find++){
						var findNode = MyReact.domNodes[find];
						if((typeof findNode[attrvalue]!="undefined")&&(findNode[attrvalue].key==key)){
							xmlDOMele[attrvalue] = findNode[attrvalue].handler;
							break;
						}
					}
					attrstring = attrstring + xmlDOMele.attributes[count].key + "='MyReact.DOM." + key + "." + attrvalue + "();MyReact.html = " + '"";' + "MyReact.renderActualDOM(" + '"' + MyReact.body.key + '"'+ ");document.body.innerHTML = MyReact.html;' ";
				}
				else{
					attrstring = attrstring + xmlDOMele.attributes[count].key + "='" + xmlDOMele.attributes[count].value + "' ";
				}
			}
		}
	}
	var children = MyReact.DOM[key].children;
	if(children.length==0){
		if(typeof MyReact.DOM[key].content=="undefined")
			MyReact.html = MyReact.html + "<" + MyReact.DOM[key].type + " " + attrstring + ">" + "</" + MyReact.DOM[key].type + ">";
		else{
			var content =  MyReact.DOM[key].content;
			if((content[0]=="{")&&(content[content.length-1]=="}")){
				var datatype;
				for(var count=0;count<MyReact.componentNames.length;count++){
					var dataNode = MyReact.componentNames[count];
					datatype = "data:" + dataNode;
					var object = MyReact.DOM[key];
					if(typeof object[datatype]!="undefined")
						break;
				}
				var path = content.substring(1,content.length-1);
				var results = object[datatype];
				var data = {properties : results};
				MyReact.html = MyReact.html + "<" + MyReact.DOM[key].type + " " + attrstring + ">" + eval("data." + path) + "</" + MyReact.DOM[key].type + ">";
			}
			else
				MyReact.html = MyReact.html + "<" + MyReact.DOM[key].type + " " + attrstring + ">" + MyReact.DOM[key].content + "</" + MyReact.DOM[key].type + ">";
		}
		return;
	}
	else{
		if(MyReact.DOM[key].type!="body")
			MyReact.html = MyReact.html + "<" + MyReact.DOM[key].type + " " + attrstring + ">";
		for(var count=0;count<children.length;count++){
			MyReact.renderActualDOM(children[count]);
		}
		if(MyReact.DOM[key].type!="body"){
			if(typeof MyReact.DOM[key].content=="undefined")
				MyReact.html = MyReact.html + "</" + MyReact.DOM[key].type + ">";
			else{
				var content =  MyReact.DOM[key].content;
				if((content[0]=="{")&&(content[content.length-1]=="}")){
					var datatype;
					for(var count=0;count<MyReact.componentNames.length;count++){
						var dataNode = MyReact.componentNames[count];
						datatype = "data:" + dataNode;
						var object = MyReact.DOM[key];
						if(typeof object[datatype]!="undefined")
							break;
					}
					var path = content.substring(1,content.length-1);
					var results = object[datatype];
					var data = {properties : results};	
					MyReact.html = MyReact.html + eval("data." + path) + "</" + MyReact.DOM[key].type + ">";
				}
				else{
					MyReact.html = MyReact.html + MyReact.DOM[key].content + "</" + MyReact.DOM[key].type + ">";
				}
			}
		}
	}
};