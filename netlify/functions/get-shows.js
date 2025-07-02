import { Client } from 'pg';

export async function handler() {
  try {
    const client = new Client({
      connectionString: process.env.NEON_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    const res = await client.query(`
      SELECT showperson, showdate, showplace, showsite, showprice
      FROM shows
      ORDER BY showdate ASC, id ASC
      LIMIT 10
    `);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(res.rows),
    };
  } catch (error) {
    console.error('Error fetching shows:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch shows', details: error.message }),
    };
  }
}
