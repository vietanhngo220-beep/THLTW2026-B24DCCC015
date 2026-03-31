import React, { useState, useEffect } from 'react';
import { 
  Card, Tabs, Table, Button, Modal, Form, Input, 
  Select, DatePicker, Tag, Row, Col, Typography, 
  Divider, Space, message, Switch, Badge, Statistic, 
  Radio, Tooltip, Popconfirm
} from 'antd';
import { 
  TeamOutlined, FormOutlined, SolutionOutlined, 
  BarChartOutlined, PlusOutlined, HistoryOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const QuanLiCLB = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const [clubs, setClubs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('clb_db_full_v4');
    if (data) {
      const parsed = JSON.parse(data);
      setClubs(parsed.clubs || []);
      setApplications(parsed.applications || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('clb_db_full_v4', JSON.stringify({ clubs, applications }));
  }, [clubs, applications]);

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const onSaveClub = (values: any) => {
    const data = { 
      ...values, 
      id: editingRecord?.id || Date.now(), 
      createdAt: values.createdAt ? values.createdAt.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
    };
    if (editingRecord) {
      setClubs(clubs.map(c => c.id === editingRecord.id ? data : c));
    } else {
      setClubs([...clubs, data]);
    }
    handleCancel();
    message.success("Lưu thông tin thành công");
  };

  const onSaveApp = (values: any) => {
    const data = { 
      ...values, 
      id: editingRecord?.id || Date.now(), 
      status: editingRecord?.status || 'Pending',
      history: editingRecord?.history || [],
      note: editingRecord?.note || ''
    };
    if (editingRecord) {
      setApplications(applications.map(a => a.id === editingRecord.id ? data : a));
    } else {
      setApplications([data, ...applications]);
    }
    handleCancel();
    message.success("Lưu đơn thành công");
  };

  const handleBatchStatus = (newStatus: string) => {
    let reason = "";
    if (newStatus === 'Rejected') {
      reason = prompt("Lý do từ chối (Bắt buộc):") || "";
      if (!reason.trim()) return message.warning("Phải nhập lý do mới có thể từ chối!");
    }

    const time = dayjs().format('HH:mm DD/MM/YYYY');
    const updated = applications.map(app => {
      if (selectedRowKeys.includes(app.id)) {
        const log = `Admin đã ${newStatus} vào lúc ${time}${reason ? ' với lý do: ' + reason : ''}`;
        return { 
          ...app, 
          status: newStatus, 
          note: reason || app.note, 
          history: [log, ...(app.history || [])] 
        };
      }
      return app;
    });

    setApplications(updated);
    setSelectedRowKeys([]);
    message.success(`Đã xử lý ${selectedRowKeys.length} đơn`);
  };

  const handleTransfer = (values: any) => {
    setApplications(applications.map(app => 
      selectedRowKeys.includes(app.id) ? { ...app, clubId: values.targetClubId } : app
    ));
    setSelectedRowKeys([]);
    setIsModalOpen(false);
    message.success("Chuyển CLB thành công");
  };

  const clubColumns = [
    { 
      title: 'Ảnh', 
      dataIndex: 'avatar', 
      render: (url: string) => <img src={url} style={{width: 35, height: 35, borderRadius: 4, objectFit: 'cover'}} alt="thumb" /> 
    },
    { title: 'Tên CLB', dataIndex: 'name', sorter: (a: any, b: any) => a.name.localeCompare(b.name) },
    { title: 'Chủ nhiệm', dataIndex: 'leader' },
    { title: 'Ngày thành lập', dataIndex: 'createdAt' },
    { title: 'Hoạt động', dataIndex: 'active', render: (v: boolean) => <Tag color={v ? 'blue' : 'default'}>{v ? 'Có' : 'Không'}</Tag> },
    { 
      title: 'Thao tác', 
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { 
            setEditingRecord(r); 
            form.setFieldsValue({...r, createdAt: dayjs(r.createdAt)}); 
            setModalType('club'); 
            setIsModalOpen(true); 
          }}>Sửa</Button>
          <Popconfirm title="Xóa CLB này?" onConfirm={() => setClubs(clubs.filter(c => c.id !== r.id))}>
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const appColumns = [
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'SĐT', dataIndex: 'phone' },
    { title: 'CLB', render: (_: any, r: any) => clubs.find(c => c.id === r.clubId)?.name },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (s: string) => <Tag color={s === 'Approved' ? 'green' : s === 'Rejected' ? 'red' : 'orange'}>{s}</Tag> 
    },
    { 
      title: 'Thao tác', 
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Lịch sử"><Button size="small" icon={<HistoryOutlined />} onClick={() => Modal.info({ title: 'Lịch sử', content: <ul>{r.history?.map((h:any, i:any) => <li key={i}>{h}</li>)}</ul> })} /></Tooltip>
          <Tooltip title="Chi tiết"><Button size="small" icon={<EyeOutlined />} onClick={() => { setEditingRecord(r); form.setFieldsValue(r); setModalType('view_app'); setIsModalOpen(true); }} /></Tooltip>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingRecord(r); form.setFieldsValue(r); setModalType('app'); setIsModalOpen(true); }}>Sửa</Button>
          <Popconfirm title="Xóa đơn đăng ký này?" onConfirm={() => setApplications(applications.filter(a => a.id !== r.id))}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card title={<Title level={2} style={{margin: 0}}>Quản Lý Câu Lạc Bộ</Title>}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          
          <TabPane tab={<span><TeamOutlined /> 1. Danh sách CLB</span>} key="1">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setModalType('club'); setIsModalOpen(true); }} style={{ marginBottom: 16 }}>Thêm CLB</Button>
            <Table dataSource={clubs} columns={clubColumns} rowKey="id" />
          </TabPane>

          <TabPane tab={<span><FormOutlined /> 2. Quản lý đơn</span>} key="2">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" onClick={() => { setModalType('app'); setIsModalOpen(true); }}>Tạo đơn mới</Button>
              <Button disabled={selectedRowKeys.length === 0} icon={<CheckCircleOutlined />} onClick={() => handleBatchStatus('Approved')}>Duyệt ({selectedRowKeys.length})</Button>
              <Button danger disabled={selectedRowKeys.length === 0} icon={<CloseCircleOutlined />} onClick={() => handleBatchStatus('Rejected')}>Từ chối ({selectedRowKeys.length})</Button>
            </Space>
            <Table 
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
              dataSource={applications} 
              columns={appColumns} 
              rowKey="id" 
            />
          </TabPane>

          <TabPane tab={<span><SolutionOutlined /> 3. Thành viên</span>} key="3">
            <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={() => { setModalType('transfer'); setIsModalOpen(true); }} style={{ marginBottom: 16 }}>Đổi CLB hàng loạt</Button>
            <Table 
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
              dataSource={applications.filter(a => a.status === 'Approved')}
              rowKey="id"
              columns={[
                { title: 'Họ tên', dataIndex: 'fullName' },
                { title: 'SĐT', dataIndex: 'phone' },
                { title: 'Địa chỉ', dataIndex: 'address' },
                { title: 'CLB hiện tại', render: (_, r) => <Tag color="blue">{clubs.find(c => c.id === r.clubId)?.name}</Tag> }
              ]}
            />
          </TabPane>

          <TabPane tab={<span><BarChartOutlined /> 4. Báo cáo thống kê</span>} key="4">
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}><Card><Statistic title="Tổng CLB" value={clubs.length} /></Card></Col>
              <Col span={6}><Card><Statistic title="Đang chờ duyệt" value={applications.filter(a => a.status === 'Pending').length} valueStyle={{color: '#faad14'}}/></Card></Col>
              <Col span={6}><Card><Statistic title="Đã duyệt (Approved)" value={applications.filter(a => a.status === 'Approved').length} valueStyle={{color: '#52c41a'}}/></Card></Col>
              <Col span={6}><Card><Statistic title="Đã từ chối (Rejected)" value={applications.filter(a => a.status === 'Rejected').length} valueStyle={{color: '#f5222d'}}/></Card></Col>
            </Row>
            
            <Divider orientation="left">Chi tiết đơn đăng ký theo Câu lạc bộ</Divider>
            <Table 
              dataSource={clubs} 
              rowKey="id" 
              pagination={false} 
              columns={[
                { title: 'Tên Câu lạc bộ', dataIndex: 'name' },
                { 
                  title: 'Số đơn Approved', 
                  render: (_, r) => {
                    const count = applications.filter(a => a.clubId === r.id && a.status === 'Approved').length;
                    return <Badge count={count} showZero color="#52c41a" />;
                  } 
                },
                { 
                  title: 'Số đơn Pending', 
                  render: (_, r) => {
                    const count = applications.filter(a => a.clubId === r.id && a.status === 'Pending').length;
                    return <Badge count={count} showZero color="#1890ff" />;
                  } 
                },
                { 
                  title: 'Số đơn Rejected', 
                  render: (_, r) => {
                    const count = applications.filter(a => a.clubId === r.id && a.status === 'Rejected').length;
                    return <Badge count={count} showZero color="#f5222d" />;
                  } 
                },
                {
                  title: 'Tổng cộng',
                  render: (_, r) => <b>{applications.filter(a => a.clubId === r.id).length}</b>
                }
              ]} 
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal 
        visible={isModalOpen} 
        onCancel={handleCancel} 
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={modalType === 'club' ? onSaveClub : modalType === 'transfer' ? handleTransfer : onSaveApp}>
          {modalType === 'club' && (
            <Row gutter={16}>
              <Col span={12}><Form.Item name="name" label="Tên CLB" rules={[{required: true}]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="leader" label="Chủ nhiệm" rules={[{required: true}]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="createdAt" label="Ngày thành lập" rules={[{required: true}]}><DatePicker style={{width: '100%'}} /></Form.Item></Col>
              <Col span={12}><Form.Item name="avatar" label="Ảnh đại diện (URL)"><Input /></Form.Item></Col>
              <Col span={24}><Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item></Col>
              <Col span={12}><Form.Item name="active" label="Hoạt động" valuePropName="checked"><Switch /></Form.Item></Col>
            </Row>
          )}

          {(modalType === 'app' || modalType === 'view_app') && (
            <Row gutter={16}>
              <Col span={8}><Form.Item name="fullName" label="Họ tên" rules={[{required: true}]}><Input disabled={modalType === 'view_app'}/></Form.Item></Col>
              <Col span={8}><Form.Item name="email" label="Email"><Input disabled={modalType === 'view_app'}/></Form.Item></Col>
              <Col span={8}><Form.Item name="phone" label="SĐT"><Input disabled={modalType === 'view_app'}/></Form.Item></Col>
              <Col span={8}><Form.Item name="gender" label="Giới tính"><Radio.Group disabled={modalType === 'view_app'}><Radio value="Nam">Nam</Radio><Radio value="Nữ">Nữ</Radio></Radio.Group></Form.Item></Col>
              <Col span={16}><Form.Item name="address" label="Địa chỉ"><Input disabled={modalType === 'view_app'}/></Form.Item></Col>
              <Col span={12}><Form.Item name="talent" label="Sở trường"><Input disabled={modalType === 'view_app'}/></Form.Item></Col>
              <Col span={12}><Form.Item name="clubId" label="Câu lạc bộ" rules={[{required: true}]}><Select disabled={modalType === 'view_app'}>{clubs.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}</Select></Form.Item></Col>
              <Col span={24}><Form.Item name="reason" label="Lý do đăng ký"><Input.TextArea rows={2} disabled={modalType === 'view_app'}/></Form.Item></Col>
              {editingRecord?.note && <Col span={24}><Text type="danger">Ghi chú từ chối: {editingRecord.note}</Text></Col>}
            </Row>
          )}

          {modalType === 'transfer' && (
            <Form.Item name="targetClubId" label={`Chuyển ${selectedRowKeys.length} thành viên sang CLB:`} rules={[{required: true}]}>
              <Select placeholder="Chọn CLB đích">{clubs.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}</Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLiCLB;