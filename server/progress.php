<?php
	header("Access-Control-Allow-Origin: https://customers2.movu.ch");
	if (isset($_POST["id"]) && ctype_alnum($_POST["id"]) && strlen($_POST["id"]) == 32 && isset($_POST["message"])) {

		$file = "protected/data/progress/" . $_POST["id"] . ".txt";
		$content = $_POST["message"] . "\r\n";
		file_put_contents ($file, $content, FILE_APPEND | LOCK_EX);
		
	}
	else {
		die();
	}
?>
