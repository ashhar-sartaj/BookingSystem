import { useState } from "react";
import { useSearchParams } from "react-router-dom"
import axios from "axios";
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
            const response = await axios.get(`http://localhost:5000/events/${eventIdFromParams}/details`)
            console.log(response)
            const apiDate = response.data.message[0].date;
            console.log( apiDate)
            // 2. Format it to the local: using the helper function
            const formattedDate = formatToLocal(apiDate)
            setForm({
                ...form,
                date: formattedDate
            })
        }
        fetchEventDetails()
    }, [form.event_id])
    //useeffect to fetch all the avilable users to show their userIds
    useEffect(() => {
        const fetchUsers = async () => {
            const response = await axios.get(`http://localhost:5000/users`)
            if (response.data.message.length !== 0) {
                setUsers(response.data.message)
            }
            console.log(response)
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
            const response = await axios.post('http://localhost:5000/bookings', form); //will get the booking code
            console.log(response.data.message);
            if (response.data.status === 'success') {
                alert("Booking created ✅");
                setBookingCode(response.data.message);
            }
        } catch(err) {
            console.error(err);
            alert("Error in booking");
        }
        setForm({
            user_id: "",
            event_id:"",
            date: "",
            tickets_count: ""
        })
    }
    const checkMyBookings = async () => {
        if (!userId) return;
        const response = await axios.get(`http://localhost:5000/users/${userId}/bookings`);
        console.log('your bookings',response)
        if (response.data.message.length === 0) {
            setMessage('No bookings')
        }
        setAllBookings(response.data.message);//it will be an empty array if no bookings
    }
    const handleAttendance = async () => {
        if (!attendanceBookingCode) return;
        const response = await axios.post(`http://localhost:5000/events/${attendanceBookingCode}/attendance`);
        // console.log(response);
        if (response.data.status === 'success') {
            setAttendanceResult(response.data.message)
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
                    {bookingCode && (<input type="text" value={bookingCode}/>)}
                    
            </div>

            <div className="booking-right">
                <div className="card lookup">
                        <h3>Check Booking</h3>
                        <input type="text" placeholder="Enter your user id" value={userId} onChange={(e) => setUserId(e.target.value)}/>
                        <button onClick={checkMyBookings}>Check</button>
                        {allBookings.length > 0 && (
                            <div className="events-list">
                                {allBookings.map((eachBooking) => {
                                    const date = formatToLocal(eachBooking.date);
                                    return (<div key={eachBooking.id} className="card">
                                        <h3>{eachBooking.event_name}</h3>
                                        <p>{new Date(eachBooking.date).toLocaleString()}</p>
                                        <p>{eachBooking.tickets_count}</p>  
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
                                return (<div key={eachUser.id} className="card">
                                    <h3>{eachUser.name}</h3>
                                    <p>{eachUser.id}</p>
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