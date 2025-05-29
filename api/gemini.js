import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST permitido' });
  }

  const { images } = req.body;
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'Se requieren imágenes en base64' });
  }

  const API_KEY = process.env.API_KEY; // API key en variables de entorno Vercel

  try {
    const totales = [];

    for (const base64img of images) {
      // Llamada a la API OCR (ajusta la URL y el cuerpo según la API que uses)
      const response = await fetch('https://api.openai.com/v1/images/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          image: base64img,
          // otros parámetros que tu API necesite
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error API OCR:', text);
        return res.status(500).json({ error: 'Error en la API OCR' });
      }

      const data = await response.json();

      // Extrae los números que representen totales de la respuesta (ajusta según API)
      // Por ejemplo, supongamos que data.text contiene todo el texto detectado:
      const textoDetectado = data.text || '';

      // Extraemos números con regex (números con decimales, ejemplo 12.34 o 45)
      const regex = /(\d+(?:\.\d{1,2})?)/g;
      const matches = textoDetectado.match(regex) || [];

      // Convertimos a números y filtramos, luego sumamos o guardamos (ajusta según tu lógica)
      const numeros = matches.map(Number).filter(n => !isNaN(n));

      // Por ejemplo, tomamos el mayor número como total de esa imagen
      const mayor = numeros.length > 0 ? Math.max(...numeros) : 0;
      totales.push(mayor);
    }

    res.status(200).json({ totales });
  } catch (error) {
    console.error('Error función serverless:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
