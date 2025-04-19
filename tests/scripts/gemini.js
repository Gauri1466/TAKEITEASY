// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyDx26Hvwnb1zUckfxEiKsgiu453z2F5ubU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
const TRIVIA_API_URL = 'https://opentdb.com/api.php';

// Create the geminiAPI object if it doesn't exist
if (!window.geminiAPI) {
    window.geminiAPI = {};
}

// Track initialization status
let isInitialized = false;

async function initializeGemini() {
    try {
        if (isInitialized) {
            console.log('Gemini API already initialized');
            return true;
        }

        console.log('Starting Gemini API initialization...');
        const success = await configureGemini(GEMINI_API_KEY);
        
        if (success) {
            isInitialized = true;
            console.log('Gemini API initialized successfully');
            return true;
        }
        
        console.error('Failed to initialize Gemini API - configuration failed');
        return false;
    } catch (error) {
        console.error('Initialization error:', error);
        return false;
    }
}

async function configureGemini(apiKey) {
    try {
        if (!apiKey) {
            throw new Error('API key is missing');
        }

        console.log('Testing Gemini API configuration...');
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'Hello'
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Configuration Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error(`API configuration failed: ${errorData.error?.message || response.statusText}`);
        }

        console.log('Gemini API configured successfully');
        return true;
    } catch (error) {
        console.error('Error configuring Gemini API:', error);
        console.log('Please check:');
        console.log('1. Your API key is valid and correctly set');
        console.log('2. You have internet connectivity');
        console.log('3. The API endpoint is accessible');
        return false;
    }
}

async function generateContent(prompt) {
    try {
        console.log('Sending request to Gemini API...');
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 1024,
                }
            })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
            const errorMessage = data.error?.message || response.statusText;
            console.error('API Error:', errorMessage, data);
            throw new Error(`API Error: ${errorMessage}`);
        }

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid response format:', data);
            throw new Error('Invalid response format from API');
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error in generateContent:', error);
        throw error;
    }
}

async function fetchTriviaQuestion() {
    try {
        const response = await fetch(`${TRIVIA_API_URL}?amount=1&category=9&type=multiple`);
        const data = await response.json();
        
        if (data.response_code === 0 && data.results.length > 0) {
            return {
                question: data.results[0].question,
                category: "General Knowledge",
                source: "Open Trivia DB"
            };
        }
        throw new Error('Failed to fetch trivia question');
    } catch (error) {
        console.error('Error fetching trivia question:', error);
        return null;
    }
}

async function generateQuestions(useOnline = false) {
    try {
        console.log('Starting question generation...');
        
        // Ensure API is initialized
        if (!isInitialized) {
            const initialized = await initializeGemini();
            if (!initialized) {
                throw new Error('Gemini API not initialized');
            }
        }

        // Generate theory questions
        const theoryPrompt = "Generate 2 technical interview questions about computer science theory. Format each question on a new line.";
        const theoryResponse = await generateContent(theoryPrompt);
        const theoryQuestions = theoryResponse.split('\n').filter(q => q.trim());

        // Generate coding questions
        const codingPrompt = "Generate 2 coding interview questions with different difficulty levels. Format each question on a new line.";
        const codingResponse = await generateContent(codingPrompt);
        const codingQuestions = codingResponse.split('\n').filter(q => q.trim());

        // Generate aptitude questions
        const aptitudePrompt = "Generate 1 logical reasoning/aptitude question. Format the question on a single line.";
        const aptitudeResponse = await generateContent(aptitudePrompt);
        const aptitudeQuestions = [aptitudeResponse.trim()];

        // Validate questions
        if (!theoryQuestions.length || !codingQuestions.length || !aptitudeQuestions.length) {
            throw new Error('Failed to generate all required questions');
        }

        // Format questions to match the expected structure
        const questions = {
            theory: theoryQuestions,
            coding: codingQuestions,
            aptitude: aptitudeQuestions
        };

        console.log('Final questions:', questions);
        return questions;
    } catch (error) {
        console.error('Error generating questions:', error);
        throw new Error(`Failed to generate questions: ${error.message}`);
    }
}

async function evaluateAnswer(question, userAnswer) {
    try {
        const prompt = `
            Evaluate if the following answer is correct for the given question.
            Consider variations in wording and focus on the core meaning.
            Question: "${question}"
            User's Answer: "${userAnswer}"
            
            Respond with a JSON object containing:
            {
                "isCorrect": boolean,
                "feedback": string (brief explanation of why the answer is correct or incorrect)
            }
        `;

        const response = await generateContent(prompt);
        const evaluation = JSON.parse(response);
        
        return {
            isCorrect: evaluation.isCorrect,
            feedback: evaluation.feedback
        };
    } catch (error) {
        console.error('Error evaluating answer:', error);
        throw new Error('Failed to evaluate answer');
    }
}

// Expose functions through the geminiAPI object
window.geminiAPI = {
    generateQuestions,
    generateContent,
    configureGemini,
    initializeGemini,
    evaluateAnswer
};

// Initialize when the script loads
initializeGemini().then(success => {
    if (success) {
        console.log('Gemini API script loaded and initialized successfully');
    } else {
        console.error('Failed to initialize Gemini API during script load');
    }
}); 