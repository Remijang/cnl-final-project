<?php
require '../config/config.php';
use Src\Controllers\CalendarController;

$controller = new CalendarController();
$controller->displayCalendars();
?>