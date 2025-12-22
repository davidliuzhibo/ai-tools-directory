'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { TextArea } = Input;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  teamOrigin: string;
  pricingType: string;
  rankingScore: number;
  isPublished: boolean;
  isFeatured: boolean;
  dataSource: string | null;
  category: Category;
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTools();
    fetchCategories();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/tools');
      const data = await response.json();
      setTools(data);
    } catch (error) {
      message.error('获取工具列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      message.error('获取分类列表失败');
    }
  };

  const handleAdd = () => {
    setEditingTool(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    form.setFieldsValue({
      ...tool,
      categoryId: tool.category.id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/tools/${id}`, {
        method: 'DELETE',
      });
      message.success('删除成功');
      fetchTools();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const url = editingTool
        ? `/api/admin/tools/${editingTool.id}`
        : '/api/admin/tools';

      const method = editingTool ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(editingTool ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchTools();
      } else {
        const error = await response.json();
        message.error(error.error || '操作失败');
      }
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  const columns: ColumnsType<Tool> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 120,
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 100,
    },
    {
      title: '数据来源',
      dataIndex: 'dataSource',
      key: 'dataSource',
      width: 100,
      render: (value: string | null) => {
        const sourceMap: any = {
          MANUAL: { text: '手动', color: 'blue' },
          WAYTOAGI: { text: 'WaytoAGI', color: 'green' },
          SCRAPER: { text: '爬虫', color: 'orange' },
        };
        const source = sourceMap[value || 'MANUAL'] || sourceMap.MANUAL;
        return <Tag color={source.color}>{source.text}</Tag>;
      },
    },
    {
      title: '团队',
      dataIndex: 'teamOrigin',
      key: 'teamOrigin',
      width: 100,
      render: (value: string) => {
        const colorMap: any = {
          DOMESTIC: 'red',
          OUTBOUND: 'orange',
          OVERSEAS: 'blue',
        };
        return <Tag color={colorMap[value]}>{value}</Tag>;
      },
    },
    {
      title: '定价',
      dataIndex: 'pricingType',
      key: 'pricingType',
      width: 100,
    },
    {
      title: '评分',
      dataIndex: 'rankingScore',
      key: 'rankingScore',
      width: 80,
      render: (value: number) => value.toFixed(1),
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      render: (_: any, record: Tool) => (
        <Space>
          <Tag color={record.isPublished ? 'green' : 'default'}>
            {record.isPublished ? '已发布' : '未发布'}
          </Tag>
          {record.isFeatured && <Tag color="gold">精选</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: any, record: Tool) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个工具吗？"
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>工具管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          添加工具
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tools}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={editingTool ? '编辑工具' : '添加工具'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="工具名称"
            rules={[{ required: true, message: '请输入工具名称' }]}
          >
            <Input placeholder="例如: ChatGPT" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="URL Slug"
            rules={[{ required: true, message: '请输入 URL slug' }]}
          >
            <Input placeholder="例如: chatgpt" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="选择分类">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="简短描述">
            <TextArea rows={3} placeholder="简短描述工具功能" />
          </Form.Item>

          <Form.Item name="websiteUrl" label="官网链接">
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item name="logoUrl" label="Logo URL">
            <Input placeholder="https://example.com/logo.png" />
          </Form.Item>

          <Form.Item
            name="teamOrigin"
            label="团队来源"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="DOMESTIC">国内团队</Select.Option>
              <Select.Option value="OUTBOUND">出海团队</Select.Option>
              <Select.Option value="OVERSEAS">海外团队</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dataSource"
            label="数据来源"
            initialValue="MANUAL"
          >
            <Select>
              <Select.Option value="MANUAL">手动添加</Select.Option>
              <Select.Option value="WAYTOAGI">WaytoAGI导入</Select.Option>
              <Select.Option value="SCRAPER">爬虫采集</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="pricingType"
            label="定价类型"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="FREE">免费</Select.Option>
              <Select.Option value="PAID">付费</Select.Option>
              <Select.Option value="FREEMIUM">部分免费</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="rankingScore" label="排名分数" initialValue={0}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="isPublished"
            label="发布状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="已发布" unCheckedChildren="未发布" />
          </Form.Item>

          <Form.Item
            name="isFeatured"
            label="精选推荐"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
