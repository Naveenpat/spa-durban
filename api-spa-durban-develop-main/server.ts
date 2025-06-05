import config from "./config/config"
import * as clustering from "./middleware/clustering"

if (config.env === "production") {
  clustering.serverStartWithCluster()
} else {
  clustering.startServer()
}
