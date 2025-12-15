import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(200).end();
  }

  const { path } = req.query;
  
  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  
  const imagePath = path.join('/');
  const imageUrl = `https://${req.headers.host}/${imagePath}`;
  
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
    
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch image', details: (error as Error).message });
  }
}
