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
            // Perform on each axis value a different operation
            List<Double> modifiedValues = axesValues.stream()
                    .map(value -> {
                        if (value == axesValues.get(0)) {
                            return value * 10;
                        } else if (value == axesValues.get(1)) {
                            return value * 10;
                        } else if (value == axesValues.get(2)) {
                            return value * 0.06;
                        } else if (value == axesValues.get(3)) {
                            return value * 0.06;
                        } else {
                            return value;
                        }
                    })
                    .collect(Collectors.toList());

            // You can access the gamepadIndex here
            // System.out.println("Received gamepadIndex: " + gamepadIndex);

            return ResponseEntity.ok(modifiedValues.toString());
        } else {
            return ResponseEntity.badRequest().body("Invalid request body.");
        }
    }
}