const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const squareSize = 50; // Size of the square
let imageCenterX  = canvas.width / 2; // Center X coordinate of the image
let imageCenterY  = canvas.height / 2; // Center Y coordinate of the image
let carWidth = 100;
let carHeight = 100;
let initialCarX = imageCenterX-carWidth/2; // Initial X position
let initialCarY = imageCenterY-carHeight/2; // Initial Y position
let squareX = initialCarX; // Initial X position
let squareY = initialCarY; // Initial Y position
let ipAddress = 'http://localhost:8082'; // Replace with your server IP

// Function to fetch and display high scores
async function fetchHighScores() {
    try {
        const response = await fetch(`${ipAddress}/api/highscores`);
        const highScores = await response.json();
        const highScoresList = document.getElementById('highScoresList');
        highScoresList.innerHTML = ''; // Clear the list

        if (highScores.length === 0) {
            highScoresList.innerHTML = '<li>No high scores available.</li>';
        } else {
            highScores.forEach(score => {
                const listItem = document.createElement('li');
                listItem.textContent = `Player: ${score.playerName}, Score: ${score.score}`;
                highScoresList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error('Error fetching high scores:', error);
    }
}


// Add event listener for form submission to add high score
document.getElementById('highScoreForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const playerName = document.getElementById('playerName').value;
    const score = document.getElementById('score').value;

    try {
        const response = await fetch(`${ipAddress}/api/highscores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerName, score })
        });

        if (response.status === 200) {
            console.log('High score submitted successfully.');
            // Refresh the high scores list
            fetchHighScores();
        } else {
            console.error('Failed to submit high score.');
        }
    } catch (error) {
        console.error('Error submitting high score:', error);
    }
});

// Initial fetch of high scores
fetchHighScores();

// Function to check for connected gamepads
function checkGamepadConnection() {
    // Get a list of all connected gamepads
    const gamepads = navigator.getGamepads();

    // Iterate through the gamepads and check their connection status
    for (const gamepad of gamepads) {
        if (gamepad) {
            // A gamepad is connected, you can access its properties here
            console.log(`checkGamepadConnection: Gamepad connected: ${gamepad.id}`);
            console.log(`checkGamepadConnection: Number of buttons: ${gamepad.buttons.length}`);
            console.log(`checkGamepadConnection: Number of axes: ${gamepad.axes.length}`);
        }
    }
}

// Function to send gamepad index and axes values to the backend
async function sendGamepadAxesToBackend(gamepadIndex, axesValues) {
    try {
        const forward = axesValues[0];
        const strafe = axesValues[1];
        const turn = axesValues[2];
        const index = gamepadIndex;

        // Create an object to represent the request body
        const requestBody = {
            axesValues: [forward, strafe, turn, index]
        };

        // Make a POST request to the API with the JSON request body
        fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Failed to send gamepad axes to the server.');
            }
        })
        .then(data => {
            // Handle the calculated values returned from the server
            updateSquarePosition(data);
            console.log(data); // The array of calculated values
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } catch (error) {
        console.error('Error sending gamepad axes to the server:', error);
    }
}

// Check for connected gamepads and send axes values to the backend
function checkGamepadAxes() {
    const gamepads = navigator.getGamepads();
    for (let indexGampad = 0; indexGampad < gamepads.length; indexGampad++) {
        const gamepad = gamepads[indexGampad];
        if (gamepad) {
            const axesValues = gamepad.axes.map(value => value * 1); // Implicit number format conversion Adjust the multiplier as needed
            // clamp values to zero if they are below a certain threshold
            for (let indexAxis = 0; indexAxis < axesValues.length; indexAxis++) {
                if (Math.abs(axesValues[indexAxis]) < 0.05) {
                    axesValues[indexAxis] = 0;
                }
            }
            sendGamepadAxesToBackend(indexGampad,axesValues);
        } 
    }
}

// Add an event listener to periodically check gamepad axes
//setInterval(checkGamepadAxes, 1000);

// Function to draw a custom car icon at specified position (x, y)
// add a parameter for the car image URL provided by the backend
const carImage = new Image();
// Set the source URL of the car image provided by the backend
carImage.src = '/images/car.png';
const gamefieldImage = new Image();
gamefieldImage.src = '/images/gamefield.png';

function drawCarIcon(x, y, rotationAngle) {

    // Draw the gamefield image
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.drawImage(gamefieldImage, 0, 0, canvas.width, canvas.height);

    // Save the current canvas state
    ctx.save();

    // move the canvas context to the center of the carImage
    const dx = x + carWidth/2;
    const dy = y + carHeight/2;
    ctx.translate(dx , dy );

    // Rotate the canvas
    ctx.rotate(rotationAngle);
    
    // Translate back to the original position
    ctx.translate(-dx , -dy );

    // Draw the rotated image
    ctx.drawImage(carImage, x, y, carWidth, carHeight);

    // Restore the canvas state
    ctx.restore();
    
    //carImage.onload = function () {
        // Draw the car image at the specified position (x, y)
        //ctx.drawImage(carImage, x, y, 100, 100); // Adjust the size as needed
    //};
}

// Function to draw the blue square
//function drawSquare(x, y) {
//    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
//    ctx.fillStyle = 'blue'; // Set square color
//    ctx.fillRect(x, y, squareSize, squareSize); // Draw the square
//}

// Function to update the square's position and rotation based on gamepad input
let rotationAngle = 0; // Initial rotation angle
function updateSquarePosition(axesValues) {

    // Update the square's position based on gamepad input
    squareX = initialCarX + axesValues[0]; // Adjust X position (left-right movement)
    squareY = initialCarY + axesValues[1]; // Adjust Y position (up-down movement)

    // Ensure the square stays within the canvas boundaries
    squareX = Math.max(0, Math.min(canvas.width - squareSize, squareX));
    squareY = Math.max(0, Math.min(canvas.height - squareSize, squareY));

    // Update the square's rotation based on gamepad input
    rotationAngle = axesValues[2]; // Adjust rotation angle (left-right movement)

    // Draw the updated square position
    //drawSquare(squareX, squareY);
    drawCarIcon(squareX, squareY, rotationAngle);
}

// Add an event listener for gamepad input
window.addEventListener('gamepadconnected', (event) => {
    const gamepad = event.gamepad;
    console.log(`Gamepad connected: ${gamepad.id}`);
    console.log(`Number of buttons: ${gamepad.buttons.length}`);
    console.log(`Number of axes: ${gamepad.axes.length}`);

    // Periodically check and update the square's position based on gamepad input
    setInterval(() => {
        checkGamepadAxes();
    }, 20); // Adjust the interval as needed for responsiveness
});

// Initial draw of the square
//drawSquare(squareX, squareY);
carImage.onload = function () {
    drawCarIcon(squareX, squareY, rotationAngle);
}