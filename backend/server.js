const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const { uploadProfileCv, uploadTasks } = require('./multerConfig');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentsRoutes = require('./routes/commentsRoutes'); // Yeni eklenen satır
const verifyToken = require('./authMiddleware');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// MySQL bağlantısını yap
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'furkan',
  database: 'task_tracker'
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL veritabanına bağlandı');
});

// Kullanıcı, görev ve yorum ile ilgili yolları bağlama
app.use(userRoutes);
app.use(taskRoutes);
app.use(commentsRoutes); // Yeni eklenen satır

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
