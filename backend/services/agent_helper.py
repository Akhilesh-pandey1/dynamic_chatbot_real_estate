import os
from langchain_groq import ChatGroq
from pathlib import Path
from try_catch_decorator import exception_handler
import re


@exception_handler
def load_model():
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    LLM_TEMPERATURE = 0.7

    llm_model = ChatGroq(
        api_key=GROQ_API_KEY,
        temperature=LLM_TEMPERATURE,
        model="llama-3.1-70b-versatile",
    )
    return llm_model


@exception_handler
def read_prompt_template(prompt_file_name: str) -> str:
    current_dir = Path(__file__).parent.parent
    prompts_dir = current_dir / "prompts"
    prompt_path = prompts_dir / prompt_file_name
    with open(prompt_path, 'r', encoding='utf-8') as file:
        content = file.read().strip()
    return content


@exception_handler
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


@exception_handler
def parse_llm_response(xml_response: str) -> str:
    response_match = re.search(
        r'<response>(.*?)</response>', xml_response, re.DOTALL)

    if response_match:
        response = response_match.group(1).strip()
        return None if response.lower() == "none" else response

    return None
