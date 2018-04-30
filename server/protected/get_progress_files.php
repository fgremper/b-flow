<?php

	function scan_dir($dir) {
	    $ignored = array('.', '..', '.svn', '.htaccess');

	    $files = array();    
	    foreach (scandir($dir) as $file) {
	        if (in_array($file, $ignored)) continue;
	        $files[$file] = filemtime($dir . '/' . $file);
	    }

	    arsort($files);
	    $files = array_keys($files);

	    return ($files) ? $files : false;
	}

	$files = array_reverse(scan_dir("data/progress"));

	foreach ($files as $file) {
		if (is_dir('data/progress/' . $file)) continue;
		echo $file . "\r\n";
	}

?>
