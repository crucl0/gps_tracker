from pyramid.renderers import JSON
from bson.objectid import ObjectId
import datetime

json_renderer = JSON()


def bson_adapter(obj, request):
    return str(obj)


def datetime_adapter(obj, request):
    return obj.isoformat()

json_renderer.add_adapter(ObjectId, bson_adapter)
json_renderer.add_adapter(datetime.datetime, datetime_adapter)
