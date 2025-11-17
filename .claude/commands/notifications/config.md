# notifications-config

Configure notification system settings and channel preferences.

## Usage

```bash
/notifications-config [--channel <type>] [--enabled <bool>] [--priority <level>]
```

## Options

- `--channel` - Channel to configure: whatsapp, email, slack, sms, discord
- `--enabled` - Enable/disable channel: true, false
- `--priority` - Priority filter: all, high, critical (only send these priorities)
- `--recipients` - Update recipient list
- `--schedule` - Notification schedule (e.g., "business-hours-only")
- `--show` - Show current configuration

## Examples

### Show current configuration
```bash
/notifications-config --show
```

### Enable WhatsApp notifications
```bash
/notifications-config --channel whatsapp --enabled true
```

### Set priority filter
```bash
/notifications-config --channel email --priority critical
```

### Configure recipients
```bash
/notifications-config \
  --channel slack \
  --recipients "#iris-alerts,#engineering"
```

### Business hours only
```bash
/notifications-config \
  --channel sms \
  --schedule business-hours-only
```

## What This Does

1. **Configuration Management**: Updates notification settings
2. **Validation**: Verifies configuration validity
3. **Testing**: Tests new configuration
4. **Storage**: Saves settings to configuration file
5. **Activation**: Applies new settings immediately

## When to Use

- **Initial Setup**: Configure channels for first time
- **Optimization**: Adjust settings based on usage
- **Maintenance**: Update recipients or schedules
- **Troubleshooting**: Disable problematic channels
- **Compliance**: Configure according to policies

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Notification Configuration                                   ║
╠══════════════════════════════════════════════════════════════╣

┌──────────────────────────────────────────────────────────────┐
│ WhatsApp (via Zapier + 2Chat)                                │
├──────────────────────────────────────────────────────────────┤
│ Enabled:      ✅ Yes                                         │
│ Priority:     All (low, medium, high, critical)              │
│ Recipients:   +1-XXX-XXX-5678                                │
│ Schedule:     24/7                                           │
│ Rate Limit:   10/hour                                        │
│ Status:       🟢 Active                                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Email (SMTP)                                                  │
├──────────────────────────────────────────────────────────────┤
│ Enabled:      ✅ Yes                                         │
│ Priority:     High and Critical only                         │
│ Recipients:   iris-admin@example.com, team@example.com       │
│ Schedule:     Business hours (9am-5pm EST)                   │
│ Rate Limit:   Unlimited                                      │
│ Status:       🟡 Degraded (slow response)                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Slack (Webhook)                                               │
├──────────────────────────────────────────────────────────────┤
│ Enabled:      ✅ Yes                                         │
│ Priority:     All                                            │
│ Recipients:   #iris-alerts, #engineering                     │
│ Schedule:     24/7                                           │
│ Rate Limit:   30/minute                                      │
│ Status:       🟢 Active                                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SMS (Twilio)                                                  │
├──────────────────────────────────────────────────────────────┤
│ Enabled:      ✅ Yes                                         │
│ Priority:     Critical only                                  │
│ Recipients:   +1-XXX-XXX-5678                                │
│ Schedule:     24/7 (critical events only)                    │
│ Rate Limit:   5/hour                                         │
│ Status:       🟢 Active                                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Discord (Webhook)                                             │
├──────────────────────────────────────────────────────────────┤
│ Enabled:      ❌ No (disabled)                               │
│ Priority:     -                                              │
│ Recipients:   -                                              │
│ Schedule:     -                                              │
│ Rate Limit:   -                                              │
│ Status:       ⚫ Disabled                                    │
└──────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════╗
║ NOTIFICATION ROUTING                                         ║
╠══════════════════════════════════════════════════════════════╣
║ Low Priority:       WhatsApp, Slack                          ║
║ Medium Priority:    WhatsApp, Slack                          ║
║ High Priority:      WhatsApp, Email, Slack                   ║
║ Critical Priority:  WhatsApp, Email, Slack, SMS              ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ CONFIGURATION FILE                                           ║
╠══════════════════════════════════════════════════════════════╣
║ Location: /config/notifications.json                         ║
║ Last Updated: 2025-11-17 17:45:00                           ║
║ Valid: ✅ Yes                                                ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/notifications-test` - Test notification channels
- `/iris-health` - System health (includes notifications)
