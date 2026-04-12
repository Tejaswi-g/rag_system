from typing import List, Dict, Any
import re
from vector_store import VectorStore
from knowledge_graph import KnowledgeGraph
from config import Config

class HybridRetriever:
    def __init__(self, vector_store: VectorStore, knowledge_graph: KnowledgeGraph):
        self.vector_store = vector_store
        self.knowledge_graph = knowledge_graph
    
    def retrieve(self, query: str, session_id: str = None) -> List[Dict[str, Any]]:
        """Perform hybrid retrieval combining vector and graph results"""
        
        # 1. Vector similarity search
        vector_results = self.vector_store.similarity_search(query, k=Config.TOP_K_VECTOR)
        
        # 2. Extract potential entities from query
        entities = self._extract_query_entities(query)
        
        # 3. Query knowledge graph for related information
        graph_results = []
        for entity in entities[:3]:
            related = self.knowledge_graph.query_related_entities(entity, hops=2)
            graph_results.extend(related)
        
        # 4. Combine and rank results
        combined_results = self._combine_and_rank(vector_results, graph_results, query)
        
        return combined_results
    
    def _extract_query_entities(self, query: str) -> List[str]:
        """Extract potential entity mentions from query"""
        # Clean and tokenize
        query = query.lower().strip()
        
        # Remove question words and common stop words
        stop_words = {
            'what', 'is', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 
            'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'are', 'was',
            'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
            'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must',
            'who', 'whom', 'whose', 'which', 'that', 'this', 'these', 'those'
        }
        
        # Extract words and phrases
        words = query.split()
        
        # Single words
        entities = [word for word in words if word not in stop_words and len(word) > 2]
        
        # Bigrams (two-word phrases)
        bigrams = []
        for i in range(len(words) - 1):
            if words[i] not in stop_words or words[i+1] not in stop_words:
                bigram = f"{words[i]} {words[i+1]}"
                if len(bigram) > 4:
                    bigrams.append(bigram)
        
        entities.extend(bigrams)
        
        # Extract proper nouns using simple capitalization patterns
        proper_nouns = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', query)
        entities.extend([pn.lower() for pn in proper_nouns])
        
        # Remove duplicates and limit
        unique_entities = list(dict.fromkeys(entities))
        
        return unique_entities[:5]
    
    def _combine_and_rank(self, vector_results: List[Dict], graph_results: List[Dict], query: str) -> List[Dict]:
        """Combine and rank results from different sources"""
        combined = []
        
        # Add vector results with high weight
        for result in vector_results:
            combined.append({
                "source_type": "vector",
                "content": result["text"],
                "metadata": result["metadata"],
                "relevance_score": result["score"] * 0.7,
                "source_id": result["id"],
                "raw_score": result["score"]
            })
        
        # Add graph results
        for result in graph_results:
            if result.get('entity'):
                # Create context from graph information
                depth = result.get('depth', 1)
                relationship = result.get('relationship', 'related')
                
                context = f"Related information: {result['entity']} "
                if relationship:
                    context += f"(relationship: {relationship})"
                
                # Calculate graph relevance score
                graph_score = 0.5 * (1.0 / (depth + 0.5))
                if result.get('frequency'):
                    graph_score *= min(1.0, result['frequency'] / 10)
                
                combined.append({
                    "source_type": "graph",
                    "content": context,
                    "metadata": {"graph_info": result},
                    "relevance_score": graph_score,
                    "source_id": f"graph_{result.get('entity', 'unknown')}",
                    "raw_score": graph_score
                })
        
        # Sort by relevance score
        combined.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        # Remove duplicates based on content similarity
        unique_results = []
        seen_content = set()
        
        for result in combined:
            # Create a hash of the first 200 characters
            content_hash = hash(result["content"][:200])
            if content_hash not in seen_content:
                seen_content.add(content_hash)
                unique_results.append(result)
        
        # Return top results
        return unique_results[:Config.TOP_K_VECTOR + Config.TOP_K_GRAPH]