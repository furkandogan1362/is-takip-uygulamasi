const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const verifyToken = require('../authMiddleware');
const { uploadProfileCv } = require('../multerConfig');

const router = express.Router();
const SECRET_KEY = 'secret_key';

// Kullanıcı kaydı
router.post('/register', (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = 'INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)';
  
  db.query(sql, [name, email, hashedPassword, isAdmin || false], (err) => {
    if (err) {
      return res.status(500).send('Kayıt sırasında hata oluştu');
    }
    res.status(201).send('Kayıt başarılı');
  });
});

// Kullanıcı girişi
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  
  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).send('Giriş sırasında hata oluştu');
    }

    if (results.length === 0) {
      return res.status(401).send('Kullanıcı bulunamadı');
    }

    const user = results[0];
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, SECRET_KEY, { expiresIn: '1h' });
      return res.json({ token });
    }
    res.status(401).send('Şifre yanlış');
  });
});

// Kullanıcı silme
router.delete('/users/:id', verifyToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send('Yetkisiz');
  }

  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE id = ?';
  
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Kullanıcı silinirken hata oluştu:', err);
      return res.status(500).send('Kullanıcı silinirken hata oluştu');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Kullanıcı bulunamadı');
    }

    res.send('Kullanıcı başarıyla silindi');
  });
});

// Profil bilgilerini alma
router.get('/profile', verifyToken, (req, res) => {
  const userId = req.user.id;
  const sql = 'SELECT id, name, email, isAdmin, photoUrl, cvUrl FROM users WHERE id = ?';

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

// Profil fotoğrafı yükleme
router.post('/upload-profile-photo', verifyToken, uploadProfileCv.single('photo'), (req, res) => {
    const userId = req.user.id;
    const photoUrl = `/uploads/${req.file.filename}`;
    const sql = 'UPDATE users SET photoUrl = ? WHERE id = ?';
  
    db.query(sql, [photoUrl, userId], (err) => {
      if (err) {
        return res.status(500).send('Fotoğraf yüklenirken hata oluştu');
      }
      res.send({ photoUrl });
    });
  });
  
  // CV yükleme
  router.post('/upload-cv', verifyToken, uploadProfileCv.single('cv'), (req, res) => {
    const userId = req.user.id;
    const cvUrl = `/uploads/${req.file.filename}`;
    const sql = 'UPDATE users SET cvUrl = ? WHERE id = ?';
  
    db.query(sql, [cvUrl, userId], (err) => {
      if (err) {
        return res.status(500).send('CV yüklenirken hata oluştu');
      }
      res.send({ cvUrl });
    });
  });
  

  // Kullanıcıları listeleme
  router.get('/users', verifyToken, (req, res) => {
    const sql = `
      SELECT 
        id,
        name,
        email,
        isAdmin,
        photoUrl,
        cvUrl
      FROM users
    `;
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Kullanıcılar alınırken hata oluştu:', err);
        return res.status(500).send('Kullanıcılar alınırken hata oluştu');
      }
  
      res.json(results);
    });
  });
  
  module.exports = router;
  



module.exports = router;
