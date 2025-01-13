const request = require('supertest');
const createApp = require('../index'); 

let app;

describe('Room Booking API Tests', () => {
    beforeEach(() => {
        const rooms = Array.from({ length: 10 }, (_, i) => ({ roomNumber: i + 1, isAvailable: true }));
        const bookings = [];
        app = createApp(rooms, bookings); 
    });

    test('should book a room successfully', async () => {
        const response = await request(app)
            .post('/book-room')
            .send({
                name: 'John Doe',
                email: 'john@example.com',
                contact: '1234567890',
                checkInDate: '2025-01-15',
                checkOutDate: '2025-01-20',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Room booked successfully!');
        expect(response.body.bookingDetails).toHaveProperty('roomNumber', 1);
    });

    test('should return error if no rooms are available', async () => {
        const rooms = Array.from({ length: 10 }, (_, i) => ({ roomNumber: i + 1, isAvailable: false }));
        app = createApp(rooms, []); 

        const response = await request(app).post('/book-room').send({
            name: 'John Doe',
            email: 'john@example.com',
            contact: '1234567890',
            checkInDate: '2025-01-15',
            checkOutDate: '2025-01-20',
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No rooms available.');
    });

    test('should fetch booking details by email', async () => {
        const booking = {
            roomNumber: 1,
            name: 'John Doe',
            email: 'john@example.com',
            contact: '1234567890',
            checkInDate: '2025-01-15',
            checkOutDate: '2025-01-20',
        };

        await request(app).post('/book-room').send(booking);

        const response = await request(app).get('/booking-details').query({ email: 'john@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(booking);
    });

    test('should return error if booking not found', async () => {
        const response = await request(app).get('/booking-details').query({ email: 'nonexistent@example.com' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Booking not found.');
    });

    test('should fetch all guests in the hotel', async () => {
        const guests = [
            { roomNumber: 1, name: 'John Doe', email: 'john@example.com', contact: '1234567890' },
            { roomNumber: 2, name: 'Jane Doe', email: 'jane@example.com', contact: '0987654321' },
        ];

        for (const guest of guests) {
            await request(app).post('/book-room').send(guest);
        }

        const response = await request(app).get('/all-guests');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(guests.length);
    });

    test('should cancel a booking successfully', async () => {
        const booking = {
            roomNumber: 1,
            name: 'John Doe',
            email: 'john@example.com',
            contact: '1234567890',
            checkInDate: '2025-01-15',
            checkOutDate: '2025-01-20',
        };

        await request(app).post('/book-room').send(booking);

        const response = await request(app)
            .delete('/cancel-booking')
            .send({ email: 'john@example.com', roomNumber: 1 });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Booking canceled successfully.');
    });

    test('should modify a booking successfully', async () => {
        const booking = {
            roomNumber: 1,
            name: 'John Doe',
            email: 'john@example.com',
            contact: '1234567890',
            checkInDate: '2025-01-15',
            checkOutDate: '2025-01-20',
        };

        await request(app).post('/book-room').send(booking);

        const response = await request(app)
            .put('/modify-booking')
            .send({
                email: 'john@example.com',
                roomNumber: 1,
                newCheckInDate: '2025-01-16',
            });

        expect(response.status).toBe(200);
        expect(response.body.updatedBooking.checkInDate).toBe('2025-01-16');
    });
});