from pyramid.config import Configurator
from .db import mongo_db_connection
# from .views import (Points, Companies)
from .views import RESTView

resources = ['Points', 'Companies', 'Stations']


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('gps_tracker.db')
    config.add_static_view('static', 'static', cache_max_age=3600)

    config.add_route('points', '/points')
    config.add_route('companies', '/companies')
    config.add_route('point', '/points/{id}')

    config.add_static_view('/', 'gps_tracker:templates/', cache_max_age=0)
    config.add_view(
        RESTView, route_name='points', attr='get_all',
        request_method='GET', renderer='json')
    config.add_view(
        RESTView, route_name='point', attr='get_one',
        request_method='GET', renderer='json')
    config.add_view(
        RESTView, route_name='points', attr='add_new',
        request_method='POST', renderer='json')

    config.add_view(
        RESTView, route_name='companies', attr='get_all',
        request_method='GET', renderer='json')

    config.add_request_method(mongo_db_connection, 'mongo_db', reify=True)
    config.scan()
    return config.make_wsgi_app()
