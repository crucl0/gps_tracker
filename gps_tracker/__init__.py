from pyramid.config import Configurator
from .db import mongo_db_connection


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('gps_tracker.db')
    config.add_route('points', '/points')
    config.add_route('point', '/points/{id}')
    config.add_request_method(mongo_db_connection, 'mongo_db', reify=True)
    config.scan()
    return config.make_wsgi_app()
