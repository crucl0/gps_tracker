from urllib.parse import urlparse
import pymongo


def includeme(request):
    settings = request.registry.settings
    db_url = urlparse(settings['mongo_uri'])
    settings['db_url'] = db_url
    connection = pymongo.MongoClient(host=db_url.hostname, port=db_url.port)
    request.registry.mongo_connection = connection


def db_connection(request):
    db_url = request.registry.settings['db_url']
    db = request.registry.mongo_connection[db_url.path[1:]]
    return db
