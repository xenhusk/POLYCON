import os
import sys

# Add audio_url field to the get_final_document response
target_file = os.path.join("backend", "routes", "consultation_routes.py")
with open(target_file, "r") as f:
    content = f.read()

# Fix the missing comma in the student_info dictionary
content = content.replace(
    '"profile_picture": getattr(student_user, \'profile_image_url\', None) # Assuming profile_image_url field exists',
    '"profile_picture": getattr(student_user, \'profile_image_url\', None), # Assuming profile_image_url field exists'
)

# Add audio_url field to the response
content = content.replace(
    '        "audio_file_path": session.audio_file_path,',
    '        "audio_file_path": session.audio_file_path,\n        "audio_url": session.audio_file_path, # Added for frontend compatibility'
)

with open(target_file, "w") as f:
    f.write(content)

print("✅ Fixed consultation_routes.py - added audio_url and fixed syntax")

# Now start the server
os.chdir("backend")
os.system("python app.py")
