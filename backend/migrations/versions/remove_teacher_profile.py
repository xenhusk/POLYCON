"""Remove redundant teacher_profile column from bookings table

Revision ID: remove_teacher_profile
Revises: 34ffeaf41821
Create Date: 2025-05-24 01:15:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'remove_teacher_profile'
down_revision = '34ffeaf41821'
branch_labels = None
depends_on = None


def upgrade():
    # Remove the redundant teacher_profile column
    with op.batch_alter_table('bookings', schema=None) as batch_op:
        batch_op.drop_column('teacher_profile')


def downgrade():
    # Add back the teacher_profile column if we need to downgrade
    with op.batch_alter_table('bookings', schema=None) as batch_op:
        batch_op.add_column(sa.Column('teacher_profile', sa.String(length=255), nullable=True))
