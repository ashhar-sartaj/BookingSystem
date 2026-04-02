import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios.js";
function LandingPage() {

    const [events, setEvents] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('')
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        description: "",
        date: "",
        total_capacity: ""
    });

    // Fetch events
    const fetchEvents = async () => {
        // console.log('fetchevent runned')
        try {
            const res = await api.get("/events");
            // console.log('/events ')
            // console.log(res); //this is [] if no upcoming events
            if (res.data.message.length==0) {
                setMessage('No upcoming events')
            }
            setEvents(res.data.message);
        } catch (err) {
            // console.error(err);
            if (err.response) {
                const statusCode = err.response.status;
                const serverError = err.response.data.error;
                if (statusCode === 500) {
                    alert(`fetch events failed ${serverError}` )
                } else {
                    alert("Server Error: Please try again later.");
                }
            } else {
                //if request hant been been made to the server.. so there would be an statusCode
                alert("Could not connect to the server.");
            }
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);
    useEffect(() => {
        console.log(message)
    }, [message])

    // Handle form change
    const handleChange = (e) => {
        //special check for date: converting it to ISO and also checkig whether the provided date is future relevant.
        if (e.target.name === 'date') {
            const selectedDateString = e.target.value;
            //converting into object for comparison
            const selectedDateObj = new Date(selectedDateString);
            //current date
            const now = new Date();
            // Validation: Check if the date is in the future
            if (selectedDateObj <= now) {
                alert("Please select a future date and time.");
                return;
            }

            // Conversion: Convert to ISO for the Backend
            const isoDate = selectedDateObj.toISOString();
            console.log('date from frontned', isoDate)
            setForm({ ...form, date: isoDate });
        }
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Create event
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/events", form);
            if (response.data.status === 'success') {
                alert("Event created ");
            }
            fetchEvents();

            setForm({
                title: "",
                description: "",
                date: "",
                total_capacity: ""
            });
        } catch (err) {
            // console.error(err);
            if (err.message === 'Database operation failed to insert row.') {
                alert("Failed event creation. Reason: Db");
            }
            if (err.response) {
                const statusCode = err.response.status;
                const serverError = err.response.data.error;
                if (statusCode === 400) {
                    alert(`failed inputs ${serverError}`)
                } else if (statusCode === 500) {
                    alert(`failed event creation ${serverError}`)
                } else {
                    alert("Server Error: Please try again later.");
                }
            } else {
                alert("Could not connect to the server.");
            }
        }
    };
    //booking button handling
    const handleBooking = (eventId) => {
        console.log('event id is ', eventId)
        //navigate to /booking?eventId=eventId
        navigate(`/booking?eventId=${eventId}`)
    }

    return (
        <div className="container">
            <div className="flex">

                {/* LEFT */}
                <div className="left-section card">
                    <h2>Create Event</h2>

                    <form onSubmit={handleSubmit} className="form">
                        <input type="text" name="title" placeholder="Title" onChange={handleChange} value={form.title} required/>
                        <input type="text" name="description" placeholder="Description" onChange={handleChange} value={form.description} required />
                        <input type="datetime-local" name="date" onChange={handleChange} value={form.date} required />
                        <input type="number" name="total_capacity" placeholder="Capacity" onChange={handleChange} value={form.total_capacity} required />

                        <button type="submit">Create Event</button>
                    </form>
                </div>

                {/* RIGHT SECTION (40%) */}
                <div className="right-section">
                    <h2>Upcoming Events</h2>
                    {events.length > 0 ? (
                        <div className="events-list">
                            {events.map((event) => (
                                <div key={event.id} className="card">
                                    <h3>{event.title}</h3>
                                    <p>{event.description}</p>
                                    <p>{new Date(event.date).toLocaleString()}</p>
                                    <p>Tickets left: {event.remaining_tickets}</p>

                                    <button onClick={() => handleBooking(event.id)}>Book</button>
                                </div>
                            ))}
                        </div>
                    ):(<p>{message}</p>)}
                </div>

            </div>
        </div>
    );
};

export default LandingPage;