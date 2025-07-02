# Notification Sound Files

This directory should contain notification sound files for the notification system:

- `notification.mp3` - Default notification sound
- `success.mp3` - Success notification sound (booking confirmed, etc.)
- `error.mp3` - Error notification sound (booking failed, etc.)
- `warning.mp3` - Warning notification sound
- `message.mp3` - General message notification sound

## File Requirements:
- Format: MP3 or WAV
- Duration: 1-3 seconds recommended
- File size: Keep under 100KB for performance

## Usage:
The notification system will automatically play these sounds when notifications are triggered, based on user settings in the UserSettings component.

## Testing:
You can add sound files here and test them using the notification system. The system will fall back gracefully if sound files are not present.
