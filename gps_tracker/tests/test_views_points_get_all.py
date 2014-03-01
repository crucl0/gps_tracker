from .baseconfig import BaseConfig

from gps_tracker.views import points_get_all


class TestViewPointsGetAll(BaseConfig):
    """ Try to get all points
    """
    def test_points_get_all(self):
        """ Try how it realy works.
        """
        request = self.own_request()

        collection = points_get_all(request)
        self.assertIsInstance(collection, list)
        self.assertEqual(len(collection), 6)
