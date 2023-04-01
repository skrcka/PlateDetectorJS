const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const resultsDiv = document.getElementById("results");
let textDetector = null;

// Check if the TextDetector API is available
if ("TextDetector" in window) {
	console.log("TextDetector API is supported.");
    textDetector = new TextDetector();
} else {
	console.error("TextDetector API is not supported on this device.");
}

// Start the video stream
navigator.mediaDevices
	.getUserMedia({
		video: {
			facingMode: "environment", // Prefer the rear camera
		},
	})
	.then((stream) => {
		video.srcObject = stream;
		video.addEventListener("loadedmetadata", () => {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			detectLicensePlates();
		});
	})
	.catch((error) => {
		console.error("Error accessing the camera: ", error);
	});

async function detectLicensePlates() {
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	try {
		const detectedText = await textDetector.detect(imageData);

		// Filter the detected text blocks for potential license plates
        /*
		const licensePlates = detectedText.filter((textBlock) => {
			// Customize this regex pattern according to the format of license plates in your region
			const licensePlatePattern = /^[A-Za-z]{2,3}\d{2,4}$/;
			return licensePlatePattern.test(textBlock.rawValue);
		});
        */

		// Display the results
        console.log(detectedText);
		displayResults(detectedText);
	} catch (error) {
		console.error("Error detecting text: ", error);
        resultsDiv.innerHTML = error.message || "Error detecting text";
	}

	// Schedule the next frame processing using setTimeout
	setTimeout(detectLicensePlates, 200);
}

function displayResults(licensePlates) {
	resultsDiv.innerHTML = "";
	const count = document.createElement("div");
    count.innerHTML = `License Plate count: ${licensePlates.length}`;
    resultsDiv.appendChild(count);
	licensePlates.forEach((licensePlate, index) => {
		const result = document.createElement("div");
		result.innerHTML = `License Plate ${index + 1}: ${licensePlate.rawValue}`;
		resultsDiv.appendChild(result);
	});
}
