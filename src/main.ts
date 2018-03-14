import * as http from 'http';
import * as portscanner from 'portscanner';
import {logger} from './config/logger';
import {Server} from './server';

// Check Postgres and Neo4J ports if services are availbale
portscanner.findAPortNotInUse(['5432', '7687'], '127.0.0.1')
.then(port => {
    logger.info(port);
    const service = port === 5432 ? 'postgres' : 'neo4j';
    logger.error(service + ' not active');
    process.exit(1);
}).catch(err => {
    // All needed ports are open
    logger.info('All ports open');
});

const app = Server.bootstrap().app;
app.set('port', 3200);
const httpServer = http.createServer(app);

// listen on provided ports
httpServer.listen(app.get('port'), 'localhost');
