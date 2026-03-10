const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');

// ========== GEMINI INITIALIZATION ==========
let model;
let apiKeyConfigured = false;
let modelName = "gemini-1.5-flash"; // CHANGED: Using flash model with better free quotas

try {
    if (process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // IMPORTANT: Using gemini-1.5-flash which has 60 requests/minute free
        model = genAI.getGenerativeModel({ model: modelName });
        apiKeyConfigured = true;
        console.log(`✅ Gemini AI initialized with model: ${modelName}`);
        console.log(`📊 Free tier: 60 requests per minute`);
    } else {
        console.log('⚠️ GEMINI_API_KEY not found in .env file');
    }
} catch (error) {
    console.error('❌ Failed to initialize Gemini:', error.message);
}

// Simple chat history storage
const chatHistories = new Map();

// ========== HELPER FUNCTION FOR SAFE API CALLS ==========
async function callGeminiAPI(prompt, retries = 2) {
    if (!apiKeyConfigured || !model) {
        throw new Error('Gemini API not configured');
    }
    
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.log(`Attempt ${i + 1} failed:`, error.message);
            
            // Check for quota error
            if (error.message.includes('429') || error.message.includes('quota')) {
                if (i < retries - 1) {
                    // Wait longer between retries for quota issues
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
            }
            throw error;
        }
    }
}

// ========== AI ASSISTANT PAGE ==========
router.get('/assistant', async (req, res) => {
    // Check if user is logged in and is a student
    if (!req.session || !req.session.userId || req.session.role !== 'student') {
        return res.redirect('/');
    }
    
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/auth/logout');
        }
        
        // Render the assistant page with user data and API status
        res.render('student/gemini-assistant', { 
            user: user,
            geminiReady: apiKeyConfigured,
            modelName: modelName
        });
        
    } catch (error) {
        console.error('Error loading AI assistant:', error);
        res.status(500).send('Server error: ' + error.message);
    }
});

// ========== CHAT ENDPOINT ==========
router.post('/chat', async (req, res) => {
    // Check authentication
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    // Check if Gemini is configured
    if (!apiKeyConfigured || !model) {
        return res.status(503).json({ 
            error: 'AI service not configured',
            details: 'Please contact administrator'
        });
    }
    
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const userId = req.session.userId;
        
        // Get user for context
        const user = await User.findById(userId);
        const department = user ? user.department : 'Unknown';
        
        // Build prompt with context - SHORTER prompts to save tokens
        const prompt = `You are a helpful AI study assistant for a college student.
Student's Department: ${department}

Student question: ${message}

Provide a helpful, educational response. Keep it concise but informative.`;
        
        // Call Gemini API with retry logic
        const response = await callGeminiAPI(prompt);
        
        // Store in history (optional)
        if (!chatHistories.has(userId)) {
            chatHistories.set(userId, []);
        }
        const history = chatHistories.get(userId);
        history.push(
            { role: 'user', content: message.substring(0, 100) },
            { role: 'assistant', content: response.substring(0, 100) }
        );
        
        // Keep only last 5 messages to save memory
        if (history.length > 10) {
            chatHistories.set(userId, history.slice(-10));
        }
        
        res.json({ 
            response: response,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Gemini API error:', error);
        
        // Handle specific error types
        if (error.message.includes('429') || error.message.includes('quota')) {
            res.status(429).json({ 
                error: 'API quota exceeded',
                details: 'Please wait a minute and try again',
                retryAfter: 60
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to get response from AI',
                details: error.message
            });
        }
    }
});

// ========== CLEAR CHAT HISTORY ==========
router.post('/clear', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    chatHistories.delete(req.session.userId);
    res.json({ success: true, message: 'Chat history cleared' });
});

// ========== GENERATE QUIZ (SIMPLIFIED) ==========
router.post('/generate-quiz', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    if (!apiKeyConfigured || !model) {
        return res.status(503).json({ error: 'AI service not configured' });
    }
    
    try {
        const { subject, topic, numQuestions = 3 } = req.body; // Reduced default to 3
        
        const prompt = `Generate a quiz on ${subject} - ${topic} with ${numQuestions} multiple choice questions.
        
        Format each question as:
        Q1. [Question]
        A) [Option]
        B) [Option] 
        C) [Option]
        D) [Option]
        Answer: [Correct letter]
        Explanation: [Brief explanation]
        
        Keep it simple and educational.`;
        
        const response = await callGeminiAPI(prompt);
        res.json({ success: true, response: response });
        
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== STUDY PLAN GENERATOR (SIMPLIFIED) ==========
router.post('/study-plan', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        const { subject, days = 3 } = req.body; // Reduced default days
        
        const prompt = `Create a simple ${days}-day study plan for ${subject}.
        
        For each day, include:
        - What topic to study
        - How much time to spend
        - One practice task
        
        Keep it practical.`;
        
        const response = await callGeminiAPI(prompt);
        res.json({ response });
        
    } catch (error) {
        console.error('Study plan error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== TEST ENDPOINT ==========
router.get('/test', (req, res) => {
    res.json({
        status: 'Gemini routes are working',
        apiKeyConfigured: apiKeyConfigured,
        modelName: modelName,
        session: req.session ? 'active' : 'inactive',
        userId: req.session?.userId || null,
        tip: 'Use gemini-1.5-flash for better free tier quotas (60 requests/minute)'
    });
});

module.exports = router;