import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsApi } from '../api/posts';
import { Post } from '../types/post';
import { PostCard } from '../components/posts/PostCard';
import { Spinner } from '../components/common/Spinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { Button } from '../components/common/Button';
import { ArrowLeft } from 'lucide-react';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);

    const fetchPost = async () => {
      try {
        const data = await postsApi.getPost(id);
        if (isMounted) setPost(data);
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Post not found';
          setError(message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPost();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Spinner />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="content-feed">
        <ErrorAlert message={error || 'Post not found'} />
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft size={16} />}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="content-feed">
      <div style={{ marginBottom: '16px' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back
        </Button>
      </div>

      <PostCard post={post} onPostDeleted={() => navigate('/')} />
    </div>
  );
};
