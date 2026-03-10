import React, { useState } from 'react';
import { Card, Button, Typography, Space, Tag, List, Divider, Row, Col, Statistic } from 'antd';

const { Title, Text } = Typography;

const OanTuTiFullLichSu = () => {
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [score, setScore] = useState({ win: 0, draw: 0, lose: 0 });

  const choices = [
    { name: 'Kéo', icon: '✌️' },
    { name: 'Búa', icon: '✊' },
    { name: 'Bao', icon: '✋' },
  ];

  const play = (userSelection: any) => {
    const computerSelection = choices[Math.floor(Math.random() * 3)];
    let res = '';

    if (userSelection.name === computerSelection.name) {
      res = 'Hòa';
      setScore(s => ({ ...s, draw: s.draw + 1 }));
    } else if (
      (userSelection.name === 'Kéo' && computerSelection.name === 'Bao') ||
      (userSelection.name === 'Búa' && computerSelection.name === 'Kéo') ||
      (userSelection.name === 'Bao' && computerSelection.name === 'Búa')
    ) {
      res = 'Thắng';
      setScore(s => ({ ...s, win: s.win + 1 }));
    } else {
      res = 'Thua';
      setScore(s => ({ ...s, lose: s.lose + 1 }));
    }

    const roundData = {
      key: Date.now(),
      // Số thứ tự ván = tổng số ván hiện tại + 1
      index: history.length + 1, 
      user: userSelection.name,
      uIcon: userSelection.icon,
      computer: computerSelection.name,
      cIcon: computerSelection.icon,
      res: res,
    };

    setResult(roundData);
    setHistory([roundData, ...history]);
  };

  return (
    <div style={{ padding: '30px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ width: 450, borderRadius: '8px' }} title="Trò chơi Oẳn Tù Tì">
        
        <Row gutter={16} style={{ textAlign: 'center', marginBottom: 20 }}>
          <Col span={8}><Statistic title="Thắng" value={score.win} valueStyle={{ color: '#52c41a' }} /></Col>
          <Col span={8}><Statistic title="Hòa" value={score.draw} /></Col>
          <Col span={8}><Statistic title="Thua" value={score.lose} valueStyle={{ color: '#ff4d4f' }} /></Col>
        </Row>

        <Divider>Chọn vũ khí</Divider>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Space size="large">
            {choices.map(item => (
              <Button 
                key={item.name} 
                onClick={() => play(item)}
                style={{ height: 65, width: 65, fontSize: 28, borderRadius: '50%' }}
              >
                {item.icon}
              </Button>
            ))}
          </Space>
        </div>

        {result && (
          <div style={{ textAlign: 'center', padding: '15px', background: '#fff', border: '1px solid #eee', borderRadius: '8px', marginBottom: 20 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Ván thứ {result.index}</Text>
            <div style={{ fontSize: 24, marginTop: 5 }}>
              <Space size="large">
                <span>{result.uIcon}</span>
                <Text strong type="secondary">VS</Text>
                <span>{result.cIcon}</span>
              </Space>
            </div>
            <div style={{ marginTop: 10 }}>
              <Tag color={result.res === 'Thắng' ? 'green' : result.res === 'Thua' ? 'red' : 'default'} style={{ fontSize: 16 }}>
                {result.res === 'Thắng' ? 'BẠN THẮNG' : result.res === 'Thua' ? 'BẠN THUA' : 'HÒA'}
              </Tag>
            </div>
          </div>
        )}

        <Divider orientation="left">Lịch sử đấu ({history.length} ván)</Divider>
        
        <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '0 5px' }}>
          <List
            size="small"
            dataSource={history}
            renderItem={item => (
              <List.Item>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ color: '#1890ff', width: 60 }}>Ván {item.index}</Text>
                  <Text>{item.uIcon} vs {item.cIcon}</Text>
                  <Tag color={item.res === 'Thắng' ? 'green' : item.res === 'Thua' ? 'red' : 'default'} style={{ width: 65, textAlign: 'center' }}>
                    {item.res}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        </div>

        {history.length > 0 && (
          <Button 
            type="link" 
            block 
            danger 
            onClick={() => { setHistory([]); setResult(null); setScore({win:0, draw:0, lose:0}) }}
            style={{ marginTop: 10 }}
          >
            Làm mới trò chơi
          </Button>
        )}
      </Card>
    </div>
  );
};

export default OanTuTiFullLichSu;