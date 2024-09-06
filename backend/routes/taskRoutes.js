const express = require('express');
const db = require('../db');
const verifyToken = require('../authMiddleware');
const { uploadTasks } = require('../multerConfig');

const router = express.Router();

// İş silme
router.delete('/tasks/:id', verifyToken, (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;

  const findTaskSql = 'SELECT created_by FROM tasks WHERE id = ?';
  
  db.query(findTaskSql, [taskId], (err, results) => {
    if (err) {
      return res.status(500).send('İş bulunamadı');
    }

    if (results.length === 0) {
      return res.status(404).send('İş bulunamadı');
    }

    const creatorId = results[0].created_by;
    if (!req.user.isAdmin && userId !== creatorId) {
      return res.status(403).send('Sadece kendi oluşturduğunuz işi silebilirsiniz!');
    }

    const deleteTaskSql = 'DELETE FROM tasks WHERE id = ?';
    db.query(deleteTaskSql, [taskId], (err) => {
      if (err) {
        return res.status(500).send('İş silinirken hata oluştu');
      }

      const getUserSql = 'SELECT name FROM users WHERE id = ?';
      db.query(getUserSql, [creatorId], (err, userResults) => {
        if (err) {
          return res.status(500).send('Kullanıcı bilgileri alınamadı');
        }

        const creatorName = userResults[0]?.name || 'Bilinmeyen Kullanıcı';
        res.send({
          message: `${creatorId} idli ${creatorName} kullanıcısının ${taskId} idli işi silinmiştir.`,
          taskId,
          creatorId,
          creatorName
        });
      });
    });
  });
});

// İş güncelleme
router.put('/tasks/:id', verifyToken, uploadTasks.array('newImages', 5), (req, res) => {
  const taskId = req.params.id;
  const { title, status, details } = req.body;
  const userId = req.user.id;
  const newImages = req.files;

  // Sadece belirli alanların güncellenebilir olduğunu kontrol et
  if (!title && !status && !details && (!newImages || newImages.length === 0)) {
    return res.status(400).send('Güncellenecek alanlar belirtilmelidir');
  }

  // Görevin mevcut olup olmadığını kontrol et
  const findTaskSql = 'SELECT created_by, imageUrl FROM tasks WHERE id = ?';
  
  db.query(findTaskSql, [taskId], (err, results) => {
    if (err) {
      return res.status(500).send('Görev bulunamadı');
    }

    if (results.length === 0) {
      return res.status(404).send('Görev bulunamadı');
    }

    const creatorId = results[0].created_by;
    let existingImages = results[0].imageUrl ? results[0].imageUrl.split(',') : [];
    
    // Kullanıcının yetkisini kontrol et
    if (!req.user.isAdmin && userId !== creatorId) {
      return res.status(403).send('Sadece kendi oluşturduğunuz işi güncelleyebilirsiniz');
    }
    
    // Yeni fotoğrafları işle
    let updatedImageUrls = existingImages;
    if (newImages && newImages.length > 0) {
      const newImageUrls = newImages.map(file => `/uploads/tasks/${file.filename}`);
      updatedImageUrls = [...existingImages, ...newImageUrls];
    }
    
    // Güncelleme işlemini yap
    const updateSql = `
      UPDATE tasks
      SET title = COALESCE(?, title),
          status = COALESCE(?, status),
          details = COALESCE(?, details),
          imageUrl = ?
      WHERE id = ?
    `;
    
    db.query(updateSql, [title, status, details, updatedImageUrls.join(','), taskId], (err) => {
      if (err) {
        return res.status(500).send('Görev güncellenirken hata oluştu');
      }
      res.send({ message: 'Görev başarıyla güncellendi', updatedImages: updatedImageUrls });
    });
  });
});

// Görev oluşturma
router.post('/tasks', uploadTasks.single('image'), (req, res) => {
    const { title, status, details, createdBy } = req.body;
    const imageUrl = req.file ? `/uploads/tasks/${req.file.filename}` : null;
  
    if (!title || !status || !details || !createdBy) {
      return res.status(400).send('Eksik veri gönderildi');
    }
  
    const sql = 'INSERT INTO tasks (title, status, created_by, details, imageUrl) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [title, status, createdBy, details, imageUrl], (err) => {
      if (err) {
        console.error('Görev oluşturulurken hata oluştu:', err);
        return res.status(500).send('Görev oluşturulurken hata oluştu');
      }
      res.status(201).send('Görev başarıyla oluşturuldu');
    });
  });
  
 // Görevleri listeleme
router.get('/tasks', verifyToken, async (req, res) => {
  const sql = `
    SELECT t.*, 
           IFNULL(c.comment_count, 0) AS comment_count
    FROM tasks t
    LEFT JOIN (
      SELECT job_id, COUNT(*) AS comment_count
      FROM comments
      GROUP BY job_id
    ) c ON t.id = c.job_id
  `;
  
  db.query(sql, async (err, results) => {
    if (err) {
      console.error('Veri çekme hatası:', err);
      return res.status(500).send('Görevler alınamadı');
    }

    const tasksWithUserInfo = await Promise.all(results.map(async (task) => {
      const creatorId = task.created_by;
      const userSql = 'SELECT name FROM users WHERE id = ?';
      const [userResult] = await db.promise().query(userSql, [creatorId]);

      return {
        id: task.id,
        title: task.title,
        status: task.status,
        creatorName: userResult[0]?.name || 'Bilinmeyen Kullanıcı',
        createdAt: task.created_at,
        details: task.details,
        imageUrl: task.imageUrl ? task.imageUrl.split(',') : [], // Fotoğraf URL'lerini dizi olarak ayır
        comment_count: task.comment_count // Eklenen yorum sayısı
      };
    }));

    res.json(tasksWithUserInfo);
  });
});
  
  module.exports = router;
  

module.exports = router;
