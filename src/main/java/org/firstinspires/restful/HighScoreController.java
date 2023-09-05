package org.firstinspires.restful;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/highscores")
public class HighScoreController {

    private List<HighScore> highScores = new ArrayList<>();

    @GetMapping
    public List<HighScore> getAllHighScores() {
        return highScores;
    }

    @PostMapping
    public HighScore addHighScore(@RequestBody HighScore highScore) {
        highScores.add(highScore);
        return highScore;
    }
}