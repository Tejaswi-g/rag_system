from typing import Dict, List, Any
from datetime import datetime
import uuid
import json
import os
from pathlib import Path

class ConversationManager:
    def __init__(self):
        self.sessions = {}
        self.storage_path = Path("./conversations")
        try:
            self.storage_path.mkdir(exist_ok=True)
        except:
            pass
        self._load_sessions()
    
    def create_session(self, metadata: Dict = None) -> str:
        """Create a new conversation session"""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "id": session_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "messages": [],
            "metadata": metadata if metadata else {},
            "context": {
                "last_query": None,
                "last_answer": None,
                "mentioned_entities": [],
                "current_topic": None,
                "document_references": []
            }
        }
        self._save_session(session_id)
        return session_id
    
    def add_message(self, session_id: str, role: str, content: str, metadata: Dict = None) -> bool:
        """Add a message to conversation history"""
        if session_id not in self.sessions:
            self.create_session()
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata if metadata else {}
        }
        
        self.sessions[session_id]["messages"].append(message)
        self.sessions[session_id]["updated_at"] = datetime.now().isoformat()
        
        # Update context
        if role == "user":
            self.sessions[session_id]["context"]["last_query"] = content
            # Extract simple keywords for context
            words = content.lower().split()
            keywords = [w for w in words if len(w) > 3][:5]
            self.sessions[session_id]["context"]["mentioned_entities"].extend(keywords)
        elif role == "assistant":
            self.sessions[session_id]["context"]["last_answer"] = content
        
        # Save to disk
        self._save_session(session_id)
        return True
    
    def get_conversation_history(self, session_id: str, limit: int = 10) -> List[Dict]:
        """Get recent conversation history"""
        if session_id not in self.sessions:
            return []
        
        messages = self.sessions[session_id]["messages"]
        return messages[-limit:]
    
    def get_context(self, session_id: str) -> Dict:
        """Get session context"""
        if session_id not in self.sessions:
            return {}
        return self.sessions[session_id]["context"]
    
    def get_session(self, session_id: str) -> Dict:
        """Get full session data"""
        return self.sessions.get(session_id, {})
    
    def _save_session(self, session_id: str) -> None:
        """Save session to disk"""
        try:
            if session_id in self.sessions:
                file_path = self.storage_path / f"{session_id}.json"
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(self.sessions[session_id], f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving session {session_id}: {str(e)}")
    
    def _load_sessions(self) -> None:
        """Load all sessions from disk"""
        try:
            if self.storage_path.exists():
                for file_path in self.storage_path.glob("*.json"):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            session = json.load(f)
                            self.sessions[session["id"]] = session
                    except Exception as e:
                        print(f"Error loading session file {file_path}: {str(e)}")
        except Exception as e:
            print(f"Error loading sessions: {str(e)}")
    
    def clear_session(self, session_id: str) -> bool:
        """Clear a conversation session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            file_path = self.storage_path / f"{session_id}.json"
            if file_path.exists():
                try:
                    file_path.unlink()
                except:
                    pass
            return True
        return False
    
    def list_sessions(self) -> List[Dict]:
        """List all sessions with metadata"""
        sessions_list = []
        for session_id, session in self.sessions.items():
            sessions_list.append({
                "id": session_id,
                "created_at": session.get("created_at"),
                "updated_at": session.get("updated_at"),
                "message_count": len(session.get("messages", [])),
                "metadata": session.get("metadata", {})
            })
        
        # Sort by updated_at
        sessions_list.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return sessions_list