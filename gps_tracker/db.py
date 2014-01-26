from urllib.parse import urlparse
import pymongo


def includeme(config):
    settings = config.registry.settings

    db_url = urlparse(settings['mongo_uri'])
    conn = pymongo.Connection(host=db_url.hostname, port=db_url.port)
    settings['db_conn'] = conn

    # Extending the request object with db
    def _get_db(request):
        settings = request.registry.settings
        db = settings['db_conn'][db_url.path[1:]]
        if db_url.username and db_url.password:
            db.authenticate(db_url.username, db_url.password)
        return db

    config.add_request_method(_get_db, 'db', reify=True)
