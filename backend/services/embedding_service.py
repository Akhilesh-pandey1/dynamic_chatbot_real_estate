import os
import pickle
from langchain_community.embeddings import JinaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from try_catch_decorator import exception_handler
from datetime import datetime
from database import mongo

@exception_handler
def embedding_function():
    embedding_model = JinaEmbeddings(model_name='jina-embeddings-v2-base-en')
    return embedding_model

@exception_handler
def create_user_embedding_directory():
    directory = f"embeddings"
    if not os.path.exists(directory):
        os.makedirs(directory)
    return directory

@exception_handler
def chunk_text(text: str) -> list:
    chunks = [chunk.strip() for chunk in text.split('\n\n')]
    chunks = [chunk for chunk in chunks if chunk]
    print("len(chunks)", len(chunks))
    for i, chunk in enumerate(chunks):
        print(f"Chunk {i}: {chunk[:100]}...")  
    return chunks

@exception_handler
def save_user_embeddings(username, text):
    if not text:
        return {"error": "Text is required"}, 400
    
    chunks = chunk_text(text)
    if not chunks:
        return {"error": "No valid text chunks found"}, 400
    
    documents = [Document(page_content=chunk) for chunk in chunks]
    
    directory = create_user_embedding_directory()
    embedding_model = embedding_function()
    db = FAISS.from_documents(documents, embedding_model)
    
    file_path = f"{directory}/{username}_embeddings.pkl"
    with open(file_path, "wb") as f:
        pickle.dump(db, f)

    return {"message": f"Embeddings saved successfully for user {username}"}, 201

@exception_handler
def modify_user_embeddings(username, new_text):
    if not new_text:
        return {"error": "New text is required"}, 400
    
    file_path = f"embeddings/{username}_embeddings.pkl"
    if not os.path.exists(file_path):
        return {"error": "User embeddings not found"}, 404
        
    os.remove(file_path)
    
    modified_at = datetime.utcnow()
    mongo.db.users.update_one(
        {"name": username},
        {
            "$set": {"created_at": modified_at},
            "$inc": {"modifications": 1}
        }
    )
    
    response, status_code = save_user_embeddings(username, new_text)
    return response, status_code

@exception_handler
def get_relevant_chunks(username: str, query: str, k: int = 3) -> list:
    file_path = f"embeddings/{username}_embeddings.pkl"
    if not os.path.exists(file_path):
        print(f"Embeddings file not found for user: {username}")
        return []
    
    with open(file_path, "rb") as f:
        vectorstore = pickle.load(f)
    results = vectorstore.similarity_search_with_score(query, k=k)
    relevant_chunks = []

    for doc, score in results:
        print(f"Document Score: {score}")
        relevant_chunks.append(doc.page_content)
    return relevant_chunks