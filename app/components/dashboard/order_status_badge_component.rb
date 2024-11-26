# frozen_string_literal: true
module Dashboard
  class OrderStatusBadgeComponent < ViewComponent::Base
    include Dashboard::OrdersHelper
    attr_reader :status

    def initialize(status:)
      @status = status
    end

    def color_class
      statuses_badge_color(status.to_s.downcase) || "bg-gray-100 text-gray-800"
    end
  end
end