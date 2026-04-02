import { useState } from "react";
import { useSearchParams } from "react-router-dom"
import axios from "axios";
import { api } from "../api/axios.js";
import { useEffect } from "react";
function Booking() {
    const [searchParams] = useSearchParams();
    // console.log(searchParams) //URLSearchParams {size: 1}
    const eventIdFromParams = searchParams.get("eventId");
    console.log(eventIdFromParams);
    const [form, setForm] = useState({
        user_id: "",
        event_id: eventIdFromParams,
        date: "",
        tickets_count: ""
    })
    const [userId, setUserId] = useState('');
    const [allBookings, setAllBookings ] = useState([])
    const [message, setMessage] = useState('');
    const [bookingCode, setBookingCode] = useState('');
    const [attendanceBookingCode, setAttendanceBookingCode] = useState('')
    const [attendanceResult, setAttendanceResult] = useState('')
    const [users, setUsers] = useState([])
    //helper function to format the date backn to the local input. Will accept the utcstring..a dnconvert.
    const formatToLocal = (utcdatestring) =>{
        if (!utcdatestring) return "";
        const date = new Date(utcdatestring);
        // This offset converts the UTC time back to your local machine's time
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);

        return localISOTime;
    }
    //using the  eventId make a db call and et all the details if the event.. and then set the date from it to this form.
    useEffect(() => {
        if (!form.event_id) return;
        const fetchEventDetails = async () => {
            try {
                const response = await api.get(`/events/${eventIdFromParams}/details`)
                console.log(response)
                const apiDate = response.data.message.date;
                console.log(apiDate)
                // 2. Format it to the local: using the helper function
                const formattedDate = formatToLocal(apiDate)
                setForm({
                    ...form,
                    date: formattedDate
                })
            } catch(err) {
                if (err.response) {
                    const statusCode = err.response.status;
                    const serverError = err.response.data.error
                    if (statusCode === 404) {
                        alert(`No event exists with the provided id`)
                    } else if (statusCode === 500) {
                        alert(`Internal server error`)
                    } else {
                        alert("Server Error: Please try again later.");
                    }
                } else {
                    alert("Could not connect to the server.");
                }
            }
            
        }
        fetchEventDetails()
    }, [form.event_id])
    //useeffect to fetch all the avilable users to show their userIds
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get(`/users`)
                if (response.data.message.length !== 0) {
                    setUsers(response.data.message)
                }
                console.log(response)
            } catch(err) {
                if (err.response) {
                    const errorCode = err.response.status;
                    // const serverError = err.response.data.error;
                    if (errorCode=== 500) {
                        alert(`failed to fetch users`)
                    } else {
                        alert("Server Error: Please try again later.");
                    }
                } else {
                    alert("Could not connect to the server.");
                }
            }

        }
        fetchUsers()
    },[])
    
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]:e.target.value
        })
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/bookings', form); //will get the booking code
            console.log(response.data.message);
            if (response.data.status === 'success') {
                alert("Booking created");
                setBookingCode(response.data.message);
            }
        } catch(err) {
            // console.error(err);
            //check if the error.response exist or not
            if (err.response) {
                //get the status code
                console.log(err.response)
                const statusCode = err.response.status;
                // const serverError = err.response.data.error; //will be our string from the backend error
                if (statusCode === 400) {
                    alert('Invalid request/input/invalid ticket counts')
                } else if(statusCode === 404) {
                    alert('User not exist/found')
                } else {
                    alert("Server Error: Please try again later.");
                }
            } else {
                //case if the request hasnt been made to the server
                alert("Could not connect to the server.");
            }
            
        }
        setForm({
            user_id: "",
            event_id:"",
            date: "",
            tickets_count: ""
        })
    }
    const checkMyBookings = async () => {
        // if (!userId) return;
        try {
            const response = await api.get(`/users/${userId}/bookings`);
            console.log('your bookings', response)
            if (response.data.message.length === 0) {
                setMessage('No bookings')
            }
            setAllBookings(response.data.message);//it will be an empty array if no bookings
        } catch(err) {
            if (err.response) {
                console.log(err.response)
                const statusCode=err.response.status;
                const serverError=err.response.data.error
                console.log(serverError)
                if (statusCode === 404) {
                    alert(`failed to fetch your bookings ${serverError}`)
                } else if (statusCode===500) {
                    alert(`failed to fetch your bookings ${serverError}`)
                } else {
                    alert("Server Error: Please try again later.");
                }
            } else {
                alert("Could not connect to the server.");
            }
        }
        
    }
    const handleAttendance = async () => {
        // if (!attendanceBookingCode) return;
        try {
            const response = await api.post(`/events/${attendanceBookingCode}/attendance`);
            // console.log(response);
            if (response.data.status === 'success') {
                setAttendanceResult(response.data.message)
            }
        } catch(err) {
            if (err.response) {

                console.log(err.response)
                const statusCode = err.response.status;
                const serverError = err.response.data.error
                if (statusCode === 404) {
                    alert(`failed to handleAttendance ${serverError}`)
                } else if (statusCode === 500) {
                    alert(`failed to handleAttendance ${serverError}`)
                } else {
                    alert("Server Error: Please try again later.");
                }
            } else {
                alert("Could not connect to the server.");
            }
        }
        
    }
    return (<>
    <div className="container">
        <div className="booking-layout">
            <div className="booking-left card">
                    <h2>Book Tickets</h2>
                    <form onSubmit={handleSubmit} className="form">
                        {/* fields required: user_id, event_id, booking_code, tickets_count, booking_date */}
                        {/* userid can be automatically filed: implement later on  */}
                        <input type="number" name="user_id" placeholder="User ID" onChange={handleChange} value={form.user_id}/>
                        <input type="number" name="event_id" placeholder="Event ID" readOnly value={form.event_id} />
                        <input type="datetime-local" name="date" readOnly value={form.date} required />
                        <input type="number" name="tickets_count" placeholder="Number of tickets" onChange={handleChange} value={form.tickets_count} required />
                        <button type="submit">Book</button>
                    </form>
                    {bookingCode && (<input type="text" value={bookingCode} readOnly/>)}
                    
            </div>

            <div className="booking-right">
                <div className="card lookup">
                        <h3>Check Booking</h3>
                        <input type="text" placeholder="Enter your user id" value={userId} onChange={(e) => setUserId(e.target.value)}/>
                        <button onClick={checkMyBookings}>Check</button>
                        {allBookings.length > 0 && (
                            <div className="events-list">
                                {allBookings.map((eachBooking) => {
                                    const date = formatToLocal(eachBooking.event_date);
                                    return (<div key={eachBooking.id} className="card">
                                        <h4>{eachBooking.event_name}</h4>
                                        <p>date & time:{new Date(eachBooking.event_date).toLocaleString()}</p>
                                        <p>Tickets count:{eachBooking.tickets_count}</p>  
                                        {/* <button onClick={() => handleBooking(event.id)}>Book</button> */}
                                    </div>)
                                })}
                            </div>
                        )}
                        {message && {message}}
                </div>
            </div>

                <div className="card attendance">
                    <h3>Mark Attendance</h3>

                    <input type="text" placeholder="Enter booking code" value={attendanceBookingCode} onChange={(e) => setAttendanceBookingCode(e.target.value)}/>

                    <button onClick={handleAttendance}>Submit</button>

                    {attendanceResult && (
                        <div className="result">
                            <p>Tickets Booked: {attendanceResult}</p>
                        </div>
                    )}
                </div>

                <div className="card attendance">
                    <h3>Available user ids</h3>
                    {users.length > 0 && (
                        <div className="events-list">
                            {users.map((eachUser) => {
                                return (<div key={eachUser.id} className="eachUserIdDiv">
                                    <span>{eachUser.name}</span>
                                    <span>{eachUser.id}</span>
                                </div>)
                            })}
                        </div>
                    )}
                </div>
        </div>
    </div>
    </>)
}
export default Booking