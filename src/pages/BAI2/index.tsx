import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Typography, List, message, Divider } from 'antd';
import { BookOutlined, DatabaseOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const BankManager = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Danh mục khối kiến thức
  const knowledgeBlocks = ['Tổng quan', 'Chuyên sâu', 'Cơ bản', 'Thực hành'];
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  // Lưu và lấy dữ liệu từ LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem('bank_data_final');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setSubjects(parsed.subjects || []);
      setQuestions(parsed.questions || []);
      setExams(parsed.exams || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bank_data_final', JSON.stringify({ subjects, questions, exams }));
  }, [subjects, questions, exams]);

  // Logic tạo đề thi tự động theo cấu trúc
  const handleCreateExam = (values: any) => {
    const { subjectId, block, difficulty, count } = values;
    const pool = questions.filter(q => q.subjectId === subjectId && q.block === block && q.difficulty === difficulty);
    
    if (pool.length < count) {
      message.error(`Không đủ câu hỏi! Kho hiện chỉ có ${pool.length} câu mức "${difficulty}" thuộc khối "${block}".`);
      return;
    }

    const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
    const newExam = {
      id: Date.now(),
      subjectName: subjects.find(s => s.code === subjectId)?.name,
      questions: selected,
      config: { block, difficulty, count },
      createdAt: new Date().toLocaleString()
    };

    setExams([newExam, ...exams]);
    message.success("Đã tạo đề thi tự động thành công!");
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card title={<Title level={4} style={{margin: 0}}>Ngân Hàng Câu Hỏi Tự Luận</Title>}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><BookOutlined /> Môn học</span>} key="1">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              const n = prompt("Tên môn học:"); const c = prompt("Mã môn học:");
              if (n && c) setSubjects([...subjects, { name: n, code: c, id: c, key: c }]);
            }}>Thêm môn học</Button>
            <Table style={{ marginTop: 15 }} dataSource={subjects} size="small" columns={[{ title: 'Mã môn', dataIndex: 'code' }, { title: 'Tên môn', dataIndex: 'name' }]} />
          </TabPane>

          <TabPane tab={<span><DatabaseOutlined /> Câu hỏi</span>} key="2">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Thêm câu hỏi</Button>
            <Table 
              style={{ marginTop: 15 }} 
              dataSource={questions} 
              size="small" 
              columns={[
                { title: 'Môn', dataIndex: 'subjectId' },
                { title: 'Nội dung', dataIndex: 'content', ellipsis: true },
                { title: 'Độ khó', dataIndex: 'difficulty', render: (d) => <Tag color="orange">{d}</Tag> },
                { title: 'Khối', dataIndex: 'block', render: (b) => <Tag color="blue">{b}</Tag> }
              ]} 
            />
          </TabPane>

          <TabPane tab={<span><FileTextOutlined /> Đề thi</span>} key="3">
            <Button type="primary" onClick={() => setIsModalOpen(true)}>Tạo đề thi theo cấu trúc</Button>
            <List style={{ marginTop: 20 }} dataSource={exams} renderItem={(item: any) => (
              <Card size="small" title={`Đề: ${item.subjectName}`} style={{ marginBottom: 15 }}>
                <Text type="secondary">Cấu trúc: {item.config.count} câu {item.config.difficulty} - {item.config.block}</Text>
                <Divider style={{ margin: '8px 0' }} />
                {item.questions.map((q: any, idx: number) => <div key={idx}>{idx + 1}. {q.content}</div>)}
              </Card>
            )} />
          </TabPane>
        </Tabs>
      </Card>

      <Modal 
        title={activeTab === '2' ? "Thêm câu hỏi" : "Tạo đề thi tự động"} 
        visible={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={activeTab === '2' ? (v) => {
          setQuestions([...questions, { ...v, id: Date.now(), key: Date.now() }]);
          message.success("Đã lưu câu hỏi");
          setIsModalOpen(false);
          form.resetFields();
        } : handleCreateExam}>
          
          <Form.Item name="subjectId" label="Môn học" rules={[{ required: true }]}>
            <Select placeholder="Chọn môn">{subjects.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}</Select>
          </Form.Item>

          <Form.Item name="block" label="Khối kiến thức" rules={[{ required: true }]}>
            <Select placeholder="Chọn khối">{knowledgeBlocks.map(b => <Select.Option key={b} value={b}>{b}</Select.Option>)}</Select>
          </Form.Item>

          <Form.Item name="difficulty" label="Mức độ khó" rules={[{ required: true }]}>
            <Select placeholder="Chọn mức độ">
              <Select.Option value="Dễ">Dễ</Select.Option>
              <Select.Option value="Trung bình">Trung bình</Select.Option>
              <Select.Option value="Khó">Khó</Select.Option>
              <Select.Option value="Rất khó">Rất khó</Select.Option>
            </Select>
          </Form.Item>

          {activeTab === '2' ? (
            <Form.Item name="content" label="Nội dung câu hỏi" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          ) : (
            <Form.Item name="count" label="Số lượng câu" rules={[{ required: true }]}><InputNumber min={1} style={{width: '100%'}} /></Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default BankManager;