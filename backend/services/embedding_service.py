import os
import pickle
from langchain_community.embeddings import JinaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from try_catch_decorator import exception_handler

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
def save_user_embeddings(username, text):
    if not text:
        return {"error": "Text is required"}, 400
    
    directory = create_user_embedding_directory()
    documents = [Document(page_content=text)]
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
    
    response, status_code = save_user_embeddings(username, new_text)
    return response, status_code