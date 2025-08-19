import { Pool } from "pg";

const pool = new Pool({
  user: "spaDurban",
  host: "bookingspadurban.c74gucmo6jpm.af-south-1.rds.amazonaws.com",
  database: "postmate",
  password: "SpaDurban4824!!",
  port: 5432,
   ssl: {
    rejectUnauthorized: false, // agar self-signed certificate hai
  },
});

export default pool;
