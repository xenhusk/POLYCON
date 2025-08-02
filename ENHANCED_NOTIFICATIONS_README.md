# Enhanced Booking Notifications System

## Overview
The booking notification system has been significantly improved to provide more contextual and user-specific information. The notifications now include detailed information about appointments including time, venue, and participants, and are tailored based on whether the user is a teacher or student.

## Key Improvements

### 1. Contextual Messages
- **Before**: Generic messages like "You have a new booking" or "A booking has been cancelled"
- **After**: Detailed messages that include:
  - Participant names (teacher and students)
  - Subject/consultation type
  - Scheduled date and time (formatted to Philippine timezone)
  - Venue information
  - User role-specific language

### 2. Role-Based Messaging
- **For Teachers**: Messages focus on student requests and confirmations
  - Example: "New appointment request from John Doe for Data Structures scheduled for December 15, 2024 at 2:30 PM at Room 101"
- **For Students**: Messages focus on their own appointments with teachers
  - Example: "Your appointment with Dr. Smith for Database Systems has been confirmed on December 15, 2024 at 2:30 PM at Computer Lab"

### 3. Targeted Notifications
- Notifications are now sent to specific user rooms instead of global broadcasts
- Each user receives only relevant notifications
- Fallback global broadcast ensures delivery reliability

### 4. Enhanced UI/UX
- Improved Toast component layout for longer messages
- Better text wrapping and responsive design
- Contextual notification titles based on user role
- Improved notification tray with truncated messages

## Technical Implementation

### Backend Changes

#### 1. Notification Utilities (`backend/utils/notification_utils.py`)
- `format_schedule_time()`: Converts ISO datetime to readable Philippine time
- `generate_booking_created_message()`: Creates contextual creation messages
- `generate_booking_confirmed_message()`: Creates contextual confirmation messages
- `generate_booking_cancelled_message()`: Creates contextual cancellation messages
- `get_user_role_and_id_from_booking()`: Determines user role in booking context

#### 2. Socket Service (`backend/services/socket_service.py`)
- Enhanced `emit_booking_created()`, `emit_booking_confirmed()`, `emit_booking_cancelled()`
- Targeted room-based notifications with fallback global broadcast
- Role-specific message generation

#### 3. Booking Routes (`backend/routes/booking_routes.py`)
- Updated to include `teacher_id` and `student_ids` in socket emissions
- Enhanced booking data structure for notifications

### Frontend Changes

#### 1. Notification Format Utils (`frontend/src/utils/notificationFormatUtils.js`)
- Client-side date/time formatting utilities
- User role detection functions
- Fallback message generation
- Notification title formatting based on user role

#### 2. Toast Context (`frontend/src/contexts/ToastContext.jsx`)
- Integration with new utility functions
- Enhanced error handling and fallback mechanisms
- Improved notification tray management

#### 3. Toast Component (`frontend/src/components/Toast.jsx`)
- Better layout for longer messages
- Improved responsive design
- Enhanced text wrapping with hyphens

#### 4. Toast Manager (`frontend/src/components/ToastManager.jsx`)
- Better sizing constraints for notifications
- Improved mobile responsiveness

## Message Examples

### Booking Created
**Teacher receives**: "New appointment request from Alice Johnson and Bob Smith for Database Systems scheduled for December 15, 2024 at 2:30 PM at Computer Lab"

**Student receives**: "Your appointment request with Dr. Martinez for Web Development has been submitted for December 15, 2024 at 2:30 PM at Room 205"

### Booking Confirmed
**Teacher receives**: "Appointment with Sarah Wilson confirmed for Mobile Programming on December 15, 2024 at 2:30 PM at Laboratory 3"

**Student receives**: "Your appointment with Prof. Chen for Software Engineering has been confirmed on December 15, 2024 at 2:30 PM at Conference Room A"

### Booking Cancelled
**Teacher receives**: "Appointment with Mike Davis for Computer Networks has been cancelled (was scheduled for December 15, 2024 at 2:30 PM at Room 108)"

**Student receives**: "Your appointment with Dr. Rodriguez for Artificial Intelligence has been cancelled (was scheduled for December 15, 2024 at 2:30 PM at AI Lab)"

## Room-Based Targeting

The system now uses user-specific rooms for targeted delivery:
- Room naming convention: `user_{user_id}`
- Automatic room joining when users connect
- Fallback global broadcast for reliability

## Error Handling

- Graceful fallback to generic messages if detailed data is unavailable
- Client-side message generation if backend message fails
- Timezone handling with proper error recovery
- Room delivery with global broadcast fallback

## Future Enhancements

1. **Email Notifications**: Extend the system to send email notifications for important booking events
2. **Push Notifications**: Add mobile push notification support
3. **Notification Preferences**: Allow users to customize notification types and delivery methods
4. **Batch Notifications**: Group multiple related notifications to reduce notification fatigue
5. **Rich Notifications**: Add action buttons to notifications (confirm, reschedule, etc.)

## Testing

To test the enhanced notification system:

1. Create a booking as a student
2. Confirm the booking as a teacher
3. Cancel the booking
4. Verify that notifications show appropriate contextual information
5. Check both desktop toast notifications and system notifications
6. Verify notification tray displays truncated messages appropriately

## Dependencies

- `pytz`: For timezone handling in Python backend
- Enhanced socket room management
- Updated frontend utility functions

The enhanced system provides a much more informative and user-friendly notification experience while maintaining backward compatibility and robust error handling.
