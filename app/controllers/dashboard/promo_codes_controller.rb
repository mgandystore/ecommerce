module Dashboard
  class PromoCodesController < BaseController
    before_action :set_promo_code, only: [:show, :edit, :update, :destroy]

    def index
      @promo_codes = promo_codes_scope
                       .order(created_at: :desc)

      @total_promo_codes = PromoCode.count
      @active_promo_codes = PromoCode.where(active: true).count

      # Find the most used promo code
      most_used = PromoCode
                    .order(usage_count: :desc)
                    .limit(1)
                    .first

      @most_used_code = most_used ? {
        code: most_used.code,
        usage_count: most_used.usage_count
      } : nil

      # Calculate total discounts from promo code usages
      @total_discounts = PromoCodeUsage.sum(:discount_amount)
    end

    def show
      # Get orders that used this promo code
      @promo_code_usages = @promo_code
                             .promo_code_usages
                             .includes(:order)
                             .order(created_at: :desc)
    end

    def new
      @promo_code = PromoCode.new
    end

    def create

      @promo_code = PromoCode.new(promo_code_params)

      if @promo_code.save
        flash[:success] = "Le code promo a été créé avec succès"
        redirect_to dashboard_promo_codes_path
      else
        puts "ERRORS = " + @promo_code.errors.inspect
        render :new
      end
    end

    def edit
    end

    def update
      if @promo_code.update(promo_code_params)
        flash[:success] = "Le code promo a été mis à jour avec succès"
        redirect_to edit_dashboard_promo_code_path(@promo_code)
      else
        render :edit
      end
    end

    def destroy
      # Check if the code has been used
      if @promo_code.usage_count > 0
        flash[:error] = "Ce code promo a déjà été utilisé et ne peut pas être supprimé"
        redirect_to dashboard_promo_code_path(@promo_code)
      else
        @promo_code.destroy
        flash[:success] = "Le code promo a été supprimé avec succès"
        redirect_to dashboard_promo_codes_path
      end
    end

    def generate_random_code
      # Generate a random code with specified length
      length = params[:length].present? ? params[:length].to_i : 8
      code = SecureRandom.alphanumeric(length).upcase

      # Make sure it doesn't already exist
      while PromoCode.exists?(code: code)
        code = SecureRandom.alphanumeric(length).upcase
      end

      render json: { code: code }
    end

    private

    def set_promo_code
      @promo_code = PromoCode.find(params[:id])
    end

    def promo_code_params
      res = params.require(:promo_code).permit(
        :code,
        :description,
        :discount_type,
        :discount_value,
        :minimum_order_amount,
        :usage_limit,
        :starts_at,
        :expires_at,
        :active
      )

      if res[:discount_type] == "fixed_amount" && res[:discount_value].present?
        res[:discount_value] = res[:discount_value].to_i * 100
      end

      if res[:minimum_order_amount].present?
        res[:minimum_order_amount] = res[:minimum_order_amount].to_i * 100
      end

      res
    end

    def promo_codes_scope
      scope = PromoCode

      if params[:query].present?
        query = params[:query].strip.downcase
        scope = scope.where("LOWER(code) LIKE :query OR LOWER(description) LIKE :query", query: "%#{query}%")
      end

      if params[:status].present?
        case params[:status]
        when 'active'
          scope = scope.where(active: true)
        when 'inactive'
          scope = scope.where(active: false)
        when 'expired'
          scope = scope.where("active = ? AND expires_at < ?", true, Time.current)
        end
      end

      scope
    end
  end
end
