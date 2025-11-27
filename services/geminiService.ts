import { GoogleGenAI } from "@google/genai";
import { TreatmentRecord, Patient } from "../types";

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to safely initialize the AI client
const getAIClient = (): GoogleGenAI | null => {
  let apiKey = '';
  
  try {
    // Safely access process.env to avoid ReferenceError in non-Node environments
    if (typeof process !== 'undefined' && process.env) {
       apiKey = process.env.API_KEY || '';
    }
  } catch (e) {
    // Ignore env access errors
  }
  
  if (!apiKey) return null;
  
  return new GoogleGenAI({ apiKey });
};

export const generatePatientSummary = async (patient: Patient, treatments: TreatmentRecord[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI features unavailable (API Key missing).";

  try {
    const prompt = `
      You are a dental assistant for Raj True Dent.
      Summarize the medical history for this patient in a professional, concise paragraph suitable for a quick doctor's review.
      
      Patient: ${patient.name}, ${patient.age} years old, ${patient.sex}.
      
      Treatments History:
      ${JSON.stringify(treatments.map(t => ({ date: t.date, type: t.type, desc: t.description, status: t.labStatus })))}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate summary. Please check connection.";
  }
};

export const generateAppointmentReminder = async (patientName: string, date: string, time: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI features unavailable (API Key missing).";

  try {
    const prompt = `
      Write a polite, professional SMS reminder for a dental appointment at Raj True Dent.
      Patient: ${patientName}
      Date: ${date}
      Time: ${time}
      Keep it under 160 characters.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Reminder generation failed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating reminder.";
  }
};