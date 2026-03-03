import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, message, List, Progress } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const StudyApp = () => {
  // 1. Khai báo State
  const [categories, setCategories] = useState<string[]>(['Toán', 'Văn', 'Anh']);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogModal, setIsLogModal] = useState(false);
  const [form] = Form.useForm();

  // 2. Load và Save LocalStorage
  useEffect(() => {
    const data = localStorage.getItem('study_data');
    const cats = localStorage.getItem('study_cats');
    if (data) setLogs(JSON.parse(data));
    if (cats) setCategories(JSON.parse(cats));
  }, []);

  useEffect(() => {
    localStorage.setItem('study_data', JSON.stringify(logs));
    localStorage.setItem('study_cats', JSON.stringify(categories));
  }, [logs, categories]);

  // 3. Xử lý Môn học (Thêm/Xóa)
  const addCategory = () => {
    const name = prompt("Nhập tên môn học mới:");
    if (name && !categories.includes(name)) {
      setCategories([...categories, name]);
    }
  };

  const deleteCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  // 4. Xử lý Nhật ký học tập
  const handleAddLog = (values: any) => {
    setLogs([{ ...values, id: Date.now() }, ...logs]);
    setIsLogModal(false);
    form.resetFields();
    message.success("Đã lưu lịch học!");
  };

  const deleteLog = (id: number) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  // 5. Tính toán mục tiêu (Giả sử mỗi môn cần 5 tiếng = 300 phút/tháng)
  const getProgress = (cat: string) => {
    const totalMinutes = logs
      .filter(l => l.category === cat)
      .reduce((sum, l) => sum + (l.duration || 0), 0);
    return Math.min(Math.round((totalMinutes / 300) * 100), 100);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <Card title="🎓 QUẢN LÝ HỌC TẬP">
        <Tabs defaultActiveKey="1">
          
          {/* TAB 1: NHẬT KÝ HỌC TẬP */}
          <Tabs.TabPane tab="Lịch sử học" key="1">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsLogModal(true)} style={{ marginBottom: 10 }}>
              Thêm buổi học
            </Button>
            <Table 
              dataSource={logs} 
              rowKey="id" 
              columns={[
                { title: 'Môn', dataIndex: 'category', render: (t) => <Tag color="green">{t}</Tag> },
                { title: 'Nội dung', dataIndex: 'content' },
                { title: 'Phút', dataIndex: 'duration' },
                { title: 'Xóa', render: (record) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteLog(record.id)} /> }
              ]} 
            />
          </Tabs.TabPane>

          {/* TAB 2: DANH MỤC MÔN HỌC */}
          <Tabs.TabPane tab="Môn học" key="2">
            <Button onClick={addCategory} style={{ marginBottom: 10 }}>+ Thêm môn mới</Button>
            <List
              bordered
              dataSource={categories}
              renderItem={(item) => (
                <List.Item actions={[<Button type="link" danger onClick={() => deleteCategory(item)}>Xóa</Button>]}>
                  {item}
                </List.Item>
              )}
            />
          </Tabs.TabPane>

          {/* TAB 3: MỤC TIÊU */}
          <Tabs.TabPane tab="Mục tiêu tháng" key="3">
             <div style={{ padding: '10px' }}>
                <h3>Tiến độ hoàn thành (Mục tiêu: 5 giờ/môn)</h3>
                {categories.map(cat => (
                  <div key={cat} style={{ marginBottom: 15 }}>
                    <div>{cat}</div>
                    <Progress percent={getProgress(cat)} status="active" />
                  </div>
                ))}
             </div>
          </Tabs.TabPane>

        </Tabs>
      </Card>

      {/* Modal nhập liệu */}
      <Modal title="Thêm buổi học" visible={isLogModal} onCancel={() => setIsLogModal(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleAddLog} layout="vertical">
          <Form.Item name="category" label="Chọn môn" rules={[{ required: true }]}>
            <Select>{categories.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="content" label="Nội dung đã học" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudyApp;