import { pool } from "../database/connection.js"
import { v4 as uuidv4 } from 'uuid'; export const userActions = {
    createUser: async (name, email) => {
        //i was trying to check the uniquenes of email: but here is the issue: The "Race Condition" Problem: In high-traffic apps, two people might check the email at the exact same millisecond, both see count: 0, and both try to register. Only the database constraint can truly stop the second person.
        //Since your users table already has UNIQUE on the email column, the database will not let a duplicate enter anyway. Instead of running two queries (one to check, one to insert), you can just try to insert and catch the specific error if it fails.
        try {
            const [rows] = await pool.execute(
                `INSERT INTO users (name, email) VALUES(?, ?)`,
                [name, email]
            );
            if (rows && rows.affectedRows > 0) {
                return rows;
            }
            throw new Error('No record was created');
        } catch (err) {
            console.error("Database Error Detail:", err.message);
            // 1062 for duplicates
            if (err.errno === 1062) {
                throw new Error('Provided email already in use');
            }
            // handling other DB error 
            throw err;
        }
    },
    createEvent: async (title, description, date, total_capacity) => {
        // remaining_tickets should start equal to total_capacity
        const remaining_tickets = total_capacity;
        try {
            const [rows] = await pool.execute(
                `INSERT INTO events (title, description, date, total_capacity, remaining_tickets) VALUES(?, ?, ?, ?, ?)`,[title, description, date, total_capacity, remaining_tickets]);
            if (rows.affectedRows > 0) {
                return rows;
            }
            return null;
        } catch (err) {
            console.error("Database Error:", err);
            throw err;
        }
    },
    upcomingEvent: async () => {
        try {
            // CURRENT_TIMESTAMP usage to compare the date
            const [rows] = await pool.execute(`SELECT * FROM events WHERE date >= CURRENT_TIMESTAMP ORDER BY date ASC`);//ASC will get the current upcomings
            return rows;
        } catch (err) {
            console.error('Database error:', err);
            throw err;
        }
    },
    createBooking: async (user_id, event_id, tickets_count) => {
        // the below connection has to be used for the entire trsaction, and not everytime creating the new connection via pool.exec()
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            // locck the partucular from the events table
            const [checkRows] = await connection.execute(`SELECT remaining_tickets FROM events WHERE id = ? FOR UPDATE`,[event_id]);
            if (checkRows.length === 0) {
                throw new Error('No such event exist');
            }
            const remainingTickets = checkRows[0].remaining_tickets;
            if (remainingTickets < tickets_count) {
                throw new Error('Not enough tickets');
            }
            const bookingCode = uuidv4();

            // now booking insertion, finally
            await connection.execute(`INSERT INTO bookings (user_id, event_id, booking_code, tickets_count) VALUES (?, ?, ?, ?)`,[user_id, event_id, bookingCode, tickets_count]);
            // updation of the tickets in the event table
            await connection.execute(`UPDATE events SET remaining_tickets = remaining_tickets - ? WHERE id = ?`,[tickets_count, event_id]);
            await connection.commit();
            return bookingCode; //imprtant as we are returning thr unique cod e 

        } catch (err) {
            await connection.rollback();
            console.error('Database Transaction Error:', err.message);
            throw err; // catching the error in the request
        } finally {
            connection.release();
        }
    },
    userExist: async (userId) => {
//check whether this userId exist in users table?
        try {
            const [rows] = await pool.execute(`SELECT * FROM users WHERE id=?`,[userId]);
            return rows;
        } catch(err) {
            throw err
        }
    },
    mybookings: async (userId) => {
        try {
            // Using INNER JOIN because a booking must have a corresponding event
            const [rows] = await pool.execute(`SELECT  b.id, b.tickets_count, b.booking_code, e.title AS event_name, e.date AS event_date, e.description AS event_description FROM bookings AS b 
             INNER JOIN events AS e ON b.event_id = e.id WHERE b.user_id = ? ORDER BY e.date DESC`, [userId]);// desc recent  bookings
            return rows;
        } catch (err) {
            console.error("Database Error in mybookings:", err);
            throw err;
        }
    },
    ticketsCount: async (code) => {
        try {
            const [rows] = await pool.execute(`SELECT tickets_count FROM bookings WHERE booking_code = ?`,[code]);
            // we are returning null  if the reisnt any bokins 
            if (rows.length === 0) return null;
            // retunr the count 
            return rows[0].tickets_count;
        } catch (err) {
            console.error('Database error in ticketsCount:', err);
            throw err;
        }
    },
    eventdetails: async (eventId) => {
        try {
            const [rows] = await pool.execute(`SELECT * FROM events WHERE id = ?`, [eventId]);
            // since the this eveent id refers to a particular row, we know that the result will be an array of  single object... so return rows[0] or null.
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error("Database Error in eventdetails:", err);
            throw err;
        }
    },
    fetchUsers: async () => {
        try {
            const [rows] = await pool.execute(`SELECT id, name, email FROM users`);
            return rows;
        } catch (err) {
            console.error("Database Error in fetchUsers:", err);
            throw err;
        }
    }
}