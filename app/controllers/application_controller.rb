class ApplicationController < ActionController::Base
  before_action :check_subdomain

  def set_cors_headers
    headers["Access-Control-Allow-Origin"] = "*"
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    headers["Access-Control-Allow-Headers"] = "Origin, Content-Type, Accept, Authorization, X-Requested-With"
  end


  private

  def check_subdomain
    return unless Rails.env.production?

    subdomain = request.subdomain

    case subdomain
    when "api"
      # Only redirect if not already on an API path
      unless request.path.start_with?("/api")
        redirect_to "/api#{request.path == '/' ? '' : request.path}", status: :moved_permanently
      end
    when "dashboard"
      # Only redirect if not already on a dashboard path
      unless request.path.start_with?("/dashboard")
        redirect_to "/dashboard#{request.path == '/' ? '' : request.path}", status: :moved_permanently
      end
    end
  end
end
