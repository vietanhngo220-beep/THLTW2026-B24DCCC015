import React, { useState, useEffect } from 'react';
import { Card, InputNumber, Button, Typography, Space, Alert, Progress, Empty } from 'antd';
import { ReloadOutlined, SendOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GuessNumberGame: React.FC = () => {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [currentGuess, setCurrentGuess] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error' | 'warning', content: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([]);

  const maxAttempts = 10;

  // Hàm khởi tạo game mới
  const initGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setAttempts(0);
    setMessage({ type: 'info', content: 'Hãy nhập một số từ 1 đến 100 để bắt đầu!' });
    setIsGameOver(false);
    setCurrentGuess(null);
    setHistory([]);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleGuess = () => {
    if (currentGuess === null) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setHistory([currentGuess, ...history]);

    if (currentGuess === targetNumber) {
      setMessage({ type: 'success', content: 'Chúc mừng! Bạn đã đoán đúng!' });
      setIsGameOver(true);
    } else if (newAttempts >= maxAttempts) {
      setMessage({ type: 'error', content: `Bạn đã hết lượt! Số đúng là [${targetNumber}].` });
      setIsGameOver(true);
    } else if (currentGuess < targetNumber) {
      setMessage({ type: 'warning', content: 'Bạn đoán quá thấp!' });
    } else {
      setMessage({ type: 'warning', content: 'Bạn đoán quá cao!' });
    }
    setCurrentGuess(null);
  };

  return (
    <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card style={{ width: 450, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Title level={2}>Trò chơi đoán số</Title>
        <Text type="secondary">Hệ thống đã chọn một số từ 1 đến 100</Text>
        
        <div style={{ margin: '20px 0' }}>
          <Progress 
            percent={(attempts / maxAttempts) * 100} 
            format={() => `${attempts}/${maxAttempts} lượt`}
            status={isGameOver && attempts < maxAttempts ? "success" : "active"}
          />
        </div>

        {message && (
          <Alert message={message.content} type={message.type} showIcon style={{ marginBottom: '20px' }} />
        )}

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <InputNumber
            min={1}
            max={100}
            value={currentGuess}
            onChange={(val) => setCurrentGuess(val)}
            placeholder="Nhập số..."
            style={{ width: '100%' }}
            size="large"
            disabled={isGameOver}
            onPressEnter={handleGuess}
          />

          {!isGameOver ? (
            <Button type="primary" block size="large" icon={<SendOutlined />} onClick={handleGuess}>
              Đoán ngay
            </Button>
          ) : (
            <Button type="primary" danger block size="large" icon={<ReloadOutlined />} onClick={initGame}>
              Chơi lại
            </Button>
          )}
        </Space>

        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <Text strong>Lịch sử dự đoán:</Text>
          <div style={{ maxHeight: '100px', overflowY: 'auto', marginTop: '10px' }}>
            {history.length > 0 ? (
              history.map((num, index) => (
                <Text key={index} keyboard style={{ marginRight: '5px' }}>{num}</Text>
              ))
            ) : (
              <Text type="secondary"> Chưa có lượt dự đoán nào.</Text>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GuessNumberGame;