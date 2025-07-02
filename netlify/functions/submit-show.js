import { Client } from 'pg';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const data = JSON.parse(event.body);

    const {
      showdate,
      showplace,
      showperson,
      showsite,
      showprice,
    } = data;

    if (!showdate || !showplace || !showperson || !showsite || !showprice) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const client = new Client({
      connectionString: process.env.NEON_CONNECTION_STRING, // or NETLIFY_DATABASE_URL
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    const query = `
      INSERT INTO shows (showdate, showplace, showperson, showsite, showprice)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const values = [showdate, showplace, showperson, showsite, showprice];

    const res = await client.query(query, values);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Show inserted', id: res.rows[0].id }),
    };
  } catch (error) {
    console.error('Database insertion error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to insert show', details: error.message }),
    };
  }
}
