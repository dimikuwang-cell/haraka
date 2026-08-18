// Custom Received Header Plugin
// 强制在邮件源码最上方添加自定义 Received 头部

exports.register = function () {
    this.loginfo('Registering custom_received_header plugin')

    // 加载配置文件
    this.cfg = this.config.get(
        'custom_received_header.ini',
        {
            booleans: ['+use_random_id'],
        },
        () => {
            this.load_config()
        },
    )

    this.load_config()
}

exports.load_config = function () {
    const cfg = this.cfg

    this.config_data = {
        from_domain: cfg.main.from_domain || 'xzses.com',
        from_hostname: cfg.main.from_hostname || '23-94-63-137-host.colocrossing.com',
        from_ip: cfg.main.from_ip || '23.94.63.137',
        by_hostname: cfg.main.by_hostname || 'newxmmxszc38-0.qq.com',
        by_info: cfg.main.by_info || 'NewMX',
        use_random_id: cfg.main.use_random_id !== false,
        fixed_smtp_id: cfg.main.fixed_smtp_id || generateSmtpId(),
    }

    this.loginfo('Loaded config:', JSON.stringify(this.config_data))
}

exports.hook_data_post = function (next, connection) {
    const transaction = connection.transaction
    if (!transaction) return next()

    // 自定义的 Received 头部内容
    const custom_received = this.generateCustomReceivedHeader(connection, transaction)

    // 使用 add_leading_header 确保添加到最顶部
    transaction.add_leading_header('Received', custom_received)

    this.loginfo('Added custom Received header at the top')
    return next()
}

exports.generateCustomReceivedHeader = function (connection, transaction) {
    const config = this.config_data

    // 生成或使用固定的 SMTP ID
    const smtp_id = config.use_random_id ? generateSmtpId() : config.fixed_smtp_id

    // 获取收件人（如果有多个取第一个）
    const rcpt_to =
        transaction.rcpt_to && transaction.rcpt_to.length > 0 ? transaction.rcpt_to[0].address() : '<unknown>'

    // 获取当前时间，格式化为 RFC 2822 格式
    const timestamp = formatRFC2822Date(new Date())

    // 构造 Received 头部（参考你提供的格式）
    const received =
        `from ${config.from_domain} (${config.from_hostname} [${config.from_ip}])` +
        String.fromCharCode(13, 10) +
        `\tby ${config.by_hostname} (${config.by_info}) with SMTP id ${smtp_id}` +
        String.fromCharCode(13, 10) +
        `\tfor <${rcpt_to}>; ${timestamp}`

    return received
}

function generateSmtpId() {
    // 生成类似 240F6BB 的随机 ID
    const chars = '0123456789ABCDEF'
    let id = ''
    for (let i = 0; i < 7; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return id
}

function formatRFC2822Date(date) {
    // 格式化为：Sat, 15 Aug 2026 01:00:36 +0800
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const day = days[date.getDay()]
    const dd = String(date.getDate()).padStart(2, '0')
    const month = months[date.getMonth()]
    const yyyy = date.getFullYear()
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')

    // 获取时区偏移
    const offset = -date.getTimezoneOffset()
    const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')
    const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0')
    const offsetSign = offset >= 0 ? '+' : '-'
    const timezone = offsetSign + offsetHours + offsetMinutes

    return `${day}, ${dd} ${month} ${yyyy} ${hh}:${mm}:${ss} ${timezone}`
}
