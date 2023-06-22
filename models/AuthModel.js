const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const AuthSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      maxlength: [30, "Username cannot be more than 30 characters."],
      minlength: [3, "Username cannot be less than 3 characters."],
      required: [true, "A username must be provided"],
      index: {
        unique: true,
      },
    },
    email: {
      type: String,
      trim: true,
      required: [true, "An email must be provided"],
      index: {
        unique: true,
      },
    },
    password: {
      type: String,
      required: [true, "A password must be provided"],
      minlength: [6, "Password cannot be less than 6 characters"],
    },
    key: {
      type: String,
    },
    verificationStatus: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: Number,
      trim: true,
      index: {
        unique: true,
        sparse: true,
      },
    },
    about: {
      type: String,
    },
    avatar: {
      type: String,
    },
    friends: [
      {
        userID: {
          type: String,
        },
        status: {
          type: String,
          default: "pending",
        },
        block: {
          type: Boolean,
          default: false,
        },
        blocker: {
          type: String,
        },
        sender: {
          type: String,
        },
      },
    ],
    themeCustomization: {
      fontSize: {
        type: String,
        default: "13px",
      },
      colorTheme: {
        type: String,
        default: "green",
      },
      background: {
        type: String,
        default: "light",
      },
    },
    lockScreen: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// =======================Hash Password using bcrypt===================== //
AuthSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// =========================Create Unique Token ======================= //
AuthSchema.methods.createAccessToken = function () {
  return jwt.sign(
    { userId: this._id, userName: this.username },
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_DURATION,
    }
  );
};

// ========================Validate Password =========================== //
AuthSchema.methods.validatePassword = async function (userPassword) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("user", AuthSchema);
