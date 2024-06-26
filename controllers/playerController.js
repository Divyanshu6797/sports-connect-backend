const playerModel = require('../models/playerModel');
const academyModel = require('../models/academyModel');
const playerPostModel = require('../models/playerPostModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const JWT = 'divyanshu'

const maxAge = 3 * 24 * 60 * 60; //3 days
createToken = (id) => {
  return jwt.sign({ id }, JWT, {
    expiresIn: maxAge,
  });
};
const check = async (req, res) => {
  try {
    const playerId1 = req.playerid;
    const player = await playerModel.findById(playerId1);

    if (!player) {
      console.log(player);
      // Player not found
      res.status(200).json({ loggedIn: false }); // Send response with loggedIn false
    } else {
      // Player found
      res.status(200).json({ loggedIn: true }); // Send response with loggedIn true
    }
  } catch (error) {
    console.error('Error checking player:', error);
    // Handle error
    res.status(500).json({ loggedIn: false }); // Send response with loggedIn false in case of error
  }
};
const signup = async (req, res) => {
  const { name, emailID, password, mobileNumber } = req.body;
  const player = await playerModel.findOne({ emailID });

  if (!player) {
    try {
      const player = await playerModel.create({
        name,
        emailID,
        password,
        mobileNumber,
      });
      console.log(player);
      // const token = createToken(player._id);
      // res.cookie('playerid', token, { httpOnly: true, maxAge: maxAge * 1000 });
      // res.status(200).json(player);

      const token = createToken(player._id);
      res.status(200).json({token});

      
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  } else {
    res.status(400).json({ error: 'User already exists' });
  }
};
const fetchPlayerInfo = async (req, res) => {
  try {
    // Find the player by their _id
    const player = await playerModel.findOne({ _id: req.playerid });

    // If player not found, return an error response
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Extract the name and general information from the player object
    const { name, emailID, mobileNumber, location } = player;

    // Create a new object containing only the name and general information
    const playerInfo = {
      name,
      emailID,
      mobileNumber,
      location,
    };

    // Return the player's name and general information as JSON response
    res.status(200).json(playerInfo);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error fetching player information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const login = async (req, res) => {
  const { emailID, password } = req.body;
  try {
    player = await playerModel.login(emailID, password);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  // const token = createToken(player._id);
  // res.cookie('playerid', token, { httpOnly: true, maxAge: maxAge * 1000 });
  // res.status(200).json(player);

  const token = createToken(player._id);
  console.log("token",token);
  
  res.status(200).json({token});

};

//we set lifetime to 1 ms so it goes
const logout = async (req, res) => {
  console.log('okkk');
  res.cookie('playerid', '', { maxAge: 1 });
  return res.status(200).json('');
};

const profile = async (req, res) => {
  try {
    const player = await playerModel.findOne({ _id: req.playerid });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    res.status(200).json(player);
  } catch (error) {
    console.error('Error fetching player profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    let player = await playerModel.findOne({ _id: req.playerid });
    console.log(player);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const { emailID, password, ...updatedData } = req.body;
    console.log(updatedData);
    player.set(updatedData);

    player = await player.save();

    res.status(200).json(player);
  } catch (error) {
    console.error('Error updating player profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const applytoacad = async (req, res) => {
  const player = await playerModel.findOne({ _id: req.playerid });
  if (!player) {
    return res.status(400).json({ error: 'no such player' });
  }

  const { name } = req.body;
  const nameobj = { name };
  const acad = await academyModel.findOne({ name });
  if (!acad) {
    return res.status(400).json({ error: 'no such academy' });
  }
  const tryfind = await playerModel.findOne({
    _id: req.playerid,
    'applied.name': name,
  });
  if (tryfind) {
    return res.status(400).json({ error: 'already applied' });
  }
  if (acad.quantity < 1) {
    return res.status(400).json({ error: 'no place available right now ' });
  }
  const newquant = acad.quantity - 1;
  await academyModel.findOneAndUpdate(
    { name },
    { $set: { quantity: newquant } }
  );

  const tryupdate = await playerModel.findOneAndUpdate(
    { _id: req.playerid },
    { $push: { applied: nameobj } }
  );

  console.log('here');
  return res.status(200).json({ tryupdate });
};

const applied = async (req, res) => {
  const player = await playerModel.findOne({ _id: req.playerid });
  console.log(player);
  return res.status(200).json({ player });
};

const leaveacad = async (req, res) => {
  console.log(req.body);
  const { name } = req.body;
  await academyModel.findOneAndUpdate({ name }, { $inc: { quantity: 1 } });

  console.log(name);
  console.log(req.playerid);

  const retval = await playerModel.findOneAndUpdate(
    { _id: req.playerid },
    { $pull: { applied: { name } } }
  );

  return res.status(200).json({ retval });
};

const addtostarred = async (req, res) => {
  try {
    const player = await playerModel.findById(req.playerid);
    if (!player) {
      return res.status(400).json({ error: 'No such player' });
    }

    const { _id } = req.body;

    const post = await playerPostModel.findById(_id);
    if (!post) {
      return res.status(400).json({ error: 'No such playerPost here' });
    }

    const isStarred = player.starred.some((item) => item._id === _id);
    if (isStarred) {
      return res.status(400).json({ error: 'Post already starred' });
    }
    post_id = _id;
    // Push the post ID to the starred array
    await playerModel.findByIdAndUpdate(req.playerid, {
      $push: { starred: { post_id } },
    });

    return res
      .status(200)
      .json({ message: 'Post added to starred list successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const starred = async (req, res) => {
  try {
    const playerId = req.playerid;

    // Find the player based on the player ID
    const player = await playerModel.findOne({ _id: playerId });

    // If player not found, return an error response
    if (!player) {
      return res.status(400).json({ error: 'No such player' });
    }

    // Extract the starred post IDs from the player document
    const starredPostIds = player.starred.map((item) => item.post_id);

    // Return the array of starred post IDs in the response
    return res.status(200).json(starredPostIds);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const removefromstarred = async (req, res) => {
  const playerId = req.playerid;
  const { _id, createdBy } = req.body;
  console.log('hi');
  try {
    // Check authorization
    // if (createdBy !== playerId) {
    //   return res
    //     .status(403)
    //     .json({ error: 'You are not authorized to delete this post.' });
    // }

    // Remove the specific post ID from the player's starred array
    const updatedPlayer = await playerModel.findOneAndUpdate(
      { _id: playerId },
      { $pull: { starred: { post_id: _id } } }, // Remove the specified post ID from the starred array
      { new: true } // To return the updated document
    );
    console.log('Updated Player:', updatedPlayer);

    if (!updatedPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }

    return res.status(200).json({ updatedPlayer });
  } catch (error) {
    console.error('Error removing post from starred:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  signup,
  login,
  logout,
  profile,
  updateProfile,
  applied,
  applytoacad,
  leaveacad,
  addtostarred,
  starred,
  removefromstarred,
  fetchPlayerInfo,
  check,
};
