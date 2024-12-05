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
  get "success", to: "home#success", as: :success

  # =========================================================================
  # Dashboard
  # =========================================================================

  get "dashboard", to: "dashboard/orders#index", as: :dashboard_home
  get "dashboard/orders", to: "dashboard/orders#index", as: :dashboard_orders
  get "dashboard/orders/:id", to: "dashboard/orders#show", as: :dashboard_order
  patch "dashboard/orders/:id", to: "dashboard/orders#update", as: :update_dashboard_order

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

  # =========================================================================
  # Utilities
  # =========================================================================

  get "attachments/:record_id/:id", to: "attachments#show", as: :attachment

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
