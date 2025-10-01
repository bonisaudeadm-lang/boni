/**
 * Converts a File object to a Base64 encoded string.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} A promise that resolves with the Base64 string (without the data URL prefix).
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // The result is a string like "data:image/png;base64,iVBORw0KGgo..."
            // We need to remove the prefix "data:[mime_type];base64," to get the raw Base64 string.
            const base64String = (reader.result as string).split(',')[1];
            if (base64String) {
                resolve(base64String);
            } else {
                // Handle cases where the result is null or the split fails
                reject(new Error("Não foi possível converter o arquivo para Base64."));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};