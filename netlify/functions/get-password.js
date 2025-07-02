import { Client } from 'pg';

export async function handler(event, context) {
  const client = new Client({
    connectionString: process.env.NEON_CONNECTION_STRING, // or NETLIFY_DATABASE_URL
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const res = await client.query('SELECT showplace FROM shows WHERE id = $1', [13]);

    if (res.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Password not found' }),
      };
    }

    const password = res.rows[0].showplace;

    return {
      statusCode: 200,
      body: JSON.stringify({ password }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.end();
  }
}
