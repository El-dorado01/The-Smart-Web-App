//=============================Built-in modules==========================//
const path = require('path');
const http = require('http');

// ============================Express and SocketIO Server Setup========================= //
const express = require('express');
const app = express();
const server = http.createServer(app);

const socketio = require('socket.io');
const io = socketio(server);
app.set('socketio', io);

//==============================Installed modules=========================//
require('dotenv').config();
const cookieParser = require('cookie-parser');
const moment = require('moment');
const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');
const fileUpload = require('express-fileupload');
// Require the Cloudinary library
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
// const helmet = require('helmet');
const cors = require('cors');
// const xss = require('xss-clean');
// const rateLimiter = require('express-rate-limit');

//============================DB Connection file=========================//
const connectDB = require('./db/connect');

//=======================Register View Engine===========================//
app.set('view engine', 'ejs');
// =======================Cloudinary Config========================= //
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ====================File Uploads====================== //
// 50 * 1024 * 1024 = 50mb
app.use(
  fileUpload({
    // limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
  })
);

// =======================Middlewares===========================//
const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');
const authenticateUser = require('./middleware/authentication');

//==========================Use Middlewares==============================//
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('./public'));
app.use(express.static('./views'));
app.use(cookieParser());

// ========================Security Packages==================== //
// app.use(helmet())
app.use(cors());
// app.use(xss())

// app.set('trust proxy', 1)
// app.use(rateLimiter({
// 	windowMs: 15 * 60 * 1000, // 15 minutes
// 	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
// 	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
// 	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// }))

// =================== Models ======================= //
const UserchatsModels = require('./models/UserchatsModel');
const AuthModel = require('./models/AuthModel');
const MeetingsModel = require('./models/MeetingsModel');

//=============================Require Routes===============================//
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoute');
const privateRoutes = require('./routes/privateRoutes');
const publicRoutes = require('./routes/publicRoutes');
const smartNetworkRoutes = require('./routes/smartNetworkRoutes');
const emailVerificationRoutes = require('./routes/emailVerificationRoutes');
const forumRoutes = require('./routes/forumRoutes');

app.get('/', (req, res) => {
  res.render('index');
});
app.post('/logout', (req, res) => {
  res.clearCookie('jwtAccessToken');
  res.redirect('/auth/login');
});

const allSockets = require('./middleware/socketIO');
// const signallingServer = require("./middleware/signalling_server");
io.on('connection', allSockets);

// io.sockets.on("connection", (socket) => {

// });

io.on('connection', (socket) => {
  console.log('Connection established');

  socket.on('userChatroom', async (chatroomID) => {
    const findRoom = await UserchatsModels.findOne({
      _id: chatroomID,
    });

    roomMessages = findRoom.messages.map((message) => {
      var m = moment(new Date(message.dateSent));
      var time = m.format('h:mm A');

      return { message, time };
    });

    const senderDetails = await AuthModel.findById({
      _id: findRoom.initiator,
    });
    const recipientDetails = await AuthModel.findById({
      _id: findRoom.member,
    });
    socket.emit('chatRoomMessages', {
      senderDetails,
      recipientDetails,
      findRoom,
      roomMessages,
    });
    //   const createRoom = await UserchatsModels.create({
    //     initiator: myID,
    //     member: userID,
    //   });

    //   socket.emit("chatRoomMessages", createRoom);

    //   if (createRoom) console.log("Chat room created.");

    /*
      - Check if room has existed and open the chat room
      - If room has not been created, Create and open room for user
    */
  });

  socket.on('chatMessage', async (response) => {
    const senderID = response.senderID;
    const message = response.myMessage;
    const chatroomID = response.chatroomID;

    const newMessage = await UserchatsModels.findOneAndUpdate(
      { _id: chatroomID },
      {
        $push: {
          messages: { sender: senderID, dateSent: new Date(), message },
        },
      },
      {
        returnOriginal: false,
      }
    );

    const myMessage = newMessage.messages.pop();

    const m = moment(new Date(myMessage.dateSent));
    const time = m.format('h:mm A');
    /*
      - Get user message, his ID, and chatroom ID
      - Fetch chatroomID from database
      - Push user message into database
      - Return back to both users
      - Return back the sender ID and verify if they are equal to append to senders side
      - If they are not equal, append to recipient side
    */
    io.emit('newChatMessage', { time, myMessage });
  });
});

app.use('/auth', authRoutes);
app.use('/emailVerification', emailVerificationRoutes);
app.use('/upload', smartNetworkRoutes);
app.use('/dashboard', authenticateUser, dashboardRoutes);
app.use('/dashboard/private', authenticateUser, privateRoutes);
app.use('/dashboard/public', authenticateUser, publicRoutes);
app.use('/forums', forumRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

//============================Server Connection==========================//

const PORT = process.env.PORT || 5050;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(PORT, console.log(`Server is listening on port ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
