// API de test simple pour vérifier que les fonctions Vercel marchent
module.exports = async function handler(req, res) {
  try {
    console.log('Test API called with method:', req.method);
    
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method Not Allowed',
        method: req.method 
      });
    }

    // Test basique sans dépendances externes
    return res.status(200).json({
      success: true,
      message: 'API Test working!',
      timestamp: new Date().toISOString(),
      body: req.body
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Test API Error: ' + error.message 
    });
  }
};
