import express from "express";

const port: number = parseInt(process.env.PORT!, 10) || 3000;
const app = express();

app.listen(port, () => {
  console.log("the application is listening on port 3000");
});
