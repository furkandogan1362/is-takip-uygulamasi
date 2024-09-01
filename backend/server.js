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

// Multer konfigürasyonu (Profil fotoğrafı ve CV için mevcut)
const storageProfileCv = multer.diskStorage({
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
const uploadProfileCv = multer({ 
  storage: storageProfileCv,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype || file.fieldname === 'photo') {
      return cb(null, true);
    } else {
      cb(new Error('Geçersiz dosya türü'));
    }
  }
});

// Multer konfigürasyonu (Görevler için)
const storageTasks = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/tasks/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'task-' + uniqueSuffix + ext);
  }
});
const uploadTasks = multer({ 
  storage: storageTasks,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece JPG, JPEG ve PNG dosyaları yükleyebilirsiniz.'));
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

// Kullanıcı silme
app.delete('/users/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token gerekli');
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err || !decoded.isAdmin) {
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
});

// İş silme endpoint'i
app.delete('/tasks/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const taskId = req.params.id;

  if (!token) {
    return res.status(401).send('Token gerekli');
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).send('Yetkisiz');
    }

    const userId = decoded.id; // Token'dan kullanıcının ID'sini al

    // İşin kim tarafından oluşturulduğunu bul
    const findTaskSql = 'SELECT created_by FROM tasks WHERE id = ?';
    db.query(findTaskSql, [taskId], (err, results) => {
      if (err) {
        return res.status(500).send('İş bulunamadı');
      }

      if (results.length === 0) {
        return res.status(404).send('İş bulunamadı');
      }

      const creatorId = results[0].created_by;

      // Admin veya işin sahibi mi kontrol et
      if (!decoded.isAdmin && userId !== creatorId) {
        return res.status(403).send('Sadece kendi oluşturduğunuz işi silebilirsiniz!');
      }

      // İşin silinmesi
      const deleteTaskSql = 'DELETE FROM tasks WHERE id = ?';
      db.query(deleteTaskSql, [taskId], (err) => {
        if (err) {
          return res.status(500).send('İş silinirken hata oluştu');
        }

        // Kullanıcı adını almak için
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
});





// Profil bilgilerini alma
app.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Token gerekli');
  }
  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Yetkisiz');
    }

    const userId = decoded.id;

    const sql = 'SELECT id, name, email, isAdmin, photoUrl, cvUrl FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
      if (err) {
        return res.status(500).send('Kullanıcı bilgileri alınamadı');
      }
      if (results.length === 0) {
        return res.status(404).send('Kullanıcı bulunamadı');
      }
      
      res.json(results[0]); // ID'yi de içeren profil bilgilerini gönder
    });
  });
});

// Profil fotoğrafı yükleme
app.post('/upload-profile-photo', uploadProfileCv.single('photo'), (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Token gerekli');
  }
  const token = authHeader.split(' ')[1];

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
app.post('/upload-cv', uploadProfileCv.single('cv'), (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Token gerekli');
  }
  const token = authHeader.split(' ')[1];

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

// Kullanıcıları listeleme
app.get('/users', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Token'ı al

  if (!token) {
    return res.status(401).send('Token gerekli');
  }

  // Token'ı doğrula
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Yetkisiz'); // Yetki hatası
    }

    // Kullanıcıları veritabanından al
    const sql = 'SELECT id, name, email, photoUrl, cvUrl, (id = 1) AS isAdmin FROM users'; // Burada admin kontrolü yapılıyor
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Veri çekme hatası:', err);
        return res.status(500).send('Kullanıcılar alınamadı'); // İç sunucu hatası
      }
      res.json(results); // Kullanıcıları JSON formatında döndür
    });
  });
});

// Görev oluşturma endpoint'i
app.post('/tasks', uploadTasks.single('image'), (req, res) => {
  const { title, status, details, createdBy } = req.body;
  const imageUrl = req.file ? `/uploads/tasks/${req.file.filename}` : null;

  if (!title || !status || !details || !createdBy) {
    return res.status(400).send('Eksik veri gönderildi');
  }

  const sql = 'INSERT INTO tasks (title, status, created_by, details, imageUrl) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [title, status, createdBy, details, imageUrl], (err, result) => {
    if (err) {
      console.error('Görev oluşturulurken hata oluştu:', err);
      return res.status(500).send('Görev oluşturulurken hata oluştu');
    }
    res.status(201).send('Görev başarıyla oluşturuldu');
  });
});


// Görevleri listeleme endpoint'i
app.get('/tasks', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token gerekli');
  }

  jwt.verify(token, 'secret_key', async (err, decoded) => {
    if (err) {
      return res.status(401).send('Yetkisiz');
    }

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

        // Fotoğraf URL'lerini dizi olarak ayır
        const imageUrl = task.imageUrl ? task.imageUrl.split(',') : [];

        return {
          id: task.id,
          title: task.title,
          status: task.status,
          creatorName: userResult[0]?.name || 'Bilinmeyen Kullanıcı',
          createdAt: task.created_at,
          details: task.details,
          imageUrl // Fotoğraf URL'lerini ekle
        };
      }));

      res.json(tasksWithUserInfo);
    });
  });
});



app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
