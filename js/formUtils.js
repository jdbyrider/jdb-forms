var ProgressBar = require('./progressbar.min.js');


var formUtils = module.exports = {		
	
	getLeadTemplate: function(formSettings) {
		var lead = {
			leadId: formUtils.getVisitorId(formSettings),
			contactSrcCd: formUtils.getContactSrcCd(formSettings),
			adDesc: formUtils.getAttributionValue(formSettings),
			uId: '',
			firstName: '',
			lastName: '',
			routingValue: formUtils.getRoutingValue(formSettings),
			adSrcCatCd: 'W',
			haveTradeIn: '',
			PersonalInfo: {
				ssn: '',
				dob: '',
				gender: '',
				bankruptcy: '',
				cosignerAvailable: '',
				grossMonthlyIncome: ''
			},			
			PhoneInfo: [
				{
					phoneNum: '',
					phoneType: 'H'
				}
			],
			residenceInfo: {
				type: 'H',
				address1: '',
				city:'',
				stateProvince:'',		
				zipPostalCode: '00000'
			},
			creditInfo: {
				score: '',
				preApproval: '',
				creditResultsLink: '',
				apiResponse: '',
				transId: '',
				agreeInd: ''
			},
			EmailInfo: {
				email: ''
			}
		}
		
		return lead;
	},

	getLeadJsonString: function(){ 
		var leadJsonString = "{\"leadId\":\"a7c13b31-45a1-4783-b74d-11bdd574d88e\",\"contactSrcCd\":\"Z\",\"adDesc\":\"www.gojdb.com\",\"uId\":\"\",\"firstName\":\"chris\",\"lastName\":\"peacream\",\"routingValue\":\"IN101\",\"adSrcCatCd\":\"W\",\"haveTradeIn\":\"\",\"PersonalInfo\":{\"ssn\":\"\",\"dob\":\"\",\"gender\":\"\",\"bankruptcy\":\"\",\"cosignerAvailable\":\"\",\"grossMonthlyIncome\":\"\"},\"PhoneInfo\":[{\"phoneNum\":\"5555555555\",\"phoneType\":\"H\"}],\"residenceInfo\":{\"type\":\"H\",\"address1\":\"15492 Old Pond Circle\",\"city\":\"Noblesville\",\"stateProvince\":\"IN\",\"zipPostalCode\":\"46060\"},\"EmailInfo\":{\"email\":\"ryantest@jdbyrider.com\"}}";
		
		return leadJsonString;
	},
	
	//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	getParameterByName: function(name, url) {
		if (!url) {
			url = window.location.href;
		}
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	},
	
	setOrUpdateAttributionCookie: function(attributionValue){
		var expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 14);
		var expirationString = "; expires=" + expirationDate.toGMTString();
		document.cookie = "attribution=" + attributionValue + expirationString + "; path=/";
	},
	
	handleAttributionValue: function (){
		//get the attribution query param
		var attributionValue = formUtils.getParameterByName("attribution");	
		if (attributionValue && attributionValue == ""){
			//exit
			return null;
		}
		//if the query string wasn't empty, set it as a cookie and format the links
		else if (attributionValue && attributionValue != ""){	
			formUtils.setOrUpdateAttributionCookie(attributionValue);			
		}		
	},
	
	setOrUpdateRoutingValueCookie: function(routingValue){
		var expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 14);
		var expirationString = "; expires=" + expirationDate.toGMTString();
		document.cookie = "routingValue=" + routingValue + expirationString + "; path=/";
	},
	
	handleRoutingValue: function (){
		var routingValue = formUtils.getParameterByName("location");
		if (routingValue && routingValue == ""){			
			return null;
		}		
		else if (routingValue && routingValue != ""){	
			formUtils.setOrUpdateRoutingValueCookie(routingValue);			
		}	
	},	
	
	setOrUpdateVisitorIdCookie: function(guid, formSettings){	
		var expirationDate = new Date();
		expirationDate.setTime(expirationDate.getTime() + (formSettings.cookieLifeTime * 60 * 1000));
		var expirationString = "; expires=" + expirationDate.toGMTString();
		document.cookie = "visitorid=" + guid + expirationString + "; path=/";
	},
	
	handleVisitorIdValue: function(formSettings){	
		if(!formUtils.getCookie("visitorid")){
			var guid = formUtils.generateGUID();
			formUtils.setOrUpdateVisitorIdCookie(guid, formSettings);
		}
	},
	
	//https://www.w3schools.com/js/js_cookies.asp
	getCookie: function(cookieName){
		var name = cookieName + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	},
	
	toggleScrolling: function() {
		if($(document.body).css("overflow-y") == "hidden"){
			$(document.body).css("overflow-y", "visible");
			$("html").css("overflow-y", "visible");
			} else {
			$(document.body).css("overflow-y", "hidden");
			$("html").css("overflow-y", "hidden");
		}
		
	},
			
	getAttributionValue: function(){
		var attributionValue = formUtils.getCookie("attribution");	
		if(attributionValue && attributionValue != ""){
			return attributionValue;
		}
		else{
			return "jdbyrider.com";
		}
	},
		
	getRoutingValue: function(formSettings) {
		if(formSettings.routingValue.trim() != ""){
			return formSettings.routingValue;
		}
		else {
			return formUtils.getCookie("routingValue");
		}
	},
	
	getVisitorId: function() {
		var visitorId = formUtils.getCookie("visitorid");
		if(visitorId && visitorId.trim() != ""){
			return visitorId;
		}
		else return formUtils.generateGUID();
	},
	
	getContactSrcCd: function(formSettings) {
		if(formSettings.branded){
			return "Z";
		}
		
		else return "D";		
	},
	
	attachGoogleMapsAutoCompleteListener: function(){
		var pac_input = document.getElementById('autocomplete');
		
		(function pacSelectFirst(input){
			// store the original event binding function
			var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;
			
			function addEventListenerWrapper(type, listener) {
				// Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
				// and then trigger the original listener.
				
				if (type == "keydown") {
					var orig_listener = listener;
					listener = function (event) {
						var suggestion_selected = $(".pac-item-selected").length > 0;
						if (event.which == 13 && !suggestion_selected) {
							var simulated_downarrow = $.Event("keydown", {keyCode:40, which:40})
							orig_listener.apply(input, [simulated_downarrow]);
						}
						if (event.which == 9 && !suggestion_selected) {
							var simulated_downarrow = $.Event("keydown", {keyCode:40, which:40})
							orig_listener.apply(input, [simulated_downarrow]);
							
						}
						
						orig_listener.apply(input, [event]);
						if(event.which == 9 || event.which == 13){
							if(event.target.id == "autocomplete"){						
								$("#jdbForm").validator('validate');
								var errorCount = formBL.countErrors();
								formBL.countErrors(errorCount);
								if(errorCount == 0){
									$("#jdbFormSubmit").removeClass('disabled');
								}
							}
						}
					};
				}
				
				// add the modified listener
				_addEventListener.apply(input, [type, listener]);
			}
			
			if (input.addEventListener)
			input.addEventListener = addEventListenerWrapper;
			else if (input.attachEvent)
			input.attachEvent = addEventListenerWrapper;
			
		})(pac_input);
	},
	
	initProgressBar: function(bar) {
		bar = new ProgressBar.Line(progressbarcontainer, {
			strokeWidth: 4,
			easing: 'easeInOut',
			duration: 1400,
			color: '#393',
			trailColor: '#eee',
			trailWidth: 1,
			svgStyle: {width: '100%', height: '100%'},
			
			text: {
				style: {
					// Text color.
					// Default: same as stroke color (options.color)
					color: '#393',
					position: 'initial',
					right: '1',
					top: '30px',
					padding: 0,
					margin: 0,
					transform: null,	  
				},
				autoStyleContainer: false
			},
			from: {color: '#393'},
			to: {color: '#393'},
			step: function(state, bar){
				bar.setText(Math.round(bar.value() * 100) + ' %');
			}
		});
		
		return bar;
	},
		
	isObjectEmpty: function(obj){
		for (var key in obj) {
			if (obj[key] !== null && obj[key] != "")
            return false;
		}
		return true;
	},
	
	//http://stackoverflow.com/a/8809472
	generateGUID: function(){	
		var d = new Date().getTime();
		if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
			d += performance.now(); //use high-precision timer if available
		}
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	},
	
	formTypes: function() {
		var formTypes = {singlePage: "singlePage", twoPage: "twoPage", thankYouPage: "thankYouPage" };
		
		return formTypes;
	},
	
	renderPage: function(pageContent, formSettings, bar){
		$('.jdb-form-container').append(pageContent);	
				
		if(formSettings.progressBar){	
			return formUtils.initProgressBar(bar);
		}
		else 
		{
			$("#progressbarcontainer").hide();
		}		
	},
}	

return formUtils;