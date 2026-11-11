require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, 'services.json');

app.use(express.json());
app.use(express.static('public'));

function readServices() {
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, '[]');
  return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8') || '[]');
}

function writeServices(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// Get all services
app.get('/api/services', (req, res) => {
  res.json(readServices());
});

// Add new service
app.post('/api/services', (req, res) => {
  const { name, port, url } = req.body;
  if (!name || !port || !url) return res.status(400).json({ error: 'Missing fields' });

  const services = readServices();
  const newService = { id: Date.now().toString(), name, port, url };
  services.push(newService);
  writeServices(services);
  res.json({ success: true, service: newService });
});

// Update service
app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const { name, port, url } = req.body;

  let services = readServices();
  const index = services.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  services[index] = { id, name, port, url };
  writeServices(services);
  res.json({ success: true });
});

// Delete service
app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  let services = readServices();
  services = services.filter(s => s.id !== id);
  writeServices(services);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
