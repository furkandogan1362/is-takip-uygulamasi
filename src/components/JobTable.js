import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JobTable.css';

function JobTable() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null); // Hangi işin detayının genişletildiğini tutacak state

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setJobs(response.data);
      } catch (error) {
        console.error('İş tablosu verileri alınamadı:', error);
        setError('İş tablosu verileri alınamadı');
      }
    };

    fetchJobs();
  }, []);

  const handleImageClick = (imageUrl) => {
    window.open(`http://localhost:5000${imageUrl}`, '_blank'); // Fotoğrafı yeni sekmede aç
  };

  // Detayları genişletmek ve daraltmak için kullanılan fonksiyon
  const toggleExpand = (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null); // Aynı iş tıklanırsa daralt
    } else {
      setExpandedJobId(jobId); // Yeni iş tıklanırsa genişlet
    }
  };

  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="job-table-container">
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
                          Fotoğraf {index + 1}
                        </button>
                      ))
                    ) : (
                      <p>Fotoğraf yok</p>
                    )}
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
