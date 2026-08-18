// Custom Received Header Plugin
const constants = require('haraka-constants')
// 通过 SMTP 扩展命令设置自定义 Received 头参数

exports.register = function () {
    this.loginfo('Custom Received Header Plugin loaded')
}

// 注册自定义 SMTP 命令
exports.hook_capabilities = function (next, connection) {
    // 添加自定义命令到 EHLO 响应
    connection.capabilities.push('XRCVHDR')
    next()
}

// 处理 XRCVHDR 命令
// 格式: XRCVHDR FROM=domain.com HOST=hostname IP=1.2.3.4 BY=mx.example.com ID=ABC123 RCPT=user@example.com TIME="Mon, 15 Aug 2026 01:00:36 +0800"
exports.hook_unrecognized_command = function (next, connection, params) {
    const command = params[0].toUpperCase()

    if (command === 'XRCVHDR') {
        // 解析参数
        const args = params.slice(1).join(' ')
        const custom_received = {}

        // 解析 KEY=VALUE 格式的参数
        const regex = /(\w+)=(?:"([^"]+)"|(\S+))/g
        let match

        while ((match = regex.exec(args)) !== null) {
            const key = match[1].toLowerCase()
            const value = match[2] || match[3]

            switch (key) {
                case 'from':
                case 'domain':
                    custom_received.from_domain = value
                    break
                case 'host':
                case 'hostname':
                    custom_received.from_host = value
                    break
                case 'ip':
                    custom_received.from_ip = value
                    break
                case 'by':
                    custom_received.by_host = value
                    break
                case 'id':
                    custom_received.smtp_id = value
                    break
                case 'rcpt':
                case 'for':
                    custom_received.for_rcpt = value
                    break
                case 'time':
                case 'timestamp':
                    custom_received.timestamp = value
                    break
            }
        }

        // 保存到 connection.transaction.notes
        if (!connection.transaction) {
            connection.respond(503, 'MAIL FROM required before XRCVHDR')
            return next()
        }

        if (!connection.transaction.notes) {
            connection.transaction.notes = {}
        }

        connection.transaction.notes.custom_received = custom_received

        // 同步设置出站 EHLO 主机名: 让收件方 MX (如 QQ) 追加的 Received 头
        // 的 from 部分跟随随机域名, 与自定义 Received 保持一致
        const outbound_helo =
            custom_received.from_domain ||
            custom_received.from_host ||
            (connection.hello && connection.hello.host) ||
            'localhost'
        connection.transaction.notes.outbound_helo = outbound_helo

        this.loginfo(`Custom Received header set: ${JSON.stringify(custom_received)}`)
        connection.respond(250, 'Custom Received header parameters accepted')
        // 响应已发送, 用 constants.ok 通知 hook 链, 避免 unrecognized_command_respond 默认分支再回 500
        return next(constants.ok)
    }

    // 不是我们的命令，继续处理
    return next()
}

// 也可以通过 MAIL FROM 的扩展参数传递
// 格式: MAIL FROM:<sender@example.com> XRCVHDR=base64_encoded_json
exports.hook_mail = function (next, connection, params) {
    // Haraka 3.x: params = [from(Address对象), esmtp_params(对象, 键大写)]
    // 如 params[1] = { SIZE: '123', XRCVHDR: 'base64...' }
    const mail_params = params && params[1]
    const xrcvhdr_value = mail_params && mail_params.XRCVHDR

    if (xrcvhdr_value) {
        try {
            // 提取 base64 编码的 JSON
            const json_str = Buffer.from(xrcvhdr_value, 'base64').toString('utf-8')
            const custom_received = JSON.parse(json_str)

            if (!connection.transaction.notes) {
                connection.transaction.notes = {}
            }

            connection.transaction.notes.custom_received = custom_received

            // 同步设置出站 EHLO 主机名
            const outbound_helo_mail =
                custom_received.from_domain ||
                custom_received.from_host ||
                (connection.hello && connection.hello.host) ||
                'localhost'
            connection.transaction.notes.outbound_helo = outbound_helo_mail

            this.loginfo(`Custom Received header set via MAIL FROM: ${json_str}`)
        } catch (e) {
            this.logerror(`Failed to parse XRCVHDR parameter: ${e.message}`)
        }
    }

    return next()
}
