import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllCommentsPage.css';

function AllCommentsPage() {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 8; // Sayfa başına gösterilecek yorum sayısı

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const userResponse = await axios.get('http://localhost:5000/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsAdmin(userResponse.data.isAdmin);

        const commentsResponse = await axios.get('http://localhost:5000/all-comments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Yorumlar alınırken hata oluştu:', error);
        setError('Yorumlar alınırken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  const handleDelete = async (commentId) => {
    const confirmed = window.confirm('Bu yorumu silmek istediğinizden emin misiniz?');
    if (!confirmed) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComments(comments.filter(comment => comment.commentId !== commentId));
      setSuccessMessage('Yorum başarıyla silindi.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Yorum silinirken hata oluştu:', error);
      setError('Yorum silinirken hata oluştu');
    }
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div className="loading-message">Yorumlar yükleniyor...</div>;
  }

  return (
    <div className="all-comments-page">
      <h1 className="all-comments-title">Tüm Yorumlar</h1>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {currentComments.length > 0 ? (
        <div className="comment-container">
          <div className="comment-grid">
            {currentComments.map((comment) => (
              <div key={comment.commentId} className={`comment-card ${comment.commentStatus.toLowerCase()}`}>
                <div className="comment-card-content">
                  <h3>{comment.commentTitle}</h3>
                  <p><strong>İş ID:</strong> {comment.taskId}</p>
                  <p><strong>İş Başlığı:</strong> {comment.taskTitle}</p>
                  <p><strong>İşin Sahibi:</strong> {comment.taskCreatorName}</p>
                  <p><strong>Yorum Yapan:</strong> {comment.commentAuthorName}</p>
                  <p><strong>Yorum Tarihi:</strong> {new Date(comment.commentCreatedAt).toLocaleString()}</p>
                  <p><strong>Durum:</strong> {comment.commentStatus}</p>
                  <div className="comment-content">
                    <p><strong>Yorum İçeriği:</strong> 
                      {expandedComments[comment.commentId] 
                        ? comment.commentContent 
                        : comment.commentContent.slice(0, 100) + '...'}
                    </p>
                    {comment.commentContent.length > 100 && (
                      <button 
                        className="toggle-content"
                        onClick={() => toggleCommentExpansion(comment.commentId)}
                      >
                        {expandedComments[comment.commentId] ? 'Daha Az' : 'Daha Fazla'}
                      </button>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="delete-button-wrapper">
                    <button 
                      className="remove-button"
                      onClick={() => handleDelete(comment.commentId)}
                    >
                      Sil
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Henüz yorum bulunmuyor.</p>
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

export default AllCommentsPage;
