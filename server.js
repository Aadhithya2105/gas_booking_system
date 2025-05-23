const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// APP Express

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/iocl_lpg_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  consumerNo: { type: String, required: true, unique: true },
  requestNo: String,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: Date,
  marital: { type: String, enum: ['Married', 'Unmarried'], required: true },
  mobile: { type: String, required: true, match: /^[0-9]{10}$/ },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  nationality: String,
  address: String,
  appliedDate: Date,
  related: { type: String, enum: ['Spouse', 'Father'], required: true },
  relatedFirstName: String,
  relatedLastName: String,
  relatedAddress: String,
  city: String,
  pin: { type: String, match: /^[0-9]{6}$/, required: true },
  registeredAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Approved' }
});

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  consumerNo: { type: String, required: true },
  mobile: { type: String, match: /^[0-9]{10}$/, required: true },
  cylinderType: { type: String, enum: ['14.2kg', '5kg', '19kg'], required: true },
  quantity: { type: Number, min: 1, max: 5, required: true },
  deliveryDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  bookingId: { type: String, required: true },
  amount: { type: Number, min: 1, required: true },
  method: { type: String, enum: ['card', 'cash', 'UPI'], required: true },
  reference: { type: String, default: 'N/A' },
  paymentDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Completed' }
});

const feedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  consumerNo: { type: String, required: true },
  category: { type: String, enum: ['Service Quality', 'Delivery', 'Payment', 'Other'], required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const deliveryIssueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  bookingId: { type: String, required: true },
  consumerNo: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Reported' }
});

const sosAlertSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  consumerNo: { type: String, required: true },
  mobile: { type: String, match: /^[0-9]{10}$/, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Sent' }
});

// Models
const User = mongoose.model('User', userSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const DeliveryIssue = mongoose.model('DeliveryIssue', deliveryIssueSchema);
const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin Authentication (Simple hardcoded credentials for demo)
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Admin API Endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/payments', async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/deliveryIssues', async (req, res) => {
  try {
    const deliveryIssues = await DeliveryIssue.find();
    res.json({ deliveryIssues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/sosAlerts', async (req, res) => {
  try {
    const sosAlerts = await SOSAlert.find();
    res.json({ sosAlerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Existing User API Endpoints
app.get('/api/users', async (req, res) => {
  const { consumerNo, mobile } = req.query;
  try {
    const user = await User.findOne({ consumerNo, mobile });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/check', async (req, res) => {
  const { email, mobile } = req.query;
  try {
    const user = await User.findOne({ $or: [{ email }, { mobile }] });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  const { consumerNo } = req.query;
  try {
    const bookings = await Booking.find({ consumerNo });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: 'Booking created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Booking.updateOne({ id }, { $set: req.body });
    res.json({ message: 'Booking updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  const { bookingIds } = req.body;
  if (bookingIds) {
    try {
      const payments = await Payment.find({ bookingId: { $in: bookingIds } });
      res.json({ payments });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    try {
      const payment = new Payment(req.body);
      await payment.save();
      res.status(201).json({ message: 'Payment created' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/payments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Payment.updateOne({ id }, { $set: req.body });
    res.json({ message: 'Payment updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({ message: 'Feedback created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/deliveryIssues', async (req, res) => {
  try {
    const issue = new DeliveryIssue(req.body);
    await issue.save();
    res.status(201).json({ message: 'Delivery issue created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sosAlerts', async (req, res) => {
  try {
    const alert = new SOSAlert(req.body);
    await alert.save();
    res.status(201).json({ message: 'SOS alert created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/single', async (req, res) => {
  const { bookingId, consumerNo } = req.query;
  try {
    const booking = await Booking.findOne({ id: bookingId, consumerNo });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sms', async (req, res) => {
  const { mobile, message } = req.body;
  try {
    console.log(`SMS to ${mobile}: ${message}`);
    res.json({ message: 'SMS sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/view-database', async (req, res) => {
  try {
    const collections = ['users', 'bookings', 'payments', 'feedback', 'deliveryIssues', 'sosAlerts'];
    const dbInfo = {};
    for (const collection of collections) {
      dbInfo[collection] = await mongoose.model(collection).find();
    }
    res.json({ database: dbInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
