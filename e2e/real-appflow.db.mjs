import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRepoRoot = path.resolve(__dirname, "..", "..", "TOM-APIREST");
const apiRequire = createRequire(path.join(apiRepoRoot, "package.json"));

apiRequire("dotenv").config({ path: path.join(apiRepoRoot, ".env") });

const { MongoClient, ObjectId } = apiRequire("mongodb");
const bcrypt = apiRequire("bcryptjs");

const client = new MongoClient(process.env.MONGODB_URI, { keepAlive: true });
const db = client.db("TOM");

const users = db.collection("Users");
const userProfiles = db.collection("usersProfile");
const routines = db.collection("Routine");
const announcements = db.collection("Announcements");
const blocks = db.collection("Blocks");
const finance = db.collection("Finance");
const refreshTokens = db.collection("RefreshTokens");

function nowDateParts(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return {
    fecha: `${dd}/${mm}/${yyyy}`,
    hora: `${hh}:${min}:${ss}`,
  };
}

function asObjectId(value) {
  if (!value) return null;
  if (value instanceof ObjectId) return value;
  return ObjectId.isValid(String(value)) ? new ObjectId(String(value)) : null;
}

function uniqIds(values = []) {
  const seen = new Set();
  return values.filter((value) => {
    const key = String(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function connectRealAppFlowDb() {
  await client.connect();
  return db;
}

export async function closeRealAppFlowDb() {
  try {
    await client.close();
  } catch {
    // noop
  }
}

export async function seedCoachForRealAppFlow({
  email,
  password,
  name = "Coach E2E",
} = {}) {
  if (!email || !password) {
    throw new Error("seedCoachForRealAppFlow requiere email y password");
  }

  await connectRealAppFlowDb();

  await users.deleteMany({ email });

  const hash = await bcrypt.hash(password, 10);
  const doc = {
    name,
    email,
    password: hash,
    role: "admin",
    logo: "https://example.com/e2e-logo.png",
    plan: "Personalizado",
    isPlanPaid: true,
    color: "#041324",
    textColor: false,
    created_at: nowDateParts(),
  };

  const result = await users.insertOne(doc);

  return {
    coachId: result.insertedId.toString(),
    coachEmail: email,
    coachPassword: password,
    coachName: name,
  };
}

export async function findUserByEmail(email) {
  await connectRealAppFlowDb();
  return users.findOne({ email });
}

export async function getUserById(userId) {
  await connectRealAppFlowDb();
  const _id = asObjectId(userId);
  if (!_id) return null;
  return users.findOne({ _id });
}

export async function getUserProfileByUserId(userId) {
  await connectRealAppFlowDb();
  const _id = asObjectId(userId);
  if (!_id) return null;
  return userProfiles.findOne({ user_id: _id });
}

export async function getAnnouncementsByCreatorId(creatorId) {
  await connectRealAppFlowDb();
  const _id = asObjectId(creatorId);
  if (!_id) return [];
  return announcements.find({ creator_id: _id }).sort({ created_at: -1 }).toArray();
}

export async function getRoutinesByUserId(userId) {
  await connectRealAppFlowDb();
  const _id = asObjectId(userId);
  if (!_id) return [];
  return routines.find({ user_id: _id }).sort({ created_at: -1 }).toArray();
}

export async function getRoutineById(weekId) {
  await connectRealAppFlowDb();
  const _id = asObjectId(weekId);
  if (!_id) return null;
  return routines.findOne({ _id });
}

export async function cleanupRealAppFlowData({
  coachId,
  coachEmail,
  athleteEmails = [],
} = {}) {
  await connectRealAppFlowDb();

  const coachObjectId = asObjectId(coachId);

  const userDocs = await users
    .find({
      $or: [
        ...(coachObjectId ? [{ _id: coachObjectId }] : []),
        ...(coachObjectId ? [{ entrenador_id: coachObjectId }] : []),
        ...(coachEmail ? [{ email: coachEmail }] : []),
        ...(athleteEmails.length ? [{ email: { $in: athleteEmails } }] : []),
      ],
    })
    .project({ _id: 1 })
    .toArray();

  const userIds = uniqIds(userDocs.map((doc) => doc._id).filter(Boolean));

  if (coachObjectId) {
    await announcements.deleteMany({ creator_id: coachObjectId });
    await blocks.deleteMany({ user_id: coachObjectId });
    await finance.deleteMany({ owner_id: coachObjectId });
  }

  if (userIds.length) {
    await routines.deleteMany({ user_id: { $in: userIds } });
    await userProfiles.deleteMany({ user_id: { $in: userIds } });
    await refreshTokens.deleteMany({
      $or: [
        { user_id: { $in: userIds } },
        { user_id: { $in: userIds.map((id) => String(id)) } },
      ],
    });
    await finance.deleteMany({
      $or: [
        { owner_id: { $in: userIds } },
        { owner_id: { $in: userIds.map((id) => String(id)) } },
      ],
    });
    await users.deleteMany({ _id: { $in: userIds } });
  }

  if (coachEmail || athleteEmails.length) {
    await users.deleteMany({
      email: { $in: [coachEmail, ...athleteEmails].filter(Boolean) },
    });
  }
}
