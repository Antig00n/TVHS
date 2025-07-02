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
      showsite = null,
      showprice = null,
    } = data;

    if (!showdate || !showplace || !showperson) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const client = new Client({
      connectionString: process.env.NEON_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    // Check count of shows
    const countRes = await client.query('SELECT COUNT(*) FROM shows');
    const count = parseInt(countRes.rows[0].count, 10);

    // If 10 or more, delete oldest show
    if (count >= 10) {
      // Delete show with oldest showdate, tie-break with lowest id
      await client.query(`
        DELETE FROM shows
        WHERE id = (
          SELECT id FROM shows
          ORDER BY showdate ASC, id ASC
          LIMIT 1
        )
      `);
    }

    // Insert new show
    const insertQuery = `
      INSERT INTO shows (showdate, showplace, showperson, showsite, showprice)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const insertValues = [showdate, showplace, showperson, showsite, showprice];

    const insertRes = await client.query(insertQuery, insertValues);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Show inserted', id: insertRes.rows[0].id }),
    };
  } catch (error) {
    console.error('Error inserting show:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to insert show', details: error.message }),
    };
  }
}
