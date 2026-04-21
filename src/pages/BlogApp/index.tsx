import React, { useState, useMemo } from 'react';
import { 
  Layout, Menu, Card, Row, Col, Input, Tag, Pagination, Typography, 
  Space, Divider, Button, Table, Modal, Form, Select, Popconfirm, message, Avatar, List 
} from 'antd';
import { 
  HomeOutlined, UserOutlined, EditOutlined, SearchOutlined, 
  DeleteOutlined, PlusOutlined, ArrowLeftOutlined, EyeOutlined,
  FacebookOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const INITIAL_BLOGS = [
  { id: 1, title: 'Học React cho người mới', slug: 'hoc-react', summary: 'Hướng dẫn cơ bản về ReactJS', content: '# React là gì?\nReact là thư viện JavaScript...', author: 'Admin', date: '2026-04-20', tags: ['React', 'Frontend'], views: 120, status: 'Published', image: 'https://picsum.photos/400/200' },
  { id: 2, title: 'Học JavaScript cơ bản', slug: 'hoc-javascript', summary: 'Các khái niệm cơ bản về JavaScript', content: 'JavaScript là ngôn ngữ lập trình...', author: 'Admin', date: '2026-04-21', tags: ['JavaScript', 'Frontend'], views: 85, status: 'Published', image: 'https://picsum.photos/401/200' },
];

const BlogApp = () => {
  const [view, setView] = useState<'home' | 'detail' | 'about' | 'admin'>('home');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>(INITIAL_BLOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [form] = Form.useForm();

  const debouncedSearch = useMemo(() => debounce((value: string) => setSearchTerm(value), 300), []);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTag = selectedTag ? p.tags.includes(selectedTag) : true;
      return matchSearch && matchTag && (view === 'admin' ? true : p.status === 'Published');
    });
  }, [posts, searchTerm, selectedTag, view]);

  const handleViewDetail = (post: any) => {
    const updatedPosts = posts.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p);
    setPosts(updatedPosts);
    setSelectedPost({ ...post, views: post.views + 1 });
    setView('detail');
    window.scrollTo(0, 0);
  };

  const handleSavePost = (values: any) => {
    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...values } : p));
      message.success('Cập nhật thành công');
    } else {
      const newPost = { ...values, id: Date.now(), views: 0, date: dayjs().format('YYYY-MM-DD'), author: 'Admin', image: values.image || 'https://picsum.photos/400/200' };
      setPosts([newPost, ...posts]);
      message.success('Thêm bài mới thành công');
    }
    setIsModalOpen(false);
    setEditingPost(null);
    form.resetFields();
  };

  const HomeView = () => (
    <>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Input 
          prefix={<SearchOutlined />} 
          placeholder="Tìm kiếm bài viết..." 
          style={{ width: 400 }} 
          onChange={(e) => debouncedSearch(e.target.value)} 
        />
        <div style={{ marginTop: 12 }}>
          {Array.from(new Set(posts.flatMap(p => p.tags))).map(tag => (
            <Tag.CheckableTag key={tag} checked={selectedTag === tag} onChange={checked => setSelectedTag(checked ? tag : null)}>
              {tag}
            </Tag.CheckableTag>
          ))}
        </div>
      </div>
      <Row gutter={[24, 24]}>
        {filteredPosts.slice((currentPage - 1) * 9, currentPage * 9).map(post => (
          <Col xs={24} sm={12} lg={8} key={post.id}>
            <Card hoverable cover={<img alt="cover" src={post.image} style={{ height: 180, objectFit: 'cover' }} />} onClick={() => handleViewDetail(post)}>
              <Card.Meta title={post.title} description={post.summary} />
              <div style={{ marginTop: 15 }}>
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{post.date}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{post.author}</Text>
                </Space>
              </div>
              <div style={{ marginTop: 10 }}>
                {post.tags.map((t: string) => <Tag color="blue" key={t}>{t}</Tag>)}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Pagination style={{ marginTop: 40, textAlign: 'center' }} current={currentPage} total={filteredPosts.length} pageSize={9} onChange={setCurrentPage} />
    </>
  );

  const DetailView = () => (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => setView('home')}>Quay lại</Button>
      <img src={selectedPost.image} style={{ width: '100%', borderRadius: 8, margin: '20px 0' }} />
      <Title>{selectedPost.title}</Title>
      <Space size="large">
        <Text type="secondary"><UserOutlined /> {selectedPost.author}</Text>
        <Text type="secondary">{selectedPost.date}</Text>
        <Text type="secondary"><EyeOutlined /> {selectedPost.views} lượt xem</Text>
      </Space>
      <div style={{ marginTop: 10 }}>{selectedPost.tags.map((t: string) => <Tag key={t}>{t}</Tag>)}</div>
      <Divider />
      <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
      <Divider orientation={"left" as any}>Bài viết liên quan</Divider>
      <List 
        dataSource={posts.filter(p => p.id !== selectedPost.id && p.tags.some((t: any) => selectedPost.tags.includes(t)))}
        renderItem={(item: any) => (
          <List.Item style={{ cursor: 'pointer' }} onClick={() => handleViewDetail(item)}>
            <Text strong>{item.title}</Text> — <Text type="secondary">{item.date}</Text>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', padding: '0 50px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: '16px 0' }}>MyDevBlog</Title>
        <Menu mode="horizontal" selectedKeys={[view]} onClick={({ key }) => setView(key as any)} style={{ border: 'none', minWidth: 300 }}>
          <Menu.Item key="home" icon={<HomeOutlined />}>Trang chủ</Menu.Item>
          <Menu.Item key="about" icon={<UserOutlined />}>Giới thiệu</Menu.Item>
          <Menu.Item key="admin" icon={<EditOutlined />}>Quản lý</Menu.Item>
        </Menu>
      </Header>

      <Content style={{ padding: '40px 50px' }}>
        {view === 'home' && <HomeView />}
        {view === 'detail' && selectedPost && <DetailView />}
        {view === 'about' && (
          <Card style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <Avatar size={120} src="https://danviet-24h.ex-cdn.com/files/upload/2-2021/images/2021-06-26/42725836-adf9-4fc7-8764-9f671109ee3a-1624678195-502-width600height400.jpeg" />
            <Title level={2}>Ngô Việt Anh</Title>
            <Paragraph>Lập trình viên Fullstack với đam mê chia sẻ kiến thức công nghệ.</Paragraph>
            <Divider>Kỹ năng</Divider>
            <Space wrap>
              <Tag color="cyan">React</Tag><Tag color="green">NodeJS</Tag><Tag color="blue">TypeScript</Tag>
            </Space>
            <Divider>Liên kết mạng xã hội</Divider>
            <Button 
              type="primary" 
              icon={<FacebookOutlined />} 
              href="https://www.facebook.com/ngovanh23" 
              target="_blank"
            >
              Facebook cá nhân
            </Button>
          </Card>
        )}
        {view === 'admin' && (
          <Card title="Quản lý nội dung" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Bài viết mới</Button>}>
            <Table 
              dataSource={posts} 
              rowKey="id"
              columns={[
                { title: 'Tiêu đề', dataIndex: 'title' },
                { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color={s === 'Published' ? 'green' : 'orange'}>{s}</Tag> },
                { title: 'Lượt xem', dataIndex: 'views', sorter: (a, b) => a.views - b.views },
                { title: 'Thao tác', render: (_, record) => (
                  <Space>
                    <Button size="small" onClick={() => { setEditingPost(record); form.setFieldsValue(record); setIsModalOpen(true); }}>Sửa</Button>
                    <Popconfirm title="Xác nhận xóa?" onConfirm={() => setPosts(posts.filter(p => p.id !== record.id))}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                )}
              ]}
            />
          </Card>
        )}
      </Content>

      <Modal 
        title={editingPost ? "Sửa bài viết" : "Thêm bài viết mới"} 
        visible={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingPost(null); form.resetFields(); }} 
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSavePost}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="slug" label="Slug"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="image" label="URL Ảnh đại diện"><Input /></Form.Item></Col>
            <Col span={12}>
              <Form.Item name="tags" label="Thẻ tag">
                <Select mode="tags" placeholder="Chọn hoặc nhập tag" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
                <Input.TextArea rows={10} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue="Published">
                <Select options={[{ value: 'Published', label: 'Đã đăng' }, { value: 'Draft', label: 'Bản nháp' }]} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="summary" label="Tóm tắt"><Input.TextArea rows={2} /></Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Footer style={{ textAlign: 'center' }}>My Dev Blog ©2026</Footer>
    </Layout>
  );
};

export default BlogApp;