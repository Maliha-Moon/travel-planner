const sql = require('mssql');

// Configuration object for your SQL Server
const config = {
    user: 'sa', // Your SQL Server username
    password: 'moonmaliha12', // Your SQL Server password
    server: 'DESKTOP-32UIRU3', // Your computer name
    database: 'TRAVEL_SPHERE', // Your database name
    options: {
        encrypt: false, // Set to false if you are not using SSL
        trustServerCertificate: true // For self-signed certificates
    },
    port: 1433 // Use the port SQL Server is listening on (default: 1433)
};

async function connectToDB() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

module.exports = { connectToDB };

// Example usage of the connection
connectToDB()
    .then(pool => {
        console.log('Successfully connected!');
        
        // Example query execution
        pool.request() // Create a request object to interact with the DB
            .query('SELECT * FROM your_table_name')  // Replace with an actual query
            .then(result => {
                console.log('Query result:', result);
            })
            .catch(err => {
                console.error('Query error:', err);
            });
    })
    .catch(err => {
        console.error('Error connecting to SQL Server:', err);
    });
