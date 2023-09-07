package org.firstinspires.restful;

import org.springframework.web.bind.annotation.*;
import org.firstinspires.ftc.teamcode.pathmaker.PathDetails;
import org.firstinspires.ftc.teamcode.pathmaker.PathManager;
import org.firstinspires.ftc.teamcode.pathmaker.RobotPoseSimulation;
import org.firstinspires.ftc.teamcode.pathmaker.GameSetup;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map; 
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class GamepadController {

    @PostMapping("/calculate")
    public double[] calculateValues(@RequestBody Map<String, List<Double>> requestBody) {
        // Extract the axes values from the request body
        List<Double> axesValues = requestBody.get("axesValues");

        // Ensure that the axesValues list has at least three elements
        if (axesValues != null && axesValues.size() >= 4) {
            PathDetails.setPath_DriverControlled(axesValues.get(0),axesValues.get(1),axesValues.get(2));
            try {
                PathManager.moveRobot();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            // Create an array with the calculated results
            double[] calculatedValues = {RobotPoseSimulation.forward, RobotPoseSimulation.strafe, RobotPoseSimulation.angle,0};
            // define gamepadIndex  as axesValues.get(3)
            // System.out.println("Received gamepadIndex: " + axesValues.get(3));
            return calculatedValues;
        } else {
            // Handle the case where there are not enough elements in axesValues
            return new double[0]; // Return an empty array or handle the error accordingly
        }
    }
}