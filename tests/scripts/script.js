// Import the GeminiQuestionGenerator from our SDK file
import { GeminiQuestionGenerator, escapeHtml } from './geminiSDK.js';

const generateButton = document.getElementById('generateButton');
const apiKeyInput = document.getElementById('apiKeyInput');
const resultsDiv = document.getElementById('results');

generateButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        resultsDiv.innerHTML = '<p class="error">Please enter your Gemini API Key.</p>';
        return;
    }

    resultsDiv.innerHTML = '<p class="loading">Initializing AI and generating questions...</p>';
    resultsDiv.classList.remove('error');

    try {
        const generator = new GeminiQuestionGenerator(apiKey);
        const questions = await generator.generateQuestions();

        let htmlOutput = '<h3>Theory Questions:</h3><ol>';
        questions.theory.forEach(q => { htmlOutput += `<li>${escapeHtml(q)}</li>`; });
        htmlOutput += '</ol>';

        htmlOutput += '<h3>Coding Questions:</h3><ol>';
        questions.coding.forEach(q => { htmlOutput += `<li>${escapeHtml(q)}</li>`; });
        htmlOutput += '</ol>';

        htmlOutput += '<h3>Aptitude Question:</h3><ol>';
        questions.aptitude.forEach(q => { htmlOutput += `<li>${escapeHtml(q)}</li>`; });
        htmlOutput += '</ol>';

        resultsDiv.innerHTML = htmlOutput;

    } catch (error) {
        console.error("Error:", error);
        let errorMessage = `Error generating questions: ${error.message || 'Unknown error'}`;
        
        // Check if the error is due to blocking
        if (error.message && error.message.includes('response was blocked')) {
            errorMessage += "<br>This might be due to safety settings. The prompt or the generated content might have been flagged.";
        }
        
        resultsDiv.innerHTML = `<p class="error">${errorMessage}</p>`;
        resultsDiv.classList.add('error');
    }
}); 