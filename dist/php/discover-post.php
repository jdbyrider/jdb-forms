<?php
	header('Content-type: application/json');	
	require_once( 'environment-settings.php' );
	
	if(isset($_POST['payload'])) 
	{
		$json = $_POST['payload'];		
		$results = submitLeadInfoToDiscover($json);
		http_response_code(200);		
		echo json_encode($results->response);
	} 
	else 
	{
		// Get the current response code and set a new one
		echo("400 Bad Request: No payload received.");
		var_dump($_POST);
		http_response_code(400);		
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
		return $results;
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
			$results->postedToDiscover = FALSE;
			$results->response = json_decode($curl_response);			
			return $results;
		}		
		$decoded = json_decode($curl_response);
		if (isset($decoded->response->status) && $decoded->response->status == 'ERROR') {
			$results->postedToDiscover = FALSE;
			$results->response = json_decode($curl_response);			
			return $results;
		}
		else {
			if($curl_response != "INVALID_DATA"){
				$results->response = json_decode($curl_response);			
			}
			else {
				$results->response = $curl_response;			
			}						
			return $results;
		}
		
		$results->response = json_decode($curl_response);				
		return $results;
	}
	
	function isJson($string) {
		json_decode($string);
		return (json_last_error() == JSON_ERROR_NONE);
	}
?>