import config from "config";
import express from "express";
import { getServerUrlHandler, getTokenHandler } from "./handlers";
import cors from "cors";

const app = express();
app.use(cors())
const port = config.get("express.port");

app.get("/getToken", getTokenHandler);
app.get("/getServerUrl", getServerUrlHandler )

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
