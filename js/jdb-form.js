var bootstrapJs = require('./bootstrap.min.js');
var validatorJs = require('./validator.min.js');
var bootstrapFormHelpersJs = require('./bootstrap-formhelpers.min.js');
var utils = require('./formUtils.js');
var formBL = require('./formBL.js');

function init(){
	console.log('init');	
	var formSettings = data;
	var pageContent = readTextFile('../templates/' + formSettings.formType + '.html');
	insertPageContent(pageContent);
	if(formSettings.progressBar){	
		formBL.initProgressBar();
	}
	
	formBL.attachEventListeners();
};

function readTextFile(file){
	var allText = null;
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function ()
	{
		if(rawFile.readyState === 4)
		{
			if(rawFile.status === 200 || rawFile.status == 0)
			{
				allText = rawFile.responseText;					
			}
		}
	}
	rawFile.send(null);
	if(allText){			
		return allText;
	}
}

function insertPageContent(pageContent){
	$('.jdb-form-container').append(pageContent);	
}

init();





