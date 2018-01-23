# logacious

Logger with line numbers that can also send logs to syslog.

Example of the output:

```
[INFO] 2018-01-23 07:38:24.946 lib/migrations.js:25 "Migration successful"
[INFO] 2018-01-23 07:38:24.948 lib/cluster.js:59 "All initialization function successful."
[INFO] 2018-01-23 07:38:24.949 lib/cluster.js:65 "Starting workers" 3
```

## Usage

```
const logger = require('logacious')()

logger.log('foo', new Error(), object)
logger.info('foo', new Error(), object)
logger.warn('foo', new Error(), object)
logger.error('foo', new Error(), object)
```

## Environment variables

- `LOGACIOUS_SYSLOG`: set it to disable console and redirect all logs to syslog.
- `LOGACIOUS_SYSLOG_TAG`: cf. https://github.com/phuesler/ain
- `LOGACIOUS_SYSLOG_FACILITY`: cf. https://github.com/phuesler/ain
- `LOGACIOUS_SYSLOG_HOSTNAME`: cf. https://github.com/phuesler/ain
- `LOGACIOUS_SYSLOG_PORT`: cf. https://github.com/phuesler/ain
