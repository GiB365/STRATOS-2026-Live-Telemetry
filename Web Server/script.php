<?php
    $mysqli = new mysqli("localhost", "balloon", "ball00n$", "balloonTesting");
    if ($mysqli->connect_errno) {
        die(json_encode(["error" => $mysqli->connect_error]));
    }

    $sql = "SELECT * FROM  aprs_telemetry";
    $res = $mysqli->query($sql);


    if (!$res) {
        die(json_encode(["error" => $mysqli->error]));
    }

    $data = [];
    while ($row = $res->fetch_assoc()) {
        array_push($data, $row);
    }

    echo json_encode($data);
