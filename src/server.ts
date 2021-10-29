import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDatabase, getUserCollection } from './utils/database';

if (!process.env.MONGODB_URI) {
  throw new Error('No MongDB found');
}

const app = express();
const port = 3000;

// Middleware for parsing application/json
app.use(express.json());

app.post('/api/client', async (request, response) => {
  const newUser = request.body;
  const existingUser = await getUserCollection().findOne({
    username: newUser.username,
  });
  if (!existingUser) {
    await getUserCollection().insertOne(newUser);
    response.send(`User ${newUser.username} added`);
  } else {
    response
      .status(404)
      .send('Usename already exists. Please choose another one.');
  }
});

app.delete('/api/client/:username', async (request, response) => {
  const usernameToDelete = request.params.username;
  const existingUser = await getUserCollection().findOne({
    username: usernameToDelete,
  });
  if (existingUser) {
    await getUserCollection().deleteOne({ username: usernameToDelete });
    response.send(`User ${usernameToDelete} deleted`);
  } else {
    response
      .status(404)
      .send('Usename does not exist. Please choose another one.');
  }
});

app.patch('/api/client/update', async (request, response) => {
  const userProfile = request.body;
  const newPassword = userProfile.newPassword;
  const existingUser = await getUserCollection().findOne({
    username: userProfile.username,
  });
  if (existingUser && existingUser.password === userProfile.password) {
    await getUserCollection().updateOne(
      { username: userProfile.username },
      { $set: { password: newPassword } }
    );
    response.send(`Password from ${userProfile.username} updated`);
  } else {
    response
      .status(404)
      .send('Username or / and old password wrong. Try again');
  }
});

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
