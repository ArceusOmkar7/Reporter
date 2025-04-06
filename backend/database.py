import mysql.connector as connector


def create_connection(host_name, user_name, user_password, db_name):
    connection = None
    try:
        connection = connector.connect(
            host=host_name,
            user=user_name,
            password=user_password,
            database=db_name
        )
        print("Connection to MySQL DB successful")
    except connector.Error as e:
        print(f"The error '{e}' occurred")
    return connection
