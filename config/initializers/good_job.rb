GoodJob::Engine.middleware.use(Rack::Auth::Basic) do |username, password|
  ActiveSupport::SecurityUtils.secure_compare(Rails.configuration.auth["username"], username) &
    ActiveSupport::SecurityUtils.secure_compare(Rails.configuration.auth["password"], password)
end