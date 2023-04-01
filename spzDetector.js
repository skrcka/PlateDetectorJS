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

        const candidates = detectedText.map((textBlock) => {
            // [^A-Z0-9] - remove all non-alphanumeric characters
            const regex = /[^A-Z0-9]/g;
            return textBlock.rawValue.replace(regex, "");
        });
        candidates = candidates.filter((candidate) => {
            // ^[ABCDEFGHJKLMNPRSTVWXYZ1234567890]{6,8}
            // is between 6 and 8 characters long and contains only alphanumeric characters
            const regex = /^[ABCDEFGHJKLMNPRSTVWXYZ1234567890]{6,8}$/;
            return regex.test(candidate);
        });

		displayResults(candidates);
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
		result.innerHTML = `License Plate ${index + 1}: ${licensePlate}`;
		resultsDiv.appendChild(result);
	});
}
