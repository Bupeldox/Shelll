export class AppUploader {
    constructor() {
        // You can initialize any class properties if needed
    }

    upload(endpoint, content, mimeType = 'text/plain', onComplete = () => { }) {
        // Create a Blob from the content
        const blob = new Blob([content], { type: mimeType });
        const formData = new FormData();

        // Append the file to the form data
        formData.append('file', blob);
        console.log(blob);

        try {
            // Make a POST request to the endpoint with the form data
            fetch(endpoint, {
                method: 'POST',
                body: formData,
            }).then(response => {
                // Check if the response is successful
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                
                // Handle the response if needed
                return response.json();
            }).then(result => {
                onComplete(result);
            })



        } catch (error) {
            console.error('File upload failed:', error);
        }
    }
}
