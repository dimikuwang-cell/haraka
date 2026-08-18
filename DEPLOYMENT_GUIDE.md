# Haraka Custom Received Header Deployment Guide

## Created Files

1. **plugins/custom_received_header.js** - Core plugin file
2. **config/custom_received_header.ini** - Plugin configuration
3. **config/smtp.ini** - SMTP configuration (disable default Received header)
4. **config/plugins.example** - Plugin loading order example
5. **plugins/custom_received_header.md** - Plugin documentation

## Deployment Steps

### Step 1: Configure Plugin List

Edit your Haraka instance's `config/plugins` file and add at the top:

```
custom_received_header
```

Full example:
```
custom_received_header
# tls
# auth/flat_file
# rcpt_to.in_host_list
# queue/smtp_forward
```

### Step 2: Copy Configuration Files

If deploying to production, copy files to your Haraka instance directory:

```bash
# Assuming your Haraka instance is at /opt/haraka
cp config/smtp.ini /opt/haraka/config/
cp config/custom_received_header.ini /opt/haraka/config/
cp plugins/custom_received_header.js /opt/haraka/plugins/
```

### Step 3: Customize Configuration

Edit `config/custom_received_header.ini` with your values:

```ini
from_domain=xzses.com
from_hostname=23-94-63-137-host.colocrossing.com
from_ip=23.94.63.137
by_hostname=newxmmxszc38-0.qq.com
by_info=NewMX
use_random_id=true
fixed_smtp_id=240F6BB
```

### Step 4: Restart Haraka

```bash
# Stop Haraka
pkill -9 node

# Or use systemd
# systemctl restart haraka

# Start Haraka
cd /opt/haraka
haraka -c .
```

## Testing

### Send Test Email

```bash
telnet localhost 25

EHLO test.com
MAIL FROM:<test@example.com>
RCPT TO:<recipient@qq.com>
DATA
Subject: Test Email

This is a test message.
.
QUIT
```

### Check Email Source

You should see at the top of the email source:

```
Received: from xzses.com (23-94-63-137-host.colocrossing.com [23.94.63.137])
	by newxmmxszc38-0.qq.com (NewMX) with SMTP id 240F6BB
	for <recipient@qq.com>; Mon, 18 Aug 2026 15:30:45 +0800
```

## Configuration Details

### smtp.ini Key Settings

```ini
[headers]
add_received=false  # IMPORTANT: Disable default Received header
```

### custom_received_header.ini Parameters

- **from_domain**: Sender server domain
- **from_hostname**: Sender server hostname (usually PTR record)
- **from_ip**: Sender server IP address
- **by_hostname**: Receiver server hostname
- **by_info**: Receiver server identifier
- **use_random_id**: Use random SMTP ID
  - `true`: Generate random ID per email (e.g., A3F2B91)
  - `false`: Use fixed ID (specified by fixed_smtp_id)
- **fixed_smtp_id**: Fixed SMTP ID (used when use_random_id=false)

## Important Notes

1. **Plugin Order**: `custom_received_header` MUST be first in `config/plugins`
2. **Disable Default**: Ensure `add_received=false` in `smtp.ini`
3. **Timestamp**: Plugin automatically uses server current time and timezone
4. **Recipient**: Recipient address is automatically extracted from SMTP session
5. **Restart**: Must restart Haraka after configuration changes

## Troubleshooting

### Issue 1: Received header not at the top

**Cause**: Other plugins adding headers before
**Solution**: Ensure `custom_received_header` is the first line in `config/plugins`

### Issue 2: Two Received headers appear

**Cause**: Haraka default Received header not disabled
**Solution**: Check `config/smtp.ini` has `add_received=false`

### Issue 3: Configuration not taking effect

**Cause**: Config file format error or wrong path
**Solution**: 
- Check `custom_received_header.ini` syntax
- Ensure config file is in correct `config/` directory
- Check Haraka logs to confirm plugin loaded successfully

### View Logs

```bash
# View Haraka logs
tail -f /var/log/haraka.log

# Or watch console output
haraka -c /opt/haraka
```

You should see:
```
[INFO] Registering custom_received_header plugin
[INFO] Loaded config: {"from_domain":"xzses.com",...}
[INFO] Added custom Received header at the top
```

## Done

After configuration, all emails sent through Haraka will show your custom Received header at the top of the email source!
