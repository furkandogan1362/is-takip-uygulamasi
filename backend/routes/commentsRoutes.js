// commentsRoutes.js
const express = require('express');
const db = require('../db');
const verifyToken = require('../authMiddleware');

const router = express.Router();

// Yorum ekleme
router.post('/comments', verifyToken, (req, res) => {
  const { jobId, title, content } = req.body;
  const userId = req.user.id;

  // Gerekli alanların kontrolü
  if (!jobId || !title || !content) {
    return res.status(400).send('Eksik veri gönderildi');
  }

  // Yorum ekleme SQL sorgusu
  const sql = 'INSERT INTO comments (job_id, created_by, title, content, created_at, status) VALUES (?, ?, ?, ?, NOW(), "Aktif")';

  db.query(sql, [jobId, userId, title, content], (err) => {
    if (err) {
      console.error('Yorum eklenirken hata oluştu:', err);
      return res.status(500).send('Yorum eklenirken hata oluştu');
    }

    res.status(201).send('Yorum başarıyla eklendi');
  });
});


// Kullanıcının kendi yorumlarını listeleme
router.get('/my-comments', verifyToken, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT 
      c.id AS commentId,
      t.id AS taskId,
      t.title AS taskTitle,
      uc.name AS taskCreatorName,
      u.name AS commentAuthorName,
      c.title AS commentTitle,
      c.content AS commentContent,
      c.created_at AS commentCreatedAt,
      CASE
        WHEN t.status = 'Silindi' THEN 'Pasif'
        ELSE 'Aktif'
      END AS commentStatus
    FROM comments c
    JOIN tasks t ON c.job_id = t.id
    JOIN users u ON c.created_by = u.id
    JOIN users uc ON t.created_by = uc.id
    WHERE c.created_by = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Yorumlar alınırken hata oluştu:', err);
      return res.status(500).send('Yorumlar alınırken hata oluştu');
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Henüz yorumunuz yok.' });
    }

    res.json(results);
  });
});




module.exports = router;
