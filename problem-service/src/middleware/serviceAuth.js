const serviceAuth = (req, res, next) => {
  const serviceKey = req.headers['x-service-key'];

  if (!serviceKey) {
    return res.status(401).json({
      success: false,
      error: 'Service key is required'
    });
  }

  if (serviceKey !== process.env.SERVICE_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Invalid service key'
    });
  }

  next();
};

export default serviceAuth;