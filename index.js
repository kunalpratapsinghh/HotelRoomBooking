const express = require('express');

const createApp = (initialRooms = [], initialBookings = []) => {
    const app = express();
    app.use(express.json());

    let rooms = initialRooms.length ? initialRooms : Array.from({ length: 10 }, (_, i) => ({ roomNumber: i + 1, isAvailable: true }));
    let bookings = initialBookings;

    const findAvailableRoom = () => rooms.find(room => room.isAvailable);

    //Booking Room API
    app.post('/book-room', (req, res) => {
        const { name, email, contact, checkInDate, checkOutDate } = req.body;
        const room = findAvailableRoom();

        if (!room) return res.status(400).json({ message: 'No rooms available.' });

        room.isAvailable = false;
        const booking = { roomNumber: room.roomNumber, name, email, contact, checkInDate, checkOutDate };
        bookings.push(booking);

        res.status(200).json({
            message: 'Room booked successfully!',
            bookingDetails: booking,
        });
    });

    //View Booking Details API
    app.get('/booking-details', (req, res) => {
        const { email } = req.query;
        const booking = bookings.find(b => b.email === email);

        if (!booking) return res.status(404).json({ message: 'Booking not found.' });

        res.status(200).json(booking);
    });

    //View All Guests in the Hotel API
    app.get('/all-guests', (req, res) => {
        const guests = bookings.map(({ roomNumber, name }) => ({ roomNumber, name }));
        res.status(200).json(guests);
    });

    //Cancel Room Booking API
    app.delete('/cancel-booking', (req, res) => {
        const { email, roomNumber } = req.body;
        const index = bookings.findIndex(b => b.email === email && b.roomNumber === roomNumber);

        if (index === -1) return res.status(404).json({ message: 'Booking not found.' });

        rooms.find(room => room.roomNumber === roomNumber).isAvailable = true;
        bookings.splice(index, 1);

        res.status(200).json({ message: 'Booking canceled successfully.' });
    });

    //Modify Booking API
    app.put('/modify-booking', (req, res) => {
        const { email, roomNumber, newCheckInDate, newCheckOutDate } = req.body;
        const booking = bookings.find(b => b.email === email && b.roomNumber === roomNumber);

        if (!booking) return res.status(404).json({ message: 'Booking not found.' });

        booking.checkInDate = newCheckInDate || booking.checkInDate;
        booking.checkOutDate = newCheckOutDate || booking.checkOutDate;

        res.status(200).json({
            message: 'Booking modified successfully.',
            updatedBooking: booking,
        });
    });

    return app;
};
const app = createApp();
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


module.exports = createApp;