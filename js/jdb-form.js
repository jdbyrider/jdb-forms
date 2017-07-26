var bootstrapJs = require('./bootstrap.min.js');
var validatorJs = require('./validator.min.js');
var bootstrapFormHelpersJs = require('./bootstrap-formhelpers.min.js');
var utils = require('./formUtils.js');
var formBL = require('./formBL.js');
var formTemplates = require('./form-templates.js');
var formSettings = data;	

function init(){		
	var bar = null;
	var pageContent = formTemplates.getFormContent(formSettings.formType, utils);	
	bar = utils.renderPage(pageContent, formSettings, bar);	
	formBL.attachEventListeners(formSettings, bar);	
}

init();







