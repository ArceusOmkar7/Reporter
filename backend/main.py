from flask import Flask, request
from flask_cors import CORS
from database import create_connection

app = Flask(__name__)

# add cors config to allow all origins
# allow all origins for all routes
CORS(app, resources={r"/api/*": {"origins": "*"}})


cnx = create_connection("localhost", "root", "1234", "reporter_py")


""" API Routes for user entity """

# -- GET Methods --


@app.route('/api/user/all', methods=['GET'])
def get_all_users():
    """ Get all users """
    cursor = cnx.cursor()
    if request.args.get('userinfo'):
        cursor.execute(
            "SELECT * FROM users NATURAL JOIN user_info")
    else:
        cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    # to get the output in form of a dictionary with column names as keys
    users = [dict(zip(cursor.column_names, user)) for user in users]

    cursor.close()
    return {"users": users}


@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    """ Get user by ID """
    cursor = cnx.cursor()
    if request.args.get('userinfo'):
        cursor.execute(
            "SELECT * FROM users NATURAL JOIN user_info WHERE userID = %s", (user_id,))
    else:
        cursor.execute("SELECT * FROM users WHERE userID = %s", (user_id,))
    user = cursor.fetchone()
    # to get the output in form of a dictionary with column names as keys
    user = dict(zip(cursor.column_names, user))
    cursor.close()
    return {"user": user}


@app.route('/api/user/<string:username>', methods=['GET'])
def get_user_by_username(username):
    """ Get user by username """
    cursor = cnx.cursor()
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    # to get the output in form of a dictionary with column names as keys
    user = dict(zip(cursor.column_names, user))
    cursor.close()
    return {"user": user}

# -- POST Methods --


@app.route('/api/user', methods=['POST'])
def create_user():
    """ Create a new user """
    cursor = cnx.cursor()
    data = request.get_json()
    cursor.execute(
        "INSERT INTO users (username, password) VALUES (%s, %s)", (data['username'], data['password']))
    cnx.commit()
    cursor.close()
    return {"message": "User created successfully"}, 201


@app.route('/api/user/info', methods=['POST'])
def create_user_info():
    """ Add user info """
    cursor = cnx.cursor()
    data = request.get_json()
    cursor.execute(
        "INSERT INTO user_info (userID, firstName, lastName, email) VALUES (%s, %s, %s, %s)", (data['userID'], data['firstName'], data['lastName'], data['email']))
    cnx.commit()
    cursor.close()
    return {"message": "User info created successfully"}, 201


# -- PUT Methods --

@app.route('/api/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """ Update user """
    cursor = cnx.cursor()
    data = request.get_json()
    cursor.execute(
        "UPDATE users SET username = %s, password = %s WHERE userID = %s", (data['username'], data['password'], user_id))
    cnx.commit()
    cursor.close()
    return {"message": "User updated successfully"}


@app.route('/api/user/info/<int:user_id>', methods=['PUT'])
def update_user_info(user_id):
    """ Update user info """
    cursor = cnx.cursor()
    data = request.get_json()
    cursor.execute(
        "UPDATE user_info SET firstName = %s, lastName = %s, email = %s WHERE userID = %s", (data['firstName'], data['lastName'], data['email'], user_id))
    cnx.commit()
    cursor.close()
    return {"message": "User info updated successfully"}


# -- DELETE Methods --

@app.route('/api/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """ Delete user """
    cursor = cnx.cursor()
    cursor.execute("DELETE FROM users WHERE userID = %s", (user_id,))
    cnx.commit()
    cursor.close()
    return {"message": "User deleted successfully"}


@app.route('/api/user/info/<int:user_id>', methods=['DELETE'])
def delete_user_info(user_id):
    """ Delete user info """
    cursor = cnx.cursor()
    cursor.execute("DELETE FROM user_info WHERE userID = %s", (user_id,))
    cnx.commit()
    cursor.close()
    return {"message": "User info deleted successfully"}


app.run(port=5000, debug=True)
