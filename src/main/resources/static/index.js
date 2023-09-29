const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const squareSize = 50; // Size of the square
let imageCenterX  = canvas.width / 2; // Center X coordinate of the image
let imageCenterY  = canvas.height / 2; // Center Y coordinate of the image
let carWidth = 100;
let carHeight = 100;
let ipAddress = 'http://localhost:8082'; // Replace with your server IP address

// Function to send gamepad index and axes values to the backend
async function sendGamepadAxesToBackend(gamepadIndex, axesValues) {
    try {
        const forward = axesValues[0];
        const strafe = axesValues[1];
        const turn = axesValues[2];
        let index = gamepadIndex;

        numberOfGamepads = 1; // Set the numberOfGamepads to 1 for testing purposes (gampadIndex is always 0)
        // Create an object to represent the request body
        const requestBody = {
            axesValues: [forward, strafe, turn, index]
        };

        //console.log(requestBody);
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
            gamepadStates[gamepadIndex].axes = data;
            updateRobotPositions(numberOfGamepads);
            //console.log(gamepadIndex,data); // The array of calculated values
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
}

// Function to update the robot's position and rotation based on gamepad input
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
        // These are the gamefield coordinates of the robot (not the gamepad axes values)
        x = axesValues[0];
        y = axesValues[1];
        //x = Math.min(0, Math.max(117 - robotSize, x));
        //x = Math.max(117, Math.min(948, x));
        //y = Math.max(104, Math.min(888, y));
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
        // Update the robot coordinates
        updateRobotCoordinates(indexGamepad, x, y, rotationAngle);
    }
}

// Function to update the dsiplayed robot's position and rotation based on gamepad input
function updateRobotCoordinates(robotIndex, x, y, r) {
    const robotXElement = document.getElementById(`robot${robotIndex+1}X`);
    const robotYElement = document.getElementById(`robot${robotIndex+1}Y`);
    const robotRElement = document.getElementById(`robot${robotIndex+1}R`);
    robotXElement.textContent = x.toFixed(0);
    robotYElement.textContent = y.toFixed(0);
    robotRElement.textContent = r.toFixed(2);
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


const carImages = [];
// Function to load an image and push it to the carImages array
function loadImageAndDraw(src, x, y) {
    const img = new Image();
    //img.onload = function () {
    //    // Once the image is loaded, draw it on the canvas at the specified position (x, y)
    //    ctx.drawImage(img, x, y, carWidth, carHeight);
    //};
    img.src = src;
    carImages.push(img);
}
loadImageAndDraw("/images/car_blue_1.png", gamepadStates[0].axes[0], gamepadStates[0].axes[1]);
loadImageAndDraw("/images/car_blue_2.png", gamepadStates[1].axes[0], gamepadStates[1].axes[1]);
loadImageAndDraw("/images/car_red_1.png", gamepadStates[2].axes[0], gamepadStates[2].axes[1]);
loadImageAndDraw("/images/car_red_2.png", gamepadStates[3].axes[0], gamepadStates[3].axes[1]);

const carImage = new Image();
const gamefieldImage = new Image();
carImage.src = '/images/car.png';
gamefieldImage.src = '/images/gamefield2023.png';
gamefieldImage.onload = function () {
    // Send an "initialize" request to the backend
    fetch('/api/initialize', {
        method: 'GET',
    })
    .then(response => {
        if (response.status === 200) {
            // The "initialize" request was successful
            console.log('Initialization successful');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            ctx.drawImage(gamefieldImage, 0, 0, canvas.width, canvas.height);

        } else {
            // Handle errors or failed initialization
            console.error('Initialization failed');
        }
    })
    .catch(error => {
        console.error('Error during initialization:', error);
    });
};

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

