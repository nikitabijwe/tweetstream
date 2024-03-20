const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require("cors");

const DataAccessObject = require('./dataAccessObject');
const CommentModel = require('./models/comment');
const UserModel = require('./models/user');

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.Server(app);
const SOCKET_URL = "http://localhost:3000";

const io = require("socket.io")(server, {
  cors: {
    origin: SOCKET_URL,
  },
});

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

const dataAccessObject = new DataAccessObject('./database.sqlite3');

const commentModel = new CommentModel(dataAccessObject);

commentModel.createTable().catch(error => {
  console.log(`Error: ${JSON.stringify(error)}`);
});

const userModel = new UserModel(dataAccessObject);

app.get('/', function (request, response) {
  const rootDir = __dirname.replace('/server', '');
  response.sendFile(`${rootDir}/src/index.html`);
});

app.post('/createComment', function (request, response) {
  const { body } = request;
  commentModel.createComment(body).then(result => {
    response.send(result);
  });
});

app.get('/getComment', function (request, response) {
  const { id } = request.query;
  commentModel.getComment(id).then(result => {
    io.emit("new-comment", result);
    response.send(result);
  });
});

app.get('/getComments', function (request, response) {
  commentModel.getComments().then(result => {
    response.send(result);
  });
});

app.delete('/deleteComments', function (request, response) {
  commentModel.deleteComments().then(result => {
    response.send(result);
  });
});

app.delete('/deleteComment', function (request, response) {
  const { id } = request.query;
  commentModel.deleteComment(id).then(result => {
    response.send(result);
  });
});

app.put('/updateComment', function (request, response) {
  const { body } = request;
  commentModel.updateComment(body).then(result => {
    response.send(result);
  });
});


app.post('/createUser', function (request, response) {
  const { body } = request;
  userModel.createUser(body).then(result => {
    response.send(result);
  });
});

app.get('/getUsers', function (request, response) {
  userModel.getUsers().then(result => {
    response.send(result);
  });
});

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("sendNotification", ({ senderName }) => {
    socket.broadcast.emit("getNotification", {
      senderName
    });
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
io.listen(1300);
