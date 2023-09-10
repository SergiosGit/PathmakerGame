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
 

const modeForm = document.getElementById('modeForm');
const gameModeElements = modeForm.elements.gameMode;
// Add an event listener to detect mode changes
modeForm.addEventListener('change', function () {
    selectedMode = Array.from(gameModeElements).find(radio => radio.checked).value;
});

// Initial mode selection
let selectedMode = Array.from(gameModeElements).find(radio => radio.checked).value;
console.log(`Initial mode: ${selectedMode}`);


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


// Function to send gamepad index and axes values to the backend
async function sendGamepadAxesToBackend(gamepadIndex, axesValues) {
    try {
        const forward = axesValues[0];
        const strafe = axesValues[1];
        const turn = axesValues[2];
        let index = gamepadIndex;

        if (selectedMode === "Pathmaker") {
            index = -1;
        }
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
            //console.log(data); // The array of calculated values
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
    for (let indexGamepad = 0; indexGamepad < gamepads.length; indexGamepad++) {
        const gamepad = gamepads[indexGamepad];
        if (gamepad) {
            const axesValues = gamepad.axes.map(value => value * 1); // Implicit number format conversion Adjust the multiplier as needed
            // clamp values to zero if they are below a certain threshold
            for (let indexAxis = 0; indexAxis < axesValues.length; indexAxis++) {
                if (Math.abs(axesValues[indexAxis]) < 0.05) {
                    axesValues[indexAxis] = 0;
                }
            }
            //console.log("selectedMode: " + selectedMode);
            sendGamepadAxesToBackend(indexGamepad,axesValues);
        } 
    }
}

// Add an event listener to periodically check gamepad axes
//setInterval(checkGamepadAxes, 1000);

// Function to draw a custom car icon at specified position (x, y)
// add a parameter for the car image URL provided by the backend
const carImage = new Image();
carImage.src = '/images/car.png';
const gamefieldImage = new Image();
gamefieldImage.src = '/images/gamefield2023.png';

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

// Initial draw of the car icon
carImage.onload = function () {
    // Send an "initialize" request to the backend
    fetch('/api/initialize', {
        method: 'GET',
    })
    .then(response => {
        if (response.status === 200) {
            // The "initialize" request was successful
            console.log('Initialization successful');
            // Now, draw the car icon and handle other logic
            drawCarIcon(squareX, squareY, rotationAngle);
        } else {
            // Handle errors or failed initialization
            console.error('Initialization failed');
        }
    })
    .catch(error => {
        console.error('Error during initialization:', error);
    });
};


// Get a reference to the open charts button element
const openChartsButton = document.getElementById('openChartsButton');

// Add a click event listener to the button
openChartsButton.addEventListener('click', function () {
    // Open a new window when the button is clicked
    const separateWindow = window.open('', 'Separate Window', 'width=800,height=400');

    // Check if the separate window was successfully opened
    if (separateWindow) {
        const separateDocument = separateWindow.document;
        // create window title for the separate window
        separateDocument.title = 'Charts';
        // Set a minimal HTML structure for the document to provide a URL
        separateDocument.documentElement.innerHTML = '<html><head></head><body></body></html>';
        // create title for the separate window
        const title = separateDocument.createElement('h1');
        title.textContent = 'Charts';
        separateDocument.body.appendChild(title);
        // create site info for the separate window
        const siteInfo = separateDocument.createElement('p');
        siteInfo.textContent = 'This window shows the calculated values from the backend.';
        separateDocument.body.appendChild(siteInfo);

        chart1 = newChartCanvasElement('chart1','Forward');
        chart2 = newChartCanvasElement('chart2','Strafe');    
        chart3 = newChartCanvasElement('chart3','Turn');
        console.log("Charts created");
        const calculatedValues = [0,0,0,0];
        // Call the updateCharts function with the initial data
        updateCharts(calculatedValues);


        // Create a canvas element for a chart
        function newChartCanvasElement(id,label) {
            const canvasElement = separateDocument.createElement('canvas');
            canvasElement.id = id; // Optionally set an ID for the canvas    
            // Set the canvas width and height
            canvasElement.width = 400; // Set the desired width
            canvasElement.height = 200; // Set the desired height
            // Append the canvas element to the separate window's document
            separateDocument.body.appendChild(canvasElement);
            const thisCtx = canvasElement.getContext('2d');
            chart = new Chart(thisCtx, {
                type: 'line',
                data: {
                    labels: [], // You can add timestamps as labels
                    datasets: [{
                        label: label,
                        data: [],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false
                    }]
                },
                options: {
                    // Chart options
                }
            });
            return chart;
        }

        // Function to update chart data
        function updateCharts(newData) {
            // Update chart data and labels here
            // newData should be an array containing values for each chart
            chart1.data.labels.push(''); // Add timestamp or label
            chart1.data.datasets[0].data.push(newData[0]);
            chart2.data.labels.push('');
            chart2.data.datasets[0].data.push(newData[1]);
            chart3.data.labels.push('');
            chart3.data.datasets[0].data.push(newData[2]);

            // Limit the number of data points shown, e.g., to 10
            if (chart1.data.labels.length > 10) {
                chart1.data.labels.shift();
                chart1.data.datasets[0].data.shift();
                chart2.data.labels.shift();
                chart2.data.datasets[0].data.shift();
                chart3.data.labels.shift();
                chart3.data.datasets[0].data.shift();
            }

            // Update the charts
            chart1.update();
            chart2.update();
            chart3.update();
        }

    } else {
        // Handle the case where the separate window couldn't be opened
        console.error('Failed to open separate window');
    }



});

