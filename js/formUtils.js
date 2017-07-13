module.exports = {	
	getLeadTemplate: function() {
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
		
		return lead;
	},
	
	getLeadJsonString: function(){ 
		var leadJsonString = "{\"leadId\":\"a7b13b31-45a1-4883-b74d-11bad574d88e\",\"contactSrcCd\":\"Z\",\"adDesc\":\"www.gojdb.com\",\"uId\":\"\",\"firstName\":\"ryan\",\"lastName\":\"test\",\"routingValue\":\"IN101\",\"adSrcCatCd\":\"W\",\"haveTradeIn\":\"\",\"PersonalInfo\":{\"ssn\":\"\",\"dob\":\"\",\"gender\":\"\",\"bankruptcy\":\"\",\"cosignerAvailable\":\"\",\"grossMonthlyIncome\":\"\"},\"PhoneInfo\":[{\"phoneNum\":\"7659933427\",\"phoneType\":\"H\"}],\"residenceInfo\":{\"type\":\"H\",\"address1\":\"15492 Old Pond Circle\",\"city\":\"Noblesville\",\"stateProvince\":\"IN\",\"zipPostalCode\":\"46060\"},\"EmailInfo\":{\"email\":\"ryantest@jdbyrider.com\"}}";
		
		return leadJsonString;
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
		var formTypes = {singlePage: "singlePage", twoPage: "twoPage" };
		
		return formTypes;
	},
}	