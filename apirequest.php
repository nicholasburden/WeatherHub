<?php
$myfile = fopen("apikey.txt", "r") or die("Unable to open file!");
$apikey = fread($myfile,filesize("apikey.txt"));
echo json_encode(json_decode(file_get_contents("http://api.openweathermap.org/data/2.5/forecast?q=london&appid=" . $apikey)));
?>