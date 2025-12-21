'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
  Popconfirm,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface UseCase {
  id: string;
  title: string;
  description: string | null;
  contentType: 'TEXT' | 'IMAGE' | 'VIDEO';
  contentUrl: string | null;
  thumbnailUrl: string | null;
  order: number;
  createdAt: string;
  categories: {
    id: string;
    name: string;
    icon: string | null;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface Tool {
  id: string;
  name: string;
  slug: string;
}

const contentTypeConfig = {
  TEXT: { icon: <FileTextOutlined />, label: '文字教程', color: 'blue' },
  IMAGE: { icon: <PictureOutlined />, label: '图文案例', color: 'green' },
  VIDEO: { icon: <PlayCircleOutlined />, label: '视频教程', color: 'red' },
};

export default function UseCasesPage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUseCase, setEditingUseCase] = useState<UseCase | null>(null);
  const [form] = Form.useForm();

  const fetchUseCases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/use-cases');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setUseCases(data.useCases);
    } catch (error) {
      message.error('获取使用案例失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      message.error('获取分类失败');
    }
  };

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTools(data.tools);
    } catch (error) {
      message.error('获取工具失败');
    }
  };

  useEffect(() => {
    fetchUseCases();
    fetchCategories();
    fetchTools();
  }, []);

  const handleCreate = () => {
    setEditingUseCase(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: UseCase) => {
    setEditingUseCase(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      contentType: record.contentType,
      contentUrl: record.contentUrl,
      thumbnailUrl: record.thumbnailUrl,
      categoryId: record.categories.id,
      order: record.order,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/use-cases/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      message.success('删除成功');
      fetchUseCases();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const url = editingUseCase
        ? `/api/admin/use-cases/${editingUseCase.id}`
        : '/api/admin/use-cases';

      const response = await fetch(url, {
        method: editingUseCase ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          relatedToolIds: values.relatedToolIds || [],
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      message.success(editingUseCase ? '更新成功' : '创建成功');
      setModalVisible(false);
      form.resetFields();
      fetchUseCases();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const columns: ColumnsType<UseCase> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'contentType',
      key: 'contentType',
      width: 120,
      render: (type: keyof typeof contentTypeConfig) => {
        const config = contentTypeConfig[type];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '分类',
      dataIndex: 'categories',
      key: 'categories',
      width: 150,
      render: (categories: { name: string; icon: string | null }) => (
        <span>
          {categories.icon} {categories.name}
        </span>
      ),
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此使用案例？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="使用案例管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建案例
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={useCases}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingUseCase ? '编辑使用案例' : '新建使用案例'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入使用案例标题" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <TextArea rows={3} placeholder="请输入简短描述" />
          </Form.Item>

          <Form.Item
            label="内容类型"
            name="contentType"
            rules={[{ required: true, message: '请选择内容类型' }]}
          >
            <Select placeholder="请选择内容类型">
              <Select.Option value="TEXT">
                <FileTextOutlined /> 文字教程
              </Select.Option>
              <Select.Option value="IMAGE">
                <PictureOutlined /> 图文案例
              </Select.Option>
              <Select.Option value="VIDEO">
                <PlayCircleOutlined /> 视频教程
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="缩略图 URL" name="thumbnailUrl">
            <Input placeholder="请输入缩略图 URL" />
          </Form.Item>

          <Form.Item label="内容 URL" name="contentUrl">
            <Input placeholder="请输入图片或视频 URL" />
          </Form.Item>

          <Form.Item label="文字内容" name="textContent">
            <TextArea
              rows={6}
              placeholder="支持 HTML 格式（用于文字教程类型）"
            />
          </Form.Item>

          <Form.Item
            label="所属分类"
            name="categoryId"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="关联工具" name="relatedToolIds">
            <Select
              mode="multiple"
              placeholder="选择相关工具（可选）"
              showSearch
              optionFilterProp="children"
            >
              {tools.map((tool) => (
                <Select.Option key={tool.id} value={tool.id}>
                  {tool.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="排序" name="order" initialValue={0}>
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
