# d:\AISupervisor\flask_app\routes.py

from flask import Blueprint, jsonify, request
from sqlalchemy.sql import func
from flask_app.models import db, HelpRequest, Customer, KnowledgeBaseEntry

api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/')
def index():
    return jsonify({"message": "Flask app is running!"})

@api.route('/requests', methods=['GET'])
def get_requests():
    """Get all help requests with customer info."""
    try:
        requests = db.session.execute(db.select(HelpRequest).order_by(HelpRequest.created_at.desc())).scalars().all()
        
        result = []
        for req in requests:
            customer = db.session.get(Customer, req.customer_id)
            result.append({
                'id': req.id,
                'question': req.question,
                'status': req.status,
                'answer': req.answer,
                'createdAt': req.created_at.isoformat(),
                'resolvedAt': req.resolved_at.isoformat() if req.resolved_at else None,
                'customer': {
                    'id': customer.id,
                    'name': customer.name,
                    'phone': customer.phone,
                    'createdAt': customer.created_at.isoformat(),
                }
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching help requests: {e}")
        return jsonify({"error": "Failed to fetch help requests"}), 500

@api.route('/requests/<int:id>', methods=['GET'])
def get_request(id):
    """Get a specific help request with customer info."""
    try:
        req = db.session.get(HelpRequest, id)
        if not req:
            return jsonify({"error": "Request not found"}), 404

        customer = db.session.get(Customer, req.customer_id)
        result = {
            'id': req.id,
            'question': req.question,
            'status': req.status,
            'answer': req.answer,
            'createdAt': req.created_at.isoformat(),
            'resolvedAt': req.resolved_at.isoformat() if req.resolved_at else None,
            'customer': {
                'id': customer.id,
                'name': customer.name,
                'phone': customer.phone,
                'createdAt': customer.created_at.isoformat(),
            }
        }
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching help request: {e}")
        return jsonify({"error": "Failed to fetch help request"}), 500

@api.route('/requests', methods=['POST'])
def create_request():
    """Create a new help request."""
    try:
        data = request.get_json()
        if not data or 'customerId' not in data or 'question' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        # Check if customer exists
        customer = db.session.get(Customer, data['customerId'])
        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        new_request = HelpRequest(
            customer_id=data['customerId'],
            question=data['question']
        )
        db.session.add(new_request)
        db.session.commit()

        print(f"📞 NEW ESCALATION: Customer {data['customerId']} asked: \"{data['question']}\"")
        print(f"🔔 SUPERVISOR NOTIFICATION: New help request #{new_request.id} needs your attention")

        return jsonify({
            'id': new_request.id,
            'customerId': new_request.customer_id,
            'question': new_request.question,
            'status': new_request.status,
            'answer': new_request.answer,
            'createdAt': new_request.created_at.isoformat(),
            'resolvedAt': new_request.resolved_at.isoformat() if new_request.resolved_at else None,
        }), 201
    except Exception as e:
        print(f"Error creating help request: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to create help request"}), 500

@api.route('/requests/<int:id>/answer', methods=['PATCH'])
def answer_request(id):
    """Submit an answer to a help request."""
    try:
        data = request.get_json()
        if not data or 'answer' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        # Update request status to processing
        req = db.session.get(HelpRequest, id)
        if not req:
            return jsonify({"error": "Request not found"}), 404

        req.status = "processing"
        db.session.commit()

        # Get request with customer info
        customer = db.session.get(Customer, req.customer_id)

        # Update request with answer
        req.answer = data['answer']
        req.status = "resolved"
        req.resolved_at = func.now()
        db.session.commit()

        # Simulate immediate callback to customer
        print("\n" + "=".repeat(80))
        print("📱 IMMEDIATE CALLBACK TO CUSTOMER")
        print("=".repeat(80))
        print(f"Customer: {customer.name} ({customer.phone})")
        print(f"AI Agent: \"Sorry for the delay. {data['answer']}\"")
        print("=".repeat(80) + "\n")

        # Add to knowledge base
        kb_entry = KnowledgeBaseEntry(
            question=req.question,
            answer=data['answer'],
            category="supervisor-taught",
        )
        db.session.add(kb_entry)
        db.session.commit()

        print(f"📚 KNOWLEDGE BASE UPDATED: Entry #{kb_entry.id} added")
        print(f"   Question: \"{req.question}\"")
        print(f"   Answer: \"{data['answer']}\"\n")

        return jsonify({
            'id': req.id,
            'question': req.question,
            'status': req.status,
            'answer': req.answer,
            'createdAt': req.created_at.isoformat(),
            'resolvedAt': req.resolved_at.isoformat() if req.resolved_at else None,
        })

    except Exception as e:
        print(f"Error updating help request: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to update help request"}), 500

@api.route('/knowledge', methods=['GET'])
def get_knowledge_base_entries():
    """Get all knowledge base entries."""
    try:
        entries = db.session.execute(db.select(KnowledgeBaseEntry).order_by(KnowledgeBaseEntry.learned_at.desc())).scalars().all()
        
        result = []
        for entry in entries:
            result.append({
                'id': entry.id,
                'question': entry.question,
                'answer': entry.answer,
                'category': entry.category,
                'learnedAt': entry.learned_at.isoformat(),
                'usageCount': entry.usage_count,
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching knowledge base entries: {e}")
        return jsonify({"error": "Failed to fetch knowledge base entries"}), 500

@api.route('/knowledge/search', methods=['GET'])
def search_knowledge_base():
    """Search the knowledge base."""
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({"error": "Query parameter 'q' is required"}), 400

        # Simple search using LIKE
        results = db.session.execute(
            db.select(KnowledgeBaseEntry)
            .filter(KnowledgeBaseEntry.question.ilike(f'%{query}%'))
        ).scalars().all()

        result = []
        for entry in results:
            result.append({
                'id': entry.id,
                'question': entry.question,
                'answer': entry.answer,
                'category': entry.category,
                'learnedAt': entry.learned_at.isoformat(),
                'usageCount': entry.usage_count,
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error searching knowledge base: {e}")
        return jsonify({"error": "Failed to search knowledge base"}), 500

@api.route('/customers', methods=['POST'])
def create_customer():
    """Create a new customer."""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'phone' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        # Check if customer already exists
        existing = db.session.execute(
            db.select(Customer).filter_by(phone=data['phone'])
        ).scalar_one_or_none()

        if existing:
            return jsonify({
                'id': existing.id,
                'name': existing.name,
                'phone': existing.phone,
                'createdAt': existing.created_at.isoformat(),
            })

        new_customer = Customer(
            name=data['name'],
            phone=data['phone']
        )
        db.session.add(new_customer)
        db.session.commit()

        print(f"👤 NEW CUSTOMER: {new_customer.name} ({new_customer.phone})")

        return jsonify({
            'id': new_customer.id,
            'name': new_customer.name,
            'phone': new_customer.phone,
            'createdAt': new_customer.created_at.isoformat(),
        }), 201

    except Exception as e:
        print(f"Error creating customer: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to create customer"}), 500

@api.route('/customers/phone/<phone>', methods=['GET'])
def get_customer_by_phone(phone):
    """Get a customer by phone number."""
    try:
        customer = db.session.execute(
            db.select(Customer).filter_by(phone=phone)
        ).scalar_one_or_none()

        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        return jsonify({
            'id': customer.id,
            'name': customer.name,
            'phone': customer.phone,
            'createdAt': customer.created_at.isoformat(),
        })

    except Exception as e:
        print(f"Error fetching customer: {e}")
        return jsonify({"error": "Failed to fetch customer"}), 500

