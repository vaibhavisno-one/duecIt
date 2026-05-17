const serviceAuth = (req, res, next) => {
  const serviceKey = req.headers['x-service-key'];
  const expectedServiceKey =
    process.env.PROBLEM_SERVICE_KEY || process.env.SERVICE_KEY;

  if (!expectedServiceKey) {
    return res.status(500).json({
      success: false,
      error: 'Service authentication not configured'
    });
  }

  if (!serviceKey) {
    return res.status(401).json({
      success: false,
      error: 'Service key is required'
    });
  }

  if (serviceKey !== expectedServiceKey) {
    return res.status(403).json({
      success: false,
      error: 'Invalid service key'
    });
  }

  next();
};

export default serviceAuth;
