module Dashboard
  class BaseController < ApplicationController
    layout 'dashboard'

    before_action :authenticate

    private

    def authenticate
      authenticate_or_request_with_http_basic do |username, password|
        username == Rails.configuration.auth["username"] && password == Rails.configuration.auth["password"]
      end
    end

  end
end

