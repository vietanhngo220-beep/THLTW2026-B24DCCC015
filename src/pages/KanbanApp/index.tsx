import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, Menu, Card, Row, Col, Typography, Statistic, Table, Tag, 
  Button, Modal, Form, Input, Select, DatePicker, Space, Badge, Popconfirm
} from 'antd';
import { 
  DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided 
} from 'react-beautiful-dnd';
import { 
  DashboardOutlined, 
  ProjectOutlined, 
  UnorderedListOutlined, 
  PlusOutlined, 
  CheckCircleOutlined, 
  AlertOutlined,
  ContainerOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  status: 'Todo' | 'Doing' | 'Done';
  tags: string[];
}

const KanbanApp = () => {
  const [view, setView] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const savedTasks = localStorage.getItem('kanban_data');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kanban_data', JSON.stringify(tasks));
  }, [tasks]);

  const handleSaveTask = (values: any) => {
    const taskData: Task = {
      ...values,
      id: editingTask?.id || Date.now().toString(),
      deadline: values.deadline.format('YYYY-MM-DD'),
      status: editingTask?.status || 'Todo',
      tags: values.tags || [],
    };

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      setTasks([...tasks, taskData]);
    }
    setIsModalOpen(false);
    setEditingTask(null);
    form.resetFields();
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Task['status'];
    
    setTasks(prev => prev.map(task => 
      task.id === draggableId ? { ...task, status: newStatus } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      deadline: dayjs(task.deadline)
    });
    setIsModalOpen(true);
  };

  const DashboardView = () => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'Done').length;
    const overdue = tasks.filter(t => t.status !== 'Done' && dayjs(t.deadline).isBefore(dayjs(), 'day')).length;

    return (
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="Tổng số Task" value={total} prefix={<ContainerOutlined style={{color: '#1890ff'}} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="Hoàn thành" value={done} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="Quá hạn" value={overdue} valueStyle={{ color: '#cf1322' }} prefix={<AlertOutlined />} />
          </Card>
        </Col>
      </Row>
    );
  };

  const KanbanView = () => {
    const columns = [
      { id: 'Todo', title: 'CẦN LÀM', color: '#d9d9d9' },
      { id: 'Doing', title: 'ĐANG LÀM', color: '#1890ff' },
      { id: 'Done', title: 'HOÀN THÀNH', color: '#52c41a' },
    ];

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={16} style={{ minHeight: '70vh' }}>
          {columns.map(col => (
            <Col span={8} key={col.id}>
              <div style={{ background: '#f0f2f5', padding: 12, borderRadius: 8, minHeight: '100%' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>{col.title}</Text>
                  <Badge count={tasks.filter(t => t.status === col.id).length} showZero color={col.color} />
                </div>
                <Droppable droppableId={col.id}>
                  {(provided: DroppableProvided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: 400 }}>
                      {tasks.filter(t => t.status === col.id).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided: DraggableProvided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              size="small"
                              style={{ marginBottom: 12, ...provided.draggableProps.style }}
                              actions={[
                                <EditOutlined key="edit" onClick={() => openEditModal(task)} />,
                                <Popconfirm title="Xóa task?" onConfirm={() => deleteTask(task.id)}>
                                  <DeleteOutlined key="delete" style={{ color: 'red' }} />
                                </Popconfirm>
                              ]}
                            >
                              <Tag color={task.priority === 'Cao' ? 'red' : task.priority === 'Trung bình' ? 'orange' : 'blue'} style={{ marginBottom: 8 }}>
                                {task.priority}
                              </Tag>
                              <br />
                              <Text strong>{task.title}</Text>
                              <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                                Deadline: {task.deadline}
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </Col>
          ))}
        </Row>
      </DragDropContext>
    );
  };

  const ListView = () => {
    const columns = [
      { title: 'Tên công việc', dataIndex: 'title', key: 'title' },
      { 
        title: 'Trạng thái', 
        dataIndex: 'status', 
        key: 'status',
        filters: [{ text: 'Todo', value: 'Todo' }, { text: 'Doing', value: 'Doing' }, { text: 'Done', value: 'Done' }],
        onFilter: (value: any, record: any) => record.status === value,
        render: (s: string) => <Tag color={s === 'Done' ? 'green' : 'blue'}>{s}</Tag>
      },
      { title: 'Ưu tiên', dataIndex: 'priority', key: 'priority' },
      { 
        title: 'Deadline', 
        dataIndex: 'deadline', 
        key: 'deadline',
        sorter: (a: any, b: any) => dayjs(a.deadline).unix() - dayjs(b.deadline).unix()
      },
      {
        title: 'Thao tác',
        render: (_: any, record: Task) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
            <Popconfirm title="Xóa?" onConfirm={() => deleteTask(record.id)}>
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        )
      }
    ];
    return <Table dataSource={tasks} columns={columns} rowKey="id" />;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>TASK MANAGER</Title>
        </div>
        <Menu mode="inline" selectedKeys={[view]} onClick={({ key }) => setView(key)}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="kanban" icon={<ProjectOutlined />}>Kanban Board</Menu.Item>
          <Menu.Item key="list" icon={<UnorderedListOutlined />}>Danh sách</Menu.Item>
        </Menu>
      </Sider>
      
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>{view.toUpperCase()}</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTask(null); form.resetFields(); setIsModalOpen(true); }}>
            Thêm Task
          </Button>
        </Header>

        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
          {view === 'dashboard' && <DashboardView />}
          {view === 'kanban' && <KanbanView />}
          {view === 'list' && <ListView />}
        </Content>
      </Layout>

      <Modal title={editingTask ? "Sửa Task" : "Thêm Task"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSaveTask}>
          <Form.Item name="title" label="Tên công việc" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="deadline" label="Hạn chót" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="priority" label="Ưu tiên" initialValue="Trung bình"><Select options={[{ value: 'Cao' }, { value: 'Trung bình' }, { value: 'Thấp' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="tags" label="Tags"><Select mode="tags" /></Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default KanbanApp;