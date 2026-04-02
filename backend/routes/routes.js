import express from "express";
import { userActions } from "../controllers/controllers.js";
const router = express.Router();
router.post('/createUser', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ status: 'failed', error: 'Please enter all the fields' });
    }
    try {
        await userActions.createUser(name, email);
        return res.status(201).json({ status: 'success', message: 'User created successfully' });
    } catch (err) {
        //As I have throw new Error('message'), the err variable becomes an Error Object, not a string.
        if (err.message === 'Provided email already in use') {
            return res.status(409).json({ status: 'failed', error: "Email already in use" });
        }
        // actual error for development purpose
        console.error("Route Error:", err);
        return res.status(500).json({ status: 'failed', error: 'Internal server error' });
    }
})

router.post('/events', async (req, res) => {
    const { title, description, date, total_capacity } = req.body;
    // 1. Validation check
    if (!title || !date || !total_capacity) {
        return res.status(400).json({
            status: 'failed',
            error: 'Missing required fields: title, date, and total_capacity are mandatory.'
        });
    }
    try {
        const response = await userActions.createEvent(title, description, date, total_capacity);
        if (response && response.affectedRows > 0) {
            return res.status(201).json({
                status: 'success',
                message: 'Event created successfully',
                insertID: response.insertId 
            });
        }
        // 3. Fallback if no rows were inserted for some reason
        throw new Error('Database operation failed to insert row.');
    } catch (err) {
        console.error("Route Error:", err);
        return res.status(500).json({
            status: 'failed',
            error: 'Internal server error'
        });
    }
}),
//upcoming events
    router.get('/events', async (req, res) => {
        try {
            const events = await userActions.upcomingEvent();
            // Even if no events are found, it's usually status 200 with an empty array []
            return res.status(200).json({
                status: 'success',
                count: events.length, // count of the upcoming events
                message: events});
        } catch (err) {
            console.error("Router GET Error:", err);
            return res.status(500).json({
                status: 'failed',
                error: 'Internal server error'
            });
        }
    });
router.post('/bookings', async (req, res) => {
    const { user_id, event_id, tickets_count } = req.body;
    if (!user_id || !event_id || !tickets_count) {
        return res.status(400).json({ status: 'failed', error: 'Missing required fields' });
    }
    try {
        // validating user
        const user = await userActions.userExist(user_id);
        if (!user || user.length === 0) {
            return res.status(404).json({ status: 'failed', error: 'User does not exist' });
        }
        if (tickets_count <= 0) {
            return res.status(400).json({ status: 'failed', error: 'Invalid ticket count' });
        }
        const bookingCode = await userActions.createBooking(user_id, event_id, tickets_count);
        return res.status(201).json({ status: 'success', message: bookingCode });
    } catch (err) {
        // errors thrown by the controller
        if (err.message === 'No such event exist') {
            return res.status(404).json({ status: 'failed', error: err.message });
        }
        if (err.message === 'Not enough tickets') {
            return res.status(400).json({ status: 'failed', error: err.message });
        }
        console.error("Booking Route Error:", err);
        return res.status(500).json({ status: 'failed', error: 'Internal server error' });
    }
});

router.get('/users/:id/bookings', async (req, res) => {
    const { id } = req.params;
    try {
        // validation of user
        const user = await userActions.userExist(id);
        if (!user || user.length === 0) {
            return res.status(404).json({
                status: 'failed',
                message: 'User not found'
            });
        }
        const bookings = await userActions.mybookings(id);
        return res.status(200).json({
            status: 'success',
            count: bookings.length,
            message: bookings
        });

    } catch (err) {
        console.error("Route Error:", err);
        return res.status(500).json({
            status: 'failed',
            error: 'Internal server error'
        });
    }
});

router.post('/events/:id/attendance', async (req, res) => {
    const { id } = req.params; // booing code is id
    try {
        const count = await userActions.ticketsCount(id);
        if (count !== null) {
            return res.status(200).json({
                status: 'success',
                attendance_count: count
            });
        } else {
            // the unique code was not found in the database
            return res.status(404).json({
                status: 'failed',
                error: 'Invalid booking code'
            });
        }
    } catch (err) {
        console.error("Attendance Route Error:", err);
        return res.status(500).json({
            status: 'failed',
            error: 'Internal server error'
        });
    }
});
//below fetches the details of the events
router.get('/events/:id/details', async (req, res) => {
    const { id } = req.params;
    try {
        const event = await userActions.eventdetails(id);
        // event is null or not
        if (!event) {
            return res.status(404).json({
                status: 'failed',
                message: 'No event exists with the provided id'
            });
        }
        return res.status(200).json({
            status: 'success',
            message: event
        });
    } catch (err) {
        console.error("Router Error:", err);
        return res.status(500).json({
            status: 'failed',
            error: 'Internal server error'
        });
    }
});
//below request is important for display the userIds
router.get('/users', async (req, res) => {
    try {
        const users = await userActions.fetchUsers();

        return res.status(200).json({
            status: 'success',
            count: users.length,
            message: users
        });
    } catch (err) {
        console.error("GET /users error:", err);
        return res.status(500).json({
            status: 'failed',
            error: 'Internal server error'
        });
    }
});

export default router;