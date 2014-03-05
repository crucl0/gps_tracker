import unittest
from pyramid import testing
from .fixture import fixture_points

from pyramid.paster import get_appsettings


class BaseConfig(unittest.TestCase):
    """ A Template of testing class
    """
    def setUp(self):
        self.settings = get_appsettings('settings/test.ini')
        self.config = testing.setUp()
        self.config.registry.settings.update(self.settings)

        self.config.include('gps_tracker.db')
        self.mongo_connection = self.config.registry.mongo_connection

        self.db_name = self.config.registry.settings['mongo_db_name']
        self.mongo_db = self.mongo_connection[self.db_name]
        self.mongo_connection.drop_database(self.db_name)
        self.mongo_db.points.insert(fixture_points)

    def tearDown(self):
        self.mongo_connection.drop_database(self.db_name)
        testing.tearDown()

    def own_request(self):
        """ This function adds mongodb connection to a request.
        """
        request = testing.DummyRequest()
        request.mongo_db = self.mongo_db
        return request
