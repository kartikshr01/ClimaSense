import { GoogleGenAI, Type } from "@google/genai";
import { ComfortData, ComfortInput, LocationDateInput } from '../types';

// This is a browser-only app, so the API key is passed from the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the expected JSON structure for the model's response in both languages.
const getResponseSchema = (language: 'en' | 'hi') => ({
    type: Type.OBJECT,
    properties: {
        comfort: {
            type: Type.STRING,
            description: language === 'hi' ? "आराम के स्तर का वर्णन करने वाला एक शब्द या छोटा वाक्यांश। उदाहरण: आरामदायक, ठंडा, हल्का असुविधाजनक, गर्म, बहुत ठंडा, हवादार, आर्द्र, गीला, तूफानी।" : "A single word or short phrase describing the comfort level. Examples: Comfortable, Cool, Mildly Uncomfortable, Hot, Very Cold, Windy, Humid, Wet, Stormy."
        },
        summary: {
            type: Type.STRING,
            description: language === 'hi' ? "इन परिस्थितियों में बाहर होने की समग्र भावना का वर्णन करने वाला एक छोटा, एक-वाक्य का सारांश।" : "A short, one-sentence summary describing the overall feeling of being outdoors in these conditions."
        },
        recommendation: {
            type: Type.STRING,
            description: language === 'hi' ? "इन परिस्थितियों में बाहरी गतिविधि की योजना बना रहे किसी व्यक्ति के लिए एक छोटी, कार्रवाई योग्य सिफारिश। उदाहरण: 'पिकनिक के लिए बिल्कुल सही!' या 'घर के अंदर रहना ही सबसे अच्छा है।'" : "A short, actionable recommendation for someone planning an outdoor activity under these conditions. Example: 'Perfect for a picnic!' or 'Best to stay indoors.'"
        }
    },
    required: ['comfort', 'summary', 'recommendation']
});

/**
 * Gets historical or forecasted weather data for a location and date using Google Search.
 * @param input The location and date.
 * @returns A promise that resolves to the weather data.
 */
export const getWeatherForLocationAndDate = async (input: LocationDateInput): Promise<ComfortInput> => {
    const prompt = `First, using Google Search, verify that "${input.location}" is a real, valid geographical location.
If it is NOT a real location, respond ONLY with the JSON: {"error": "Invalid location specified."}
If it IS a real location, find the weather data for it on the date ${input.date}.
Provide the following metrics:
- Average temperature in Celsius.
- Average humidity in percent.
- Average wind speed in kilometers per hour (km/h).
- Chance of precipitation in percent.

Respond ONLY with a valid JSON object. For a valid location, use keys: "temp", "humidity", "wind", "rain".
For example: {"temp": 15, "humidity": 70, "wind": 12, "rain": 5}
Do not include any other text, explanations, or markdown formatting.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0, // We want factual data, so no creativity.
            },
        });

        // It's critical to gracefully handle the response, which might not be perfect JSON.
        let jsonStr = response.text.trim();
        // Remove markdown ```json and ```
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }

        const result = JSON.parse(jsonStr) as ComfortInput & { error?: string };

        // Handle invalid location error returned by the model
        if (result.error) {
            throw new Error(`The location "${input.location}" is invalid or does not exist.`);
        }

        // Basic validation
        if (typeof result.temp !== 'number' || typeof result.humidity !== 'number' || typeof result.wind !== 'number' || typeof result.rain !== 'number') {
            throw new Error("AI model returned weather data in an invalid format.");
        }

        return result;

    } catch (error) {
        console.error("Error fetching weather data from Gemini API:", error);
        if (error instanceof Error) {
            if (error.message.includes("API key not valid")) {
                throw new Error("The configured API key is not valid. Please check your environment configuration.");
            }
            // Re-throw specific errors to be caught by the UI
            if (error.message.includes("is invalid or does not exist")) {
                throw error;
            }
        }
        throw new Error(`Failed to get weather data for ${input.location}. The location might be invalid or data may be unavailable for the selected date.`);
    }
};


/**
 * Gets a comfort prediction from the Gemini model based on weather inputs.
 * @param weatherInput The weather conditions.
 * @param locationInput The location and date for context.
 * @param language The language for the response.
 * @returns A promise that resolves to the comfort data.
 */
export const getComfortPrediction = async (weatherInput: ComfortInput, locationInput: LocationDateInput, language: 'en' | 'hi'): Promise<ComfortData> => {
    
    const prompt = language === 'hi'
    ? `आप एक विशेषज्ञ मौसम विज्ञानी हैं जो मानव आराम में विशेषज्ञता रखते हैं।
    ${locationInput.location} स्थान पर ${locationInput.date} की तारीख के लिए निम्नलिखित मौसम की स्थिति के आधार पर, बाहरी आराम के स्तर का अनुमान लगाएं।
    
    मौसम की स्थिति:
    - तापमान: ${weatherInput.temp}°C
    - आर्द्रता: ${weatherInput.humidity}%
    - हवा की गति: ${weatherInput.wind} km/h
    - वर्षा की संभावना: ${weatherInput.rain}%
    
    आराम के स्तर के लिए एक शब्द या छोटा वाक्यांश, भावना को समझाने वाला एक संक्षिप्त एक-वाक्य का सारांश, और बाहरी गतिविधियों के लिए एक छोटी, कार्रवाई योग्य सिफारिश प्रदान करें।
    कोई स्पष्टीकरण, संवादी पाठ, या मार्कडाउन स्वरूपण न जोड़ें, केवल कच्चा JSON ऑब्जेक्ट दें। कृपया हिंदी में जवाब दें।`
    : `You are an expert meteorologist specializing in human comfort.
    Based on the following weather conditions for the location "${locationInput.location}" on ${locationInput.date}, predict the outdoor comfort level.
    
    Weather Conditions:
    - Temperature: ${weatherInput.temp}°C
    - Humidity: ${weatherInput.humidity}%
    - Wind Speed: ${weatherInput.wind} km/h
    - Chance of Precipitation: ${weatherInput.rain}%
    
    Provide a one-word or short phrase for the comfort level, a brief one-sentence summary explaining the feeling, and a short, actionable recommendation for outdoor activities.
    Do not add any explanation, conversational text, or markdown formatting, just the raw JSON object. Please respond in English.`;


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: getResponseSchema(language),
                temperature: 0.2, // Lower temperature for more deterministic, expert-like output
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr) as { comfort: string; summary: string; recommendation: string };

        // Basic validation to ensure the model returned the expected fields.
        if (!result.comfort || !result.summary || !result.recommendation) {
            throw new Error("Received an invalid response structure from the AI model.");
        }

        return {
            source: 'the ClimaSense AI Prediction Model.',
            location: locationInput.location,
            date: locationInput.date,
            input: weatherInput,
            comfort: result.comfort,
            summary: result.summary,
            recommendation: result.recommendation
        };

    } catch (error) {
        console.error("Error fetching prediction from Gemini API:", error);
        if (error instanceof Error && error.message.includes("API key not valid")) {
            throw new Error("The configured API key is not valid. Please check your environment configuration.");
        }
        throw new Error("Failed to get a prediction from the AI model. Please try again later.");
    }
};