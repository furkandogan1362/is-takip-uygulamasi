import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentsTable.css';

function CommentsTable() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newComment, setNewComment] = useState({
    jobId: '',
    title: '',
    content: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Yeni');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const sortedJobs = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(sortedJobs);
        setFilteredJobs(sortedJobs.filter(job => job.status === 'Yeni'));
      } catch (error) {
        console.error('İş tablosu verileri alınamadı:', error);
        setError('İş tablosu verileri alınamadı');
      }
    };

    fetchJobs();
  }, []);

  const handleExpandClick = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  useEffect(() => {
    // Filtreleme işlemi
    const filterJobs = () => {
      let filtered = jobs.filter(job => job.status === filterStatus);
      if (searchTerm) {
        filtered = filtered.filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setFilteredJobs(filtered);
    };
    filterJobs();
  }, [searchTerm, filterStatus, jobs]);

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

      const updatedJobsResponse = await axios.get('http://localhost:5000/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedJobs = updatedJobsResponse.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setJobs(updatedJobs);

      setNewComment({
        jobId: '',
        title: '',
        content: ''
      });

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

  const togglePopover = () => {
    setIsPopoverOpen(prev => !prev);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    togglePopover();
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
      
      {/* Arama ve Filtre Butonu */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Başlıkla ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button className="filter-button" onClick={togglePopover}>
          Filtrele
        </button>
        {isPopoverOpen && (
          <div className="filter-popover">
            <button onClick={() => handleFilterChange('Yeni')}>Yeni</button>
            <button onClick={() => handleFilterChange('Tamamlandı')}>Tamamlandı</button>
            <button onClick={() => handleFilterChange('Silindi')}>Silinen</button>
          </div>
        )}
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
                <th>Yorumlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
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
                    <td className="details-comm">
                      {expandedJobId === job.id ? (
                        <div>
                          {job.details}
                          <button onClick={() => handleExpandClick(job.id)} className="expand-button-comm">Daralt</button>
                        </div>
                      ) : (
                        <div>
                          {job.details.length > 100 ? (
                            <div>
                              {job.details.substring(0, 100)}...
                              <button onClick={() => handleExpandClick(job.id)} className="expand-button-comm">Daha Fazla Gör</button>
                            </div>
                          ) : (
                            job.details
                          )}
                        </div>
                      )}
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
                  <td colSpan="8">Filtreye uygun iş bulunamadı!...</td>
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
