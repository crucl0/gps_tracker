from .baseconfig import BaseConfig


class TestViewPointsGetAll(BaseConfig):
    """ Try to get all points
    """
    def test_points_get_all(self):
        """ Try how it realy works.
        """
        request = self.own_request()
        inst = self._make_one(request)
        collection = inst.get_all()
        self.assertIsInstance(collection, list)
        self.assertEqual(len(collection), 6)
