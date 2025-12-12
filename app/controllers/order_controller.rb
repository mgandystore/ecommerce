# app/controllers/chronoshop_controller.rb
require "net/http"
require "json"

class OrderController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    variant = ProductVariant.includes(:product).find_by(id: params[:product_variant_id])
    if variant.nil?
      return render json: { error: "product variant not found" }, status: :not_found
    end

    order = Order.create!(
      status: :pending,
    )

    OrderItem.create!(
      order: order,
      product_id: variant.product_id,
      product_variant_id: variant.id,
      quantity: 1,
      total_amount: variant.total_price
    )

    price = order.compute_pricing

    payment_method_types = %w[card klarna]

    stripe_intent = Stripe::PaymentIntent.create(
      amount: price[:total],
      currency: "eur",
      payment_method_types: payment_method_types
    )

    order.update!(
      stripe_payment_intent_id: stripe_intent.id,
      stripe_payment_intent_client_secret: stripe_intent.client_secret,
    )

    render json: order.as_json, status: :created
  end

  def show
    order = Order.find_by(id: params[:id])
    if order.nil?
      return render json: { error: "order not found" }, status: :not_found
    end

    setting = Setting.first

    price = order.compute_pricing

    render json: {
      order: order.as_json,
      price: price,
      setting: setting
    }, status: :ok
  end

  def price_calculator
    order = Order.find_by(id: params[:id])
    if order.nil?
      return render json: { error: "order not found" }, status: :not_found
    end

    price = order.compute_pricing(params[:pickup_point] == "true")

    render json: price, status: :ok
  end

  def apply_promo_code
    order = Order.find_by(id: params[:id])
    if order.nil?
      return render json: { error: "order_not_found" }, status: :not_found
    end

    unless order.status == "pending"
      return render json: { error: "order_not_found" }, status: :not_found
    end

    promo_code_value = params[:promo_code_id]
    if promo_code_value.blank?
      return render json: { error: "promo_code_required" }, status: :bad_request
    end

    promo_code = PromoCode.find_by(code: promo_code_value, active: true)
    if promo_code.nil?
      return render json: { error: "promo_code_invalid" }, status: :not_found
    end

    if promo_code.expires_at.present? && promo_code.expires_at < Time.current
      return render json: { error: "promo_code_invalid" }, status: :unprocessable_entity
    end

    if promo_code.starts_at.present? && promo_code.starts_at > Time.current
      return render json: { error: "promo_code_invalid" }, status: :unprocessable_entity
    end

    if promo_code.usage_limit.present? && promo_code.usage_count >= promo_code.usage_limit
      return render json: { error: "promo_code_invalid" }, status: :unprocessable_entity
    end

    # Calculate the current price
    current_price = order.compute_pricing

    # Check minimum order amount if specified
    if promo_code.minimum_order_amount.present? && current_price[:items] < promo_code.minimum_order_amount
      return render json: { error: "promo_code_invalid" }, status: :unprocessable_entity
    end

    # Apply the promo code to the order
    # First, remove any existing promo code usage for this order
    # only one promo code can be applied to an order
    PromoCodeUsage.where(order_id: order.id).destroy_all

    # Create new promo code usage record
    discount_amount = calculate_discount(promo_code, current_price[:total])
    PromoCodeUsage.create!(
      promo_code_id: promo_code.id,
      order_id: order.id,
      discount_amount: discount_amount
    )

    # Calculate new pricing with promo code
    price = order.compute_pricing

    render json: {
      order: order.as_json,
      price: price,
    }, status: :ok
  end

  def remove_promo_code
    order = Order.find_by(id: params[:id])
    if order.nil?
      return render json: { error: "order_not_found" }, status: :not_found
    end

    unless order.status == "pending"
      return render json: { error: "order_not_found" }, status: :not_found
    end

    # Remove any existing promo code usage for this order
    PromoCodeUsage.where(order_id: order.id).destroy_all

    # Calculate new pricing without promo code
    price = order.compute_pricing

    render json: {
      order: order.as_json,
      price: price
    }, status: :ok
  end

  def pay
    order = Order.find_by(id: params[:id])
    if order.nil?
      return render json: { error: "order_not_found" }, status: :not_found
    end

    update_attributes = {}

    # Process shipping address if provided
    if params[:address].present?
      address_params = params.require(:address).permit(
        :address_line1, :address_line2, :city, :postal_code, :country,
        :pickup_point, :pickup_point_id, :pickup_point_shop_name, :pickup_point_name
      )
      address_validator = AddressForm.new(address_params)

      unless address_validator.valid?
        return render json: { error: address_validator.errors.full_messages }, status: :bad_request
      end

      # Process address based on type
      if address_validator.pickup_point?
        shipping_address = find_or_create_pickup_point(address_validator.attributes)
        if shipping_address.nil?
          return render json: { error: "failed_create_address_from_pickup_point" }, status: :unprocessable_entity
        end
      else
        shipping_address = create_regular_address(address_validator.attributes)
      end

      if shipping_address.nil?
        return render json: { error: "address_invalid" }, status: :unprocessable_entity
      end

      update_attributes[:shipping_address_id] = shipping_address.id
    else
      return render json: { error: "shipping_address_required" }, status: :bad_request
    end

    # Process customer if provided
    if params[:customer].present?
      customer_params = params.require(:customer).permit(:email, :full_name, :phone, :referral_source)
      customer_validator = CustomerForm.new(customer_params)

      unless customer_validator.valid?
        return render json: { error: customer_validator.errors.full_messages }, status: :bad_request
      end

      customer = find_or_create_customer(customer_validator)
      if customer.nil?
        return render json: { error: "unable_create_customer" }, status: :unprocessable_entity
      end

      update_attributes[:customer_id] = customer.id
    else
      return render json: { error: "customer_required" }, status: :bad_request
    end

    begin
      # check if stock is available
      order.order_items.each do |item|
        if item.product_variant.stock < item.quantity
          return render json: { error: "product_variant_stock_not_available" }, status: :unprocessable_entity
        end
      end

      order.update!(update_attributes)
      order.update!(carrier_name: order.shipping_address.pickup_point? ? order.shipping_address.pickup_point_name : "colissimo")
      price = order.compute_pricing

      # Check if PaymentIntent is already succeeded
      payment_intent = Stripe::PaymentIntent.retrieve(order.stripe_payment_intent_id)

      if payment_intent.status != "succeeded"
        # Only update PaymentIntent if it hasn't been paid yet
        update_payment_intent = {
          amount: price[:total],
          currency: "eur",
          metadata: {
            order_id: order.id,
            order_items: order.order_items.map { |item| item.product_variant_id }.join(","),
            shipping_address_id: order.shipping_address_id,
            customer_id: order.customer_id,
            is_pickup_point: order.shipping_address.pickup_point?,
          },
          shipping: {
            address: {
              line1: order.shipping_address.address_line1,
              line2: order.shipping_address.address_line2,
              city: order.shipping_address.city,
              postal_code: order.shipping_address.postal_code,
              country: order.shipping_address.country,
            },
            name: order.customer.full_name,
            phone: order.customer.phone,
            carrier: order.shipping_address.pickup_point? ? order.shipping_address.pickup_point_name : "colissimo"
          }
        }

        if price[:discount].present?
          update_payment_intent[:metadata][:promo_code] = price[:promo_code][:code]
          update_payment_intent[:metadata][:discount_amount] = price[:discount]
        end

        Stripe::PaymentIntent.update(
          order.stripe_payment_intent_id,
          update_payment_intent
        )
      else
        # Payment already succeeded, update order status
        order.update!(status: :paid)
      end

    rescue StandardError => e
      Rails.logger.error("Failed to update payment intent: #{e.message}")
      return render json: { error: "failed_updating_attributes" }, status: :unprocessable_entity
    end

    order.promo_code_usages.each do |promo_code_usage|
      promo_code_usage.promo_code.increment_usage!
    end

    render json: order.as_json, status: :ok
  end

  private

  def calculate_discount(promo_code, amount)
    if promo_code.percentage?
      (amount * promo_code.discount_value / 100.0).to_i
    elsif promo_code.fixed_amount?
      promo_code.discount_value
    else
      0
    end
  end

  def find_or_create_pickup_point(address_params)
    existing = Address.find_by(pickup_point_id: address_params["pickup_point_id"])
    return existing if existing.present?

    begin
      res = ChronoshopService.validate_pickup_point(
        address_params["postal_code"],
        address_params["city"],
        address_params["country"],
        address_params["pickup_point_id"]
      )

      if res.nil?
        return nil
      end

      puts "chronoshop res: #{res.inspect}"

      address_params["pickup_point_name"] = "chronopost"
      address_params["pickup_point_shop_name"] = res["name"]
      address_params["pickup_point_id"] = res["identifier"]
      address_params["address_line1"] = res["address"]
      address_params["address_line2"] = ""
      address_params["city"] = res["city"]
      address_params["postal_code"] = res["zipCode"]
      address_params["country"] = res["countryCode"]
      address_params["pickup_point"] = true

      puts "address_params: #{address_params.inspect}"

      Address.create!(address_params)
    rescue StandardError => e
      Rails.logger.error("Failed to create pickup point: #{e.message}")
      nil
    end
  end

  def create_regular_address(address_params)
    begin
      Address.create!(address_params)
    rescue StandardError => e
      Rails.logger.error("Failed to create address: #{e.message}")
      nil
    end
  end

  def find_or_create_customer(customer)
    # Try to find existing customer
    existing = Customer.find_by(email: customer.email, phone: customer.phone, full_name: customer.full_name)
    return existing if existing.present?

    # Create new customer
    begin
      Customer.create!(
        email: customer.email,
        full_name: customer.full_name,
        phone: customer.phone,
        referral_source: customer.referral_source,
      )
    rescue StandardError => e
      Rails.logger.error("Failed to create customer: #{e.message}")
      nil
    end
  end
end

class AddressForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :address_line1, :string
  attribute :address_line2, :string
  attribute :city, :string
  attribute :postal_code, :string
  attribute :country, :string
  attribute :pickup_point, :boolean, default: false
  attribute :pickup_point_id, :string
  attribute :pickup_point_shop_name, :string
  attribute :pickup_point_name, :string

  validates :city, :postal_code, :country, presence: true
  validates :address_line1, presence: true, unless: :pickup_point?

  with_options if: :pickup_point? do |pickup|
    pickup.validates :pickup_point_id, presence: true
    pickup.validates :pickup_point_shop_name, presence: true
    pickup.validates :pickup_point_name, presence: true, inclusion: { in: ["chronopost"] }
  end

  def pickup_point?
    pickup_point == true
  end
end

class CustomerForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :email, :string
  attribute :full_name, :string
  attribute :phone, :string
  attribute :referral_source, :string

  validates :email, :full_name, :phone, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, format: {
    with: /\A(0|\+33)[1-9]([-. ]?[0-9]{2}){4}\z/,
    message: "must be a valid French phone number"
  }
end
