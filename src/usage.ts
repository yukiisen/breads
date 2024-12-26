if (process.argv[2] === "--help" || process.argv[2] === "-h") {
    console.log(`
Usage:
    run [DB username] [hostname]

You can use the current env variables:
    DBPASS (required)    database password
    REDISPASS (required) the redis database password.
    DBHOST               database host (default 127.0.0.1)
    DBPORT               port number of the database (default 3306)
    PORT                 the port number for the HTTPS server (default 443)
    PORT2                the port number for the HTTP server (default 80)

If you face any issues, feel free to contact the creator at:
    instagram: @yukii.sen
    github: @yukiisen
    `)
    process.exit(0);
}