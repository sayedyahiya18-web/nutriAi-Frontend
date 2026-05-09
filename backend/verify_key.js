const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testKey() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Say 'API Key is working!' if you can hear me.");
    console.log(result.response.text());
  } catch (error) {
    console.error("API Key Test Failed:", error.message);
  }
}

testKey();
