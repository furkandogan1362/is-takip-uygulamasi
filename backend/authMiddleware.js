const jwt = require('jsonwebtoken');
const SECRET_KEY = 'secret_key';

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Token gerekli');
  }
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send('Yetkisiz');
    }
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
