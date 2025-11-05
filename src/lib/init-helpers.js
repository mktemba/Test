/**
 * Helper functions for initialization
 * Non-blocking script loaded with defer
 */

window.waitForTileRenderer = function(callback, callbackName = 'callback') {
    if (window.tileRenderer && typeof window.tileRenderer.createTileElement === 'function') {
        try {
            console.log(`[Debug] Calling ${callbackName}`);
            callback();
            console.log(`[Debug] ${callbackName} completed`);
        } catch (e) {
            console.error(`[Error] in ${callbackName}:`, e);
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'position:fixed;top:0;left:0;background:red;color:white;padding:10px;z-index:9999';
            // Escape HTML in error messages to prevent XSS
            const safeMessage = window.Security ?
                window.Security.sanitizeErrorMessage(`Error in ${callbackName}: ${e.message}`) :
                `Error in ${callbackName}: ${e.message}`;
            errorDiv.textContent = safeMessage;
            document.body.appendChild(errorDiv);
        }
    } else {
        setTimeout(() => window.waitForTileRenderer(callback, callbackName), 50);
    }
};
