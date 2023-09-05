package org.firstinspires.restful;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map; 
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gamepad")
public class GamepadController {

    @PostMapping("/{gamepadIndex}")
    public ResponseEntity<String> receiveAxesValues(
            @PathVariable int gamepadIndex,
            @RequestBody Map<String, List<Double>> requestBody) {

        List<Double> axesValues = requestBody.get("axesValues");

        if (axesValues != null) {
            // Perform the multiplication operation (multiply by 10)
            List<Double> multipliedValues = axesValues.stream()
                    .map(value -> value * 10)
                    .collect(Collectors.toList());

            // You can access the gamepadIndex here
            // System.out.println("Received gamepadIndex: " + gamepadIndex);

            return ResponseEntity.ok(multipliedValues.toString());
        } else {
            return ResponseEntity.badRequest().body("Invalid request body.");
        }
    }
}