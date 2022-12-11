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
const PurchesdStockCollection = client
  .db("stockManegment")
  .collection("purchesdStocks");
const BorrowedStockCollection = client
  .db("stockManegment")
  .collection("borrowedStocks");
const ReturnedStockCollection = client
  .db("stockManegment")
  .collection("returnedStocks");
const SoldStockCollection = client
  .db("stockManegment")
  .collection("soldStocks");

const ReturnStockCollection = client
  .db("stockManegment")
  .collection("returnStocks");

const LendStockCollection = client
  .db("stockManegment")
  .collection("lendStocks");

const userCollection = client.db("stockManegment").collection("users");

const productCollection = client
  .db("stockManegment")
  .collection("allAddedProducts");

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

// user route =================================
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
// user route =================================

// purchesdStock route =================================
// CREATE purchesdStock
app.post("/purchesdStock", async (req, res) => {
  const purchesdStock = req.body;
  const result = await PurchesdStockCollection.insertOne(purchesdStock);
  res.send(result);
});

// GET purchesdStock
app.get("/purchesdStock", async (req, res) => {
  const query = {};
  const result = await PurchesdStockCollection.find(query).toArray();
  res.send(result);
});

// purchesdStock route =================================

// borrowedStock route =================================
// CREATE borrowedStock
app.post("/borrowedStock", async (req, res) => {
  const borrowedStock = req.body;
  const result = await BorrowedStockCollection.insertOne(borrowedStock);
  res.send(result);
});

// GET borrowedStock
app.get("/borrowedStock", async (req, res) => {
  const query = {};
  const result = await BorrowedStockCollection.find(query).toArray();
  res.send(result);
});

// borrowedStock route =================================

// returnedStock route =================================

// CREATE returnedStock
app.post("/returnedStock", async (req, res) => {
  const returnedStock = req.body;
  const result = await ReturnedStockCollection.insertOne(returnedStock);
  res.send(result);
});

// GET returnedStock
app.get("/returnedStock", async (req, res) => {
  const query = {};
  const result = await ReturnedStockCollection.find(query).toArray();
  res.send(result);
});

// returnedStock route =================================

// aggregate route =================================

// aggregate 3 collection in one

app.get("/allProduct", async (req, res) => {
  const query = {};
  const purchesdStocks = await PurchesdStockCollection.find(query).toArray();
  const borrowedStocks = await BorrowedStockCollection.find(query).toArray();
  const returnedStocks = await ReturnedStockCollection.find(query).toArray();
  const result = [{ purchesdStocks, borrowedStocks, returnedStocks }];

  res.send(result);
});

// app.get("/aggregate", async (req, res) => {
//   const query = {};
//   const result = await PurchesdStockCollection.aggregate([
//     {
//       $lookup: {
//         from: "purchesdStocks",
//         localField: "purchesdStockId",
//         foreignField: "_id",
//         as: "purchesdStock",
//       },
//     },
//     {
//       $lookup: {
//         from: "borrowedStocks",
//         localField: "borrowedStockId",
//         foreignField: "_id",
//         as: "borrowedStock",
//       },
//     },
//     {
//       $lookup: {
//         from: "returnedStocks",
//         localField: "returnedStockId",
//         foreignField: "_id",
//         as: "returnedStock",
//       },
//     },
//   ]).toArray();
//   res.send(result);
// });

// aggregate route =================================

// Sold Stock route =================================

// CREATE Sold Stock
app.post("/soldStock", async (req, res) => {
  const soldStock = req.body;
  const result = await SoldStockCollection.insertOne(soldStock);
  res.send(result);
});

// GET Sold Stock
app.get("/soldStock", async (req, res) => {
  const query = {};
  const result = await SoldStockCollection.find(query).sort({ _id: -1 });
  res.send(result);
});

// Sold Stock route =================================

// Return Stock route =================================

// CREATE Return Stock`
app.post("/returnStock", async (req, res) => {
  const returnStock = req.body;
  const result = await ReturnStockCollection.insertOne(returnStock);
  res.send(result);
});

// GET Return Stock

app.get("/returnStock", async (req, res) => {
  const query = {};
  const result = await ReturnStockCollection.find(query).sort({ _id: -1 });
  res.send(result);
});

// Return Stock route =================================

// Lend Stock route =================================

// CREATE Lend Stock
app.post("/lendStock", async (req, res) => {
  const lendStock = req.body;
  const result = await LendStockCollection.insertOne(lendStock);
  res.send(result);
});

// GET Lend Stock

app.get("/lendStock", async (req, res) => {
  const query = {};
  const result = await LendStockCollection.find(query).sort({ _id: -1 });
  res.send(result);
});

// Lend Stock route =================================

// ========================== Route ============================

app.listen(port, () => {
  console.log(`Stock manegment is runnig http://localhost:${port}`);
});
