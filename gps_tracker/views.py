from pyramid.view import view_config
from bson.objectid import ObjectId
from bson.json_util import dumps
from bson.errors import InvalidId


@view_config(route_name='points', request_method='GET', renderer='json')
def points_get_all(request):
    points = dumps([point for point in request.mongo_db.points.find()])
    return points


@view_config(route_name='points', request_method='POST', renderer='json')
def point_add_new(request):
    try:
        if len(request.json_body) < 3:
            return {"Error": "Expects at least 3 parameters about new point"}
        else:
            point = {key: request.json_body[key] for key in request.json_body}
            point_new_id = request.mongo_db.points.insert(point)
            return dumps(request.mongo_db.points.find_one(
                {"_id": ObjectId(point_new_id)}))
    except ValueError:
        return {"Error": "POST request body must be JSON"}


@view_config(route_name='point', request_method='GET', renderer='json')
def point_get_one(request):
    try:
        _id = ObjectId(request.matchdict["id"])
        point = request.mongo_db.points.find_one({"_id": _id})
        return dumps(point)
    except InvalidId:
        return {"Error": "Invalid ObjectId. Check your request."}


@view_config(route_name='point', request_method='PATCH', renderer='json')
def point_edit_one(request):
    try:
        try:
            _id = ObjectId(request.matchdict["id"])
            request.mongo_db.points.find_one(_id)
        except InvalidId:
            return {"Error": "Invalid ObjectId. Check your request."}

        if len(request.json_body) == 0:
            return {"Error": "PATCH request body if empty. Nothing to do."}
        else:
            _id = ObjectId(request.matchdict["id"])
            updates = request.json_body
            request.mongo_db.points.update({"_id": _id},
                                           {"$set": updates})
            return dumps(request.mongo_db.points.find_one(_id))
    except ValueError:
        return {"Error": "PATCH request body must be JSON"}


@view_config(route_name='point', request_method='PUT', renderer='json')
def point_update_one(request):
    try:
        try:
            _id = ObjectId(request.matchdict["id"])
            request.mongo_db.points.find_one(_id)
        except InvalidId:
            return {"Error": "Invalid ObjectId. Check your request."}

        if len(request.json_body) == 0:
            return {"Error": "PUT request body if empty. Nothing to do."}
        else:
            _id = ObjectId(request.matchdict["id"])
            replacement = request.json_body
            replacement["_id"] = _id
            request.mongo_db.points.save(replacement)
            return dumps(request.mongo_db.points.find_one(_id))
    except ValueError:
        return {"Error": "PUT request body must be JSON"}


@view_config(route_name='point', request_method='DELETE', renderer='json')
def point_delete_one(request):
    try:
        _id = ObjectId(request.matchdict["id"])
        request.mongo_db.points.remove({"_id": _id})
        return {}
    except InvalidId:
        return {"Error": "Invalid ObjectId. Check your request."}
