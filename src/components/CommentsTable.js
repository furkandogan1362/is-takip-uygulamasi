import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentsTable.css';

function CommentsTable() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // Başarı mesajı için eklenen state
  const [newComment, setNewComment] = useState({
    jobId: '',
    title: '',
    content: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('API yanıtı:', response.data); // API yanıtını kontrol edin
        const sortedJobs = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(sortedJobs);
      } catch (error) {
        console.error('İş tablosu verileri alınamadı:', error);
        setError('İş tablosu verileri alınamadı');
      }
    };

    fetchJobs();
  }, []);

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setNewComment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddComment = async () => {
    if (!newComment.jobId || !newComment.title || !newComment.content) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/comments', newComment, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Yorum eklendikten sonra job'ı yeniden al
      const updatedJobsResponse = await axios.get('http://localhost:5000/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Güncellenmiş API yanıtı:', updatedJobsResponse.data); // Güncellenmiş yanıtı kontrol edin
      const updatedJobs = updatedJobsResponse.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setJobs(updatedJobs);

      setNewComment({
        jobId: '',
        title: '',
        content: ''
      });

      // Başarı mesajını ayarla
      setSuccess('Yorum başarıyla eklendi');
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (error) {
      console.error('Yorum eklenirken hata oluştu:', error);
      setError('Yorum eklenirken hata oluştu');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <div className="comments-table-container">
      {/* Hata ve başarı mesajları */}
      <div className={`error-message ${error ? 'show' : ''}`}>
        {error}
      </div>
      <div className={`success-message ${success ? 'show' : ''}`}>
        {success}
      </div>
      <div className="comments-table">
        <h2>İş Tablosu ve Yorumlar</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Başlık</th>
                <th>Durum</th>
                <th>Oluşturan Kullanıcı</th>
                <th>Oluşturma Tarihi</th>
                <th>Detay</th>
                <th>Fotoğraflar</th>
                <th>Yorumlar</th> {/* Yorumlar sütunu başlığı */}
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className={
                      job.status === 'Yeni'
                        ? 'status-new'
                        : job.status === 'Tamamlandı'
                        ? 'status-completed'
                        : 'status-deleted'
                    }
                  >
                    <td>{job.id}</td>
                    <td>{job.title}</td>
                    <td>{job.status}</td>
                    <td>{job.creatorName}</td>
                    <td>
                      {new Date(job.createdAt).toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}
                    </td>
                    <td className="details">
                      {job.details}
                    </td>
                    <td>
                      {job.imageUrl && job.imageUrl.length > 0 ? (
                        job.imageUrl.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => window.open(`http://localhost:5000${url}`, '_blank')}
                            className="image-button"
                          >
                            Detaylar Fotoğrafı {index + 1}
                          </button>
                        ))
                      ) : (
                        <p>Fotoğraf yok</p>
                      )}
                    </td>
                    <td>
                      {job.comment_count > 0 ? (
                        <p>{job.comment_count} yorum</p>
                      ) : (
                        <p>Yorum yok</p>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">Yükleniyor...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Yorum ekleme formu */}
        <div className="comment-form">
          <h2>Yorum Ekle</h2>
          <label>
            İş ID:
            <input
              type="text"
              name="jobId"
              value={newComment.jobId}
              onChange={handleCommentChange}
            />
          </label>
          <label>
            Başlık:
            <input
              type="text"
              name="title"
              value={newComment.title}
              onChange={handleCommentChange}
            />
          </label>
          <label>
            İçerik:
            <textarea
              name="content"
              value={newComment.content}
              onChange={handleCommentChange}
            />
          </label>
          <button onClick={handleAddComment} className="comment-submit-button">
            Yorum Ekle
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentsTable;
