<?php
	header("Access-Control-Allow-Origin: https://customers2.movu.ch");
	if (isset($_POST["id"]) && ctype_alnum($_POST["id"]) && strlen($_POST["id"]) == 32 && isset($_POST["message"]) && isset($_POST["referrer"])) {

		$message = "referrer: " . $_POST["referrer"] . "\r\n" . "log: https://customers2-backend.movu.ch/protected/data/progress/" . $_POST["id"] . ".txt" . "\r\n\r\n" . $_POST["message"];

		$file = "protected/data/completed/" . $_POST["id"] . ".txt";
		file_put_contents ($file, $message, LOCK_EX);

		$to = "b-flow@movu.ch";
		$subject = "completed - " . $_POST["id"];
		$headers = "From: b-flow@movu.ch";

		mail($to,$subject,$message,$headers);

	}
	else {
		die();
	}
?>


