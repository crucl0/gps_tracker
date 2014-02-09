import unittest
from pyramid import testing
from pyramid.paster import get_appsettings
from .db import db_connection


class DB_Tests(unittest.TestCase):
    def setUp(self):
        settings = get_appsettings('settings/test.ini')
        self.config = testing.setUp(settings=settings)
        self.config.include('gps_tracker.db')
        self.request = testing.DummyRequest()
        connection = self.request.registry.mongo_connection
        connection.drop_database('db_for_test')

    def tearDown(self):
        testing.tearDown()

    def test_db_connection(self):
        db = db_connection(self.request)
        collection = db.test_collection
        test_data = {"a": 1, "b": 2, "c": 3}
        collection.save(test_data)
        read_back = collection.find_one()
        self.assertTrue(type(read_back), dict)
        self.assertIn("b", read_back)
