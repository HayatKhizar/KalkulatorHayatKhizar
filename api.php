<?php
header("Content-Type: application/json");

// Database configuration
$dbHost = "localhost";
$dbName = "calculator.db";
$dbUser = "root";
$dbPassword = "";

// Create a MySQLi connection
$mysqli = new mysqli($dbHost, $dbUser, $dbPassword, $dbName);

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Get Calculation History
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $result = $mysqli->query("SELECT * FROM calculation_history");
    $calculations = [];
    
    while ($row = $result->fetch_assoc()) {
        $calculations[] = $row;
    }

    echo json_encode($calculations);
}

// Add new Calculation or Sync Calculations
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data["expression"]) && isset($data["result"])) {
        // If it's a single calculation
        $expression = $data["expression"];
        $result = $data["result"];
        $mysqli->query("INSERT INTO calculation_history (expression, result, timestamp) VALUES ('$expression', '$result', NOW())");
        echo json_encode(["message" => "Calculation added successfully"]);
    } elseif (isset($data["calculations"]) && is_array($data["calculations"])) {
        // If it's a batch of calculations
        foreach ($data["calculations"] as $calculation) {
            $expression = $calculation["expression"];
            $result = $calculation["result"];
            $mysqli->query("INSERT INTO calculation_history (expression, result, timestamp) VALUES ('$expression', '$result', NOW())");
        }

        echo json_encode(["message" => "Calculations added successfully"]);
    } else {
        echo json_encode(["error" => "Invalid request"]);
    }
}

// Update Calculation result
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    parse_str(file_get_contents("php://input"), $data);
    $id = $data["id"];
    $result = $data["result"];

    $mysqli->query("UPDATE calculation_history SET result = '$result' WHERE id = $id");
    echo json_encode(["message" => "Calculation result updated successfully"]);
}

// Delete Calculation
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    parse_str(file_get_contents("php://input"), $data);
    $id = $data["id"];

    $mysqli->query("DELETE FROM calculation_history WHERE id = $id");
    echo json_encode(["message" => "Calculation deleted successfully"]);
}

// Close the MySQLi connection
$mysqli->close();
?>