Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'
    resource '/api/*',
             headers: :any,
             methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end

# if Rails.env.development?
#   Rails.application.config.action_controller.forgery_protection_origin_check = false
# end
