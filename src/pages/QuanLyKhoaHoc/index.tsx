import React, { useState } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, 
  InputNumber, Space, Tag, Popconfirm, message, Card, Row, Col 
} from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

interface CourseItem {
  id: string;
  name: string;
  lecturer: string;
  studentCount: number;
  status: string;
  description?: string;
}

const STATUS_ENUM = {
  OPEN: 'Đang mở',
  CLOSED: 'Đã kết thúc',
  PAUSED: 'Tạm dừng'
};

const LECTURERS = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Minh D'];

const QuanLyKhoaHocOnline: React.FC = () => {
  const [courses, setCourses] = useState<CourseItem[]>([
    {
      id: 'K001',
      name: 'Lập trình React cơ bản',
      lecturer: 'Nguyễn Văn A',
      studentCount: 0,
      status: STATUS_ENUM.OPEN,
      description: 'Khóa học cơ bản'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterLecturer, setFilterLecturer] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleOpenModal = (course: CourseItem | null = null) => {
    setEditingCourse(course);
    if (course) {
      form.setFieldsValue(course);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const isDuplicateId = courses.some(c => 
        c.id === values.id && (!editingCourse || c.id !== editingCourse.id)
      );

      const isDuplicateName = courses.some(c => 
        c.name.toLowerCase() === values.name.toLowerCase() && 
        (!editingCourse || c.id !== editingCourse.id)
      );

      if (isDuplicateId) {
        message.error('ID khóa học đã tồn tại!');
        return;
      }

      if (isDuplicateName) {
        message.error('Tên khóa học đã tồn tại!');
        return;
      }

      if (editingCourse) {
        setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...values } : c));
        message.success('Cập nhật thành công');
      } else {
        setCourses([...courses, values]);
        message.success('Thêm mới thành công');
      }
      setIsModalVisible(false);
    });
  };

  const handleDelete = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    message.success('Xóa khóa học thành công');
  };

  const filteredData = courses.filter(item => {
    const matchName = item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchLecturer = filterLecturer ? item.lecturer === filterLecturer : true;
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    return matchName && matchLecturer && matchStatus;
  });

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id' 
    },
    { 
      title: 'Tên khóa học', 
      dataIndex: 'name', 
      key: 'name' 
    },
    { 
      title: 'Giảng viên', 
      dataIndex: 'lecturer', 
      key: 'lecturer' 
    },
    { 
      title: 'Số lượng học viên', 
      dataIndex: 'studentCount', 
      key: 'studentCount',
      sorter: (a: CourseItem, b: CourseItem) => a.studentCount - b.studentCount,
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = status === STATUS_ENUM.OPEN ? 'green' : status === STATUS_ENUM.PAUSED ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: CourseItem) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm
            title="Xác nhận xóa khóa học này?"
            onConfirm={() => handleDelete(record.id)}
            disabled={record.studentCount > 0}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              disabled={record.studentCount > 0} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="QUẢN LÝ KHÓA HỌC ONLINE">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input 
              placeholder="Tìm tên khóa học" 
              prefix={<SearchOutlined />} 
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={5}>
            <Select placeholder="Lọc giảng viên" style={{ width: '100%' }} allowClear onChange={setFilterLecturer}>
              {LECTURERS.map(l => <Option key={l} value={l}>{l}</Option>)}
            </Select>
          </Col>
          <Col span={5}>
            <Select placeholder="Lọc trạng thái" style={{ width: '100%' }} allowClear onChange={setFilterStatus}>
              {Object.values(STATUS_ENUM).map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
              Thêm khóa học
            </Button>
          </Col>
        </Row>

        <Table columns={columns} dataSource={filteredData} rowKey="id" />

        <Modal
          title={editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
          visible={isModalVisible}
          onOk={handleSave}
          onCancel={() => setIsModalVisible(false)}
          width={700}
        >
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="id"
                  label="ID khóa học"
                  rules={[{ required: true, message: 'Nhập ID!' }]}
                >
                  <Input disabled={!!editingCourse} placeholder="Ví dụ: K001" />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  name="name"
                  label="Tên khóa học"
                  rules={[{ required: true, message: 'Nhập tên!' }, { max: 100, message: 'Tối đa 100 ký tự!' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="lecturer" label="Giảng viên" rules={[{ required: true }]}>
                  <Select>
                    {LECTURERS.map(l => <Option key={l} value={l}>{l}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="studentCount" label="Số lượng học viên" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select>
                {Object.values(STATUS_ENUM).map(s => <Option key={s} value={s}>{s}</Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="description" label="Mô tả khóa học">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default QuanLyKhoaHocOnline;