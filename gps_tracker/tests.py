import unittest
from pyramid import testing
from pyramid.paster import get_appsettings
from .views import main_view
from .db import db_connection


class ViewTests(unittest.TestCase):
    def setUp(self):
        self.config = testing.setUp()

    def tearDown(self):
        testing.tearDown()

    def test_main_view(self):
        request = testing.DummyRequest()
        info = main_view(request)
        self.assertEqual(info['project'], 'gps_tracker')


class DB_Tests(unittest.TestCase):
    def setUp(self):
        settings = get_appsettings('settings/test.ini')
        self.config = testing.setUp(settings=settings)
        request = testing.DummyRequest()
        self.db = db_connection(request)
        connection = request.registry.mongo_connect
        connection.drop_database('db_for_test')

    def tearDown(self):
        testing.tearDown()

    def test_db_connection(self):
        # test CRUD
        collection = self.db.test_collection
        test_data = {"a": 1, "b": 2, "c": 3}
        collection.save(test_data)
        read_back = collection.find_one()
        self.assertTrue(type(read_back), dict)
        self.assertIn("b", read_back)
