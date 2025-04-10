class ApplicationController < ActionController::Base
  before_action :check_subdomain

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
