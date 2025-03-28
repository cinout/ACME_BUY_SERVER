import { getAlbumCover } from "./utils/imageSamples";
import config from "./utils/config";
import app from "./app";
import logger from "./utils/logger";

// getAlbumCover(2500);

// TODO:[2] use logger for all the console.XXX()

// Listening
const port = config.SERVER_PORT; // TODO:[1] set up the env when deployed to services
app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});
