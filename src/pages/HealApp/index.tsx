import React, { useState, useMemo } from 'react';
import { 
  Layout, Menu, Card, Row, Col, Typography, Statistic, Table, Tag, 
  Button, Modal, Form, Input, Select, DatePicker, Popconfirm, Divider, 
  Progress, Drawer, Space, InputNumber, Empty, Segmented
} from 'antd';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  DashboardOutlined, HistoryOutlined, HeartOutlined, AimOutlined,
  BookOutlined, PlusOutlined, EditOutlined, DeleteOutlined, FireOutlined, SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { Header, Content } = Layout;
const { Text, Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const HealthApp = () => {
  const [view, setView] = useState('dashboard');
  const [form] = Form.useForm();
  const [healthForm] = Form.useForm();
  const [goalForm] = Form.useForm();

  const [workouts, setWorkouts] = useState<any[]>([]); 
  const [healthLogs, setHealthLogs] = useState<any[]>([]); 
  const [goals, setGoals] = useState<any[]>([]);
  const [library] = useState<any[]>([
    { id: 1, name: 'Hít đất (Push Up)', muscle: 'Ngực', level: 'Dễ', desc: 'Phát triển cơ ngực và tay sau.', instruction: 'Đặt tay rộng bằng vai, giữ lưng thẳng.', calo: 300 },
    { id: 2, name: 'Squat', muscle: 'Chân', level: 'Trung bình', desc: 'Phát triển cơ đùi và mông.', instruction: 'Hạ hông xuống như đang ngồi ghế.', calo: 400 },
    { id: 3, name: 'Plank', muscle: 'Bụng', level: 'Dễ', desc: 'Tăng cường sức mạnh cơ lõi.', instruction: 'Giữ thân người thẳng trên khuỷu tay.', calo: 150 },
  ]);

  const [workoutSearch, setWorkoutSearch] = useState('');
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState('All');
  const [workoutDateRange, setWorkoutDateRange] = useState<any>(null);
  const [goalStatusFilter, setGoalStatusFilter] = useState('Đang thực hiện');

  const [isWorkoutModal, setIsWorkoutModal] = useState(false);
  const [isHealthModal, setIsHealthModal] = useState(false);
  const [isGoalDrawer, setIsGoalDrawer] = useState(false);
  const [isDetailModal, setIsDetailModal] = useState(false);
  
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [editingHealth, setEditingHealth] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const calculateBMI = (weight: number, heightCm: number) => {
    if (!weight || !heightCm) return 0;
    const heightM = heightCm / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(1));
  };

  const getBMITag = (bmi: number) => {
    if (bmi <= 0) return null;
    if (bmi < 18.5) return <Tag color="blue">Thiếu cân</Tag>;
    if (bmi >= 18.5 && bmi <= 24.9) return <Tag color="green">Bình thường</Tag>;
    if (bmi >= 25 && bmi <= 29.9) return <Tag color="gold">Thừa cân</Tag>;
    return <Tag color="red">Béo phì</Tag>;
  };

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => {
      const matchName = w.type?.toLowerCase().includes(workoutSearch.toLowerCase());
      const matchType = workoutTypeFilter === 'All' || w.category === workoutTypeFilter;
      let matchDate = true;
      if (workoutDateRange && workoutDateRange[0] && workoutDateRange[1]) {
        matchDate = dayjs(w.date).isBetween(workoutDateRange[0], workoutDateRange[1], 'day', '[]');
      }
      return matchName && matchType && matchDate;
    });
  }, [workouts, workoutSearch, workoutTypeFilter, workoutDateRange]);

  const filteredGoals = useMemo(() => {
    if (goalStatusFilter === 'Tất cả') return goals;
    return goals.filter(g => g.status === goalStatusFilter);
  }, [goals, goalStatusFilter]);

  const workoutChartData = useMemo(() => {
    const weeks = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
    return weeks.map((w, index) => {
      const count = workouts.filter(item => Math.ceil(dayjs(item.date).date() / 7) === (index + 1)).length;
      return { name: w, value: count };
    });
  }, [workouts]);

  const DashboardView = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}><Card bordered={false}><Statistic title="Buổi tập/Tháng" value={workouts.length} prefix={<HistoryOutlined style={{color: '#1890ff'}} />} /></Card></Col>
        <Col span={6}><Card bordered={false}><Statistic title="Calo đã đốt" value={workouts.reduce((s, i) => s + (Number(i.calories) || 0), 0)} suffix="kcal" prefix={<FireOutlined style={{color: '#ff4d4f'}} />} /></Card></Col>
        <Col span={6}><Card bordered={false}><Statistic title="Cân nặng hiện tại" value={healthLogs.length > 0 ? healthLogs[0].weight : '--'} suffix="kg" prefix={<HeartOutlined style={{color: '#52c41a'}} />} /></Card></Col>
        <Col span={6}><Card bordered={false}><Statistic title="Mục tiêu hoàn thành" value={goals.length > 0 ? Math.round((goals.filter(g => g.status === 'Đã đạt').length / goals.length) * 100) : 0} suffix="%" /></Card></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Số buổi tập theo tuần" bordered={false}>
            <div style={{ height: 300 }}>
              {workouts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workoutChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" /> <YAxis allowDecimals={false} /> <Tooltip />
                    <Bar dataKey="value" fill="#1890ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <Empty description="Chưa có dữ liệu tập luyện" />}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Thay đổi cân nặng" bordered={false}>
            <div style={{ height: 300 }}>
              {healthLogs.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthLogs}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" /> <YAxis domain={['dataMin - 2', 'dataMax + 2']} /> <Tooltip />
                    <Area type="monotone" dataKey="weight" stroke="#52c41a" fill="#f6ffed" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <Empty description="Cần ít nhất 2 bản ghi để vẽ biểu đồ" />}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontWeight: 'bold', fontSize: 20, marginRight: 40, color: '#1890ff' }}>S-HEALTH TRACKING</div>
        <Menu mode="horizontal" selectedKeys={[view]} onClick={({ key }) => setView(key as string)} style={{ flex: 1, border: 'none' }}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>Trang chủ</Menu.Item>
          <Menu.Item key="workout" icon={<HistoryOutlined />}>Nhật ký tập</Menu.Item>
          <Menu.Item key="health" icon={<HeartOutlined />}>Sức khỏe</Menu.Item>
          <Menu.Item key="goals" icon={<AimOutlined />}>Mục tiêu</Menu.Item>
          <Menu.Item key="library" icon={<BookOutlined />}>Thư viện</Menu.Item>
        </Menu>
      </Header>

      <Content style={{ padding: '24px' }}>
        {view === 'dashboard' && <DashboardView />}

        {view === 'workout' && (
          <Card 
            title="Nhật ký tập luyện" 
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingWorkout(null); form.resetFields(); setIsWorkoutModal(true); }}>Thêm buổi tập</Button>}
          >
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}><Input prefix={<SearchOutlined />} placeholder="Tìm bài tập..." onChange={e => setWorkoutSearch(e.target.value)} /></Col>
              <Col span={6}>
                <Select 
                  style={{width:'100%'}} 
                  defaultValue="All" 
                  onChange={setWorkoutTypeFilter} 
                  options={[{value:'All',label:'Tất cả loại hình'},{value:'Cardio', label:'Cardio'},{value:'Strength', label:'Strength'},{value:'Yoga', label:'Yoga'},{value:'HIIT',label:'HIIT'},{value:'Others', label:'Others'}]} 
                />
              </Col>
              <Col span={8}><RangePicker style={{width:'100%'}} onChange={(dates) => setWorkoutDateRange(dates)} /></Col>
            </Row>
            <Table 
              dataSource={filteredWorkouts} 
              rowKey="id" 
              columns={[
                { title: 'Ngày', dataIndex: 'date' },
                { title: 'Bài tập', dataIndex: 'type' },
                { title: 'Phân loại', dataIndex: 'category', render: (cat) => <Tag color="blue">{cat}</Tag> },
                { title: 'Thời lượng', render: (r) => `${r.duration} phút` },
                { title: 'Calo', render: (r) => `${r.calories} kcal` },
                { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color={s === 'Hoàn thành' ? 'green' : 'red'}>{s}</Tag> },
                { title: 'Thao tác', render: (_, r) => (
                  <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingWorkout(r); form.setFieldsValue({...r, date: dayjs(r.date)}); setIsWorkoutModal(true); }} />
                    <Popconfirm title="Xóa?" onConfirm={() => setWorkouts(workouts.filter(x => x.id !== r.id))}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                  </Space>
                )}
              ]} 
            />
          </Card>
        )}

        {view === 'health' && (
          <Card 
            title="Nhật ký chỉ số sức khỏe" 
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingHealth(null); healthForm.resetFields(); setIsHealthModal(true); }}>Cập nhật chỉ số</Button>}
          >
            <Table 
              dataSource={healthLogs} 
              rowKey="id" 
              columns={[
                { title: 'Ngày', dataIndex: 'date' },
                { title: 'Cân nặng (kg)', dataIndex: 'weight' },
                { title: 'Chiều cao (cm)', dataIndex: 'height' },
                { 
                  title: 'BMI', 
                  render: (r) => {
                    const bmi = calculateBMI(r.weight, r.height);
                    return <Space>{bmi} {getBMITag(bmi)}</Space>
                  } 
                },
                { title: 'Nhịp tim (bpm)', dataIndex: 'heartRate' },
                { title: 'Giờ ngủ', dataIndex: 'sleepHours', render: (h) => h ? `${h} giờ` : '--' },
                { title: 'Thao tác', render: (_, r) => (
                  <Space>
                     <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingHealth(r); healthForm.setFieldsValue({...r, date: dayjs(r.date)}); setIsHealthModal(true); }} />
                     <Popconfirm title="Xóa?" onConfirm={() => setHealthLogs(healthLogs.filter(x => x.id !== r.id))}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                  </Space>
                )}
              ]} 
            />
          </Card>
        )}

        {view === 'goals' && (
          <div>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Segmented options={['Đang thực hiện', 'Đã đạt', 'Tất cả']} value={goalStatusFilter} onChange={(v) => setGoalStatusFilter(v as string)} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { goalForm.resetFields(); setIsGoalDrawer(true); }}>Tạo mục tiêu mới</Button>
            </div>
            <Row gutter={[16, 16]}>
              {filteredGoals.map(g => (
                <Col span={8} key={g.id}>
                  <Card title={<Text strong>{g.name}</Text>} extra={<Popconfirm title="Xóa?" onConfirm={() => setGoals(goals.filter(x => x.id !== g.id))}><DeleteOutlined style={{color:'red'}}/></Popconfirm>}>
                    <Tag color="cyan" style={{marginBottom:10}}>{g.type}</Tag>
                    <Progress percent={Math.round((g.current / g.target) * 100)} status={g.status === 'Đã đạt' ? 'success' : 'active'} />
                    <div style={{marginTop:15, display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                      <Space>
                        <Text type="secondary">Đạt được:</Text>
                        <InputNumber size="small" value={g.current} onChange={(v) => {
                          setGoals(goals.map(x => x.id === g.id ? {...x, current: v || 0, status: (v||0) >= x.target ? 'Đã đạt' : 'Đang thực hiện'} : x));
                        }} />
                      </Space>
                      <Text type="secondary">Hạn: {g.deadline}</Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {view === 'library' && (
          <Row gutter={[16, 16]}>
            {library.map(ex => (
              <Col span={8} key={ex.id}>
                <Card hoverable title={ex.name} onClick={() => { setSelectedExercise(ex); setIsDetailModal(true); }}>
                  <Tag color="blue">{ex.muscle}</Tag>
                  <Paragraph ellipsis={{rows:2}} style={{marginTop:10}}>{ex.desc}</Paragraph>
                  <Text strong><FireOutlined style={{color:'red'}}/> {ex.calo} kcal/h</Text>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Modal title={editingWorkout ? "Sửa buổi tập" : "Thêm buổi tập"} open={isWorkoutModal} onCancel={() => setIsWorkoutModal(false)} onOk={() => form.submit()} destroyOnClose>
          <Form form={form} layout="vertical" onFinish={v => {
            const payload = { ...v, id: editingWorkout?.id || Date.now(), date: dayjs(v.date).format('YYYY-MM-DD') };
            if (editingWorkout) setWorkouts(workouts.map(w => w.id === editingWorkout.id ? payload : w));
            else setWorkouts([payload, ...workouts]);
            setIsWorkoutModal(false);
          }}>
            <Form.Item name="date" label="Ngày tập" rules={[{required:true}]}><DatePicker style={{width:'100%'}}/></Form.Item>
            <Form.Item name="type" label="Tên bài tập" rules={[{required:true}]}><Input /></Form.Item>
            <Form.Item name="category" label="Loại hình" rules={[{required:true}]}><Select options={[{value:'Cardio'}, {value:'Strength'}, {value:'Yoga'}]}/></Form.Item>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="duration" label="Thời lượng (phút)" rules={[{required:true}]}><InputNumber style={{width:'100%'}}/></Form.Item></Col>
              <Col span={12}><Form.Item name="calories" label="Calo tiêu thụ"><InputNumber style={{width:'100%'}}/></Form.Item></Col>
            </Row>
            <Form.Item name="status" label="Trạng thái" initialValue="Hoàn thành"><Select options={[{value:'Hoàn thành'}, {value:'Bỏ lỡ'}]}/></Form.Item>
          </Form>
        </Modal>

        <Modal title={editingHealth ? "Sửa chỉ số" : "Cập nhật sức khỏe"} open={isHealthModal} onCancel={() => setIsHealthModal(false)} onOk={() => healthForm.submit()} destroyOnClose>
          <Form form={healthForm} layout="vertical" onFinish={v => {
            const payload = { ...v, id: editingHealth?.id || Date.now(), date: dayjs(v.date).format('YYYY-MM-DD') };
            if (editingHealth) setHealthLogs(healthLogs.map(h => h.id === editingHealth.id ? payload : h));
            else setHealthLogs([payload, ...healthLogs]);
            setIsHealthModal(false);
          }}>
            <Form.Item name="date" label="Ngày ghi" rules={[{required:true}]}><DatePicker style={{width:'100%'}}/></Form.Item>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="weight" label="Cân nặng (kg)" rules={[{required:true}]}><InputNumber style={{width:'100%'}}/></Form.Item></Col>
              <Col span={12}><Form.Item name="height" label="Chiều cao (cm)" rules={[{required:true}]}><InputNumber style={{width:'100%'}}/></Form.Item></Col>
            </Row>
            <Form.Item name="heartRate" label="Nhịp tim (bpm)"><InputNumber style={{width:'100%'}}/></Form.Item>
            <Form.Item name="sleepHours" label="Giờ ngủ (h)"><InputNumber style={{width:'100%'}} min={0} max={24}/></Form.Item>
          </Form>
        </Modal>

        <Drawer 
          title="Mục tiêu mới" 
          open={isGoalDrawer} 
          onClose={() => setIsGoalDrawer(false)} 
          width={400} 
          footer={
            <div style={{textAlign:'right'}}>
              <Button onClick={() => setIsGoalDrawer(false)} style={{marginRight:8}}>Hủy</Button>
              <Button type="primary" onClick={() => goalForm.submit()}>Lưu</Button>
            </div>
          }
        >
          <Form form={goalForm} layout="vertical" onFinish={v => {
            setGoals([...goals, {...v, id:Date.now(), current:0, status:'Đang thực hiện', deadline:dayjs(v.deadline).format('YYYY-MM-DD')}]);
            setIsGoalDrawer(false);
          }}>
            <Form.Item name="name" label="Tên mục tiêu" rules={[{required:true}]}><Input /></Form.Item>
            <Form.Item name="type" label="Loại" rules={[{required:true}]}><Select options={[{value:'Giảm cân'},{value:'Tăng cơ'}]}/></Form.Item>
            <Form.Item name="target" label="Giá trị mục tiêu" rules={[{required:true}]}><InputNumber style={{width:'100%'}}/></Form.Item>
            <Form.Item name="deadline" label="Hạn hoàn thành" rules={[{required:true}]}><DatePicker style={{width:'100%'}}/></Form.Item>
          </Form>
        </Drawer>

        <Modal title="Chi tiết bài tập" open={isDetailModal} footer={null} onCancel={() => setIsDetailModal(false)}>
          {selectedExercise && (
            <div>
              <Title level={4}>{selectedExercise.name}</Title>
              <Tag color="blue">{selectedExercise.muscle}</Tag>
              <Divider/>
              <Paragraph><strong>Mô tả:</strong> {selectedExercise.desc}</Paragraph>
              <Paragraph><strong>Hướng dẫn:</strong> {selectedExercise.instruction}</Paragraph>
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default HealthApp;