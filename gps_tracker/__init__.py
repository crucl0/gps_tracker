from pyramid.config import Configurator
from .db import mongo_db_connection


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('gps_tracker.db')
    config.include('gps_tracker.views')
    config.add_static_view('static', 'static', cache_max_age=3600)

    config.add_route('points', '/points')
    config.add_route('point', '/points/{id}')
    config.add_route('companies', '/companies')
    config.add_route('company', '/companies/{id}')
    config.add_route('stations', '/stations')
    config.add_route('station', '/stations/{id}')

    config.add_static_view('/', 'gps_tracker:templates/', cache_max_age=0)
    config.add_request_method(mongo_db_connection, 'mongo_db', reify=True)
    config.scan()
    return config.make_wsgi_app()
