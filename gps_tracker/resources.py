class Resource(object):
    def __init__(self, request=None, parent=None, name=''):
        self.request = request
        self.__parent__ = parent
        self.__name__ = str(name)


class Root(Resource):
    def __getitem__(self, item):
        if str(item) == 'points':
            return Points(self.request, self, item)
        else:
            raise KeyError('Nope')


class Points(Resource):
    def __getitem__(self, item):
        if str(item):
            return Point(self.request, self, item)
        else:
            raise KeyError('Nope')


class Point(Resource):
    pass
