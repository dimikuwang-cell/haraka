// Test script for custom_received_header plugin

const plugin = require('./plugins/custom_received_header')

// Mock Haraka plugin context
const mockPlugin = {
    cfg: {
        main: {
            from_domain: 'xzses.com',
            from_hostname: '23-94-63-137-host.colocrossing.com',
            from_ip: '23.94.63.137',
            by_hostname: 'newxmmxszc38-0.qq.com',
            by_info: 'NewMX',
            use_random_id: true,
            fixed_smtp_id: '240F6BB'
        }
    },
    config_data: {},
    loginfo: function(...args) {
        console.log('[INFO]', ...args)
    },
    config: {
        get: function() {
            return mockPlugin.cfg
        }
    }
}

// Load config
plugin.load_config.call(mockPlugin)

// Mock transaction
const mockTransaction = {
    rcpt_to: [
        {
            address: () => '1767640870@qq.com'
        }
    ],
    add_leading_header: function(key, value) {
        console.log('\n=== Generated Received Header ===')
        console.log(`${key}: ${value}`)
        console.log('=================================\n')
    }
}

const mockConnection = {
    transaction: mockTransaction
}

// Test the plugin
console.log('Testing custom_received_header plugin...\n')

plugin.hook_data_post.call(mockPlugin, () => {
    console.log('Test completed successfully!')
}, mockConnection)

// Test with fixed ID
console.log('\n--- Testing with fixed SMTP ID ---')
mockPlugin.config_data.use_random_id = false
plugin.hook_data_post.call(mockPlugin, () => {
    console.log('Fixed ID test completed!')
}, mockConnection)
