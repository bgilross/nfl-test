"""baseline schema

Revision ID: 0001_initial
Revises: 
Create Date: 2025-09-09 00:00:00
"""
from alembic import op
import sqlalchemy as sa


revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'teams',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False, unique=True),
    )
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('slug', sa.String(length=150), nullable=False, unique=True),
        sa.Column('name', sa.String(length=200), nullable=False),
    )
    op.create_table(
        'stat_snapshots',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('team_id', sa.Integer(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='CASCADE'), nullable=False),
        sa.Column('scraped_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=True),
        sa.Column('season_year', sa.Integer(), nullable=True, index=True),
        sa.Column('current_year', sa.Integer(), nullable=True),
        sa.Column('prev_year', sa.Integer(), nullable=True),
        sa.Column('value_current', sa.Float(), nullable=True),
        sa.Column('value_prev', sa.Float(), nullable=True),
        sa.Column('last_1', sa.Float(), nullable=True),
        sa.Column('last_3', sa.Float(), nullable=True),
        sa.Column('home', sa.Float(), nullable=True),
        sa.Column('away', sa.Float(), nullable=True),
    )
    op.create_index('ix_snapshot_team_cat_created', 'stat_snapshots', ['team_id', 'category_id', 'scraped_at'])
    op.create_index('ix_snapshot_cat_season', 'stat_snapshots', ['category_id', 'season_year'])


def downgrade() -> None:
    op.drop_index('ix_snapshot_cat_season', table_name='stat_snapshots')
    op.drop_index('ix_snapshot_team_cat_created', table_name='stat_snapshots')
    op.drop_table('stat_snapshots')
    op.drop_table('categories')
    op.drop_table('teams')
