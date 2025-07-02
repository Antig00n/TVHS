const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }
  const { showdate, showplace, showperson, showsite, showprice } = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.NEON_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO shows (showdate, showplace, showperson, showsite, showprice)
      VALUES ($1, $2, $3, $4, $5)
    `;




    await client.query(query, [showdate, showplace, showperson, showsite, showprice]);
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Show added successfully' }),
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to insert show' }),
    };
  }
};
