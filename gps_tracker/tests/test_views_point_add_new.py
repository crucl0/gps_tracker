from .baseconfig import BaseConfig


class TestViewsPointAddNew(BaseConfig):
    """ Try to add new point
    """
    def test_point_add_new(self):
        """ Try how it realy works.
        """
        request = self.own_request()
        request.json_body = {"gas_station": "MyOwnGasStation",
                             "odometer": 7994,
                             "description": "Nothing to say"}
        inst = self._make_one(request)
        point_new = inst.add_new()
        self.assertIsInstance(point_new, dict)
        self.assertEqual(len(point_new), 4)
