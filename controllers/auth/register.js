const path = require("path");
const fs = require("fs")
require("dotenv").config();

require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const mjml2html = require('mjml');
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();

const AuthModel = require("../../models/AuthModel");
const NotificationsModel = require("../../models/NotificationsModel");
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
  const userNotification = await NotificationsModel.create({
    userID: user._id
  })

  res.status(StatusCodes.CREATED).json({ user });

  const token = user.createAccessToken();

  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

  userDetails = {
    userId: payload.userId,
    userName: payload.userName,
  };

  const fetchUser = await AuthModel.findById(userDetails.userId);

    //Build email body using mjml

        var mjmlOptions = {

            fonts: {
                'Quicksand': "https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap",
            }
        };
        var mjmlData = `
            <mjml>
                <mj-head>
                    <mj-font name="Quicksand" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap" />
                </mj-head>
                <mj-body background-color="#FFFFFF">
                    <!-- Header with Sphere logo -->
                    <mj-section background-color="#FFFFFF">
                        <mj-column width="600px">
                            <mj-image align="center" width="35px" height="35px" src="https://res.cloudinary.com/eldoradotechguy/image/upload/v1688845550/imageUpload/smart_c5sa9e.png" />
                        </mj-column>
                    </mj-section>
                    <!-- Email Body Section -->
                    <mj-section border-radius="1rem" background-color="hsl(252, 30%, 95%)">
                        <mj-column>
                            <mj-text font-family="Quicksand" align="center" font-size="20px">Email Verification Link</mj-text>
                            <mj-text font-family="Quicksand" font-size="17px" font-style="italic">Hello ${userDetails.userName},</mj-text>
                            <mj-text font-family="Quicksand">
                                There is one more step to complete for you to begin your social adventure.
                            </mj-text>
                            <mj-text font-family="Quicksand">
                                Please click the button below to verify your email. You can also copy and paste the link below in your browser.
                            </mj-text>
                            <mj-button font-family="Quicksand" href="http://localhost:5050/emailVerification/verify_email/${userDetails.userId}/key?keyValue=${key}" border-radius="2rem" align="center" background-color="#3b5998">
                                Verify
                            </mj-button>
                            <mj-button font-family="Quicksand" href="http://localhost:5050/emailVerification/verify_email/${userDetails.userId}/key?keyValue=${key}">
                                http://localhost:5050/emailVerification/verify_email/${userDetails.userId}/key?keyValue=${key}
                            </mj-button>
                            <mj-text font-family="Quicksand">
                                Thanks, Sphere Inc.
                            </mj-text>
                        </mj-column>
                    </mj-section>
                    <!-- Email Footer & Social Icons -->
                    <mj-section background-color="#FFFFFF">
                        <mj-column width="500px">
                            <mj-text align="center" padding="0">&copy; 2023 Sphere, Inc. All rights reserved.</mj-text>
                            <mj-text align="center" padding="0"> Avenue 8 Iludun, Osogbo Osun, Nigeria.</mj-text>
                            <mj-social align="center">
                                <mj-social-element name="facebook"></mj-social-element>
                                <mj-social-element name="twitter"></mj-social-element>
                                <mj-social-element name="instagram"></mj-social-element>
                            </mj-social>
                        </mj-column>
                    </mj-section>
                </mj-body>
            </mjml>
        `;

  const { html, errors } = mjml2html(mjmlData, mjmlOptions);

  if (errors.length) {
    console.error(errors);
  } else {
    //console.log(html);
    // Further processing with the generated HTML
  }
  
  //Send Email for Verification
  const oAuth2Client = new google.auth.OAuth2(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET, process.env.OAUTH_REDIRECT_URI);
  oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN })

  async function sendMail() {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "adebayosodiqkolade@gmail.com",
                clientId: process.env.OAUTH_CLIENT_ID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        let message = {
            from: "Sphere Web App <sphere@sphereweb.com>",
            to: `${fetchUser.email}`,
            subject: "Email Verification Link",
            html: html,
        };

        const result = await transporter.sendMail(message);
        return result;
    } catch (err) {
        return err;
    }
  }

//   let testAccount = await nodemailer.createTestAccount();

//   const transporter = nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "c64ef22fd5e9cf",
//       pass: "b2afae5d8ba1f0",
//     },
//   });

sendMail().then(result => {
    // =====================Email Verification Sent==================== //
    console.log("Registration successfully");
}).catch(err => {
    console.error("An error occurred: ", err)
})
});

module.exports = {
  registerForm,
  registerUser,
};
