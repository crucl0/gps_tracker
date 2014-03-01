from .test_base import TestBase

from gps_tracker.views import point_add_new


class TestViewsPointAddNew(TestBase):
    """ Try to add new point
    """
    def test_point_add_new(self):
        """ Try how it realy works.
        """
        request = self.test_request()

        request.json_body = {"gas_station": "MyOwnGasStation",
                             "odometer": 7994,
                             "description": "Nothing to say"}
        point_new = point_add_new(request)
        self.assertIsInstance(point_new, dict)
        self.assertEqual(len(point_new), 4)
