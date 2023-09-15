const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const squareSize = 50; // Size of the square
let imageCenterX  = canvas.width / 2; // Center X coordinate of the image
let imageCenterY  = canvas.height / 2; // Center Y coordinate of the image
let carWidth = 100;
let carHeight = 100;
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
            updateRobotPosition(data);
            //console.log(data); // The array of calculated values
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } catch (error) {
        console.error('Error sending gamepad axes to the server:', error);
    }
}

function checkGamepadAxes() {
    const gamepads = navigator.getGamepads();
    
    // Check the selected mode
    if (selectedMode === 'Pathmaker') {  // send data to backend
        let indexGamepad = 0
        // Pathmaker mode: Send axesValues to the backend for the selected gamepad
        const gamepad = gamepads[indexGamepad];
        if (gamepad) {
            const axesValues = gamepad.axes.map(value => value * 1); // Implicit number format conversion. Adjust the multiplier as needed
            // Clamp values to zero if they are below a certain threshold
            for (let indexAxis = 0; indexAxis < axesValues.length; indexAxis++) {
                if (Math.abs(axesValues[indexAxis]) < 0.05) {
                    axesValues[indexAxis] = 0;
                }
            }
            sendGamepadAxesToBackend(indexGamepad, axesValues);
        }
    } else {
        // Multiplayer mode: Update axesValues for all connected gamepads without sending them to the backend
        var numberOfGamepads = 0;
        for (let indexGamepad = 0; indexGamepad < gamepads.length; indexGamepad++) {
            const gamepad = gamepads[indexGamepad];
            if (gamepad) {
                numberOfGamepads++;
                const axesValues = gamepad.axes.map(value => value * 1); // Implicit number format conversion. Adjust the multiplier as needed
                // Clamp values to zero if they are below a certain threshold
                for (let indexAxis = 0; indexAxis < axesValues.length; indexAxis++) {
                    if (Math.abs(axesValues[indexAxis]) < 0.05) {
                        axesValues[indexAxis] = 0;
                    } else {
                        axesValues[indexAxis] = axesValues[indexAxis] * axesValuesScalingFactor[indexAxis];
                    }
                }
                // Update axesValues for the gamepad in the multiplayer mode
                updateGamepadAxes(indexGamepad, axesValues);
            }
        }
        // Update the robot position based on the actual number of connected gamepads
        // This ensures that the robot position is only updated if at least one gamepad is connected
        updateRobotPositions(numberOfGamepads);

    }
}

axesValuesScalingFactor = [];
axesValuesScalingFactor.length = 4
axesValuesScalingFactor[0] = 5;
axesValuesScalingFactor[1] = 5;
axesValuesScalingFactor[2] = 0.1;
axesValuesScalingFactor[3] = 1;

// Define an array to store the state of each gamepad
const gamepadStates = [];
gamepadStates.length = 4; // Set the length of the array to 4
gamepadStates[0] = { axes: [100, 400, 0, 0] }; // Initialize the first gamepad state for car_blue_1
gamepadStates[1] = { axes: [100, 700, 0, 0] }; // Initialize the second gamepad state for car_blue_2    
gamepadStates[2] = { axes: [1000, 400, 0, 0] }; // Initialize the third gamepad state for car_red_1 
gamepadStates[3] = { axes: [1000, 700, 0, 0] }; // Initialize the fourth gamepad state for car_red_2

// Function to draw a custom car icon at specified position (x, y)
// add a parameter for the car image URL provided by the backend
//const carImage = document.createElement('img');
const gamefieldImage = document.createElement('img');
gamefieldImage.src = "/8_FTC/Software/Pathmaker3/restful/restful/src/main/resources/images/gamefield2023.png";
gamefieldImage.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.drawImage(gamefieldImage, 0, 0, canvas.width, canvas.height);
};

const carImages = [];
// Function to load an image and push it to the carImages array
function loadImageAndDraw(src, x, y) {
    const img = new Image();
    img.onload = function () {
        // Once the image is loaded, draw it on the canvas at the specified position (x, y)
        ctx.drawImage(img, x, y, carWidth, carHeight);
    };
    img.src = src;
    carImages.push(img);
}
loadImageAndDraw("/8_FTC/Software/Pathmaker3/restful/restful/src/main/resources/images/car_blue_1.png", gamepadStates[0].axes[0], gamepadStates[0].axes[1]);
loadImageAndDraw("/8_FTC/Software/Pathmaker3/restful/restful/src/main/resources/images/car_blue_2.png", gamepadStates[1].axes[0], gamepadStates[1].axes[1]);
loadImageAndDraw("/8_FTC/Software/Pathmaker3/restful/restful/src/main/resources/images/car_red_1.png", gamepadStates[2].axes[0], gamepadStates[2].axes[1]);
loadImageAndDraw("/8_FTC/Software/Pathmaker3/restful/restful/src/main/resources/images/car_red_2.png", gamepadStates[3].axes[0], gamepadStates[3].axes[1]);



//if (selectedMode === 'Pathmaker') {
//    const carImage = new Image();
//    const gamefieldImage = new Image();
//    carImage.src = '/images/car.png';
//    gamefieldImage.src = '/images/gamefield2023.png';
//}

// Update the gamepad axes in javascript instead of sending them to the backend
function updateGamepadAxes(indexGamepad, axesValues) {
    // Check if the indexGamepad is within the valid range (0 to 3)
    if (indexGamepad >= 0 && indexGamepad < 4) {
        // Update the axes values for the specified gamepad by performing element-wise addition
        const updatedAxes = gamepadStates[indexGamepad].axes.map((value, index) => value + axesValues[index]);
        gamepadStates[indexGamepad].axes = updatedAxes;
    }
}

// Function to update the square's position and rotation based on gamepad input
function updateRobotPositions(numberOfGamepads) {
    // Draw the gamefield image
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.drawImage(gamefieldImage, 0, 0, canvas.width, canvas.height);
    // Save the current canvas state

    for (let indexGamepad = 0; indexGamepad < numberOfGamepads; indexGamepad++) {
        ctx.save();
        // Get the axes values for the specified gamepadStates
        const carImage = carImages[indexGamepad];
        const axesValues = gamepadStates[indexGamepad].axes;
        x = axesValues[0];
        y = axesValues[1];
        x = Math.max(0, Math.min(canvas.width - squareSize, x));
        y = Math.max(0, Math.min(canvas.height - squareSize, y));
        gamepadStates[indexGamepad].axes[0] = x;
        gamepadStates[indexGamepad].axes[1] = y;
        const rotationAngle = axesValues[2];
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

