import psycopg2

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port="5432",
        database="your_database_name",
        user="postgres",
        password="your_password"
    )
