const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function fixGemini() {
    console.log('🔧 GEMINI API DIAGNOSTIC TOOL');
    console.log('='.repeat(50));
    
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('1. API Key in .env:', apiKey ? '✅ Found' : '❌ Missing');
    
    if (!apiKey) {
        console.log('\n❌ No API key found in .env file');
        console.log('👉 Add this line to your .env file:');
        console.log('GEMINI_API_KEY=your_api_key_here');
        return;
    }
    
    console.log('2. API Key preview:', apiKey.substring(0, 10) + '...');
    
    // Try different models
    const models = ['gemini-pro', 'gemini-1.0-pro', 'gemini-1.5-pro'];
    
    console.log('\n3. Testing API connection...');
    
    for (const modelName of models) {
        try {
            console.log(`\n   Trying ${modelName}...`);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent("Say 'OK' if you can hear me");
            const response = result.response.text();
            
            console.log(`   ✅ SUCCESS with ${modelName}!`);
            console.log(`   Response: ${response}`);
            
            console.log('\n✨ YOUR API IS WORKING!');
            console.log(`👉 Use this model in your code: "${modelName}"`);
            return;
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message.split('\n')[0]}`);
            
            // Check for specific errors
            if (error.message.includes('API key')) {
                console.log('\n❌ API KEY ERROR: Your key is invalid');
                console.log('👉 Get a new key from: https://makersuite.google.com/app/apikey');
                return;
            } else if (error.message.includes('billing')) {
                console.log('\n❌ BILLING ERROR: You need to enable billing');
                console.log('👉 Go to: https://console.cloud.google.com/billing');
                return;
            }
        }
    }
    
    console.log('\n❌ All models failed. Follow these steps:');
    console.log('1. Go to: https://makersuite.google.com/app/apikey');
    console.log('2. Create a NEW API key');
    console.log('3. Update your .env file with the new key');
    console.log('4. Go to: https://console.cloud.google.com/billing');
    console.log('5. Enable billing (free credits included)');
    console.log('6. Enable the Generative Language API in Google Cloud Console');
}

fixGemini();