import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const body = await req.json();

    if (!body.base64Image) {
      return new Response(JSON.stringify({ error: "No image provided" }), { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const result = await model.generateContent([
      body.base64Image,
      "Detecta todos los precios con símbolo € y suma el total. Solo responde con el número total, nada más.",
    ]);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ total: text }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error procesando la imagen" }), { status: 500 });
  }
}

