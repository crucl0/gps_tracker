from pyramid.config import Configurator
from .db import mongo_db_connection
from .views import RESTView


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('gps_tracker.db')
    config.add_static_view('static', 'static', cache_max_age=3600)

    config.add_route('points', '/points')
    config.add_route('point', '/points/{id}')
    config.add_route('companies', '/companies')
    config.add_route('company', '/companies/{id}')

    config.add_static_view('/', 'gps_tracker:templates/', cache_max_age=0)
    # POINTS views
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
        RESTView, route_name='point', attr='update_one',
        request_method='PUT', renderer='json')
    config.add_view(
        RESTView, route_name='point', attr='edit_one',
        request_method='PATCH', renderer='json')
    config.add_view(
        RESTView, route_name='point', attr='delete_one',
        request_method='DELETE', renderer='json')

    # COMPANIES views
    config.add_view(
        RESTView, route_name='companies', attr='get_all',
        request_method='GET', renderer='json')
    config.add_view(
        RESTView, route_name='company', attr='get_one',
        request_method='GET', renderer='json')
    config.add_view(
        RESTView, route_name='companies', attr='add_new',
        request_method='POST', renderer='json')
    config.add_view(
        RESTView, route_name='company', attr='update_one',
        request_method='PUT', renderer='json')
    config.add_view(
        RESTView, route_name='company', attr='edit_one',
        request_method='PATCH', renderer='json')
    config.add_view(
        RESTView, route_name='company', attr='delete_one',
        request_method='DELETE', renderer='json')

    config.add_request_method(mongo_db_connection, 'mongo_db', reify=True)
    config.scan()
    return config.make_wsgi_app()
