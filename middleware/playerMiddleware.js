const jwt = require('jsonwebtoken');

const playermiddle = (req, res, next) => {
  // const token = req.cookies.playerid;
  // if (!token) {
  //   return res.status(401).json({ error: 'no token present' });
  // }
  // jwt.verify(token, process.env.JWT, (err, playerid) => {
  //   if (err) {
  //     return res.status(401).json({ error: 'wrong token present' });
  //   }
  //   req.playerid = playerid.id;
  //   next();
  // });

  const token = req.headers['authorization'];
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token.split(' ')[1], 'secret', (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    
    req.playerid = playerid.id;
    next();
  });




};

module.exports = {
  playermiddle,
};
