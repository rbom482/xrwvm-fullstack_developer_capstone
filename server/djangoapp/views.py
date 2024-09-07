from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django.views.decorators.csrf import csrf_exempt
import logging
import json

from .populate import initiate
from .models import CarMake, CarModel
from .restapis import get_request, analyze_review_sentiments, post_review

# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create a `login_user` view to handle sign-in requests
@csrf_exempt
def login_user(request):
    try:
        data = json.loads(request.body)
        username = data['userName']
        password = data['password']

        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                "userName": username, "status": "Authenticated"
            })
        else:
            return JsonResponse({
                "userName": username, "status": "Invalid credentials"
            }, status=401)
    except Exception as e:
        logger.error(f"Error in login_user: {e}")
        return JsonResponse({"status": "Error in login process"}, status=500)


# Create a `logout_request` view to handle sign-out requests
def logout_request(request):
    logout(request)
    return JsonResponse({"status": "Logged out"})


# Create a `registration` view to handle sign-up requests
@csrf_exempt
def registration(request):
    try:
        data = json.loads(request.body)
        username = data['userName']
        password = data['password']
        first_name = data['firstName']
        last_name = data['lastName']
        email = data['email']

        if User.objects.filter(username=username).exists():
            return JsonResponse({
                "userName": username, "status": "User already registered"
            }, status=400)

        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
            email=email
        )
        login(request, user)
        return JsonResponse({
            "userName": username, "status": "Authenticated"
        })

    except Exception as e:
        logger.error(f"Error in registration: {e}")
        return JsonResponse({
            "status": "Error in registration process"
        }, status=500)


# View to get the list of dealerships
def get_dealerships(request, state="All"):
    try:
        endpoint = (
            "/fetchDealers" if state == "All"
            else f"/fetchDealers/{state}"
        )
        dealerships = get_request(endpoint)
        return JsonResponse({"status": 200, "dealers": dealerships})
    except Exception as e:
        logger.error(f"Error in get_dealerships: {e}")
        return JsonResponse({
            "status": "Error fetching dealerships"
        }, status=500)


# View to get reviews of a specific dealer
def get_dealer_reviews(request, dealer_id):
    try:
        endpoint = f"/fetchReviews/dealer/{dealer_id}"
        reviews = get_request(endpoint)
        for review_detail in reviews:
            sentiment_response = analyze_review_sentiments(
                review_detail['review']
            )
            review_detail['sentiment'] = sentiment_response.get('sentiment')
        return JsonResponse({"status": 200, "reviews": reviews})
    except Exception as e:
        logger.error(f"Error in get_dealer_reviews: {e}")
        return JsonResponse({
            "status": "Error fetching reviews"
        }, status=500)


# View to get details of a specific dealer
def get_dealer_details(request, dealer_id):
    try:
        endpoint = f"/fetchDealer/{dealer_id}"
        dealership = get_request(endpoint)
        return JsonResponse({"status": 200, "dealer": dealership})
    except Exception as e:
        logger.error(f"Error in get_dealer_details: {e}")
        return JsonResponse({
            "status": "Error fetching dealer details"
        }, status=500)


# View to add a review
def add_review(request):
    if not request.user.is_anonymous:
        try:
            data = json.loads(request.body)
            post_review(data)
            return JsonResponse({"status": 200})
        except Exception as e:
            logger.error(f"Error in add_review: {e}")
            return JsonResponse({
                "status": "Error in posting review"
            }, status=500)
    return JsonResponse({"status": "Unauthorized"}, status=403)


# View to get cars and initiate population if no cars exist
def get_cars(request):
    try:
        if CarMake.objects.count() == 0:
            initiate()

        car_models = CarModel.objects.select_related('car_make')
        cars = [
            {"CarModel": car_model.name,
             "CarMake": car_model.car_make.name}
            for car_model in car_models
        ]
        return JsonResponse({"CarModels": cars})

    except Exception as e:
        logger.error(f"Error in get_cars: {e}")
        return JsonResponse({
            "status": "Error fetching cars"
        }, status=500)
