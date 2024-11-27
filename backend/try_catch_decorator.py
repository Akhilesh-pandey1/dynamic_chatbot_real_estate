from functools import wraps

def exception_handler(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except FileNotFoundError as e:
            print(f"\n\nFile not found in function '{f.__name__}': {str(e)}")
            raise Exception(e)
        except OSError as e:
            print(f"\n\nOS error in function '{f.__name__}': {str(e)}")
            raise Exception(e)
        except ValueError as e:
            print(f"\n\nValue error in function '{f.__name__}': {str(e)}")
            raise Exception(e)  
        except Exception as e:
            print(f"\n\nInternal server error in function '{f.__name__}': {str(e)}")
            raise Exception(e)

    return decorated_function 