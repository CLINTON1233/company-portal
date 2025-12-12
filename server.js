import https from "https";
import fs from "fs";
import next from "next";

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpsOptions = {
    key: fs.readFileSync("./ssl/localhost.key"),
    cert: fs.readFileSync("./ssl/localhost.crt"),
  };

  https.createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(3003, () => {
    console.log("🚀 Next.js running on https://localhost:3003");
  });
});
