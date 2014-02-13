from urllib.parse import urlparse
from pyramid.renderers import JSON
from bson.objectid import ObjectId
import datetime
import pymongo


def includeme(config):
    settings = config.get_settings()
    mongo_db_url = urlparse(settings['mongo_uri'])
    settings['mongo_db_url'] = mongo_db_url
    settings['mongo_db_name'] = mongo_db_url.path[1:]
    settings['mongo_hostname'] = mongo_db_url.hostname
    settings['mongo_port'] = int(mongo_db_url.port or 27017)
    connection = pymongo.MongoClient(host=mongo_db_url.hostname,
                                     port=mongo_db_url.port)
    config.registry.mongo_connection = connection
    json_mongo_renderer = JSON()
    json_mongo_renderer.add_adapter(ObjectId, bson_adapter)
    json_mongo_renderer.add_adapter(datetime.datetime, datetime_adapter)
    json_mongo_renderer.add_adapter(pymongo.cursor.Cursor, json_cursor_adapter)
    config.add_renderer('json', json_mongo_renderer)


def mongo_db_connection(request):
    mongo_db_name = request.registry.settings['mongo_db_name']
    connection = request.registry.mongo_connection
    return connection[mongo_db_name]


def bson_adapter(obj, request):
    return str(obj)


def datetime_adapter(obj, request):
    return obj.isoformat()


def json_cursor_adapter(obj, request):
    return list(obj)
