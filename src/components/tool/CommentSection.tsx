'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  List,
  Avatar,
  Button,
  Input,
  message,
  Space,
  Popconfirm,
  Typography,
} from 'antd';
import { UserOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { TextArea } = Input;
const { Title, Text } = Typography;

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  toolId: string;
}

export default function CommentSection({ toolId }: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [toolId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comments?toolId=${toolId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      message.error('加载评论失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!session) {
      message.warning('请先登录');
      router.push('/auth/signin');
      return;
    }

    if (!content.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          content: content.trim(),
        }),
      });

      if (response.ok) {
        message.success('评论成功');
        setContent('');
        fetchComments();
      } else {
        const error = await response.json();
        message.error(error.error || '评论失败');
      }
    } catch (error) {
      message.error('评论失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      message.warning('请先登录');
      router.push('/auth/signin');
      return;
    }

    if (!replyContent.trim()) {
      message.warning('请输入回复内容');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          content: replyContent.trim(),
          parentId,
        }),
      });

      if (response.ok) {
        message.success('回复成功');
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      } else {
        const error = await response.json();
        message.error(error.error || '回复失败');
      }
    } catch (error) {
      message.error('回复失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('删除成功');
        fetchComments();
      } else {
        const error = await response.json();
        message.error(error.error || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请稍后重试');
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <List.Item
      key={comment.id}
      className={isReply ? 'ml-12' : ''}
      actions={[
        !isReply && (
          <Button
            type="link"
            icon={<MessageOutlined />}
            onClick={() => setReplyingTo(comment.id)}
          >
            回复
          </Button>
        ),
        session?.user?.id === comment.user.id && (
          <Popconfirm
            title="确定删除这条评论吗？"
            onConfirm={() => handleDeleteComment(comment.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        ),
      ].filter(Boolean)}
    >
      <List.Item.Meta
        avatar={
          <Avatar src={comment.user.image} icon={<UserOutlined />} />
        }
        title={
          <Space>
            <Text strong>{comment.user.name || '匿名用户'}</Text>
            <Text type="secondary" className="text-sm">
              {dayjs(comment.createdAt).fromNow()}
            </Text>
          </Space>
        }
        description={<div className="whitespace-pre-wrap">{comment.content}</div>}
      />
    </List.Item>
  );

  return (
    <Card className="mt-8">
      <Title level={3}>评论 ({comments.length})</Title>

      {/* 发表评论 */}
      <div className="mb-6">
        <TextArea
          rows={4}
          placeholder={session ? '写下你的评论...' : '请先登录后再评论'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!session}
        />
        <div className="mt-2 text-right">
          <Button
            type="primary"
            onClick={handleSubmitComment}
            loading={submitting}
            disabled={!session}
          >
            发表评论
          </Button>
        </div>
      </div>

      {/* 评论列表 */}
      <List
        loading={loading}
        dataSource={comments}
        renderItem={(comment) => (
          <div key={comment.id}>
            {renderComment(comment)}

            {/* 回复列表 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-12 mb-4">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}

            {/* 回复输入框 */}
            {replyingTo === comment.id && (
              <div className="ml-12 mb-4">
                <TextArea
                  rows={3}
                  placeholder="写下你的回复..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  autoFocus
                />
                <div className="mt-2 text-right">
                  <Space>
                    <Button onClick={() => setReplyingTo(null)}>取消</Button>
                    <Button
                      type="primary"
                      onClick={() => handleSubmitReply(comment.id)}
                      loading={submitting}
                    >
                      回复
                    </Button>
                  </Space>
                </div>
              </div>
            )}
          </div>
        )}
      />
    </Card>
  );
}
