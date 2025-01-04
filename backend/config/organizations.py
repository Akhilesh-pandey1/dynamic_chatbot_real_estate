import os

ORGANIZATIONS = {
    'manufacturing': {
        'db_url': os.getenv('MANUFACTURING_DB_URL'),
        'prompt_type': 'manufacturing',
        'prompt_files': {
            'rag': 'manufacturing-rag-prompt.md'
        }
    },
    'finance': {
        'db_url': os.getenv('FINANCE_DB_URL'),
        'prompt_type': 'finance',
        'prompt_files': {
            'rag': 'finance-rag-prompt.md'
        }
    },
    'real_estate': {
        'db_url': os.getenv('REAL_ESTATE_DB_URL'),
        'prompt_type': 'real_estate',
        'prompt_files': {
            'rag': 'real-estate-rag-prompt.md'
        }
    },
    'general': {
        'db_url': os.getenv('GENERAL_DB_URL'),
        'prompt_type': 'general',
        'prompt_files': {
            'rag': 'chatbot-rag-prompt.md'
        }
    }
}

DEFAULT_ORG = 'general'

def get_org_config(org_name=None):
    if not org_name or org_name not in ORGANIZATIONS:
        return ORGANIZATIONS[DEFAULT_ORG]
    return ORGANIZATIONS[org_name] 