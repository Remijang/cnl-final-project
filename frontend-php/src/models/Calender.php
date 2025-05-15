<?php
namespace Src\Models;

class Calendar {
    public function getAll() {
        $db = new \PDO(getenv('DB_DSN'), getenv('DB_USER'), getenv('DB_PASS'));
        $stmt = $db->query('SELECT * FROM calendars');
        return $stmt->fetchAll();
    }
}
?>