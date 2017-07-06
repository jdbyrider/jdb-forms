var ProgressBar = require('./progressbar.min.js');
var bootstrapJs = require('./bootstrap.min.js');
var validatorJs = require('./validator.min.js');
var bootstrapFormHelpersJs = require('./bootstrap-formhelpers.min.js');


var lead = {
	leadId: generateGUID(),
	contactSrcCd: 'Z',
	adDesc: 'www.gojdb.com',
	uId: '',
	firstName: '',
	lastName: '',
	routingValue: '',
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
		zipPostalCode: ''
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

var leadJsonString = "{\"leadId\":\"a7b13b31-45a1-4883-b74d-11bad574d88e\",\"contactSrcCd\":\"Z\",\"adDesc\":\"www.gojdb.com\",\"uId\":\"\",\"firstName\":\"ryan\",\"lastName\":\"test\",\"routingValue\":\"IN101\",\"adSrcCatCd\":\"W\",\"haveTradeIn\":\"\",\"PersonalInfo\":{\"ssn\":\"\",\"dob\":\"\",\"gender\":\"\",\"bankruptcy\":\"\",\"cosignerAvailable\":\"\",\"grossMonthlyIncome\":\"\"},\"PhoneInfo\":[{\"phoneNum\":\"7659933427\",\"phoneType\":\"H\"}],\"residenceInfo\":{\"type\":\"H\",\"address1\":\"15492 Old Pond Circle\",\"city\":\"Noblesville\",\"stateProvince\":\"IN\",\"zipPostalCode\":\"46060\"},\"EmailInfo\":{\"email\":\"ryantest@jdbyrider.com\"}}"

function iterateFormValues(e){
	var errors = [];
	var blankFields = [];	
	
	_.forEach($(".form-control"), function(field){ 
		if(blankFields.length == 0){
			setLeadPropertyFromField(field, errors, e, blankFields);
		}
	});	
	
	if(errors.length > 0){
		alertWithErrors(errors);
	} 
	else if (blankFields.length ==0) {	
		var payload = JSON.stringify(lead);
		postToServer(payload);
	}
}

//https://stackoverflow.com/questions/42863942/using-ajax-to-run-php-function
function postToServer(payload){
	$.ajax({
        type: "POST", 
        url: "./discover-post.php",
		dataType: "json",
        data: {'payload': payload},         
        success: function(response) { 
            console.log(response);
		},
        error: function(response) { 
			console.log(response);
		}
	});
}

function alertWithErrors(errors){
	var missingItems = "We are missing some of your address information. We did not receive your ";
	var endOfSentence = "\n\nPlease make sure that you enter your full address and select your address from the dropdown menu.";
	_.forEach(errors, function(error){
		var currentIndex = _.findIndex(errors, function(e) {
			return e == error;
		});
		var lastIndex = _.size(errors) - 1;
		if(currentIndex != lastIndex)
		{
			missingItems = missingItems + error + ", ";
		}
		else if (_.size(errors) == 1)
		{
			missingItems = missingItems + errors + ". ";
		}
		else
		{
			missingItems = missingItems + "or " + error + ".";	
		}
	});	
	
	alert(missingItems + endOfSentence);
}

function setLeadPropertyFromField(field, errors, e, blankFields){
	switch(field.id) {
		
		case "firstName":	
		if(!$('#'+field.id).val() || $('#'+field.id).closest(".form-group").hasClass("has-error")){
			e.stopPropagation();
			blankFields.push(1);
		}
		else {
			lead.firstName = $('#'+field.id).val();
		}
		break;
		
		case "lastName":		
		if(!$('#'+field.id).val() || $('#'+field.id).closest(".form-group").hasClass("has-error")){
			e.stopPropagation();
			blankFields.push(1);
		}
		else {
			lead.lastName = $('#'+field.id).val();
		}
		break;
		
		case "email":
		if(!$('#'+field.id).val() || $('#'+field.id).closest(".form-group").hasClass("has-error")){
			e.stopPropagation();
			blankFields.push(1);
		}
		else {
			lead.EmailInfo.email = $('#'+field.id).val();
		}
		break;
		
		case "phoneNum":
		if(!$('#'+field.id).val() || $('#'+field.id).closest(".form-group").hasClass("has-error")){
			e.stopPropagation();
			blankFields.push(1);
		}
		else {
			lead.PhoneInfo[0].phoneNum = $('#'+field.id).val().replace(/\D/g,'');
		}
		break;
		
		case "street_number":
		if(!$('#'+field.id).val()){
			errors.push("Street number");
		}
		else {
			lead.residenceInfo.address1 = $('#'+field.id).val();
		}
		break;
		
		case "route":
		if(!$('#'+field.id).val()){
			errors.push("Street address");
		}
		else {
			lead.residenceInfo.address1 = lead.residenceInfo.address1 + " " + $('#'+field.id).val();
		}
		break;
		
		case "locality":
		if(!$('#'+field.id).val()){
			errors.push("City");
		}
		else {
			lead.residenceInfo.city = $('#'+field.id).val();
		}
		break;
		
		case "administrative_area_level_1":
		if(!$('#'+field.id).val()){
			errors.push("State");
		}
		else {
			lead.residenceInfo.stateProvince = $('#'+field.id).val();
		}
		break;
		
		case "postal_code":
		if(!$('#'+field.id).val()){
			errors.push("Zip Code");
		}
		else {
			lead.residenceInfo.zipPostalCode = $('#'+field.id).val();
		}		
		break;						
	}
}

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
						var errorCount = countErrors();
						countErrors(errorCount);
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

function toggleScrolling() {
	if($(document.body).css("overflow-y") == "hidden"){
		$(document.body).css("overflow-y", "visible");
		$("html").css("overflow-y", "visible");
		} else {
		$(document.body).css("overflow-y", "hidden");
		$("html").css("overflow-y", "hidden");
	}
	
}

function countErrors(errorCount){	
	var errorCount = 0;
	
	$('.form-group').each(function() { 
		if($(this).hasClass('has-error')){
			errorCount = errorCount + 1;
		}
	});    
	
	return errorCount;
}

$('#jdbForm').on('keyup keypress', function(e) {
	var keyCode = e.keyCode || e.which;
	if (keyCode === 13) { 
		e.preventDefault();
		return false;
	}
});

$('#jdbForm').validator().on('submit', function (e) {
	if (e.isDefaultPrevented()) {
		//postToServer(leadJsonString);
		//iterateFormValues(e);
		toggleScrolling();
		$("#jdbForm").fadeOut();
		bar.animate(.5);
		$("#jdb-form-submit-success").fadeIn(2500);
		$("#jdbForm2").fadeIn(function(){ 
			toggleScrolling();
		});
		
		} else {
		iterateFormValues(e);
	}
});

window.onload = function() {	
	handleVisitorIdValue();
}

function handleVisitorIdValue(){
	if(!getCookie("visitorid")){
		var guid = generateGUID();
		setOrUpdateVisitorIdCookie(guid);
	}
}

function setOrUpdateVisitorIdCookie(guid){
	var expirationDate = new Date();
	expirationDate.setDate(expirationDate.getDate() + 30);
	var expirationString = "; expires=" + expirationDate.toGMTString();
	document.cookie = "visitorid=" + guid + expirationString + "; path=/";
}

//https://www.w3schools.com/js/js_cookies.asp
function getCookie(cookieName) {
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
}

//http://stackoverflow.com/a/8809472
function generateGUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
	}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

var bar = new ProgressBar.Line(progressbarcontainer, {
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






