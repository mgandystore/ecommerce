module Dashboard::BaseHelper
  def truncate_long_id(stripe_session)
    return stripe_session if stripe_session.length < 15
    prefix = stripe_session[0...10]
    suffix = stripe_session[-8..]
    "#{prefix}[...]#{suffix}"
  end

  def navbar_items
    [
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
        label: "La boutique",
        path: Rails.application.routes.url_helpers.home_path,
        icon: inline_svg_tag("icons/store.svg", class: "w-5 h-5 text-gray-400")
      }
    ]
  end
end
