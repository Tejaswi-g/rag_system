import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import numpy as np
from config import Config
import uuid

class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=Config.CHROMA_PERSIST_DIR,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Initialize embedding model
        self.embedding_model = SentenceTransformer(Config.EMBEDDING_MODEL)
        self.collection_name = "document_chunks"
        
        # Create or get collection
        try:
            self.collection = self.client.get_collection(self.collection_name)
        except:
            self.collection = self.client.create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for texts"""
        if not texts:
            return []
        
        # Process in batches for efficiency
        batch_size = 32
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            embeddings = self.embedding_model.encode(
                batch, 
                show_progress_bar=False,
                convert_to_numpy=True
            )
            all_embeddings.extend(embeddings.tolist())
        
        return all_embeddings
    
    def add_documents(self, chunks: List[Dict[str, Any]]) -> None:
        """Add document chunks to vector store"""
        if not chunks:
            return
        
        texts = [chunk["text"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]
        ids = [f"{chunk['metadata']['chunk_id']}_{uuid.uuid4().hex[:8]}" for chunk in chunks]
        
        # Generate embeddings
        print(f"Generating embeddings for {len(texts)} chunks...")
        embeddings = self.generate_embeddings(texts)
        
        if not embeddings:
            print("No embeddings generated")
            return
        
        # Add to collection in batches
        batch_size = 100
        for i in range(0, len(texts), batch_size):
            end_idx = min(i + batch_size, len(texts))
            self.collection.add(
                embeddings=embeddings[i:end_idx],
                documents=texts[i:end_idx],
                metadatas=metadatas[i:end_idx],
                ids=ids[i:end_idx]
            )
        
        print(f"Successfully added {len(texts)} chunks to vector store")
    
    def similarity_search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Perform similarity search"""
        try:
            # Check if collection has any documents
            if self.collection.count() == 0:
                print("Vector store is empty")
                return []
            
            # Ensure k is not larger than collection size
            k = min(k, self.collection.count())
            if k == 0:
                return []
            
            query_embedding = self.generate_embeddings([query])
            if not query_embedding:
                return []
            
            results = self.collection.query(
                query_embeddings=query_embedding,
                n_results=k,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            formatted_results = []
            if results['ids'] and results['ids'][0]:
                for i in range(len(results['ids'][0])):
                    # Convert distance to similarity score (cosine distance to similarity)
                    distance = results['distances'][0][i]
                    similarity = 1 - (distance / 2)  # Normalize to 0-1 range
                    
                    formatted_results.append({
                        "id": results['ids'][0][i],
                        "text": results['documents'][0][i],
                        "metadata": results['metadatas'][0][i],
                        "score": max(0, min(1, similarity))
                    })
            
            return formatted_results
            
        except Exception as e:
            print(f"Error in similarity search: {str(e)}")
            return []
    
    def delete_document(self, document_id: str) -> int:
        """Delete all chunks of a document"""
        try:
            results = self.collection.get(
                where={"document_id": document_id}
            )
            
            if results['ids']:
                self.collection.delete(ids=results['ids'])
                return len(results['ids'])
        except Exception as e:
            print(f"Error deleting document: {str(e)}")
        
        return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get vector store statistics"""
        try:
            return {
                "total_chunks": self.collection.count(),
                "collection_name": self.collection_name,
                "embedding_model": Config.EMBEDDING_MODEL
            }
        except:
            return {"error": "Could not retrieve stats", "total_chunks": 0}