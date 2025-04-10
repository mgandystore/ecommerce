require 'net/http'
require 'json'

class ChronoshopService
  BASE_URL = 'https://www.chronoshop2shop.fr'

  def self.fetch_cities(query, country = 'FR', limit = 10)
    uri = URI("#{BASE_URL}/wsmchronoweb-rest/address/zipcodecity")
    uri.query = URI.encode_www_form(
      country: country,
      zipCodeCity: query,
      nbMax: limit
    )

    make_request(uri)
  end

  def self.fetch_pickup_points(zip_code, city, country = 'FR', limit = 5)
    uri = URI("#{BASE_URL}/wsmchronoweb-rest/pointchrono/searchpointrelaisS2S")
    uri.query = URI.encode_www_form(
      zipCode: zip_code,
      city: city,
      countryCode: country,
      nbPointsChrono: limit,
      isRecipient: true,
      lang: 'fr'
    )

    make_request(uri)
  end

  def self.validate_pickup_point(zip_code, city, country, pickup_point_id)
    pickup_points = fetch_pickup_points(zip_code, city, country, 25)
    pickup_points.find { |point| point["identifier"] == pickup_point_id }
  end

  private

  def self.make_request(uri)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == 'https')

    request = Net::HTTP::Get.new(uri)
    request['accept'] = 'application/json'
    request['referer'] = "#{BASE_URL}/shop2shop-en-ligne/"
    request['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'

    response = http.request(request)

    unless response.is_a?(Net::HTTPSuccess)
      raise "HTTP request failed: #{response.code} #{response.message}"
    end

    JSON.parse(response.body)
  end
end
