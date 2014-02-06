from pyramid.config import Configurator
from .db import db_connection


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('gps_tracker.db')
    config.add_static_view('static', 'static', cache_max_age=3600)

    config.add_route('main', '/')
    config.add_route('points', '/points')
    config.add_route('detail', '/points/{id}')

    config.add_request_method(db_connection, 'db', reify=True)
    config.scan()
    return config.make_wsgi_app()
