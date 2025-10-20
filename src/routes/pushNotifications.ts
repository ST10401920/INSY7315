import { Router, Request, Response } from "express";
import admin from "../middleware/firebaseAdmin";
import { SendMessageDto } from "../middleware/types";

const router = Router();

// Send notification to a single device
router.post("/send", async (req: Request, res: Response) => {
  const { to, notification } = req.body as SendMessageDto;

  if (!to || !notification) {
    return res.status(400).json({ message: "Missing token or notification" });
  }

  try {
    const message = { token: to, notification };
    const response = await admin.messaging().send(message);
    res.status(200).json({ message: "Notification sent", response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending notification", error });
  }
});


// Broadcast to multiple tokens provided in the request (no DB)
router.post("/broadcast", async (req: Request, res: Response) => {
  const { tokens, notification } = req.body as { tokens: string[]; notification: any };

  if (!notification || !tokens || tokens.length === 0) {
    return res.status(400).json({ message: "Missing tokens or notification" });
  }

  try {
    const messages = tokens.map((token) => ({
      token,
      notification,
    }));

    const responses = await Promise.all(messages.map((msg) => admin.messaging().send(msg)));

    res.status(200).json({ message: "Broadcast sent", responses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error broadcasting", error });
  }
});

export default router;



























// import { Router, Request, Response } from "express";
// import admin from "../middleware/firebaseAdmin";
// import { SendMessageDto } from "../middleware/types";

// const router = Router();

// router.post("/send", async (req: Request, res: Response) => {
//   const body: SendMessageDto = req.body;

//   if (!body.to || !body.notification) {
//     return res.status(400).json({ message: "Missing token or notification" });
//   }

//   try {
//     const message = {
//       token: body.to,
//       notification: {
//         title: body.notification.title,
//         body: body.notification.body,
//       },
//     };

//     const response = await admin.messaging().send(message);
//     res.status(200).json({ message: "Notification sent", response });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error sending notification", error });
//   }
// });

// router.post("/broadcast", async (req: Request, res: Response) => {
//   const body: SendMessageDto = req.body;

//   if (!body.notification) {
//     return res.status(400).json({ message: "Missing notification" });
//   }

//   try {
//     // Replace with actual tokens from DB
//     const registrationTokens: string[] = [
//       "your_test_fcm_token_here"
//     ];

//     if (registrationTokens.length === 0) {
//       return res.status(400).json({ message: "No device tokens to broadcast" });
//     }

//     // Create an individual message per token and send them as a batch using sendAll
//     const messages = registrationTokens.map((token) => ({
//       token,
//       notification: {
//         title: body.notification.title,
//         body: body.notification.body,
//       },
//     }));

//   // Send each message individually and collect results
//   const sendPromises = messages.map((m) => admin.messaging().send(m));
//   const responses = await Promise.all(sendPromises);

//   res.status(200).json({ message: "Broadcast sent", responses });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error broadcasting", error });
//   }
// });


// export default router;
