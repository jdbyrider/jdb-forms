<?php
	header('Content-type: application/json');
	
	require_once( 'environment-settings.php' );
	
	if(isset($_POST['payload'])) {
		$json = $_POST['payload'];
		echo($json);
		submitLeadInfoToDiscover($json);
		} else {
		echo('cool');
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
	
	function submitLeadInfoToDiscover ( $payload ) {	
		$access_token = getAccessToken();	
		$results = post_to_discover($access_token, $payload);	
		
		if($results->postedToDiscover){
			echo($payload);
			} else {
			echo($payload);
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
?>