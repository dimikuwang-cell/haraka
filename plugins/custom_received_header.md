# Custom Received Header Plugin

## 功能说明

这个插件可以完全自定义邮件头中的 Received 字段，并强制将其放在邮件源码的最上方。

## 安装步骤

### 1. 禁用 Haraka 默认的 Received 头

编辑 config/smtp.ini 文件，添加或修改：

[headers]
add_received=false

### 2. 启用自定义插件

编辑 config/plugins 文件，在 data_post 相关插件之前添加：

custom_received_header

建议放在靠前的位置。

### 3. 配置自定义参数

编辑 config/custom_received_header.ini 文件，修改为你需要的参数。

### 4. 重启 Haraka

重启服务使配置生效。

## 效果示例

邮件源码最上方会显示：

Received: from xzses.com (23-94-63-137-host.colocrossing.com [23.94.63.137])
	by newxmmxszc38-0.qq.com (NewMX) with SMTP id 240F6BB
	for <recipient@example.com>; Sat, 15 Aug 2026 01:00:36 +0800

## 注意事项

1. 这个插件会完全替换 Haraka 的默认 Received 头
2. 时间戳会自动使用服务器当前时间
3. 收件人地址会自动从 transaction 中提取
4. SMTP ID 可以选择随机生成或使用固定值
5. 所有参数都可以通过配置文件灵活修改
