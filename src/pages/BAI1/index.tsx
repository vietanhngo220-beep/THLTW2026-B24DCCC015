import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Rate, Row, Col, Statistic, message, List, Space, Typography, Divider, InputNumber } from 'antd';
import { UserOutlined, CalendarOutlined, StarOutlined, BarChartOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const BookingApp = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- QUẢN LÝ DỮ LIỆU ---
  const [staffs, setStaffs] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // Load & Save LocalStorage
  useEffect(() => {
    const data = localStorage.getItem('booking_app_data');
    if (data) {
      const p = JSON.parse(data);
      setStaffs(p.staffs || []);
      setServices(p.services || []);
      setBookings(p.bookings || []);
      setReviews(p.reviews || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('booking_app_data', JSON.stringify({ staffs, services, bookings, reviews }));
  }, [staffs, services, bookings, reviews]);

  // --- LOGIC ĐẶT LỊCH & KIỂM TRA TRÙNG ---
  const handleAddBooking = (values: any) => {
    const { staffId, date, time } = values;
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const bookingTime = dateStr + ' ' + time;

    // 1. Kiểm tra trùng lịch (Cùng nhân viên, cùng giờ)
    const isDuplicate = bookings.find(b => b.staffId === staffId && b.time === bookingTime && b.status !== 'Hủy');
    if (isDuplicate) {
      message.error("Nhân viên này đã có lịch hẹn vào khung giờ này!");
      return;
    }

    // 2. Kiểm tra giới hạn khách trong ngày
    const appointmentsToday = bookings.filter(b => b.staffId === staffId && b.time.startsWith(dateStr) && b.status !== 'Hủy').length;
    const staffLimit = staffs.find(s => s.id === staffId)?.limit || 5;
    if (appointmentsToday >= staffLimit) {
      message.error(`Nhân viên đã đạt giới hạn ${staffLimit} khách/ngày!`);
      return;
    }

    const newBooking = {
      ...values,
      id: Date.now(),
      time: bookingTime,
      status: 'Chờ duyệt',
      price: services.find(s => s.id === values.serviceId)?.price || 0
    };

    setBookings([newBooking, ...bookings]);
    message.success("Đặt lịch thành công!");
    setIsModalOpen(false);
    form.resetFields();
  };

  // Tính doanh thu
  const totalRevenue = bookings.filter(b => b.status === 'Hoàn thành').reduce((sum, b) => sum + b.price, 0);

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card title={<Title level={3} style={{ margin: 0 }}>Hệ Thống Đặt Lịch Hẹn</Title>}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          
          {/* 1. QUẢN LÝ NHÂN VIÊN & DỊCH VỤ */}
          <TabPane tab={<span><UserOutlined /> Nhân viên & Dịch vụ</span>} key="1">
            <Row gutter={24}>
              <Col span={12}>
                <Divider orientation="left">Nhân viên</Divider>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                  const name = prompt("Tên nhân viên:");
                  const limit = Number(prompt("Giới hạn khách/ngày:", "5"));
                  if (name) setStaffs([...staffs, { id: Date.now(), name, limit }]);
                }}>Thêm nhân viên</Button>
                <Table size="small" style={{ marginTop: 15 }} dataSource={staffs} rowKey="id" columns={[
                  { title: 'Tên', dataIndex: 'name' },
                  { title: 'Giới hạn', dataIndex: 'limit' }
                ]} />
              </Col>
              <Col span={12}>
                <Divider orientation="left">Dịch vụ</Divider>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                  const name = prompt("Tên dịch vụ:");
                  const price = Number(prompt("Giá dịch vụ:"));
                  if (name) setServices([...services, { id: Date.now(), name, price }]);
                }}>Thêm dịch vụ</Button>
                <Table size="small" style={{ marginTop: 15 }} dataSource={services} rowKey="id" columns={[
                  { title: 'Dịch vụ', dataIndex: 'name' },
                  { title: 'Giá', dataIndex: 'price', render: (p) => `${p.toLocaleString()}đ` }
                ]} />
              </Col>
            </Row>
          </TabPane>

          {/* 2. QUẢN LÝ LỊCH HẸN */}
          <TabPane tab={<span><CalendarOutlined /> Quản lý lịch hẹn</span>} key="2">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Đặt lịch hẹn mới</Button>
            <Table 
              style={{ marginTop: 15 }} 
              dataSource={bookings} 
              rowKey="id" 
              columns={[
                { title: 'Khách hàng', dataIndex: 'customerName' },
                { title: 'Thời gian', dataIndex: 'time' },
                { title: 'Trạng thái', dataIndex: 'status', render: (s) => (
                  <Tag color={s === 'Hoàn thành' ? 'green' : s === 'Hủy' ? 'red' : 'orange'}>{s}</Tag>
                )},
                { title: 'Thao tác', render: (_, record) => (
                  <Select size="small" defaultValue={record.status} onChange={(val) => {
                    setBookings(bookings.map(b => b.id === record.id ? { ...b, status: val } : b));
                  }}>
                    <Select.Option value="Xác nhận">Xác nhận</Select.Option>
                    <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
                    <Select.Option value="Hủy">Hủy</Select.Option>
                  </Select>
                )}
              ]} 
            />
          </TabPane>

          {/* 3. THỐNG KÊ */}
          <TabPane tab={<span><BarChartOutlined /> Thống kê</span>} key="3">
            <Row gutter={16}>
              <Col span={12}>
                <Card><Statistic title="Doanh thu hoàn thành" value={totalRevenue} suffix="VNĐ" valueStyle={{ color: '#3f8600' }} /></Card>
              </Col>
              <Col span={12}>
                <Card><Statistic title="Tổng số lịch hẹn" value={bookings.length} /></Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal 
        title="Đặt lịch hẹn mới" 
        visible={isModalOpen} // Dùng visible để fix lỗi đỏ 'open'
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddBooking}>
          <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="serviceId" label="Dịch vụ" rules={[{ required: true }]}>
            <Select placeholder="Chọn dịch vụ">{services.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="staffId" label="Nhân viên phục vụ" rules={[{ required: true }]}>
            <Select placeholder="Chọn nhân viên">{staffs.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="date" label="Ngày hẹn" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="time" label="Giờ hẹn" rules={[{ required: true }]}>
            <Select placeholder="Chọn khung giờ">
              <Select.Option value="09:00">09:00</Select.Option>
              <Select.Option value="10:00">10:00</Select.Option>
              <Select.Option value="14:00">14:00</Select.Option>
              <Select.Option value="15:00">15:00</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookingApp;