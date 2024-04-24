const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const coachSchema = new mongoose.Schema(
  {
    emailID: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { Timestamps: true }
);

coachSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

coachSchema.statics.login = async function (emailID, password) {
  const coach = await this.findOne({ emailID });
  if (!coach) throw Error('no such coach');
  const auth = await bcrypt.compare(password, coach.password);
  if (!auth) throw Error('wrong password');
  return coach;
};

module.exports = mongoose.model('coach', coachSchema);
