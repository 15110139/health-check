require('dotenv').config()
const zookeeper = require("node-zookeeper-client");
const {
  setIntervalAsync,
  clearIntervalAsync
} = require("set-interval-async/dynamic");

const { check } = require("./check-health");
const client = zookeeper.createClient(process.env.ZOOKEEPER_HOST||"localhost:2181");
var path = "/listService/orderService";
let checkServiceInter = null;

async function listChildren(client, path) {
  client.getChildren(
    path,
    async function(event) {
      console.log("Got watcher event: %s", event);
      await listChildren(client, path);
    },
    async function(error, children, stat) {
      if (error) {
        console.log("Failed to list children of %s due to: %s.", path, error);
        return;
      }
      if (checkServiceInter) {
        clearIntervalAsync(checkServiceInter);
        checkServiceInter = null;
      }
      checkServiceInter = setIntervalAsync(async () => {
        await healthCheckListService(children);
        console.log("End check list service");
      }, 10000);
    }
  );
}

async function healthCheckListService(listService) {
    listService.forEach(async element => {
    try {
      await check(element);
      await setDataService(element, "SERVING");
    } catch (error) {
        console.log(error)
      await setDataService(element, "NO_SERVING");
    }
  },5000);
}

client.once("connected", async function() {
  console.log("Connected to ZooKeeper.");
  await listChildren(client, path);
});

client.connect();

function setDataService(hostService, status) {
  const data = new Buffer(JSON.stringify({ status: status }), "utf8");
  client.setData(`/listService/orderService/${hostService}`, data, -1, function(
    error,
    stat
  ) {
    if (error) {
      console.log(error.stack);
      return;
    }
    console.log("Data is set.", hostService , ":" ,status);
  });
  return;
}
