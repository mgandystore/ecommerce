class ReviewController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:update]

  def show
    @review = Review.find_by!(token: params[:token])

    if @review.validated
      render json: { error: "Cet avis a déjà été validé" }, status: :unprocessable_entity
    else
      render json: {
        order_id: @review.order_id,
        name: @review.name,
        stars: @review.stars,
        content: @review.content
      }
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Avis introuvable" }, status: :not_found
  end

  def update
    @review = Review.find_by!(token: params[:token])

    if @review.order.review && @review.order.review.validated && @review.order.review.id != @review.id
      render json: { error: "Un avis validé existe déjà pour cette commande" }, status: :unprocessable_entity
      return
    end

    if @review.update(review_params)
      # Send email to admin for validation
      OrderMailer.review_submitted(@review.id).deliver_later

      render json: {
        message: "Merci pour votre avis ! Il sera publié après validation.",
        review: {
          stars: @review.stars,
          content: @review.content
        }
      }
    else
      render json: {
        error: "Erreur lors de la soumission de l'avis",
        details: @review.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Avis introuvable" }, status: :not_found
  end

  private

  def review_params
    params.require(:review).permit(:stars, :content, :name)
  end
end
