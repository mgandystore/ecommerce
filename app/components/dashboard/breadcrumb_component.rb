# frozen_string_literal: true

class Dashboard::BreadcrumbComponent < ViewComponent::Base

  # Example usage:
  #
  # <%= render(Dashboard::BreadcrumbComponent.new(items: [
  #   { label: "Home", path: root_path },
  #   { label: "Products", path: dashboard_products_path },
  #   { label: "Product", path: dashboard_product_path(product) },
  # ])) %>
  def initialize(items:)
    @items = items
  end
end
