from urllib.parse import urlparse
import pymongo


def db_connection(request):
        settings = request.registry.settings
        db_url = urlparse(settings['mongo_uri'])
        connection = pymongo.MongoClient(host=db_url.hostname, port=db_url.port)
        request.registry.mongo_connect = connection
        db = request.registry.mongo_connect[db_url.path[1:]]
        return db
