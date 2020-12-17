const path = require('path')
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH =  path.join(__dirname , "/protobuf/health-check.proto")


const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const healthCheck = grpc.loadPackageDefinition(packageDefinition).health_check;

async function check(hostService) {
  const client = new healthCheck.Health(
    hostService,
    grpc.credentials.createInsecure()
  );
  return await new Promise((resolve,reject)=>{
    client.check({service:"check"},function(err, response) {
      if(err) reject(err)
      resolve(response)
    });
  })
}
module.exports.check = check
Them code