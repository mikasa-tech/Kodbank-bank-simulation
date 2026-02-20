const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runTest() {
    console.log('--- Starting API & Database Verification ---');

    const testUser = {
        uid: 'TEST' + Date.now(),
        uname: 'tester' + Date.now(),
        password: 'password123',
        email: 'test' + Date.now() + '@example.com',
        phone: '1234567890'
    };

    try {
        // 1. Test Registration
        console.log(`1. Registering user: ${testUser.uname}...`);
        const regRes = await axios.post(`${API_URL}/register`, testUser);
        console.log('   Registration Success:', regRes.data.message);

        // 2. Test Login
        console.log('2. Logging in...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            uname: testUser.uname,
            password: testUser.password
        });
        console.log('   Login Success:', loginRes.data.status);
        const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0] : null;

        // 3. Verify Database Storage (koduser)
        console.log('3. Verifying storage in "koduser" table...');
        const userDb = await pool.query('SELECT * FROM koduser WHERE uname = $1', [testUser.uname]);
        if (userDb.rows.length > 0) {
            console.log('   Found user in DB:', userDb.rows[0].uname);
            console.log('   Initial Balance:', userDb.rows[0].balance);
        } else {
            throw new Error('User not found in database!');
        }

        // 4. Verify Database Storage (UserToken)
        console.log('4. Verifying storage in "UserToken" table...');
        const tokenDb = await pool.query('SELECT * FROM UserToken WHERE username = $1', [testUser.uname]);
        if (tokenDb.rows.length > 0) {
            console.log('   Found token in DB for user.');
        } else {
            throw new Error('Token not found in database!');
        }

        // 5. Test Balance Fetching with JWT
        console.log('5. Fetching balance via API with JWT...');
        const balRes = await axios.get(`${API_URL}/balance`, {
            headers: { Cookie: cookie }
        });
        console.log('   Balance API Response:', balRes.data);

        console.log('\n--- VERIFICATION SUCCESSFUL ---');
        console.log('The application is correctly storing data and the API is fully functional.');

    } catch (err) {
        console.error('\n--- VERIFICATION FAILED ---');
        if (err.response) {
            console.error('API Error:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    } finally {
        await pool.end();
    }
}

runTest();
