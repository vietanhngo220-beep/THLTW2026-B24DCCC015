import React, { useState, useMemo } from 'react';
import { 
  Layout, Menu, Card, Row, Col, Input, Select, Rate, Tag, Button, 
  Tabs, List, Modal, Form, InputNumber, Alert, 
  Statistic, Progress, Table, Popconfirm, message, Typography, Badge, Divider
} from 'antd';
import { 
  CompassOutlined, CalendarOutlined, WalletOutlined, 
  PlusOutlined, DeleteOutlined, 
  EnvironmentOutlined
} from '@ant-design/icons';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as ChartTooltip, Legend 
} from 'recharts';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DIEM_DEN_MAC_DINH = [
  { id: '1', name: 'Vịnh Hạ Long', type: 'biển', price: 2000000, rating: 5, img: 'https://images.unsplash.com/photo-1559592413-7ece35b49c2d?w=500', desc: 'Di sản thiên nhiên thế giới', food: 500000, stay: 1000000, transport: 500000 },
  { id: '2', name: 'Sapa', type: 'núi', price: 1500000, rating: 4.5, img: 'https://images.unsplash.com/photo-1504457047772-27fb14f44611?w=500', desc: 'Thành phố trong sương', food: 400000, stay: 800000, transport: 300000 },
  { id: '3', name: 'Đà Nẵng', type: 'thành phố', price: 3000000, rating: 4.8, img: 'https://images.unsplash.com/photo-1559592413-7ece35b49c2d?w=500', desc: 'Thành phố đáng sống', food: 700000, stay: 1500000, transport: 800000 },
];

const LapKeHoachDuLich = () => {
  const [activeMenu, setActiveMenu] = useState('explore');
  const [destinations, setDestinations] = useState(DIEM_DEN_MAC_DINH);
  const [myPlan, setMyPlan] = useState<any[]>([]);
  const [maxBudget, setMaxBudget] = useState(5000000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const budgetData = useMemo(() => {
    const totals = { food: 0, stay: 0, transport: 0 };
    myPlan.forEach(item => {
      totals.food += item.food || 0;
      totals.stay += item.stay || 0;
      totals.transport += item.transport || 0;
    });
    return [
      { name: 'Ăn uống', value: totals.food, fill: '#FF8042' },
      { name: 'Lưu trú', value: totals.stay, fill: '#0088FE' },
      { name: 'Di chuyển', value: totals.transport, fill: '#00C49F' },
    ];
  }, [myPlan]);

  const totalSpent = budgetData.reduce((sum, item) => sum + item.value, 0);

  const addToPlan = (dest: any) => {
    setMyPlan([...myPlan, { ...dest, planId: Date.now() }]);
    message.success(`Đã thêm ${dest.name}`);
  };

  const removeFromPlan = (planId: number) => {
    setMyPlan(myPlan.filter(item => item.planId !== planId));
    message.info("Đã xóa");
  };

  const onAdminSave = (values: any) => {
    const newDest = { 
      ...values, 
      id: Date.now().toString(), 
      price: (values.food || 0) + (values.stay || 0) + (values.transport || 0) 
    };
    setDestinations([...destinations, newDest]);
    setIsModalOpen(false);
    form.resetFields();
    message.success("Thành công");
  };

  const ExploreView = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Input placeholder="Tìm kiếm..." prefix={<EnvironmentOutlined />} onChange={e => setSearchTerm(e.target.value)} />
        </Col>
        <Col xs={24} md={8}>
          <Select defaultValue="all" style={{ width: '100%' }} onChange={setFilterType}>
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="biển">Biển</Select.Option>
            <Select.Option value="núi">Núi</Select.Option>
            <Select.Option value="thành phố">Thành phố</Select.Option>
          </Select>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        {destinations
          .filter(d => (filterType === 'all' || d.type === filterType) && d.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(dest => (
            <Col xs={24} sm={12} lg={8} key={dest.id}>
              <Card hoverable cover={<img alt={dest.name} src={dest.img} style={{ height: 200, objectFit: 'cover' }} />}>
                <Card.Meta title={dest.name} description={<><Tag color="blue">{dest.type}</Tag><Rate disabled defaultValue={dest.rating} style={{ fontSize: 12 }} /></>} />
                <div style={{ marginTop: 15 }}>
                  <Text type="secondary">{dest.desc}</Text>
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ color: 'red' }}>{dest.price.toLocaleString()}đ</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => addToPlan(dest)}>Thêm</Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
      </Row>
    </div>
  );

  const PlanningView = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={14}>
        <Card title="Lịch trình của tôi">
          <List
            dataSource={myPlan}
            renderItem={(item, index) => (
              <List.Item actions={[<Button danger type="link" icon={<DeleteOutlined />} onClick={() => removeFromPlan(item.planId)} />]}>
                <List.Item.Meta
                  avatar={<Badge count={index + 1} color="#1890ff" />}
                  title={item.name}
                  description={`Ăn: ${item.food.toLocaleString()}đ | Ở: ${item.stay.toLocaleString()}đ`}
                />
              </List.Item>
            )}
          />
          {myPlan.length === 0 && <Alert message="Trống" type="info" />}
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card title="Ngân sách">
          <Statistic title="Tổng chi" value={totalSpent} suffix="đ" />
          <div style={{ marginTop: 20 }}>
            <Text>Hạn mức: </Text>
            <InputNumber 
              style={{ width: '100%', margin: '8px 0' }} 
              value={maxBudget} 
              onChange={(v) => setMaxBudget(Number(v) || 0)} 
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
            />
            <Progress percent={maxBudget > 0 ? Math.round((totalSpent / maxBudget) * 100) : 0} status={totalSpent > maxBudget ? "exception" : "active"} />
          </div>
          <Divider />
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgetData} innerRadius={60} outerRadius={80} dataKey="value">
                  {budgetData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Pie>
                <ChartTooltip formatter={(v: any) => v.toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
    </Row>
  );

  const AdminView = () => (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Danh sách" key="1">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>Thêm mới</Button>
        <Table dataSource={destinations} rowKey="id" pagination={{ pageSize: 5 }}>
          <Table.Column title="Tên" dataIndex="name" />
          <Table.Column title="Loại" dataIndex="type" render={t => <Tag color="blue">{t}</Tag>} />
          <Table.Column title="Giá" dataIndex="price" render={v => v.toLocaleString()} />
          <Table.Column title="Xóa" render={(_, r: any) => (
            <Popconfirm title="Xóa?" onConfirm={() => setDestinations(destinations.filter(d => d.id !== r.id))}>
              <Button danger icon={<DeleteOutlined />} type="link" />
            </Popconfirm>
          )} />
        </Table>
      </TabPane>
      <TabPane tab="Thống kê" key="2">
        <div style={{ height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip formatter={(v: any) => v.toLocaleString()} />
              <Bar dataKey="value" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabPane>
    </Tabs>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>TRAVEL GO</Title>
        <Menu mode="horizontal" selectedKeys={[activeMenu]} onClick={e => setActiveMenu(e.key)} style={{ border: 'none' }}>
          <Menu.Item key="explore">Khám phá</Menu.Item>
          <Menu.Item key="plan">Lịch trình</Menu.Item>
          <Menu.Item key="admin">Quản trị</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '24px' }}>
        {activeMenu === 'explore' && <ExploreView />}
        {activeMenu === 'plan' && <PlanningView />}
        {activeMenu === 'admin' && <AdminView />}
      </Content>
      <Modal 
        title="Thêm địa điểm" 
        visible={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={onAdminSave}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="type" label="Loại" initialValue="biển"><Select options={[{value:'biển', label:'Biển'}, {value:'núi', label:'Núi'}, {value:'thành phố', label:'Thành phố'}]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="rating" label="Sao"><Rate /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="food" label="Ăn"><InputNumber style={{width:'100%'}} /></Form.Item></Col>
            <Col span={8}><Form.Item name="stay" label="Ở"><InputNumber style={{width:'100%'}} /></Form.Item></Col>
            <Col span={8}><Form.Item name="transport" label="Xe"><InputNumber style={{width:'100%'}} /></Form.Item></Col>
          </Row>
          <Form.Item name="img" label="Ảnh"><Input /></Form.Item>
          <Form.Item name="desc" label="Mô tả"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default LapKeHoachDuLich;