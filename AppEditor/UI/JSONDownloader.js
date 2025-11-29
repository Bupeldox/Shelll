
export class JSONDownloader{
    download(filename,obj) {
        // Convert the object to a JSON string
        const jsonString = JSON.stringify(obj, null, 2); // Pretty print with 2 spaces
        
        // Create a Blob from the JSON string
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create a link element
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        
        // Append to the body (necessary for Firefox)
        document.body.appendChild(link);
        
        // Programmatically click the link to trigger the download
        link.click();
        
        // Cleanup: remove the link element and revoke the object URL
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}