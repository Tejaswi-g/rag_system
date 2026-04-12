from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import traceback
from werkzeug.utils import secure_filename
from datetime import datetime
import time

from document_processor import DocumentProcessor
from vector_store import VectorStore
from knowledge_graph import KnowledgeGraph
from hybrid_retriever import HybridRetriever
from conversation_manager import ConversationManager
from llm_handler import LLMHandler
from config import Config

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure app
app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH
app.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER

# Create necessary directories
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.CHROMA_PERSIST_DIR, exist_ok=True)

# Initialize components
print("Initializing system components...")
doc_processor = DocumentProcessor()
vector_store = VectorStore()
knowledge_graph = KnowledgeGraph()
hybrid_retriever = HybridRetriever(vector_store, knowledge_graph)
conv_manager = ConversationManager()
llm_handler = LLMHandler()
print("System initialized successfully!")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "vector_store": "operational",
            "knowledge_graph": "operational",
            "llm": Config.GEMINI_MODEL
        }
    }), 200

@app.route('/upload', methods=['POST'])
def upload_document():
    """Upload and process document"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Validate file type
        allowed_extensions = {'.pdf', '.txt'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({"error": f"File type {file_ext} not supported. Use PDF or TXT"}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        print(f"Processing document: {filename}")
        start_time = time.time()
        
        # Process document
        processed_doc = doc_processor.process_document(file_path, filename)
        
        # Add to vector store
        print(f"Adding {len(processed_doc['chunks'])} chunks to vector store...")
        vector_store.add_documents(processed_doc['chunks'])
        
        # Add to knowledge graph
        print(f"Adding {len(processed_doc['entities'])} entities and {len(processed_doc['relationships'])} relationships to graph...")
        for entity in processed_doc['entities']:
            knowledge_graph.add_entity(entity)
        
        for relationship in processed_doc['relationships']:
            knowledge_graph.add_relationship(relationship)
        
        processing_time = time.time() - start_time
        
        # Clean up uploaded file (optional - keep for reference)
        # os.remove(file_path)
        
        return jsonify({
            "message": "Document processed successfully",
            "document_id": processed_doc['document_id'],
            "filename": filename,
            "chunks": len(processed_doc['chunks']),
            "entities_found": len(processed_doc['entities']),
            "relationships_found": len(processed_doc['relationships']),
            "processing_time_seconds": round(processing_time, 2),
            "text_length": processed_doc['text_length']
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error processing document: {traceback.format_exc()}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/query', methods=['POST'])
def query():
    """Handle user query"""
    try:
        data = request.json
        query_text = data.get('query', '').strip()
        session_id = data.get('session_id')
        
        if not query_text:
            return jsonify({"error": "No query provided"}), 400
        
        # Create new session if not provided
        if not session_id:
            session_id = conv_manager.create_session()
        
        print(f"Processing query: '{query_text[:50]}...' for session {session_id[:8]}")
        start_time = time.time()
        
        # Add user message to conversation
        conv_manager.add_message(session_id, "user", query_text)
        
        # Get conversation history
        history = conv_manager.get_conversation_history(session_id)
        
        # Perform hybrid retrieval
        print("Performing hybrid retrieval...")
        retrieved_context = hybrid_retriever.retrieve(query_text, session_id)
        
        # Generate answer using Gemini
        print(f"Generating answer with {len(retrieved_context)} context items...")
        response = llm_handler.generate_answer(query_text, retrieved_context, history)
        
        # Add assistant response to conversation
        conv_manager.add_message(
            session_id, 
            "assistant", 
            response['answer'], 
            metadata={
                "sources": response['sources'],
                "context_used": len(retrieved_context)
            }
        )
        
        query_time = time.time() - start_time
        
        return jsonify({
            "session_id": session_id,
            "answer": response['answer'],
            "sources": response['sources'],
            "context_used": len(retrieved_context),
            "model": response['model'],
            "query_time_seconds": round(query_time, 2)
        }), 200
        
    except Exception as e:
        print(f"Error processing query: {traceback.format_exc()}")
        return jsonify({"error": f"Error processing query: {str(e)}"}), 500

@app.route('/session/new', methods=['POST'])
def new_session():
    """Create new conversation session"""
    try:
        data = request.json or {}
        session_id = conv_manager.create_session(metadata=data.get('metadata', {}))
        return jsonify({
            "session_id": session_id,
            "message": "Session created successfully"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get conversation history"""
    try:
        session = conv_manager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        return jsonify(session), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/session/<session_id>', methods=['DELETE'])
def clear_session(session_id):
    """Clear conversation session"""
    try:
        if conv_manager.clear_session(session_id):
            return jsonify({"message": "Session cleared successfully"}), 200
        else:
            return jsonify({"error": "Session not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/sessions', methods=['GET'])
def list_sessions():
    """List all sessions"""
    try:
        sessions = conv_manager.list_sessions()
        return jsonify({"sessions": sessions, "count": len(sessions)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/graph/stats', methods=['GET'])
def get_graph_stats():
    """Get knowledge graph statistics"""
    try:
        stats = knowledge_graph.get_graph_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/graph/search', methods=['POST'])
def search_graph():
    """Search entities in knowledge graph"""
    try:
        data = request.json
        query = data.get('query', '').strip()
        limit = data.get('limit', 20)
        
        if not query:
            return jsonify({"error": "No search query provided"}), 400
        
        results = knowledge_graph.search_entities(query, limit=limit)
        return jsonify({
            "query": query,
            "results": results,
            "count": len(results)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/documents', methods=['GET'])
def list_documents():
    """List uploaded documents"""
    try:
        files = []
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.isfile(file_path):
                stat = os.stat(file_path)
                files.append({
                    "filename": filename,
                    "size_bytes": stat.st_size,
                    "uploaded_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "size_mb": round(stat.st_size / (1024 * 1024), 2)
                })
        
        files.sort(key=lambda x: x['uploaded_at'], reverse=True)
        
        return jsonify({
            "documents": files,
            "count": len(files)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/stats', methods=['GET'])
def system_stats():
    """Get overall system statistics"""
    try:
        vector_stats = vector_store.get_stats()
        graph_stats = knowledge_graph.get_graph_stats()
        sessions = conv_manager.list_sessions()
        
        return jsonify({
            "vector_store": vector_stats,
            "knowledge_graph": graph_stats,
            "sessions": {
                "active": len(sessions),
                "total_messages": sum(s.get('message_count', 0) for s in sessions)
            },
            "llm_model": Config.GEMINI_MODEL
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("Advanced RAG System with Gemini API")
    print("="*50)
    print(f"LLM Model: {Config.GEMINI_MODEL}")
    print(f"Vector DB: ChromaDB")
    print(f"Graph DB: ArangoDB")
    print(f"Server running at: http://localhost:5000")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)