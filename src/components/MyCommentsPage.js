import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyCommentsPage.css';

function MyCommentsPage() {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 8;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/my-comments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComments(response.data);
      } catch (error) {
        console.error('Yorumlar alınırken hata oluştu:', error);
        setError('Yorumlar alınırken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const deleteComment = async (commentId) => {
    if (window.confirm('Bu yorumu gerçekten silmek istiyor musunuz?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/comments/${commentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComments(comments.filter(comment => comment.commentId !== commentId));
        setSuccessMessage('Yorum başarıyla silindi.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (error) {
        console.error('Yorum silinirken hata oluştu:', error);
        setError('Yorum silinirken hata oluştu');
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  if (loading) {
    return <div className="loading-message">Yorumlar yükleniyor...</div>;
  }

  return (
    <div className="my-comments-page">
      <div className="my-comments-header">Yorumlarım</div>
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✔️</span>
          {successMessage}
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      {currentComments.length > 0 ? (
        <div className="comment-grid">
          {currentComments.map((comment) => (
            <div key={comment.commentId} className={`comment-card ${comment.commentStatus.toLowerCase()}`}>
              <div className="comment-card-inner">
                <h3>{comment.commentTitle}</h3>
                <p><strong>İş ID:</strong> {comment.taskId}</p>
                <p><strong>İş Başlığı:</strong> {comment.taskTitle}</p>
                <p><strong>İşin Sahibi:</strong> {comment.taskCreatorName}</p>
                <p><strong>Yorum Yapan:</strong> {comment.commentAuthorName}</p>
                <p><strong>Yorum Tarihi:</strong> {new Date(comment.commentCreatedAt).toLocaleString()}</p>
                <p><strong>Durum:</strong> {comment.commentStatus}</p>
                <div className="comment-content-iki">
                  <p><strong>Yorum İçeriği:</strong></p>
                  {expandedComments[comment.commentId] ? (
                    <div>
                      <p>{comment.commentContent}</p>
                      <button 
                        className="toggle-expand" 
                        onClick={() => toggleCommentExpansion(comment.commentId)}
                      >
                        Daha Az
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p>{comment.commentContent.slice(0, 100)}</p>
                      {comment.commentContent.length > 100 && (
                        <button 
                          className="toggle-expand" 
                          onClick={() => toggleCommentExpansion(comment.commentId)}
                        >
                          Daha Fazla
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="button-container">
                  <button 
                    className="delete-button-comm" 
                    onClick={() => deleteComment(comment.commentId)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Henüz yorumunuz yok.</p>
      )}

      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Önceki
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button 
            key={index + 1} 
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}

export default MyCommentsPage;
