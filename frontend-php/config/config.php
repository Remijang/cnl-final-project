<?php
require_once __DIR__ . '/../vendor/autoload.php';
$env = parse_ini_file(__DIR__ . '/../.env');
foreach ($env as $key => $value) {
    putenv("$key=$value");
}
?>