"""Initial schema: generations, experiments, projects.

Safe on databases created by the old hand-written SQLite code: tables that already
exist are left untouched (their data is kept) and Alembic simply records version 0001.
"""
import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def _create(name, *columns):
    if not sa.inspect(op.get_bind()).has_table(name):
        op.create_table(name, sa.Column("id", sa.Integer, primary_key=True), sa.Column("ts", sa.Float), *columns)


def upgrade():
    _create("generations", sa.Column("platform", sa.String(40)), sa.Column("tone", sa.String(40)), sa.Column("language", sa.String(20)),
            sa.Column("ms", sa.Integer), sa.Column("chars", sa.Integer), sa.Column("model", sa.String(80)))
    _create("experiments", sa.Column("label", sa.String(60)), sa.Column("prompt", sa.Text), sa.Column("output", sa.Text),
            sa.Column("ms", sa.Integer), sa.Column("model", sa.String(80)))
    _create("projects", sa.Column("title", sa.String(120)), sa.Column("platform", sa.String(40)), sa.Column("text", sa.Text))


def downgrade():
    for t in ("projects", "experiments", "generations"):
        op.drop_table(t)
