require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./connectDB");
const Product = require('./models/Products');
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 8000;

connectDB();
app.use(cors());
app.use(express.urlencoded( { extended: true } ));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json("Welcome to PJ_Capstone");
});

app.get("/api/products", async (req, res) => {
  try {
    const category = req.query.category;

    const filter = {};
    if(category) {
      filter.category = category;
    }

    const data = await Product.find(filter);
    
    if (!data) {
      throw new Error("An error occurred while fetching products.");
    }
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching books." });
  }
});

app.get("/api/products/:slug", async (req, res) => {
  try {
    const slugParam = req.params.slug;
    const data = await Product.findOne({ slug: slugParam});

    if (!data) {
      throw new Error("An error occurred while fetching a product.");
    }
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching books." });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
})

const upload = multer({ storage: storage })

//Create a Product using the post request method
app.post("/api/products", upload.single("thumbnail")  ,async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const newProduct = new Product({
      title: req.body.title,
      slug: req.body.slug,
      stars: req.body.stars,
      description: req.body.description,
      category: req.body.category,
      thumbnail: req.file.filename,
    })

    await Product.create(newProduct);
    res.json("Data Submitted");
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching books." });
  }
});



app.get("*", (req, res) => {
  res.sendStatus("404");
});

app.listen(PORT, ()=> {
  console.log(`Server is running on Port: ${PORT}`);
});
