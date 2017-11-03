var server = require("./server");
var http = require("http");

var app = server.Server.bootstrap().app;
app.set("port", 3200);
var httpServer = http.createServer(app);

//listen on provided ports
httpServer.listen(3200, 'localhost');
