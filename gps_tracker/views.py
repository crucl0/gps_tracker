from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound
from bson.objectid import ObjectId


@view_config(route_name='main', renderer='templates/main.pt')
def main_view(request):
    if request.method == 'POST':
        if request.POST.get('gas_station'):
            request.db.points.insert(
                {
                    'gas_station': request.POST['gas_station'],
                    'odometer': request.POST['odometer'],
                    'description': request.POST['description'],
                    'latitude': request.POST['latitude'],
                    'longitude': request.POST['longitude']
                })
            return HTTPFound(location=request.route_url('main'))
    return {'project': 'gps_tracker'}


@view_config(route_name='points', renderer='templates/points.pt')
def points_view(request):
    points = [point for point in request.db.points.find()]
    return {'points': points}


@view_config(route_name='detail', renderer='templates/detail.pt')
def detail_view(request):
    _id = request.matchdict["id"]
    point = request.db.points.find_one({"_id": ObjectId(_id)})
    return {'point': point}
