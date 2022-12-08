from flask import Flask, send_from_directory, session, jsonify
from flask_session import Session
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS  # comment this on deployment

# from api.HelloApiHandler import HelloApiHandler
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from flask_restful import Api, Resource, reqparse
from datetime import datetime, timedelta
from pytz import all_timezones, timezone
from cs50 import SQL
from werkzeug.security import check_password_hash, generate_password_hash

monthsAbbrev = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
                'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dic']

db = SQL("sqlite:///doMe.db")

pm = 0

now = datetime.now(timezone('CST6CDT'))


class HelloApiHandler(Resource):
    def get(self):
        print(now.year)
        print(now.month)
        print(now.day)
        # print(all_timezones)
        print('loadingggggggg GEEEETTTT')
        taskListYesterday = db.execute(
            "SELECT * FROM pending_tasks WHERE year = ? AND month = ? AND day = ? ORDER BY display_index DESC", now.year, now.month, now.day - 1)
        taskListToday = db.execute(
            "SELECT * FROM pending_tasks WHERE year = ? AND month = ? AND day = ? ORDER BY display_index DESC", now.year, now.month, now.day)
        taskListTomorrow = db.execute(
            "SELECT * FROM pending_tasks WHERE year = ? AND month = ? AND day = ? ORDER BY display_index DESC", now.year, now.month, now.day + 1)
        showDays = db.execute("SELECT show_days FROM ui_settings")
        showDone = db.execute("SELECT show_done FROM ui_settings")
        print(showDays[0]['show_days'])
        print(showDone[0]['show_done'])
        if showDone[0]['show_done']:  # TO BE MODIFIED
            taskListYesterday += db.execute(
                "SELECT * FROM finished_tasks WHERE year = ? AND month = ? AND day = ? ORDER BY display_index DESC", now.year, now.month, now.day - 1)
            taskListToday += db.execute(
                "SELECT * FROM finished_tasks WHERE year = ? AND month = ? AND day = ? ORDER BY display_index DESC", now.year, now.month, now.day)
            taskListTomorrow += db.execute(
                "SELECT * FROM finished_tasks WHERE year = ? AND month = ? AND day = ? ORDER BY display_index DESC", now.year, now.month, now.day + 1)
        return {'tasks': [taskListYesterday, taskListToday, taskListTomorrow], 'showOtherDays': showDays[0]['show_days'], 'showDone': showDone[0]['show_done'], }

    @jwt_required()
    def post(self):
        print(self)
        parser = reqparse.RequestParser()
        parser.add_argument('type', type=str)
        args = parser.parse_args()
        requestType = args['type']
        # LOADING TASKS
        if requestType == 'load':
            print('loadingggggggg POOOOOOSSST')
            parser.add_argument('userId', type=int)
            args = parser.parse_args()
            print('HERE IS THE USER ID:', args['userId'])
            taskListYesterday = db.execute(
                "SELECT * FROM pending_tasks WHERE year = ? AND month = ? AND day = ? AND user_id = ? ORDER BY display_index DESC", now.year, now.month, now.day - 1, args['userId'])
            taskListToday = db.execute(
                "SELECT * FROM pending_tasks WHERE year = ? AND month = ? AND day = ? AND user_id = ? ORDER BY display_index DESC", now.year, now.month, now.day, args['userId'])
            taskListTomorrow = db.execute(
                "SELECT * FROM pending_tasks WHERE year = ? AND month = ? AND day = ? AND user_id = ? ORDER BY display_index DESC", now.year, now.month, now.day + 1, args['userId'])
            showDays = db.execute("SELECT show_days FROM ui_settings")
            showDone = db.execute("SELECT show_done FROM ui_settings")
            print(showDays[0]['show_days'])
            print(showDone[0]['show_done'])
            if showDone[0]['show_done']:  # TO BE MODIFIED
                taskListYesterday += db.execute("SELECT * FROM finished_tasks WHERE year = ? AND month = ? AND day = ? AND user_id = ? ORDER BY display_index DESC",
                                                now.year, now.month, now.day - 1, args['userId'])
                taskListToday += db.execute("SELECT * FROM finished_tasks WHERE year = ? AND month = ? AND day = ? AND user_id = ? ORDER BY display_index DESC",
                                            now.year, now.month, now.day, args['userId'])
                taskListTomorrow += db.execute("SELECT * FROM finished_tasks WHERE year = ? AND month = ? AND day = ? AND user_id = ? ORDER BY display_index DESC",
                                               now.year, now.month, now.day + 1, args['userId'])
            return {'tasks': [taskListYesterday, taskListToday, taskListTomorrow], 'showOtherDays': showDays[0]['show_days'], 'showDone': showDone[0]['show_done'], }
        # DELETING TASKS
        if requestType == 'delete':
            parser.add_argument('taskId', type=str)
            parser.add_argument('done', type=str)
            args = parser.parse_args()
            if int(args['done']):
                db.execute(
                    "DELETE FROM finished_tasks WHERE id = ?", args['taskId'])
            else:
                db.execute("DELETE FROM pending_tasks WHERE id = ?",
                           args['taskId'])
            print(args['taskId'])
            return
        # LOAD HISTORY
        if requestType == 'histo':
            parser.add_argument('userId', type=int)
            args = parser.parse_args()
            print('HERE IS THE USER ID:', args['userId'])
            history = db.execute(
                'SELECT * FROM finished_tasks WHERE user_id = ? ORDER BY id DESC', args['userId'])
            return {'history': history}

        # ADDING TASKS
        if requestType == 'post':
            parser.add_argument('description', type=str)
            parser.add_argument('day', type=str)
            parser.add_argument('userId', type=int)
            args = parser.parse_args()
            print(args['description'], args['day'], args['userId'])
            if args['day'] == 'tomorrow':
                day = now.day + 1
            else:
                day = now.day
            print(now.year)
            print(now.month)
            print(day)
            db.execute("INSERT INTO pending_tasks (display_index, description, year, month, day, user_id) VALUES (((SELECT display_index FROM pending_tasks ORDER BY display_index DESC LIMIT 1) + 1), ?, ?, ?, ?, ?)",
                       args['description'], now.year, now.month, day, args['userId'])
            return
        # TOGGLE DONE STATUS
        if requestType == 'done':
            print('the client called me')
            parser.add_argument('taskId', type=str)
            parser.add_argument('done', type=str)
            args = parser.parse_args()
            if int(args['done']) == 0:
                Tasks = db.execute(
                    "SELECT * FROM pending_tasks WHERE id = ?", args['taskId'])
                doneTask = Tasks[0]
                print(doneTask)
                db.execute("INSERT INTO finished_tasks (display_index, description, year, month, day, user_id) VALUES (((SELECT display_index FROM finished_tasks ORDER BY display_index DESC LIMIT 1) + 1), ?, ?, ?, ?, ?)",
                           doneTask['description'], doneTask['year'], doneTask['month'], doneTask['day'], doneTask['user_id'])
                db.execute("DELETE FROM pending_tasks WHERE id = ?",
                           args['taskId'])
            else:
                Tasks = db.execute(
                    "SELECT * FROM finished_tasks WHERE id = ?", args['taskId'])
                doneTask = Tasks[0]
                print(doneTask)
                db.execute("INSERT INTO pending_tasks (display_index, description, year, month, day, user_id) VALUES ((SELECT display_index FROM pending_tasks ORDER BY display_index ASC LIMIT 1) - 1, ?, ?, ?, ?, ?)",
                           doneTask['description'], doneTask['year'], doneTask['month'], doneTask['day'], doneTask['user_id'])
                db.execute(
                    "DELETE FROM finished_tasks WHERE id = ?", args['taskId'])
            return
        # PASSING YESTERDAY'S UNFINISHED TASKS TO TODAYS LIST
        if requestType == 'pass':
            parser.add_argument('userId', type=int)
            args = parser.parse_args()
            print('Pass tasks of user:')
            print(args['userId'])
            Tasks = db.execute("SELECT * FROM pending_tasks WHERE year = ? AND month = ? AND day = ? AND user_id = ? ORDER BY display_index ASC",
                               now.year, now.month, now.day - 1, args['userId'])

            for task in Tasks:
                print(task)
                maxIndex = db.execute(
                    "SELECT display_index FROM pending_tasks WHERE year = ? AND month = ? AND day = ? ORDER BY display_index DESC LIMIT 1", now.year, now.month, now.day)
                if maxIndex:
                    new_index = maxIndex[0]['display_index'] + 1.0
                else:
                    new_index = 1.0
                print(new_index)
                db.execute("UPDATE pending_tasks SET day = ?, display_index = ? WHERE id = ?",
                           now.day, new_index, task['id'])
            return
        # EXECUTING LIST UPDATES AFTER DRAG AND DROP
        if requestType == 'dnd':
            parser.add_argument('srcId', type=int)
            parser.add_argument('sourceIndex', type=float)
            parser.add_argument('aboveDestContent', type=bool)
            parser.add_argument('aboveDestIndex', type=float)
            parser.add_argument('destinationContent', type=bool)
            parser.add_argument('destinationIndex', type=float)
            parser.add_argument('destinationDone', type=bool)
            parser.add_argument('srcDay', type=int)
            parser.add_argument('destDay', type=int)
            parser.add_argument('belowDestContent', type=bool)
            parser.add_argument('belowDestIndex', type=float)
            args = parser.parse_args()

            print(args['srcId'])
            print(args['sourceIndex'])
            print(args['aboveDestContent'], args['aboveDestIndex'])
            print(args['destinationContent'], args['destinationIndex'])
            print(args['belowDestIndex'])
            print(args['destinationDone'])
            print(args['srcDay'])
            print(args['destDay'])

            if not args['destinationDone']:
                if args['aboveDestContent']:
                    if args['destinationContent']:
                        if args['srcDay'] == args['destDay'] and args['sourceIndex'] > args['destinationIndex']:
                            if args['belowDestContent']:
                                new_index = (
                                    args['destinationIndex'] + args['belowDestIndex'])/2.0
                            else:
                                new_index = args['destinationIndex'] - 1
                        else:
                            new_index = (
                                args['destinationIndex'] + args['aboveDestIndex'])/2.0
                    else:
                        new_index = args['aboveDestIndex'] - 1
                else:
                    if args['destinationContent']:
                        print('hey')
                        new_index = args['destinationIndex'] + 1
                    else:
                        new_index = 1
            else:
                if args['aboveDestContent']:
                    new_index = args['aboveDestIndex'] - 1
                else:
                    new_index = 1

            diff = args['destDay'] - args['srcDay']
            db.execute("UPDATE pending_tasks SET day = ?, display_index = ? WHERE id = ?",
                       now.day - 2 + args['srcDay'] + diff, new_index, args['srcId'])
            return
            # REMEMBERING LIST DISPLAY PREFERENCES
        if requestType == 'toggleDays':
            showDays = db.execute("SELECT show_days FROM ui_settings")
            db.execute("UPDATE ui_settings SET show_days = ?",
                       0 if showDays[0]['show_days'] else 1)
            return
            # REMEMBERING FINISHED TASKS DISPLAY PREFERENCES
        if requestType == 'hideDone':
            showDone = db.execute("SELECT show_done FROM ui_settings")
            db.execute("UPDATE ui_settings SET show_done = ?",
                       0 if showDone[0]['show_done'] else 1)
            print('hey heres the user: ')
            return
        # final_ret = {"status": "Success", "message": message}
        # print(request_type)
        # print(request_json)
        return


class loginApiHandler(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('type', type=str)
        args = parser.parse_args()
        requestType = args['type']
        # LOGIN
        if requestType == 'login':
            print('hi from login')
            parser.add_argument('username', type=str)
            parser.add_argument('password', type=str)
            args = parser.parse_args()
            print(args['username'])
            print(args['password'])
            rows = db.execute(
                "SELECT * FROM users WHERE username = ?", args['username'])
            if len(rows) != 1 or not check_password_hash(rows[0]["hash"], args['password']):
                response = {"msg": "invalid"}
                return response
            access_token = create_access_token(identity=args['username'])
            print(access_token)
            return {"msg": access_token, "id": rows[0]["id"]}
            # REGISTRATION
        if requestType == 'register':
            print('hi from register')
            parser.add_argument('username', type=str)
            parser.add_argument('password', type=str)
            args = parser.parse_args()
            print(args['username'])
            print(args['password'])
            rows = db.execute(
                "SELECT * FROM users WHERE username = ?", args['username'])
            print('registered users')
            print(rows)
            if len(rows) != 0:
                response = jsonify({"msg": "taken"})
                return response
            # REGISTERING NEW USER
            hash = generate_password_hash(
                args['password'], method='pbkdf2:sha256', salt_length=8)
            db.execute(
                "INSERT INTO users (username, hash) VALUES (?, ?)", args['username'], hash)
            rows = db.execute(
                "SELECT * FROM users WHERE username = ?", args['username'])
            access_token = create_access_token(identity=rows[0]["id"])
            print(access_token)
            return {"msg": access_token, "id": rows[0]["id"]}
            # LOGOUT
        if requestType == 'logout':
            response = jsonify({"msg": "logout successful"})
            unset_jwt_cookies(response)
            return response


app = Flask(__name__, static_url_path='', static_folder='react-frontend/build')
CORS(app)  # comment this on deployment
api = Api(app)

app.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=22)
jwt = JWTManager(app)


@app.route("/")
def serve():
    return "ok"


api.add_resource(HelloApiHandler, '/api/tasks')

api.add_resource(loginApiHandler, '/api/login')
