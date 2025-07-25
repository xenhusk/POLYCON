"""Fix timezone columns to use UTC

Revision ID: f8357eda4ab6
Revises: add_transcription_enabled
Create Date: 2025-07-25 13:17:15.967962

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f8357eda4ab6'
down_revision = 'add_transcription_enabled'
branch_labels = None
depends_on = None


def upgrade():
    # Change server_default to use UTC timezone for PostgreSQL
    op.execute("ALTER TABLE bookings ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'UTC')")
    op.execute("ALTER TABLE notifications ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'UTC')")
    op.execute("ALTER TABLE grades ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'UTC')")
    op.execute("ALTER TABLE grades ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'UTC')")


def downgrade():
    # Revert back to now() if needed
    op.execute("ALTER TABLE bookings ALTER COLUMN created_at SET DEFAULT now()")
    op.execute("ALTER TABLE notifications ALTER COLUMN created_at SET DEFAULT now()")
    op.execute("ALTER TABLE grades ALTER COLUMN created_at SET DEFAULT now()")
    op.execute("ALTER TABLE grades ALTER COLUMN updated_at SET DEFAULT now()")
