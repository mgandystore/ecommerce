class ChronoshopController < ApplicationController
  # GET api/chronoshop/search_city
  def search_city
    query = params[:query]
    country = params[:country] || 'FR'
    limit = params[:limit] || 10

    if query.blank?
      render json: { error: 'Missing query parameter' }, status: :bad_request
      return
    end

    results = ChronoshopService.fetch_cities(query, country, limit)
    render json: results
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  # GET api/chronoshop/pickup_points
  def pickup_points
    zip_code = params[:zip_code]
    city = params[:city]
    country = params[:country] || 'FR'
    limit = params[:limit] || 5

    if zip_code.blank? || city.blank?
      render json: { error: 'Missing required parameters: zip_code and city' }, status: :bad_request
      return
    end

    results = ChronoshopService.fetch_pickup_points(zip_code, city, country, limit)
    render json: results
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end
end
