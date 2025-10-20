# d:\AISupervisor\flask_app\models.py

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy import Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
  pass

db = SQLAlchemy(model_class=Base)

class Customer(db.Model):
    __tablename__ = 'customers'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now())
    
    requests: Mapped[list["HelpRequest"]] = relationship(back_populates="customer")

class HelpRequest(db.Model):
    __tablename__ = 'help_requests'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")
    answer: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now())
    resolved_at: Mapped[str] = mapped_column(DateTime, nullable=True)

    customer: Mapped["Customer"] = relationship(back_populates="requests")

class KnowledgeBaseEntry(db.Model):
    __tablename__ = 'knowledge_base'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    question: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=True)
    learned_at: Mapped[str] = mapped_column(DateTime, server_default=func.now())
    usage_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
