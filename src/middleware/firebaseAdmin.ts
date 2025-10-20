import * as admin from "firebase-admin";
import serviceAccountJson from "../config/serviceAccountKey.json";
import { ServiceAccount } from "firebase-admin";

const serviceAccount = serviceAccountJson as ServiceAccount;

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
