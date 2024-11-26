class HomeController < ApplicationController
  def index
    @product = Product
                 .includes(:product_variants)
                 .order(id: :desc)
                 .first
  end
end
