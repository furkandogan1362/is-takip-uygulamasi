import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JobTable.css';

function JobTable() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
      } catch (error) {
        console.error('İş tablosu verileri alınamadı:', error);
        setError('İş tablosu verileri alınamadı');
      }
    };

    fetchJobs();
  }, []);

  const handleImageClick = (imageUrl) => {
    window.open(`http://localhost:5000${imageUrl}`, '_blank');
  };

  const toggleExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const handleDeleteJob = async (job) => {
    if (window.confirm('İşi silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:5000/tasks/${job.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSuccessMessage(response.data.message);
        setJobs(jobs.filter(j => j.id !== job.id));

        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setError('Sadece kendi oluşturduğunuz işi silebilirsiniz!');
          const errorElement = document.querySelector('.error-message');
          if (errorElement) {
            errorElement.classList.add('show');
            setTimeout(() => {
              errorElement.classList.remove('show');
            }, 5000);
          }
        } else {
          console.error('İş silinirken hata oluştu:', error);
          setError('İş silinirken hata oluştu');
          setTimeout(() => {
            setError(null);
          }, 5000);
        }
      }
    }
  };

  return (
    <div className="job-table-container">
      <div className={`error-message ${error ? 'show' : ''}`}>
        {error}
      </div>
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">&#10004;</span> {successMessage}
        </div>
      )}
      <div className="job-table">
        <h2>İş Tablosu</h2>
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
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
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
                    {expandedJobId === job.id ? (
                      <div>
                        {job.details}
                        <button onClick={() => toggleExpand(job.id)} className="expand-button">Daralt</button>
                      </div>
                    ) : (
                      <div>
                        {job.details.length > 100 ? (
                          <div>
                            {job.details.substring(0, 100)}...
                            <button onClick={() => toggleExpand(job.id)} className="expand-button">Daha Fazla Gör</button>
                          </div>
                        ) : (
                          job.details
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {job.imageUrl.length > 0 ? (
                      job.imageUrl.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageClick(url)}
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
                    <button
                      onClick={() => handleDeleteJob(job)}
                      className="delete-button"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default JobTable;
