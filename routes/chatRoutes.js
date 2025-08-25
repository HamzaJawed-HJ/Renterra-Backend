import express from 'express';
const router = express.Router();
import Conversation from "../models/conversationModel.js";
import User from "../models/User.js";
import Owner from "../models/owner.js";
import Message from "../models/messageModel.js";
import authMiddleware from '../middleware/authMiddleware.js'; // Use your existing auth middleware


router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({ participants: userId }).sort({ updatedAt: -1 });

    const result = await Promise.all(conversations.map(async (conv) => {
      const otherId = conv.renterId.equals(userId) ? conv.userId : conv.renterId;

      // Try both models to find the user
      let otherUser = await User.findById(otherId).select("fullName profilePicture");
      if (!otherUser) {
        otherUser = await Owner.findById(otherId).select("fullName profilePicture");
      }

      // Skip this conversation if user not found
      if (!otherUser) {
        console.warn(`User not found for ID: ${otherId}`);
        return null;
      }

      return {
        id: conv.id,
        lastMessage: conv.lastMessage,
        lastUpdated: conv.updatedAt,
        participant: {
          id: otherUser.id,
          fullName: otherUser.fullName,
          profilePicture: otherUser.profilePicture,
        }
      };
    }));

    // Filter out any null results from skipped conversations
    res.status(200).json(result.filter(item => item !== null));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});



// router.get('/conversations', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.userId;

//     const conversations = await Conversation.find({ participants: userId })
//       .sort({ updatedAt: -1 });

//     const result = await Promise.all(conversations.map(async (conv) => {
//       const otherId = conv.renterId.equals(userId) ? conv.userId : conv.renterId;
//       const model = conv.renterId.equals(userId) ? Owner : User;

//       console.log(conv.id);
//       const otherUser = await model.findById(otherId).select("fullName profilePicture");

//       return {
//         id: conv.id,
//         lastMessage: conv.lastMessage,
//         lastUpdated: conv.updatedAt,
//         participant: {
//           id: otherUser.id,
//           fullName: otherUser.fullName,
//           profilePicture: otherUser.profilePicture,
//         }
//       };
//     }));

//     res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch conversations" });
//   }
// });



router.post('/conversation', authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.userId;

    const existing = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] }
    });

    if (existing) return res.status(200).json(existing);

    const isRenter = req.renterId !== undefined;

    const newConv = new Conversation({
      renterId: isRenter ? currentUserId : otherUserId,
      userId: isRenter ? otherUserId : currentUserId,
      participants: [currentUserId, otherUserId],
    });

    await newConv.save();

    res.status(201).json(newConv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Conversation creation failed" });
  }
});




router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    const newMsg = new Message({
      conversationId,
      senderId: req.userId,
      message,
    });

    await newMsg.save();

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      lastUpdated: new Date()
    });

    res.status(201).json(newMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
});


// router.get('/messages/:conversationId', authMiddleware, async (req, res) => {
//   try {
//     const messages = await Message.find({ conversationId: req.params.conversationId })
//       .sort({ createdAt: 1 });

//     // res.status(200).json(messages);

//     res.status(200).json({
//       userId: req.userId,     // 👈 this adds the current user's ID
//       messages                // 👈 array of messages
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to load messages" });
//   }
// });


router.get("/messages/:conversationId", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // 1. Fetch messages
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    // 2. Mark all messages from OTHER users as seen
    await Message.updateMany(
      { conversationId, senderId: { $ne: req.userId }, seen: false },
      { $set: { seen: true } }
    );

    // 3. Return response (same structure as before ✅)
    res.status(200).json({
      userId: req.userId,
      messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Failed to load messages" });
  }
});



export default router; 