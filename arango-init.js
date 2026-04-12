// ArangoDB initialization script
db._createDatabase("rag_knowledge_graph");
db._useDatabase("rag_knowledge_graph");

// Create collections
db._create("entities");
db._createEdgeCollection("relationships");

// Create indexes for better performance
db.entities.ensureIndex({ type: "hash", fields: ["entity_id"], unique: true });
db.entities.ensureIndex({ type: "fulltext", fields: ["text"] });
db.entities.ensureIndex({ type: "hash", fields: ["label"] });
db.entities.ensureIndex({ type: "skiplist", fields: ["frequency"] });

db.relationships.ensureIndex({ type: "hash", fields: ["predicate"] });
db.relationships.ensureIndex({ type: "skiplist", fields: ["frequency"] });

print("ArangoDB initialization completed successfully!");
print("Database: rag_knowledge_graph");
print("Collections: entities, relationships");