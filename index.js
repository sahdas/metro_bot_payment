const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
require('dotenv').config()
const { MongoClient } = require("mongodb");
const { Server } = require("socket.io");
const io = new Server(server);
const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
const port = process.env.PORT || '4000'
async function run() {
    try {
      await client.connect();
      const database = client.db('Metro');
      const messages = database.collection('payments');
           // open a Change Stream on the "messages" collection
           changeStream = messages.watch();
           // set up a listener when change events are emitted
           changeStream.on("change", next => {
               // process any change event
               switch (next.operationType) {
                   case 'insert':
                    //let data = `{transactionId: ${next.fullDocument.transactionId}+${next.fullDocument.phoneNumber}`
                    let data= {}
                    data.transactionId = next.fullDocument.transactionId
                    data.phoneNumber = next.fullDocument.phoneNumber
                       io.emit("payment", JSON.stringify(data));
                       console.log(next.fullDocument.transactionId,next.fullDocument.phoneNumber)
                       break;
               }
           });
  
    } catch {
      // Ensures that the client will close when you error
      await client.close();
    }
  }
  
  run().catch(console.dir);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
   });

server.listen(port, () => {
 console.log(`listening on Port ${port}`);
});