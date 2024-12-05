module Dashboard
  class StockNotificationsController < BaseController
    def index

      @notification_stats = StockNotification
                              .joins(:product_variant)
                              .joins('INNER JOIN products ON product_variants.product_id = products.id')
                              .group('product_variants.variants_slug', 'products.name', 'product_variants.stock')
                              .select(
                                'products.name as product_name',
                                'product_variants.variants_slug',
                                'product_variants.stock as current_stock',
                                'COUNT(stock_notifications.id) as notification_count'
                              )
                              .order('notification_count DESC')
    end

  end
end
