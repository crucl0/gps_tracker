from pyramid.config import Configurator
from urllib.parse import urlparse
import pymongo


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.add_static_view('static', 'static', cache_max_age=3600)

    db_url = urlparse(settings['mongo_uri'])
    config.registry.db = pymongo.Connection(
        host=db_url.hostname,
        port=db_url.port,)

    def add_db(request):
        db = config.registry.db[db_url.path[1:]]
        if db_url.username and db_url.password:
            db.authenticate(db_url.username, db_url.password)
        return db

    config.add_request_method(add_db, 'db', reify=True)

    config.add_route('main', '/')
    config.add_route('points', '/points')
    config.add_route('detail', '/points/{id}')
    config.scan()
    return config.make_wsgi_app()
