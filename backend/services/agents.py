from typing import Dict, TypedDict, List
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph import StateGraph, Graph, END
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from .agent_helper import load_model, read_prompt_template, parse_intention_response, parse_llm_response
from .embedding_service import get_relevant_chunks


class AgentState(TypedDict):
    messages: List[BaseMessage]
    greeting: bool
    context: List[str]
    current_question: str
    response: str
    standalone_question: str
    username: str


def create_user_intention_node(state):
    llm = load_model()
    prompt = read_prompt_template("chatbot-query-analyzer-prompt.md")
    prompt_template = PromptTemplate(template=prompt, input_variables=[
                                     "chat_history", "current_question"])

    chat_history = "Empty" if not state["messages"] else state["messages"]
    current_question = state["current_question"]

    answer_check_chain = prompt_template | llm | StrOutputParser()
    response = answer_check_chain.invoke({
        "chat_history": chat_history,
        "current_question": current_question
    })
    response, greeting, standalone = parse_intention_response(response, state)
    state["response"] = response
    state["greeting"] = greeting
    state["standalone_question"] = standalone
    return state


def create_rag_node(state):
    llm = load_model()
    relevant_chunks = get_relevant_chunks(
        state["username"], state["current_question"])
    context = "Empty" if not relevant_chunks else "\n".join(relevant_chunks)

    # Convert messages to chat history string format
    chat_history = "Empty"
    if state["messages"]:
        chat_history = "\n".join([
            f"User: {msg.content}" if isinstance(msg, HumanMessage)
            else f"Assistant: {msg.content}"
            for msg in state["messages"]
        ])

    prompt = read_prompt_template("chatbot-rag-prompt.md")
    prompt_template = PromptTemplate(template=prompt, input_variables=[
                                     "context", "chat_history", "current_question"])

    answer_check_chain = prompt_template | llm | StrOutputParser()
    response = answer_check_chain.invoke({
        "context": context,
        "chat_history": chat_history,
        "current_question": state["current_question"]
    })

    response = parse_llm_response(response)
    state["response"] = response
    return state


def rag_needed(state):
    if state["greeting"] == True:
        return False
    return True


def nodes_of_graph(workflow: StateGraph):
    workflow.add_node("user_intention", create_user_intention_node)
    workflow.add_node("rag", create_rag_node)
    return workflow


def flow_of_graph(workflow: StateGraph):
    workflow.set_entry_point("user_intention")
    workflow.add_conditional_edges(
        "user_intention",
        rag_needed,
        {
            True: "rag",
            False: END
        }
    )
    workflow.add_edge("rag", END)

    return workflow


def create_agent_graph() -> Graph:
    workflow = StateGraph(AgentState)
    workflow = nodes_of_graph(workflow)
    workflow = flow_of_graph(workflow)
    return workflow.compile()
