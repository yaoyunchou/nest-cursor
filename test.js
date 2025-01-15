
const mysql = require('mysql2/promise');

async function connectToMySQL() {
    try {
        const connection = await mysql.createConnection({
            host: '43.139.202.180',
            port: 3306,
            user: 'ubuntu',
            password: 'yao625625',
            database: 'cursor',
            authPlugin: 'mysql_native_password'
        });
        console.log('Connected to MySQL server successfully.');
        connection.end();
    } catch (err) {
        console.error('Error connecting to MySQL server:', err);
    }
}

connectToMySQL();