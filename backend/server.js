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
const SECRET_KEY = 'secret_key';

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
const createStorage = (directory, prefix) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = directory;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const filetypes = new RegExp(allowedTypes.join('|'));
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Geçersiz dosya türü'));
  }
};

const uploadProfileCv = multer({
  storage: createStorage('uploads', 'profile-cv'),
  fileFilter: fileFilter(['pdf', 'jpeg', 'jpg', 'png'])
});

const uploadTasks = multer({
  storage: createStorage('uploads/tasks', 'task'),
  fileFilter: fileFilter(['jpeg', 'jpg', 'png'])
});

// Kullanıcı kaydı
app.post('/register', (req, res) => {
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
app.post('/login', (req, res) => {
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

// Token doğrulama
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Token gerekli');
  }
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send('Yetkisiz');
    }
    req.user = decoded;
    next();
  });
};

// Kullanıcı silme
app.delete('/users/:id', verifyToken, (req, res) => {
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

// İş silme
app.delete('/tasks/:id', verifyToken, (req, res) => {
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

// Profil bilgilerini alma
app.get('/profile', verifyToken, (req, res) => {
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

// İş güncelleme
app.put('/tasks/:id', verifyToken, uploadTasks.array('newImages', 5), (req, res) => {
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


// Profil fotoğrafı yükleme
app.post('/upload-profile-photo', verifyToken, uploadProfileCv.single('photo'), (req, res) => {
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
app.post('/upload-cv', verifyToken, uploadProfileCv.single('cv'), (req, res) => {
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
app.get('/users', verifyToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send('Yetkisiz');
  }

  const sql = 'SELECT id, name, email, photoUrl, cvUrl FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Veri çekme hatası:', err);
      return res.status(500).send('Kullanıcılar alınamadı');
    }
    res.json(results);
  });
});

// Görev oluşturma
app.post('/tasks', uploadTasks.single('image'), (req, res) => {
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
app.get('/tasks', verifyToken, async (req, res) => {
  const sql = 'SELECT * FROM tasks';
  
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
        imageUrl: task.imageUrl ? task.imageUrl.split(',') : [] // Fotoğraf URL'lerini dizi olarak ayır
      };
    }));

    res.json(tasksWithUserInfo);
  });
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});