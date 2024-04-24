const express = require('express');
const router = express.Router();

//middleware
const { playermiddle } = require('../middleware/academyMiddleware');

const {
  createPlayerPost,
  deletePlayerPost,
  allPlayerPost,
  allPlayerPosts,
  getdetails,
  playerPostbySport,
  requestonpost,
  Statusonpost,
  Getrequestonpost,
  POSTAccept,
  getpostsbyids,
  POSTREJECT,
} = require('../controllers/playerPostController');

router.use(
  [
    '/delete',

    '/create',
    '/allPlayerPost',
    '/allplayerposts',
    '/requestonpost',
    '/Statusonpost',
    '/Getrequestonpost ',
    '/POSTAccept',
    '/POSTREJECT',
    '/getpostsbyids',
  ],
  playermiddle
);
router.post('/getpostsbyids', getpostsbyids);
router.get('/Statusonpost/:_id', Statusonpost);
router.post('/requestonpost/:_id', requestonpost);
router.delete('/delete', deletePlayerPost);

router.post('/create', createPlayerPost);
router.post('/POSTAccept', POSTAccept);
router.post('/POSTREJECT', POSTREJECT);
router.get('/allPlayerPost', allPlayerPost);
router.get('/allplayerposts/', allPlayerPosts);
router.get('/details/:_id', getdetails);
router.get('/Getrequestonpost/:_id', Getrequestonpost);
router.get('/sport/:sport', playerPostbySport);

module.exports = router;
