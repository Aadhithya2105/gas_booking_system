const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'iocl_lpg_db';
let db;

async function connectDB() {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
        await db.createCollection('users');
        await db.createCollection('bookings');
        await db.createCollection('payments');
        await db.createCollection('feedback');
        await db.createCollection('deliveryIssues');
        await db.createCollection('sosAlerts');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

async function getUser(consumerNo, mobile) {
    if (!db) throw new Error('Database not connected');
    return await db.collection('users').findOne({ consumerNo, mobile });
}

async function getUserByEmailOrMobile(email, mobile) {
    if (!db) throw new Error('Database not connected');
    return await db.collection('users').findOne({ $or: [{ email }, { mobile }] });
}

async function createUser(user) {
    if (!db) throw new Error('Database not connected');
    await db.collection('users').insertOne(user);
}

async function getBookings(consumerNo) {
    if (!db) throw new Error('Database not connected');
    return await db.collection('bookings').find({ consumerNo }).toArray();
}

async function createBooking(booking) {
    if (!db) throw new Error('Database not connected');
    await db.collection('bookings').insertOne(booking);
}

async function updateBooking(bookingId, update) {
    if (!db) throw new Error('Database not connected');
    await db.collection('bookings').updateOne({ id: bookingId }, { $set: update });
}

async function getPaymentsByBookings(bookingIds) {
    if (!db) throw new Error('Database not connected');
    return await db.collection('payments').find({ bookingId: { $in: bookingIds } }).toArray();
}

async function createPayment(payment) {
    if (!db) throw new Error('Database not connected');
    await db.collection('payments').insertOne(payment);
}

async function updatePayment(paymentId, update) {
    if (!db) throw new Error('Database not connected');
    await db.collection('payments').updateOne({ id: paymentId }, { $set: update });
}

async function createFeedback(feedback) {
    if (!db) throw new Error('Database not connected');
    await db.collection('feedback').insertOne(feedback);
}

async function createDeliveryIssue(issue) {
    if (!db) throw new Error('Database not connected');
    await db.collection('deliveryIssues').insertOne(issue);
}

async function createSOSAlert(alert) {
    if (!db) throw new Error('Database not connected');
    await db.collection('sosAlerts').insertOne(alert);
}

async function getBooking(bookingId, consumerNo) {
    if (!db) throw new Error('Database not connected');
    return await db.collection('bookings').findOne({ id: bookingId, consumerNo });
}

async function sendSMS(mobile, message) {
    console.log(`SMS to ${mobile}: ${message}`);
}

// New function to view database collections and data
async function viewDatabase() {
    if (!db) throw new Error('Database not connected');
    const collections = await db.listCollections().toArray();
    const dbInfo = {};
    
    for (const collection of collections) {
        const collectionName = collection.name;
        const data = await db.collection(collectionName).find().toArray();
        dbInfo[collectionName] = data;
    }
    
    return dbInfo;
}

module.exports = {
    connectDB,
    getUser,
    getUserByEmailOrMobile,
    createUser,
    getBookings,
    createBooking,
    updateBooking,
    getPaymentsByBookings,
    createPayment,
    updatePayment,
    createFeedback,
    createDeliveryIssue,
    createSOSAlert,
    getBooking,
    sendSMS,
    viewDatabase // Export the new function
};