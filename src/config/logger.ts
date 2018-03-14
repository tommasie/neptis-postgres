import * as moment from 'moment';
import * as winston from 'winston';

const ts = () => {
    return moment().format('DD/MM/YYYY HH:mm:ss');
};

const logger = new winston.Logger({
    exceptionHandlers: [
        new (winston.transports.Console)(
            {
                colorize: true,
                json: false,
                timestamp: ts,
            }),
        /*new winston.transports.File({
            filename: './logs/exception.log',
            json: false,
            timestamp: ts,
        }),*/
    ],
    exitOnError: false,
    transports: [
        new (winston.transports.Console)(
            {
                colorize: true,
                json: false,
                level: 'debug',
                timestamp: ts,
            }),
        /*new winston.transports.File(
            {
                filename: './logs/debug.log',
                json: false,
                maxFiles: 5,
                maxsize: 5242880, // 5MB
                timestamp: ts,
            }),*/
    ],
});

export { logger };
