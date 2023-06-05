const path = require("path");

require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();

const AuthModel = require("../../models/AuthModel");
const asyncWrapper = require("../../middleware/async");
let isValidEmail = false;
app.use(cookieParser());
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");

const registerForm = (req, res) => {
  const cookies = req.cookies;

  if (cookies?.jwtAccessToken) {
    res.status(StatusCodes.PERMANENT_REDIRECT).redirect("/dashboard");
  } else {
    res.status(StatusCodes.OK).render("./auth/register", { successMsg: "" });
  }
};

const registerUser = asyncWrapper(async (req, res) => {
  const key = uuidv4();
  const { username, email, password } = req.body;

  const userInfo = {
    username,
    email,
    password,
    key,
  };

  //   var kickbox = require("kickbox")
  //     .client(process.env.KICKBOX_API_KEY)
  //     .kickbox();

  //   kickbox.verify(email, function (err, response) {
  //     // Let's see some results
  //     var result = response.body.result;
  //     var acceptAll = response.body.accept_all;

  //     console.log(response.body);
  //     if (result == "undeliverable" && acceptAll == false) {
  //     } else {
  //     }
  //   });

  //   return;

  const user = await AuthModel.create(userInfo);

  res.status(StatusCodes.CREATED).json({ user });

  const token = user.createAccessToken();

  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

  userDetails = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const fetchUser = await AuthModel.findById(userDetails.userId);

  //Send Email for Verification
  const nodemailer = require("nodemailer");

  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "c64ef22fd5e9cf",
      pass: "b2afae5d8ba1f0",
    },
  });

  // Message object
  let message = {
    from: "Smart Web App <adebayosodiqkolade.email>",
    to: `${userDetails.userName} <${fetchUser.email}>`,
    subject: "Successful registration",
    html: `
        <html>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap" rel="stylesheet">
                <script src="https://kit.fontawesome.com/02e26faee8.js" crossorigin="anonymous"></script>
            </head>
            <body>
                <div style="
                background: hsl(252, 30%, 95%);
                height: 100vh;
                width: 100%;
                ">
                    <div style="
                        width: 100%;
                        height: 25%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background-color: hsl(252, 30%, 17%);
                        color: hsl(252, 30%, 95%);
                    ">
                        <h2 style="
                            font-size: 3rem; 
                            font-weight: bold; 
                            margin-bottom: 30px;
                        ">Smart Web</h2>
                        <a href="" style="
                            border-radius: 1rem; 
                            padding: 1rem; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center;
                            border: hsl(252, 30%, 100%) 1px solid;
                            background: hsl(252, 30%, 95%);
                        ">Get Started</a>
                    </div>
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 40px 0 15px 0;
                        height: 50%;
                    ">
                        <div style="
                            width: 70%;
                            height: auto;
                            padding: 1rem 0;
                            border-radius: 1rem;
                            background: hsl(252, 30%, 100%);
                        ">
                            <div style="
                                border-radius: 1rem 1rem 0 0; 
                                padding: 1rem; 
                                border-bottom: 1px solid;
                            ">
                                <h4 style="
                                    font-size: 1.8rem; 
                                    font-weight: 600;
                                ">Email Verification Link</h4>
                            </div>
                            <div style="
                                padding: 1rem; 
                                margin-top: 20px; 
                                border-radius: 0 0 1rem 1rem;
                                line-height: 20px;
                            ">
                                <p style="
                                    font-size: 1.5rem; 
                                    margin-bottom: 10px;
                                ">
                                    <b>Hello</b>, ${userDetails.userName}!
                                </p>
                                <p style="
                                    font-size: 1rem; 
                                    margin-bottom: 5px;
                                ">
                                    Here is your email verification link. You can 
                                    <a style="
                                        padding: 0.2rem; 
                                        border-radius: 5px; 
                                        background: rgb(8, 119, 194); 
                                        text-decoration: none; 
                                        cursor: pointer;
                                    " href="http://localhost:5050/emailVerification/verify_email/${userDetails.userId}/key?keyValue=${key}">Click Here</a> 
                                    to verify your account or copy and paste the link below in your browser;
                                </p>
                                <p style="
                                    font-size: 1rem; 
                                    font-weight: 600;
                                ">
                                    <a href="http://localhost:5050/emailVerification/verify_email/${userDetails.userId}/key?keyValue=${key}" style="text-decoration: underline;">
                                        http://localhost:5050/emailVerification/verify_email/${userDetails.userId}/key?keyValue=${key}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style="
                        border: 1px solid;
                        width: 100%;
                        height: auto;
                        background-color: hsl(252, 30%, 17%);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        color: hsl(252, 30%, 95%);
                        padding: 1rem 0;
                    ">
                        <p style="font-size: 1.8rem;"><i class="fa fa-copyright"></i> Smart Web</p>
                        <p style="font-size: 1.5rem; margin-bottom: 5px;">Avenue 8, Sango Ota, Lagos, Nigeria</p>
                        <div style="font-size: 1.5rem;">
                            <span><a href=""><i class="fa fa-facebook-square"></i></a></span>
                            <span><a href=""><i class="fa fa-twitter-square"></i></a></span>
                            <span><a href=""><i class="fa fa-instagram"></i></a></span>
                        </div>
                    </div>
                </div>
            </body>
        </html>
        
        `,
  };

  await transporter.sendMail(message);

  // =====================Email Verification Sent==================== //
  console.log("Registration successfully");
});

module.exports = {
  registerForm,
  registerUser,
};
