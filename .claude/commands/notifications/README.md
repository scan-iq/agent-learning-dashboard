# Notification Commands

Commands for testing and configuring multi-channel notification system.

## Available Commands

- `/notifications-test` - Test notification channels
- `/notifications-config` - Configure notification settings

## Quick Start

```bash
# Test all channels
/notifications-test

# Test specific channel
/notifications-test --channel whatsapp

# Configure notifications
/notifications-config --channel email --enabled true
```

## Core Concepts

**Multi-Channel Notifications** include:
- WhatsApp (via Zapier + 2Chat)
- Email (SMTP)
- Slack (webhooks)
- SMS (Twilio)
- Discord (webhooks)

## Integration

Works with:
- IRIS Prime (intelligence reports)
- Reflexion (learning alerts)
- Consensus (decision notifications)
- Telemetry (performance alerts)
- Drift detection (drift warnings)
