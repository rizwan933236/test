const express = require('express');
const connectDB = require('./db/db.connection');
const User = require('./db/user.schema');

const app = express();
const PORT = 3000;

connectDB();

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/users', async (req, res) => {
  try {
    const users = await db.users.aggregate([
      {
        $match: {
          "mail": /@example\.org$/,
          "unsuccessfulAttempts": { $gte: 1 }
        }
      },
      {
        $unwind: "$activeSessions"
      },
      {
        $match: {
          "activeSessions.duration": { $gte: 8 }
        }
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          role: { $first: "$role" },
          lastLogin: { $last: "$lastLogin.coord" },
          unsuccessfulAttempts: { $first: "$unsuccessfulAttempts" },
          activeSessions: { $push: "$activeSessions" },
          activeSessionCount: { $sum: 1 }
        }
      },
      {
        $match: {
          activeSessionCount: { $gte: 2 }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          role: 1,
          lastLogin: 1,
          unsuccessfulAttempts: 1,
          activeSessions: {
            $filter: {
              input: "$activeSessions",
              as: "session",
              cond: { $gte: ["$$session.duration", 8] }
            }
          }
        }
      }
    ])
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
