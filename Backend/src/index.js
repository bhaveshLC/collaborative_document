import server from "./app.js";
import { config } from "./config/config.js";

const port = config.PORT;
server.listen(port, () => {
  console.log(`server started on port ${port}`);
});
