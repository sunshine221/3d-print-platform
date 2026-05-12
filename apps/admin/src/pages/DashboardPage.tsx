import { Card, Row, Col, Statistic } from 'antd';
import { InboxOutlined, ShoppingCartOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';

export default function DashboardPage() {
  return (
    <div>
      <h2>仪表盘</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="今日访问量" value={0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="本月订单" value={0} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="代打询价" value={0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="在售产品" value={0} prefix={<InboxOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
