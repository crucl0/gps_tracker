from urllib.parse import urlparse
import pymongo


def db_connection(request):
        settings = request.registry.settings
        db_url = urlparse(settings['mongo_uri'])
        conn = pymongo.Connection(host=db_url.hostname, port=db_url.port)
        settings['db_conn'] = conn
        db = settings['db_conn'][db_url.path[1:]]
        return db
