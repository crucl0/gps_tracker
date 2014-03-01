from .test_base import TestBase

from pyramid.httpexceptions import HTTPNotFound

from gps_tracker.views import (point_delete_one,
                               point_get_one)


class TestViewsPointDeleteOne(TestBase):
    """ Try to delete one point
    """
    def test_invalid_id(self):
        """ This point doesn't exist, does it?
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b5'}

        point = point_delete_one(request)
        self.assertIsInstance(point, HTTPNotFound)

    def test_valid_id(self):
        """ Try how it realy works
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fb'}

        point = point_get_one(request)
        self.assertNotEqual(len(point), 0)

        point = point_delete_one(request)
        self.assertEqual(point, {})

        point = point_get_one(request)
        self.assertEqual(point, None)
