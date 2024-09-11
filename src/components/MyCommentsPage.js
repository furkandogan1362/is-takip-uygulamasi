import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyCommentsPage.css';

function MyCommentsPage() {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

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

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
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
        setTimeout(() => setSuccessMessage(''), 3000); // 3 saniye sonra mesajı temizle
      } catch (error) {
        console.error('Yorum silinirken hata oluştu:', error);
        setError('Yorum silinirken hata oluştu');
      }
    }
  };

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
      {comments.length > 0 ? (
        <div className="comment-grid">
          {comments.map((comment) => (
            <div key={comment.commentId} className={`comment-card ${comment.commentStatus.toLowerCase()}`}>
              <div className="comment-card-inner">
                <h3>{comment.commentTitle}</h3>
                <p><strong>İş ID:</strong> {comment.taskId}</p>
                <p><strong>İş Başlığı:</strong> {comment.taskTitle}</p>
                <p><strong>İşin Sahibi:</strong> {comment.taskCreatorName}</p>
                <p><strong>Yorum Yapan:</strong> {comment.commentAuthorName}</p>
                <p><strong>Yorum Tarihi:</strong> {new Date(comment.commentCreatedAt).toLocaleString()}</p>
                <p><strong>Durum:</strong> {comment.commentStatus}</p>
                <p><strong>Yorum İçeriği:</strong></p>
                <div className="comment-content">
                  {expandedComments[comment.commentId] 
                    ? comment.commentContent
                    : truncateText(comment.commentContent)}
                  {comment.commentContent.length > 100 && (
                    <button 
                      className="toggle-expand" 
                      onClick={() => toggleCommentExpansion(comment.commentId)}
                    >
                      {expandedComments[comment.commentId] ? 'Daha az' : 'Daha fazla'}
                    </button>
                  )}
                </div>
                <button 
                  className="delete-button" 
                  onClick={() => deleteComment(comment.commentId)}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Henüz yorumunuz yok.</p>
      )}
    </div>
  );
}

export default MyCommentsPage;
