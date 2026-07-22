import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Gemini API
   # Gemini API
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL")
    
    # ChromaDB
    CHROMA_PERSIST_DIR = "./chroma_db"
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    
    # ArangoDB
    ARANGO_HOST = os.getenv("ARANGO_HOST", "http://localhost:8529")
    ARANGO_USERNAME = os.getenv("ARANGO_USERNAME", "root")
    ARANGO_PASSWORD = os.getenv("ARANGO_PASSWORD", "password")
    ARANGO_DB_NAME = "rag_knowledge_graph"
    
    # Embeddings
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"
    
    # Server
    UPLOAD_FOLDER = "./uploads"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # Retrieval
    TOP_K_VECTOR = 5
    TOP_K_GRAPH = 3