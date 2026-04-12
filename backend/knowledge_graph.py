# from arango import ArangoClient
# from arango.exceptions import CollectionCreateError, DatabaseCreateError
# from typing import List, Dict, Any
# import hashlib
# from config import Config

# class KnowledgeGraph:
#     def __init__(self):
#         self.client = ArangoClient(hosts=Config.ARANGO_HOST)
#         self.db = None
#         self._initialize_database()
    
#     def _initialize_database(self):
#         """Initialize ArangoDB database and collections"""
#         try:
#             # Connect to system database
#             sys_db = self.client.db(
#                 '_system', 
#                 username=Config.ARANGO_USERNAME, 
#                 password=Config.ARANGO_PASSWORD
#             )
            
#             # Create database if not exists
#             if not sys_db.has_database(Config.ARANGO_DB_NAME):
#                 sys_db.create_database(Config.ARANGO_DB_NAME)
#                 print(f"Created database: {Config.ARANGO_DB_NAME}")
            
#             self.db = self.client.db(
#                 Config.ARANGO_DB_NAME, 
#                 username=Config.ARANGO_USERNAME, 
#                 password=Config.ARANGO_PASSWORD
#             )
            
#             # Create collections
#             if not self.db.has_collection('entities'):
#                 self.db.create_collection('entities')
#                 print("Created 'entities' collection")
            
#             if not self.db.has_collection('relationships'):
#                 self.db.create_collection('relationships', edge=True)
#                 print("Created 'relationships' edge collection")
            
#             # Create indexes
#             entities = self.db.collection('entities')
#             entities.add_hash_index(fields=['entity_id'], unique=True)
#             entities.add_fulltext_index(fields=['text'])
#             entities.add_hash_index(fields=['label'], unique=False)
            
#             relationships = self.db.collection('relationships')
#             relationships.add_hash_index(fields=['predicate'], unique=False)
            
#         except Exception as e:
#             print(f"Error initializing database: {str(e)}")
#             raise
    
#     def add_entity(self, entity: Dict[str, Any]) -> str:
#         """Add or update entity in graph"""
#         try:
#             entities = self.db.collection('entities')
            
#             # Create unique entity ID
#             entity_text = entity['text'].lower().strip()
#             entity_id = hashlib.md5(f"{entity_text}_{entity['label']}".encode()).hexdigest()
            
#             # Check if entity exists
#             cursor = entities.find({'entity_id': entity_id})
#             existing = list(cursor)
            
#             if existing:
#                 # Update existing entity
#                 doc = existing[0]
#                 doc['frequency'] = doc.get('frequency', 0) + 1
#                 doc['last_seen'] = entity.get('timestamp', None)
#                 entities.update(doc)
#             else:
#                 # Create new entity
#                 doc = {
#                     '_key': entity_id,
#                     'entity_id': entity_id,
#                     'text': entity['text'],
#                     'label': entity['label'],
#                     'frequency': 1,
#                     'document_count': 1
#                 }
#                 entities.insert(doc)
            
#             return entity_id
            
#         except Exception as e:
#             print(f"Error adding entity: {str(e)}")
#             return None
    
#     def add_relationship(self, relationship: Dict[str, Any]) -> bool:
#         """Add relationship between entities"""
#         try:
#             # Get or create entities
#             subject_id = self.add_entity({
#                 'text': relationship['subject'], 
#                 'label': 'UNKNOWN'
#             })
#             object_id = self.add_entity({
#                 'text': relationship['object'], 
#                 'label': 'UNKNOWN'
#             })
            
#             if not subject_id or not object_id:
#                 return False
            
#             relationships = self.db.collection('relationships')
            
#             # Create edge ID
#             edge_key = hashlib.md5(
#                 f"{subject_id}_{relationship['predicate']}_{object_id}".encode()
#             ).hexdigest()
            
#             # Check if relationship exists
#             cursor = relationships.find({'_key': edge_key})
#             existing = list(cursor)
            
#             if not existing:
#                 edge = {
#                     '_key': edge_key,
#                     '_from': f"entities/{subject_id}",
#                     '_to': f"entities/{object_id}",
#                     'predicate': relationship['predicate'],
#                     'frequency': 1,
#                     'sentences': [relationship.get('sentence', '')]
#                 }
#                 relationships.insert(edge)
#                 return True
            
#             return False
            
#         except Exception as e:
#             print(f"Error adding relationship: {str(e)}")
#             return False
    
#     def query_related_entities(self, entity_text: str, hops: int = 2) -> List[Dict[str, Any]]:
#         """Query graph for related entities using AQL"""
#         try:
#             # First find the entity
#             entities = self.db.collection('entities')
#             cursor = entities.find({'text': {'LIKE': f'%{entity_text}%'}})
#             start_entities = list(cursor.limit(1))
            
#             if not start_entities:
#                 return []
            
#             start_key = start_entities[0]['_key']
            
#             # AQL query for graph traversal
#             query = """
#             FOR v, e, p IN 1..@hops ANY @start_entity relationships
#                 OPTIONS {uniqueVertices: 'path'}
#                 LIMIT 50
#                 RETURN DISTINCT {
#                     entity: v.text,
#                     label: v.label,
#                     relationship: e.predicate,
#                     depth: LENGTH(p.edges),
#                     path: p.vertices[*].text,
#                     frequency: v.frequency
#                 }
#             """
            
#             bind_vars = {
#                 'start_entity': f"entities/{start_key}",
#                 'hops': hops
#             }
            
#             cursor = self.db.aql.execute(query, bind_vars=bind_vars)
#             results = list(cursor)
            
#             # Sort by depth and frequency
#             results.sort(key=lambda x: (x['depth'], -x.get('frequency', 0)))
            
#             return results
            
#         except Exception as e:
#             print(f"Error querying related entities: {str(e)}")
#             return []
    
#     def search_entities(self, query_text: str, limit: int = 20) -> List[Dict[str, Any]]:
#         """Search for entities in graph"""
#         try:
#             entities = self.db.collection('entities')
            
#             # Use text search
#             cursor = entities.find(
#                 {'text': {'LIKE': f'%{query_text}%'}},
#                 limit=limit
#             )
            
#             results = list(cursor)
            
#             # Sort by frequency
#             results.sort(key=lambda x: x.get('frequency', 0), reverse=True)
            
#             return results
            
#         except Exception as e:
#             print(f"Error searching entities: {str(e)}")
#             return []
    
#     def get_graph_stats(self) -> Dict[str, Any]:
#         """Get graph statistics"""
#         try:
#             entities = self.db.collection('entities')
#             relationships = self.db.collection('relationships')
            
#             # Get top entities
#             cursor = entities.find(limit=10)
#             top_entities = list(cursor)
#             top_entities.sort(key=lambda x: x.get('frequency', 0), reverse=True)
            
#             # Get relationship types distribution
#             aql_query = """
#             FOR r IN relationships
#                 COLLECT predicate = r.predicate WITH COUNT INTO count
#                 SORT count DESC
#                 LIMIT 10
#                 RETURN {predicate: predicate, count: count}
#             """
            
#             cursor = self.db.aql.execute(aql_query)
#             top_relationships = list(cursor)
            
#             return {
#                 'entity_count': entities.count(),
#                 'relationship_count': relationships.count(),
#                 'top_entities': top_entities[:10],
#                 'top_relationships': top_relationships,
#                 'database': Config.ARANGO_DB_NAME
#             }
            
#         except Exception as e:
#             print(f"Error getting graph stats: {str(e)}")
#             return {'error': str(e)}
from typing import List, Dict, Any
import hashlib
from config import Config

class KnowledgeGraph:
    def __init__(self):
        # In-memory storage for testing without ArangoDB
        self.entities = {}
        self.relationships = []
        self.use_arangodb = False  # Set to True when ArangoDB is available
        
        print("⚠️ KnowledgeGraph initialized in MEMORY MODE (ArangoDB not connected)")
        print("💡 To use full features, start ArangoDB: docker run -d --name arangodb -p 8529:8529 -e ARANGO_ROOT_PASSWORD=password arangodb:3.11")
        
        if self.use_arangodb:
            self._initialize_arangodb()
    
    def _initialize_arangodb(self):
        """Initialize ArangoDB connection"""
        try:
            from arango import ArangoClient
            self.client = ArangoClient(hosts=Config.ARANGO_HOST)
            sys_db = self.client.db('_system', username=Config.ARANGO_USERNAME, password=Config.ARANGO_PASSWORD)
            
            if not sys_db.has_database(Config.ARANGO_DB_NAME):
                sys_db.create_database(Config.ARANGO_DB_NAME)
            
            self.db = self.client.db(Config.ARANGO_DB_NAME, username=Config.ARANGO_USERNAME, password=Config.ARANGO_PASSWORD)
            
            if not self.db.has_collection('entities'):
                self.db.create_collection('entities')
            if not self.db.has_collection('relationships'):
                self.db.create_collection('relationships', edge=True)
                
            print("✅ ArangoDB connected successfully")
            self.use_arangodb = True
        except Exception as e:
            print(f"⚠️ ArangoDB connection failed: {str(e)}")
            print("💡 Continuing with in-memory storage...")
            self.use_arangodb = False
    
    def add_entity(self, entity: Dict[str, Any]) -> str:
        """Add or update entity"""
        entity_text = entity['text'].lower().strip()
        entity_id = hashlib.md5(f"{entity_text}_{entity['label']}".encode()).hexdigest()
        
        if entity_id in self.entities:
            self.entities[entity_id]['frequency'] += 1
        else:
            self.entities[entity_id] = {
                'entity_id': entity_id,
                'text': entity['text'],
                'label': entity['label'],
                'frequency': 1,
                'document_count': 1
            }
        
        return entity_id
    
    def add_relationship(self, relationship: Dict[str, Any]) -> bool:
        """Add relationship between entities"""
        try:
            subject_id = self.add_entity({'text': relationship['subject'], 'label': 'UNKNOWN'})
            object_id = self.add_entity({'text': relationship['object'], 'label': 'UNKNOWN'})
            
            self.relationships.append({
                'subject_id': subject_id,
                'object_id': object_id,
                'subject': relationship['subject'],
                'object': relationship['object'],
                'predicate': relationship['predicate'],
                'sentence': relationship.get('sentence', '')
            })
            
            return True
        except Exception as e:
            print(f"Error adding relationship: {str(e)}")
            return False
    
    def query_related_entities(self, entity_text: str, hops: int = 2) -> List[Dict[str, Any]]:
        """Query for related entities"""
        results = []
        entity_text_lower = entity_text.lower()
        
        # Find matching entities
        matching_entities = []
        for entity_id, entity in self.entities.items():
            if entity_text_lower in entity['text'].lower():
                matching_entities.append(entity)
        
        # Find relationships
        for rel in self.relationships:
            if rel['subject'].lower() == entity_text_lower:
                results.append({
                    'entity': rel['object'],
                    'label': 'RELATED',
                    'relationship': rel['predicate'],
                    'depth': 1,
                    'path': [rel['subject'], rel['object']],
                    'frequency': 1
                })
            elif rel['object'].lower() == entity_text_lower:
                results.append({
                    'entity': rel['subject'],
                    'label': 'RELATED',
                    'relationship': rel['predicate'],
                    'depth': 1,
                    'path': [rel['object'], rel['subject']],
                    'frequency': 1
                })
        
        return results[:10]
    
    def search_entities(self, query_text: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search for entities"""
        results = []
        query_lower = query_text.lower()
        
        for entity_id, entity in self.entities.items():
            if query_lower in entity['text'].lower():
                results.append(entity)
        
        # Sort by frequency
        results.sort(key=lambda x: x.get('frequency', 0), reverse=True)
        
        return results[:limit]
    
    def get_graph_stats(self) -> Dict[str, Any]:
        """Get graph statistics"""
        top_entities = sorted(
            self.entities.values(), 
            key=lambda x: x.get('frequency', 0), 
            reverse=True
        )[:10]
        
        # Count relationship types
        rel_types = {}
        for rel in self.relationships:
            pred = rel['predicate']
            rel_types[pred] = rel_types.get(pred, 0) + 1
        
        top_relationships = [
            {'predicate': k, 'count': v} 
            for k, v in sorted(rel_types.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
        
        return {
            'entity_count': len(self.entities),
            'relationship_count': len(self.relationships),
            'top_entities': top_entities,
            'top_relationships': top_relationships,
            'database': 'In-Memory Storage',
            'mode': 'MEMORY (No ArangoDB)'
        }