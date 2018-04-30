<?php
	header("Access-Control-Allow-Origin: https://customers2.movu.ch");
	if (isset($_POST["id"]) && ctype_alnum($_POST["id"]) && strlen($_POST["id"]) == 32) {

		$file = "protected/data/progress/" . $_POST["id"] . ".txt";
		$content = "ip: " . $_SERVER['REMOTE_ADDR'] . "\r\n" . "agent: " . $_SERVER['HTTP_USER_AGENT'] . "\r\n" . "date: " . date("Y-m-d H:i:s") . "\r\n";
		file_put_contents ($file, $content, FILE_APPEND | LOCK_EX);

	}
	else {
		die();
	}
?>
