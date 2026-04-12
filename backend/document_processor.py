import os
import uuid
from typing import List, Dict, Any
import PyPDF2
import spacy
import re
from config import Config

class DocumentProcessor:
    def __init__(self):
        self.chunk_size = Config.CHUNK_SIZE
        self.chunk_overlap = Config.CHUNK_OVERLAP
        
        # Load spaCy model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    text += page_text + "\n"
        except Exception as e:
            raise Exception(f"Error extracting PDF text: {str(e)}")
        return text
    
    def extract_text_from_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        encodings = ['utf-8', 'latin-1', 'cp1252']
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as file:
                    return file.read()
            except UnicodeDecodeError:
                continue
        raise Exception("Could not decode text file with common encodings")
    
    def split_text_into_chunks(self, text: str) -> List[str]:
        """Split text into overlapping chunks"""
        chunks = []
        
        # Clean the text
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Split by sentences first
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        current_chunk = ""
        for sentence in sentences:
            if len(current_chunk) + len(sentence) <= self.chunk_size:
                current_chunk += " " + sentence if current_chunk else sentence
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                
                # Start new chunk with overlap
                if len(current_chunk) > self.chunk_overlap:
                    overlap_text = current_chunk[-self.chunk_overlap:]
                    current_chunk = overlap_text + " " + sentence
                else:
                    current_chunk = sentence
        
        # Add the last chunk
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        # If no chunks were created (very short text), create one chunk
        if not chunks and text:
            chunks = [text]
        
        return chunks
    
    def chunk_document(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Split document into chunks with metadata"""
        chunks = self.split_text_into_chunks(text)
        chunked_documents = []
        
        for i, chunk in enumerate(chunks):
            if len(chunk.strip()) > 50:  # Only keep meaningful chunks
                chunked_documents.append({
                    "text": chunk.strip(),
                    "metadata": {
                        **metadata,
                        "chunk_index": i,
                        "chunk_id": f"{metadata.get('document_id', 'doc')}_chunk_{i}",
                        "char_start": -1,
                        "char_end": -1
                    }
                })
        
        return chunked_documents
    
    def extract_entities_and_relationships(self, text: str) -> Dict[str, List]:
        """Extract entities and relationships from text using spaCy"""
        # Process in chunks to avoid memory issues
        max_length = 100000
        text_chunk = text[:max_length]
        
        doc = self.nlp(text_chunk)
        
        entities = []
        entity_texts = set()
        
        # Extract entities with deduplication
        for ent in doc.ents:
            if ent.text.lower() not in entity_texts and len(ent.text) > 1:
                entity_texts.add(ent.text.lower())
                entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char
                })
        
        # Extract relationships
        relationships = []
        for sent in doc.sents:
            # Find subject-verb-object patterns
            for token in sent:
                if token.dep_ == "ROOT" and token.pos_ == "VERB":
                    subjects = [child for child in token.children 
                               if child.dep_ in ["nsubj", "nsubjpass"]]
                    objects = [child for child in token.children 
                              if child.dep_ in ["dobj", "pobj", "attr"]]
                    
                    for subj in subjects:
                        for obj in objects:
                            if len(subj.text) > 1 and len(obj.text) > 1:
                                relationships.append({
                                    "subject": subj.text,
                                    "predicate": token.lemma_,
                                    "object": obj.text,
                                    "sentence": sent.text[:200]
                                })
        
        # Limit to prevent overwhelming the graph
        return {
            "entities": entities[:100],
            "relationships": relationships[:50]
        }
    
    def process_document(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Process uploaded document"""
        # Extract text based on file type
        if filename.lower().endswith('.pdf'):
            text = self.extract_text_from_pdf(file_path)
        elif filename.lower().endswith('.txt'):
            text = self.extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file format: {filename}")
        
        if not text or len(text.strip()) < 100:
            raise ValueError("Document contains insufficient text")
        
        # Generate document ID
        doc_id = str(uuid.uuid4())
        
        # Extract entities and relationships
        print(f"Extracting entities and relationships...")
        extracted_info = self.extract_entities_and_relationships(text)
        
        # Chunk document
        print(f"Chunking document...")
        chunks = self.chunk_document(text, {
            "document_id": doc_id,
            "filename": filename,
            "source": file_path,
            "total_length": len(text)
        })
        
        print(f"Created {len(chunks)} chunks, found {len(extracted_info['entities'])} entities, {len(extracted_info['relationships'])} relationships")
        
        return {
            "document_id": doc_id,
            "filename": filename,
            "chunks": chunks,
            "entities": extracted_info["entities"],
            "relationships": extracted_info["relationships"],
            "total_chunks": len(chunks),
            "text_length": len(text)
        }