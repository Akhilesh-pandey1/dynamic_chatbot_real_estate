import os
from database import mongo
from try_catch_decorator import exception_handler
from .agents import create_agent_graph
from langchain_core.messages import HumanMessage, AIMessage


def get_initial_state(question, chat_history, username):
    initial_state = {
        "messages": chat_history,
        "intent": "",
        "context": [],
        "current_question": question,
        "response": "",
        "standalone_question": "",
        "username": username
    } 
    return initial_state


@exception_handler
def get_user_chat_response(name, chat_history):
    last_interaction = chat_history[-1]
    last_question = last_interaction[0]
    previous_chat_history = chat_history[:-1]
    embeddings_file = f"embeddings/{name}_embeddings.pkl"
    if not os.path.exists(embeddings_file):
        if mongo.db.users.find_one({"name": name}):
            return {"error": "User knowledge base not found"}, 404
        else:
            return {"error": "User not found"}, 404
    
    # Convert chat history to LangChain message format
    messages = []
    for msg in previous_chat_history:
        messages.append(HumanMessage(content=msg[0]))
        if msg[1]:
            messages.append(AIMessage(content=msg[1]))
    
    # Create and run the agent graph
    graph = create_agent_graph()
    initial_state = get_initial_state(last_question, messages, name)
    final_state = graph.invoke(initial_state)

    print("final_state", final_state)
    
    ai_response = final_state["response"]

    print("ai_response", ai_response)
    
    return {
        "response": ai_response,
    }, 200
            
