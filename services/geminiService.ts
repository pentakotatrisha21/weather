
import { GoogleGenAI } from "@google/genai";
import { WeatherData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getWeatherData = async (location: string): Promise<WeatherData> => {
  const prompt = `Provide the current detailed weather information for ${location}. 
  Include: current temperature, weather condition (like Sunny, Cloudy, Rain), High/Low for today, humidity %, wind speed, UV index, and visibility.
  Also provide a 5-day forecast with day name and expected temperature.
  Finally, write a 2-sentence AI summary about what to expect and any advice (e.g., carry an umbrella).
  
  Format the quantitative data clearly.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "No data available.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri,
    }));

  // Simple parsing logic for the grounded response
  // In a production app, we might use a two-step process to get structured JSON
  // But for this demonstration, we'll extract key bits and rely on the AI's summary
  
  return {
    location,
    temperature: extractValue(text, /temperature is ([\d\w°F|°C]+)/i) || "--",
    condition: extractValue(text, /condition is ([\w\s]+)/i) || "Unknown",
    high: extractValue(text, /high of ([\d\w°F|°C]+)/i) || "--",
    low: extractValue(text, /low of ([\d\w°F|°C]+)/i) || "--",
    humidity: extractValue(text, /humidity is ([\d%]+)/i) || "--",
    windSpeed: extractValue(text, /wind speed is ([\d\w\s/]+)/i) || "--",
    uvIndex: extractValue(text, /UV index is ([\d]+)/i) || "--",
    visibility: extractValue(text, /visibility is ([\d\w\s]+)/i) || "--",
    forecast: [], // Forecast parsing would be complex from raw text, focusing on summary
    summary: text,
    sources,
  };
};

const extractValue = (text: string, regex: RegExp): string | null => {
  const match = text.match(regex);
  return match ? match[1] : null;
};

export const generateWeatherImage = async (condition: string, location: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A cinematic, hyper-realistic wide-angle landscape photograph of ${location} under ${condition} weather conditions. Moody lighting, high detail, 4k.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed", error);
  }
  return `https://picsum.photos/1920/1080?weather=${condition}`;
};
