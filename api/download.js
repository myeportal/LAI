const { getPdfBuffer, verifyDownloadToken } = require('../lib/delivery');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    verifyDownloadToken(req.query.token);
    const pdf = getPdfBuffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="LeashingAI-ebook.pdf"');
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    return res.status(200).send(pdf);
  } catch (error) {
    return res.status(401).json({ error: error.message || 'Unauthorized' });
  }
};
