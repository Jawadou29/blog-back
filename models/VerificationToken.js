const mongoose = require("mongoose");

// verification token schema
const VerificationTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  token: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
})
// verification token model 
const VerificationToken = mongoose.model("verificationToken", VerificationTokenSchema);


module.exports = VerificationToken;