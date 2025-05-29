import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST permitido' });
  }

  const { images } = req.body;
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'Se requieren imágenes en base64' });
  }

  const API_KEY = process.env.API_KEY;

  try {
    const totales = [];

    for (const base64img of images) {
      const response = await fetch('https://api.openai.com/v1/images/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          image: base64img,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error API OCR:', text);
        return res.status(500).json({ error: 'Error en la API OCR' });
      }

      const data = await response.json();

      const textoDetectado = data.text || '';

      const regex = /(\d+(?:\.\d{1,2})?)/g;
      const matches = textoDetectado.match(regex) || [];

      const numeros = matches.map(Number).filter(n => !isNaN(n));

      const mayor = numeros.length > 0 ? Math.max(...numeros) : 0;
      totales.push(mayor);
    }

    res.status(200).json({ totales });
  } catch (error) {
    console.error('Error función serverless:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
