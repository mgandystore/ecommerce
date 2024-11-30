Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  post "webhooks/stripe", to: "webhooks#stripe"

  post "products", to: "products#create"
  post "products/:id/images", to: "products#add_product_images"
  post "product_variants/:id/images", to: "products#add_product_variant_images"
  get "products/:id", to: "products#show"

  get "checkout/:product_variant_id", to: "checkout#create"

  root "home#index", as: :home

  # =========================================================================
  # Dashboard
  # =========================================================================

  get "dashboard", to: "dashboard/orders#index", as: :dashboard_home
  get "dashboard/orders", to: "dashboard/orders#index", as: :dashboard_orders
  get "dashboard/orders/:id", to: "dashboard/orders#show", as: :dashboard_order
  patch "dashboard/orders/:id", to: "dashboard/orders#update", as: :update_dashboard_order

  get "dashboard/products", to: "dashboard/products#index", as: :dashboard_products
  get "dashboard/products/:id", to: "dashboard/products#show", as: :dashboard_product
  patch "dashboard/products/:id", to: "dashboard/products#update", as: :update_dashboard_product
  get "dashboard/products/:id/specifications", to: "dashboard/products#edit_specifications", as: :edit_dashboard_product_specifications
  patch "dashboard/products/:id/specifications", to: "dashboard/products#update_specifications", as: :update_dashboard_product_specifications
  get "dashboard/products/:id/faq", to: "dashboard/products#edit_faq", as: :edit_dashboard_product_faq
  patch "dashboard/products/:id/faq", to: "dashboard/products#update_faq", as: :update_dashboard_product_faq

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
