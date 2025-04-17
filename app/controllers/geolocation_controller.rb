class GeolocationController < ApplicationController

  def lookup
    ip = request.headers['CF-Connecting-IP'] ||
      request.headers['X-Forwarded-For']&.split(',')&.first&.strip ||
      request.remote_ip

    result = Rails.application.config.maxmind_db.lookup(ip)

    if ip == "::1"
      return render json: {
        country: "France",
        city: "Lyon",
        latitude: 45.7485,
        longitude: 4.8467
      }
    end

    render json: {
      country: result.country.name,
      city: result.city.name,
      latitude: result.location.latitude,
      longitude: result.location.longitude
    }
  rescue => e
    render json: { error: e.message }, status: 500
  end
end
