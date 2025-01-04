import os
from langchain_groq import ChatGroq
from pathlib import Path
import re
from try_catch_decorator_new import handle_exceptions
from config.organizations import get_org_config

@handle_exceptions
def load_model():
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    LLM_TEMPERATURE = 0.7

    llm_model = ChatGroq(
        api_key=GROQ_API_KEY,
        temperature=LLM_TEMPERATURE,
        model="llama-3.1-70b-versatile",
    )
    return llm_model


@handle_exceptions
def read_prompt_template(prompt_file_name: str, organization=None) -> str:
    org_config = get_org_config(organization)
    current_dir = Path(__file__).parent.parent
    prompts_dir = current_dir / "prompts"
    
    if prompt_file_name == "chatbot-query-analyzer-prompt.md":
        prompt_file_name = "chatbot-query-analyzer-prompt.md"
    elif prompt_file_name == "chatbot-rag-prompt.md":
        prompt_file_name = org_config['prompt_files']['rag']
    
    prompt_path = prompts_dir / prompt_file_name
    with open(prompt_path, 'r', encoding='utf-8') as file:
        content = file.read().strip()
    return content


@handle_exceptions
def parse_intention_response(xml_response: str, state: dict) -> dict:
    response_match = re.search(
        r'<response>(.*?)</response>', xml_response, re.DOTALL)
    response = response_match.group(1) if response_match else None

    greeting_match = re.search(
        r'<greeting>(.*?)</greeting>', xml_response, re.DOTALL)
    greeting = greeting_match.group(
        1).lower() == 'true' if greeting_match else False

    standalone_match = re.search(
        r'<standalone>(.*?)</standalone>', xml_response, re.DOTALL)
    standalone = standalone_match.group(1) if standalone_match else None

    return response, greeting, standalone


@handle_exceptions
def parse_llm_response(xml_response: str) -> str:
    response_match = re.search(
        r'<response>(.*?)</response>', xml_response, re.DOTALL)

    if response_match:
        response = response_match.group(1).strip()
        return None if response.lower() == "none" else response

    return None
