import jwt from "jsonwebtoken";

const JWT_SECRET = "1957abg973poh"

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const authorizeRole = (allowedRoles) => (req, res, next) => {
  const { role } = req.user;

  if (!allowedRoles.includes(role)) {
    return res
      .status(403)
      .json({ message: "Access forbidden: insufficient rights" });
  }

  next();
};