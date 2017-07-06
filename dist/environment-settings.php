<?php	
	$settings_array = parse_ini_file("Environment.ini");
	
	$auth_request_body = array(
		'header' => "Content-Type: application/x-www-form-urlencoded",
		'method' => 'POST',
		'resource' => $settings_array[auth_resource],
		'client_id' => $settings_array[auth_client_id],
		'client_secret' => $settings_array[auth_client_secret],
		'grant_type' => $settings_array[auth_grant_type]
	);
	
	function get_auth_request_body(){	
		global $auth_request_body;
		return $auth_request_body;
	}	
		
	$dbInfo = (object) [
		'servername' => $settings_array[servername],
		'username' => $settings_array[username],
		'password' => $settings_array[password],
		'dbname' => $settings_array[dbname]
	];
	
	function get_db_info() {
		global $dbInfo;
		return $dbInfo;
	}
	
	$current_environment = $settings_array[environment];
	
	function get_current_environment(){
		global $current_environment;
		return $current_environment;
	}	
	
	$dbConfigured = $settings_array[dbconfigured];
	
	function isDbConfigured(){
		global $dbConfigured;
		return $dbConfigured;
	}

	$oath_url = $settings_array[oath_url];
	
	function get_oath_url(){
		global $oath_url;
		return $oath_url;
	}
	
	$api_url = $settings_array[api_url];
	
	function get_api_url(){
		global $api_url;
		return $api_url;
	}

	$prod_api_userId = $settings_array[prod_api_userId];	
	
	function get_api_userId(){
		global $prod_api_userId;
		return $prod_api_userId;
	}
	
	function getDiscoverHeaders($access_token){
		return array('Content-Type: application/json', 'Authorization: Bearer ' . $access_token, 'User-Agent: ApiExample.JDBExternal/1.0.0.0');
	}
	
	$is_site_branded = $settings_array[branded];
	
	function is_site_branded(){
		global $is_site_branded;
		return $is_site_branded;
	}
?>