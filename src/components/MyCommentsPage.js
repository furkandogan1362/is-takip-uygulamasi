import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyCommentsPage.css';

function MyCommentsPage() {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});

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

  if (loading) {
    return <div className="loading-message">Yorumlar yükleniyor...</div>;
  }

  return (
    <div className="my-comments-page">
      <div className="my-comments-header">Yorumlarım</div>
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