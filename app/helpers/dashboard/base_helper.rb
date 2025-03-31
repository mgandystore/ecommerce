module Dashboard::BaseHelper
  def truncate_long_id(value)
    return "-" if value == nil || value.blank?
    return value if value.length < 15
    prefix = value[0...10]
    suffix = value[-8..]
    "#{prefix}[...]#{suffix}"
  end

  def navbar_items
    [
      {
        label: "La boutique",
        path: Rails.env.fetch("FRONT_URL", "https://assmac.com"),
        icon: inline_svg_tag("icons/store.svg", class: "w-5 h-5 text-gray-400")
      },
      {
        label: "Commandes",
        path: Rails.application.routes.url_helpers.dashboard_orders_path,
        icon: inline_svg_tag("icons/package.svg", class: "w-5 h-5 text-gray-400"),
        count: Order.count_paid
      },
      {
        label: "Produits",
        path: Rails.application.routes.url_helpers.dashboard_products_path,
        icon: inline_svg_tag("icons/cart.svg", class: "w-5 h-5 text-gray-400")
      },
      {
        label: "Reviews",
        path: Rails.application.routes.url_helpers.dashboard_reviews_path,
        icon: inline_svg_tag("icons/star.svg", class: "w-5 h-5 text-gray-400")
      },
      {
        label: "Stock notifications",
        path: Rails.application.routes.url_helpers.dashboard_stock_notifications_path,
        icon: inline_svg_tag("icons/bell.svg", class: "w-5 h-5 text-gray-400")
      },
      {
        label: "Paramètres",
        path: Rails.application.routes.url_helpers.edit_dashboard_settings_path,
        icon: inline_svg_tag("icons/settings.svg", class: "w-5 h-5 text-gray-400")
      }
    ]
  end
end
