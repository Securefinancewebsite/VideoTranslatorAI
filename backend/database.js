const { Pool } = require("pg");

// Function to connect to the database and insert data
async function connectAndInsertData(data) {
  // Create a new Pool instance with your database connection details
  const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "Haseeb123@",
    port: 5432, // Default PostgreSQL port
  });

  try {
    // Test the connection
    await pool.query("SELECT NOW()");

    // Define your insert query
    const insertQuery = `
      INSERT INTO postgres_status (message, timestamp, filename, video_url, video_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;`;

    // Execute the query
    const res = await pool.query(insertQuery, [
      data.message,
      data.timestamp,
      data.filename,
      data.videoUrl,
      data.videoName,
    ]);

    // Log the ID of the inserted row
    console.log("Inserted row with id:", res.rows[0].id);
  } catch (error) {
    // Handle errors
    console.error(
      "Error connecting to the database or executing query:",
      error
    );
    throw error; // Re-throw the error to propagate it
  } finally {
    // Close the connection pool when done
    await pool.end();
  }
}
// Call the function with the example data
module.exports = { connectAndInsertData };
