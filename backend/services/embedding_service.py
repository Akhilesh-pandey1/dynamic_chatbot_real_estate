import pickle
from langchain_community.embeddings import JinaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from try_catch_decorator_new import handle_exceptions
from datetime import datetime
from gridfs import GridFS
import io
from database import mongo
import os
from config.organizations import ORGANIZATIONS

@handle_exceptions
def embedding_function():
    api_key = os.getenv('JINA_API_KEY')
    if not api_key:
        raise ValueError("JINA_API_KEY not found in environment variables")
    embedding_model = JinaEmbeddings(
        api_key=api_key,
        model_name='jina-embeddings-v2-base-en'
    )
    return embedding_model


@handle_exceptions
def chunk_text(text: str) -> list:
    """Split text into chunks by double newlines and return non-empty chunks."""
    chunks = [chunk.strip() for chunk in text.split('\n\n')]
    chunks = [chunk for chunk in chunks if chunk]
    print("len(chunks)", len(chunks))
    for i, chunk in enumerate(chunks):
        print(f"Chunk {i}: {chunk[:100]}...")
    return chunks


@handle_exceptions
def save_user_embeddings(username, text, organization=None):
    if not username:
        raise ValueError("Username is required")
    if not text:
        raise ValueError("Text is required")
    if not isinstance(text, str):
        raise TypeError("Text must be a string")

    chunks = chunk_text(text)
    if not chunks:
        raise ValueError("No valid text chunks found")

    documents = [Document(page_content=chunk) for chunk in chunks]
    embedding_model = embedding_function()
    db = FAISS.from_documents(documents, embedding_model)

    buffer = io.BytesIO()
    pickle.dump(db, buffer)

    fs = GridFS(mongo.get_db(organization))
    fs.put(buffer.getvalue(), filename=f"{username}_embeddings")

    return {"message": "Embeddings saved successfully"}, 201


@handle_exceptions
def modify_user_embeddings(username, new_text, organization=None):
    """Updates existing embeddings for a user with new text and tracks modifications."""
    if not new_text:
        raise ValueError("New text is required")
    db = mongo.get_db(organization)
    fs = GridFS(db)
    existing_file = fs.find_one({"filename": f"{username}_embeddings"})

    fs.delete(existing_file._id)
    modified_at = datetime.utcnow()
    db.users.update_one(
        {"name": username},
        {
            "$set": {"created_at": modified_at},
            "$inc": {"modifications": 1}
        }
    )
    response, status_code = save_user_embeddings(username, new_text, organization)
    return response, status_code


@handle_exceptions
def get_relevant_chunks(username: str, query: str, organization=None, k: int = 3) -> list:
    fs = GridFS(mongo.get_db(organization))
    file_data = fs.find_one({"filename": f"{username}_embeddings"})

    if not file_data:
        print(f"No embeddings found for user: {username}")
        return []

    buffer = io.BytesIO(file_data.read())
    stored_data = pickle.loads(buffer.getvalue())
    
    # Get query embedding
    embedding_model = embedding_function()
    query_embedding = embedding_model.embed_query(query)
    
    # Use stored index directly
    results = stored_data.similarity_search_by_vector(query_embedding, k=k)
    chunks = [doc.page_content for doc in results]
    return chunks


@handle_exceptions
def get_embedding_statistics(organization=None):
    """Returns total size and count of embeddings stored in GridFS."""
    db = mongo.get_db(organization)
    total_size = 0
    total_embeddings = 0

    user_count = db.users.count_documents({})

    fs = GridFS(db)
    for grid_file in fs.find({"filename": {"$regex": "_embeddings$"}}):
        total_size += grid_file.length
        total_embeddings += 1

    return {
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "total_embeddings": user_count
    }, 200


@handle_exceptions
def get_all_organizations_embedding_stats():
    all_stats = {}
    total_size = 0
    total_embeddings = 0
    
    for org_name in ORGANIZATIONS.keys():
        response, _ = get_embedding_statistics(org_name)
        all_stats[org_name] = response
        total_size += response['total_size_mb']
        total_embeddings += response['total_embeddings']
    
    all_stats['total'] = {
        'total_size_mb': total_size,
        'total_embeddings': total_embeddings
    }
    
    return all_stats, 200
