module Dashboard
  class ReviewsController < BaseController
    def index
      @reviews = Review.order(created_at: :desc)
    end

    def new
      @review = Review.new
    end

    def create
      @review = Review.new(review_params)
      @review.validated = true  # Auto-validate reviews created by admin
      if @review.save
        flash[:success] = "Avis créé avec succès"
        redirect_to dashboard_reviews_path
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
      @review = Review.find(params[:id])
    end

    def update
      @review = Review.find(params[:id])
      if @review.update(review_params)
        flash[:success] = "Avis mis à jour avec succès"
        redirect_to dashboard_reviews_path
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @review = Review.find(params[:id])
      @review.destroy
      flash[:success] = "Avis supprimé avec succès"
      redirect_to dashboard_reviews_path
    end

    def validate_review
      @review = Review.find(params[:id])
      @review.update(validated: true)
      flash[:success] = "Avis validé avec succès"
      redirect_to dashboard_reviews_path
    end

    private

    def review_params
      params.require(:review).permit(:name, :content, :stars)
    end
  end
end
