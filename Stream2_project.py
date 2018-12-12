from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
import os


app = Flask(__name__)

COLLECTION_NAME = 'project'
MONGO_URI = os.getenv('MONGODB_URI')
DBS_NAME = os.getenv('MONGO_DB_NAME')


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/data")
def project():
    """
    A Flask view to serve the googlePlay data from
    MongoDB in JSON format.
    """

    # A constant that defines the record fields that we wish to retrieve.
    FIELDS = {
        '_id': False, 'Rating': False, 'Android Ver': False, 'Type': False
    }

    # Open a connection to MongoDB using a with statement such that the
    # connection will be closed as soon as we exit the with statement
    with MongoClient(MONGO_URI) as conn:
        # Define which collection we wish to access
        collection = conn[DBS_NAME][COLLECTION_NAME]
        # Retrieve a result set only with the fields defined in FIELD
        projects = collection.find(projection=FIELDS, limit=2000)
        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(projects))


if __name__ == '__main__':
    app.run(debug=True)
