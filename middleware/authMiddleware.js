import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader.replace('Bearer ', '');

  console.log("Auth Header:", authHeader);
  console.log("Token:", token);

  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified Token:", verified);
    if(verified.role.toLowerCase() === "renter"){
      req.renterId = verified.id;
      req.userId = verified.id;
    }
    if(verified.role.toLowerCase() === "owner"){
      req.ownerId = verified.id;
      req.userId = verified.id;
      // console.log("owner " +req.ownerId )
    }
   
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

export default authMiddleware;  // Change to ES6 export
