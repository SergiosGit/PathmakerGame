# PathMaker Game
This software simulates the robot movement in a FIRST FTC game. It provides simulation for autonomous as well as field centric driving. The robot drivetrain must be based on four individually powerd Mecanum wheels.

## PathMaker

This is the engine that drives the robot along a user configurable path. The Mecanum wheels allow for algorithmcally separating the motor power into three independent components: forward, strafe, and rotate (we also use the term turn). These three components of robot movement are defined at the starting point of the robot trajectory, e.g. at the beginning of autonomous, and stay the same after that, in other words, they remain fixed in relation to the gamefield (aka field centric driving).



