Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  post "webhooks/stripe", to: "webhooks#stripe"

  get "products/:id", to: "products#show"

  get "checkout/:product_variant_id", to: "checkout#create"

  post "stock_notifications", to: "stock_notifications#create"

  root "home#index", as: :home
  get "/cgv", to: "home#sales_terms", as: :sales_terms
  get "/mention-legales", to: "home#legal_notices", as: :legal_notices
  get "success", to: "home#success", as: :success

  # Add a constraint for subdomain routing
  constraints(subdomain: "api") do
    root to: redirect("/api"), as: :api_root
  end

  constraints(subdomain: "dashboard") do
    root to: redirect("/dashboard"), as: :dashboard_root
  end

  # =========================================================================
  # API
  # =========================================================================
  #
  get "/api/assmac", to: "home#api_home", as: :api_home
  get "/api/settings", to: "home#api_settings", as: :api_settings
  get "/api/legal-notices", to: "home#api_legal_notices", as: :api_legal_notices
  get "/api/sales-terms", to: "home#api_sales_terms", as: :api_sales_terms
  post "/api/stock_notifications", to: "stock_notifications#create"

  get "/api/chronoshop/search_city", to: "chronoshop#search_city"
  get "/api/chronoshop/pickup_points", to: "chronoshop#pickup_points"

  post "/api/orders/:product_variant_id", to: "order#create"
  patch "/api/orders/:id/pay", to: "order#pay"
  get "/api/orders/:id/price_calculator", to: "order#price_calculator"
  patch "/api/orders/:id/promo_code/:promo_code_id", to: "order#apply_promo_code"
  delete "/api/orders/:id/promo_code", to: "order#remove_promo_code"
  get "/api/orders/:id", to: "order#show"

  # =========================================================================
  # Dashboard
  # =========================================================================

  get "dashboard", to: "dashboard/orders#index", as: :dashboard_home
  get "dashboard/orders", to: "dashboard/orders#index", as: :dashboard_orders
  get "dashboard/orders/:id", to: "dashboard/orders#show", as: :dashboard_order
  patch "dashboard/orders/:id", to: "dashboard/orders#update", as: :update_dashboard_order
  get "dashboard/order/:id/laposte_expedition_template", to: "dashboard/orders#laposte_expedition_template", as: :dashboard_order_laposte_expedition_template

  get "dashboard/products", to: "dashboard/products#index", as: :dashboard_products
  post "dashboard/products", to: "dashboard/products#create"
  get "dashboard/products/:id", to: "dashboard/products#show", as: :dashboard_product
  patch "dashboard/products/:id", to: "dashboard/products#update", as: :update_dashboard_product
  get "dashboard/products/:id/specifications", to: "dashboard/products#edit_specifications", as: :edit_dashboard_product_specifications
  patch "dashboard/products/:id/specifications", to: "dashboard/products#update_specifications", as: :update_dashboard_product_specifications
  get "dashboard/products/:id/faq", to: "dashboard/products#edit_faq", as: :edit_dashboard_product_faq
  patch "dashboard/products/:id/faq", to: "dashboard/products#update_faq", as: :update_dashboard_product_faq
  get "dashboard/products/:id/variants/:product_variant_id", to: "dashboard/products#edit_product_variants", as: :edit_dashboard_product_variant
  patch "dashboard/products/:id/variants/:product_variant_id", to: "dashboard/products#update_product_variant", as: :update_dashboard_product_variant

  get "dashboard/stock_notifications", to: "dashboard/stock_notifications#index", as: :dashboard_stock_notifications

  get "dashboard/reviews", to: "dashboard/reviews#index", as: :dashboard_reviews
  get "dashboard/reviews/new", to: "dashboard/reviews#new", as: :new_dashboard_review
  post "dashboard/reviews", to: "dashboard/reviews#create"
  get "dashboard/reviews/:id/edit", to: "dashboard/reviews#edit", as: :edit_dashboard_review
  patch "dashboard/reviews/:id", to: "dashboard/reviews#update", as: :update_dashboard_review
  delete "dashboard/reviews/:id", to: "dashboard/reviews#destroy", as: :delete_dashboard_review

  get "dashboard/settings", to: "dashboard/settings#edit", as: :edit_dashboard_settings
  patch "dashboard/settings", to: "dashboard/settings#update", as: :update_dashboard_settings

  get "dashboard/promo_codes", to: "dashboard/promo_codes#index", as: :dashboard_promo_codes
  get "dashboard/promo_codes/new", to: "dashboard/promo_codes#new", as: :new_dashboard_promo_code
  post "dashboard/promo_codes", to: "dashboard/promo_codes#create"
  get "dashboard/promo_codes/:id/edit", to: "dashboard/promo_codes#edit", as: :edit_dashboard_promo_code
  patch "dashboard/promo_codes/:id", to: "dashboard/promo_codes#update", as: :update_dashboard_promo_code
  delete "dashboard/promo_codes/:id", to: "dashboard/promo_codes#destroy", as: :delete_dashboard_promo_code

  # =========================================================================
  # Utilities
  # =========================================================================

  get "v1/attachments/:record_id/:id", to: "attachments#show", as: :attachment

  mount GoodJob::Engine => "good_job"

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
