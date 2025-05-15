<?php
namespace Src\Controllers;

use Src\Models\Calendar;

class CalendarController {
    public function displayCalendars() {
        $calendarModel = new Calendar();
        $calendars = $calendarModel->getAll();
        include __DIR__ . '/../views/calendarView.php';
    }
}
?>