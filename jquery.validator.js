
/**
 * jQuery Form Validator
 * Version: 1.0
 * It is influenced heavily by maodong's formValidator
 */
(function($) {
	
var validatorGroup_setting = [];
$.validator = {
	//获取正则表达式
	getRegex : function(key)
	{
		return {		
			pos_intege:"^[1-9]\\d*$",					//正整数
			neg_intege:"^-[1-9]\\d*$",					//负整数
			mobile:"^(13|14|15|18)[0-9]{9}$", //手机号码，13,14,15,18开头的数字
			username:"^\\w+$",	//用户名，匹配由数字、26个英文字母或者下划线组成的字符串
			password:"^[\\u0020-\\u007E]+$",						//密码，支持空格
			email:"^[\\w\\.-]+\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$"//邮箱
		}[key];
	},
	//初始化
	initConfig : function(controlOptions)
	{
		var settings = {};
		var initConfig_setting = {
			theme:"Default",
			validatorGroup : "1",		//分组号
			formID:"",					//表单ID
			submitOnce:false,			//页面是否提交一次，不会停留
			mode : "FixTip",			//显示模式
			errorFocus:true,			//第一个错误的控件获得焦点
			wideWord:true,				//一个汉字当做3个长度
			forceValid:false,			//控件输入正确之后，才允许失去焦
			debug:false,				//调试模式点
			inIframe:false,
			onSuccess: function() {		//提交成功后的回调函数
				return true;
			},
			onError: $.noop,			//提交失败的回调函数度
			status:"",					//提交的状态：submited、sumbiting、sumbitingWithAjax
			validObjects:[],			//参加校验的控件集合
			showTextObjects:"",
			validateType : "initConfig"
		};
		$.extend(true, settings, initConfig_setting, controlOptions || {});
		//如果填写了表单和按钮，就注册验证事件
		if(settings.formID!==""){
			$("#"+settings.formID).submit(function(){
				return $.validator.pageIsValid(settings.validatorGroup);
			});
		}
		validatorGroup_setting.push( settings );
		$.validator.loadTheme(settings.theme);
	},
	//加载主题
	loadTheme : function(theme){
		$.validator.theme={
			onShowHtml : "",
			onFocusHtml : "<span class='$class$'><span class='$class$-top'>$data$</span><span class='$class$-bot'></span></span>",
			onErrorHtml : "<span class='$class$'><span class='$class$-top'>$data$</span><span class='$class$-bot'></span></span>",
			onCorrectHtml : "<span class='$class$'></span>",
			onFocusClass : "input-focus",
			onErrorClass : "input-error",
			onCorrectClass : "input-correct"	
		};
	},
	//各种校验方式支持的控件类型
	sustainType : function(elem,validateType)
	{
		var srcTag = elem.tagName;
		var stype = elem.type;
		switch(validateType)
		{
			case "formValidator":
				return true;
			case "inputValidator":
				return (srcTag === "INPUT" || srcTag === "TEXTAREA" || srcTag === "SELECT");
			case "compareValidator":
				return ((srcTag === "INPUT" || srcTag === "TEXTAREA") ? (stype !== "checkbox" && stype !== "radio") : false);
			case "regexValidator":
				return ((srcTag === "INPUT" || srcTag === "TEXTAREA") ? (stype !== "checkbox" && stype !== "radio") : false);
			case "functionValidator":
				return true;
		}
	},
	//如果validator对象对应的element对象的validator属性追加要进行的校验。
	appendValid : function(id, setting )
	{
		//如果是各种校验不支持的类型，就不追加到。返回-1表示没有追加成功
		var elem = $("#"+id).get(0);   
		var validateType = setting.validateType;
		if(!$.validator.sustainType(elem,validateType)){
			return -1;
		}
		//重新初始化
		if (validateType==="formValidator" || elem.settings === undefined ){elem.settings = [];}   
		var len = elem.settings.push( setting );
		elem.settings[len - 1].index = len - 1;
		return len - 1;
	},
	//获取校验组信息
	getInitConfig : function(validatorGroup)
	{
		var config=null;
		$.each( validatorGroup_setting, function(i, n){
			if(validatorGroup_setting[i].validatorGroup===validatorGroup){
				config = validatorGroup_setting[i];
				return false;
			}
		});
		return config;
	},
	//设置显示信息状态
	setTipState : function(elem,showclass,showmsg)
	{
		var initConfig = $.validator.getInitConfig(elem.validatorGroup);
	    var tip = $("#"+elem.settings[0].tipID);
		if(!showmsg){
			tip.hide();
		}else{
			var html = showclass === "onShow" ? $.validator.theme.onShowHtml : (showclass === "onFocus" ? $.validator.theme.onFocusHtml : (showclass === "onCorrect" ? $.validator.theme.onCorrectHtml : $.validator.theme.onErrorHtml));
			if(html.length === 0){
				tip.hide();
			}else{
				html = html.replace(/\$class\$/g, showclass).replace(/\$data\$/g, showmsg);
			    tip.html(html).show();
			}
			var stype = elem.type;
			if(stype === "password" || stype === "text" || stype === "file"){
				var jqobj = $(elem);
				var originalClass=elem.settings[0].originalClass;
				if($.validator.theme.onFocusClass!=="" && showclass === "onFocus"){
					jqobj.removeClass().addClass(originalClass+" "+$.validator.theme.onFocusClass);
				}
				if($.validator.theme.onCorrectClass!=="" && showclass === "onCorrect"){
					jqobj.removeClass().addClass(originalClass+" "+$.validator.theme.onCorrectClass);
				}
				if($.validator.theme.onErrorClass!=="" && showclass === "onError"){
					jqobj.removeClass().addClass(originalClass+" "+$.validator.theme.onErrorClass);
				}
			}
		}
	},
	//把提示层重置成原始提示(如果有defaultPassed,应该设置为onCorrect)
	resetTipState : function(validatorGroup)
	{
		if(validatorGroup === undefined){validatorGroup = "1";}
		var initConfig = $.validator.getInitConfig(validatorGroup);
		$.each(initConfig.validObjects,function(){
			var setting = this.settings[0];
			var passed = setting.defaultPassed;
			$.validator.setTipState(this, passed ? "onCorrect" : "onShow", passed ? $.validator.getStatusText(this,setting.onCorrect) : setting.onShow );	
		});
	},
	//设置错误的显示信息
	setFailState : function(tipID,showmsg)
	{
		$.validator.setTipState($("#"+tipID).get(0), "onError", showmsg);
	},
	//根据单个对象,正确:正确提示,错误:错误提示
	showMessage : function(returnObj)
	{
	    var id = returnObj.id;
		var elem = $("#"+id).get(0);
		var isValid = returnObj.isValid;
		var setting = returnObj.setting;//正确:setting[0],错误:对应的setting[i]
		var showmsg = "",showclass = "";
		var intiConfig = $.validator.getInitConfig(elem.validatorGroup);
		if (!isValid)
		{		
			showclass = "onError";
			showmsg = (returnObj.errormsg===""? $.validator.getStatusText(elem,setting.onError) : returnObj.errormsg);
			$.validator.setTipState(elem,showclass,showmsg);
		}else{		
			//验证成功后,如果没有设置成功提示信息,则给出默认提示,否则给出自定义提示;允许为空,值为空的提示
			showmsg = $.validator.isEmpty(id) ? setting.onEmpty : $.validator.getStatusText(elem,setting.onCorrect);
			$.validator.setTipState(elem,"onCorrect",showmsg);
		}
		return showmsg;
	},
	//获取指定字符串的长度
    getLength : function(id)
    {
        var srcjo = $("#"+id);
		var elem = srcjo.get(0);
        var sType = elem.type;
        var len = 0;
        function charLen(charCode){
			var space=1;
			// 不在ASCII码范围内的都算作3个字符长度
			if(charCode > 128){
				space=3;
			}
			return space;
		}
        function strLength(){
	        var val = srcjo.val();
			var setting = elem.settings[0];
			//如果有显示提示内容的，要忽略掉
			if(elem.isInputControl && elem.value === setting.onShow){val="";}
			var initConfig = $.validator.getInitConfig(elem.validatorGroup);
			if (initConfig.wideWord){
				for (var i = 0; i < val.length; i++) {
					len = len + charLen(val.charCodeAt(i)); 
				}
			}else{
				len = val.length;
			}
			return len;
        }
        switch(sType)
		{
			case "text":
			case "hidden":
			case "password":
			case "textarea":
				// 为了和服务器端统一，回车符算两个字符
				len = len + srcjo.val().split('\n').length-1;
			case "file":
				len = strLength();
		        break;
			case "checkbox":
			case "radio": 
				len = $("input[type='"+sType+"'][name='"+srcjo.attr("name")+"']:checked").length;
				break;
		    case "select-one":
		        len = elem.options ? elem.options.selectedIndex : -1;
				break;
			case "select-multiple":
				len = $("select[name="+elem.name+"] option:selected").length;
				break;
	    }
		return len;
    },
	//结合empty这个属性，判断仅仅是否为空的校验情况。
    isEmpty : function(id)
    {
        return ($("#"+id).get(0).settings[0].empty && $.validator.getLength(id)===0);
    },
	//对外调用：判断单个表单元素是否验证通过，不带回调函数
    isOneValid : function(id)
    {
	    return $.validator.oneIsValid(id).isValid;
    },
	//验证单个是否验证通过,正确返回settings[0],错误返回对应的settings[i]
	oneIsValid : function (id)
	{
		var returnObj = {};
		var elem = $("#"+id).get(0);
		var initConfig = $.validator.getInitConfig(elem.validatorGroup);
		returnObj.initConfig = initConfig;
		returnObj.id = id;
		returnObj.ajax = -1;
		returnObj.errormsg = "";       //自定义错误信息
	    var settings = elem.settings;
	    var settingslen = settings.length;
		var validateType;
		//只有一个formValidator的时候不检验
		if (settingslen===1){settings[0].bind=false;}
		if(!settings[0].bind){return null;}
		$.validator.resetInputValue(true,initConfig,id);
		for ( var i = 0 ; i < settingslen ; i ++ )
		{   
			if(i===0){
				//如果为空，直接返回正确
				if($.validator.isEmpty(id)){
					returnObj.isValid = true;
					returnObj.setting = settings[0];
					break;
				}
				continue;
			}
			returnObj.setting = settings[i];
			validateType = settings[i].validateType;
			//根据类型触发校验
			switch(validateType)
			{
				case "inputValidator":
					$.validator.inputValid(returnObj);
					break;
				case "compareValidator":
					$.validator.compareValid(returnObj);
					break;
				case "regexValidator":
					$.validator.regexValid(returnObj);
					break;
				case "functionValidator":
					$.validator.functionValid(returnObj);
					break;
			}
			//校验过一次
			elem.onceValided = true;
			if(!settings[i].isValid) {
				returnObj.isValid = false;
				returnObj.setting = settings[i];
				break;
			}else{
				returnObj.isValid = true;
				returnObj.setting = settings[0];
			}
		}
		$.validator.resetInputValue(false,initConfig,id);
		return returnObj;
	},
	//验证所有需要验证的对象，并返回是否验证成功（如果曾经触发过ajaxValidator，提交的时候就不触发校验，直接读取结果）
	pageIsValid : function (validatorGroup)
	{
	    if(validatorGroup === undefined){validatorGroup = "1";}
		var isValid = true,returnObj,firstErrorMessage="",errorMessage;
		var error_tip = "^",thefirstid="",name,name_list="^";
		var errorlist = [];
		//设置提交状态、ajax是否出错、错误列表
		var initConfig = $.validator.getInitConfig(validatorGroup);
		initConfig.status = "sumbiting";
		//遍历所有要校验的控件,如果存在ajaxValidator就先直接触发
		$.each(initConfig.validObjects,function()
		{
			if($(this).length===0){return true;}
			if (this.settings[0].bind && this.validatorAjaxIndex!==undefined && this.onceValided === undefined) {
				returnObj = $.validator.oneIsValid(this.id);
				if (returnObj.ajax === this.validatorAjaxIndex) {
					initConfig.status = "sumbitingWithAjax";
					$.validator.ajaxValid(returnObj);
				}
			}
		});
		//遍历所有要校验的控件
		$.each(initConfig.validObjects,function()
		{
			//只校验绑定的控件
			if($(this).length===0){return true;}
			if(this.settings[0].bind){
				name = this.name;
				//相同name只校验一次
				if (name_list.indexOf("^"+name+"^") === -1) {
					//onceValided = this.onceValided === undefined ? false : this.onceValided;
					if(name){name_list = name_list + name + "^";}
					returnObj = $.validator.oneIsValid(this.id);
					if (returnObj) {
						//校验失败,获取第一个发生错误的信息和ID
						if (!returnObj.isValid) {
							//记录不含ajaxValidator校验函数的校验结果
							isValid = false;
							errorMessage = returnObj.errormsg === "" ? returnObj.setting.onError : returnObj.errormsg;
							errorlist[errorlist.length] = errorMessage;
							if (thefirstid === null) {thefirstid = returnObj.id;}
							if(firstErrorMessage===""){firstErrorMessage=errorMessage;}
						}
						//为了解决使用同个TIP提示问题:后面的成功或失败都不覆盖前面的失败
						
						var tipID = this.settings[0].tipID;
						if (error_tip.indexOf("^" + tipID + "^") === -1) {
							if (!returnObj.isValid) {error_tip = error_tip + tipID + "^";}
							$.validator.showMessage(returnObj);
						}
					}
				}
			}
		});
		
		//成功或失败进行回调函数的处理，以及成功后的灰掉提交按钮的功能
		if(isValid)
		{
            if(!initConfig.onSuccess()){return false;}
			if(initConfig.submitOnce){$(":submit,:button,:reset").attr("disabled",true);}
		}
		else
		{
			initConfig.onError(firstErrorMessage, $("#" + thefirstid).get(0), errorlist);
			if (thefirstid && initConfig.errorFocus) {$("#" + thefirstid).focus();}
		}
		initConfig.status="init";
		if(isValid && initConfig.debug){alert("现在正处于调试模式(debug:true)，不能提交");}
		return !initConfig.debug && isValid;
	},
	//把编码decodeURIComponent反转之后，再escape
	serialize : function(objs,initConfig)
	{
		if(initConfig!==undefined){$.validator.resetInputValue(true,initConfig);}
		var parmString = $(objs).serialize();
		if(initConfig!==undefined){$.validator.resetInputValue(false,initConfig);}
		var parmArray = parmString.split("&");
		var parmStringNew="";
		$.each(parmArray,function(index,data){
			var li_pos = data.indexOf("=");	
			if(li_pos >0){
				var name = data.substring(0,li_pos);
				var value = escape(decodeURIComponent(data.substr(li_pos+1)));
				var parm = name+"="+value;
				parmStringNew = parmStringNew==="" ? parm : parmStringNew + '&' + parm;
			}
		});
		return parmStringNew;
	},
	//对正则表达式进行校验（目前只针对input和textarea）
	regexValid : function(returnObj)
	{
		var id = returnObj.id;
		var setting = returnObj.setting;
		//var srcTag = $("#"+id).get(0).tagName;
		var elem = $("#"+id).get(0);
		var isValid=false;
		//如果有输入正则表达式，就进行表达式校验
		if(elem.settings[0].empty && elem.value===""){
			setting.isValid = true;
		}
		else 
		{
			var regexArray = setting.regExp;
			setting.isValid = false;
			if((typeof regexArray)==="string"){
				regexArray = [regexArray];
			}
			$.each(regexArray, function() {
				var r = this;
				if(setting.dataType==="enum"){
					r = $.validator.getRegex(''+r);
				}			
				if(r===undefined || r==="") {
					return false;
				}
				isValid = (new RegExp(r, setting.param)).test($(elem).val());
				
				if(setting.compareType==="||" && isValid){
					setting.isValid = true;
					return false;
				}
				if(setting.compareType==="&&" && !isValid) 
				{
				    return false;
				}
            });
			if(!setting.isValid){
				setting.isValid = isValid;
			}
		}
	},
	//函数校验。返回true/false表示校验是否成功;返回字符串表示错误信息，校验失败;如果没有返回值表示处理函数，校验成功
	functionValid : function(returnObj)
	{
		var id = returnObj.id;
		var setting = returnObj.setting;
		var srcjo = $("#"+id);
		var lb_ret = setting.fun(srcjo.val(),srcjo.get(0));
		if(lb_ret !== undefined) 
		{
			if((typeof lb_ret) === "string"){
				setting.isValid = false;
				returnObj.errormsg = lb_ret;
			}else{
				setting.isValid = lb_ret;
			}
		}else{
		    setting.isValid = true;
		}
	},
	//对input和select类型控件进行校验
	inputValid : function(returnObj)
	{
		var id = returnObj.id;
		var setting = returnObj.setting;
		var srcjo = $("#"+id);
		var elem = srcjo.get(0);
		var val = srcjo.val();
		var sType = elem.type;
		var len = $.validator.getLength(id);
		var empty = setting.empty,emptyError = false;
		switch(sType)
		{
			case "text":
			case "hidden":
			case "password":
			case "textarea":
			case "file":
				if (setting.type === "size") {
					empty = setting.empty;
					if(!empty.leftEmpty){
						emptyError = (val.replace(/^[ \s]+/, '').length !== val.length);
					}
					if(!emptyError && !empty.rightEmpty){
						emptyError = (val.replace(/[ \s]+$/, '').length !== val.length);
					}
					if(emptyError && empty.emptyError){returnObj.errormsg= empty.emptyError;}
				}
			case "checkbox":
			case "select-one":
			case "select-multiple":
			case "radio":
				var lb_go_on = false;
				if(sType==="select-one" || sType==="select-multiple"){setting.type = "size";}
				var type = setting.type;
				if (type === "size") {		//获得输入的字符长度，并进行校验
					if(!emptyError){lb_go_on = true;}
					if(lb_go_on){val = len;}
				}else{
					var stype = (typeof setting.min);
					if((stype ==="number" && !isNaN(parseInt(val,10))) || stype ==="string"){
						lb_go_on = true;
					}
				}
				setting.isValid = false;
				if(!lb_go_on){
					return;
				}
				if(val < setting.min || val > setting.max){
					if(val < setting.min && setting.onErrorMin){
						returnObj.errormsg= setting.onErrorMin;
					}else if(val > setting.max && setting.onErrorMax){
						returnObj.errormsg= setting.onErrorMax;
					}
				}else{
					setting.isValid = true;
				}
				break;
		}
	},
	//对两个控件进行比较校验
	compareValid : function(returnObj)
	{
		var id = returnObj.id;
		var setting = returnObj.setting;
		var srcjo = $("#"+id);
	    var desjo = $("#"+setting.desID );
		var ls_dataType = setting.dataType;
		
		var curvalue = srcjo.val();
		var ls_data = desjo.val();
		if(ls_dataType==="number")
        {
            if(!isNaN(curvalue) && !isNaN(ls_data)){
				curvalue = parseFloat(curvalue);
                ls_data = parseFloat(ls_data);
			}
			else{
			    return;
			}
        }
	    switch(setting.operateor)
	    {
	        case "=":
	            setting.isValid = (curvalue === ls_data);
	            break;
	        case "!=":
	            setting.isValid = (curvalue !== ls_data);
	            break;
	        case ">":
	            setting.isValid = (curvalue > ls_data);
	            break;
	        case ">=":
	            setting.isValid = (curvalue >= ls_data);
	            break;
	        case "<": 
	            setting.isValid = (curvalue < ls_data);
	            break;
	        case "<=":
	            setting.isValid = (curvalue <= ls_data);
	            break;
			default :
				setting.isValid = false;
				break; 
	    }
	},
	getStatusText : function(elem,obj)
	{
		return ($.isFunction(obj) ? obj($(elem).val()) : obj);
	},
	resetInputValue : function(real,initConfig,id)
	{
		var showTextObjects;
		if(id){
			showTextObjects = $("#"+id);
		}else{
			showTextObjects = $(initConfig.showTextObjects);
		}
		showTextObjects.each(function(index,elem){
			if(elem.isInputControl){
				var showText = elem.settings[0].onShow;
				if(real && showText===elem.value){elem.value = "";}
				if(!real && showText!=="" && elem.value === ""){elem.value = showText;}
			}
		});
	}
};

/*
 * various validator
 * */
$.fn.extend({
	//每个校验控件必须初始化的
	formValidator : function(cs) 
	{
		cs = cs || {};
		var setting = {};
		var formValidator_setting = {
			validatorGroup : "1",
			onShowColor:{mouseOnColor:"#000000",mouseOutColor:"#999999"},
			onShowFixText:"",
			onShow :"",
			onFocus: "请输入内容",
			onCorrect: "输入正确",
			onEmpty: "输入内容为空",
			empty :false,
			defaultValue : null,
			bind : true,
			ajax : false,
			validateType : "formValidator",
			triggerEvent:"blur",
			forceValid : false,
			tipID : null,
			fixTipID : null,
			relativeID : null,
			index : 0,
			leftTrim : false,
			rightTrim : false
		};
		
		//获取该校验组的全局配置信息
		if(cs.validatorGroup === undefined){cs.validatorGroup = "1";}
		//先合并整个配置(深度拷贝)
		$.extend(true,setting, formValidator_setting);
		var initConfig = $.validator.getInitConfig(cs.validatorGroup);
		//先合并整个配置(深度拷贝)
		$.extend(true,setting, cs || {});

		return this.each(function(e)
		{
			//记录该控件的校验顺序号和校验组号
			//this.validatorIndex = initConfig.validCount - 1;
			this.validatorGroup = cs.validatorGroup;
			var jqobj = $(this);
			//自动形成TIP
			var setting_temp = {};
			$.extend(true,setting_temp, setting);
			//判断是否有ID
			var id = jqobj.attr('id');
			if(!id)
			{ 
				id = Math.ceil(Math.random()*50000000); 
				jqobj.attr('id', id);
			}
			var tip = setting_temp.tipID ? setting_temp.tipID : id+"-tip";
	        
			//每个控件都要保存这个配置信息、为了取数方便，冗余一份控件总体配置到控件上
			setting.tipID = tip;
			setting.originalClass=jqobj.attr("class");
			//setting.pwdTipID = setting_temp.pwdTipID ? setting_temp.pwdTipID : setting.tipID;
			setting.fixTipID = setting_temp.fixTipID ? setting_temp.fixTipID : id+"FixTip";
			$.validator.appendValid(id,setting);

			//保存控件ID
			var validIndex = $.inArray(jqobj,initConfig.validObjects);
			if(validIndex === -1){
				initConfig.validObjects.push(this);
			}else{
				initConfig.validObjects[validIndex] = this;
			}

			$.validator.setTipState(this,"onShow",setting.onShow);

			var srcTag = this.tagName.toLowerCase();
			var stype = this.type;
			var defaultval = setting.defaultValue;
			var isInputControl = stype === "password" || stype === "text" || stype === "textarea";
			this.isInputControl = isInputControl;
			//处理默认值
			if(defaultval){
				jqobj.val(defaultval);
			}
			//获取输入框内的提示内容
	        var showText = setting.onShow;
			if(srcTag === "input" || srcTag==="textarea")
			{
				if (isInputControl) {
					if(showText !==""){
						var showObjs = initConfig.showTextObjects;
						initConfig.showTextObjects = showObjs + (showObjs !== "" ? ",#" : "#") + id;
						jqobj.val(showText);
						jqobj.css("color",setting.onShowColor.mouseOutColor);
					}
				}
				//注册获得焦点的事件。改变提示对象的文字和样式，保存原值
				jqobj.focus(function()
				{	
					if (isInputControl) {
						var val = jqobj.val();
						this.validValueOld = val;
						if(showText===val){
							this.value = "";
							jqobj.css("color",setting.onShowColor.mouseOnColor);
						}
					}

					//保存原来的状态
					var tipjq = $("#"+tip);
					this.lastshowclass = tipjq.attr("class");
					this.lastshowmsg = tipjq.text();
					$.validator.setTipState(this,"onFocus",setting.onFocus);
					
				});
				//注册失去焦点的事件。进行校验，改变提示对象的文字和样式；出错就提示处理
				jqobj.bind(setting.triggerEvent, function(){
					var settings = this.settings;
					//根据配置截掉左右的空格,不支持文件选择标签
					if(stype!=="file"){
						
						if(settings[0].leftTrim){this.value = this.value.replace(/^\s*/g, "");}
						if(settings[0].rightTrim){this.value = this.value.replace(/\s*$/g, "");}
						
						//恢复默认值
						if(isInputControl){
							if(this.value === "" && showText !== ""){this.value = showText;}
							if(this.value === showText){jqobj.css("color",setting.onShowColor.mouseOutColor);}
						}
					}
					//进行有效性校验
					var returnObj = $.validator.oneIsValid(id);
					if(returnObj===null){return;}
					$.validator.showMessage(returnObj);
				});
			} 
			else if (srcTag === "select")
			{
				jqobj.bind({
					//获得焦点
					focus: function(){	
							$.validator.setTipState(this, "onFocus", setting.onFocus);
					},
					//失去焦点
					blur: function(){
						if(this.validValueOld===undefined || this.validValueOld===jqobj.val()){$(this).trigger("change");}
					},
					//选择项目后触发
					change: function(){
						var returnObj = $.validator.oneIsValid(id);	
						if(returnObj===null){return;}
						$.validator.showMessage(returnObj); 
					}
				});
			}
		});
	},
	inputValidator : function(controlOptions)
	{
		var settings = {};
		var inputValidator_setting = {
				isValid : false,
				type : "size",
				min : 0,
				max : 99999,
				onError:"输入错误",
				validateType:"inputValidator",
				empty:{leftEmpty:true,rightEmpty:true,leftEmptyError:null,rightEmptyError:null}
			};
		$.extend(true, settings, inputValidator_setting, controlOptions || {});
		return this.each(function(){
			$.validator.appendValid(this.id,settings);
		});
	},
	compareValidator : function(controlOptions)
	{
		var settings = {};
		var compareValidator_setting = {
				isValid : false,
				desID : "",
				operateor :"=",
				onError:"输入错误",
				validateType:"compareValidator"
			};
		$.extend(true, settings, compareValidator_setting, controlOptions || {});
		return this.each(function(){
			$.validator.appendValid(this.id,settings);
		});
	},
	regexValidator : function(controlOptions)
	{
		var settings = {};
		var regexValidator_setting = {
				isValid : false,
				regExp : "",
				param : "i",
				dataType : "string",
				compareType : "||",
				onError:"输入的格式不正确",
				validateType:"regexValidator"
			};
		$.extend(true, settings, regexValidator_setting, controlOptions || {});
		return this.each(function(){
			$.validator.appendValid(this.id,settings);
		});
	},
	functionValidator : function(controlOptions)
	{
		var settings = {};
		var functionValidator_setting = {
				isValid : true,
				fun : function(){this.isValid = true;},
				validateType:"functionValidator",
				onError:"输入错误"
			};
		$.extend(true, settings, functionValidator_setting, controlOptions || {});
		return this.each(function(){
			$.validator.appendValid(this.id,settings);
		});
	},

	defaultPassed : function(onShow)
	{
		return this.each(function()
		{
			var settings = this.settings;
			settings[0].defaultPassed = true;
			this.onceValided = true;
			for ( var i = 1 ; i < settings.length ; i ++ )
			{   
				settings[i].isValid = true;
					var ls_style = onShow ? "onShow" : "onCorrect";
					$.validator.setTipState(this,ls_style,settings[0].onCorrect);
			}
		});
	},
	unFormValidator : function(unbind)
	{
		//指定控件不参加校验
		return this.each(function()
		{
		    if(this.settings)
		    {
			    this.settings[0].bind = !unbind;
			    if(unbind){
				    $("#"+this.settings[0].tipID).hide();
			    }else{
				    $("#"+this.settings[0].tipID).show();
			    }
			}
		});
	}
});
	
})(jQuery);

/*!
 * ##注意事项## 
 * 1. 充分使用functionValidator进行自定义校验，例如密码强度校验，Ajax校验等
 * 2. file类型的input后面不能直接跟着span标签的提示，否则会无法触发blur事件，校验失效
 */