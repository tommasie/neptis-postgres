import * as portscanner from 'portscanner';
import * as http from 'http';
import {Server} from './server';

// Check Postgres and Neo4J ports if services are availbale
portscanner.findAPortNotInUse(['5432','7687'], '127.0.0.1')
.then(port => {
    console.log(port);
    let service = port == 5432 ? 'postgres' : 'neo4j';
    console.error(service + " not active");
    process.exit(1);
}).catch(err => {
    // All needed ports are open
    console.info("All ports open");
});

var app = Server.bootstrap().app;
app.set("port", 3200);
var httpServer = http.createServer(app);


// listen on provided ports
httpServer.listen(app.get("port"), 'localhost');
