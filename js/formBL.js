"use strict"

var utils = require('./formUtils.js');


var formBL = module.exports = {
	
	attachEventListeners: function(formSettings, bar){
		formBL.attachWindowLoadListener(formSettings);
		formBL.attachKeyUpKeyPressListener();
		formBL.attachSubmitButtonListener(formSettings, bar);				
		if(!formSettings.singlePage){
			formBL.attachSubmitButtonListener2(formSettings);
			utils.attachGoogleMapsAutoCompleteListener();
		}
	},
	
	attachWindowLoadListener: function(formSettings) {
		window.onload = function() {	
			utils.handleVisitorIdValue(formSettings);
			utils.handleAttributionValue(formSettings);
			utils.handleRoutingValue(formSettings);
		}
	},
	
	attachKeyUpKeyPressListener: function () {
		$('#jdbForm').on('keyup keypress', function(e) {
			var keyCode = e.keyCode || e.which;
			if (keyCode === 13) { 
				e.preventDefault();
				return false;
			}
		});
	},
	
	attachSubmitButtonListener: function (formSettings, bar) {
		$('#jdbForm').validator().on('submit', function (e) {
			if (e.isDefaultPrevented()) {				
				formBL.iterateFormValues(e, formSettings);
			} 
			else{
				
				if(formSettings.singlePage){
					e.preventDefault();
					formBL.iterateFormValues(e, formSettings);
				}
				else{
					e.preventDefault();
					var settings = { skipAddress: true, };
					formBL.iterateFormValues(e, formSettings, settings);
					utils.toggleScrolling();
					$("#jdbForm").fadeOut();
					if(bar){
						bar.animate(.5);
					}
					$("#jdb-form-submit-success").fadeIn(2500);
					$("#jdbForm2").fadeIn(function(){ 
						utils.toggleScrolling();
					});
				}
			}
		});
	},
	
	attachSubmitButtonListener2: function (formSettings) {
		$('#jdbForm2').validator().on('submit', function (e) {
			if (e.isDefaultPrevented()) {				
				formBL.iterateFormValues(e, formSettings);
			} 
			else{
				
				if(this.id == "jdbForm2"){
					e.preventDefault();
					var settings = { id:  this.id };
					formBL.iterateFormValues(e, formSettings, settings);
				}
			}
		});
	},	
	
	iterateFormValues: function(e, formSettings, settings){	
		var errors = [];
		var blankFields = [];	
		var lead = utils.getLeadTemplate(formSettings);
		
		_.forEach($(".form-control"), function(field){ 
			if(blankFields.length == 0){				
				formBL.setLeadPropertyFromField(field, errors, e, blankFields, lead, settings);
			}
		});	
		
		if(errors.length > 0){
			formBL.alertWithErrors(errors);
		} 
		else if (blankFields.length == 0) {					
			var payload = JSON.stringify(formBL.formalizeLeadObject(lead, formSettings));			
			formBL.postToServer(payload, formSettings, settings);
		}
	},
	
	countErrors: function(errorCount){	
		var errorCount = 0;
		
		$('.form-group').each(function() { 
			if($(this).hasClass('has-error')){
				errorCount = errorCount + 1;
			}
		});    
		
		return errorCount;
	},
	
	formalizeLeadObject: function(lead, formSettings){
		// if(formBL.isObjectEmpty(lead.PersonalInfo)){
		// delete lead.PersonalInfo;
		// }
		if(utils.isObjectEmpty(lead.creditInfo)){
			delete lead.creditInfo;
		}
		if(lead.residenceInfo.zipPostalCode == "00000" && lead.contactSrcCd == "D"){	
			if(formSettings.testZip.trim() != ""){
				lead.residenceInfo.zipPostalCode = formSettings.testZip;
			}
		}
		return lead;
	},
	
	//https://stackoverflow.com/questions/42863942/using-ajax-to-run-php-function
	postToServer: function(payload, formSettings, settings){	
		$.ajax({
			type: "POST", 
			url: "./php/discover-post.php",
			dataType: "json",
			data: {'payload': payload},         
			success: function(response) { 				
				if(response.success){
					if (formSettings.singlePage) {
						window.location.replace(formSettings.thankYouPage + "?id=" + response.custNum);
					};
					if (settings.id == "jdbForm2"){
						window.location.replace(formSettings.thankYouPage + "?id=" + response.custNum);
					}
				}
				else {
					console.log(response);
				}
			},
			error: function(response) { 
				
			}
		});
	},
	
	alertWithErrors: function(errors){
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
	},
	
	setLeadPropertyFromField: function(field, errors, e, blankFields, lead, settings){
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
		if(!$('#'+field.id).val() && !settings.skipAddress){
			errors.push("Street number");
		}
		else {
			lead.residenceInfo.address1 = $('#'+field.id).val();
		}
		break;
		
		case "route":
		if(!$('#'+field.id).val() && !settings.skipAddress){
			errors.push("Street address");
		}
		else {
			lead.residenceInfo.address1 = lead.residenceInfo.address1 + " " + $('#'+field.id).val();
		}
		break;
		
		case "locality":
		if(!$('#'+field.id).val() && !settings.skipAddress){
			errors.push("City");
		}
		else {
			lead.residenceInfo.city = $('#'+field.id).val();
		}
		break;
		
		case "administrative_area_level_1":
		if(!$('#'+field.id).val() && !settings.skipAddress){
			errors.push("State");
		}
		else {
			lead.residenceInfo.stateProvince = $('#'+field.id).val();
		}
		break;
		
		case "postal_code":
		if(!$('#'+field.id).val() && !settings.skipAddress){
			errors.push("Zip Code");
		}
		else {
			if($('#'+field.id).val().trim() != ""){
				lead.residenceInfo.zipPostalCode = $('#'+field.id).val();
			}
		}		
		break;					
	}
	
	return lead;
},


}	

return formBL;