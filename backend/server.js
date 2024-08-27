const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype || file.fieldname === 'photo') {
      return cb(null, true);
    } else {
      cb(new Error('Sadece PDF dosyası yükleyebilirsiniz.'));
    }
  }
});

// Kullanıcı kaydı
app.post('/register', (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = 'INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, hashedPassword, isAdmin || false], (err, result) => {
    if (err) {
      res.status(500).send('Kayıt sırasında hata oluştu');
    } else {
      res.status(201).send('Kayıt başarılı');
    }
  });
});

// Kullanıcı girişi
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      res.status(500).send('Giriş sırasında hata oluştu');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('Kullanıcı bulunamadı');
      return;
    }

    const user = results[0];

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'secret_key', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).send('Şifre yanlış');
    }
  });
});

// Profil bilgilerini alma
app.get('/profile', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Yetkisiz');
    }

    const userId = decoded.id;

    const sql = 'SELECT name, email, isAdmin, photoUrl, cvUrl FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
      if (err) {
        return res.status(500).send('Kullanıcı bilgileri alınamadı');
      }
      if (results.length === 0) {
        return res.status(404).send('Kullanıcı bulunamadı');
      }
      
      res.json(results[0]);
    });
  });
});

// Profil fotoğrafı yükleme
app.post('/upload-profile-photo', upload.single('photo'), (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Yetkisiz');
    }

    const userId = decoded.id;
    const photoUrl = `/uploads/${req.file.filename}`;

    const sql = 'UPDATE users SET photoUrl = ? WHERE id = ?';
    db.query(sql, [photoUrl, userId], (err) => {
      if (err) {
        return res.status(500).send('Fotoğraf yüklenirken hata oluştu');
      }
      res.send({ photoUrl });
    });
  });
});

// CV yükleme
app.post('/upload-cv', upload.single('cv'), (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Yetkisiz');
    }

    const userId = decoded.id;
    const cvUrl = `/uploads/${req.file.filename}`;

    const sql = 'UPDATE users SET cvUrl = ? WHERE id = ?';
    db.query(sql, [cvUrl, userId], (err) => {
      if (err) {
        return res.status(500).send('CV yüklenirken hata oluştu');
      }
      res.send({ cvUrl });
    });
  });
});

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
