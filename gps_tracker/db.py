from urllib.parse import urlparse
import pymongo


def includeme(request):
    settings = request.registry.settings
    mongo_db_url = urlparse(settings['mongo_uri'])
    settings['mongo_db_url'] = mongo_db_url
    settings['mongo_db_name'] = mongo_db_url.path[1:]
    settings['mongo_hostname'] = mongo_db_url.hostname
    settings['mongo_port'] = int(mongo_db_url.port or 27017)
    connection = pymongo.MongoClient(host=mongo_db_url.hostname,
                                     port=mongo_db_url.port)
    request.registry.mongo_connection = connection


def db_connection(request):
    mongo_db_name = request.registry.settings['mongo_db_name']
    connection = request.registry.mongo_connection
    return connection[mongo_db_name]
