const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/myapp', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // 5 second timeout
})
.then(() => console.log('Successfully connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if unable to connect to MongoDB
});

// Create a simple schema
const ItemSchema = new mongoose.Schema({
  name: String,
  description: String
});

const Item = mongoose.model('Item', ItemSchema);

app.use(express.json());

// Create an item
app.post('/items', async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.status(201).send(item);
});

// Get all items
app.get('/items', async (req, res) => {
  const items = await Item.find();
  res.send(items);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${port}`);
});