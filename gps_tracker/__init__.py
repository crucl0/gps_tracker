from pyramid.config import Configurator


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.add_static_view('static', 'static', cache_max_age=3600)

    config.include('.db')
    config.add_route('main', '/')
    config.add_route('points', '/points')
    config.add_route('detail', '/points/{id}')
    config.scan()
    return config.make_wsgi_app()
