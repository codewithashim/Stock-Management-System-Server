const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = 8000;
app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");
const { json } = require("express");

app.get("/", (req, res) => {
  res.send("Stock Manegement System");
});

// ========================== DB Connection ============================

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@stock-manegment.wpszwhx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function dbConnection() {
  try {
    await client.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
}
dbConnection();

// ========================== DB Connection ============================
const ProductCollection = client.db("stockManegment").collection("products");
const userCollection = client.db("stockManegment").collection("users");

// ========================== DB Collection ============================

// ========================== jwt token ============================

app.get("/jwt", async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const user = await userCollection.find(query);

  if (user) {
    const token = jwt.sign({ email }, process.env.SECRIET_JWT_TOKEN, {
      expiresIn: "24h",
    });
    return res.status(200).send({ accesToken: token });
  } else {
    res.status(401).send({ accesToken: "No token found" });
  }
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRIET_JWT_TOKEN, function (err, decoded) {
    console.log(err);
    if (err) {
      return res.status(403).send({ message: "forbidden access hey this " });
    }
    req.decoded = decoded;
    next();
  });
}

const verifyAdmin = async (req, res, next) => {
  const decoded = req.decoded.email;
  // const query = { email: decoded };
  const users = await userCollection.findOne({ email: decoded });
  console.log(users);

  if (users?.role !== "admin") {
    return res.status(401).send({
      success: false,
      message: "Unauthorized access",
    });
  }
  next();
};

// ========================== jwt token ============================
// ========================== Route ============================

// user route
// CREATE USER
app.post("/users", async (req, res) => {
  const user = req.body;
  const result = await userCollection.insertOne(user);
  res.send(result);
});

// GET USER
app.get("/users", async (req, res) => {
  const query = {};
  const result = await userCollection.find(query).toArray();
  res.send(result);
});

// GET USER BY email
app.get("/users/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const result = await userCollection.findOne(query);
  res.send(result);
});

// user route

// ========================== Route ============================

app.listen(port, () => {
  console.log(`Stock manegment is runnig http://localhost:${port}`);
});
