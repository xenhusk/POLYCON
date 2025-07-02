# Notification Sounds

This directory contains audio files for notification sounds. Place the following sound files here:

## Required Sound Files

- `booking-success.mp3` - Played when a booking is successfully confirmed
- `appointment-reminder.mp3` - Played for appointment reminders
- `new-message.mp3` - Played for general notifications and messages
- `error.mp3` - Played for error notifications
- `warning.mp3` - Played for warning notifications
- `success.mp3` - Played for general success notifications

## File Format Requirements

- **Format**: MP3 or WAV
- **Duration**: 1-3 seconds recommended
- **Volume**: Normalized to prevent jarring audio levels
- **Quality**: 44.1kHz, 16-bit minimum

## Adding Custom Sounds

1. Place your audio files in this directory
2. Update the `NOTIFICATION_SOUNDS` object in `src/utils/notificationUtils.js` to reference your files
3. Test with the notification system

## Default Behavior

If sound files are not found, the notification system will:
- Log a warning to the console
- Continue to show visual notifications
- Not interrupt the user experience

## Browser Compatibility

- Sound notifications require user interaction before they can play
- Some browsers may block autoplay of audio
- Users can disable sound notifications in their settings
