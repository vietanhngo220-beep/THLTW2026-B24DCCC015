import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Row, Col, Typography, Divider, InputNumber, List, message } from 'antd';
import { BookOutlined, SettingOutlined, SolutionOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DiplomaManager = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [books, setBooks] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [fieldsConfig, setFieldsConfig] = useState<any[]>([]);
  const [diplomas, setDiplomas] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAddBook = () => {
    const year = prompt("Nhập năm mở sổ mới:");
    if (year) {
      const newBook = { id: Date.now(), year, currentNumber: 0 };
      setBooks([...books, newBook]);
      message.success(`Đã mở sổ năm ${year}`);
    }
  };

  const handleAddDiploma = (values: any) => {
    const targetBook = books.find(b => b.id === values.bookId);
    if (!targetBook) return message.error("Chưa chọn sổ văn bằng!");

    const nextNumber = targetBook.currentNumber + 1;
    const newDiploma = {
      ...values,
      id: Date.now(),
      registrationNumber: nextNumber,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : '',
    };

    setDiplomas([...diplomas, newDiploma]);
    setBooks(books.map(b => b.id === values.bookId ? { ...b, currentNumber: nextNumber } : b));
    
    setIsModalOpen(false);
    form.resetFields();
    message.success("Cấp văn bằng thành công!");
  };

  const handleSearch = (values: any) => {
    const filledParams = Object.keys(values).filter(k => values[k] && values[k].toString().trim() !== "");
    
    if (filledParams.length < 2) {
      return message.warning("Yêu cầu nhập ít nhất 2 tham số!");
    }

    const results = diplomas.filter(d => {
      return Object.keys(values).every(k => !values[k] || d[k]?.toString().includes(values[k].toString()));
    });

    setSearchResults(results);

    if (results.length > 0) {
      const decId = results[0].decisionId;
      setDecisions(decisions.map(dec => dec.id === decId ? { ...dec, searchCount: (dec.searchCount || 0) + 1 } : dec));
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card title={<Title level={3}>Hệ Thống Quản Lý Văn Bằng</Title>}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          
          <TabPane tab={<span><SettingOutlined /> Cấu hình & Sổ</span>} key="1">
            <Row gutter={24}>
              <Col span={12}>
                <Divider orientation="left">Sổ văn bằng</Divider>
                <Button type="primary" onClick={handleAddBook} icon={<PlusOutlined />}>Mở sổ mới</Button>
                <Table size="small" style={{marginTop: 15}} dataSource={books} rowKey="id" columns={[
                  { title: 'Năm', dataIndex: 'year' },
                  { title: 'Số hiện tại', dataIndex: 'currentNumber' },
                ]} />
              </Col>
              <Col span={12}>
                <Divider orientation="left">Cấu hình biểu mẫu</Divider>
                <Button onClick={() => {
                  const name = prompt("Tên trường:");
                  const type = prompt("Kiểu dữ liệu (String/Number/Date):", "String");
                  if(name) setFieldsConfig([...fieldsConfig, { id: Date.now(), name, type }]);
                }}>Thêm trường</Button>
                <List
                  style={{marginTop: 15}}
                  dataSource={fieldsConfig}
                  renderItem={item => (
                    <List.Item actions={[<a onClick={() => setFieldsConfig(fieldsConfig.filter(f => f.id !== item.id))}>Xóa</a>]}>
                      {item.name} - <Tag color="orange">{item.type}</Tag>
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><BookOutlined /> Quyết định tốt nghiệp</span>} key="2">
            <Button type="primary" onClick={() => {
              const num = prompt("Số quyết định:");
              if(num) setDecisions([...decisions, { id: Date.now(), num, date: dayjs().format('DD/MM/YYYY'), searchCount: 0 }]);
            }}>Thêm quyết định</Button>
            <Table style={{marginTop: 15}} dataSource={decisions} rowKey="id" columns={[
              { title: 'Số Quyết định', dataIndex: 'num' },
              { title: 'Ngày ban hành', dataIndex: 'date' },
              { title: 'Lượt tra cứu', dataIndex: 'searchCount', render: (val) => <Tag color="blue">{val}</Tag> }
            ]} />
          </TabPane>

          <TabPane tab={<span><SolutionOutlined /> Quản lý văn bằng</span>} key="3">
            <Button type="primary" onClick={() => setIsModalOpen(true)}>Cấp văn bằng mới</Button>
            <Table style={{marginTop: 15}} dataSource={diplomas} rowKey="id" columns={[
              { title: 'Số hiệu', dataIndex: 'diplomaSerial' },
              { title: 'Số vào sổ', dataIndex: 'registrationNumber' },
              { title: 'MSV', dataIndex: 'studentId' },
              { title: 'Họ tên', dataIndex: 'name' }
            ]} />
          </TabPane>

          <TabPane tab={<span><SearchOutlined /> Tra cứu</span>} key="4">
            <Form layout="vertical" onFinish={handleSearch} style={{background: '#fff', padding: 20, borderRadius: 8}}>
              <Row gutter={16}>
                <Col span={6}><Form.Item name="diplomaSerial" label="Số hiệu"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="registrationNumber" label="Số vào sổ"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="studentId" label="MSV"><Input /></Form.Item></Col>
                <Col span={6}><Form.Item name="name" label="Họ tên"><Input /></Form.Item></Col>
              </Row>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>Tìm kiếm</Button>
            </Form>
            <Table style={{marginTop: 20}} dataSource={searchResults} rowKey="id" columns={[
              { title: 'Kết quả', render: (r) => (
                <Card size="small" title={r.name}>
                  <p>MSV: {r.studentId} | Số hiệu: {r.diplomaSerial} | Số vào sổ: {r.registrationNumber}</p>
                </Card>
              )}
            ]} />
          </TabPane>
        </Tabs>
      </Card>

      <Modal title="Cấp văn bằng" visible={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} width={800}>
        <Form form={form} layout="vertical" onFinish={handleAddDiploma}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bookId" label="Sổ năm" rules={[{required: true}]}>
                <Select>{books.map(b => <Select.Option key={b.id} value={b.id}>Năm {b.year}</Select.Option>)}</Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="decisionId" label="Quyết định" rules={[{required: true}]}>
                <Select>{decisions.map(d => <Select.Option key={d.id} value={d.id}>{d.num}</Select.Option>)}</Select>
              </Form.Item>
            </Col>
            <Col span={8}><Form.Item name="studentId" label="MSV" rules={[{required: true}]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="name" label="Họ tên" rules={[{required: true}]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="diplomaSerial" label="Số hiệu" rules={[{required: true}]}><Input /></Form.Item></Col>
          </Row>

          <Divider orientation="left">Thông tin bổ sung</Divider>
          <Row gutter={16}>
            {fieldsConfig.map(field => (
              <Col span={12} key={field.id}>
                <Form.Item name={field.name} label={field.name}>
                  {field.type === 'Number' ? <InputNumber style={{width: '100%'}} /> : 
                   field.type === 'Date' ? <DatePicker style={{width: '100%'}} /> : <Input />}
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default DiplomaManager;