import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import routes from "./routes.js";
// import cron from "node-cron";

const app = express();
const PORT = 3212;
mongoose.set("strictQuery", false);
mongoose.Promise = global.Promise;

let oldDBData = [];

mongoose
    .connect("mongodb://127.0.0.1:27017/", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(async () => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB:", err);
    });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

routes(app);

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
