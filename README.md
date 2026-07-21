# GraphRAG – Enterprise AI Knowledge Intelligence Platform

## Overview

GraphRAG is an AI-powered Knowledge Intelligence Platform that combines **Retrieval-Augmented Generation (RAG)** with a **Knowledge Graph** to provide more accurate, explainable, and context-aware answers from enterprise documents.

Unlike traditional RAG systems that rely only on vector similarity search, GraphRAG extracts entities and relationships from uploaded documents, constructs a knowledge graph, and combines graph traversal with semantic retrieval to improve response quality.

The application provides an enterprise-grade interface for document management, knowledge exploration, AI-powered conversations, and analytics.

---

# Features

### AI Assistant

* Chat with uploaded documents using GraphRAG
* Context-aware responses
* Session history
* Source citations
* Retrieved document chunks
* Knowledge graph context panel

---

### Document Intelligence Center

* Drag & Drop document upload
* PDF and TXT support
* Document repository
* Search and filtering
* Processing status
* Knowledge pipeline visualization
* Document metadata inspector

---

### Knowledge Explorer

* Entity search
* Relationship analytics
* Knowledge graph statistics
* Entity inspector
* Relationship distribution
* Entity category visualization

---

### Analytics Dashboard

* AI usage statistics
* Document statistics
* Entity statistics
* Relationship statistics
* Knowledge growth metrics
* Recent activity

---

# Technology Stack

## Frontend

* React.js
* Material UI (MUI)
* Framer Motion
* Recharts
* React Dropzone
* Axios

---

## Backend

* Python
* Flask
* LangChain
* FAISS Vector Store
* Sentence Transformers
* spaCy
* NetworkX
* OpenAI / LLM API

---

## Database

* FAISS (Vector Database)
* In-Memory Knowledge Graph
* ArangoDB Support (Optional)

---

# Project Architecture

```
                User
                  │
                  ▼
          React Frontend (MUI)
                  │
                  ▼
            Flask Backend
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
Vector Store   Knowledge     LLM
 (FAISS)         Graph      (OpenAI)
    │             │
    └───────Hybrid Retriever───────┘
                  │
                  ▼
          Context Generation
                  │
                  ▼
            AI Response
```

---

# Workflow

## 1. Document Upload

* User uploads PDF/TXT documents.
* Files are processed by the backend.
* Text is extracted.
* Documents are chunked.
* Embeddings are generated.
* Entities and relationships are extracted.
* Knowledge graph is updated.
* Vector store is updated.

---

## 2. User Query

The user asks a question through the AI Assistant.

---

## 3. Hybrid Retrieval

The system performs:

* Semantic similarity search using FAISS
* Entity lookup
* Relationship traversal
* Context aggregation

---

## 4. LLM Generation

The retrieved context is passed to the LLM.

The LLM generates an explainable answer using:

* Retrieved document chunks
* Knowledge graph relationships
* User question

---

# Folder Structure

```
GraphRAG/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── knowledge_graph.py
│   ├── hybrid_retriever.py
│   ├── entity_extractor.py
│   ├── vector_store.py
│   ├── llm.py
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │
│   ├── components/
│   │   ├── ChatInterface.js
│   │   ├── DocumentUpload.js
│   │   ├── GraphVisualization.js
│   │   ├── Dashboard.js
│   │   ├── Sidebar.js
│   │   ├── TopHeader.js
│   │   └── Home.js
│   │
│   ├── theme.js
│   └── App.js
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd GraphRAG
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate

# Windows

venv\Scripts\activate

pip install -r requirements.txt
```

---

## Start Backend

```bash
python app.py
```

Backend runs on

```
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

---

## Start Frontend

```bash
npm start
```

Frontend runs on

```
http://localhost:3000
```

---

# API Endpoints

## Documents

```
GET /documents
```

Returns uploaded documents.

---

```
POST /upload
```

Uploads a document.

---

## AI Assistant

```
POST /query
```

Generates GraphRAG responses.

---

```
POST /session/new
```

Creates a new conversation.

---

```
GET /sessions
```

Returns conversation history.

---

## Knowledge Explorer

```
GET /graph/stats
```

Returns

* Entity Count
* Relationship Count
* Top Entities
* Top Relationships

---

```
POST /graph/search
```

Searches entities.

---

# GraphRAG Pipeline

```
Upload Document
        │
        ▼
Text Extraction
        │
        ▼
Document Chunking
        │
        ▼
Embedding Generation
        │
        ▼
Vector Database (FAISS)
        │
        ▼
Entity Extraction
        │
        ▼
Relationship Extraction
        │
        ▼
Knowledge Graph
        │
        ▼
Hybrid Retrieval
        │
        ▼
LLM
        │
        ▼
Answer Generation
```

---

# UI Modules

## Home

* AI Command Center
* Recent Activity
* Workspace Overview
* Knowledge Statistics

---

## AI Assistant

* Conversation History
* Chat Workspace
* Graph Context Panel
* Source References

---

## Documents

* Knowledge Repository
* Search
* Filters
* Upload
* Document Cards
* Inspector Panel

---

## Knowledge Explorer

* Entity Explorer
* Knowledge Insights
* Relationship Analytics
* Entity Inspector

---

## Dashboard

* Executive Analytics
* AI Metrics
* Knowledge Metrics
* Activity Timeline

---

# Future Enhancements

* Interactive Knowledge Graph Visualization
* ArangoDB Integration
* Multi-user Workspaces
* Role-Based Access Control (RBAC)
* Document Collections
* Graph Traversal Visualization
* Knowledge Graph Export
* AI Agent Workflows
* Streaming Responses
* Real-time Processing Status

---

# Key Advantages

* Hybrid Retrieval (Vector + Knowledge Graph)
* Explainable AI Responses
* Entity-Aware Retrieval
* Relationship-Based Reasoning
* Enterprise Knowledge Management
* Modern AI Workspace
* Scalable Architecture
* Modular React Components
* Responsive Enterprise UI

---

#
