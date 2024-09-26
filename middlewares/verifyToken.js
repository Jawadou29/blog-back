const jwt = require("jsonwebtoken");


function verifyToken(req, res, next) {
  const tokenAuth = req.headers.authorization;
  if (tokenAuth) {
    let token = tokenAuth.split(" ")[1]
    try {
      const decodedPayload = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decodedPayload;
      next();
    } catch (error) {
      return res.status(401).json({message: "ivalide token, access denied"});
    }
  }
  else{
    return res.status(401).json({message: "no token provided, access denied"})
  }
}
// verify token and admin
function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next()
    } else {
      return res.status(403).json({message: "not allowed only admin"});
    }
  })
}
// verify token and user
function verifyTokenAndUser(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id) {
      next()
    } else {
      return res.status(403).json({message: "not allowed user him self"});
    }
  })
}

// verify token and amdin or user
function verifyTokenAndUserOrAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next()
    } else {
      return res.status(403).json({message: "not allowed user himself or admin"});
    }
  })
}

module.exports = {
  verifyTokenAndAdmin,
  verifyTokenAndUser,
  verifyToken,
  verifyTokenAndUserOrAdmin
}