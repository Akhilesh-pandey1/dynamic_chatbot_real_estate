from .agents import create_agent_graph
from langchain_core.messages import HumanMessage, AIMessage
from try_catch_decorator_new import handle_exceptions


@handle_exceptions
def get_initial_state(question, chat_history, username, organization):
    initial_state = {
        "messages": chat_history,
        "intent": "",
        "context": [],
        "current_question": question,
        "response": "",
        "standalone_question": "",
        "username": username,
        "organization": organization
    }
    return initial_state


@handle_exceptions
def get_user_chat_response(name, chat_history, organization):
    """Generates a chat response for a user based on their chat history."""
    last_interaction = chat_history[-1]
    last_question = last_interaction[0]
    previous_chat_history = chat_history[:-1]
    messages = []
    for msg in previous_chat_history:
        messages.append(HumanMessage(content=msg[0]))
        if msg[1]:
            messages.append(AIMessage(content=msg[1]))
    graph = create_agent_graph()
    initial_state = get_initial_state(
        last_question, messages, name, organization)
    final_state = graph.invoke(initial_state)
    ai_response = final_state["response"]
    print("ai_response", ai_response, flush=True)
    return {
        "response": ai_response,
    }, 200
