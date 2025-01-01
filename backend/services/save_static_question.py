from services.chatbot_service import get_user_chat_response
from database import mongo
from try_catch_decorator_new import handle_exceptions
from tenacity import retry, wait_fixed, stop_after_attempt
from try_catch_decorator_new import CustomException


@handle_exceptions
def list_static_questions():
    questions = ["Give me the contact information. In your response, try to use nouns more than pronouns.",
                 "What are the services do you offer? In your response, try to use nouns more than pronouns.",
                 "How are you different from others? In your response, try to use nouns more than pronouns."]
    return questions


@handle_exceptions
@retry(wait=wait_fixed(60), stop=stop_after_attempt(2))
def call_chatbot_service(name, question):
    response, status_code = get_user_chat_response(name, [[question, ""]])
    return response['response']


@handle_exceptions
def question_answering_on_static_question(name):
    questions = list_static_questions()
    answers = []
    for question in questions:
        response = call_chatbot_service(name, question)
        answers.append(response)
    mongo.db.users.update_one(
        {"name": name}, {"$set": {"static_answers": answers}})
    return answers


@handle_exceptions
def list_static_questions_for_frontend(name):
    questions = ["Give me the contact information.",
                 "What are the services do you offer?",
                 "How are you different from others?"]
    return questions


@handle_exceptions
def get_question_answer_on_static_question(name):
    questions = list_static_questions_for_frontend(name)
    user_data = mongo.db.users.find_one({"name": name})
    if not user_data or "static_answers" not in user_data:
        raise CustomException("Static answers not found for this user")
    answers = user_data["static_answers"]
    result = []
    for question, answer in zip(questions, answers):
        result.append([question, answer])
    return result
