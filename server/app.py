# The server is very simple - it doesn't even serve the webpages.
# The server's primary purpose is transferring data about the gameboard from one
# player to the other.
from flask import Flask, request
from flask_cors import CORS
import pickle
app = Flask(__name__)

CORS(app)

@app.route('/')
def index():
    return "<a>Bottlecap Checkers</a>"

@app.route('/create',methods=['POST'])
def logStartCode():
    # Called by the player who creates the code.
    # Stores the code in a pickle file.
    try:
        codes = pickle.load(open("codes_waiting.p","rb"))
    except: # File not found
        codes = set()
    code = request.get_json(force=True)['code']
    print("Game code received:",code)
    codes.add(code)
    pickle.dump(codes,open("codes_waiting.p","wb"))
    return "complete"

@app.route('/start',methods=['POST'])
def startGame():
    # Called by the player who joins.
    # Determines if the code is valid, and then
    # adds the code to codes_playing.p and creates
    # a pickle file to store the game state.
    codes = pickle.load(open("codes_waiting.p","rb"))
    code = request.get_json(force=True)["code"]
    print(code)
    if code in codes:
        try:
            codes_playing = pickle.load(open("codes_playing.p","rb"))
        except: # File not found
            codes_playing = set()
        codes_playing.add(code) # add code to playing
        codes = codes-{code} # remove code from waitroom
        pickle.dump(codes_playing,open("codes_playing.p","wb"))
        pickle.dump(codes,open("codes_waiting.p","wb"))
        pickle.dump({"player":0,"0":[],"1":[]},open(code+'.p','wb'))
        return "complete"
    return "code not found"

@app.route('/gamestarted',methods=['POST'])
def hasGameStarted():
    # Called by the player waiting for their friend to join.
    code = request.get_json(force=True)['code']
    print("has game",code,"started yet?",end=" ")
    try:
        codes = pickle.load(open("codes_playing.p","rb"))
    except:
        print("file has not been created yet")
        codes = set()
        pickle.dump(codes,open("codes_playing.p","wb"))
        return "no"
    if code in codes:
        print("yes")
        return "yes"
    print("no")
    print(codes)
    return "no"

@app.route('/send',methods=['POST'])
def receiveUpdate():
    d = request.get_json(force=True)
    code = d["code"]
    player = d["player"]
    red = d["0"]
    blue = d["1"]
    pickle.dump({"player":player,"0":red,"1":blue},open(code+'.p','wb'))
    return "complete"

@app.route('/get',methods=['POST'])
def sendUpdate():
    code = request.get_json(force=True)['code']
    data = pickle.load(open(code+'.p','rb'))
    return str(data).replace("'",'"')

app.run('0.0.0.0')