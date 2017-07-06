<?php 
//creates an object and returns it after jsonifying it
function buildLeadJSONPayload($leadData){
	return json_encode($leadData);
}

function buildLeadObject($entry, $rebuild = false) {
	$leadData = new StdClass();	

	$personalInfo = new StdClass();
	$personalInfo->ssn = "";
	$personalInfo->dob = "";
	$personalInfo->gender = "";
	$personalInfo->bankruptcy = "";
	$personalInfo->cosignerAvailable = "";
	$personalInfo->grossMonthlyIncome = "";
	
	$residenceInfo = new StdClass();
	$residenceInfo->type = "H";
	$residenceInfo->address1 = " ";
	$residenceInfo->zipPostalCode = "00000";
	$leadData->ResidenceInfo = $residenceInfo;
		
	$leadData->PersonalInfo = $personalInfo;
		
	if(is_site_branded()){
		$leadData->contactSrcCd = "Z";
	} else {
		$leadData->contactSrcCd = "D";
	}
	
	$leadData->adSrcCatCd = "W";
	
	if(get_current_environment() == "prod"){
		$leadData->uId = get_api_userId();	
	} else {		
		$leadData->uId = "xxxxx";	
	}	

	if($rebuild){		
		$leadData->adDesc = $entry['adDesc'];
		$leadData->routingValue = $entry['routingValue'];	
		$leadData->firstName = $entry['firstName'];
		$leadData->lastName = $entry['lastName'];		
		$leadData->EmailInfo = buildEmailInfo($entry['email']);	
		$leadData->PhoneInfo = buildPhoneInfo($entry['phoneNum']);		
		$leadData->leadId = $entry['leadId'];
	} else {							
		if(!empty($_COOKIE["visitorid"])){			
			$leadData->leadId = $_COOKIE["visitorid"];	
		} else {			
			$leadData->leadId = GUID();
		}
		
		$leadData->adDesc = $entry[2];
		$leadData->routingValue = $entry[3];	
		$leadData->firstName = $entry[100];
		$leadData->lastName = $entry[200];		
		$leadData->EmailInfo = buildEmailInfo($entry[300]);	
		$leadData->PhoneInfo = buildPhoneInfo($entry[400]);		
		
	}
	return $leadData;
}

function buildEmailInfo($email){
	$emailInfo = new StdClass();
	$emailInfo->email = $email;
	return $emailInfo;
}

function buildPhoneInfo($phoneNum){
	$phoneVals = new StdClass();
	$phoneVals->phoneNum = preg_replace("/[^0-9]/", "", $phoneNum);
	$phoneVals->phoneType = "H";
	$phoneInfo = array();
	array_push($phoneInfo, $phoneVals);		
	return $phoneInfo;
}

function setUpDbConnection(){	
	//get the database connection info for the current environment
	$dbInfo = get_db_info();	
	//use the dbinfo to build the conection	
	$conn = new mysqli($dbInfo->servername, $dbInfo->username, $dbInfo->password, $dbInfo->dbname);
	
	if ($conn->connect_error) {		
		die("Connection Failed!: " . $conn->connect_error);
	}

	return $conn;
}

function saveLeadToDb($l){
	$conn = setUpDbConnection();

	$phoneNum = $l->PhoneInfo[0]->phoneNum;
	$email = $l->EmailInfo->email;

	//create a datetime object to log to the database when this gets saved
	$mysql_date_now = date("Y-m-d H:i:s");

	$sql = "INSERT INTO wp_leaddata " . 
	"(firstName, lastName, adSrcCatCd, contactSrcCd, uId, leadId, adDesc, routingValue, email, phoneNum, originDate)" .
	"VALUES ('$l->firstName', '$l->lastName', '$l->adSrcCatCd', '$l->contactSrcCd', '$l->uId', '$l->leadId', '$l->adDesc', '$l->routingValue', '$email', '$phoneNum', '$mysql_date_now');";

	if( $conn->query($sql) === TRUE) {
		//GFCommon::log_error( "Record created!" );
		//GFCommon::log_error( "Check the sql string: " . print_r( $sql, true ));
	} else {
		//GFCommon::log_error( "Error! Check the sql string: " . print_r( $sql, true ));
		//GFCommon::log_error( "Error! Check the conn errors: " . print_r( $conn->error, true ));
	}

	$conn->close();
}

function getUnsentLeadsFromDb(){	
	$conn = setUpDbConnection();
	$sql = "SELECT * FROM wp_leaddata WHERE sentToDiscover=0 AND leadId IS NOT NULL";
	$leadRecords = array();
	$result = mysqli_query($conn, $sql);

	if (mysqli_num_rows($result) > 0) {
		// output data of each row
		while($row = mysqli_fetch_assoc($result)) {
			array_push($leadRecords, $row);			
		}
	} else {
		echo "0 results";
	}

	processLeadsToResend($leadRecords);
	mysqli_close($conn);
}

function updateSentLead($leadId, $custNum) {
	$conn = setUpDbConnection();
	//create a datetime object to log to the database when this gets saved
	$mysql_date_now = date("Y-m-d H:i:s");	
	$sql = "UPDATE wp_leaddata SET custNum=" . (string)$custNum . ", sentToDiscover=1" . ", lastRetryDate=NOW()" . " WHERE leadId='" . (string)$leadId ."'";
	
	if ($conn->query($sql) === TRUE) {
		echo( "Record updated!" );
	} else {
		echo( "sql string" . print_r( $sql, true ));
		echo( "Record not updated!" . print_r( $conn->error, true));
	}

	$conn->close();
}

function updateUnsentLead($leadId) {
	$conn = setUpDbConnection();
	//create a datetime object to log to the database when this gets saved
	$mysql_date_now = date("Y-m-d H:i:s");	
	$sql = "UPDATE wp_leaddata SET lastRetryDate=NOW()," . " numberOfRetries=numberOfRetries+1" . " WHERE leadId='" . $leadId . "'";
	if ($conn->query($sql) === TRUE) {
		echo( "Unsent lead record updated!" );
	} else {
		echo( "sql string" . print_r( $sql, true ));
		echo( "Record not updated!" . print_r( $conn->error, true));
	}

	$conn->close();
}

function processLeadsToResend($leadRecords){
	foreach ($leadRecords as &$value) {
		$lead = buildLeadObject($value, true);
		$payload = buildLeadJSONPayload($lead);
		echo("getting access token");
		$accessToken = getAccessToken();
		echo("posting to discover");
		$results = post_to_discover($accessToken, $payload);
		$leadId = $lead->leadId;
		if($results->postedToDiscover){
			echo( "Successfully remediated lead to discover! Results: " );	
			var_dump($results);						
			$json = $results->response;										
			$custNum = $json->custNum;
			//update the lead in the mysql database with the custnum and relevant fields
			echo("updating sent lead");
			updateSentLead($leadId, $custNum);			
		}
		else{
			echo( "Didn't post to discover");
			//update the lead in the mysql database with the failure num and relevant fields
			echo("updating unsent lead");
			updateUnsentLead($leadId);		
		}
	}
}

function getAccessToken(){	
	$bearToken = get_bear_token();	
	$access_token = $bearToken->{'access_token'};
	return $access_token;
}

function setupCurl($service_url, $headers){
	$ch = curl_init($service_url);
	curl_setopt($ch,  CURLOPT_HTTPHEADER, $headers);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POST, 1);	
	return $ch;
}

function submitLeadInfoToDiscover ( $entry ) {
	//log the entry value	
	$access_token = getAccessToken();
	//lead object
	$leadData = buildLeadObject($entry);
	//body of request	
	$jsonPayload = buildLeadJSONPayload($leadData);		
	$results = post_to_discover($access_token, $jsonPayload);	
	
	if($results->postedToDiscover){
	
	} else {

		if(isDbConfigured()){
			echo('Lead not sent to discover. Saving to mysql db! '. print_r($leadData, true) );
			saveLeadToDb($leadData);
		}
	}
}

function get_bear_token () {	
	//get the url for the oath endpoint
	$service_url = get_oath_url();
	//get the data to be posted
	$curl_post_data = get_auth_request_body();	
	//initialize curl
	$ch = setupCurl($service_url, array($curl_post_data['header']));	
	//remove the unnecessary  data from the post body
	unset($curl_post_data['header']);
	unset($curl_post_data['method']);
	//create a query string from the post body
	$curl_post_data = http_build_query($curl_post_data);	
	curl_setopt($ch, CURLOPT_POSTFIELDS, $curl_post_data);
	//execute the curl
	$curl_response = curl_exec($ch);	
	if ($curl_response === false) {
		$info = curl_getinfo($ch);
		curl_close($ch);
		die('An error has occured. Sorry about that!: ' . print_r($info, true));
	}
	curl_close($ch);
	$decoded = json_decode($curl_response);
	if (isset($decoded->response->status) && $decoded->response->status == 'ERROR') {
		die('An error has occured.: ' . $decoded->response->errormessage);
	}		
	return $decoded;
}

function post_to_discover ($access_token, $payload) {		
	//get the url for the oath endpoint
	$service_url = get_api_url();
	//get the headers to be set on the curl
	$headers = getDiscoverHeaders($access_token);	
	//initialize curl
	$ch = setupCurl($service_url, $headers);			
	curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
	//execute the curl
	$curl_response = curl_exec($ch);	
	$results = new StdClass();
	$results->postedToDiscover = TRUE;
	if ($curl_response === false || $curl_response == "Invalid Request") {
		$info = curl_getinfo($ch);
		curl_close($ch);
		$results->postedToDiscover = FALSE;
		die('An error has occured. Sorry about that!: ' . print_r($info, true));
	}
	curl_close($ch);
	$decoded = json_decode($curl_response);
	if (isset($decoded->response->status) && $decoded->response->status == 'ERROR') {
		$results->postedToDiscover = FALSE;
		die('An error has occured.: ' . $decoded->response->errormessage);
	}		
	$results->response = json_decode($curl_response);		
	return $results;
}

//generates a guid
function GUID() {
    if (function_exists('com_create_guid') === true) {
        return trim(com_create_guid(), '{}');
    }
    return sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535));
}

function log_validation_errors( $validation_result ) {
    $form = $validation_result['form'];
    foreach ( $form['fields'] as $field ) {
        if ( $field->failed_validation ) {
            //GFCommon::log_error( "form #{$form['id']}: validate() - failed: {$field->label}({$field->id} - {$field->type}) - message: {$field->validation_message}" );
        }
    }
    return $validation_result;
}
?>
