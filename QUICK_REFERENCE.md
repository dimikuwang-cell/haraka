# 🚀 Haraka 自定义 Received 头 - 快速参考

## 📦 已创建的文件清单

```
✅ plugins/custom_received_header.js       (3.6 KB) - 核心插件
✅ plugins/custom_received_header.md       (1.2 KB) - 插件文档
✅ config/custom_received_header.ini       (575 B)  - 插件配置
✅ config/smtp.ini                         (229 B)  - SMTP 配置
✅ config/plugins.example                  (264 B)  - 插件顺序示例
✅ DEPLOYMENT_GUIDE.md                     (4.0 KB) - 完整部署指南
✅ IMPLEMENTATION_SUMMARY.md               (4.1 KB) - 实现总结
✅ test_custom_received.js                 (1.6 KB) - 测试脚本
```

## ⚡ 快速部署（3 步）

### 1️⃣ 启用插件

编辑 `config/plugins`，在第一行添加：

```
custom_received_header
```

### 2️⃣ 确认配置

检查 `config/smtp.ini` 包含：

```ini
[headers]
add_received=false
```

### 3️⃣ 重启服务

```bash
pkill -9 node && haraka -c /path/to/haraka
```

## 🎯 效果预览

生成的邮件头（位于邮件源码最上方）：

```
Received: from xzses.com (23-94-63-137-host.colocrossing.com [23.94.63.137])
	by newxmmxszc38-0.qq.com (NewMX) with SMTP id 240F6BB
	for <1767640870@qq.com>; Sat, 15 Aug 2026 01:00:36 +0800
```

## 🔧 自定义参数

编辑 `config/custom_received_header.ini`：

| 参数            | 当前值                | 说明                              |
| --------------- | --------------------- | --------------------------------- |
| `from_domain`   | xzses.com             | 发件服务器域名                    |
| `from_hostname` | 23-94-63-137-host...  | 发件服务器主机名                  |
| `from_ip`       | 23.94.63.137          | 发件服务器 IP                     |
| `by_hostname`   | newxmmxszc38-0.qq.com | 接收服务器主机名                  |
| `by_info`       | NewMX                 | 接收服务器标识                    |
| `use_random_id` | true                  | 随机 SMTP ID                      |
| `fixed_smtp_id` | 240F6BB               | 固定 ID（use_random_id=false 时） |

## ✅ 验证清单

- [ ] `config/plugins` 第一行是 `custom_received_header`
- [ ] `config/smtp.ini` 设置了 `add_received=false`
- [ ] `config/custom_received_header.ini` 参数已根据需求修改
- [ ] Haraka 已重启
- [ ] 发送测试邮件
- [ ] 查看邮件源码确认 Received 头在最上方

## 🐛 常见问题

| 问题                  | 解决方案                                      |
| --------------------- | --------------------------------------------- |
| Received 头不在最上方 | 确保插件在 `config/plugins` 第一行            |
| 出现两个 Received 头  | 检查 `smtp.ini` 是否设置 `add_received=false` |
| 配置不生效            | 重启 Haraka 并查看日志                        |
| 插件未加载            | 检查文件路径和权限                            |

## 📝 快速测试

```bash
# 测试插件功能
node test_custom_received.js

# 发送测试邮件
telnet localhost 25
EHLO test.com
MAIL FROM:<test@example.com>
RCPT TO:<1767640870@qq.com>
DATA
Subject: Test
.
QUIT
```

## 📚 文档链接

- **完整部署指南**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **实现总结**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **插件文档**: [plugins/custom_received_header.md](plugins/custom_received_header.md)

## 🎉 完成

所有文件已创建，按照上面的 3 步部署即可！

有任何问题请查看详细文档或测试脚本。
