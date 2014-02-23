import unittest

from pyramid import testing
from pyramid.paster import get_appsettings

from pyramid.httpexceptions import (HTTPNotFound,
                                    HTTPBadRequest)

from .some_data_for_tests import test_data
from bson.errors import InvalidId

from .db import mongo_db_connection
from .views import (points_get_all,
                    point_get_one,
                    point_add_new,
                    point_edit_one,
                    point_update_one,
                    point_delete_one)


class DB_Tests(unittest.TestCase):
    def setUp(self):
        self.settings = get_appsettings('settings/test.ini')
        self.config = testing.setUp()
        self.config.registry.settings.update(self.settings)

        self.config.include('gps_tracker.db')
        self.mongo_connection = self.config.registry.mongo_connection

        self.db_name = self.config.registry.settings['mongo_db_name']
        self.mongo_db = self.mongo_connection[self.db_name]
        self.mongo_connection.drop_database(self.db_name)

    def tearDown(self):
        self.mongo_connection.drop_database(self.db_name)
        testing.tearDown()

    def test_db_connection(self):
        """ Try to connect to mongo_db
        """
        request = testing.DummyRequest()
        request.mongo_db = self.mongo_db
        db = mongo_db_connection(request)
        collection = db.test_collection
        test = {"a": 1, "b": 2, "c": 3}
        collection.save(test)
        read_back = collection.find_one()
        self.assertIsInstance(read_back, dict)
        self.assertIn("b", read_back)

    def test_points_get_all(self):
        """ Try to get all points
        """
        request = testing.DummyRequest()
        request.mongo_db = self.mongo_db

        db = self.mongo_db
        db.points.insert(test_data)

        collection = points_get_all(request)
        self.assertIsInstance(collection, list)
        self.assertEqual(db.points.count(), 6)

    def test_point_get_one(self):
        """ Try to get one point
        """
        request = testing.DummyRequest()
        request.mongo_db = self.mongo_db

        db = self.mongo_db
        db.points.insert(test_data)

        request.matchdict = {'id': '5309deeca7cade7139b53'}
        point = point_get_one(request)
        self.assertRaises(InvalidId)

        request.matchdict = {'id': '5309deeca7cade7139b537fa'}
        point = point_get_one(request)
        self.assertIsInstance(point, dict)
        self.assertEqual(point['gas_station'], 'Shell')

    def test_point_add_new(self):
        """ Try to add new point
        """
        request = testing.DummyRequest()
        request.mongo_db = self.mongo_db

        request.json_body = {"gas_station": "MyOwnGasStation",
                             "odometer": 7994,
                             "description": "Nothing to say"}
        point_new = point_add_new(request)
        self.assertIsInstance(point_new, dict)
        self.assertEqual(len(point_new), 4)

    def test_point_edit_one(self):
        """ Try to edit one point
        """
        request = testing.DummyRequest()
        request.mongo_db = self.mongo_db

        db = self.mongo_db
        db.points.insert(test_data)

        request.matchdict = {'id': '5309deeca7cade7139b53'}
        point = point_edit_one(request)
        self.assertIsInstance(point, HTTPNotFound)

        request.matchdict = {'id': '5309deeca7cade7139b537f9'}
        point = point_get_one(request)
        self.assertEqual(point['gas_station'], 'Lukoil')

        request.json_body = {}
        point = point_edit_one(request)
        self.assertIsInstance(point, HTTPBadRequest)

        request.json_body = 5
        point = point_edit_one(request)
        self.assertIsInstance(point, HTTPBadRequest)

        request.json_body = {'gas_station': 'MyOwnStation'}
        point = point_edit_one(request)
        self.assertNotEqual(point['gas_station'], 'Lukoil')
        self.assertEqual(point['gas_station'], 'MyOwnStation')

    def test_point_update_one(self):
        """ Try to update one point
        """
        request = testing.DummyRequest()
        request.mongo_db = self.mongo_db

        db = self.mongo_db
        db.points.insert(test_data)

        request.matchdict = {'id': '5309deeca7cade7139b53'}
        point = point_update_one(request)
        self.assertIsInstance(point, HTTPNotFound)

        request.matchdict = {'id': '5309deeca7cade7139b537fb'}
        point = point_get_one(request)
        self.assertEqual(point['gas_station'], 'Руснефть')
        self.assertEqual(len(point), 6)

        request.json_body = {'gas_station': 'MyOwnStation'}
        point = point_update_one(request)
        self.assertEqual(point['gas_station'], 'MyOwnStation')
        self.assertEqual(len(point), 2)

        request.json_body = {}
        point = point_update_one(request)
        self.assertIsInstance(point, HTTPBadRequest)

        request.json_body = 6
        point = point_update_one(request)
        self.assertIsInstance(point, HTTPBadRequest)

    def test_delete_one(self):
        """ Try to delete one point
        """
        request = testing.DummyRequest()
        request.mongo_db = self.mongo_db

        db = self.mongo_db
        db.points.insert(test_data)

        request.matchdict = {'id': '5309deeca7cade7139b5'}
        point = point_delete_one(request)
        self.assertIsInstance(point, HTTPNotFound)

        request.matchdict = {'id': '5309deeca7cade7139b537fb'}
        point = point_get_one(request)
        self.assertNotEqual(len(point), 0)

        point = point_delete_one(request)
        self.assertEqual(point, {})

        point = point_get_one(request)
        self.assertEqual(point, None)
