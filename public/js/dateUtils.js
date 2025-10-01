/**
 * Shared date formatting utility for the quotes app
 */

function formatTimestamp(timestamp) {
    try {
        // Parse the timestamp (format: "2024-02-10 04:11:33.182000+00:00")
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        // Keep original timestamp if parsing fails
        console.log('Date formatting failed, keeping original timestamp');
        return timestamp;
    }
}

function formatAllTimestamps() {
    // Find all elements with the class 'format-date' and format their timestamps
    const dateElements = document.querySelectorAll('.format-date');
    dateElements.forEach(element => {
        const timestamp = element.textContent.trim();
        element.textContent = formatTimestamp(timestamp);
    });
}

// Auto-format dates when DOM is loaded
document.addEventListener('DOMContentLoaded', formatAllTimestamps);