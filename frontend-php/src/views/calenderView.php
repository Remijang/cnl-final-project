<?php
foreach ($calendars as $calendar) {
    echo "<div>";
    echo "<h2>" . htmlspecialchars($calendar['title']) . "</h2>";
    echo "<p>Shared: " . ($calendar['shared'] ? 'Yes' : 'No') . "</p>";
    echo "</div>";
}
?>