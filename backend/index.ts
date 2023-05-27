import config from "config";
import express from "express";
import { getServerUrlHandler, getTokenHandler } from "./handlers";

const app = express();
const port = config.get("express.port");

app.get("/getToken", getTokenHandler);
app.get("/getServerUrl", getServerUrlHandler )

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
